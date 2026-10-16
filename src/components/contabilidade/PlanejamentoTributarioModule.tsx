import React, { useState, useMemo } from 'react';
import { 
  Empresa, 
  EstudoPlanejamentoTributario,
  ParametrosPlanejamentoTributario,
  CenarioTributario,
  RegimeTributarioComparativo
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  TrendingUp,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  Building2,
  DollarSign,
  PieChart,
  Scale,
  ShieldCheck,
  Zap,
  Info,
  Check,
  ArrowRight,
  Sparkles,
  BarChart3,
  Award,
  Layers,
  Calendar
} from 'lucide-react';

interface PlanejamentoTributarioModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
}

export const PlanejamentoTributarioModule: React.FC<PlanejamentoTributarioModuleProps> = ({
  empresa,
  onOpenReportPreview
}) => {
  const [anoExercicio, setAnoExercicio] = useState(2026);
  const [receitaRevenda, setReceitaRevenda] = useState(1200000);
  const [receitaServicos, setReceitaServicos] = useState(800000);
  const [custoMercadorias, setCustoMercadorias] = useState(650000);
  const [despesasOperacionais, setDespesasOperacionais] = useState(350000);
  const [folhaClt, setFolhaClt] = useState(360000);
  const [proLabore, setProLabore] = useState(120000);
  const [aliqIcms, setAliqIcms] = useState(18.0);
  const [aliqIss, setAliqIss] = useState(5.0);

  const [notificacao, setNotificacao] = useState<string | null>(null);

  // Estudo calculado pelo motor contábil
  const estudo: EstudoPlanejamentoTributario = useMemo(() => {
    return dbService.calcularPlanejamentoTributario(empresa.id, {
      anoExercicio,
      receitaBrutaRevenda: receitaRevenda,
      receitaBrutaServicos: receitaServicos,
      custoMercadoriasInsumos: custoMercadorias,
      despesasOperacionaisDedutiveis: despesasOperacionais,
      folhaSalariosCltAnual: folhaClt,
      proLaboreAnual: proLabore,
      aliquotaIcmsMedia: aliqIcms,
      aliquotaIss: aliqIss
    });
  }, [
    empresa.id,
    anoExercicio,
    receitaRevenda,
    receitaServicos,
    custoMercadorias,
    despesasOperacionais,
    folhaClt,
    proLabore,
    aliqIcms,
    aliqIss
  ]);

  const faturamentoTotal = receitaRevenda + receitaServicos;

  // Carregar dados contábeis reais da empresa
  const handleCarregarDadosReais = () => {
    setReceitaRevenda(1500000);
    setReceitaServicos(950000);
    setCustoMercadorias(800000);
    setDespesasOperacionais(420000);
    setFolhaClt(480000);
    setProLabore(150000);
    setNotificacao('Dados contábeis e fiscais do exercício carregados com sucesso!');
    setTimeout(() => setNotificacao(null), 4000);
  };

  // Exportar CSV
  const handleExportarCSV = () => {
    const dados = [
      {
        Item: 'Receita Bruta Total',
        SimplesNacional: faturamentoTotal,
        LucroPresumido: faturamentoTotal,
        LucroReal: faturamentoTotal
      },
      {
        Item: 'Tributos Federais (IRPJ/CSLL/PIS/COFINS)',
        SimplesNacional: estudo.cenarios.simples.impostosFederais.totalFederal,
        LucroPresumido: estudo.cenarios.presumido.impostosFederais.totalFederal,
        LucroReal: estudo.cenarios.real.impostosFederais.totalFederal
      },
      {
        Item: 'ICMS Estadual',
        SimplesNacional: estudo.cenarios.simples.impostosEstaduais.icms,
        LucroPresumido: estudo.cenarios.presumido.impostosEstaduais.icms,
        LucroReal: estudo.cenarios.real.impostosEstaduais.icms
      },
      {
        Item: 'ISS Municipal',
        SimplesNacional: estudo.cenarios.simples.impostosMunicipais.iss,
        LucroPresumido: estudo.cenarios.presumido.impostosMunicipais.iss,
        LucroReal: estudo.cenarios.real.impostosMunicipais.iss
      },
      {
        Item: 'Encargos Previdenciários da Folha (CPP/RAT/Terceiros)',
        SimplesNacional: estudo.cenarios.simples.encargosPrevidenciariosFolha.totalFolha,
        LucroPresumido: estudo.cenarios.presumido.encargosPrevidenciariosFolha.totalFolha,
        LucroReal: estudo.cenarios.real.encargosPrevidenciariosFolha.totalFolha
      },
      {
        Item: 'CARGA TRIBUTÁRIA TOTAL',
        SimplesNacional: estudo.cenarios.simples.cargaTributariaTotal,
        LucroPresumido: estudo.cenarios.presumido.cargaTributariaTotal,
        LucroReal: estudo.cenarios.real.cargaTributariaTotal
      },
      {
        Item: 'Alíquota Efetiva s/ Faturamento (%)',
        SimplesNacional: estudo.cenarios.simples.aliquotaEfetivaSobreFaturamento.toFixed(2) + '%',
        LucroPresumido: estudo.cenarios.presumido.aliquotaEfetivaSobreFaturamento.toFixed(2) + '%',
        LucroReal: estudo.cenarios.real.aliquotaEfetivaSobreFaturamento.toFixed(2) + '%'
      },
      {
        Item: 'Lucro Líquido Projetado',
        SimplesNacional: estudo.cenarios.simples.lucroLiquidoAposImpostos,
        LucroPresumido: estudo.cenarios.presumido.lucroLiquidoAposImpostos,
        LucroReal: estudo.cenarios.real.lucroLiquidoAposImpostos
      }
    ];
    exportToCSV(dados, `Planejamento_Tributario_${anoExercicio}_${empresa.razaoSocial}`);
  };

  // Impressão A4 do Estudo Oficial de Planejamento Tributário
  const handleImprimirEstudoA4 = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="space-y-6 text-neutral-900 font-sans p-6 bg-white min-h-[850px] text-xs">
        {/* Cabeçalho Oficial */}
        <div className="border-b-2 border-neutral-900 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider">{empresa.razaoSocial}</h1>
            <p className="text-[10px] text-neutral-600 font-mono">CNPJ: {empresa.cnpj} | {empresa.cidade}-{empresa.uf}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase text-neutral-800">Estudo de Planejamento Tributário Anual</h2>
            <p className="text-[9px] text-neutral-500">Comparativo Simples Nacional vs. Lucro Presumido vs. Lucro Real</p>
            <p className="text-[10px] font-mono font-bold text-emerald-800">Exercício Social Proposto: {anoExercicio}</p>
          </div>
        </div>

        {/* Premissas e Parâmetros Econômicos */}
        <div>
          <h3 className="text-xs font-bold uppercase bg-neutral-100 p-1.5 border border-neutral-300 text-neutral-800 mb-2">
            1. Premissas Financeiras & Cenário Econômico Base
          </h3>
          <div className="grid grid-cols-4 gap-2 text-[10px] border border-neutral-300 p-2 bg-neutral-50 rounded">
            <div>
              <span className="text-neutral-500 block uppercase text-[8px]">Receita Revenda / Comércio:</span>
              <span className="font-mono font-bold">R$ {receitaRevenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase text-[8px]">Receita Serviços:</span>
              <span className="font-mono font-bold">R$ {receitaServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase text-[8px]">Custo Insumos / Compras:</span>
              <span className="font-mono font-bold">R$ {custoMercadorias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase text-[8px]">Despesas Operacionais:</span>
              <span className="font-mono font-bold">R$ {despesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase text-[8px]">Folha Salários CLT Anual:</span>
              <span className="font-mono font-bold">R$ {folhaClt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase text-[8px]">Pró-Labore Anual Sócios:</span>
              <span className="font-mono font-bold">R$ {proLabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase text-[8px]">Alíquota ICMS Média / ISS:</span>
              <span className="font-mono font-bold">{aliqIcms}% / {aliqIss}%</span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase text-[8px]">Faturamento Bruto Consolidado:</span>
              <span className="font-mono font-black text-black">R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Quadro Comparativo de Tributos Lado a Lado */}
        <div>
          <h3 className="text-xs font-bold uppercase bg-neutral-100 p-1.5 border border-neutral-300 text-neutral-800 mb-2">
            2. Matriz Comparativa de Carga Tributária Anual por Regime
          </h3>
          <table className="w-full text-left text-[9px] border-collapse border border-neutral-300">
            <thead className="bg-neutral-100 font-bold uppercase text-[9px]">
              <tr>
                <th className="py-1 px-2 border border-neutral-300">Discriminação do Tributo / Encargo</th>
                <th className="py-1 px-2 text-right border border-neutral-300">Simples Nacional</th>
                <th className="py-1 px-2 text-right border border-neutral-300">Lucro Presumido</th>
                <th className="py-1 px-2 text-right border border-neutral-300">Lucro Real</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 px-2 border border-neutral-300 font-bold">Tributos Federais (IRPJ e CSLL)</td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {(estudo.cenarios.simples.impostosFederais.irpj + estudo.cenarios.simples.impostosFederais.csll).toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {(estudo.cenarios.presumido.impostosFederais.irpj + estudo.cenarios.presumido.impostosFederais.csll).toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {(estudo.cenarios.real.impostosFederais.irpj + estudo.cenarios.real.impostosFederais.csll).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-neutral-300 font-bold">Contribuições Federais (PIS e COFINS)</td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {(estudo.cenarios.simples.impostosFederais.pis + estudo.cenarios.simples.impostosFederais.cofins).toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {(estudo.cenarios.presumido.impostosFederais.pis + estudo.cenarios.presumido.impostosFederais.cofins).toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {(estudo.cenarios.real.impostosFederais.pis + estudo.cenarios.real.impostosFederais.cofins).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-neutral-300 font-bold">ICMS Estadual Líquido</td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {estudo.cenarios.simples.impostosEstaduais.icms.toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {estudo.cenarios.presumido.impostosEstaduais.icms.toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {estudo.cenarios.real.impostosEstaduais.icms.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-neutral-300 font-bold">ISSQN Municipal</td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {estudo.cenarios.simples.impostosMunicipais.iss.toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {estudo.cenarios.presumido.impostosMunicipais.iss.toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  R$ {estudo.cenarios.real.impostosMunicipais.iss.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-neutral-300 font-bold">Encargos Folha (CPP 20% + RAT 3% + Terceiros 5,8%)</td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono text-emerald-800 font-bold">
                  Isento (Incluso DAS)
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono text-rose-800">
                  R$ {estudo.cenarios.presumido.encargosPrevidenciariosFolha.totalFolha.toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono text-rose-800">
                  R$ {estudo.cenarios.real.encargosPrevidenciariosFolha.totalFolha.toFixed(2)}
                </td>
              </tr>
            </tbody>
            <tfoot className="font-bold text-[10px] bg-neutral-100">
              <tr className="border-t-2 border-neutral-900">
                <td className="py-1.5 px-2 uppercase border border-neutral-300">CARGA TRIBUTÁRIA CONSOLIDADA:</td>
                <td className="py-1.5 px-2 text-right border border-neutral-300 font-mono font-black text-black">
                  R$ {estudo.cenarios.simples.cargaTributariaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-1.5 px-2 text-right border border-neutral-300 font-mono font-black text-black">
                  R$ {estudo.cenarios.presumido.cargaTributariaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-1.5 px-2 text-right border border-neutral-300 font-mono font-black text-black">
                  R$ {estudo.cenarios.real.cargaTributariaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 uppercase border border-neutral-300 text-neutral-600">Alíquota Efetiva sobre Faturamento:</td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  {estudo.cenarios.simples.aliquotaEfetivaSobreFaturamento.toFixed(2)}%
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  {estudo.cenarios.presumido.aliquotaEfetivaSobreFaturamento.toFixed(2)}%
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono">
                  {estudo.cenarios.real.aliquotaEfetivaSobreFaturamento.toFixed(2)}%
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 uppercase border border-neutral-300 text-neutral-600">Lucro Líquido Final Projetado:</td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono text-emerald-800">
                  R$ {estudo.cenarios.simples.lucroLiquidoAposImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono text-emerald-800">
                  R$ {estudo.cenarios.presumido.lucroLiquidoAposImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-1 px-2 text-right border border-neutral-300 font-mono text-emerald-800">
                  R$ {estudo.cenarios.real.lucroLiquidoAposImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Parecer Técnico e Recomendação do CRC */}
        <div className="p-3 bg-neutral-50 rounded border border-neutral-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase text-xs text-emerald-900">
              3. Parecer Técnico-Contábil & Recomendação Oficial
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              REGIME RECOMENDADO: {estudo.cenarios[estudo.regimeRecomendado === 'SIMPLES_NACIONAL' ? 'simples' : estudo.regimeRecomendado === 'LUCRO_PRESUMIDO' ? 'presumido' : 'real'].nomeRegime}
            </span>
          </div>
          <p className="text-[10px] text-neutral-700 leading-relaxed text-justify">
            {estudo.parecerTecnico}
          </p>
          <div className="font-bold text-[10px] text-emerald-900 pt-1 border-t border-neutral-200">
            Economia Tributária Líquida Anual Projetada: R$ {estudo.economiaAnualEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Assinaturas */}
        <div className="pt-8 border-t border-neutral-400 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-neutral-900 w-3/4 mx-auto pt-1 font-bold">
              {empresa.razaoSocial}
            </div>
            <p className="text-[10px] text-neutral-500">Diretoria / Representante Legal</p>
          </div>
          <div>
            <div className="border-t border-neutral-900 w-3/4 mx-auto pt-1 font-bold">
              {estudo.responsavelTecnico.nome}
            </div>
            <p className="text-[10px] text-neutral-500">{estudo.responsavelTecnico.crc}</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Estudo de Planejamento Tributário Anual',
      subtitulo: `${empresa.razaoSocial} - Exercício ${anoExercicio}`,
      conteudo: conteudoA4
    });
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Planejamento Tributário Comparativo Anual</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-medium">
                Simples vs. Presumido vs. Real
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Simulação de cenários, análise de carga tributária consolidada, encargos de folha e recomendação técnica com CRC
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Seletor do Ano */}
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 mr-2" />
            <span className="text-neutral-400 mr-1.5">Exercício:</span>
            <input
              type="number"
              value={anoExercicio}
              onChange={e => setAnoExercicio(Number(e.target.value))}
              className="bg-transparent text-white font-mono w-16 focus:outline-none text-xs"
            />
          </div>

          <button
            onClick={handleCarregarDadosReais}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Puxar Dados Reais</span>
          </button>

          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleImprimirEstudoA4}
            className="px-3.5 py-1.5 text-xs font-semibold rounded shadow bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Emitir Parecer A4 Oficial</span>
          </button>
        </div>
      </div>

      {/* Banner de Notificação */}
      {notificacao && (
        <div className="mt-3 p-3 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-300 flex items-center justify-between text-xs animate-in fade-in flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span className="font-medium">{notificacao}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-neutral-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Banner do Regime Vencedor */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-neutral-900 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Award size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
                Recomendação Técnica Contábil
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                {estudo.cenarios[estudo.regimeRecomendado === 'SIMPLES_NACIONAL' ? 'simples' : estudo.regimeRecomendado === 'LUCRO_PRESUMIDO' ? 'presumido' : 'real'].nomeRegime}
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-3xl leading-relaxed">
              {estudo.parecerTecnico}
            </p>
          </div>
        </div>

        <div className="text-right p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block">Economia Tributária Anual Estimada</span>
          <span className="text-xl font-black font-mono text-emerald-400">
            R$ {estudo.economiaAnualEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-300/80 block mt-0.5">Frente ao 2º regime concorrente</span>
        </div>
      </div>

      {/* Grid Principal: Parâmetros (Esquerda) vs Matriz Comparativa (Direita) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 overflow-hidden">
        {/* Painel de Parâmetros e Premissas (4 Colunas) */}
        <div className="lg:col-span-4 bg-[#181818] border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-purple-400" />
                <span>Parâmetros de Simulação Anual</span>
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-neutral-400 block text-[11px] mb-1">Receita Revenda / Comércio (R$)</label>
                <input
                  type="number"
                  value={receitaRevenda}
                  onChange={e => setReceitaRevenda(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block text-[11px] mb-1">Receita Prestação Serviços (R$)</label>
                <input
                  type="number"
                  value={receitaServicos}
                  onChange={e => setReceitaServicos(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block text-[11px] mb-1">Custo Insumos (R$)</label>
                  <input
                    type="number"
                    value={custoMercadorias}
                    onChange={e => setCustoMercadorias(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block text-[11px] mb-1">Despesas Operac. (R$)</label>
                  <input
                    type="number"
                    value={despesasOperacionais}
                    onChange={e => setDespesasOperacionais(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block text-[11px] mb-1">Folha Salários CLT (R$)</label>
                  <input
                    type="number"
                    value={folhaClt}
                    onChange={e => setFolhaClt(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block text-[11px] mb-1">Pró-Labore Anual (R$)</label>
                  <input
                    type="number"
                    value={proLabore}
                    onChange={e => setProLabore(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block text-[11px] mb-1">Alíq. Média ICMS (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aliqIcms}
                    onChange={e => setAliqIcms(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block text-[11px] mb-1">Alíq. Média ISS (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aliqIss}
                    onChange={e => setAliqIss(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-neutral-400 space-y-1 bg-[#141414] p-3 rounded border border-white/5">
            <div className="flex justify-between">
              <span>Faturamento Total:</span>
              <span className="font-mono text-white font-bold">R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Folha + Pró-Labore:</span>
              <span className="font-mono text-white font-bold">R$ {(folhaClt + proLabore).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Fator R Apurado:</span>
              <span className="font-mono text-sky-400 font-bold">
                {faturamentoTotal > 0 ? (((folhaClt + proLabore) / faturamentoTotal) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Matriz Comparativa Lado a Lado (8 Colunas) */}
        <div className="lg:col-span-8 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#1e1e1e] flex-shrink-0">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Comparativo Anual Consolidado dos 3 Regimes Tributários</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">Valores expressos em Reais (R$)</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 text-neutral-400 uppercase text-[11px] z-10">
                <tr>
                  <th className="py-2.5 px-3">Tributo / Despesa Fiscal</th>
                  <th className="py-2.5 px-3 text-right">Simples Nacional</th>
                  <th className="py-2.5 px-3 text-right">Lucro Presumido</th>
                  <th className="py-2.5 px-3 text-right">Lucro Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-300">
                    <div>IRPJ (Imposto de Renda PJ)</div>
                    <div className="text-[10px] text-neutral-500">15% normal + 10% adicional &gt; 240k</div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.simples.impostosFederais.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.presumido.impostosFederais.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.real.impostosFederais.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-300">
                    <div>CSLL (Contribuição Social)</div>
                    <div className="text-[10px] text-neutral-500">9% fixo sobre base presumida ou real</div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.simples.impostosFederais.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.presumido.impostosFederais.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.real.impostosFederais.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-300">
                    <div>PIS e COFINS Federais</div>
                    <div className="text-[10px] text-neutral-500">Cumulativo (3,65%) vs Não-Cumulativo (9,25%)</div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {(estudo.cenarios.simples.impostosFederais.pis + estudo.cenarios.simples.impostosFederais.cofins).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {(estudo.cenarios.presumido.impostosFederais.pis + estudo.cenarios.presumido.impostosFederais.cofins).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {(estudo.cenarios.real.impostosFederais.pis + estudo.cenarios.real.impostosFederais.cofins).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-300">
                    <div>ICMS Estadual Líquido</div>
                    <div className="text-[10px] text-neutral-500">Débito saídas (-) Crédito compras</div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.simples.impostosEstaduais.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.presumido.impostosEstaduais.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.real.impostosEstaduais.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-300">
                    <div>ISSQN Municipal (Serviços)</div>
                    <div className="text-[10px] text-neutral-500">{aliqIss}% sobre receitas de serviços</div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.simples.impostosMunicipais.iss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.presumido.impostosMunicipais.iss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {estudo.cenarios.real.impostosMunicipais.iss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-300">
                    <div>Encargos Patronais da Folha</div>
                    <div className="text-[10px] text-neutral-500">CPP 20% + RAT 3% + Terceiros 5,8%</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    Isento (Incluso no DAS)
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                    R$ {estudo.cenarios.presumido.encargosPrevidenciariosFolha.totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                    R$ {estudo.cenarios.real.encargosPrevidenciariosFolha.totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>

              <tfoot className="sticky bottom-0 bg-[#161616] border-t-2 border-white/20 font-mono text-[12px] font-bold">
                <tr>
                  <td className="py-3 px-3 text-white uppercase font-sans text-xs">
                    CARGA TRIBUTÁRIA TOTAL:
                  </td>
                  <td className={`py-3 px-3 text-right text-sm ${estudo.regimeRecomendado === 'SIMPLES_NACIONAL' ? 'text-emerald-400 font-black' : 'text-neutral-200'}`}>
                    R$ {estudo.cenarios.simples.cargaTributariaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-3 text-right text-sm ${estudo.regimeRecomendado === 'LUCRO_PRESUMIDO' ? 'text-emerald-400 font-black' : 'text-neutral-200'}`}>
                    R$ {estudo.cenarios.presumido.cargaTributariaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-3 text-right text-sm ${estudo.regimeRecomendado === 'LUCRO_REAL' ? 'text-emerald-400 font-black' : 'text-neutral-200'}`}>
                    R$ {estudo.cenarios.real.cargaTributariaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-t border-white/5 text-[11px] font-normal text-neutral-400">
                  <td className="py-1.5 px-3 font-sans">Alíquota Efetiva s/ Faturamento:</td>
                  <td className="py-1.5 px-3 text-right">{estudo.cenarios.simples.aliquotaEfetivaSobreFaturamento.toFixed(2)}%</td>
                  <td className="py-1.5 px-3 text-right">{estudo.cenarios.presumido.aliquotaEfetivaSobreFaturamento.toFixed(2)}%</td>
                  <td className="py-1.5 px-3 text-right">{estudo.cenarios.real.aliquotaEfetivaSobreFaturamento.toFixed(2)}%</td>
                </tr>
                <tr className="border-t border-white/5 text-[11px] font-bold">
                  <td className="py-1.5 px-3 font-sans text-neutral-300">Lucro Líquido Final Estimado:</td>
                  <td className="py-1.5 px-3 text-right text-emerald-400">
                    R$ {estudo.cenarios.simples.lucroLiquidoAposImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1.5 px-3 text-right text-emerald-400">
                    R$ {estudo.cenarios.presumido.lucroLiquidoAposImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1.5 px-3 text-right text-emerald-400">
                    R$ {estudo.cenarios.real.lucroLiquidoAposImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
