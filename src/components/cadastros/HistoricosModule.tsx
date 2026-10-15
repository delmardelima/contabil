import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  Check 
} from 'lucide-react';
import { HistoricoPadrao, Empresa } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

interface HistoricosModuleProps {
  empresa: Empresa;
}

export const HistoricosModule: React.FC<HistoricosModuleProps> = ({ empresa }) => {
  const [historicos, setHistoricos] = useState<HistoricoPadrao[]>(dbService.getHistoricos(empresa.id));
  const [selectedHistorico, setSelectedHistorico] = useState<HistoricoPadrao | null>(historicos[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleNovo = () => {
    const proximoCodigo = historicos.reduce((max, h) => Math.max(max, h.codigo), 0) + 1;
    const novo: HistoricoPadrao = {
      id: Date.now(),
      empresaId: empresa.id,
      codigo: proximoCodigo,
      descricao: 'Novo Histórico Padrão'
    };
    setSelectedHistorico(novo);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHistorico) return;
    dbService.saveHistorico(selectedHistorico);
    setHistoricos(dbService.getHistoricos(empresa.id));
    setFeedback('Histórico padrão salvo com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExcluir = (id: number) => {
    if (window.confirm('Deseja excluir este histórico padrão?')) {
      dbService.deleteHistorico(id);
      const atualizados = dbService.getHistoricos(empresa.id);
      setHistoricos(atualizados);
      setSelectedHistorico(atualizados[0] || null);
      setFeedback('Histórico excluído!');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filtered = historicos.filter(h => 
    h.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(h.codigo).includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Históricos Padrão do Escritório</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                {empresa.razaoSocial}
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Códigos de histórico pré-cadastrados para uso nas partidas do Livro Diário e Razão
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
            <span>Novo Histórico</span>
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

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filtered.map(item => {
              const isSelected = selectedHistorico?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedHistorico(item)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected ? 'bg-blue-900/30 border-blue-500/50' : 'bg-[#1c1c1c] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-400 font-bold">
                      #{item.codigo}
                    </span>
                    <span className="text-neutral-200 font-medium">
                      {item.descricao}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor (7 cols) */}
        <div className="md:col-span-7 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {selectedHistorico ? (
            <form onSubmit={handleSalvar} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-2">
                  Editar Histórico Padrão
                </h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Código</label>
                    <input
                      type="number"
                      value={selectedHistorico.codigo}
                      onChange={e => setSelectedHistorico({ ...selectedHistorico, codigo: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Descrição do Histórico</label>
                    <input
                      type="text"
                      value={selectedHistorico.descricao}
                      onChange={e => setSelectedHistorico({ ...selectedHistorico, descricao: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleExcluir(selectedHistorico.id)}
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
                  <span>Salvar Histórico</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
              Selecione um histórico ou clique em "Novo" para cadastrar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
