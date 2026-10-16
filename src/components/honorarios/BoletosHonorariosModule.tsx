import React, { useState, useMemo } from 'react';
import { Empresa, BoletoBancario, StatusBoleto } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  CreditCard,
  QrCode,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  DollarSign,
  Copy,
  Check,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

interface BoletosHonorariosModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
  onIntegracaoSucesso?: () => void;
}

export const BoletosHonorariosModule: React.FC<BoletosHonorariosModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [boletos, setBoletos] = useState<BoletoBancario[]>(() => dbService.getBoletos(empresa.id));
  const [activeTab, setActiveTab] = useState<'LISTA' | 'GERACAO' | 'PIX_MODAL'>('LISTA');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'REGISTRADO_BANCO' | 'LIQUIDADO_PAGO' | 'VENCIDO'>('TODOS');
  const [busca, setBusca] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [copiedPixId, setCopiedPixId] = useState<number | null>(null);

  // Geração de Boletos
  const [competenciaGeracao, setCompetenciaGeracao] = useState(empresa.competenciaAtiva || '2026-10');
  const [bancoSelecionado, setBancoSelecionado] = useState<'001' | '237' | '341' | '033' | '756' | '748'>('001');

  const carregarBoletos = () => {
    setBoletos(dbService.getBoletos(empresa.id));
  };

  const handleGerarBoletos = () => {
    const res = dbService.gerarBoletosParaFaturas(empresa.id, competenciaGeracao);
    carregarBoletos();
    setActiveTab('LISTA');
    if (res.gerados > 0) {
      setFeedback({ tipo: 'success', texto: `${res.gerados} boleto(s) bancário(s) gerado(s) com registro e PIX instantâneo para a competência ${competenciaGeracao}!` });
    } else {
      setFeedback({ tipo: 'error', texto: `Nenhuma nova fatura pendente localizada para emissão de boleto na competência ${competenciaGeracao}.` });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleLiquidarBoleto = (id: number) => {
    const res = dbService.baixarBoletoLiquidar(id);
    if (res.success) {
      carregarBoletos();
      setFeedback({ tipo: 'success', texto: res.message });
      onIntegracaoSucesso?.();
    } else {
      setFeedback({ tipo: 'error', texto: res.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCopiarPix = (boleto: BoletoBancario) => {
    if (boleto.pixCopiaECola) {
      navigator.clipboard.writeText(boleto.pixCopiaECola);
      setCopiedPixId(boleto.id);
      setTimeout(() => setCopiedPixId(null), 2500);
    }
  };

  const handleImprimirBoletoA4 = (boleto: BoletoBancario) => {
    if (!onOpenReportPreview) return;

    const relatorioContent = (
      <div className="font-sans text-neutral-900 space-y-6 text-xs p-2">
        {/* RECIBO DO SACADO (PARTE SUPERIOR) */}
        <div className="border border-neutral-400 p-4 rounded bg-white space-y-3">
          <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-2">
            <div className="flex items-center space-x-3">
              <span className="font-black text-lg text-neutral-900 tracking-tight">{boleto.nomeBanco}</span>
              <span className="font-mono font-bold text-base px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded">
                {boleto.codigoBanco}-9
              </span>
            </div>
            <div className="font-mono text-sm font-bold tracking-wider text-neutral-900">
              RECIBO DO SACADO
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="border p-1.5 rounded">
              <span className="text-neutral-500 block uppercase">Nosso Número:</span>
              <strong className="font-mono text-neutral-900 text-xs">{boleto.nossoNumero}</strong>
            </div>
            <div className="border p-1.5 rounded">
              <span className="text-neutral-500 block uppercase">Nº Documento:</span>
              <strong className="font-mono text-neutral-900 text-xs">{boleto.numeroDocumento}</strong>
            </div>
            <div className="border p-1.5 rounded">
              <span className="text-neutral-500 block uppercase">Data Vencimento:</span>
              <strong className="font-mono text-neutral-900 text-xs">{new Date(boleto.dataVencimento).toLocaleDateString('pt-BR')}</strong>
            </div>
            <div className="border p-1.5 rounded bg-neutral-50">
              <span className="text-neutral-500 block uppercase">Valor do Documento:</span>
              <strong className="font-mono text-neutral-900 text-sm">
                R$ {boleto.valorBoleto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="border p-2 rounded">
              <span className="text-neutral-500 block uppercase font-bold mb-0.5">Beneficiário / Cedente:</span>
              <div className="font-bold text-neutral-900">AMIL CONTABILIDADE STUDIO PRO LTDA</div>
              <div className="font-mono text-neutral-600">CNPJ: 12.345.678/0001-90 • Ag/Conta: {boleto.agencia} / {boleto.contaCorrente}</div>
            </div>
            <div className="border p-2 rounded">
              <span className="text-neutral-500 block uppercase font-bold mb-0.5">Pagador / Sacado:</span>
              <div className="font-bold text-neutral-900">{empresa.razaoSocial}</div>
              <div className="font-mono text-neutral-600">CNPJ: {empresa.cnpj}</div>
            </div>
          </div>
        </div>

        {/* CORTE TRACEJADO */}
        <div className="text-center text-[10px] text-neutral-400 font-mono tracking-widest border-t border-dashed border-neutral-400 pt-2">
          ✂ CORTE NA LINHA TRACEJADA ✂
        </div>

        {/* FICHA DE COMPENSAÇÃO (PARTE INFERIOR) */}
        <div className="border border-neutral-900 p-4 rounded bg-white space-y-4">
          {/* Topo do Boleto com Linha Digitável */}
          <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-2">
            <div className="flex items-center space-x-3">
              <span className="font-black text-xl text-neutral-900">{boleto.nomeBanco}</span>
              <span className="font-mono font-bold text-lg px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded">
                {boleto.codigoBanco}-9
              </span>
            </div>
            <div className="font-mono text-sm font-black text-neutral-900 tracking-wider">
              {boleto.linhaDigitavel}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 border border-neutral-400 p-2 rounded">
              <span className="text-[10px] text-neutral-500 uppercase block">Local de Pagamento:</span>
              <strong className="text-neutral-800 text-xs">PAGÁVEL EM QUALQUER BANCO OU CORRESPONDENTE BANCÁRIO ATÉ O VENCIMENTO.</strong>
            </div>
            <div className="border border-neutral-400 p-2 rounded bg-neutral-50">
              <span className="text-[10px] text-neutral-500 uppercase block">Vencimento:</span>
              <strong className="font-mono text-neutral-900 text-sm">
                {new Date(boleto.dataVencimento).toLocaleDateString('pt-BR')}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="border border-neutral-400 p-1.5 rounded">
              <span className="text-neutral-500 block uppercase">Data Documento:</span>
              <strong className="font-mono">{new Date(boleto.dataEmissao).toLocaleDateString('pt-BR')}</strong>
            </div>
            <div className="border border-neutral-400 p-1.5 rounded">
              <span className="text-neutral-500 block uppercase">Nº Documento:</span>
              <strong className="font-mono">{boleto.numeroDocumento}</strong>
            </div>
            <div className="border border-neutral-400 p-1.5 rounded">
              <span className="text-neutral-500 block uppercase">Espécie Doc:</span>
              <strong className="font-mono">DM (Duplicata)</strong>
            </div>
            <div className="border border-neutral-400 p-1.5 rounded">
              <span className="text-neutral-500 block uppercase">Aceite:</span>
              <strong className="font-mono">NÃO</strong>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 border border-neutral-400 p-3 rounded space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">Instruções de Responsabilidade do Beneficiário:</span>
              <ul className="list-disc pl-4 space-y-1 text-[10px] text-neutral-800 font-mono">
                {boleto.instrucoesSacado.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>

            <div className="border border-neutral-400 p-2 rounded space-y-2 bg-neutral-50/50">
              <div className="border-b pb-1">
                <span className="text-[9px] text-neutral-500 block uppercase">Agência / Código Beneficiário:</span>
                <strong className="font-mono text-xs">{boleto.agencia} / {boleto.contaCorrente}</strong>
              </div>
              <div className="border-b pb-1">
                <span className="text-[9px] text-neutral-500 block uppercase">Nosso Número:</span>
                <strong className="font-mono text-xs">{boleto.nossoNumero}</strong>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 block uppercase">Valor Cobrado:</span>
                <strong className="font-mono text-base text-neutral-900">
                  R$ {boleto.valorBoleto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>

          {/* Dados do Sacado / Pagador */}
          <div className="border border-neutral-400 p-2 rounded text-[10px] space-y-1">
            <div className="flex justify-between">
              <div>
                <span className="text-neutral-500 font-bold uppercase">Sacado / Pagador: </span>
                <strong className="text-neutral-900">{empresa.razaoSocial}</strong>
              </div>
              <div className="font-mono text-neutral-700">CNPJ: {empresa.cnpj}</div>
            </div>
            <div className="text-neutral-600 font-mono text-[9px]">
              Endereço: {empresa.logradouro || 'Av. Paulista'}, {empresa.numero || '1000'} - {empresa.bairro || 'Bela Vista'} - {empresa.cidade || 'São Paulo'}/{empresa.uf || 'SP'} • CEP: {empresa.cep || '01310-100'}
            </div>
          </div>

          {/* PIX Dinâmico + Código de Barras Febraban */}
          <div className="pt-2 flex items-center justify-between border-t border-neutral-300">
            <div className="space-y-1">
              <div className="text-[9px] font-mono text-neutral-500 uppercase">
                Autenticação Mecânica / Código de Barras FEBRABAN
              </div>
              {/* Representação Gráfica do Código de Barras */}
              <div className="font-mono text-xl tracking-widest font-black text-neutral-900 bg-neutral-100 p-2 border border-neutral-300 rounded inline-block">
                ||| | |||| | ||| |||| | ||| | |||| ||| ||| | |||| | ||| |||
              </div>
              <div className="text-[10px] font-mono text-neutral-600">
                {boleto.codigoBarras}
              </div>
            </div>

            {/* QR Code PIX */}
            <div className="p-2 border border-neutral-400 rounded bg-white text-center flex-shrink-0">
              <div className="w-20 h-20 bg-neutral-900 mx-auto flex items-center justify-center text-white font-mono text-[9px] rounded">
                [QR CODE PIX]
              </div>
              <span className="text-[9px] font-bold text-neutral-700 block mt-1">PIX Instantâneo</span>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `BOLETO BANCÁRIO • ${boleto.nomeBanco}`,
      `Fatura: ${boleto.numeroDocumento} • Vencimento: ${new Date(boleto.dataVencimento).toLocaleDateString('pt-BR')} • Valor: R$ ${boleto.valorBoleto.toFixed(2)}`,
      relatorioContent,
      'portrait'
    );
  };

  const boletosFiltrados = useMemo(() => {
    return boletos.filter(b => {
      const matchStatus = filtroStatus === 'TODOS' || b.status === filtroStatus;
      const matchBusca = !busca.trim() ||
        b.numeroDocumento.toLowerCase().includes(busca.toLowerCase()) ||
        b.nossoNumero.toLowerCase().includes(busca.toLowerCase()) ||
        b.nomeBanco.toLowerCase().includes(busca.toLowerCase());
      return matchStatus && matchBusca;
    });
  }, [boletos, filtroStatus, busca]);

  const totais = useMemo(() => {
    const totalGeral = boletos.reduce((acc, b) => acc + b.valorBoleto, 0);
    const totalPago = boletos.filter(b => b.status === 'LIQUIDADO_PAGO').reduce((acc, b) => acc + (b.valorPago || b.valorBoleto), 0);
    const totalPendente = boletos.filter(b => b.status === 'REGISTRADO_BANCO').reduce((acc, b) => acc + b.valorBoleto, 0);
    return { totalGeral, totalPago, totalPendente };
  }, [boletos]);

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-4 bg-[#181818] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-neutral-100">Boletos Bancários & Cobrança de Honorários</h1>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full font-mono border border-emerald-500/30">
                CNAB 240/400 + PIX
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Emissão de Boletos Febraban, QR Code PIX dinâmico, Impressão A4 e Liquidação Automática de Faturas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'LISTA' ? (
            <button
              onClick={() => setActiveTab('GERACAO')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gerar Boletos das Faturas</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('LISTA')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 text-xs transition"
            >
              <span>Voltar à Carteira</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`mx-4 mt-3 p-3 rounded-lg flex items-center justify-between text-xs ${
          feedback.tipo === 'success' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.tipo === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'LISTA' ? (
          <div className="space-y-4">
            {/* KPI Cards de Cobrança */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#181818] p-4 rounded-xl border border-white/10">
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Total em Carteira</span>
                <div className="text-xl font-bold font-mono text-neutral-100 mt-1">
                  R$ {totais.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">{boletos.length} boleto(s) emitido(s)</span>
              </div>

              <div className="bg-[#181818] p-4 rounded-xl border border-white/10">
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Boletos Liquidados / Pagos</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  R$ {totais.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-emerald-500/70 font-mono">Baixa conciliada</span>
              </div>

              <div className="bg-[#181818] p-4 rounded-xl border border-white/10">
                <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Boletos Pendentes de Liquidação</span>
                <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                  R$ {totais.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-blue-500/70 font-mono">Aguardando compensação</span>
              </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181818] p-3 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFiltroStatus('TODOS')}
                  className={`px-3 py-1 rounded text-xs transition ${filtroStatus === 'TODOS' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroStatus('REGISTRADO_BANCO')}
                  className={`px-3 py-1 rounded text-xs transition ${filtroStatus === 'REGISTRADO_BANCO' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  Registrados / A Vencer
                </button>
                <button
                  onClick={() => setFiltroStatus('LIQUIDADO_PAGO')}
                  className={`px-3 py-1 rounded text-xs transition ${filtroStatus === 'LIQUIDADO_PAGO' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  Liquidados
                </button>
              </div>

              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por documento, nosso número ou banco..."
                className="bg-[#202020] border border-white/10 rounded-lg px-3 py-1 text-xs text-neutral-200 placeholder-neutral-500 w-64 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tabela de Boletos */}
            <div className="bg-[#181818] rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#222222] text-neutral-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Banco</th>
                    <th className="py-2.5 px-3">Nº Documento</th>
                    <th className="py-2.5 px-3">Nosso Número</th>
                    <th className="py-2.5 px-3 text-center">Vencimento</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {boletosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500 font-sans">
                        Nenhum boleto bancário encontrado para o filtro selecionado.
                      </td>
                    </tr>
                  ) : (
                    boletosFiltrados.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition">
                        <td className="py-2.5 px-3 font-sans font-semibold text-neutral-200">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono border border-white/10">
                              {b.codigoBanco}
                            </span>
                            <span>{b.nomeBanco}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-neutral-100">{b.numeroDocumento}</td>
                        <td className="py-2.5 px-3 text-neutral-400">{b.nossoNumero}</td>
                        <td className="py-2.5 px-3 text-center text-neutral-300">
                          {new Date(b.dataVencimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-100">
                          R$ {b.valorBoleto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {b.status === 'LIQUIDADO_PAGO' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Liquidado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              <Clock className="w-3 h-3 text-blue-400" />
                              <span>Registrado / A Vencer</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <div className="flex items-center justify-end space-x-1.5">
                            {b.pixCopiaECola && (
                              <button
                                onClick={() => handleCopiarPix(b)}
                                title="Copiar Chave PIX Copia-e-Cola"
                                className="p-1 rounded hover:bg-purple-500/20 text-purple-400 transition"
                              >
                                {copiedPixId === b.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            )}

                            {b.status !== 'LIQUIDADO_PAGO' && (
                              <button
                                onClick={() => handleLiquidarBoleto(b.id)}
                                title="Liquidar / Dar Baixa no Boleto"
                                className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleImprimirBoletoA4(b)}
                              title="Imprimir Boleto A4 com Código de Barras"
                              className="p-1 rounded hover:bg-white/10 text-blue-400 transition"
                            >
                              <Printer className="w-4 h-4" />
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
        ) : (
          /* ABA 2: GERAÇÃO DE BOLETOS DAS FATURAS */
          <div className="max-w-2xl mx-auto bg-[#181818] p-6 rounded-xl border border-white/10 space-y-6 text-xs">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wide">
                Geração em Lote de Boletos Bancários
              </h2>
              <p className="text-neutral-400 text-[11px]">
                Varre todas as faturas pendentes da competência e gera boletos com registro bancário e PIX EMV
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-neutral-400 mb-1">Competência de Faturamento:</label>
                <input
                  type="text"
                  value={competenciaGeracao}
                  onChange={(e) => setCompetenciaGeracao(e.target.value)}
                  placeholder="YYYY-MM"
                  className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Banco Emissor do Boleto:</label>
                <select
                  value={bancoSelecionado}
                  onChange={(e) => setBancoSelecionado(e.target.value as any)}
                  className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="001">001 - Banco do Brasil S.A. (Carteira 17)</option>
                  <option value="341">341 - Banco Itaú Unibanco S.A. (Carteira 109)</option>
                  <option value="237">237 - Banco Bradesco S.A. (Carteira 09)</option>
                  <option value="033">033 - Banco Santander Brasil (Carteira 101)</option>
                  <option value="756">756 - Banco Cooperativo Sicoob (Carteira 1/01)</option>
                  <option value="748">748 - Banco Cooperativo Sicredi (Carteira 1)</option>
                </select>
              </div>

              <div className="p-3 bg-black/20 border border-white/5 rounded-lg space-y-1.5 text-neutral-400 text-[11px]">
                <div className="font-bold text-neutral-200 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Padronização Febraban & BCB:</span>
                </div>
                <p>• Linha digitável com dígitos verificadores nos 3 blocos pelo módulo 10;</p>
                <p>• Código de barras padrão Interleaved 2 of 5 com dígito geral módulo 11;</p>
                <p>• QR Code PIX compatível com regulamento EMV QRCPS do Banco Central.</p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('LISTA')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGerarBoletos}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Emitir Boletos em Lote</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
