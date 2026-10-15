import React, { useState, useMemo } from 'react';
import { Empresa, GuiaRetencaoFonte } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Receipt,
  FileText,
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
  CreditCard,
  QrCode,
  DollarSign
} from 'lucide-react';

interface RetencoesModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
  onIntegracaoSucesso?: () => void;
}

export const RetencoesModule: React.FC<RetencoesModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'TOMADOS' | 'PRESTADOS' | 'REINF'>('TOMADOS');
  const [competencia, setCompetencia] = useState(empresa.competenciaAtiva);
  const [guiaSelecionadaId, setGuiaSelecionadaId] = useState<number | null>(null);
  const [notificacao, setNotificacao] = useState<{ tipo: 'success' | 'info'; mensagem: string } | null>(null);

  // Guias geradas a partir das notas fiscais
  const guias: GuiaRetencaoFonte[] = useMemo(() => {
    return dbService.getGuiasRetencaoFonte(empresa.id, competencia);
  }, [empresa.id, competencia]);

  const guiasTomados = useMemo(() => guias.filter(g => g.tipoOperacao === 'TOMADO'), [guias]);
  const guiasPrestados = useMemo(() => guias.filter(g => g.tipoOperacao === 'PRESTADO'), [guias]);

  const totalTomados = useMemo(() => guiasTomados.reduce((acc, g) => acc + g.valorPrincipal, 0), [guiasTomados]);
  const totalPrestados = useMemo(() => guiasPrestados.reduce((acc, g) => acc + g.valorPrincipal, 0), [guiasPrestados]);

  // Integração Contábil da Guia
  const handleIntegrarGuia = (guiaId: number) => {
    const res = dbService.integrarRetencoesContabil(empresa.id, competencia, guiaId);
    if (res.success) {
      setNotificacao({
        tipo: 'success',
        mensagem: `Retenção integrada à contabilidade! Lote nº ${res.loteId} gerado no Livro Diário.`
      });
      onIntegracaoSucesso?.();
    } else {
      setNotificacao({
        tipo: 'info',
        mensagem: 'Não foi possível integrar a retenção selecionada.'
      });
    }
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Exportar CSV
  const handleExportarCSV = () => {
    const dados = guias.map(g => ({
      CodigoReceita: g.codigoReceita,
      Descricao: g.descricaoTributo,
      Operacao: g.tipoOperacao === 'TOMADO' ? 'A Recolher (Passivo)' : 'A Compensar (Ativo)',
      BaseCalculo: g.baseCalculo,
      Aliquota: g.aliquota,
      ValorPrincipal: g.valorPrincipal,
      Vencimento: g.dataVencimento,
      Status: g.status,
      QuantidadeNotas: g.detalhesNotas?.length || 0
    }));
    exportToCSV(dados, `Retencoes_Fonte_${competencia}`);
  };

  // Impressão Oficial do DARF A4
  const handleImprimirDARF = (guia: GuiaRetencaoFonte) => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="space-y-4 text-neutral-900 font-sans max-w-xl mx-auto p-4 border border-neutral-400 bg-white shadow-sm">
        {/* Cabeçalho do DARF */}
        <div className="border-b-2 border-neutral-900 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neutral-900 text-white font-bold flex items-center justify-center text-xs tracking-tighter">
              DARF
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase">Documento de Arrecadação de Receitas Federais</h2>
              <p className="text-[10px] text-neutral-600">Ministério da Fazenda / Secretaria Especial da Receita Federal do Brasil</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-neutral-100 px-2 py-1 border border-neutral-300">
            {guia.codigoReceita}
          </span>
        </div>

        {/* Informações Principais em Grade Estilo Receita Federal */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Razão Social do Contribuinte</span>
            <span className="font-semibold">{empresa.razaoSocial}</span>
          </div>
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">CNPJ / CPF</span>
            <span className="font-mono font-bold">{empresa.cnpj}</span>
          </div>

          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Período de Apuração</span>
            <span className="font-mono font-bold">{guia.competencia}</span>
          </div>
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Número de Referência</span>
            <span className="font-mono">REF-RFB-{guia.id.toString().padStart(6, '0')}</span>
          </div>

          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Data de Vencimento</span>
            <span className="font-mono font-bold text-rose-700">{guia.dataVencimento}</span>
          </div>
          <div className="border-2 border-neutral-900 p-2 rounded bg-neutral-50 text-right">
            <span className="text-[9px] uppercase font-bold text-neutral-600 block">Valor do Principal</span>
            <span className="font-mono text-sm font-black">
              R$ {guia.valorPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Detalhamento das Notas Retidas */}
        {guia.detalhesNotas && guia.detalhesNotas.length > 0 && (
          <div className="pt-2">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Relação de Documentos Fiscais Sujeitos à Retenção
            </h4>
            <table className="w-full text-left text-[9px] border-collapse border border-neutral-300">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="py-1 px-1.5 border border-neutral-300">Nº Nota</th>
                  <th className="py-1 px-1.5 border border-neutral-300">Favorecido / Fornecedor</th>
                  <th className="py-1 px-1.5 border border-neutral-300">CNPJ</th>
                  <th className="py-1 px-1.5 text-right border border-neutral-300">Valor Nota</th>
                  <th className="py-1 px-1.5 text-right border border-neutral-300 font-bold">Retido</th>
                </tr>
              </thead>
              <tbody>
                {guia.detalhesNotas.map((n, idx) => (
                  <tr key={idx}>
                    <td className="py-0.5 px-1.5 border border-neutral-300 font-mono">#{n.numeroNota}</td>
                    <td className="py-0.5 px-1.5 border border-neutral-300">{n.participanteNome}</td>
                    <td className="py-0.5 px-1.5 border border-neutral-300 font-mono">{n.cnpjCpf}</td>
                    <td className="py-0.5 px-1.5 text-right border border-neutral-300 font-mono">R$ {n.valorNota.toFixed(2)}</td>
                    <td className="py-0.5 px-1.5 text-right border border-neutral-300 font-mono font-bold">R$ {n.valorRetido.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Código de Barras e QR Code PIX */}
        <div className="border-t-2 border-neutral-900 pt-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8px] uppercase font-bold text-neutral-500 block">Linha Digitável Oficial para Pagamento</span>
            <div className="font-mono text-xs font-bold tracking-widest bg-neutral-100 p-1.5 border border-neutral-300">
              {guia.codigoBarrasDarf || '85830000001-9 70800012026-3 10202600170-8 00000000000-0'}
            </div>
            <p className="text-[8px] text-neutral-500">
              Pagar preferencialmente via canais eletrônicos ou Internet Banking até a data de vencimento.
            </p>
          </div>
          <div className="text-center p-2 border border-neutral-300 rounded bg-neutral-50">
            <QrCode className="w-10 h-10 mx-auto text-neutral-800" />
            <span className="text-[7px] uppercase font-bold text-neutral-600 block mt-0.5">PIX DARF</span>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: `DARF Oficial - Código ${guia.codigoReceita}`,
      subtitulo: `${guia.descricaoTributo} - Comp. ${guia.competencia}`,
      conteudo: conteudoA4
    });
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Receipt size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Central de Retenções Tributárias na Fonte</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-medium">
                DIRF / EFD-Reinf / DCTFWeb
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Apuração e geração de guias de IRRF (1708), CSRF 4,65% (5952), INSS Retido (2631) e ISS com integração contábil
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 flex-shrink-0">
        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Retenções a Recolher (Serviços Tomados)</span>
          <div className="text-xl font-bold font-mono text-rose-400">
            R$ {totalTomados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">
            {guiasTomados.length} guia(s) DARF / GPS apuradas
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Retenções a Compensar (Serviços Prestados)</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            R$ {totalPrestados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">
            Crédito tributário dedutível no fechamento do IRPJ/CSLL
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
          <span className="text-[11px] text-amber-300 font-medium uppercase">Saldo Líquido Retido na Competência</span>
          <div className="text-xl font-bold font-mono text-amber-300">
            R$ {(totalTomados - totalPrestados).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-amber-400/80 block font-sans">
            Vencimento unificado dia 20 do mês subsequente
          </span>
        </div>
      </div>

      {/* Abas */}
      <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/10 mt-4 text-xs overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setAbaAtiva('TOMADOS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
            abaAtiva === 'TOMADOS' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Receipt size={14} className="text-rose-400" />
          <span>Serviços Tomados - A Recolher ({guiasTomados.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('PRESTADOS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
            abaAtiva === 'PRESTADOS' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <DollarSign size={14} className="text-emerald-400" />
          <span>Serviços Prestados - A Compensar ({guiasPrestados.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('REINF')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
            abaAtiva === 'REINF' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldCheck size={14} className="text-sky-400" />
          <span>Conferência EFD-Reinf (Eventos R-4020 / R-2010)</span>
        </button>
      </div>

      {/* Conteúdo Aba 1: SERVIÇOS TOMADOS */}
      {abaAtiva === 'TOMADOS' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {guiasTomados.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
                <Receipt size={32} className="mb-2 text-neutral-600" />
                <p className="text-xs">Nenhuma retenção sobre serviços tomados apurada para a competência {competencia}.</p>
              </div>
            ) : (
              guiasTomados.map(guia => (
                <div key={guia.id} className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                        Código {guia.codigoReceita}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{guia.descricaoTributo}</h3>
                        <p className="text-[11px] text-neutral-400">Alíquota: {guia.aliquota}% | Vencimento: {guia.dataVencimento}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleImprimirDARF(guia)}
                        className="px-3 py-1 bg-[#202020] hover:bg-[#282828] text-neutral-200 text-xs rounded border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <Printer size={13} className="text-blue-400" />
                        <span>Imprimir DARF A4</span>
                      </button>

                      <button
                        onClick={() => handleIntegrarGuia(guia.id)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded shadow flex items-center gap-1.5 transition-colors"
                      >
                        <Zap size={13} />
                        <span>Contabilizar Provisão</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-[#1c1c1c] border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Base de Cálculo dos Serviços</span>
                      <span className="font-mono font-bold text-neutral-200">
                        R$ {guia.baseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#1c1c1c] border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Valor Principal a Recolher</span>
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        R$ {guia.valorPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#1c1c1c] border border-white/5">
                      <span className="text-[10px] text-neutral-400 block uppercase">Linha Digitável / Código de Barras</span>
                      <span className="font-mono text-[11px] text-neutral-300 block truncate">
                        {guia.codigoBarrasDarf}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes das Notas Fiscais */}
                  {guia.detalhesNotas && (
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                        Notas Fiscais de Serviços Vinculadas ({guia.detalhesNotas.length}):
                      </span>
                      <div className="space-y-1">
                        {guia.detalhesNotas.map((n, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-sky-400 font-bold">NF #{n.numeroNota}</span>
                              <span className="font-sans text-neutral-300">{n.participanteNome}</span>
                              <span className="text-neutral-500 text-[10px]">({n.cnpjCpf})</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-neutral-400 font-sans text-[11px]">Total: R$ {n.valorNota.toFixed(2)}</span>
                              <span className="text-rose-400 font-bold">Retenção: R$ {n.valorRetido.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Aba 2: SERVIÇOS PRESTADOS */}
      {abaAtiva === 'PRESTADOS' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Créditos de Retenções na Fonte (Serviços Prestados)</h3>
              <p className="text-xs text-neutral-400">Valores retidos pelos clientes a serem compensados com tributos federais ou no encerramento trimestral</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Total Créditos: R$ {totalPrestados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex-1 overflow-auto space-y-3">
            {guiasPrestados.map(guia => (
              <div key={guia.id} className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                      CRÉDITO ATIVO
                    </span>
                    <span className="text-sm font-semibold text-white">{guia.descricaoTributo}</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    R$ {guia.valorPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {guia.detalhesNotas && (
                  <div className="space-y-1 pt-1">
                    {guia.detalhesNotas.map((n, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold">NFS-e #{n.numeroNota}</span>
                          <span className="font-sans text-neutral-300">{n.participanteNome}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-neutral-400 font-sans text-[11px]">Valor Faturado: R$ {n.valorNota.toFixed(2)}</span>
                          <span className="text-emerald-400 font-bold">Retido a Compensar: R$ {n.valorRetido.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo Aba 3: EFD-REINF */}
      {abaAtiva === 'REINF' && (
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Auditoria dos Eventos EFD-Reinf</h3>
              <p className="text-xs text-neutral-400">Conferência dos blocos da escrituração fiscal de retenções e outras informações fiscais</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold">
              LAYOUT 2.1.2 OFICIAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Evento R-4020 (Pagamentos a Beneficiário PJ)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-neutral-400">
                Totaliza as retenções na fonte de IRRF, CSLL, PIS e COFINS de serviços tomados de pessoas jurídicas.
              </p>
              <div className="text-sm font-bold font-mono text-purple-400 pt-1">
                {guiasTomados.length} Registros Mapeados
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Evento R-2010 (Retenção Previdenciária - Tomadores)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-neutral-400">
                Informações relativas a serviços contratados com cessão de mão de obra e retenção de 11% / 3,5% de INSS.
              </p>
              <div className="text-sm font-bold font-mono text-sky-400 pt-1">
                Conforme Instrução Normativa RFB nº 2.043/2021
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
