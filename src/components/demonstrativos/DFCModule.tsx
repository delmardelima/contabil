import React, { useState } from 'react';
import { Empresa, DFCItem } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  BarChart2, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface DFCModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: {
    tipo: 'DFC';
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean; grupo?: string }[];
  }) => void;
}

export const DFCModule: React.FC<DFCModuleProps> = ({
  empresa,
  onOpenReportPreview
}) => {
  const [itens, setItens] = useState<DFCItem[]>(dbService.getDFC(empresa.id, empresa.exercicioAtivo));
  const [showNovoItemModal, setShowNovoItemModal] = useState<boolean>(false);
  const [novaDescricao, setNovaDescricao] = useState<string>('');
  const [novoValor, setNovoValor] = useState<string>('');
  const [novoGrupo, setNovoGrupo] = useState<'OPERACIONAL' | 'INVESTIMENTO' | 'FINANCIAMENTO'>('OPERACIONAL');

  // Cálculos dos Subtotais por Grupo
  const totalOperacional = itens
    .filter(i => i.grupo === 'OPERACIONAL')
    .reduce((acc, i) => acc + i.valor, 0);

  const totalInvestimento = itens
    .filter(i => i.grupo === 'INVESTIMENTO')
    .reduce((acc, i) => acc + i.valor, 0);

  const totalFinanciamento = itens
    .filter(i => i.grupo === 'FINANCIAMENTO')
    .reduce((acc, i) => acc + i.valor, 0);

  const variacaoLiquidaCaixa = totalOperacional + totalInvestimento + totalFinanciamento;

  const handleExportCSV = () => {
    const headers = ['Grupo de Atividade', 'Descrição da Linha', 'Valor Líquido (R$)'];
    const rows = itens.map(i => [
      i.grupo,
      i.descricao,
      i.valor.toFixed(2)
    ]);
    rows.push(['TOTAL', '(=) FLUXO DE CAIXA LÍQUIDO DAS ATIVIDADES OPERACIONAIS', totalOperacional.toFixed(2)]);
    rows.push(['TOTAL', '(=) FLUXO DE CAIXA LÍQUIDO DAS ATIVIDADES DE INVESTIMENTO', totalInvestimento.toFixed(2)]);
    rows.push(['TOTAL', '(=) FLUXO DE CAIXA LÍQUIDO DAS ATIVIDADES DE FINANCIAMENTO', totalFinanciamento.toFixed(2)]);
    rows.push(['TOTAL GERAL', '(=) AUMENTO / REDUÇÃO LÍQUIDA DE CAIXA E EQUIVALENTES', variacaoLiquidaCaixa.toFixed(2)]);

    exportToCSV(`DFC_${empresa.codigo}_${empresa.exercicioAtivo}.csv`, headers, rows);
  };

  const handleImprimirA4 = () => {
    if (onOpenReportPreview) {
      const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean; grupo?: string }[] = [];

      // Grupo 1: Operacionais
      linhas.push({ descricao: '1. FLUXO DE CAIXA DAS ATIVIDADES OPERACIONAIS', valor: 0, isHeader: true });
      itens.filter(i => i.grupo === 'OPERACIONAL').forEach(i => {
        linhas.push({ descricao: `  ${i.descricao}`, valor: i.valor });
      });
      linhas.push({ descricao: '(=) Caixa Líquido Gerado pelas Atividades Operacionais', valor: totalOperacional, isTotal: true });

      // Grupo 2: Investimentos
      linhas.push({ descricao: '2. FLUXO DE CAIXA DAS ATIVIDADES DE INVESTIMENTO', valor: 0, isHeader: true });
      itens.filter(i => i.grupo === 'INVESTIMENTO').forEach(i => {
        linhas.push({ descricao: `  ${i.descricao}`, valor: i.valor });
      });
      linhas.push({ descricao: '(=) Caixa Líquido Consumido nas Atividades de Investimento', valor: totalInvestimento, isTotal: true });

      // Grupo 3: Financiamentos
      linhas.push({ descricao: '3. FLUXO DE CAIXA DAS ATIVIDADES DE FINANCIAMENTO', valor: 0, isHeader: true });
      itens.filter(i => i.grupo === 'FINANCIAMENTO').forEach(i => {
        linhas.push({ descricao: `  ${i.descricao}`, valor: i.valor });
      });
      linhas.push({ descricao: '(=) Caixa Líquido das Atividades de Financiamento', valor: totalFinanciamento, isTotal: true });

      // Total Variação
      linhas.push({
        descricao: '(=) VARIAÇÃO LÍQUIDA NAS DISPONIBILIDADES DE CAIXA',
        valor: variacaoLiquidaCaixa,
        isTotal: true
      });

      onOpenReportPreview({
        tipo: 'DFC',
        titulo: 'DEMONSTRAÇÃO DOS FLUXOS DE CAIXA (D.F.C.) - MÉTODO INDIRETO',
        subtitulo: `Exercício Findo em 31/12/${empresa.exercicioAtivo} • NBC TG 03 (R3) e Pronunciamento Técnico CPC 03`,
        linhas
      });
    }
  };

  const handleAdicionarItem = () => {
    if (!novaDescricao.trim() || !novoValor) return;
    const num = parseFloat(novoValor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(num)) return;

    const novo: DFCItem = {
      id: Date.now(),
      empresaId: empresa.id,
      exercicio: empresa.exercicioAtivo,
      grupo: novoGrupo,
      descricao: novaDescricao.trim(),
      valor: num,
      ordem: itens.length + 1
    };

    const atualizados = [...itens, novo];
    setItens(atualizados);
    dbService.saveDFC(empresa.id, empresa.exercicioAtivo, atualizados);

    setShowNovoItemModal(false);
    setNovaDescricao('');
    setNovoValor('');
  };

  const handleExcluirItem = (id: number) => {
    const atualizados = itens.filter(i => i.id !== id);
    setItens(atualizados);
    dbService.saveDFC(empresa.id, empresa.exercicioAtivo, atualizados);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Demonstração do Fluxo de Caixa (DFC)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">NBC TG 03 / CPC 03</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Método Indireto: geração e destinação de disponibilidades financeiras por atividade.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNovoItemModal(true)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Adicionar Linha DFC</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleImprimirA4}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Folha A4 Oficial</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Tabela */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar flex justify-center">
        <div className="w-full max-w-4xl bg-[#181818] rounded-xl border border-white/10 p-6 space-y-6 shadow-xl">
          {/* Cabeçalho Formal */}
          <div className="text-center pb-4 border-b border-white/10">
            <h3 className="text-base font-bold text-neutral-100">{empresa.razaoSocial}</h3>
            <p className="text-xs text-neutral-400 font-mono">CNPJ: {empresa.cnpj}</p>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mt-2">
              Demonstração do Fluxo de Caixa (D.F.C.) - Método Indireto
            </h4>
            <p className="text-[11px] text-neutral-500">Período Findo em 31 de Dezembro de {empresa.exercicioAtivo} (Em Reais - R$)</p>
          </div>

          {/* 1. Atividades Operacionais */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-blue-400 border-b border-blue-500/20 pb-1 uppercase tracking-wide">
              1. Fluxo de Caixa das Atividades Operacionais
            </div>
            <div className="divide-y divide-white/5 text-xs font-mono">
              {itens.filter(i => i.grupo === 'OPERACIONAL').map(item => (
                <div key={item.id} className="py-2 px-2 flex items-center justify-between hover:bg-white/5 transition rounded">
                  <span className="font-sans text-neutral-300">{item.descricao}</span>
                  <div className="flex items-center space-x-3">
                    <span className={item.valor < 0 ? 'text-rose-400 font-semibold' : 'text-neutral-200'}>
                      {item.valor < 0 ? `(${Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => handleExcluirItem(item.id)} className="text-neutral-600 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="py-2 px-2 flex justify-between font-bold text-neutral-100 bg-neutral-900/60 rounded mt-1">
                <span className="font-sans">(=) Caixa Líquido Gerado pelas Atividades Operacionais</span>
                <span className={totalOperacional >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  R$ {totalOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Atividades de Investimento */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400 border-b border-amber-500/20 pb-1 uppercase tracking-wide">
              2. Fluxo de Caixa das Atividades de Investimento
            </div>
            <div className="divide-y divide-white/5 text-xs font-mono">
              {itens.filter(i => i.grupo === 'INVESTIMENTO').map(item => (
                <div key={item.id} className="py-2 px-2 flex items-center justify-between hover:bg-white/5 transition rounded">
                  <span className="font-sans text-neutral-300">{item.descricao}</span>
                  <div className="flex items-center space-x-3">
                    <span className={item.valor < 0 ? 'text-rose-400 font-semibold' : 'text-neutral-200'}>
                      {item.valor < 0 ? `(${Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => handleExcluirItem(item.id)} className="text-neutral-600 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="py-2 px-2 flex justify-between font-bold text-neutral-100 bg-neutral-900/60 rounded mt-1">
                <span className="font-sans">(=) Caixa Líquido das Atividades de Investimento</span>
                <span className={totalInvestimento >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  R$ {totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Atividades de Financiamento */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-purple-400 border-b border-purple-500/20 pb-1 uppercase tracking-wide">
              3. Fluxo de Caixa das Atividades de Financiamento
            </div>
            <div className="divide-y divide-white/5 text-xs font-mono">
              {itens.filter(i => i.grupo === 'FINANCIAMENTO').map(item => (
                <div key={item.id} className="py-2 px-2 flex items-center justify-between hover:bg-white/5 transition rounded">
                  <span className="font-sans text-neutral-300">{item.descricao}</span>
                  <div className="flex items-center space-x-3">
                    <span className={item.valor < 0 ? 'text-rose-400 font-semibold' : 'text-neutral-200'}>
                      {item.valor < 0 ? `(${Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => handleExcluirItem(item.id)} className="text-neutral-600 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="py-2 px-2 flex justify-between font-bold text-neutral-100 bg-neutral-900/60 rounded mt-1">
                <span className="font-sans">(=) Caixa Líquido das Atividades de Financiamento</span>
                <span className={totalFinanciamento >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  R$ {totalFinanciamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Fechamento Geral: Variação Líquida de Caixa */}
          <div className="p-4 bg-neutral-900/90 rounded-xl border border-emerald-500/30 flex items-center justify-between font-bold">
            <div>
              <div className="text-sm text-neutral-100 font-sans">(=) VARIAÇÃO LÍQUIDA DE CAIXA E EQUIVALENTES</div>
              <div className="text-[11px] text-neutral-400 font-normal">Aumento ou Redução Total das Disponibilidades no Exercício</div>
            </div>
            <div className={`text-lg font-mono ${variacaoLiquidaCaixa >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {variacaoLiquidaCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Item DFC */}
      {showNovoItemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-neutral-100">Adicionar Linha na D.F.C.</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Grupo de Atividade:</label>
                <select
                  value={novoGrupo}
                  onChange={(e) => setNovoGrupo(e.target.value as any)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-2 text-neutral-200 outline-none"
                >
                  <option value="OPERACIONAL">Atividades Operacionais</option>
                  <option value="INVESTIMENTO">Atividades de Investimento</option>
                  <option value="FINANCIAMENTO">Atividades de Financiamento</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Descrição do Fluxo:</label>
                <input
                  type="text"
                  placeholder="Ex: Aquisição de Imobilizado / Máquinas"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Valor Líquido (use negativo para desembolso):</label>
                <input
                  type="text"
                  placeholder="Ex: -45000,00 ou 12000,00"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-100 font-mono text-right outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowNovoItemModal(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarItem}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
              >
                Salvar Linha DFC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
