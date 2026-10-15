import React, { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { LancamentoPadrao, Empresa, ContaContabil, HistoricoPadrao } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

interface LancamentosPadraoModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  historicos: HistoricoPadrao[];
}

export const LancamentosPadraoModule: React.FC<LancamentosPadraoModuleProps> = ({
  empresa,
  contas,
  historicos
}) => {
  const [padroes, setPadroes] = useState<LancamentoPadrao[]>(dbService.getLancamentosPadrao(empresa.id));
  const [selectedPadrao, setSelectedPadrao] = useState<LancamentoPadrao | null>(padroes[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const contasAnaliticas = contas.filter(c => c.tipo === 'A');

  const handleNovo = () => {
    const proximoCodigo = padroes.reduce((max, p) => Math.max(max, p.codigo), 0) + 1;
    const novo: LancamentoPadrao = {
      id: Date.now(),
      empresaId: empresa.id,
      codigo: proximoCodigo,
      descricao: 'Novo Lançamento Padrão',
      contaDebitoId: contasAnaliticas[0]?.id,
      contaCreditoId: contasAnaliticas[1]?.id,
      historicoId: historicos[0]?.id,
      complemento: 'Ref. '
    };
    setSelectedPadrao(novo);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPadrao) return;
    dbService.saveLancamentoPadrao(selectedPadrao);
    setPadroes(dbService.getLancamentosPadrao(empresa.id));
    setFeedback('Lançamento padrão salvo com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExcluir = (id: number) => {
    if (window.confirm('Deseja excluir este template de lançamento padrão?')) {
      dbService.deleteLancamentoPadrao(id);
      const atualizados = dbService.getLancamentosPadrao(empresa.id);
      setPadroes(atualizados);
      setSelectedPadrao(atualizados[0] || null);
      setFeedback('Lançamento padrão excluído!');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filtered = padroes.filter(p => 
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.codigo).includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Repeat size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Lançamentos Padrão / Automáticos</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Modelos de Digitação Rápida
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Templates contábeis pré-configurados para aceleração da escrituração
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
            onClick={handleNovo}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition"
          >
            <Plus size={15} />
            <span>Novo Template</span>
          </button>
        </div>
      </div>

      {/* Grid 2 colunas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 overflow-hidden">
        {/* Lista (5 cols) */}
        <div className="md:col-span-5 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-[#1a1a1a]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por descrição ou código..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {filtered.map(item => {
              const isSelected = selectedPadrao?.id === item.id;
              const debitoConta = contas.find(c => c.id === item.contaDebitoId);
              const creditoConta = contas.find(c => c.id === item.contaCreditoId);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPadrao(item)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected ? 'bg-blue-900/30 border-blue-500/50' : 'bg-[#1c1c1c] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{item.descricao}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                      Cód: {item.codigo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                    <span className="text-blue-400 font-bold">D: {debitoConta?.codigoReduzido || 'N/A'}</span>
                    <ArrowRight size={10} className="text-neutral-500" />
                    <span className="text-indigo-400 font-bold">C: {creditoConta?.codigoReduzido || 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor (7 cols) */}
        <div className="md:col-span-7 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {selectedPadrao ? (
            <form onSubmit={handleSalvar} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-2">
                  Configuração do Modelo Contábil
                </h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Código de Atalho</label>
                    <input
                      type="number"
                      value={selectedPadrao.codigo}
                      onChange={e => setSelectedPadrao({ ...selectedPadrao, codigo: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Descrição do Modelo</label>
                    <input
                      type="text"
                      value={selectedPadrao.descricao}
                      onChange={e => setSelectedPadrao({ ...selectedPadrao, descricao: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-400 mb-1">Conta a Debitar Padrão</label>
                      <select
                        value={selectedPadrao.contaDebitoId || ''}
                        onChange={e => setSelectedPadrao({ ...selectedPadrao, contaDebitoId: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#141414] border border-blue-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Selecione a conta de débito...</option>
                        {contasAnaliticas.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.codigoReduzido} - {c.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-indigo-400 mb-1">Conta a Creditar Padrão</label>
                      <select
                        value={selectedPadrao.contaCreditoId || ''}
                        onChange={e => setSelectedPadrao({ ...selectedPadrao, contaCreditoId: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#141414] border border-indigo-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Selecione a conta de crédito...</option>
                        {contasAnaliticas.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.codigoReduzido} - {c.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Histórico Padrão Vinculado</label>
                    <select
                      value={selectedPadrao.historicoId || ''}
                      onChange={e => setSelectedPadrao({ ...selectedPadrao, historicoId: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Selecione o histórico...</option>
                      {historicos.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.codigo} - {h.descricao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Texto de Complemento Padrão</label>
                    <input
                      type="text"
                      value={selectedPadrao.complemento || ''}
                      onChange={e => setSelectedPadrao({ ...selectedPadrao, complemento: e.target.value })}
                      placeholder="ex: Ref. pagamento de NF nº "
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleExcluir(selectedPadrao.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
                >
                  <Trash2 size={15} />
                  <span>Excluir</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
                >
                  <Save size={15} />
                  <span>Salvar Modelo</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
              Selecione um template ou clique em "Novo Template" para configurar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
