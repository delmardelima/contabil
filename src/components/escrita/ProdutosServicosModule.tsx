import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  Check, 
  X, 
  Tag, 
  DollarSign, 
  Layers, 
  Filter
} from 'lucide-react';
import { Empresa, ProdutoServico, ContaContabil } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  maskNCM, 
  maskCEST, 
  formatCurrency, 
  formatPercent,
  unmask 
} from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';

interface ProdutosServicosModuleProps {
  empresaAtiva: Empresa;
}

const TIPOS_SPED: Record<string, { label: string; cor: string }> = {
  '00': { label: '00 - Mercadoria Revenda', cor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  '01': { label: '01 - Matéria-Prima', cor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  '02': { label: '02 - Embalagem', cor: 'bg-neutral-800 text-neutral-300 border-white/10' },
  '03': { label: '03 - Produto em Processo', cor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  '04': { label: '04 - Produto Acabado', cor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  '05': { label: '05 - Subproduto', cor: 'bg-neutral-800 text-neutral-300 border-white/10' },
  '06': { label: '06 - Produto Intermediário', cor: 'bg-neutral-800 text-neutral-300 border-white/10' },
  '07': { label: '07 - Material Uso/Consumo', cor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  '08': { label: '08 - Ativo Imobilizado', cor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  '09': { label: '09 - Serviços', cor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  '99': { label: '99 - Outras', cor: 'bg-neutral-800 text-neutral-400 border-white/10' }
};

export const ProdutosServicosModule: React.FC<ProdutosServicosModuleProps> = ({ empresaAtiva }) => {
  const [produtos, setProdutos] = useState<ProdutoServico[]>(
    dbService.getProdutos(empresaAtiva.id)
  );
  const [contas] = useState<ContaContabil[]>(
    dbService.getContas(empresaAtiva.id).filter(c => c.tipo === 'A')
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipoSped, setFiltroTipoSped] = useState<string>('TODOS');
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<ProdutoServico | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  React.useEffect(() => {
    setProdutos(dbService.getProdutos(empresaAtiva.id));
  }, [empresaAtiva.id]);

  const filteredProdutos = produtos.filter(prod => {
    const matchFiltro = filtroTipoSped === 'TODOS' || prod.tipoItemSped === filtroTipoSped;
    const termo = searchTerm.toLowerCase();
    const matchBusca = 
      prod.descricao.toLowerCase().includes(termo) ||
      prod.codigo.toLowerCase().includes(termo) ||
      prod.ncm.includes(termo) ||
      (prod.codigoBarras || '').includes(termo);
    return matchFiltro && matchBusca;
  });

  const handleNovoProduto = () => {
    const proximoNum = produtos.length + 1;
    const novo: ProdutoServico = {
      id: Date.now(),
      empresaId: empresaAtiva.id,
      codigo: `PROD-${String(proximoNum).padStart(3, '0')}`,
      descricao: '',
      tipoItemSped: '00',
      ncm: '',
      unidadeMedida: 'UN',
      cstICMSPadrao: '00',
      cstPISCOFINSPadrao: '01',
      aliquotaICMS: 18.0,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      precoUnitarioVenda: 0,
      precoUnitarioCusto: 0,
      ativo: true
    };
    setProdutoEmEdicao(novo);
    setModalAberto(true);
  };

  const handleEditar = (prod: ProdutoServico) => {
    setProdutoEmEdicao({ ...prod });
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEmEdicao) return;

    dbService.saveProduto(produtoEmEdicao);
    setProdutos(dbService.getProdutos(empresaAtiva.id));
    setModalAberto(false);
    setProdutoEmEdicao(null);
    setMensagemSucesso('Item fiscal salvo com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleExcluir = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      dbService.deleteProduto(id);
      setProdutos(dbService.getProdutos(empresaAtiva.id));
      setMensagemSucesso('Item excluído com sucesso.');
      setTimeout(() => setMensagemSucesso(null), 3000);
    }
  };

  const handleExportarCSV = () => {
    const headers = [
      'Código', 'Descrição', 'Tipo SPED', 'NCM', 'CEST', 'Unidade', 
      'Pr. Venda (R$)', 'Pr. Custo (R$)', 'Alíq ICMS (%)', 'Alíq PIS (%)', 'Alíq COFINS (%)', 'Status'
    ];
    const rows = filteredProdutos.map(p => [
      p.codigo,
      p.descricao,
      TIPOS_SPED[p.tipoItemSped]?.label || p.tipoItemSped,
      p.ncm,
      p.cest || '',
      p.unidadeMedida,
      p.precoUnitarioVenda || 0,
      p.precoUnitarioCusto || 0,
      p.aliquotaICMS || 0,
      p.aliquotaPIS || 0,
      p.aliquotaCOFINS || 0,
      p.ativo ? 'Ativo' : 'Inativo'
    ]);
    exportToCSV(`SPED_0200_Itens_${empresaAtiva.codigo}`, rows, headers);
  };

  // Métricas
  const totalMercadorias = produtos.filter(p => p.tipoItemSped === '00').length;
  const totalServicos = produtos.filter(p => p.tipoItemSped === '09').length;
  const totalImobilizado = produtos.filter(p => p.tipoItemSped === '08').length;
  const totalUsoConsumo = produtos.filter(p => p.tipoItemSped === '07').length;

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Produtos, Mercadorias & Serviços</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
                SPED Registro 0200
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Tabela de itens, classificação NCM/CEST, tributação padrão e amarração com contas contábeis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mensagemSucesso && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <Check size={14} />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-neutral-200 border border-white/10 transition"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleNovoProduto}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 transition active:scale-95"
          >
            <Plus size={15} />
            <span>Novo Item (F2)</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-shrink-0">
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Total de Itens</span>
            <span className="text-xl font-bold font-mono text-white">{produtos.length}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400">
            <Package size={16} />
          </div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Mercadorias (Revenda)</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{totalMercadorias}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Tag size={16} />
          </div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Serviços Prestados</span>
            <span className="text-xl font-bold font-mono text-indigo-400">{totalServicos}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <DollarSign size={16} />
          </div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Ativo Imobilizado</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{totalImobilizado}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Layers size={16} />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex items-center justify-between gap-4 mt-4 p-3 bg-[#181818] border border-white/10 rounded-xl flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Filter size={14} className="text-neutral-400 mr-2 flex-shrink-0" />
          <button
            onClick={() => setFiltroTipoSped('TODOS')}
            className={`px-3 py-1 text-xs rounded-lg transition font-medium flex-shrink-0 ${
              filtroTipoSped === 'TODOS' 
                ? 'bg-purple-600 text-white shadow' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Todos
          </button>
          {['00', '09', '08', '07', '01'].map(cod => (
            <button
              key={cod}
              onClick={() => setFiltroTipoSped(cod)}
              className={`px-3 py-1 text-xs rounded-lg transition font-medium flex-shrink-0 ${
                filtroTipoSped === cod 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {TIPOS_SPED[cod]?.label.split(' - ')[1] || cod}
            </button>
          ))}
        </div>

        <div className="relative w-80 flex-shrink-0">
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por descrição, código, NCM..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Grade de Registros */}
      <div className="flex-1 mt-4 border border-white/10 rounded-xl overflow-hidden bg-[#181818] flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1c1c1c] text-neutral-400 border-b border-white/10 font-mono sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 w-24">Código</th>
                <th className="py-2.5 px-4">Descrição do Item</th>
                <th className="py-2.5 px-3">Tipo SPED</th>
                <th className="py-2.5 px-3 font-mono">NCM</th>
                <th className="py-2.5 px-3 text-center">Unidade</th>
                <th className="py-2.5 px-3 text-right">Pr. Venda</th>
                <th className="py-2.5 px-3 text-right">Pr. Custo</th>
                <th className="py-2.5 px-3 text-right">ICMS %</th>
                <th className="py-2.5 px-3 text-right">PIS/COF %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-center w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredProdutos.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-neutral-500 text-xs italic">
                    Nenhum item encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProdutos.map(prod => {
                  const badgeSped = TIPOS_SPED[prod.tipoItemSped] || TIPOS_SPED['99'];

                  return (
                    <tr key={prod.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-neutral-300">{prod.codigo}</td>
                      <td className="py-2.5 px-4 font-semibold text-white">
                        <div>{prod.descricao}</div>
                        {prod.codigoBarras && (
                          <div className="text-[10px] font-mono text-neutral-400">EAN: {prod.codigoBarras}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeSped.cor}`}>
                          {badgeSped.label.split(' - ')[1]}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-300">{prod.ncm || '00000000'}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-neutral-400">{prod.unidadeMedida}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                        {formatCurrency(prod.precoUnitarioVenda)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                        {formatCurrency(prod.precoUnitarioCusto)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                        {formatPercent(prod.aliquotaICMS)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-400">
                        {formatPercent((prod.aliquotaPIS || 0) + (prod.aliquotaCOFINS || 0))}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          prod.ativo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          {prod.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditar(prod)}
                            className="p-1 hover:text-purple-400 text-neutral-400 transition"
                            title="Editar Item"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleExcluir(prod.id)}
                            className="p-1 hover:text-rose-400 text-neutral-400 transition"
                            title="Excluir Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé Totalizador */}
        <div className="p-3 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Mostrando {filteredProdutos.length} de {produtos.length} itens</span>
          <span className="font-mono text-neutral-500">Pressione F2 para novo item • SPED Registro 0200</span>
        </div>
      </div>

      {/* MODAL: NOVO / EDITAR PRODUTO */}
      {modalAberto && produtoEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package size={16} className="text-purple-400" />
                <span>Cadastro de Item / Produto / Serviço (SPED 0200)</span>
              </h3>
              <button 
                onClick={() => setModalAberto(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Código do Item *</label>
                  <input
                    type="text"
                    value={produtoEmEdicao.codigo}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, codigo: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo do Item SPED *</label>
                  <select
                    value={produtoEmEdicao.tipoItemSped}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, tipoItemSped: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {Object.entries(TIPOS_SPED).map(([cod, info]) => (
                      <option key={cod} value={cod}>{info.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Descrição Completa do Item *</label>
                <input
                  type="text"
                  value={produtoEmEdicao.descricao}
                  onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, descricao: e.target.value })}
                  placeholder="Nome detalhado do produto, mercadoria ou serviço"
                  className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">NCM (8 dígitos)</label>
                  <input
                    type="text"
                    value={produtoEmEdicao.ncm}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, ncm: maskNCM(e.target.value) })}
                    placeholder="0000.00.00"
                    maxLength={10}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">CEST (7 dígitos)</label>
                  <input
                    type="text"
                    value={produtoEmEdicao.cest || ''}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, cest: maskCEST(e.target.value) })}
                    placeholder="00.000.00"
                    maxLength={9}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Unidade *</label>
                  <input
                    type="text"
                    value={produtoEmEdicao.unidadeMedida}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, unidadeMedida: e.target.value.toUpperCase() })}
                    placeholder="UN, KG, CX..."
                    maxLength={6}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono font-bold text-center text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Cód. Barras (EAN)</label>
                  <input
                    type="text"
                    value={produtoEmEdicao.codigoBarras || ''}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, codigoBarras: unmask(e.target.value) })}
                    placeholder="789..."
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Valores de Comercialização */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Preço Unitário de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoEmEdicao.precoUnitarioVenda || 0}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, precoUnitarioVenda: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Preço de Custo / Aquisição (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoEmEdicao.precoUnitarioCusto || 0}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, precoUnitarioCusto: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Alíquotas e Tributação */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Alíq. ICMS (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoEmEdicao.aliquotaICMS || 0}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, aliquotaICMS: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Alíq. IPI (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoEmEdicao.aliquotaIPI || 0}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, aliquotaIPI: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Alíq. PIS (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoEmEdicao.aliquotaPIS || 0}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, aliquotaPIS: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Alíq. COFINS (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoEmEdicao.aliquotaCOFINS || 0}
                    onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, aliquotaCOFINS: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Vínculo Contábil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Conta Contábil de Inventário / Ativo
                  </label>
                  <select
                    value={produtoEmEdicao.contaContabilInventarioId || ''}
                    onChange={e => setProdutoEmEdicao({ 
                      ...produtoEmEdicao, 
                      contaContabilInventarioId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Selecione conta de Ativo/Estoque...</option>
                    {contas.filter(c => c.natureza === 'D').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.classificacao} - {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Conta Contábil de Receita
                  </label>
                  <select
                    value={produtoEmEdicao.contaContabilReceitaId || ''}
                    onChange={e => setProdutoEmEdicao({ 
                      ...produtoEmEdicao, 
                      contaContabilReceitaId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Selecione conta de Receita...</option>
                    {contas.filter(c => c.natureza === 'C').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.classificacao} - {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="checkProdAtivo"
                  checked={produtoEmEdicao.ativo}
                  onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, ativo: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#141414] border-white/20 text-purple-600 focus:ring-0"
                />
                <label htmlFor="checkProdAtivo" className="text-xs text-neutral-200 cursor-pointer font-medium">
                  Item Ativo para Faturamento e Movimentação Fiscal
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition active:scale-95"
                >
                  Salvar Item Fiscal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
