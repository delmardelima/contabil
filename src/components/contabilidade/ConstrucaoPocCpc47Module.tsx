import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Building2,
  Percent,
  Calendar,
  Layers,
  Activity,
  Edit,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ContratoObraPoc,
  ResumoConstrucaoPoc,
  RegimeTributarioObra,
  StatusObraPoc
} from '../../types/contabil';

interface ConstrucaoPocCpc47ModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const ConstrucaoPocCpc47Module: React.FC<ConstrucaoPocCpc47ModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoConstrucaoPoc | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');
  const [abaAtiva, setAbaAtiva] = useState<'obras' | 'simulador' | 'ret'>('obras');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContratoObraPoc | null>(null);

  // Form Fields
  const [codigoEmpreendimento, setCodigoEmpreendimento] = useState('');
  const [nomeEmpreendimento, setNomeEmpreendimento] = useState('');
  const [matriculaRGI, setMatriculaRGI] = useState('');
  const [cno, setCno] = useState('');
  const [patrimonioAfetacao, setPatrimonioAfetacao] = useState(true);
  const [regimeTributario, setRegimeTributario] = useState<RegimeTributarioObra>('RET_AFETACAO_4');
  const [aliquotaRet, setAliquotaRet] = useState<number>(4.0);
  const [dataInicio, setDataInicio] = useState('2025-01-15');
  const [dataPrevisaoTermino, setDataPrevisaoTermino] = useState('2026-12-31');
  const [status, setStatus] = useState<StatusObraPoc>('EM_ANDAMENTO');
  const [custoTotalOrcado, setCustoTotalOrcado] = useState<number>(10000000);
  const [custoIncorridoAcumulado, setCustoIncorridoAcumulado] = useState<number>(5000000);
  const [valorTotalVendasContratadas, setValorTotalVendasContratadas] = useState<number>(15000000);
  const [receitaApropriadaPeriodo, setReceitaApropriadaPeriodo] = useState<number>(750000);
  const [faturamentoEmitidoAcumulado, setFaturamentoEmitidoAcumulado] = useState<number>(6500000);
  const [engenheiroResponsavelCrea, setEngenheiroResponsavelCrea] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Simulador State
  const [simOrcado, setSimOrcado] = useState<number>(20000000);
  const [simIncorrido, setSimIncorrido] = useState<number>(11000000);
  const [simVendas, setSimVendas] = useState<number>(30000000);
  const [simFaturamento, setSimFaturamento] = useState<number>(15000000);
  const [simAliqRet, setSimAliqRet] = useState<number>(4.0);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getResumoConstrucaoPoc(empresaAtiva.id);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva]);

  const handleOpenNovo = () => {
    setEditingItem(null);
    setCodigoEmpreendimento(`EMP-${Math.floor(10 + Math.random() * 90)}`);
    setNomeEmpreendimento('');
    setMatriculaRGI('');
    setCno('');
    setPatrimonioAfetacao(true);
    setRegimeTributario('RET_AFETACAO_4');
    setAliquotaRet(4.0);
    setDataInicio('2025-01-15');
    setDataPrevisaoTermino('2026-12-31');
    setStatus('EM_ANDAMENTO');
    setCustoTotalOrcado(15000000);
    setCustoIncorridoAcumulado(6000000);
    setValorTotalVendasContratadas(22000000);
    setReceitaApropriadaPeriodo(880000);
    setFaturamentoEmitidoAcumulado(7500000);
    setEngenheiroResponsavelCrea('Eng. Civil Responsável (CREA-SP)');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleOpenEditar = (item: ContratoObraPoc) => {
    setEditingItem(item);
    setCodigoEmpreendimento(item.codigoEmpreendimento);
    setNomeEmpreendimento(item.nomeEmpreendimento);
    setMatriculaRGI(item.matriculaRGI);
    setCno(item.cno);
    setPatrimonioAfetacao(item.patrimonioAfetacao);
    setRegimeTributario(item.regimeTributario);
    setAliquotaRet(item.aliquotaRet);
    setDataInicio(item.dataInicio);
    setDataPrevisaoTermino(item.dataPrevisaoTermino);
    setStatus(item.status);
    setCustoTotalOrcado(item.custoTotalOrcado);
    setCustoIncorridoAcumulado(item.custoIncorridoAcumulado);
    setValorTotalVendasContratadas(item.valorTotalVendasContratadas);
    setReceitaApropriadaPeriodo(item.receitaApropriadaPeriodo);
    setFaturamentoEmitidoAcumulado(item.faturamentoEmitidoAcumulado);
    setEngenheiroResponsavelCrea(item.engenheiroResponsavelCrea);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const poc = custoTotalOrcado > 0 ? Math.min(100, Math.round((custoIncorridoAcumulado / custoTotalOrcado) * 10000) / 100) : 0;
    const recAcum = Math.round((poc / 100) * valorTotalVendasContratadas * 100) / 100;
    const saldoAtvPass = Math.round((recAcum - faturamentoEmitidoAcumulado) * 100) / 100;
    const impostoRet = Math.round((aliquotaRet / 100) * faturamentoEmitidoAcumulado * 100) / 100;

    const item: ContratoObraPoc = {
      id: editingItem ? editingItem.id : Date.now(),
      empresaId: empresaAtiva.id,
      codigoEmpreendimento,
      nomeEmpreendimento,
      matriculaRGI,
      cno,
      patrimonioAfetacao,
      regimeTributario,
      aliquotaRet: Number(aliquotaRet),
      dataInicio,
      dataPrevisaoTermino,
      status,
      custoTotalOrcado: Number(custoTotalOrcado),
      custoIncorridoAcumulado: Number(custoIncorridoAcumulado),
      percentualEvolucaoPoc: poc,
      valorTotalVendasContratadas: Number(valorTotalVendasContratadas),
      receitaApropriadaAcumulada: recAcum,
      receitaApropriadaPeriodo: Number(receitaApropriadaPeriodo),
      faturamentoEmitidoAcumulado: Number(faturamentoEmitidoAcumulado),
      saldoAtivoPassivoContrato: saldoAtvPass,
      impostoRetApurado: impostoRet,
      integradoContabil: editingItem ? editingItem.integradoContabil : false,
      engenheiroResponsavelCrea,
      observacoes
    };

    dbService.salvarContratoObraPoc(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este contrato de incorporação?')) {
      dbService.excluirContratoObraPoc(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: number) => {
    const res = dbService.integrarReceitaPocContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const handleEmitirLaudoA4 = (item: ContratoObraPoc) => {
    if (!onOpenReportPreview || !empresaAtiva) return;

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.5;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px;">
          <h2 style="margin: 0; color: #1d4ed8; font-size: 15pt; text-transform: uppercase;">
            ${empresaAtiva.razaoSocial}
          </h2>
          <div style="font-size: 9pt; color: #555; margin-top: 4px;">
            CNPJ: ${empresaAtiva.cnpj} | CNO Principal: ${item.cno} | RGI: ${item.matriculaRGI}
          </div>
          <h3 style="margin: 12px 0 0 0; color: #111; font-size: 13pt;">
            RELATÓRIO DE MEDIÇÃO POC E APROPRIAÇÃO DE RECEITA IMOBILIÁRIA (CPC 47 / OCPC 01)
          </h3>
          <div style="font-size: 9pt; color: #2563eb; font-weight: bold; margin-top: 2px;">
            Empreendimento: ${item.nomeEmpreendimento} (${item.codigoEmpreendimento})
          </div>
        </div>

        <div style="margin-bottom: 16px; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
            <tr>
              <td style="width: 25%; font-weight: bold; color: #1e40af;">Regime Tributário:</td>
              <td style="width: 25%; font-family: monospace;">${item.regimeTributario === 'RET_AFETACAO_4' ? 'RET 4% Unificado' : item.regimeTributario}</td>
              <td style="width: 25%; font-weight: bold; color: #1e40af;">Patrimônio Afetação:</td>
              <td style="width: 25%;">${item.patrimonioAfetacao ? 'SIM (Lei 10.931/04)' : 'NÃO'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #1e40af;">Período da Obra:</td>
              <td>${new Date(item.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(item.dataPrevisaoTermino).toLocaleDateString('pt-BR')}</td>
              <td style="font-weight: bold; color: #1e40af;">Status Atual:</td>
              <td>${item.status.replace('_', ' ')}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #1e40af;">Responsável Técnico:</td>
              <td>${item.engenheiroResponsavelCrea}</td>
              <td style="font-weight: bold; color: #1e40af;">Alíquota RET:</td>
              <td style="font-weight: bold; color: #1d4ed8;">${item.aliquotaRet.toFixed(2)}%</td>
            </tr>
          </table>
        </div>

        <h4 style="color: #1d4ed8; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px;">
          1. DEMONSTRATIVO DE EVOLUÇÃO FÍSICA E FINANCEIRA (POC)
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #1d4ed8; color: white;">
              <th style="padding: 6px; border: 1px solid #1d4ed8; text-align: left;">Indicador da Incorporação</th>
              <th style="padding: 6px; border: 1px solid #1d4ed8; text-align: right;">Valor Acumulado (R$)</th>
              <th style="padding: 6px; border: 1px solid #1d4ed8; text-align: center;">% Proporcional</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px; border: 1px solid #ddd;">Custo Total Orçado da Obra (Orçamento Executivo Atualizado)</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-family: monospace;">R$ ${item.custoTotalOrcado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">100.00%</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 6px; border: 1px solid #ddd;">Custo Incorrido Acumulado até a Medição</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-family: monospace;">R$ ${item.custoIncorridoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #1d4ed8;">${item.percentualEvolucaoPoc.toFixed(2)}% (POC)</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #ddd;">Valor Total das Vendas Contratadas (Unidades Comercializadas)</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-family: monospace;">R$ ${item.valorTotalVendasContratadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">Base VGV</td>
            </tr>
            <tr style="background-color: #eff6ff; font-weight: bold;">
              <td style="padding: 6px; border: 1px solid #bfdbfe; color: #1e40af;">(=) RECEITA APROPRIADA ACUMULADA (POC % × VENDAS)</td>
              <td style="padding: 6px; border: 1px solid #bfdbfe; text-align: right; font-family: monospace; color: #1e40af;">R$ ${item.receitaApropriadaAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #bfdbfe; text-align: center; color: #1e40af;">${item.percentualEvolucaoPoc.toFixed(2)}%</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #ddd;">(-) Faturamento Emitido / Boletos Faturados Acumulados</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-family: monospace;">R$ ${item.faturamentoEmitidoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">-</td>
            </tr>
            <tr style="background-color: ${item.saldoAtivoPassivoContrato >= 0 ? '#f0fdf4' : '#fef2f2'}; font-weight: bold;">
              <td style="padding: 6px; border: 1px solid ${item.saldoAtivoPassivoContrato >= 0 ? '#86efac' : '#fca5a5'}; color: ${item.saldoAtivoPassivoContrato >= 0 ? '#166534' : '#991b1b'};">
                (=) SALDO PATRIMONIAL DO CONTRATO DE CONSTRUÇÃO
              </td>
              <td style="padding: 6px; border: 1px solid ${item.saldoAtivoPassivoContrato >= 0 ? '#86efac' : '#fca5a5'}; text-align: right; font-family: monospace; color: ${item.saldoAtivoPassivoContrato >= 0 ? '#166534' : '#991b1b'};">
                ${item.saldoAtivoPassivoContrato >= 0 ? '+' : ''} R$ ${item.saldoAtivoPassivoContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td style="padding: 6px; border: 1px solid ${item.saldoAtivoPassivoContrato >= 0 ? '#86efac' : '#fca5a5'}; text-align: center; color: ${item.saldoAtivoPassivoContrato >= 0 ? '#166534' : '#991b1b'};">
                ${item.saldoAtivoPassivoContrato >= 0 ? 'ATIVO DE CONTRATO' : 'PASSIVO DE CONTRATO'}
              </td>
            </tr>
          </tbody>
        </table>

        <h4 style="color: #1d4ed8; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px;">
          2. APURAÇÃO TRIBUTÁRIA RET 4% (REGIME ESPECIAL DE TRIBUTAÇÃO)
        </h4>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; font-size: 8.5pt; margin-bottom: 16px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 3px 0;">Base de Arrecadação (Recebimentos do Empreendimento):</td>
              <td style="text-align: right; font-weight: bold;">R$ ${item.faturamentoEmitidoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0;">Alíquota Global Unificada (Lei 10.931/04):</td>
              <td style="text-align: right; font-weight: bold;">4,00%</td>
            </tr>
            <tr style="border-top: 1px solid #cbd5e1; font-weight: bold; color: #1e40af;">
              <td style="padding: 4px 0;">Total Guia DARF RET 4% (Código 4095):</td>
              <td style="text-align: right; font-size: 9.5pt;">R$ ${item.impostoRetApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 6px;">
            * Desdobramento legal: IRPJ (1,26%), CSLL (0,66%), PIS (0,37%) e COFINS (1,71%).
          </div>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 6px; font-weight: bold; font-size: 9.5pt;">
              ${item.engenheiroResponsavelCrea}
            </div>
            <div style="font-size: 8.5pt; color: #555;">
              Engenheiro Civil Responsável Técnico da Obra
            </div>
          </div>
          <div style="width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 6px; font-weight: bold; font-size: 9.5pt;">
              Contador Responsável Técnico
            </div>
            <div style="font-size: 8.5pt; color: #555;">
              CRC/SP Oficial Ativo — ERP Contábil Studio Pro
            </div>
          </div>
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'LAUDO DE MEDIÇÃO POC E APROPRIAÇÃO DE RECEITA',
      subtitulo: `${item.nomeEmpreendimento} (${item.codigoEmpreendimento})`,
      conteudoHtml: html
    });
  };

  const itensFiltrados = (resumo?.obras || []).filter(item => {
    const matchBusca =
      item.nomeEmpreendimento.toLowerCase().includes(busca.toLowerCase()) ||
      item.codigoEmpreendimento.toLowerCase().includes(busca.toLowerCase()) ||
      item.cno.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'TODAS' || item.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  // Cálculo simulador
  const simPoc = simOrcado > 0 ? Math.min(100, Math.round((simIncorrido / simOrcado) * 10000) / 100) : 0;
  const simReceitaApropriada = Math.round((simPoc / 100) * simVendas * 100) / 100;
  const simSaldoContrato = Math.round((simReceitaApropriada - simFaturamento) * 100) / 100;
  const simImpostoRet = Math.round((simAliqRet / 100) * simFaturamento * 100) / 100;

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200">
      {/* Top Header */}
      <div className="p-4 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-700/50 text-blue-400">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-white tracking-wide">
                Contratos de Construção & Incorporação Imobiliária (CPC 47 / OCPC 01)
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/60 text-blue-300 border border-blue-700/60">
                POC & RET 4%
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Apropriação de receita pela evolução percentual física/financeira da obra, Patrimônio de Afetação e DARF unificado
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={carregarDados}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#262626] rounded transition-colors"
            title="Recarregar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenNovo}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Empreendimento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-6 gap-3 p-4 bg-[#161616] border-b border-[#242424]">
        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Custo Total Orçado</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            R$ {(resumo?.custoTotalOrcadoGeral || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Orçamento executivo</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Custo Incorrido</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-400 font-mono">
            R$ {(resumo?.custoTotalIncorridoGeral || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Executado até o momento</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Média POC Ponderada</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-cyan-400 font-mono">
            {(resumo?.mediaPocPonderada || 0).toFixed(2)}%
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Evolução física/financeira</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Receita Apropriada</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            R$ {(resumo?.totalReceitasApropriadas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Reconhecida na DRE</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Ativo de Contrato</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-purple-400 font-mono">
            R$ {(resumo?.totalAtivoContrato || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Clientes por faturar</div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">RET 4% Total</span>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-base font-bold text-rose-400 font-mono">
            R$ {(resumo?.totalTributoRet || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">DARF unificado Lei 10.931</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 px-4 border-b border-[#262626] bg-[#181818]">
        <button
          onClick={() => setAbaAtiva('obras')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'obras'
              ? 'border-blue-500 text-blue-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Obras & Medições POC
        </button>
        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-blue-500 text-blue-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Simulador de Medição e RET 4%
        </button>
        <button
          onClick={() => setAbaAtiva('ret')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'ret'
              ? 'border-blue-500 text-blue-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Regras de Afetação & Tributação RET
        </button>
      </div>

      {/* Content: Obras */}
      {abaAtiva === 'obras' && (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por empreendimento, código ou CNO..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-neutral-300 focus:outline-none focus:border-blue-500"
              >
                <option value="TODAS">Todos os Status</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="PARALISADA">Paralisada</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded border border-[#262626] bg-[#171717]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#1f1f1f] text-neutral-300 sticky top-0 border-b border-[#2a2a2a]">
                <tr>
                  <th className="p-2.5 font-semibold">Empreendimento / CNO</th>
                  <th className="p-2.5 font-semibold text-right">Custo Orçado</th>
                  <th className="p-2.5 font-semibold text-right">Custo Incorrido</th>
                  <th className="p-2.5 font-semibold text-center" style={{ width: '130px' }}>Evolução POC</th>
                  <th className="p-2.5 font-semibold text-right">Vendas VGV</th>
                  <th className="p-2.5 font-semibold text-right">Receita Apropriada</th>
                  <th className="p-2.5 font-semibold text-right">Saldo do Contrato</th>
                  <th className="p-2.5 font-semibold text-right">RET 4%</th>
                  <th className="p-2.5 font-semibold text-center">Status</th>
                  <th className="p-2.5 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-neutral-500">
                      Nenhum empreendimento imobiliário cadastrado. Clique em "Novo Empreendimento" para registrar a obra.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-[#1d1d1d] transition-colors">
                      <td className="p-2.5">
                        <div className="font-semibold text-white">{item.nomeEmpreendimento}</div>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          {item.codigoEmpreendimento} • CNO: {item.cno} • {item.matriculaRGI}
                        </div>
                        {item.patrimonioAfetacao && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-blue-950/70 text-blue-300 border border-blue-800/40 mt-1">
                            Patrimônio de Afetação
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono text-neutral-300">
                        R$ {item.custoTotalOrcado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono text-amber-400">
                        R$ {item.custoIncorridoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="font-mono font-bold text-blue-400 text-xs mb-1">
                          {item.percentualEvolucaoPoc.toFixed(2)}%
                        </div>
                        <div className="w-full bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, item.percentualEvolucaoPoc)}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono text-neutral-300">
                        R$ {item.valorTotalVendasContratadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">
                        R$ {item.receitaApropriadaAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.saldoAtivoPassivoContrato >= 0
                            ? 'bg-purple-950/80 text-purple-400 border border-purple-700/60'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-700/60'
                        }`}>
                          {item.saldoAtivoPassivoContrato >= 0 ? '+ ' : ''}
                          R$ {item.saldoAtivoPassivoContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="text-[9px] text-neutral-500 mt-0.5">
                          {item.saldoAtivoPassivoContrato >= 0 ? 'Ativo (A Faturar)' : 'Passivo (Adiant.)'}
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-rose-400">
                        R$ {item.impostoRetApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#222] border border-[#333] text-neutral-300">
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleIntegrarContabil(item.id)}
                            className="p-1 text-emerald-400 hover:bg-emerald-950/50 rounded transition-colors"
                            title="Integrar Receita POC no Diário Geral"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEmitirLaudoA4(item)}
                            className="p-1 text-blue-400 hover:bg-blue-950/50 rounded transition-colors"
                            title="Emitir Laudo de Medição A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditar(item)}
                            className="p-1 text-neutral-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Editar Empreendimento"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id)}
                            className="p-1 text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
                            title="Excluir Empreendimento"
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

      {/* Content: Simulador */}
      {abaAtiva === 'simulador' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-4 rounded-lg bg-[#181818] border border-[#262626]">
              <h2 className="text-sm font-semibold text-white mb-1 flex items-center space-x-2">
                <Percent className="w-4 h-4 text-blue-400" />
                <span>Simulador de Apuração POC e Guia RET 4%</span>
              </h2>
              <p className="text-xs text-neutral-400 mb-4">
                Calcule a taxa de avanço físico/financeiro e projete a apropriação contábil de receitas e tributação RET unificada.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Custo Total Orçado da Obra (R$):
                  </label>
                  <input
                    type="number"
                    value={simOrcado}
                    onChange={e => setSimOrcado(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Custo Incorrido Acumulado até a Medição (R$):
                  </label>
                  <input
                    type="number"
                    value={simIncorrido}
                    onChange={e => setSimIncorrido(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Total das Vendas Contratadas / VGV Vendido (R$):
                  </label>
                  <input
                    type="number"
                    value={simVendas}
                    onChange={e => setSimVendas(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Faturamento / Recebimentos Acumulados (R$):
                  </label>
                  <input
                    type="number"
                    value={simFaturamento}
                    onChange={e => setSimFaturamento(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Simulation Result */}
              <div className="p-4 rounded-lg bg-[#202020] border border-[#333]">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xs text-neutral-400">Percentual POC</div>
                    <div className="text-xl font-bold text-blue-400 font-mono mt-1">
                      {simPoc.toFixed(2)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Receita Apropriável</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                      R$ {simReceitaApropriada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Saldo do Contrato</div>
                    <div className={`text-xl font-bold font-mono mt-1 ${simSaldoContrato >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                      {simSaldoContrato >= 0 ? '+' : ''} R$ {simSaldoContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {simSaldoContrato >= 0 ? 'Ativo de Contrato' : 'Passivo de Contrato'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">DARF RET 4%</div>
                    <div className="text-xl font-bold text-rose-400 font-mono mt-1">
                      R$ {simImpostoRet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content: RET & Normas */}
      {abaAtiva === 'ret' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-4 text-xs leading-relaxed text-neutral-300">
            <div className="p-4 rounded-lg bg-[#181818] border border-[#262626]">
              <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Patrimônio de Afetação e Regime Especial de Tributação (Lei nº 10.931/2004)</span>
              </h3>
              <p className="mb-2">
                O Regime Especial de Tributação (RET) aplicável às incorporações imobiliárias exige a averbação do termo de afetação na matrícula do imóvel no Registro de Imóveis:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                <li>
                  <strong className="text-neutral-200">Segregação Patrimonial:</strong> O terreno e as acessões objeto da incorporação imobiliária mantêm-se apartados do patrimônio geral da incorporadora, respondendo unicamente pelas dívidas e encargos da própria obra.
                </li>
                <li>
                  <strong className="text-neutral-200">Alíquota Unificada de 4%:</strong> O pagamento mensal do RET é calculado à alíquota de 4,00% sobre as receitas auferidas (regime de caixa de recebimento das parcelas das unidades vendidas):
                  <ul className="list-circle pl-5 mt-1 text-neutral-400">
                    <li>IRPJ: 1,26%</li>
                    <li>CSLL: 0,66%</li>
                    <li>PIS: 0,37%</li>
                    <li>COFINS: 1,71%</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-neutral-200">Reconhecimento Contábil (CPC 47 / OCPC 01):</strong> A receita de incorporação é apropriada ao longo do tempo (over time) pela percentagem de execução (POC). O descasamento entre receita incorrida e parcelas faturadas resulta em Ativos de Contrato (se POC &gt; Faturamento) ou Passivos de Contrato (se Faturamento &gt; POC).
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                <HardHat className="w-4 h-4 text-blue-400" />
                <span>{editingItem ? 'Editar Empreendimento' : 'Novo Contrato de Incorporação (CPC 47)'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Código Empreendimento:</label>
                  <input
                    type="text"
                    required
                    value={codigoEmpreendimento}
                    onChange={e => setCodigoEmpreendimento(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">CNO (Cadastro Nacional de Obras):</label>
                  <input
                    type="text"
                    required
                    placeholder="90.123.456/0001-92"
                    value={cno}
                    onChange={e => setCno(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Nome do Empreendimento / Obra:</label>
                  <input
                    type="text"
                    required
                    value={nomeEmpreendimento}
                    onChange={e => setNomeEmpreendimento(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Matrícula no RGI:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 45.892 - 1º CRI"
                    value={matriculaRGI}
                    onChange={e => setMatriculaRGI(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Regime Tributário:</label>
                  <select
                    value={regimeTributario}
                    onChange={e => setRegimeTributario(e.target.value as RegimeTributarioObra)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="RET_AFETACAO_4">RET 4% (Afetação)</option>
                    <option value="LUCRO_PRESUMIDO_OBRA">Lucro Presumido</option>
                    <option value="LUCRO_REAL_OBRA">Lucro Real</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Alíquota RET (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={aliquotaRet}
                    onChange={e => setAliquotaRet(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Patrimônio Afetação:</label>
                  <select
                    value={patrimonioAfetacao ? 'SIM' : 'NAO'}
                    onChange={e => setPatrimonioAfetacao(e.target.value === 'SIM')}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="SIM">Sim (Lei 10.931/04)</option>
                    <option value="NAO">Não</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Custo Total Orçado (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={custoTotalOrcado}
                    onChange={e => setCustoTotalOrcado(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Custo Incorrido Acumulado (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={custoIncorridoAcumulado}
                    onChange={e => setCustoIncorridoAcumulado(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Total Vendas Contratadas (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorTotalVendasContratadas}
                    onChange={e => setValorTotalVendasContratadas(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Faturamento Emitido Acumulado (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={faturamentoEmitidoAcumulado}
                    onChange={e => setFaturamentoEmitidoAcumulado(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Receita Apropriada do Período (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={receitaApropriadaPeriodo}
                    onChange={e => setReceitaApropriadaPeriodo(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Engenheiro Responsável Técnico / CREA:</label>
                  <input
                    type="text"
                    required
                    value={engenheiroResponsavelCrea}
                    onChange={e => setEngenheiroResponsavelCrea(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Status da Obra:</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StatusObraPoc)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="PARALISADA">Paralisada</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2e2e2e] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#252525] rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                >
                  Salvar Empreendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
