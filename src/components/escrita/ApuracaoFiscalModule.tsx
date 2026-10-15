import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ApuracaoFiscal, NotaFiscal } from '../../types/contabil';
import { 
  Calculator, 
  Receipt, 
  Layers, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  FileCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

interface ApuracaoFiscalModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: {
    tipo: 'APURACAO_FISCAL' | 'GUIA_DAS' | 'LIVRO_ENTRADAS' | 'LIVRO_SAIDAS';
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
  }) => void;
  onIntegracaoSucesso?: () => void;
}

export const ApuracaoFiscalModule: React.FC<ApuracaoFiscalModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [apuracao, setApuracao] = useState<ApuracaoFiscal | null>(() => {
    return dbService.getApuracaoFiscal(empresa.id, empresa.competenciaAtiva) || null;
  });
  const [calculando, setCalculando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');

  const notas = dbService.getNotasFiscais(empresa.id);
  const [ano, mes] = empresa.competenciaAtiva.split('-');
  const notasCompetencia = notas.filter(n => n.dataEmissao.startsWith(`${ano}-${mes}`));

  const totalSaidas = notasCompetencia.filter(n => n.tipo === 'SAIDA').reduce((acc, n) => acc + n.valorTotal, 0);
  const totalServicos = notasCompetencia.filter(n => n.tipo === 'SERVICO').reduce((acc, n) => acc + n.valorTotal, 0);
  const totalEntradas = notasCompetencia.filter(n => n.tipo === 'ENTRADA').reduce((acc, n) => acc + n.valorTotal, 0);
  const faturamentoMes = totalSaidas + totalServicos;

  // Processar Apuração da Competência
  const handleCalcularApuracao = () => {
    setCalculando(true);
    setTimeout(() => {
      let imposto = 0;
      let aliq = 0;
      let det: Record<string, number> = {};

      if (empresa.regimeTributario === 'SIMPLES_NACIONAL') {
        // Tabela Simples Nacional Anexo I / III (Aproximação RBT12 R$ 1.2M)
        aliq = 0.0821; // 8.21%
        imposto = faturamentoMes * aliq;
        det = {
          'Simples Nacional - CPP (Previdência)': imposto * 0.40,
          'Simples Nacional - ICMS': imposto * 0.32,
          'Simples Nacional - PIS/PASEP': imposto * 0.06,
          'Simples Nacional - COFINS': imposto * 0.14,
          'Simples Nacional - IRPJ': imposto * 0.04,
          'Simples Nacional - CSLL': imposto * 0.04
        };
      } else {
        // Lucro Presumido
        const icmsDebito = totalSaidas * 0.18;
        const icmsCredito = totalEntradas * 0.12;
        const icmsPagar = Math.max(0, icmsDebito - icmsCredito);

        const pis = faturamentoMes * 0.0065;
        const cofins = faturamentoMes * 0.03;
        const iss = totalServicos * 0.05;
        const irpj = faturamentoMes * 0.08 * 0.15;
        const csll = faturamentoMes * 0.12 * 0.09;

        imposto = icmsPagar + pis + cofins + iss + irpj + csll;
        aliq = faturamentoMes > 0 ? imposto / faturamentoMes : 0;
        det = {
          'ICMS Próprio (Débito x Crédito)': icmsPagar,
          'PIS Cumulativo (0,65%)': pis,
          'COFINS Cumulativa (3,00%)': cofins,
          'ISSQN Municipal (5,00%)': iss,
          'IRPJ Presumido': irpj,
          'CSLL Presumida': csll
        };
      }

      const novaApuracao: ApuracaoFiscal = {
        id: Date.now(),
        empresaId: empresa.id,
        competencia: empresa.competenciaAtiva,
        regime: empresa.regimeTributario,
        receitaBruta: faturamentoMes,
        impostoDevido: imposto,
        aliquotaEfetiva: aliq,
        detalhamentoImpostos: det,
        guiaGerada: true,
        dataVencimento: `${ano}-${mes}-20`
      };

      dbService.saveApuracaoFiscal(novaApuracao);
      setApuracao(novaApuracao);
      setCalculando(false);
      setMensagem(`✅ Apuração fiscal da competência ${empresa.competenciaAtiva} concluída com sucesso!`);
    }, 400);
  };

  // 1-Click Integração Contábil Automática (Fiscal -> Contabilidade)
  const handleIntegrarContabilidade = () => {
    const { lote, lancamentosCriados, valorTotal } = dbService.gerarIntegracaoFiscalContabil(
      empresa.id,
      empresa.competenciaAtiva
    );

    if (lancamentosCriados === 0) {
      alert('Não há notas fiscais pendentes de integração nesta competência.');
      return;
    }

    setMensagem(`⚡ Integração Contábil Concluída! Lote #${lote.numeroLote} gerado com ${lancamentosCriados} partidas dobradas (Total: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
  };

  // Emissão de Guia DAS / Demonstrativo em Folha A4
  const handleImprimirGuiaA4 = () => {
    if (!apuracao || !onOpenReportPreview) return;

    const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = Object.entries(apuracao.detalhamentoImpostos || {}).map(([desc, val]) => ({
      descricao: desc,
      valor: val
    }));
    linhas.push({
      descricao: '(=) TOTAL DO DOCUMENTO DE ARRECADAÇÃO (DAS / GUIA)',
      valor: apuracao.impostoDevido || 0,
      isTotal: true
    });

    onOpenReportPreview({
      tipo: 'GUIA_DAS',
      titulo: 'DEMONSTRATIVO DE APURAÇÃO DE TRIBUTOS E ARRECADAÇÃO',
      subtitulo: `Competência: ${empresa.competenciaAtiva} • Regime: ${empresa.regimeTributario} • Vencimento: ${apuracao.dataVencimento}`,
      linhas
    });
  };

  // Emissão do Livro Registro de Saídas A4
  const handleImprimirLivroSaidas = () => {
    if (!onOpenReportPreview) return;

    const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = notasCompetencia.filter(n => n.tipo === 'SAIDA').map(n => ({
      descricao: `NF-e ${n.numero}-${n.serie || '1'} • Emissão: ${n.dataEmissao} • ${n.destinatarioOuRemetente || n.clienteFornecedorNome} (CFOP ${n.cfop})`,
      valor: n.valorTotal
    }));
    linhas.push({
      descricao: '(=) TOTAL DO LIVRO REGISTRO DE SAÍDAS DA COMPETÊNCIA',
      valor: totalSaidas,
      isTotal: true
    });

    onOpenReportPreview({
      tipo: 'LIVRO_SAIDAS',
      titulo: 'LIVRO REGISTRO DE SAÍDAS DE MERCADORIAS (MODELO P2)',
      subtitulo: `Escrituração Fiscal da Competência: ${empresa.competenciaAtiva} • ${empresa.razaoSocial}`,
      linhas
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Apuração Mensal de Impostos & Guias Fiscais</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-medium">
                {empresa.regimeTributario}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Cálculo dos tributos federais, estaduais e municipais com emissão de livros fiscais e integração contábil com 1 clique.
            </p>
          </div>
        </div>

        {/* Botão de Integração Contábil */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCalcularApuracao}
            disabled={calculando}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{calculando ? 'Processando Apuração...' : 'Calcular Apuração da Competência'}</span>
          </button>

          <button
            onClick={handleIntegrarContabilidade}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-md shadow-emerald-900/30"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Gerar Lançamentos Contábeis (Fiscal $\rightarrow$ Contabilidade)</span>
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{mensagem}</span>
          </div>
          <button onClick={() => setMensagem('')} className="text-emerald-500 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* Conteúdo da Apuração */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          {/* Card Resumo da Competência */}
          <div className="bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-100">{empresa.razaoSocial}</h3>
                <p className="text-xs text-neutral-400 font-mono">CNPJ: {empresa.cnpj} • Competência: {empresa.competenciaAtiva}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400 block">Regime Tributário</span>
                <span className="text-xs font-bold font-mono text-amber-400">{empresa.regimeTributario}</span>
              </div>
            </div>

            {/* Grid 3 Colunas: Bases de Cálculo */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-900/80 rounded-lg border border-white/5 space-y-1">
                <span className="text-[11px] text-neutral-400">Receita Bruta / Saídas</span>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3 bg-neutral-900/80 rounded-lg border border-white/5 space-y-1">
                <span className="text-[11px] text-neutral-400">Total de Entradas / Custos</span>
                <div className="text-lg font-bold font-mono text-neutral-100">
                  R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 space-y-1">
                <span className="text-[11px] text-amber-400 font-medium">Alíquota Efetiva da Competência</span>
                <div className="text-lg font-bold font-mono text-amber-300">
                  {apuracao ? ((apuracao.aliquotaEfetiva || 0) * 100).toFixed(2) : '8.21'}%
                </div>
              </div>
            </div>

            {/* Detalhamento dos Tributos Apurados */}
            {apuracao ? (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Discriminação dos Tributos Incidentes:</span>
                  <span className="text-neutral-400 font-normal">Vencimento da Guia: <strong className="text-neutral-200 font-mono">{apuracao.dataVencimento}</strong></span>
                </div>

                <div className="divide-y divide-white/5 text-xs font-mono bg-neutral-900/60 rounded-lg border border-white/5 p-3">
                  {Object.entries(apuracao.detalhamentoImpostos || {}).map(([desc, val]) => (
                    <div key={desc} className="py-2 flex items-center justify-between">
                      <span className="font-sans text-neutral-300">{desc}</span>
                      <span className="text-neutral-100 font-semibold">
                        R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}

                  <div className="py-2.5 flex items-center justify-between font-bold text-sm text-amber-400 border-t border-amber-500/30 mt-1">
                    <span className="font-sans">TOTAL GERAL DE TRIBUTOS A RECOLHER (DAS / GUIAS)</span>
                    <span className="text-base">
                      R$ {(apuracao.impostoDevido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Botões de A4 */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    onClick={handleImprimirLivroSaidas}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium flex items-center space-x-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    <span>Livro Registro de Saídas A4</span>
                  </button>

                  <button
                    onClick={handleImprimirGuiaA4}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Imprimir Demonstrativo da Guia A4</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500 space-y-2">
                <Receipt className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-xs">A apuração da competência {empresa.competenciaAtiva} ainda não foi gerada.</p>
                <button
                  onClick={handleCalcularApuracao}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium transition"
                >
                  Processar Apuração Agora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
