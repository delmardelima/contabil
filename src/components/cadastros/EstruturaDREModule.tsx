import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Save, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Percent, 
  Calculator 
} from 'lucide-react';
import { DREEstruturaLinha, Empresa } from '../../types/contabil';

interface EstruturaDREModuleProps {
  empresa: Empresa;
}

const DEFAULT_ESTRUTURA_DRE: DREEstruturaLinha[] = [
  { id: 1, empresaId: 1, ordem: 1, descricao: 'RECEITA OPERACIONAL BRUTA', tipoLinha: 'CONTA', operacao: 'SOMA', prefixoContas: '3.01.01', isBasePercentual: true },
  { id: 2, empresaId: 1, ordem: 2, descricao: '(-) Deduções da Receita Bruta (Impostos & Descontos)', tipoLinha: 'CONTA', operacao: 'SUBTRAI', prefixoContas: '3.01.02', isBasePercentual: false },
  { id: 3, empresaId: 1, ordem: 3, descricao: '(=) RECEITA OPERACIONAL LÍQUIDA', tipoLinha: 'SUBTOTAL', operacao: 'SOMA', isBasePercentual: false },
  { id: 4, empresaId: 1, ordem: 4, descricao: '(-) Custos dos Serviços Prestados / Mercadorias', tipoLinha: 'CONTA', operacao: 'SUBTRAI', prefixoContas: '4.01.01', isBasePercentual: false },
  { id: 5, empresaId: 1, ordem: 5, descricao: '(=) LUCRO BRUTO OPERACIONAL', tipoLinha: 'SUBTOTAL', operacao: 'SOMA', isBasePercentual: false },
  { id: 6, empresaId: 1, ordem: 6, descricao: '(-) Despesas Administrativas e Gerais', tipoLinha: 'CONTA', operacao: 'SUBTRAI', prefixoContas: '4.01.02', isBasePercentual: false },
  { id: 7, empresaId: 1, ordem: 7, descricao: '(-) Despesas Comerciais e de Pessoal', tipoLinha: 'CONTA', operacao: 'SUBTRAI', prefixoContas: '4.01.03', isBasePercentual: false },
  { id: 8, empresaId: 1, ordem: 8, descricao: '(+/-) Resultado Financeiro Líquido', tipoLinha: 'CONTA', operacao: 'SOMA', prefixoContas: '4.01.04', isBasePercentual: false },
  { id: 9, empresaId: 1, ordem: 9, descricao: '(=) RESULTADO OPERACIONAL ANTES DOS TRIBUTOS', tipoLinha: 'SUBTOTAL', operacao: 'SOMA', isBasePercentual: false },
  { id: 10, empresaId: 1, ordem: 10, descricao: '(-) Provisão para IRPJ e CSLL', tipoLinha: 'CONTA', operacao: 'SUBTRAI', prefixoContas: '4.01.05', isBasePercentual: false },
  { id: 11, empresaId: 1, ordem: 11, descricao: '(=) LUCRO OU PREJUÍZO LÍQUIDO DO EXERCÍCIO', tipoLinha: 'TOTAL_GERAL', operacao: 'SOMA', isBasePercentual: false }
];

export const EstruturaDREModule: React.FC<EstruturaDREModuleProps> = ({ empresa }) => {
  const [linhas, setLinhas] = useState<DREEstruturaLinha[]>(() => {
    const saved = localStorage.getItem(`contabil_estrutura_dre_${empresa.id}`);
    return saved ? JSON.parse(saved) : DEFAULT_ESTRUTURA_DRE;
  });

  const [selectedLinha, setSelectedLinha] = useState<DREEstruturaLinha | null>(linhas[0] || null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSalvarTudo = () => {
    localStorage.setItem(`contabil_estrutura_dre_${empresa.id}`, JSON.stringify(linhas));
    setFeedback('Estrutura da DRE gravada com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAdicionarLinha = () => {
    const novaLinha: DREEstruturaLinha = {
      id: Date.now(),
      empresaId: empresa.id,
      ordem: linhas.length + 1,
      descricao: 'Nova Linha de Demonstrativo',
      tipoLinha: 'CONTA',
      operacao: 'SOMA',
      prefixoContas: '4.01',
      isBasePercentual: false
    };
    const atualizadas = [...linhas, novaLinha];
    setLinhas(atualizadas);
    setSelectedLinha(novaLinha);
  };

  const handleExcluirLinha = (id: number) => {
    const atualizadas = linhas.filter(l => l.id !== id).map((l, idx) => ({ ...l, ordem: idx + 1 }));
    setLinhas(atualizadas);
    setSelectedLinha(atualizadas[0] || null);
  };

  const moverLinha = (index: number, direcao: 'up' | 'down') => {
    if ((direcao === 'up' && index === 0) || (direcao === 'down' && index === linhas.length - 1)) return;
    const targetIdx = direcao === 'up' ? index - 1 : index + 1;
    const clone = [...linhas];
    const temp = clone[index];
    clone[index] = clone[targetIdx];
    clone[targetIdx] = temp;
    const reordenadas = clone.map((l, idx) => ({ ...l, ordem: idx + 1 }));
    setLinhas(reordenadas);
  };

  const setBasePercentual = (id: number) => {
    const atualizadas = linhas.map(l => ({
      ...l,
      isBasePercentual: l.id === id
    }));
    setLinhas(atualizadas);
    if (selectedLinha && selectedLinha.id === id) {
      setSelectedLinha({ ...selectedLinha, isBasePercentual: true });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Estrutura da D.R.E. (Construtor Dedutivo)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Padrão contabil.exe
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Configure as linhas dedutivas, sub-totais e a linha base de 100% da Análise Vertical (AV%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {feedback && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <Check size={14} />
              <span>{feedback}</span>
            </div>
          )}

          <button
            onClick={handleAdicionarLinha}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/15 text-neutral-200 border border-white/10 transition"
          >
            <Plus size={14} />
            <span>Adicionar Linha</span>
          </button>

          <button
            onClick={handleSalvarTudo}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
          >
            <Save size={15} />
            <span>Salvar Estrutura</span>
          </button>
        </div>
      </div>

      {/* Grid: Tabela de Linhas + Editor de Linha */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 overflow-hidden">
        {/* Tabela de Linhas (8 cols) */}
        <div className="md:col-span-8 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 bg-[#1a1a1a] border-b border-white/10 flex justify-between items-center text-xs text-neutral-400 font-semibold uppercase">
            <span>Sequência das Linhas da DRE</span>
            <span>{linhas.length} Linhas Configuradas</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#202020] text-neutral-400 uppercase text-[10px] font-semibold sticky top-0 border-b border-white/10 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-16 text-center">Ordem</th>
                  <th className="py-2.5 px-3">Descrição da Linha</th>
                  <th className="py-2.5 px-3 w-28">Tipo</th>
                  <th className="py-2.5 px-3 w-24">Operação</th>
                  <th className="py-2.5 px-3 w-28">Grupo / Conta</th>
                  <th className="py-2.5 px-3 w-20 text-center">Base AV%</th>
                  <th className="py-2.5 px-3 w-24 text-center">Mover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {linhas.map((linha, index) => {
                  const isSelected = selectedLinha?.id === linha.id;

                  return (
                    <tr
                      key={linha.id}
                      onClick={() => setSelectedLinha(linha)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-blue-900/30 font-medium' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="py-2 px-3 font-mono text-center text-neutral-400 font-bold">
                        {linha.ordem}
                      </td>
                      <td className="py-2 px-3 text-neutral-200">
                        <span className={linha.tipoLinha !== 'CONTA' ? 'font-bold uppercase text-white' : ''}>
                          {linha.descricao}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${
                          linha.tipoLinha === 'TOTAL_GERAL' 
                            ? 'bg-emerald-500/20 text-emerald-400 font-bold' 
                            : linha.tipoLinha === 'SUBTOTAL'
                              ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                              : 'bg-white/10 text-neutral-300'
                        }`}>
                          {linha.tipoLinha}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-center">
                        <span className={linha.operacao === 'SUBTRAI' ? 'text-rose-400' : 'text-emerald-400'}>
                          {linha.operacao === 'SUBTRAI' ? '(-) SUB' : '(+) SOMA'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-neutral-300">
                        {linha.prefixoContas || '—'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {linha.isBasePercentual ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                            100%
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBasePercentual(linha.id);
                            }}
                            className="text-[10px] text-neutral-500 hover:text-blue-400"
                            title="Definir como Base 100% AV"
                          >
                            Definir
                          </button>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moverLinha(index, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 hover:bg-white/10 rounded text-neutral-400 disabled:opacity-30"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moverLinha(index, 'down');
                            }}
                            disabled={index === linhas.length - 1}
                            className="p-1 hover:bg-white/10 rounded text-neutral-400 disabled:opacity-30"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Editor de Linha Selecionada (4 cols) */}
        <div className="md:col-span-4 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {selectedLinha ? (
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2 flex items-center justify-between">
                  <span>Propriedades da Linha #{selectedLinha.ordem}</span>
                  <button
                    onClick={() => handleExcluirLinha(selectedLinha.id)}
                    className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                    title="Excluir Linha"
                  >
                    <Trash2 size={16} />
                  </button>
                </h3>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Título / Descrição</label>
                  <input
                    type="text"
                    value={selectedLinha.descricao}
                    onChange={e => {
                      const updated = { ...selectedLinha, descricao: e.target.value };
                      setSelectedLinha(updated);
                      setLinhas(linhas.map(l => l.id === updated.id ? updated : l));
                    }}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo da Linha</label>
                    <select
                      value={selectedLinha.tipoLinha}
                      onChange={e => {
                        const updated = { ...selectedLinha, tipoLinha: e.target.value as any };
                        setSelectedLinha(updated);
                        setLinhas(linhas.map(l => l.id === updated.id ? updated : l));
                      }}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="CONTA">CONTA (Vinculada)</option>
                      <option value="SUBTOTAL">SUBTOTAL (Acumulado)</option>
                      <option value="TOTAL_GERAL">TOTAL GERAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Operação Dedutiva</label>
                    <select
                      value={selectedLinha.operacao}
                      onChange={e => {
                        const updated = { ...selectedLinha, operacao: e.target.value as any };
                        setSelectedLinha(updated);
                        setLinhas(linhas.map(l => l.id === updated.id ? updated : l));
                      }}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="SOMA">(+) Soma</option>
                      <option value="SUBTRAI">(-) Subtrai (Deduz)</option>
                    </select>
                  </div>
                </div>

                {selectedLinha.tipoLinha === 'CONTA' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Prefixo de Classificação Contábil
                    </label>
                    <input
                      type="text"
                      value={selectedLinha.prefixoContas || ''}
                      onChange={e => {
                        const updated = { ...selectedLinha, prefixoContas: e.target.value };
                        setSelectedLinha(updated);
                        setLinhas(linhas.map(l => l.id === updated.id ? updated : l));
                      }}
                      placeholder="ex: 3.01 ou 4.01.02"
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Todas as contas do plano que iniciam com este prefixo serão consolidadas nesta linha.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-white/10">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLinha.isBasePercentual}
                      onChange={() => setBasePercentual(selectedLinha.id)}
                      className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-medium text-white">Base 100% da Análise Vertical</p>
                      <p className="text-[10px] text-neutral-400">Normalmente a Receita Operacional Bruta ou Líquida.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-black/30 rounded-lg text-neutral-400 text-xs flex items-center gap-2">
                <Calculator size={16} className="text-blue-400" />
                <span>Calculado automaticamente na emissão da DRE.</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
              Selecione uma linha para editar suas propriedades.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
