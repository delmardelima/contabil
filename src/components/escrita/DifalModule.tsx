import React, { useState, useMemo } from 'react';
import { Empresa, ResumoDifalCompetencia, ItemDifalApuracao } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Calculator,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Search,
  Zap,
  Calendar,
  Layers,
  Info,
  Scale,
  QrCode,
  DollarSign,
  Receipt
} from 'lucide-react';

interface DifalModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
  onIntegracaoSucesso?: () => void;
}

export const DifalModule: React.FC<DifalModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [competencia, setCompetencia] = useState(empresa.competenciaAtiva);
  const [busca, setBusca] = useState('');
  const [notificacao, setNotificacao] = useState<{ tipo: 'success' | 'info'; mensagem: string } | null>(null);

  // Resumo apurado do DIFAL
  const resumo: ResumoDifalCompetencia = useMemo(() => {
    return dbService.getResumoDifalCompetencia(empresa.id, competencia);
  }, [empresa.id, competencia]);

  const itensFiltrados = useMemo(() => {
    return resumo.itens.filter(i => 
      i.destinatarioRemetente.toLowerCase().includes(busca.toLowerCase()) ||
      i.numeroNota.toString().includes(busca) ||
      i.cfop.includes(busca)
    );
  }, [resumo.itens, busca]);

  // Integração Contábil Direta
  const handleIntegrarContabil = () => {
    const res = dbService.integrarDifalContabil(empresa.id, competencia);
    if (res.success) {
      setNotificacao({
        tipo: 'success',
        mensagem: `DIFAL integrado com sucesso! Lote nº ${res.loteId} gerado no Livro Diário com R$ ${res.total.toFixed(2)}.`
      });
      onIntegracaoSucesso?.();
    } else {
      setNotificacao({
        tipo: 'info',
        mensagem: 'Não há valores devidos de DIFAL nesta competência.'
      });
    }
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Exportar CSV
  const handleExportarCSV = () => {
    const dados = resumo.itens.map(i => ({
      NotaFiscal: i.numeroNota,
      DataEmissao: i.dataEmissao,
      DestinatarioRemetente: i.destinatarioRemetente,
      CNPJ: i.cnpjCpf,
      Rota: `${i.ufOrigem} -> ${i.ufDestino}`,
      TipoOperacao: i.tipoOperacao,
      CFOP: i.cfop,
      ValorOperacao: i.valorOperacao,
      BaseICMS: i.baseCalculoICMS,
      AliqInterestadual: i.aliquotaInterestadual,
      AliqInterna: i.aliquotaInternaDestino,
      PercentualDifal: i.percentualDifal,
      ValorDifal: i.valorDifal,
      ValorFCP: i.valorFCP || 0,
      TotalDevido: i.valorTotalDevido
    }));
    exportToCSV(dados, `DIFAL_DeSTDA_${competencia}`);
  };

  // Impressão Oficial da Guia GNRE A4
  const handleImprimirGNRE = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="space-y-4 text-neutral-900 font-sans max-w-xl mx-auto p-4 border border-neutral-400 bg-white shadow-sm">
        {/* Cabeçalho GNRE */}
        <div className="border-b-2 border-neutral-900 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-900 text-white font-bold flex items-center justify-center text-xs tracking-tighter">
              GNRE
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase">Guia Nacional de Recolhimento de Tributos Estaduais</h2>
              <p className="text-[10px] text-neutral-600">Secretaria da Fazenda do Estado de Destino ({empresa.uf || 'SP'})</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold bg-neutral-100 px-2 py-1 border border-neutral-300">
              Cód. {resumo.codigoReceitaGNRE}
            </span>
            <p className="text-[8px] text-neutral-500 uppercase mt-0.5">ICMS DIFAL Consumidor Final / Uso / Ativo</p>
          </div>
        </div>

        {/* Informações da Guia */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Contribuinte / Razão Social</span>
            <span className="font-semibold">{empresa.razaoSocial}</span>
          </div>
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">CNPJ / Inscrição Estadual</span>
            <span className="font-mono font-bold">{empresa.cnpj} | IE: {empresa.inscricaoEstadual || 'ISENTO'}</span>
          </div>

          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Período de Referência</span>
            <span className="font-mono font-bold">{resumo.competencia}</span>
          </div>
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Data de Vencimento</span>
            <span className="font-mono font-bold text-rose-700">
              {`${competencia.substring(0, 4)}-${String(Number(competencia.substring(5, 7)) + 1).padStart(2, '0')}-20`}
            </span>
          </div>

          <div className="border border-neutral-300 p-2 rounded bg-neutral-50">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">ICMS DIFAL Apurado</span>
            <span className="font-mono font-bold">R$ {resumo.totalDifalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            {resumo.totalFCP > 0 && (
              <span className="text-[9px] text-neutral-600 block mt-0.5">
                (+) FCP Combate à Pobreza: R$ {resumo.totalFCP.toFixed(2)}
              </span>
            )}
          </div>
          <div className="border-2 border-neutral-900 p-2 rounded bg-neutral-100 text-right">
            <span className="text-[9px] uppercase font-bold text-neutral-600 block">Total Geral a Recolher</span>
            <span className="font-mono text-sm font-black text-black">
              R$ {resumo.totalGeralGuia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Resumo das Operações de Entrada */}
        <div className="pt-2">
          <h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Discriminação das Notas Fiscais Interestaduais Sujeitas ao Diferencial de Alíquota
          </h4>
          <table className="w-full text-left text-[9px] border-collapse border border-neutral-300">
            <thead className="bg-neutral-100 font-bold uppercase text-[8px]">
              <tr>
                <th className="py-1 px-1 border border-neutral-300">NF</th>
                <th className="py-1 px-1 border border-neutral-300">Emitente / Fornecedor</th>
                <th className="py-1 px-1 text-center border border-neutral-300">Origem</th>
                <th className="py-1 px-1 border border-neutral-300">CFOP</th>
                <th className="py-1 px-1.5 text-right border border-neutral-300">Valor Base</th>
                <th className="py-1 px-1 text-center border border-neutral-300">Inter. %</th>
                <th className="py-1 px-1 text-center border border-neutral-300">Dest. %</th>
                <th className="py-1 px-1.5 text-right border border-neutral-300 font-bold">DIFAL Devido</th>
              </tr>
            </thead>
            <tbody>
              {resumo.itens.map(i => (
                <tr key={i.id}>
                  <td className="py-0.5 px-1 border border-neutral-300 font-mono">#{i.numeroNota}</td>
                  <td className="py-0.5 px-1 border border-neutral-300 truncate max-w-[150px]">{i.destinatarioRemetente}</td>
                  <td className="py-0.5 px-1 text-center border border-neutral-300 font-bold">{i.ufOrigem}</td>
                  <td className="py-0.5 px-1 border border-neutral-300 font-mono">{i.cfop}</td>
                  <td className="py-0.5 px-1.5 text-right border border-neutral-300 font-mono">R$ {i.baseCalculoICMS.toFixed(2)}</td>
                  <td className="py-0.5 px-1 text-center border border-neutral-300">{i.aliquotaInterestadual}%</td>
                  <td className="py-0.5 px-1 text-center border border-neutral-300">{i.aliquotaInternaDestino}%</td>
                  <td className="py-0.5 px-1.5 text-right border border-neutral-300 font-mono font-bold">R$ {i.valorTotalDevido.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Linha Digitável e Barcode */}
        <div className="border-t-2 border-neutral-900 pt-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8px] uppercase font-bold text-neutral-500 block">Representação Numérica do Código de Barras</span>
            <div className="font-mono text-xs font-bold tracking-widest bg-neutral-100 p-1.5 border border-neutral-300">
              {resumo.linhaDigitavelGNRE || '85830000002-7 69700012026-9 10202600100-0 80000000000-0'}
            </div>
            <p className="text-[8px] text-neutral-500">
              Autenticação mecânica / Recolhimento válido em toda a rede bancária autorizada e canais de autoatendimento.
            </p>
          </div>
          <div className="text-center p-2 border border-neutral-300 rounded bg-neutral-50">
            <QrCode className="w-10 h-10 mx-auto text-neutral-800" />
            <span className="text-[7px] uppercase font-bold text-neutral-600 block mt-0.5">PIX GNRE</span>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'GNRE Oficial - ICMS Diferencial de Alíquota',
      subtitulo: `${empresa.razaoSocial} - Competência ${competencia}`,
      conteudo: conteudoA4
    });
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Scale size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Apuração do Diferencial de Alíquota (DIFAL) & DeSTDA</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                EC 87/15 / LC 190/22
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Cálculo do ICMS interestadual nas compras de Uso/Consumo, Ativo Imobilizado e saídas a consumidor final
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Seletor de Competência */}
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 mr-2" />
            <span className="text-neutral-400 mr-1.5">Comp:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none text-xs"
            />
          </div>

          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleImprimirGNRE}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Imprimir GNRE A4</span>
          </button>

          <button
            onClick={handleIntegrarContabil}
            disabled={resumo.status === 'INTEGRADO'}
            className={`px-3 py-1.5 text-xs font-semibold rounded shadow flex items-center space-x-1.5 transition-colors ${
              resumo.status === 'INTEGRADO'
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{resumo.status === 'INTEGRADO' ? 'DIFAL Integrado' : 'Integrar à Contabilidade'}</span>
          </button>
        </div>
      </div>

      {/* Banner de Notificação */}
      {notificacao && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs animate-in fade-in flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{notificacao.mensagem}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-neutral-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-shrink-0">
        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Operações Interestaduais</span>
          <div className="text-xl font-bold font-mono text-white">
            {resumo.totalOperacoes} Documentos
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">Uso, Consumo e Ativo Imobilizado</span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Base de Cálculo Total</span>
          <div className="text-xl font-bold font-mono text-sky-400">
            R$ {resumo.totalBaseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">Soma dos valores tributáveis</span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">ICMS DIFAL Apurado</span>
          <div className="text-xl font-bold font-mono text-amber-400">
            R$ {resumo.totalDifalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-mono">Alíquota Interna ({empresa.uf || 'SP'}) - Interestadual</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] text-emerald-300 font-medium uppercase">Guia GNRE / DAE a Recolher</span>
          <div className="text-xl font-bold font-mono text-emerald-300">
            R$ {resumo.totalGeralGuia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400/80 block font-sans">
            {resumo.status === 'INTEGRADO' ? '✓ Lote contabilizado no Diário' : 'Vencimento dia 20 subsequente'}
          </span>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="flex items-center justify-between mt-4 pb-2 border-b border-white/10 flex-shrink-0">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrar por fornecedor, NF ou CFOP..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="font-mono text-white font-semibold">{itensFiltrados.length}</span> partida(s) de DIFAL
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase text-[11px] z-10">
              <tr>
                <th className="py-2.5 px-3">NF / Emissão</th>
                <th className="py-2.5 px-3">Fornecedor / Emitente</th>
                <th className="py-2.5 px-3 text-center">Rota</th>
                <th className="py-2.5 px-3">Destinação / CFOP</th>
                <th className="py-2.5 px-3 text-right">Valor Operação</th>
                <th className="py-2.5 px-3 text-center">Alíq. Inter.</th>
                <th className="py-2.5 px-3 text-center">Alíq. Interna</th>
                <th className="py-2.5 px-3 text-center">DIFAL %</th>
                <th className="py-2.5 px-3 text-right font-bold text-white">Valor Devido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[12px]">
              {itensFiltrados.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3">
                    <span className="text-sky-400 font-bold block">#{item.numeroNota}</span>
                    <span className="text-[10px] text-neutral-500 font-sans">{item.dataEmissao}</span>
                  </td>
                  <td className="py-2 px-3 font-sans">
                    <div className="font-medium text-white">{item.destinatarioRemetente}</div>
                    <div className="text-[11px] text-neutral-400">{item.cnpjCpf}</div>
                  </td>
                  <td className="py-2 px-3 text-center font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">
                      {item.ufOrigem} ➔ {item.ufDestino}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-sans text-xs">
                    <span className="text-neutral-300 block">{item.tipoOperacao.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[10px] text-neutral-500">CFOP {item.cfop}</span>
                  </td>
                  <td className="py-2 px-3 text-right text-neutral-300">
                    R$ {item.valorOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-center text-neutral-400">
                    {item.aliquotaInterestadual}%
                  </td>
                  <td className="py-2 px-3 text-center text-neutral-400">
                    {item.aliquotaInternaDestino}%
                  </td>
                  <td className="py-2 px-3 text-center text-amber-400 font-bold">
                    {item.percentualDifal}%
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">
                    R$ {item.valorTotalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-[#1a1a1a] border-t-2 border-white/20 font-mono text-[12px] font-bold">
              <tr>
                <td colSpan={4} className="py-2.5 px-3 text-neutral-300 uppercase font-sans text-xs">Totais da Apuração:</td>
                <td className="py-2.5 px-3 text-right text-neutral-300">
                  R$ {resumo.totalBaseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={3}></td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-extrabold">
                  R$ {resumo.totalGeralGuia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Rodapé Informativo */}
        <div className="p-3 bg-[#161616] border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Fundamentação Legal:</strong> Emenda Constitucional nº 87/2015, Lei Complementar nº 190/2022 e Ajuste SINIEF 12/2015 (DeSTDA).
            </span>
          </div>
          <span className="font-mono text-neutral-500">Regra: Alíquota Interna ({empresa.uf || 'SP'}) - Alíquota Interestadual</span>
        </div>
      </div>
    </div>
  );
};
