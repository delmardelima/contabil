import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, Colaborador, FolhaMensal } from '../../types/contabil';
import { 
  Calculator, 
  Printer, 
  CheckCircle2, 
  Zap, 
  Users, 
  DollarSign, 
  Receipt, 
  ShieldCheck, 
  Search, 
  FileText
} from 'lucide-react';

interface CalculoFolhaModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: {
    tipo: 'HOLERITE' | 'RESUMO_FOLHA';
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
  }) => void;
  onIntegracaoSucesso?: () => void;
}

export const CalculoFolhaModule: React.FC<CalculoFolhaModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [folhas, setFolhas] = useState<FolhaMensal[]>(() => {
    return dbService.getFolhasCalculadas(empresa.id, empresa.competenciaAtiva);
  });
  const [colaboradores] = useState<Colaborador[]>(dbService.getColaboradores(empresa.id));
  const [processando, setProcessando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);

  // Processamento em lote da folha para todos os colaboradores ativos
  const handleProcessarFolha = () => {
    setProcessando(true);
    setTimeout(() => {
      const ativados = colaboradores.filter(c => c.status === 'ATIVO');
      const calculadas: FolhaMensal[] = [];

      for (const colab of ativados) {
        const sal = colab.salarioBase;

        // INSS Progressivo 2026
        let inssSeg = 0;
        if (sal <= 1518.00) inssSeg = sal * 0.075;
        else if (sal <= 2793.88) inssSeg = (sal * 0.09) - 22.77;
        else if (sal <= 4190.83) inssSeg = (sal * 0.12) - 106.59;
        else inssSeg = Math.min(951.63, (sal * 0.14) - 190.40);

        // IRRF Progressivo 2026
        const baseIR = Math.max(0, sal - inssSeg - (colab.dependentesIRRF * 189.59));
        let irrf = 0;
        if (baseIR > 4664.68) irrf = (baseIR * 0.275) - 896.00;
        else if (baseIR > 3751.05) irrf = (baseIR * 0.225) - 662.77;
        else if (baseIR > 2826.65) irrf = (baseIR * 0.15) - 381.44;
        else if (baseIR > 2259.20) irrf = (baseIR * 0.075) - 169.44;

        // Encargos Patronais
        const isCLT = colab.tipoVinculo === 'CLT';
        const inssPatronal = isCLT ? sal * 0.20 : sal * 0.11; // 20% CPP para CLT, 11% pró-labore
        const fgts = isCLT ? sal * 0.08 : 0; // FGTS 8% somente CLT

        const proventos = [
          {
            rubricaId: colab.tipoVinculo === 'PRO_LABORE' ? 2 : 1,
            codigo: colab.tipoVinculo === 'PRO_LABORE' ? '002' : '001',
            nome: colab.tipoVinculo === 'PRO_LABORE' ? 'Pró-Labore Titulares' : 'Salário Base Mensal',
            tipo: 'PROVENTO' as const,
            referencia: 30,
            valor: sal
          }
        ];

        const descontos = [
          {
            rubricaId: 3,
            codigo: '101',
            nome: 'INSS Previdência Social',
            tipo: 'DESCONTO' as const,
            referencia: (inssSeg / sal) * 100,
            valor: inssSeg
          }
        ];

        if (irrf > 0) {
          descontos.push({
            rubricaId: 4,
            codigo: '102',
            nome: 'IRRF Imposto de Renda Fonte',
            tipo: 'DESCONTO' as const,
            referencia: (irrf / sal) * 100,
            valor: irrf
          });
        }

        const totalDesc = descontos.reduce((acc, d) => acc + d.valor, 0);

        const folhaItem: FolhaMensal = {
          id: Date.now() + colab.id,
          empresaId: empresa.id,
          colaboradorId: colab.id,
          competencia: empresa.competenciaAtiva,
          tipoFolha: 'MENSAL',
          dataCalculo: new Date().toISOString().split('T')[0],
          proventos,
          descontos,
          totalProventos: sal,
          totalDescontos: totalDesc,
          salarioLiquido: sal - totalDesc,
          baseINSS: sal,
          inssSegurado: inssSeg,
          inssPatronal,
          baseFGTS: isCLT ? sal : 0,
          fgts,
          baseIRRF: baseIR,
          irrf
        };

        dbService.saveFolhaMensal(folhaItem);
        calculadas.push(folhaItem);
      }

      setFolhas(calculadas);
      setProcessando(false);
      setMensagem(`✅ Folha da competência ${empresa.competenciaAtiva} calculada para ${calculadas.length} colaboradores!`);
    }, 400);
  };

  // Integração Contábil Automática com 1 Clique (Folha -> Contabilidade)
  const handleIntegrarContabilidade = () => {
    const { lote, count, totalBruto } = dbService.gerarIntegracaoFolhaContabil(
      empresa.id,
      empresa.competenciaAtiva
    );

    if (count === 0) {
      alert('Não há cálculo de folha para a competência ativa.');
      return;
    }

    setMensagem(`⚡ Integração Contábil Concluída! Lote #${lote.numeroLote} gerado com ${count} partidas dobradas (Salários Brutos: R$ ${totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
  };

  // Imprimir Holerite A4 de um Colaborador
  const handleImprimirHolerite = (colab: Colaborador) => {
    const folha = folhas.find(f => f.colaboradorId === colab.id);
    if (!folha || !onOpenReportPreview) return;

    const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = [
      ...(folha.proventos || []).map((p: any) => ({
        descricao: `(+) ${p.codigo} - ${p.nome} (Ref: ${p.referencia})`,
        valor: Number(p.valor) || 0
      })),
      ...(folha.descontos || []).map((d: any) => ({
        descricao: `(-) ${d.codigo} - ${d.nome} (Ref: ${Number(d.referencia || 0).toFixed(1)}%)`,
        valor: -(Number(d.valor) || 0)
      })),
      {
        descricao: '(=) SALÁRIO LÍQUIDO A RECEBER',
        valor: folha.salarioLiquido || 0,
        isTotal: true
      }
    ];

    onOpenReportPreview({
      tipo: 'HOLERITE',
      titulo: 'RECIBO DE PAGAMENTO DE SALÁRIO (HOLERITE)',
      subtitulo: `Empregado: ${colab.matricula} - ${colab.nome} • CPF: ${colab.cpf} • Cargo: ${colab.cargo} • Competência: ${empresa.competenciaAtiva}`,
      linhas
    });
  };

  // Imprimir Resumo Geral da Folha A4
  const handleImprimirResumoA4 = () => {
    if (!onOpenReportPreview) return;

    const totBruto = folhas.reduce((acc, f) => acc + (f.totalProventos || 0), 0);
    const totINSSSeg = folhas.reduce((acc, f) => acc + (f.inssSegurado || 0), 0);
    const totIRRF = folhas.reduce((acc, f) => acc + (f.irrf || 0), 0);
    const totINSSPat = folhas.reduce((acc, f) => acc + (f.inssPatronal || 0), 0);
    const totFGTS = folhas.reduce((acc, f) => acc + (f.fgts || 0), 0);
    const totLiquido = folhas.reduce((acc, f) => acc + (f.salarioLiquido || 0), 0);

    const linhas = [
      { descricao: '1. Total de Salários e Pró-Labore Brutos', valor: totBruto },
      { descricao: '2. Total de Retenção de INSS dos Segurados', valor: -totINSSSeg },
      { descricao: '3. Total de Retenção de Imposto de Renda (IRRF)', valor: -totIRRF },
      { descricao: '(=) TOTAL LÍQUIDO DA FOLHA DE PAGAMENTO', valor: totLiquido, isTotal: true },
      { descricao: '4. Encargo Previdenciário Patronal (CPP)', valor: totINSSPat, isHeader: true },
      { descricao: '5. Encargo do FGTS da Competência (8%)', valor: totFGTS, isHeader: true }
    ];

    onOpenReportPreview({
      tipo: 'RESUMO_FOLHA',
      titulo: 'RESUMO CONSOLIDADO DA FOLHA DE PAGAMENTO & ENCARGOS',
      subtitulo: `Competência: ${empresa.competenciaAtiva} • Empresa: ${empresa.razaoSocial} • CNPJ: ${empresa.cnpj}`,
      linhas
    });
  };

  const totalBrutoGeral = folhas.reduce((acc, f) => acc + (f.totalProventos || 0), 0);
  const totalLiquidoGeral = folhas.reduce((acc, f) => acc + (f.salarioLiquido || 0), 0);
  const totalFGTSGeral = folhas.reduce((acc, f) => acc + (f.fgts || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Cálculo da Folha Mensal, Pró-Labore & Holerites</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">
                Competência: {empresa.competenciaAtiva}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Processamento dos vencimentos, descontos progressivos e integração contábil automática.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleProcessarFolha}
            disabled={processando}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{processando ? 'Processando Vínculos...' : 'Processar Folha da Competência'}</span>
          </button>

          <button
            onClick={handleIntegrarContabilidade}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-md shadow-blue-900/30"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Integrar Folha na Contabilidade</span>
          </button>

          <button
            onClick={handleImprimirResumoA4}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Resumo Geral A4</span>
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

      {/* Grade de Holerites Calculados */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px] z-10">
            <tr>
              <th className="py-2.5 px-3 w-16 text-center">Matr.</th>
              <th className="py-2.5 px-3">Colaborador / Beneficiário</th>
              <th className="py-2.5 px-3 w-28">CPF</th>
              <th className="py-2.5 px-3 w-24 text-center">Vínculo</th>
              <th className="py-2.5 px-3 w-28 text-right">Salário Bruto</th>
              <th className="py-2.5 px-3 w-28 text-right">Desc. INSS</th>
              <th className="py-2.5 px-3 w-24 text-right">Desc. IRRF</th>
              <th className="py-2.5 px-3 w-28 text-right">Salário Líquido</th>
              <th className="py-2.5 px-3 w-24 text-right">FGTS 8%</th>
              <th className="py-2.5 px-3 w-28 text-center">Emissão A4</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[12px]">
            {colaboradores.filter(c => c.status === 'ATIVO').map((colab) => {
              const folha = folhas.find(f => f.colaboradorId === colab.id);

              return (
                <tr key={colab.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-center text-neutral-400">{colab.matricula}</td>
                  <td className="py-2.5 px-3 text-neutral-100 font-bold font-sans">
                    {colab.nome}
                    <span className="block text-[10px] text-neutral-400 font-normal">{colab.cargo}</span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300">{colab.cpf}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      colab.tipoVinculo === 'PRO_LABORE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {colab.tipoVinculo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-200">
                    R$ {(folha ? (folha.totalProventos ?? 0) : colab.salarioBase).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-400">
                    {folha ? `- R$ ${(folha.inssSegurado ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-400">
                    {folha && (folha.irrf ?? 0) > 0 ? `- R$ ${(folha.irrf ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Isento'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400 text-sm">
                    {folha ? `R$ ${(folha.salarioLiquido ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Pendente'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-400">
                    {folha ? `R$ ${(folha.fgts ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleImprimirHolerite(colab)}
                      disabled={!folha}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-200 rounded border border-white/10 text-xs flex items-center justify-center space-x-1 mx-auto transition"
                      title="Visualizar e Imprimir Holerite A4"
                    >
                      <Printer className="w-3 h-3 text-emerald-400" />
                      <span>Holerite</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer com Totais da Folha */}
      <div className="p-3 bg-[#181818] border-t border-white/10 flex items-center justify-between text-xs font-mono">
        <div className="text-neutral-400">
          Vínculos Calculados: <strong className="text-neutral-200 font-bold">{folhas.length}</strong>
        </div>
        <div className="flex items-center space-x-5">
          <span>Bruto: <strong className="text-neutral-100">R$ {totalBrutoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          <span>•</span>
          <span>Líquido: <strong className="text-emerald-400">R$ {totalLiquidoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          <span>•</span>
          <span>FGTS: <strong className="text-purple-400">R$ {totalFGTSGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>
    </div>
  );
};
