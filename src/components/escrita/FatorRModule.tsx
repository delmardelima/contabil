import React, { useState, useEffect } from 'react';
import {
  Percent,
  TrendingUp,
  Scale,
  DollarSign,
  Calculator,
  RefreshCw,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  BadgeCheck,
  ShieldCheck,
  Info
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ApuracaoFatorR,
  Empresa
} from '../../types/contabil';

interface FatorRModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo?: React.ReactNode; linhas?: any[] }) => void;
}

export const FatorRModule: React.FC<FatorRModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competencia, setCompetencia] = useState<string>('2026-08');
  const [apuracao, setApuracao] = useState<ApuracaoFatorR | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const carregarApuracao = () => {
    const res = dbService.getApuracaoFatorR(empresaAtiva.id, competencia);
    setApuracao(res);
  };

  useEffect(() => {
    carregarApuracao();
  }, [empresaAtiva.id, competencia]);

  const handleSincronizar = () => {
    const res = dbService.sincronizarFatorRContabil(empresaAtiva.id, competencia);
    setApuracao(res);
    setStatusFeedback('Valores de faturamento fiscal e folhas de salários sincronizados com sucesso!');
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleEmitirParecerA4 = () => {
    if (!apuracao || !onOpenReportPreview) return;

    const relatorioContent = (
      <div className="font-sans text-neutral-800 p-4 space-y-5">
        <div className="border-b border-neutral-300 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-900">
              Laudo Pericial de Apuração do Fator R (Simples Nacional)
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Segregação de Receitas entre Anexo III e Anexo V - Art. 18 da Lei Complementar nº 123/2006
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wider ${
              apuracao.enquadramentoAnexo === 'ANEXO_III'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              ENQUADRAMENTO: {apuracao.enquadramentoAnexo} ({apuracao.fatorRPercentual.toFixed(2)}%)
            </span>
            <p className="text-[10px] text-neutral-500 mt-1">Competência: {apuracao.competenciaAtual}</p>
          </div>
        </div>

        {/* Metadados da Empresa */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-3 rounded border border-neutral-200">
          <div>
            <p><span className="font-bold">Razão Social:</span> {empresaAtiva.razaoSocial}</p>
            <p><span className="font-bold">CNPJ:</span> {empresaAtiva.cnpj}</p>
            <p><span className="font-bold">CNAE Principal:</span> {empresaAtiva.cnaePrincipal || '6201-5/01 - Desenvolvimento de Sistemas'}</p>
          </div>
          <div>
            <p><span className="font-bold">Receita Bruta 12 Meses (RBT12):</span> R$ {apuracao.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><span className="font-bold">Folha de Salários 12 Meses (FS12):</span> R$ {apuracao.fs12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><span className="font-bold">Alíquota Efetiva Inicial:</span> {apuracao.aliquotaEfetivaAplicavel.toFixed(2)}%</p>
          </div>
        </div>

        {/* Parecer Técnico */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs space-y-2">
          <h2 className="font-bold text-neutral-800 uppercase tracking-wide">
            Fundamento Legal & Parecer Técnico Conclusivo
          </h2>
          <p className="text-neutral-700 leading-relaxed text-justify">
            Em conformidade com o disposto no § 5º-J e § 5º-M do Artigo 18 da Lei Complementar nº 123/2006, as atividades de prestação de serviços sujeitas ao Fator R serão tributadas com base nas alíquotas do <strong>Anexo III</strong> caso a razão entre a folha de salários acumulada dos últimos 12 meses (FS12) e a receita bruta acumulada dos últimos 12 meses (RBT12) seja igual ou superior a <strong>28,00% (vinte e oito por cento)</strong>.
          </p>
          <div className="p-2.5 rounded bg-white border border-neutral-300 font-mono text-center text-xs">
            Fator R = FS12 / RBT12 = R$ {apuracao.fs12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {apuracao.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = <span className="font-bold text-emerald-700 text-sm">{apuracao.fatorRPercentual.toFixed(2)}%</span>
          </div>
          <p className="text-neutral-700 text-justify">
            {apuracao.enquadramentoAnexo === 'ANEXO_III' ? (
              <span className="text-emerald-800 font-semibold">
                CONCLUSÃO: A empresa cumpriu o requisito legal do Fator R (r &ge; 28%), obtendo enquadramento legítimo no ANEXO III com alíquota inicial reduzida a partir de 6,00%, gerando uma economia tributária estimada de R$ {apuracao.economiaTributariaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na competência analisada.
              </span>
            ) : (
              <span className="text-amber-800 font-semibold">
                CONCLUSÃO: A empresa não atingiu o patamar de 28% no período acumulado, sendo tributada temporariamente pelo ANEXO V (alíquota a partir de 15,50%). Recomenda-se estudo de adequação de pró-labore para os próximos períodos.
              </span>
            )}
          </p>
        </div>

        {/* Tabela dos 12 Meses */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 border-b border-neutral-200 pb-1">
            Memória de Cálculo Analítica dos Últimos 12 Meses
          </h2>
          <table className="w-full text-[11px] border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 text-neutral-700 text-left">
                <th className="p-1.5 border border-neutral-300">Competência</th>
                <th className="p-1.5 border border-neutral-300 text-right">Receita de Serviços (R$)</th>
                <th className="p-1.5 border border-neutral-300 text-right">Folha de Salários + Encargos (R$)</th>
                <th className="p-1.5 border border-neutral-300 text-right">Fator R Pontual (%)</th>
              </tr>
            </thead>
            <tbody>
              {apuracao.historico12Meses.map((h) => {
                const percPontual = h.receitaBrutaServicosMes > 0 ? (h.folhaSalariosMes / h.receitaBrutaServicosMes) * 100 : 0;
                return (
                  <tr key={h.competencia} className="border-b border-neutral-200">
                    <td className="p-1.5 border border-neutral-200 font-mono font-bold">{h.competencia}</td>
                    <td className="p-1.5 border border-neutral-200 text-right font-mono">
                      R$ {h.receitaBrutaServicosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-1.5 border border-neutral-200 text-right font-mono">
                      R$ {h.folhaSalariosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-1.5 border border-neutral-200 text-right font-mono font-bold">
                      <span className={percPontual >= 28 ? 'text-emerald-700' : 'text-neutral-600'}>
                        {percPontual.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-400">
                <td className="p-1.5 border border-neutral-300">TOTAL ACUMULADO (12 MESES)</td>
                <td className="p-1.5 border border-neutral-300 text-right font-mono">
                  R$ {apuracao.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1.5 border border-neutral-300 text-right font-mono">
                  R$ {apuracao.fs12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1.5 border border-neutral-300 text-right font-mono text-emerald-800 text-xs">
                  {apuracao.fatorRPercentual.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Assinaturas */}
        <div className="pt-6 border-t border-neutral-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
              <p className="font-bold text-neutral-800">{empresaAtiva.razaoSocial}</p>
              <p className="text-neutral-500">Sócio Titular / Administrador</p>
            </div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
              <p className="font-bold text-neutral-800">Contabil Studio Pro</p>
              <p className="text-neutral-500">Consultoria Tributária & Planejamento - CRC/SP</p>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Parecer Técnico de Apuração do Fator R',
      subtitulo: `Competência ${apuracao.competenciaAtual} - ${empresaAtiva.razaoSocial}`,
      conteudo: relatorioContent
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-[#181818] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Percent size={24} />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              Apuração do Fator R & Segregação Simples Nacional
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                Art. 18 LC 123/2006 & Resolução CGSN 140/2018
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Cálculo dinâmico da relação Folha/Faturamento (12 meses) para enquadramento no Anexo III vs Anexo V
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#202020] border border-neutral-700 px-2.5 py-1.5 rounded text-xs">
            <span className="text-neutral-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-neutral-200 font-bold focus:outline-none cursor-pointer font-mono"
            />
          </div>

          <button
            onClick={handleSincronizar}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition shadow-sm"
          >
            <RefreshCw size={14} />
            Sincronizar c/ Folha & Fiscal
          </button>

          <button
            onClick={handleEmitirParecerA4}
            disabled={!apuracao}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition shadow-sm"
          >
            <Printer size={14} />
            Parecer Fator R A4
          </button>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3 text-xs flex items-center gap-2 bg-emerald-950/40 text-emerald-300 border-b border-emerald-800">
          <CheckCircle2 size={16} />
          {statusFeedback}
        </div>
      )}

      {apuracao && (
        <div className="p-4 space-y-4">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Fator R Acumulado</span>
                <Percent size={16} className={apuracao.fatorRPercentual >= 28 ? 'text-emerald-400' : 'text-amber-400'} />
              </div>
              <div className={`text-2xl font-bold font-mono ${apuracao.fatorRPercentual >= 28 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {apuracao.fatorRPercentual.toFixed(2)}%
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">
                Linha de corte legal: 28,00%
              </div>
            </div>

            <div className={`p-3.5 border rounded-lg ${
              apuracao.enquadramentoAnexo === 'ANEXO_III'
                ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-400'
                : 'bg-amber-950/20 border-amber-800/60 text-amber-400'
            }`}>
              <div className="flex items-center justify-between opacity-80 mb-1">
                <span className="text-[11px] font-medium">Anexo Aplicável</span>
                <Scale size={16} />
              </div>
              <div className="text-xl font-bold tracking-wide">
                {apuracao.enquadramentoAnexo === 'ANEXO_III' ? 'ANEXO III (FAVORÁVEL)' : 'ANEXO V (ONEROSO)'}
              </div>
              <div className="text-[10px] opacity-75 mt-1">
                Alíquota a partir de {apuracao.aliquotaEfetivaAplicavel.toFixed(2)}%
              </div>
            </div>

            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Receita 12 Meses (RBT12)</span>
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <div className="text-lg font-bold font-mono text-neutral-100">
                R$ {apuracao.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Faturamento bruto de serviços</div>
            </div>

            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Economia no Mês</span>
                <DollarSign size={16} className="text-emerald-400" />
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                R$ {apuracao.economiaTributariaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Comparativo Anexo III vs V</div>
            </div>
          </div>

          {/* Barra Visual do Fator R */}
          <div className="p-4 bg-[#181818] border border-neutral-800 rounded-lg space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-neutral-300">Termômetro do Fator R</span>
              <span className="font-mono text-neutral-400">
                Meta Legal: <strong className="text-neutral-200">28,00%</strong> | Atual: <strong className={apuracao.fatorRPercentual >= 28 ? 'text-emerald-400' : 'text-amber-400'}>{apuracao.fatorRPercentual.toFixed(2)}%</strong>
              </span>
            </div>
            <div className="relative w-full h-4 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  apuracao.fatorRPercentual >= 28 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (apuracao.fatorRPercentual / 50) * 100)}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
                style={{ left: `${(28 / 50) * 100}%` }}
                title="Linha de corte legal de 28%"
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500 pt-1">
              <span>0%</span>
              <span className="text-neutral-300 font-bold">28% (Linha de Corte)</span>
              <span>50%+</span>
            </div>
          </div>

          {/* Tabela dos 12 Meses */}
          <div className="p-4 bg-[#181818] border border-neutral-800 rounded-lg space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Histórico Mensal dos Últimos 12 Meses (RBT12 e FS12)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                    <th className="p-2.5">Competência</th>
                    <th className="p-2.5 text-right">Receita de Serviços (R$)</th>
                    <th className="p-2.5 text-right">Folha de Salários + Pró-Labore (R$)</th>
                    <th className="p-2.5 text-right">Fator R Pontual (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {apuracao.historico12Meses.map((h) => {
                    const pontual = h.receitaBrutaServicosMes > 0 ? (h.folhaSalariosMes / h.receitaBrutaServicosMes) * 100 : 0;
                    return (
                      <tr key={h.competencia} className="border-b border-neutral-800/60 hover:bg-neutral-800/30">
                        <td className="p-2.5 font-mono text-neutral-300">{h.competencia}</td>
                        <td className="p-2.5 text-right font-mono text-neutral-200">
                          R$ {h.receitaBrutaServicosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-mono text-neutral-200">
                          R$ {h.folhaSalariosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          <span className={pontual >= 28 ? 'text-emerald-400' : 'text-neutral-400'}>
                            {pontual.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#202020] font-bold text-neutral-100">
                    <td className="p-2.5">TOTAL ACUMULADO (12M)</td>
                    <td className="p-2.5 text-right font-mono text-blue-400">
                      R$ {apuracao.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-mono text-emerald-400">
                      R$ {apuracao.fs12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-mono text-emerald-400 text-sm">
                      {apuracao.fatorRPercentual.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
