import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Scale,
  TrendingUp,
  FileText,
  Printer,
  Calendar,
  Layers,
  DollarSign,
  Building2,
  Share2,
  CheckCircle,
  Copy,
  Users,
  Landmark
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { Empresa, QuadroDmpl, DemonstracaoDva } from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const DmplDvaModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [ano, setAno] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'dmpl' | 'dva'>('dmpl');

  const [quadroDmpl, setQuadroDmpl] = useState<QuadroDmpl | null>(null);
  const [demonstracaoDva, setDemonstracaoDva] = useState<DemonstracaoDva | null>(null);

  // Modais de Impressão A4
  const [showPrintDmplModal, setShowPrintDmplModal] = useState(false);
  const [showPrintDvaModal, setShowPrintDvaModal] = useState(false);
  const [copiadoSped, setCopiadoSped] = useState(false);

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    if (emp) {
      setEmpresa(emp);
      const dmpl = dbService.getQuadroDmpl(emp.id, ano);
      setQuadroDmpl(dmpl);
      const dva = dbService.getDemonstracaoDva(emp.id, ano);
      setDemonstracaoDva(dva);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [ano]);

  // KPIs
  const totais = useMemo(() => {
    const plFinal = quadroDmpl ? quadroDmpl.totalFinalPl : 0;
    const plInicial = quadroDmpl?.linhas[0]?.totalPl || 0;
    const variacaoPl = plFinal - plInicial;
    const lucroExercicio = quadroDmpl?.linhas.find(l => l.descricao.includes('Lucro Líquido'))?.totalPl || 0;
    const valorAdicionado = demonstracaoDva ? demonstracaoDva.valorAdicionadoTotal : 0;
    const pessoal = demonstracaoDva?.distribuicaoValor.find(i => i.codigo === '7.1')?.valor || 0;
    const percPessoal = valorAdicionado > 0 ? (pessoal / valorAdicionado) * 100 : 0;

    return {
      plFinal,
      plInicial,
      variacaoPl,
      lucroExercicio,
      valorAdicionado,
      percPessoal
    };
  }, [quadroDmpl, demonstracaoDva]);

  const handleCopiarSpedJ210 = () => {
    if (!quadroDmpl) return;
    const lines: string[] = [];
    lines.push(`|J210|0101${ano}|3112${ano}|DMPL|${quadroDmpl.totalFinalPl.toFixed(2).replace('.', ',')}|`);
    quadroDmpl.linhas.forEach((l, idx) => {
      lines.push(`|J215|${idx + 1}|${l.descricao.toUpperCase()}|${l.totalPl.toFixed(2).replace('.', ',')}|`);
    });
    navigator.clipboard.writeText(lines.join('\r\n'));
    setCopiadoSped(true);
    setTimeout(() => setCopiadoSped(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-gray-200 overflow-hidden font-sans">
      {/* HEADER BAR */}
      <div className="bg-[#181818] border-b border-[#2a2a2a] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-100">DMPL & DVA Oficiais</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/50">
                  CPC 26 & CPC 09
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/50">
                  SPED ECD Bloco J
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {empresa ? `${empresa.razaoSocial} • CNPJ: ${empresa.cnpj}` : 'Selecione uma empresa'} • Mutações do Patrimônio Líquido e Distribuição de Riqueza
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLES DO TOPO */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded border border-[#333]">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Exercício:</span>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#202020]">2026</option>
              <option value={2025} className="bg-[#202020]">2025</option>
              <option value={2024} className="bg-[#202020]">2024</option>
            </select>
          </div>

          <button
            onClick={() => setShowPrintDmplModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 rounded border border-[#3a3a3a] transition"
            title="Emitir Demonstração das Mutações do Patrimônio Líquido em A4"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            Imprimir DMPL A4
          </button>

          <button
            onClick={() => setShowPrintDvaModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 rounded border border-[#3a3a3a] transition"
            title="Emitir Demonstração do Valor Adicionado em A4"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Imprimir DVA A4
          </button>

          <button
            onClick={handleCopiarSpedJ210}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium rounded shadow transition"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiadoSped ? 'Bloco J Copiado!' : 'Copiar SPED J210'}
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD CARDS */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Patrimônio Líquido Final</div>
            <div className="text-base font-bold text-purple-400 font-mono mt-0.5">
              R$ {totais.plFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Posição em 31/12/{ano}</div>
          </div>
          <div className="p-2 rounded bg-purple-950/40 text-purple-400 border border-purple-800/30">
            <Scale className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Variação do PL no Ano</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${totais.variacaoPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totais.variacaoPl >= 0 ? '+' : ''} R$ {totais.variacaoPl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Aporte + Lucro - Dividendos</div>
          </div>
          <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Lucro Líquido do Período</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              R$ {totais.lucroExercicio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Resultado após tributos</div>
          </div>
          <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Valor Adicionado (DVA)</div>
            <div className="text-base font-bold text-sky-400 font-mono mt-0.5">
              R$ {totais.valorAdicionado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Riqueza gerada a distribuir</div>
          </div>
          <div className="p-2 rounded bg-sky-950/40 text-sky-400 border border-sky-800/30">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Pessoal & Encargos</div>
            <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
              {totais.percPessoal.toFixed(1)}% do Valor Gerado
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Remuneração do trabalho</div>
          </div>
          <div className="p-2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/30">
            <Users className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE DMPL E DVA */}
      <div className="px-6 border-b border-[#2a2a2a] flex gap-2">
        <button
          onClick={() => setActiveTab('dmpl')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'dmpl'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          DMPL • Mutações do Patrimônio Líquido (CPC 26)
        </button>
        <button
          onClick={() => setActiveTab('dva')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'dva'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          DVA • Demonstração do Valor Adicionado (CPC 09)
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 overflow-auto p-6">
        {/* ABA 1: DMPL */}
        {activeTab === 'dmpl' && quadroDmpl && (
          <div className="space-y-4">
            <div className="bg-[#181818] rounded-lg border border-[#2a2a2a] overflow-hidden">
              <div className="px-4 py-3 bg-[#202020] border-b border-[#2a2a2a] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-100 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-400" />
                    Quadro Matricial da DMPL - Exercício {ano} (Valores em Reais)
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Demonstração analítica da movimentação de todas as contas do Patrimônio Líquido.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#242424] text-gray-400 border-b border-[#2a2a2a]">
                    <tr>
                      <th className="py-2.5 px-3 min-w-[280px]">Histórico / Evento Contábil</th>
                      <th className="py-2.5 px-3 text-right">Capital Social</th>
                      <th className="py-2.5 px-3 text-right">Reservas Capital</th>
                      <th className="py-2.5 px-3 text-right">Reservas Lucros</th>
                      <th className="py-2.5 px-3 text-right">Ações Tesouraria</th>
                      <th className="py-2.5 px-3 text-right">Lucros / Prej. Acum.</th>
                      <th className="py-2.5 px-3 text-right font-bold text-gray-200">Total do P.L.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {quadroDmpl.linhas.map((linha, idx) => {
                      const isHeader = idx === 0;
                      const isFooter = idx === quadroDmpl.linhas.length - 1;
                      return (
                        <tr
                          key={linha.id}
                          className={`transition ${
                            isFooter 
                              ? 'bg-[#222] font-bold text-purple-300 border-t-2 border-[#444]' 
                              : isHeader 
                              ? 'bg-[#1b1b1b] font-semibold text-gray-100' 
                              : 'hover:bg-[#1f1f1f]'
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            {linha.descricao}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {linha.capitalSocial !== 0 ? linha.capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {linha.reservasCapital !== 0 ? linha.reservasCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                            {linha.reservasLucros !== 0 ? linha.reservasLucros.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                            {linha.acoesTesouraria !== 0 ? `(${Math.abs(linha.acoesTesouraria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : '-'}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono ${linha.lucrosPrejuizosAcumulados < 0 ? 'text-rose-400' : 'text-gray-200'}`}>
                            {linha.lucrosPrejuizosAcumulados !== 0 
                              ? (linha.lucrosPrejuizosAcumulados < 0 ? `(${Math.abs(linha.lucrosPrejuizosAcumulados).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : linha.lucrosPrejuizosAcumulados.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
                              : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-100">
                            R$ {linha.totalPl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: DVA */}
        {activeTab === 'dva' && demonstracaoDva && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PAINEL 1: GERAÇÃO DO VALOR ADICIONADO */}
            <div className="bg-[#181818] p-4 rounded-lg border border-[#2a2a2a] space-y-3">
              <div className="border-b border-[#2a2a2a] pb-2">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  1. Geração do Valor Adicionado
                </h3>
                <p className="text-[11px] text-gray-400">
                  Riqueza produzida a partir das receitas operacionais menos os insumos consumidos.
                </p>
              </div>

              <div className="space-y-1 text-xs">
                {demonstracaoDva.geracaoValor.map((item) => (
                  <div
                    key={item.codigo}
                    className={`flex items-center justify-between p-2 rounded ${
                      item.nivel === 1 ? 'bg-[#202020] font-bold text-gray-100 mt-2' : 'pl-6 text-gray-400'
                    }`}
                  >
                    <span>{item.codigo} {item.descricao}</span>
                    <span className="font-mono text-gray-200">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PAINEL 2: DISTRIBUIÇÃO DO VALOR ADICIONADO */}
            <div className="bg-[#181818] p-4 rounded-lg border border-[#2a2a2a] space-y-3">
              <div className="border-b border-[#2a2a2a] pb-2">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  2. Distribuição do Valor Adicionado
                </h3>
                <p className="text-[11px] text-gray-400">
                  Destinação aos colaboradores, ao governo (tributos), a credores e a acionistas.
                </p>
              </div>

              <div className="space-y-1 text-xs">
                {demonstracaoDva.distribuicaoValor.map((item) => {
                  const perc = demonstracaoDva.valorAdicionadoTotal > 0 
                    ? (item.valor / demonstracaoDva.valorAdicionadoTotal) * 100 
                    : 0;

                  return (
                    <div
                      key={item.codigo}
                      className={`flex items-center justify-between p-2 rounded ${
                        item.nivel === 1 ? 'bg-[#202020] font-bold text-gray-100 mt-2' : 'pl-6 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.codigo} {item.descricao}</span>
                        {item.nivel === 1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                            {perc.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-gray-200">
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#333] flex justify-between items-center text-xs font-bold text-emerald-400 bg-[#1c1c1c] p-2.5 rounded">
                <span>TOTAL DO VALOR ADICIONADO DISTRIBUÍDO:</span>
                <span className="font-mono text-sm">
                  R$ {demonstracaoDva.valorAdicionadoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL IMPRESSÃO DMPL A4 */}
      {showPrintDmplModal && quadroDmpl && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintDmplModal}
          onClose={() => setShowPrintDmplModal(false)}
          empresa={empresa}
          tituloRelatorio="Demonstração das Mutações do Patrimônio Líquido (DMPL)"
          subtitulo="Norma Brasileira de Contabilidade NBC TG 26 (R5) • Pronunciamento Técnico CPC 26"
          periodo={`Exercício Social findo em 31 de dezembro de ${ano}`}
        >
          <div className="space-y-4 text-black font-sans text-[10px]">
            <div className="border border-black p-2 space-y-1">
              <div className="font-bold text-xs">{empresa.razaoSocial}</div>
              <div>CNPJ: {empresa.cnpj} • Endereço: {empresa.logradouro}, {empresa.numero}</div>
              <div>Município: {empresa.cidade || 'São Paulo'} - {empresa.uf} • Exercício Social: {ano}</div>
            </div>

            <div className="border border-black p-2">
              <div className="font-bold text-xs uppercase mb-2">QUADRO MATRICIAL DE MUTAÇÕES PATRIMONIAIS (VALORES EM REAIS)</div>
              <table className="w-full border-collapse border border-black text-[9px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-left">Fato Contábil / Descrição</th>
                    <th className="border border-black p-1 text-right">Capital Social</th>
                    <th className="border border-black p-1 text-right">Res. Capital</th>
                    <th className="border border-black p-1 text-right">Res. Lucros</th>
                    <th className="border border-black p-1 text-right">Ações Tesour.</th>
                    <th className="border border-black p-1 text-right">Lucros/Prej. Ac.</th>
                    <th className="border border-black p-1 text-right font-bold">Total do PL</th>
                  </tr>
                </thead>
                <tbody>
                  {quadroDmpl.linhas.map((l, idx) => (
                    <tr key={l.id} className={`border-b border-black ${idx === quadroDmpl.linhas.length - 1 ? 'font-bold bg-gray-100' : ''}`}>
                      <td className="border border-black p-1">{l.descricao}</td>
                      <td className="border border-black p-1 text-right font-mono">{l.capitalSocial !== 0 ? l.capitalSocial.toFixed(2) : '-'}</td>
                      <td className="border border-black p-1 text-right font-mono">{l.reservasCapital !== 0 ? l.reservasCapital.toFixed(2) : '-'}</td>
                      <td className="border border-black p-1 text-right font-mono">{l.reservasLucros !== 0 ? l.reservasLucros.toFixed(2) : '-'}</td>
                      <td className="border border-black p-1 text-right font-mono">{l.acoesTesouraria !== 0 ? `(${Math.abs(l.acoesTesouraria).toFixed(2)})` : '-'}</td>
                      <td className="border border-black p-1 text-right font-mono">{l.lucrosPrejuizosAcumulados !== 0 ? (l.lucrosPrejuizosAcumulados < 0 ? `(${Math.abs(l.lucrosPrejuizosAcumulados).toFixed(2)})` : l.lucrosPrejuizosAcumulados.toFixed(2)) : '-'}</td>
                      <td className="border border-black p-1 text-right font-mono font-bold">R$ {l.totalPl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border border-black p-3 space-y-4">
              <div className="font-bold">NOTAS EXPLICATIVAS & DECLARAÇÃO DA ADMINISTRAÇÃO</div>
              <p className="text-justify leading-relaxed">
                As demonstrações contábeis e as mutações do patrimônio líquido foram elaboradas em estrita 
                conformidade com os princípios fundamentais de contabilidade emanados do Conselho Federal de 
                Contabilidade (CFC), da Lei das Sociedades por Ações (Lei nº 6.404/76 e alterações posteriores) 
                e das Normas Brasileiras de Contabilidade (NBC TG 26).
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-center border-t border-black pt-1">
                  <div className="font-bold">{empresa.razaoSocial}</div>
                  <div>Diretoria Executiva / Representante Legal</div>
                </div>
                <div className="text-center border-t border-black pt-1">
                  <div className="font-bold">Contabilista Responsável</div>
                  <div>CRC-SP 241.982/O-4</div>
                </div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* MODAL IMPRESSÃO DVA A4 */}
      {showPrintDvaModal && demonstracaoDva && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintDvaModal}
          onClose={() => setShowPrintDvaModal(false)}
          empresa={empresa}
          tituloRelatorio="Demonstração do Valor Adicionado (DVA)"
          subtitulo="Norma Brasileira de Contabilidade NBC TG 09 • Pronunciamento Técnico CPC 09"
          periodo={`Exercício Social findo em 31 de dezembro de ${ano}`}
        >
          <div className="space-y-4 text-black font-sans text-[10px]">
            <div className="border border-black p-2 space-y-1">
              <div className="font-bold text-xs">{empresa.razaoSocial}</div>
              <div>CNPJ: {empresa.cnpj} • Exercício Social: {ano}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 1. GERAÇÃO */}
              <div className="border border-black p-2 space-y-2">
                <div className="font-bold uppercase text-[10px]">1. GERAÇÃO DO VALOR ADICIONADO</div>
                <table className="w-full border-collapse border border-black text-[9px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black">
                      <th className="border border-black p-1 text-left">Item / Descrição</th>
                      <th className="border border-black p-1 text-right">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demonstracaoDva.geracaoValor.map((it) => (
                      <tr key={it.codigo} className={`border-b border-black ${it.nivel === 1 ? 'font-bold bg-gray-50' : ''}`}>
                        <td className="border border-black p-1">{it.codigo} {it.descricao}</td>
                        <td className="border border-black p-1 text-right font-mono">{it.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. DISTRIBUIÇÃO */}
              <div className="border border-black p-2 space-y-2">
                <div className="font-bold uppercase text-[10px]">2. DISTRIBUIÇÃO DO VALOR ADICIONADO</div>
                <table className="w-full border-collapse border border-black text-[9px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black">
                      <th className="border border-black p-1 text-left">Destinação</th>
                      <th className="border border-black p-1 text-right">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demonstracaoDva.distribuicaoValor.map((it) => (
                      <tr key={it.codigo} className={`border-b border-black ${it.nivel === 1 ? 'font-bold bg-gray-50' : ''}`}>
                        <td className="border border-black p-1">{it.codigo} {it.descricao}</td>
                        <td className="border border-black p-1 text-right font-mono">{it.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-black p-2 bg-gray-50 flex justify-between font-bold text-xs">
              <span>VALOR ADICIONADO TOTAL DISTRIBUÍDO:</span>
              <span className="font-mono">R$ {demonstracaoDva.valorAdicionadoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="text-center border-t border-black pt-1">
                <div className="font-bold">{empresa.razaoSocial}</div>
                <div>Diretoria Executiva</div>
              </div>
              <div className="text-center border-t border-black pt-1">
                <div className="font-bold">Contabilista Responsável</div>
                <div>CRC-SP 241.982/O-4</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
