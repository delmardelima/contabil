import React, { useState } from 'react';
import { 
  PieChart, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  Folder, 
  FileText, 
  Check 
} from 'lucide-react';
import { CentroCusto, Empresa } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

interface CentrosCustoModuleProps {
  empresa: Empresa;
}

export const CentrosCustoModule: React.FC<CentrosCustoModuleProps> = ({ empresa }) => {
  const [centros, setCentros] = useState<CentroCusto[]>(dbService.getCentrosCusto(empresa.id));
  const [selectedCentro, setSelectedCentro] = useState<CentroCusto | null>(centros[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleNovo = () => {
    const novo: CentroCusto = {
      id: Date.now(),
      empresaId: empresa.id,
      codigo: '01.03',
      nome: 'Novo Centro de Custo',
      tipo: 'A'
    };
    setSelectedCentro(novo);
    setIsEditing(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCentro) return;
    dbService.saveCentroCusto(selectedCentro);
    setCentros(dbService.getCentrosCusto(empresa.id));
    setIsEditing(false);
    setFeedback('Centro de custo salvo com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExcluir = (id: number) => {
    if (window.confirm('Deseja excluir este centro de custo?')) {
      dbService.deleteCentroCusto(id);
      const atualizados = dbService.getCentrosCusto(empresa.id);
      setCentros(atualizados);
      setSelectedCentro(atualizados[0] || null);
      setIsEditing(false);
      setFeedback('Centro de custo excluído!');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filtered = centros.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.codigo.includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <PieChart size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Centros de Custo & Departamentos</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                {empresa.razaoSocial}
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Estrutura para rateio gerencial e apropriação de despesas operacionais
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
            <span>Novo Centro de Custo</span>
          </button>
        </div>
      </div>

      {/* Grid de 2 colunas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 overflow-hidden">
        {/* Lista Hierárquica (5 cols) */}
        <div className="md:col-span-5 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-[#1a1a1a]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar código ou descrição..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filtered.map(item => {
              const isSelected = selectedCentro?.id === item.id;
              const isSintetico = item.tipo === 'S';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedCentro(item);
                    setIsEditing(false);
                  }}
                  className={`px-3 py-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected ? 'bg-blue-900/30 border-blue-500/50' : 'bg-[#1c1c1c] border-white/5 hover:border-white/15'
                  }`}
                  style={{ paddingLeft: `${item.codigo.split('.').length * 12}px` }}
                >
                  <div className="flex items-center gap-2">
                    {isSintetico ? (
                      <Folder size={14} className="text-amber-400 flex-shrink-0" />
                    ) : (
                      <FileText size={14} className="text-blue-400 flex-shrink-0" />
                    )}
                    <span className="font-mono text-neutral-400">{item.codigo}</span>
                    <span className={`truncate ${isSintetico ? 'font-bold text-white' : 'text-neutral-200'}`}>
                      {item.nome}
                    </span>
                  </div>

                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isSintetico ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {isSintetico ? 'Sintético' : 'Analítico'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulário de Detalhes (7 cols) */}
        <div className="md:col-span-7 bg-[#181818] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {selectedCentro ? (
            <form onSubmit={handleSalvar} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-2">
                  {isEditing ? 'Cadastro / Edição de Centro de Custo' : 'Detalhes do Centro de Custo'}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Código Hierárquico</label>
                    <input
                      type="text"
                      value={selectedCentro.codigo}
                      onChange={e => setSelectedCentro({ ...selectedCentro, codigo: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo de Registro</label>
                    <select
                      value={selectedCentro.tipo}
                      onChange={e => setSelectedCentro({ ...selectedCentro, tipo: e.target.value as 'S' | 'A' })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="S">Sintético (Totalizador / Agrupador)</option>
                      <option value="A">Analítico (Aceita Lançamento)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Nome / Descrição do Departamento</label>
                    <input
                      type="text"
                      value={selectedCentro.nome}
                      onChange={e => setSelectedCentro({ ...selectedCentro, nome: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleExcluir(selectedCentro.id)}
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
                  <span>Salvar Centro de Custo</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
              Selecione um centro de custo ou clique em "Novo" para cadastrar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
