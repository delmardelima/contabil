import React, { useState } from 'react';
import { ContaContabil, TipoConta, NaturezaConta } from '../../types/contabil';
import { FolderTree, Plus, Search, Trash2, Edit2, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

interface PlanoContasModuleProps {
  contas: ContaContabil[];
  empresaId: number;
  mascaraPlano: string;
  onSaveConta: (conta: ContaContabil) => void;
  onDeleteConta: (id: number) => void;
}

export const PlanoContasModule: React.FC<PlanoContasModuleProps> = ({
  contas,
  empresaId,
  mascaraPlano,
  onSaveConta,
  onDeleteConta
}) => {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'S' | 'A'>('TODOS');
  const [showModal, setShowModal] = useState(false);

  // Form de nova conta
  const [novaClassificacao, setNovaClassificacao] = useState('');
  const [novoReduzido, setNovoReduzido] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoTipo, setNovoTipo] = useState<TipoConta>('A');
  const [novaNatureza, setNovaNatureza] = useState<NaturezaConta>('D');
  const [novoGrau, setNovoGrau] = useState<number>(5);
  const [formErro, setFormErro] = useState('');

  const contasFiltradas = contas
    .filter(c => {
      if (filtroTipo !== 'TODOS' && c.tipo !== filtroTipo) return false;
      if (!busca) return true;
      const b = busca.toLowerCase();
      return (
        c.nome.toLowerCase().includes(b) ||
        c.classificacao.includes(b) ||
        c.codigoReduzido.toString().includes(b)
      );
    })
    .sort((a, b) => a.classificacao.localeCompare(b.classificacao, undefined, { numeric: true }));

  const handleSalvarConta = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErro('');

    if (!novaClassificacao || !novoNome || !novoReduzido) {
      setFormErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const codRed = parseInt(novoReduzido, 10);
    if (isNaN(codRed)) {
      setFormErro('Código reduzido inválido.');
      return;
    }

    onSaveConta({
      id: Date.now(),
      empresaId,
      classificacao: novaClassificacao,
      codigoReduzido: codRed,
      nome: novoNome,
      tipo: novoTipo,
      natureza: novaNatureza,
      grau: novoGrau,
      saldoAnterior: 0
    });

    setShowModal(false);
    setNovaClassificacao('');
    setNovoReduzido('');
    setNovoNome('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Barra de Filtros e Adicionar */}
      <div className="px-4 py-3 bg-[#1c1c1c] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-semibold text-neutral-300">
            <FolderTree className="w-4 h-4 text-blue-400" />
            <span>Plano de Contas Hierárquico</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Máscara */}
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <span>Máscara Contábil:</span>
            <span className="font-mono font-bold text-blue-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/5">
              {mascaraPlano}
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Filtro Sintética / Analítica */}
          <div className="flex items-center bg-neutral-900 rounded p-0.5 border border-white/10">
            <button
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-2 py-0.5 rounded ${filtroTipo === 'TODOS' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
            >
              Todas ({contas.length})
            </button>
            <button
              onClick={() => setFiltroTipo('S')}
              className={`px-2 py-0.5 rounded ${filtroTipo === 'S' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
            >
              Sintéticas
            </button>
            <button
              onClick={() => setFiltroTipo('A')}
              className={`px-2 py-0.5 rounded ${filtroTipo === 'A' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
            >
              Analíticas
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Buscar conta por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-neutral-900 border border-white/10 rounded pl-8 pr-3 py-1 text-xs text-neutral-200 outline-none w-60 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Tabela do Plano de Contas */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-900 border-b border-white/10 text-neutral-400 font-medium">
              <tr>
                <th className="py-2.5 px-3 w-40">Classificação</th>
                <th className="py-2.5 px-2 w-16 text-center">Reduzido</th>
                <th className="py-2.5 px-3">Descrição da Conta</th>
                <th className="py-2.5 px-2 w-16 text-center">Tipo</th>
                <th className="py-2.5 px-2 w-16 text-center">Natureza</th>
                <th className="py-2.5 px-2 w-16 text-center">Grau</th>
                <th className="py-2.5 px-3 w-32 text-right">Saldo Anterior</th>
                <th className="py-2.5 px-2 w-16 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {contasFiltradas.map((c) => {
                const isSintetica = c.tipo === 'S';
                const padding = (c.grau - 1) * 16;

                return (
                  <tr key={c.id} className={`hover:bg-white/[0.02] ${isSintetica ? 'bg-neutral-900/40 font-semibold' : ''}`}>
                    <td className="py-2 px-3 font-mono text-neutral-400">{c.classificacao}</td>
                    <td className="py-2 px-2 text-center font-mono text-neutral-300">
                      {c.tipo === 'A' ? c.codigoReduzido : '-'}
                    </td>
                    <td className="py-2 px-3">
                      <div style={{ paddingLeft: `${padding}px` }} className="flex items-center space-x-1.5">
                        <span className={isSintetica ? 'text-white' : 'text-neutral-300'}>{c.nome}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        isSintetica ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {isSintetica ? 'Sintética' : 'Analítica'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-neutral-300">
                      {c.natureza === 'D' ? 'D (Devedora)' : 'C (Credora)'}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-neutral-500">{c.grau}</td>
                    <td className="py-2 px-3 text-right font-mono text-neutral-400">
                      {c.saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => onDeleteConta(c.id)}
                        className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded"
                        title="Excluir Conta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Conta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSalvarConta} className="w-full max-w-md bg-[#202020] border border-white/10 rounded-xl shadow-2xl p-5 text-xs space-y-3">
            <h3 className="font-bold text-sm text-neutral-100 border-b border-white/10 pb-2">
              Cadastrar Nova Conta no Plano
            </h3>

            {formErro && (
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs">
                {formErro}
              </div>
            )}

            <div>
              <label className="block text-neutral-400 mb-1">Classificação Contábil (Máscara)</label>
              <input
                type="text"
                placeholder="Ex: 1.01.01.001.0005"
                value={novaClassificacao}
                onChange={(e) => setNovaClassificacao(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 mb-1">Código Reduzido</label>
                <input
                  type="number"
                  placeholder="Ex: 105"
                  value={novoReduzido}
                  onChange={(e) => setNovoReduzido(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 font-mono outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Grau Hierárquico</label>
                <select
                  value={novoGrau}
                  onChange={(e) => setNovoGrau(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none"
                >
                  <option value={1}>Grau 1</option>
                  <option value={2}>Grau 2</option>
                  <option value={3}>Grau 3</option>
                  <option value={4}>Grau 4</option>
                  <option value={5}>Grau 5 (Analítica)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Nome / Descrição da Conta</label>
              <input
                type="text"
                placeholder="Ex: Banco Santander S.A. - C/C"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 mb-1">Tipo de Conta</label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value as TipoConta)}
                  className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none"
                >
                  <option value="A">Analítica (Recebe Lançamentos)</option>
                  <option value="S">Sintética (Totalizadora)</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Natureza do Saldo</label>
                <select
                  value={novaNatureza}
                  onChange={(e) => setNovaNatureza(e.target.value as NaturezaConta)}
                  className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none"
                >
                  <option value="D">Devedora (Ativo / Custos / Despesas)</option>
                  <option value="C">Credora (Passivo / PL / Receitas)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Salvar Conta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
