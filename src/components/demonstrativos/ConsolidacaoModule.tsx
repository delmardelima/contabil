import React, { useState, useMemo } from 'react';
import {
  Empresa,
  BalanceteConsolidadoLinha,
  DREConsolidadaLinha
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Building2,
  Layers,
  Scale,
  PieChart,
  Printer,
  FileSpreadsheet,
  Filter,
  Search,
  CheckCircle2,
  ShieldCheck,
  Landmark,
  Share2,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

interface ConsolidacaoModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
}

export const ConsolidacaoModule: React.FC<ConsolidacaoModuleProps> = ({
  empresa,
  onOpenReportPreview
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'BALANCETE' | 'DRE' | 'ELIMINACOES'>('BALANCETE');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [apenasAnaliticas, setApenasAnaliticas] = useState<boolean>(false);

  // Dados Gerados pelo Motor CPC 36
  const balanceteConsolidado = useMemo(() => {
    return dbService.gerarBalanceteConsolidado(empresa.id);
  }, [empresa.id]);

  const dreConsolidada = useMemo(() => {
    return dbService.gerarDREConsolidada(empresa.id);
  }, [empresa.id]);

  // Totalizadores do Balancete
  const { totalMatriz, totalFiliais, totalEliminacoes, totalConsolidado } = useMemo(() => {
    const analiticas = balanceteConsolidado.filter(b => b.tipo === 'A');
    let m = 0, f = 0, e = 0, c = 0;
    for (const item of analiticas) {
      if (item.classificacao.startsWith('1')) { // Ativo
        m += item.saldoMatriz;
        f += item.saldoFiliais;
        e += item.eliminacoes;
        c += item.saldoConsolidado;
      }
    }
    return { totalMatriz: m, totalFiliais: f, totalEliminacoes: e, totalConsolidado: c };
  }, [balanceteConsolidado]);

  // Itens Filtrados do Balancete
  const balanceteFiltrado = useMemo(() => {
    return balanceteConsolidado.filter(item => {
      if (apenasAnaliticas && item.tipo !== 'A') return false;
      if (!buscaTexto) return true;
      const t = buscaTexto.toLowerCase();
      return item.nome.toLowerCase().includes(t) || item.classificacao.includes(t);
    });
  }, [balanceteConsolidado, apenasAnaliticas, buscaTexto]);

  // Imprimir Demonstrações Consolidadas A4
  const handleImprimirConsolidadoA4 = () => {
    if (!onOpenReportPreview) return;

    const conteudoRelatorio = (
      <div className="font-sans text-neutral-900 space-y-5 text-xs max-w-5xl mx-auto p-4">
        <div className="border-b-2 border-neutral-900 pb-3 text-center">
          <h2 className="text-base font-bold uppercase">{empresa.razaoSocial} (GRUPO ECONÔMICO)</h2>
          <p className="text-xs text-neutral-600 font-mono">
            MATRIZ: {empresa.cnpj} • FILIAIS: FILIAL 01 SP ({empresa.cnpj.substring(0, 10)}/0002-XX)
          </p>
          <h3 className="text-xs font-bold uppercase text-neutral-800 mt-2">
            DEMONSTRAÇÕES CONTÁBEIS CONSOLIDADAS (CPC 36 R3 / NBC TG 36)
          </h3>
          <p className="text-[10px] text-neutral-500 italic">
            Com eliminação estrita de saldos e transações intercompany entre Matriz e Filiais
          </p>
        </div>

        {/* Quadro DRE Consolidada Resumida */}
        <div className="space-y-2">
          <h4 className="font-bold uppercase text-[11px] text-neutral-800 border-b border-neutral-300 pb-1">
            I. DEMONSTRAÇÃO DO RESULTADO CONSOLIDADA (DRE)
          </h4>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-900 bg-neutral-100 font-bold uppercase text-[10px]">
                <th className="py-2 px-2">Estrutura DRE</th>
                <th className="py-2 px-2 text-right">Matriz (R$)</th>
                <th className="py-2 px-2 text-right">Filial 01 (R$)</th>
                <th className="py-2 px-2 text-right">Eliminações (R$)</th>
                <th className="py-2 px-2 text-right">Consolidado (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {dreConsolidada.map((linha, idx) => (
                <tr key={idx} className={linha.isTotal ? 'font-bold bg-neutral-100' : linha.isHeader ? 'font-bold bg-neutral-50 text-neutral-800' : ''}>
                  <td className="py-1.5 px-2">{linha.descricao}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{linha.valorMatriz.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{linha.valorFiliais.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-rose-600">{linha.eliminacoesIntercompany > 0 ? `(${linha.eliminacoesIntercompany.toFixed(2)})` : '-'}</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-neutral-950">{linha.valorConsolidado.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quadro Balancete Resumido */}
        <div className="space-y-2 pt-4">
          <h4 className="font-bold uppercase text-[11px] text-neutral-800 border-b border-neutral-300 pb-1">
            II. BALANCETE PATRIMONIAL CONSOLIDADO DO GRUPO
          </h4>
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-900 bg-neutral-100 font-bold uppercase text-[9px]">
                <th className="py-1.5 px-2 w-28">Classificação</th>
                <th className="py-1.5 px-2">Conta Contábil</th>
                <th className="py-1.5 px-2 text-right w-28">Matriz</th>
                <th className="py-1.5 px-2 text-right w-28">Filiais</th>
                <th className="py-1.5 px-2 text-right w-28">Eliminações</th>
                <th className="py-1.5 px-2 text-right w-32">Total Consolidado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono">
              {balanceteConsolidado.filter(b => b.grau <= 3).map((item, idx) => (
                <tr key={idx} className={item.grau === 1 ? 'font-bold bg-neutral-100' : item.grau === 2 ? 'font-bold' : ''}>
                  <td className="py-1 px-2">{item.classificacao}</td>
                  <td className="py-1 px-2 font-sans">{item.nome}</td>
                  <td className="py-1 px-2 text-right">{item.saldoMatriz.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right">{item.saldoFiliais.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right text-rose-600">{item.eliminacoes > 0 ? `(${item.eliminacoes.toFixed(2)})` : '-'}</td>
                  <td className="py-1 px-2 text-right font-bold text-neutral-950">{item.saldoConsolidado.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-neutral-800 pt-1">
            <div className="font-bold">{empresa.razaoSocial}</div>
            <div className="text-[10px] text-neutral-600">Diretoria / Matriz Controladora</div>
          </div>
          <div className="border-t border-neutral-800 pt-1">
            <div className="font-bold">{empresa.contadorNome || 'Responsável Técnico'}</div>
            <div className="text-[10px] text-neutral-600">{empresa.contadorCRC || 'CRC Ativo'}</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'DEMONSTRAÇÕES CONTÁBEIS CONSOLIDADAS (CPC 36 / MATRIZ & FILIAIS)',
      subtitulo: `Exercício Social ${empresa.exercicioAtivo} • Normas Brasileiras de Contabilidade (NBC TG 36)`,
      conteudo: conteudoRelatorio
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Top Banner de Navegação */}
      <div className="px-5 py-3 bg-[#181818] border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Demonstrações Contábeis Consolidadas (Matriz & Filiais)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">CPC 36 / NBC TG 36</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Consolidação de grupos econômicos com eliminação de operações e saldos intercompany ( Sistemas: "( Consolidado )").
            </p>
          </div>
        </div>

        {/* Seletor de Guias e Impressão */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-[#121212] p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setAbaAtiva('BALANCETE')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${abaAtiva === 'BALANCETE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
                }`}
            >
              Balancete Consolidado
            </button>

            <button
              onClick={() => setAbaAtiva('DRE')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${abaAtiva === 'DRE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
                }`}
            >
              D.R.E. Consolidada
            </button>
          </div>

          <button
            onClick={handleImprimirConsolidadoA4}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir A4 Oficial</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Consolidação */}
      <div className="px-5 py-3 bg-[#161616] border-b border-white/5 grid grid-cols-4 gap-3 flex-shrink-0 text-xs">
        <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
          <span className="text-[10px] text-neutral-400 block">Ativo Matriz (Sede)</span>
          <span className="text-sm font-bold text-neutral-100 font-mono mt-0.5 block">
            R$ {totalMatriz.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
          <span className="text-[10px] text-neutral-400 block">Ativo Filiais (Comerciais)</span>
          <span className="text-sm font-bold text-blue-400 font-mono mt-0.5 block">
            R$ {totalFiliais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
          <span className="text-[10px] text-neutral-400 block">Eliminações Intercompany</span>
          <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">
            - R$ {totalEliminacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
          <span className="text-[10px] text-neutral-400 block">Ativo Total Consolidado (CPC 36)</span>
          <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
            R$ {totalConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: BALANCETE PATRIMONIAL CONSOLIDADO */}
      {/* ============================================================== */}
      {abaAtiva === 'BALANCETE' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de Filtros */}
          <div className="px-5 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Buscar conta ou classificação..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded pl-8 pr-2.5 py-1 text-xs text-neutral-200 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <label className="flex items-center space-x-2 text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apenasAnaliticas}
                  onChange={(e) => setApenasAnaliticas(e.target.checked)}
                  className="rounded bg-[#121212] border-white/20 text-blue-600"
                />
                <span>Apenas Contas Analíticas</span>
              </label>
            </div>

            <button
              onClick={() => {
                exportToCSV(balanceteFiltrado.map(b => ({
                  Classificacao: b.classificacao,
                  Conta: b.nome,
                  Grau: b.grau,
                  Tipo: b.tipo,
                  SaldoMatriz: b.saldoMatriz,
                  SaldoFiliais: b.saldoFiliais,
                  Eliminacoes: b.eliminacoes,
                  SaldoConsolidado: b.saldoConsolidado
                })), `balancete_consolidado_${empresa.exercicioAtivo}`);
              }}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded font-medium flex items-center space-x-1.5 transition text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Grade Matricial Consolidada */}
          <div className="flex-1 overflow-auto custom-scrollbar p-5">
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#202020] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-36">Classificação</th>
                    <th className="py-2.5 px-3">Conta Contábil</th>
                    <th className="py-2.5 px-3 w-16 text-center">Tipo</th>
                    <th className="py-2.5 px-3 w-36 text-right">Saldo Matriz (R$)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Saldo Filiais (R$)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Eliminações (R$)</th>
                    <th className="py-2.5 px-3 w-40 text-right">Consolidado Final (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                  {balanceteFiltrado.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-white/5 transition-colors ${item.tipo === 'S' && item.grau <= 2 ? 'font-bold bg-neutral-900/60 text-neutral-100' : ''
                        }`}
                    >
                      <td className="py-2 px-3 text-neutral-400">{item.classificacao}</td>
                      <td className="py-2 px-3 font-sans text-neutral-200">
                        <span style={{ paddingLeft: `${(item.grau - 1) * 12}px` }}>
                          {item.nome}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.tipo === 'S' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-neutral-300">
                        {item.saldoMatriz.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-blue-400">
                        {item.saldoFiliais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-rose-400">
                        {item.eliminacoes > 0 ? `(${item.eliminacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400">
                        {item.saldoConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: DRE CONSOLIDADA */}
      {/* ============================================================== */}
      {abaAtiva === 'DRE' && (
        <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                Demonstração do Resultado Consolidada (DRE) • CPC 36
              </h3>
              <p className="text-[11px] text-neutral-400">
                Resultado líquido apurado do grupo econômico com cancelamento de receitas e despesas entre filiais
              </p>
            </div>

            <button
              onClick={() => {
                exportToCSV(dreConsolidada.map(d => ({
                  Descricao: d.descricao,
                  Matriz: d.valorMatriz,
                  Filiais: d.valorFiliais,
                  Eliminacoes: d.eliminacoesIntercompany,
                  Consolidado: d.valorConsolidado
                })), `dre_consolidada_${empresa.exercicioAtivo}`);
              }}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded font-medium flex items-center space-x-1.5 transition text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar DRE CSV</span>
            </button>
          </div>

          <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#202020] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Estrutura DRE</th>
                  <th className="py-3 px-4 w-40 text-right">Matriz Sede (R$)</th>
                  <th className="py-3 px-4 w-40 text-right">Filial 01 (R$)</th>
                  <th className="py-3 px-4 w-40 text-right">Eliminações (R$)</th>
                  <th className="py-3 px-4 w-44 text-right">Consolidado Final (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                {dreConsolidada.map((linha, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-white/5 transition-colors ${linha.isTotal
                        ? 'font-bold bg-neutral-900/80 border-t-2 border-white/10 text-neutral-100'
                        : linha.isHeader
                          ? 'font-bold bg-white/[0.02] text-neutral-200'
                          : ''
                      }`}
                  >
                    <td className="py-2.5 px-4 font-sans text-neutral-200">{linha.descricao}</td>
                    <td className="py-2.5 px-4 text-right text-neutral-300">
                      {linha.valorMatriz.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-blue-400">
                      {linha.valorFiliais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      {linha.eliminacoesIntercompany > 0 ? `(${linha.eliminacoesIntercompany.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : '-'}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-bold ${linha.valorConsolidado >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                      {linha.valorConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
