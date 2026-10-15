import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { FaturaHonorario, Empresa, ContaContabil } from '../../types/contabil';
import { 
  Receipt, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Plus, 
  Printer, 
  Zap, 
  Search, 
  TrendingUp, 
  Building2, 
  AlertCircle,
  Download,
  Users,
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface FaturamentoHonorariosModuleProps {
  empresa: Empresa;
  empresas: Empresa[];
  contas: ContaContabil[];
  onOpenReportPreview?: (config: {
    tipo: 'FATURA_HONORARIO';
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
  }) => void;
  onIntegracaoSucesso?: () => void;
}

export const FaturamentoHonorariosModule: React.FC<FaturamentoHonorariosModuleProps> = ({
  empresa,
  empresas,
  contas,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [faturas, setFaturas] = useState<FaturaHonorario[]>(() => {
    return dbService.getFaturasHonorarios(empresa.competenciaAtiva);
  });
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'PENDENTE' | 'PAGO' | 'ATRASADO'>('TODOS');
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [mensagem, setMensagem] = useState<string>('');

  // Baixa de Recebimento
  const [faturaParaBaixar, setFaturaParaBaixar] = useState<FaturaHonorario | null>(null);
  const [contaRecebimentoId, setContaRecebimentoId] = useState<number>(() => {
    const b = contas.find(c => c.nome.toLowerCase().includes('banco') && c.tipo === 'A');
    return b ? b.id : contas[0]?.id || 1;
  });

  // Modal Serviço Extra Avulso
  const [showExtraModal, setShowExtraModal] = useState<boolean>(false);
  const [extraEmpresaId, setExtraEmpresaId] = useState<number>(empresa.id);
  const [extraDescricao, setExtraDescricao] = useState<string>('Alteração Contratual na Junta Comercial');
  const [extraValor, setExtraValor] = useState<string>('850,00');

  const contasAnaliticas = contas.filter(c => c.tipo === 'A');

  // Geração em lote das faturas com 1 clique para a competência com motor de franquias
  const handleGerarLoteFaturas = () => {
    const res = dbService.gerarFaturamentoMensalHonorarios(empresa.competenciaAtiva);
    const atualizadas = dbService.getFaturasHonorarios(empresa.competenciaAtiva);
    setFaturas(atualizadas);
    setMensagem(`Geração em lote concluída! ${res.faturasGeradas} faturas geradas com apuração de excedentes de folha/fiscal e retenções na fonte.`);
    setTimeout(() => setMensagem(''), 6000);
  };

  // Salvar Serviço Extra
  const handleAdicionarExtra = () => {
    const val = parseFloat(extraValor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    let fatura = faturas.find(f => f.empresaId === extraEmpresaId);
    if (!fatura) {
      fatura = {
        id: Date.now(),
        empresaId: extraEmpresaId,
        competencia: empresa.competenciaAtiva,
        dataEmissao: new Date().toISOString().split('T')[0],
        dataVencimento: `${empresa.competenciaAtiva}-15`,
        valorBase: 0,
        valorHonorarioBase: 0,
        servicosExtras: [],
        valorTotal: 0,
        status: 'PENDENTE'
      };
    }

    const extras = [...(fatura.servicosExtras || []), {
      descricao: extraDescricao.trim(),
      valor: val
    }];
    const valorBase = fatura.valorHonorarioBase ?? fatura.valorBase ?? 0;
    const totalExtra = extras.reduce((acc, s) => acc + s.valor, 0);
    const excedenteFolha = fatura.valorExcedenteFolha || 0;
    const excedenteFiscal = fatura.valorExcedenteFiscal || 0;
    const bruto = valorBase + excedenteFolha + excedenteFiscal + totalExtra;

    const irrf = fatura.valorIRRFRetido || 0;
    const csrf = fatura.valorCSRFRetido || 0;
    const iss = fatura.valorISSRetido || 0;
    const liq = Math.max(0, bruto - irrf - csrf - iss);

    const faturaAtualizada: FaturaHonorario = {
      ...fatura,
      valorHonorarioBase: valorBase,
      valorBase: valorBase,
      valorServicosExtras: totalExtra,
      servicosExtras: extras,
      valorBrutoTotal: bruto,
      valorLiquidoFatura: liq,
      valorTotal: liq > 0 ? liq : bruto
    };

    dbService.saveFaturaHonorario(faturaAtualizada);
    setFaturas(dbService.getFaturasHonorarios(empresa.competenciaAtiva));
    setShowExtraModal(false);
    setMensagem(`Serviço extra adicionado com sucesso à fatura.`);
    setTimeout(() => setMensagem(''), 4000);
  };

  // Efetuar Baixa de Recebimento
  const handleConfirmarBaixa = () => {
    if (!faturaParaBaixar) return;

    const faturaAtualizada: FaturaHonorario = {
      ...faturaParaBaixar,
      status: 'PAGO',
      dataPagamento: new Date().toISOString().split('T')[0]
    };

    dbService.saveFaturaHonorario(faturaAtualizada);
    setFaturas(dbService.getFaturasHonorarios(empresa.competenciaAtiva));
    setFaturaParaBaixar(null);
    setMensagem(`Recebimento da fatura ${faturaAtualizada.numeroFatura || faturaAtualizada.id} confirmado com sucesso.`);
    setTimeout(() => setMensagem(''), 4000);
  };

  // Integração com Contabilidade
  const handleIntegrarContabilidade = () => {
    const res = dbService.gerarIntegracaoHonorariosContabil(
      empresa.id,
      empresa.competenciaAtiva
    );

    if (res.count === 0) {
      setMensagem('Não há faturas liquidadas nesta competência para integração.');
      return;
    }

    setMensagem(`Integração concluída! Lote nº ${res.lote.numero} gerado com ${res.count} partidas contábeis (Total Recebido: R$ ${res.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
    setTimeout(() => setMensagem(''), 6000);
  };

  // Imprimir Espelho de Fatura / Recibo A4
  const handleImprimirFaturaA4 = (fat: FaturaHonorario) => {
    const emp = empresas.find(e => e.id === fat.empresaId);
    if (!onOpenReportPreview) return;

    const valBase = fat.valorHonorarioBase ?? fat.valorBase ?? 0;
    const excFolha = fat.valorExcedenteFolha || 0;
    const excFiscal = fat.valorExcedenteFiscal || 0;
    const extrasTotal = (fat.servicosExtras || []).reduce((acc, s) => acc + s.valor, 0);

    const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = [];

    linhas.push({ descricao: '--- DISCRIMINAÇÃO DOS SERVIÇOS CONTÁBEIS ---', valor: 0, isHeader: true });
    linhas.push({ descricao: `Honorário Mensal Base (Contrato)`, valor: valBase });

    if (excFolha > 0) {
      linhas.push({
        descricao: `Excedente de Folha (${fat.qtdEmpregadosApurados || 0} colaboradores apurados no eSocial)`,
        valor: excFolha
      });
    }

    if (excFiscal > 0) {
      linhas.push({
        descricao: `Excedente de Escrita Fiscal (${fat.qtdNotasApuradas || 0} notas fiscais importadas)`,
        valor: excFiscal
      });
    }

    (fat.servicosExtras || []).forEach(extra => {
      linhas.push({
        descricao: `Serviço Extraordinário: ${extra.descricao}`,
        valor: extra.valor
      });
    });

    const bruto = fat.valorBrutoTotal || (valBase + excFolha + excFiscal + extrasTotal);
    linhas.push({ descricao: 'TOTAL BRUTO DOS HONORÁRIOS & SERVIÇOS', valor: bruto, isTotal: true });

    // Retenções na Fonte
    if ((fat.valorIRRFRetido || 0) > 0 || (fat.valorCSRFRetido || 0) > 0 || (fat.valorISSRetido || 0) > 0) {
      linhas.push({ descricao: '--- RETENÇÕES TRIBUTÁRIAS NA FONTE ---', valor: 0, isHeader: true });
      if ((fat.valorIRRFRetido || 0) > 0) {
        linhas.push({ descricao: '(-) Retenção na Fonte de IRRF (1,5%)', valor: -(fat.valorIRRFRetido || 0) });
      }
      if ((fat.valorCSRFRetido || 0) > 0) {
        linhas.push({ descricao: '(-) Retenção na Fonte de CSRF (4,65% PIS/COFINS/CSLL)', valor: -(fat.valorCSRFRetido || 0) });
      }
      if ((fat.valorISSRetido || 0) > 0) {
        linhas.push({ descricao: '(-) Retenção na Fonte de ISS Municipal', valor: -(fat.valorISSRetido || 0) });
      }
    }

    const liq = fat.valorLiquidoFatura || fat.valorTotal;
    linhas.push({
      descricao: '(=) VALOR LÍQUIDO A PAGAR PELO TOMADOR',
      valor: liq,
      isTotal: true
    });

    onOpenReportPreview({
      tipo: 'FATURA_HONORARIO',
      titulo: 'FATURA & DEMONSTRATIVO DE HONORÁRIOS CONTÁBEIS',
      subtitulo: `Cliente: ${emp?.razaoSocial} (CNPJ: ${emp?.cnpj}) • Fatura: ${fat.numeroFatura || fat.id} • Vencimento: ${fat.dataVencimento} • Competência: ${fat.competencia}`,
      linhas
    });
  };

  const faturasFiltradas = faturas.filter(f => {
    const emp = empresas.find(e => e.id === f.empresaId);
    const matchStatus = filtroStatus === 'TODOS' || f.status === filtroStatus;
    const matchTexto = !filtroTexto ||
      emp?.razaoSocial.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      emp?.cnpj.includes(filtroTexto) ||
      (f.numeroFatura && f.numeroFatura.toLowerCase().includes(filtroTexto.toLowerCase()));
    return matchStatus && matchTexto;
  });

  const totalFaturasGeral = faturasFiltradas.reduce((acc, f) => acc + f.valorTotal, 0);
  const totalRecebidoGeral = faturasFiltradas.filter(f => f.status === 'PAGO').reduce((acc, f) => acc + f.valorTotal, 0);
  const totalPendenteGeral = faturasFiltradas.filter(f => f.status !== 'PAGO').reduce((acc, f) => acc + f.valorTotal, 0);

  const handleExportCSV = () => {
    const data = faturasFiltradas.map(f => {
      const emp = empresas.find(e => e.id === f.empresaId);
      return {
        Fatura: f.numeroFatura || f.id,
        Cliente: emp?.razaoSocial || `Empresa ${f.empresaId}`,
        CNPJ: emp?.cnpj || '',
        Competencia: f.competencia,
        Vencimento: f.dataVencimento,
        ValorBase: f.valorHonorarioBase ?? f.valorBase ?? 0,
        ExcedenteFolha: f.valorExcedenteFolha ?? 0,
        ExcedenteFiscal: f.valorExcedenteFiscal ?? 0,
        ServicosExtras: f.valorServicosExtras ?? 0,
        ValorBruto: f.valorBrutoTotal ?? f.valorTotal,
        RetencaoIRRF: f.valorIRRFRetido ?? 0,
        RetencaoCSRF: f.valorCSRFRetido ?? 0,
        RetencaoISS: f.valorISSRetido ?? 0,
        ValorLiquido: f.valorLiquidoFatura ?? f.valorTotal,
        Status: f.status,
        DataPagamento: f.dataPagamento || ''
      };
    });
    exportToCSV(data, `Faturamento_Honorarios_${empresa.competenciaAtiva}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Faturamento em Lote, Baixas & Recibos A4</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-medium border border-purple-500/30">
                Competência: {empresa.competenciaAtiva}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Apuração automática de franquias de empregados/notas, retenções na fonte e integração contábil
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleGerarLoteFaturas}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Faturar Todas as Empresas (Lote)</span>
          </button>

          <button
            onClick={() => setShowExtraModal(true)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Lançar Serviço Extra</span>
          </button>

          <button
            onClick={handleIntegrarContabilidade}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Integrar Contabilidade</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="px-5 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagem}</span>
          </div>
          <button onClick={() => setMensagem('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#141414] border-b border-white/5">
        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Total Faturado</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-bold text-white font-mono">
              R$ {totalFaturasGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-neutral-500 font-mono">{faturasFiltradas.length} faturas</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-emerald-400/90 uppercase tracking-wider">Total Recebido / Baixado</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-bold text-emerald-400 font-mono">
              R$ {totalRecebidoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider">Total a Receber (Pendente)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-bold text-amber-400 font-mono">
              R$ {totalPendenteGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="px-5 py-2 bg-[#1a1a1a] border-b border-white/10 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-neutral-900 rounded-lg p-0.5 border border-white/10">
            {(['TODOS', 'PENDENTE', 'PAGO', 'ATRASADO'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filtroStatus === s ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {s === 'TODOS' ? 'Todas' : s}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente ou fatura..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded pl-8 pr-3 py-1 text-neutral-100 placeholder-neutral-500 text-xs outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        <div className="text-neutral-400 font-mono text-[11px]">
          Competência: <strong className="text-white">{empresa.competenciaAtiva}</strong>
        </div>
      </div>

      {/* Grade de Faturas */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[11px] z-10">
            <tr>
              <th className="py-2.5 px-3">Cliente / Empresa</th>
              <th className="py-2.5 px-3 w-24">Vencimento</th>
              <th className="py-2.5 px-3 w-28 text-right">Base</th>
              <th className="py-2.5 px-3 w-28 text-right">Exc. Folha</th>
              <th className="py-2.5 px-3 w-28 text-right">Exc. Fiscal</th>
              <th className="py-2.5 px-3 w-24 text-right">Extras</th>
              <th className="py-2.5 px-3 w-24 text-right">Retenções</th>
              <th className="py-2.5 px-3 w-28 text-right">Valor Líquido</th>
              <th className="py-2.5 px-3 w-20 text-center">Status</th>
              <th className="py-2.5 px-3 w-24 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[12px]">
            {faturasFiltradas.map((f) => {
              const emp = empresas.find(e => e.id === f.empresaId);
              const extrasTotal = (f.servicosExtras || []).reduce((acc, s) => acc + s.valor, 0);
              const valorBase = f.valorHonorarioBase ?? f.valorBase ?? 0;
              const excFolha = f.valorExcedenteFolha || 0;
              const excFiscal = f.valorExcedenteFiscal || 0;
              const totalRetencoes = (f.valorIRRFRetido || 0) + (f.valorCSRFRetido || 0) + (f.valorISSRetido || 0);

              return (
                <tr key={f.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 text-neutral-100 font-bold font-sans">
                    {emp?.razaoSocial || `Empresa ID ${f.empresaId}`}
                    <span className="block text-[10px] text-neutral-400 font-mono font-normal">
                      {f.numeroFatura || `FAT-${f.id}`} • CNPJ: {emp?.cnpj}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300 font-mono">{f.dataVencimento}</td>
                  <td className="py-2.5 px-3 text-right text-neutral-200">
                    R$ {valorBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-sky-400">
                    {excFolha > 0 ? `+ R$ ${excFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    {excFiscal > 0 ? `+ R$ ${excFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-400">
                    {extrasTotal > 0 ? `+ R$ ${extrasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-400">
                    {totalRetencoes > 0 ? `- R$ ${totalRetencoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-neutral-100 text-sm">
                    R$ {f.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.status === 'PAGO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      f.status === 'ATRASADO' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {f.status !== 'PAGO' && (
                        <button
                          onClick={() => setFaturaParaBaixar(f)}
                          className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[11px] font-medium transition"
                          title="Dar baixa no recebimento"
                        >
                          Baixar
                        </button>
                      )}

                      <button
                        onClick={() => handleImprimirFaturaA4(f)}
                        className="p-1 hover:bg-neutral-800 text-neutral-300 rounded border border-white/10 transition"
                        title="Imprimir Fatura / Recibo A4"
                      >
                        <Printer className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Baixar Fatura */}
      {faturaParaBaixar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-white">Baixa de Pagamento de Fatura</h3>
              <button onClick={() => setFaturaParaBaixar(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-900 rounded-lg space-y-1 font-mono border border-white/5">
                <div className="text-neutral-400">Valor Líquido a Liquidar:</div>
                <div className="text-xl font-bold text-emerald-400">
                  R$ {faturaParaBaixar.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Conta Bancária de Destino:</label>
                <select
                  value={contaRecebimentoId}
                  onChange={(e) => setContaRecebimentoId(Number(e.target.value))}
                  className="w-full bg-[#202020] border border-white/10 rounded px-2.5 py-2 text-neutral-200 outline-none focus:border-purple-500"
                >
                  {contasAnaliticas.map(c => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setFaturaParaBaixar(null)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarBaixa}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition shadow-sm"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Serviço Extra */}
      {showExtraModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-white">Lançamento de Serviço Extraordinário</h3>
              <button onClick={() => setShowExtraModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Cliente / Empresa:</label>
                <select
                  value={extraEmpresaId}
                  onChange={(e) => setExtraEmpresaId(Number(e.target.value))}
                  className="w-full bg-[#202020] border border-white/10 rounded px-2.5 py-2 text-neutral-200 outline-none focus:border-purple-500"
                >
                  {empresas.map(e => (
                    <option key={e.id} value={e.id}>{e.razaoSocial}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Descrição do Serviço Prestado:</label>
                <input
                  type="text"
                  value={extraDescricao}
                  onChange={(e) => setExtraDescricao(e.target.value)}
                  placeholder="Ex: Elaboração de Alteração Contratual na JUCESP"
                  className="w-full bg-[#202020] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Valor Cobrado (R$):</label>
                <input
                  type="text"
                  value={extraValor}
                  onChange={(e) => setExtraValor(e.target.value)}
                  className="w-full bg-[#202020] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-bold text-right outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowExtraModal(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarExtra}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition shadow-sm"
              >
                Salvar Serviço Extra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
