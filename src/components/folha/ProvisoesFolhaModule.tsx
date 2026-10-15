import React, { useState, useMemo } from 'react';
import { Empresa, ProvisaoFolhaResumo, ProvisaoItemFolha } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Calendar,
  Layers,
  Calculator,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  ShieldCheck,
  Search,
  Zap,
  Info
} from 'lucide-react';

interface ProvisoesFolhaModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
  onIntegracaoSucesso?: () => void;
}

export const ProvisoesFolhaModule: React.FC<ProvisoesFolhaModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [busca, setBusca] = useState('');
  const [competencia, setCompetencia] = useState(empresa.competenciaAtiva);
  const [notificacao, setNotificacao] = useState<{ tipo: 'success' | 'info'; mensagem: string } | null>(null);

  // Dados calculados em tempo real
  const resumo: ProvisaoFolhaResumo = useMemo(() => {
    return dbService.getProvisoesFolhaResumo(empresa.id, competencia);
  }, [empresa.id, competencia]);

  const itensFiltrados = useMemo(() => {
    return resumo.itens.filter(i => 
      i.colaboradorNome.toLowerCase().includes(busca.toLowerCase()) ||
      i.colaboradorCargo.toLowerCase().includes(busca.toLowerCase())
    );
  }, [resumo.itens, busca]);

  // Integração Contábil Direta
  const handleIntegrarContabil = () => {
    const res = dbService.integrarProvisoesContabil(empresa.id, competencia);
    if (res.success) {
      setNotificacao({
        tipo: 'success',
        mensagem: `Provisões integradas com sucesso! Lote nº ${res.loteId} com ${res.partidasGeradas} lançamentos gerados.`
      });
      onIntegracaoSucesso?.();
    } else {
      setNotificacao({
        tipo: 'info',
        mensagem: 'Não há colaboradores ativos elegíveis para provisão nesta competência.'
      });
    }
    setTimeout(() => setNotificacao(null), 6000);
  };

  // Exportar CSV
  const handleExportarCSV = () => {
    const dados = resumo.itens.map(i => ({
      Colaborador: i.colaboradorNome,
      Cargo: i.colaboradorCargo,
      Admissao: i.dataAdmissao,
      SalarioBase: i.salarioBase,
      ProvisaoFerias: i.valorProvisaoFerias,
      TercoConstitucional: i.valorTercoConstitucional,
      TotalFerias: i.totalProvisaoFerias,
      Provisao13o: i.valorProvisao13o,
      FGTSProvisao: i.valorFGTSFerias + i.valorFGTS13o,
      INSSProvisao: i.valorINSSPatronalFerias + i.valorINSSPatronal13o,
      TotalGeralMes: i.totalProvisaoMes
    }));
    exportToCSV(dados, `Mapa_Provisoes_Folha_${competencia}`);
  };

  // Pré-visualização A4 Oficial
  const handleAbrirImpressaoA4 = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="space-y-4 text-neutral-900 font-sans">
        <div className="border-b-2 border-neutral-900 pb-3 text-center">
          <h2 className="text-base font-bold uppercase tracking-wider">Mapa Mensal de Provisões Trabalhistas (Férias e 13º Salário)</h2>
          <p className="text-xs text-neutral-600 font-mono mt-0.5">
            {empresa.razaoSocial} | CNPJ: {empresa.cnpj} | Competência de Apuração: {competencia}
          </p>
          <p className="text-[10px] text-neutral-500 uppercase mt-0.5 font-sans">
            Norma Brasileira de Contabilidade NBC TG / Resolução CFC / Princípio da Competência
          </p>
        </div>

        {/* Resumo Consolidado */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 border border-neutral-300 rounded bg-neutral-50">
            <span className="text-[10px] font-semibold text-neutral-600 uppercase block">Provisão Férias + 1/3</span>
            <span className="font-bold font-mono text-sm">
              R$ {(resumo.totalFerias + resumo.totalTerco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 border border-neutral-300 rounded bg-neutral-50">
            <span className="text-[10px] font-semibold text-neutral-600 uppercase block">Provisão 13º Salário</span>
            <span className="font-bold font-mono text-sm">
              R$ {resumo.total13o.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 border border-neutral-300 rounded bg-neutral-50">
            <span className="text-[10px] font-semibold text-neutral-600 uppercase block">Encargos FGTS + INSS</span>
            <span className="font-bold font-mono text-sm">
              R$ {(resumo.totalFGTSFerias + resumo.totalINSSFerias + resumo.totalFGTS13o + resumo.totalINSS13o).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 border-2 border-neutral-900 rounded bg-neutral-100 font-bold">
            <span className="text-[10px] uppercase block">Total Provisão do Mês</span>
            <span className="font-mono text-sm">
              R$ {resumo.totalGeralProvisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Tabela Paginada */}
        <table className="w-full text-left text-[10px] border-collapse mt-2">
          <thead>
            <tr className="border-b-2 border-neutral-900 font-bold uppercase text-[9px] bg-neutral-100">
              <th className="py-1.5 px-2">Colaborador / Cargo</th>
              <th className="py-1.5 px-2 text-right">Salário Base</th>
              <th className="py-1.5 px-2 text-right">1/12 Férias</th>
              <th className="py-1.5 px-2 text-right">1/3 Const.</th>
              <th className="py-1.5 px-2 text-right">1/12 13º Sal.</th>
              <th className="py-1.5 px-2 text-right">FGTS (8%)</th>
              <th className="py-1.5 px-2 text-right">INSS (20%)</th>
              <th className="py-1.5 px-2 text-right font-bold">Total Mês</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {resumo.itens.map(i => (
              <tr key={i.colaboradorId} className="hover:bg-neutral-50">
                <td className="py-1 px-2 font-medium">
                  <div>{i.colaboradorNome}</div>
                  <div className="text-[9px] text-neutral-500">{i.colaboradorCargo}</div>
                </td>
                <td className="py-1 px-2 font-mono text-right">R$ {i.salarioBase.toFixed(2)}</td>
                <td className="py-1 px-2 font-mono text-right">R$ {i.valorProvisaoFerias.toFixed(2)}</td>
                <td className="py-1 px-2 font-mono text-right">R$ {i.valorTercoConstitucional.toFixed(2)}</td>
                <td className="py-1 px-2 font-mono text-right">R$ {i.valorProvisao13o.toFixed(2)}</td>
                <td className="py-1 px-2 font-mono text-right">R$ {(i.valorFGTSFerias + i.valorFGTS13o).toFixed(2)}</td>
                <td className="py-1 px-2 font-mono text-right">R$ {(i.valorINSSPatronalFerias + i.valorINSSPatronal13o).toFixed(2)}</td>
                <td className="py-1 px-2 font-mono text-right font-bold">R$ {i.totalProvisaoMes.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-neutral-900 font-bold font-mono text-[10px] bg-neutral-100">
              <td className="py-2 px-2 text-left uppercase">Totais Consolidados:</td>
              <td className="py-2 px-2 text-right">R$ {resumo.itens.reduce((acc, i) => acc + i.salarioBase, 0).toFixed(2)}</td>
              <td className="py-2 px-2 text-right">R$ {resumo.totalFerias.toFixed(2)}</td>
              <td className="py-2 px-2 text-right">R$ {resumo.totalTerco.toFixed(2)}</td>
              <td className="py-2 px-2 text-right">R$ {resumo.total13o.toFixed(2)}</td>
              <td className="py-2 px-2 text-right">R$ {(resumo.totalFGTSFerias + resumo.totalFGTS13o).toFixed(2)}</td>
              <td className="py-2 px-2 text-right">R$ {(resumo.totalINSSFerias + resumo.totalINSS13o).toFixed(2)}</td>
              <td className="py-2 px-2 text-right text-black font-extrabold">R$ {resumo.totalGeralProvisao.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Parecer Técnico e Assinaturas */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-neutral-400 pt-2">
            <p className="font-bold">{empresa.razaoSocial}</p>
            <p className="text-[10px] text-neutral-500">Administrador / Responsável Legal</p>
          </div>
          <div className="border-t border-neutral-400 pt-2">
            <p className="font-bold">{empresa.contadorNome || 'Contador Responsável Técnico'}</p>
            <p className="text-[10px] text-neutral-500">CRC: {empresa.contadorCRC || 'CRC-SP 123456/O-0'} / Responsável Técnico</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Mapa Oficial de Provisão de Férias e 13º Salário',
      subtitulo: `Empresa: ${empresa.razaoSocial} - Competência: ${competencia}`,
      conteudo: conteudoA4
    });
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Calculator size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Provisões Mensais de Férias e 13º Salário</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-medium">
                NBC TG / CLT
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Cálculo de 1/12 avos, 1/3 constitucional de férias e encargos patronais (FGTS 8% e CPP 20%) com integração contábil
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
            onClick={handleAbrirImpressaoA4}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Imprimir Mapa A4</span>
          </button>

          <button
            onClick={handleIntegrarContabil}
            disabled={resumo.integradoContabil}
            className={`px-3 py-1.5 text-xs font-semibold rounded shadow flex items-center space-x-1.5 transition-colors ${
              resumo.integradoContabil
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{resumo.integradoContabil ? 'Provisões Integradas' : 'Integrar à Contabilidade'}</span>
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
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Provisão Férias + 1/3</span>
          <div className="text-xl font-bold font-mono text-purple-400">
            R$ {(resumo.totalFerias + resumo.totalTerco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-mono">
            Férias: R$ {resumo.totalFerias.toFixed(2)} | 1/3: R$ {resumo.totalTerco.toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Provisão 13º Salário</span>
          <div className="text-xl font-bold font-mono text-sky-400">
            R$ {resumo.total13o.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-mono">1/12 avos acumulados por CLT</span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Encargos Sociais Provisionados</span>
          <div className="text-xl font-bold font-mono text-amber-400">
            R$ {(resumo.totalFGTSFerias + resumo.totalINSSFerias + resumo.totalFGTS13o + resumo.totalINSS13o).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-mono">
            FGTS (8%): R$ {(resumo.totalFGTSFerias + resumo.totalFGTS13o).toFixed(2)} | INSS (20%): R$ {(resumo.totalINSSFerias + resumo.totalINSS13o).toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1">
          <span className="text-[11px] text-purple-300 font-medium uppercase">Total Provisionado no Mês</span>
          <div className="text-xl font-bold font-mono text-purple-300">
            R$ {resumo.totalGeralProvisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-purple-400/80 block font-sans">
            {resumo.integradoContabil ? '✓ Lote contabilizado no Diário' : 'Aguardando encerramento contábil'}
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex items-center justify-between mt-4 pb-2 border-b border-white/10 flex-shrink-0">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrar por colaborador ou cargo..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="font-mono text-white font-semibold">{itensFiltrados.length}</span> colaborador(es) CLT elegível(is)
        </div>
      </div>

      {/* Grade Principal de Provisões */}
      <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase text-[11px] z-10">
              <tr>
                <th className="py-2.5 px-3">Colaborador / Função</th>
                <th className="py-2.5 px-3 text-right">Salário Base</th>
                <th className="py-2.5 px-3 text-right">1/12 Férias</th>
                <th className="py-2.5 px-3 text-right">1/3 Const.</th>
                <th className="py-2.5 px-3 text-right font-semibold text-purple-300">Total Férias</th>
                <th className="py-2.5 px-3 text-right font-semibold text-sky-300">1/12 13º Sal.</th>
                <th className="py-2.5 px-3 text-right">FGTS (8%)</th>
                <th className="py-2.5 px-3 text-right">INSS (20%)</th>
                <th className="py-2.5 px-3 text-right font-bold text-white">Total Mês</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[12px]">
              {itensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-500 text-xs font-sans">
                    Nenhum colaborador encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                itensFiltrados.map(item => (
                  <tr key={item.colaboradorId} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-sans">
                      <div className="font-medium text-white">{item.colaboradorNome}</div>
                      <div className="text-[11px] text-neutral-400">{item.colaboradorCargo}</div>
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-300">
                      R$ {item.salarioBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-300">
                      R$ {item.valorProvisaoFerias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-400">
                      R$ {item.valorTercoConstitucional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-purple-400 font-semibold">
                      R$ {item.totalProvisaoFerias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-sky-400 font-semibold">
                      R$ {item.totalProvisao13o.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-400">
                      R$ {(item.valorFGTSFerias + item.valorFGTS13o).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-400">
                      R$ {(item.valorINSSPatronalFerias + item.valorINSSPatronal13o).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">
                      R$ {item.totalProvisaoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {itensFiltrados.length > 0 && (
              <tfoot className="sticky bottom-0 bg-[#1a1a1a] border-t-2 border-white/20 font-mono text-[12px] font-bold">
                <tr>
                  <td className="py-2.5 px-3 text-neutral-300 uppercase font-sans text-xs">Totais da Competência:</td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {itensFiltrados.reduce((a, b) => a + b.salarioBase, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {resumo.totalFerias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {resumo.totalTerco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-400">
                    R$ {(resumo.totalFerias + resumo.totalTerco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-sky-400">
                    R$ {resumo.total13o.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {(resumo.totalFGTSFerias + resumo.totalFGTS13o).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">
                    R$ {(resumo.totalINSSFerias + resumo.totalINSS13o).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-extrabold">
                    R$ {resumo.totalGeralProvisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Rodapé Informativo Contábil */}
        <div className="p-3 bg-[#161616] border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>
              <strong>Regra Contábil Oficial:</strong> D: Despesa com Provisão de Férias/13º (Resultado) | C: Provisão de Férias/13º a Pagar (Passivo Circulante - 2.01.04).
            </span>
          </div>
          <span className="font-mono text-neutral-500">NBC TG 24 / NBC TG 30</span>
        </div>
      </div>
    </div>
  );
};
