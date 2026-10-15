import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Printer,
  Download,
  Copy,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  DollarSign,
  Layers,
  CheckCircle,
  AlertCircle,
  FileText,
  Boxes,
  Barcode
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ItemInventarioEstoque, InventarioEstoqueModelo7 } from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const InventarioEstoqueModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [ano, setAno] = useState<number>(2026);
  const [inventario, setInventario] = useState<InventarioEstoqueModelo7 | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroPropriedade, setFiltroPropriedade] = useState<string>('TODOS');

  // Modais
  const [showNovoItemModal, setShowNovoItemModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSpedModal, setShowSpedModal] = useState(false);
  const [txtSpedBlocoH, setTxtSpedBlocoH] = useState<string>('');
  const [copiado, setCopiado] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form State
  const [itemEditando, setItemEditando] = useState<ItemInventarioEstoque | null>(null);
  const [formCodigo, setFormCodigo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formTipoSped, setFormTipoSped] = useState('00');
  const [formUnidade, setFormUnidade] = useState('UN');
  const [formQuantidade, setFormQuantidade] = useState('');
  const [formCustoMedio, setFormCustoMedio] = useState('');
  const [formIndicadorProp, setFormIndicadorProp] = useState<'0' | '1' | '2'>('0');
  const [formContaContabil, setFormContaContabil] = useState('1.01.03.001.0001');

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    if (emp) {
      setEmpresa(emp);
      const inv = dbService.getInventarioEstoque(emp.id, ano);
      setInventario(inv);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [ano]);

  // Itens filtrados
  const itensFiltrados = useMemo(() => {
    if (!inventario) return [];
    return inventario.itens.filter(i => {
      const matchSearch = 
        i.codigoItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.descricaoItem.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchTipo = filtroTipo === 'TODOS' || i.tipoItemSped === filtroTipo;
      const matchProp = filtroPropriedade === 'TODOS' || i.indicadorPropriedade === filtroPropriedade;

      return matchSearch && matchTipo && matchProp;
    });
  }, [inventario, searchTerm, filtroTipo, filtroPropriedade]);

  // KPIs
  const totais = useMemo(() => {
    if (!inventario) {
      return { totalItens: 0, totalEstoque: 0, revenda: 0, materiaPrima: 0, terceiros: 0 };
    }
    const totalItens = inventario.itens.length;
    const totalEstoque = inventario.totalEstoque;
    const revenda = inventario.itens
      .filter(i => i.tipoItemSped === '00')
      .reduce((acc, i) => acc + i.valorTotal, 0);
    const materiaPrima = inventario.itens
      .filter(i => i.tipoItemSped === '01')
      .reduce((acc, i) => acc + i.valorTotal, 0);
    const terceiros = inventario.itens
      .filter(i => i.indicadorPropriedade !== '0')
      .reduce((acc, i) => acc + i.valorTotal, 0);

    return { totalItens, totalEstoque, revenda, materiaPrima, terceiros };
  }, [inventario]);

  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;

    const qtd = parseFloat(formQuantidade.replace(',', '.'));
    const custo = parseFloat(formCustoMedio.replace(',', '.'));

    if (isNaN(qtd) || qtd <= 0 || isNaN(custo) || custo <= 0) {
      setFeedbackMsg({ tipo: 'error', texto: 'Informe quantidade e custo médio unitário válidos maiores que zero.' });
      return;
    }

    try {
      dbService.saveItemInventarioEstoque({
        id: itemEditando ? itemEditando.id : undefined,
        empresaId: empresa.id,
        ano,
        codigoItem: formCodigo.trim(),
        descricaoItem: formDescricao.trim(),
        tipoItemSped: formTipoSped,
        unidadeMedida: formUnidade.toUpperCase().trim(),
        quantidade: qtd,
        custoMedioUnitario: custo,
        indicadorPropriedade: formIndicadorProp,
        contaContabilCodigo: formContaContabil
      });

      setFeedbackMsg({ tipo: 'success', texto: `Item de estoque ${formCodigo} salvo com sucesso no Inventário.` });
      setShowNovoItemModal(false);
      setItemEditando(null);
      limparForm();
      carregarDados();
    } catch {
      setFeedbackMsg({ tipo: 'error', texto: 'Erro ao salvar item de estoque no inventário.' });
    }
  };

  const handleEditar = (item: ItemInventarioEstoque) => {
    setItemEditando(item);
    setFormCodigo(item.codigoItem);
    setFormDescricao(item.descricaoItem);
    setFormTipoSped(item.tipoItemSped);
    setFormUnidade(item.unidadeMedida);
    setFormQuantidade(String(item.quantidade));
    setFormCustoMedio(String(item.custoMedioUnitario));
    setFormIndicadorProp(item.indicadorPropriedade);
    setFormContaContabil(item.contaContabilCodigo || '1.01.03.001.0001');
    setShowNovoItemModal(true);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Confirma a exclusão deste item do Livro Registro de Inventário?')) {
      const ok = dbService.deleteItemInventarioEstoque(id);
      if (ok) {
        setFeedbackMsg({ tipo: 'success', texto: 'Item excluído com sucesso.' });
        carregarDados();
      }
    }
  };

  const limparForm = () => {
    setFormCodigo('');
    setFormDescricao('');
    setFormTipoSped('00');
    setFormUnidade('UN');
    setFormQuantidade('');
    setFormCustoMedio('');
    setFormIndicadorProp('0');
    setFormContaContabil('1.01.03.001.0001');
  };

  const handleGerarSpedBlocoH = () => {
    if (!empresa) return;
    const txt = dbService.gerarSpedFiscalBlocoH(empresa.id, ano);
    setTxtSpedBlocoH(txt);
    setShowSpedModal(true);
  };

  const handleCopiarTxt = () => {
    navigator.clipboard.writeText(txtSpedBlocoH);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!txtSpedBlocoH) return;
    const element = document.createElement('a');
    const file = new Blob([txtSpedBlocoH], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `SPED_BLOCOO_H_${empresa?.cnpj.replace(/\D/g, '') || 'EMPRESA'}_${ano}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getTipoDescricao = (tipo: string) => {
    switch (tipo) {
      case '00': return '00 - Mercadoria para Revenda';
      case '01': return '01 - Matéria-Prima';
      case '02': return '02 - Embalagem';
      case '03': return '03 - Produto em Processo';
      case '04': return '04 - Produto Acabado';
      case '05': return '05 - Subproduto';
      case '06': return '06 - Produto Intermediário';
      case '10': return '10 - Outros Insumos';
      default: return tipo;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-gray-200 overflow-hidden font-sans">
      {/* HEADER BAR */}
      <div className="bg-[#181818] border-b border-[#2a2a2a] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-100">Livro Registro de Inventário Modelo 7</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
                  Art. 261 RIR/2018
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/50">
                  SPED Bloco H
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {empresa ? `${empresa.razaoSocial} • CNPJ: ${empresa.cnpj}` : 'Selecione uma empresa'} • Posição Físico-Financeira de Estoques em 31/12/{ano}
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLES DO TOPO */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded border border-[#333]">
            <Calendar className="w-4 h-4 text-amber-400" />
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
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 rounded border border-[#3a3a3a] transition"
            title="Emitir Livro Registro de Inventário Modelo 7 em A4"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Imprimir Livro A4
          </button>

          <button
            onClick={handleGerarSpedBlocoH}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 rounded border border-[#3a3a3a] transition"
            title="Gerar Bloco H da EFD-ICMS/IPI"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            SPED Bloco H
          </button>

          <button
            onClick={() => {
              setItemEditando(null);
              limparForm();
              setShowNovoItemModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium rounded shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Item de Estoque
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedbackMsg && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between border-b ${
          feedbackMsg.tipo === 'success' 
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.tipo === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI DASHBOARD CARDS */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Total de Itens</div>
            <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
              {totais.totalItens} {totais.totalItens === 1 ? 'Produto' : 'Produtos'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Posição física apurada</div>
          </div>
          <div className="p-2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/30">
            <Boxes className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Estoque Total Contábil</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              R$ {totais.totalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Custo Médio Ponderado</div>
          </div>
          <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Mercadorias Revenda (00)</div>
            <div className="text-base font-bold text-sky-400 font-mono mt-0.5">
              R$ {totais.revenda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Produtos acabados p/ venda</div>
          </div>
          <div className="p-2 rounded bg-sky-950/40 text-sky-400 border border-sky-800/30">
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Matérias-Primas (01)</div>
            <div className="text-base font-bold text-purple-400 font-mono mt-0.5">
              R$ {totais.materiaPrima.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Insumos de produção</div>
          </div>
          <div className="p-2 rounded bg-purple-950/40 text-purple-400 border border-purple-800/30">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Em Poder de Terceiros</div>
            <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
              R$ {totais.terceiros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Remessa conserto/depósito</div>
          </div>
          <div className="p-2 rounded bg-rose-950/40 text-rose-400 border border-rose-800/30">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="px-6 space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#181818] p-3 rounded border border-[#2a2a2a]">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Pesquisar por código ou descrição do item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#202020] border border-[#333] text-xs text-gray-200 rounded px-3 py-1.5 w-72 focus:outline-none focus:border-amber-500"
            />

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-[#202020] border border-[#333] text-xs text-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="TODOS">Todos os Tipos SPED</option>
              <option value="00">00 - Mercadoria para Revenda</option>
              <option value="01">01 - Matéria-Prima</option>
              <option value="02">02 - Embalagem</option>
              <option value="03">03 - Produto em Processo</option>
              <option value="04">04 - Produto Acabado</option>
            </select>

            <select
              value={filtroPropriedade}
              onChange={(e) => setFiltroPropriedade(e.target.value)}
              className="bg-[#202020] border border-[#333] text-xs text-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="TODOS">Todos os Indicadores de Posse</option>
              <option value="0">0 - Item próprio em poder da empresa</option>
              <option value="1">1 - Item próprio em poder de terceiros</option>
              <option value="2">2 - Item de terceiros em poder da empresa</option>
            </select>
          </div>

          <div className="text-xs text-gray-400">
            Mostrando <span className="font-semibold text-gray-200">{itensFiltrados.length}</span> itens inventariados
          </div>
        </div>

        {/* TABELA DE ESTOQUE */}
        <div className="bg-[#181818] rounded-lg border border-[#2a2a2a] overflow-hidden flex-1 flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#242424] text-gray-400 border-b border-[#2a2a2a] sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Código Item</th>
                  <th className="py-2.5 px-3">Descrição da Mercadoria / Insumo</th>
                  <th className="py-2.5 px-3">Tipo SPED</th>
                  <th className="py-2.5 px-3 text-center">UN</th>
                  <th className="py-2.5 px-3 text-right">Quantidade Física</th>
                  <th className="py-2.5 px-3 text-right">Custo Médio Unitário</th>
                  <th className="py-2.5 px-3 text-right font-bold text-gray-200">Valor Total Contábil</th>
                  <th className="py-2.5 px-3 text-center">Posse</th>
                  <th className="py-2.5 px-3 font-mono">Conta Contábil</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-500">
                      Nenhum item encontrado no inventário de estoques do ano {ano}.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1f1f1f] transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        {item.codigoItem}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-100 max-w-sm truncate" title={item.descricaoItem}>
                        {item.descricaoItem}
                      </td>
                      <td className="py-2.5 px-3 text-gray-300 text-[11px]">
                        {getTipoDescricao(item.tipoItemSped)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-gray-400">
                        {item.unidadeMedida}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-200 font-semibold">
                        {item.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                        R$ {item.custoMedioUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.indicadorPropriedade === '0'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        }`}>
                          {item.indicadorPropriedade === '0' ? 'Próprio/Empresa' : item.indicadorPropriedade === '1' ? 'Próprio/Terceiros' : 'Terceiros/Empresa'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px]">
                        {item.contaContabilCodigo || '1.01.03.001.0001'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEditar(item)}
                            className="p-1 text-gray-400 hover:text-amber-400 rounded transition"
                            title="Editar Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id)}
                            className="p-1 text-gray-400 hover:text-rose-400 rounded transition"
                            title="Excluir Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {itensFiltrados.length > 0 && (
                <tfoot className="bg-[#202020] font-semibold text-gray-200 border-t border-[#333] sticky bottom-0">
                  <tr>
                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase text-[11px]">
                      Total Geral do Estoque em 31/12/{ano}:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                      R$ {totais.totalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* MODAL NOVO / EDITAR ITEM */}
      {showNovoItemModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-[#222] border-b border-[#333] flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                {itemEditando ? 'Editar Item de Estoque' : 'Cadastrar Item no Inventário'}
              </h3>
              <button onClick={() => setShowNovoItemModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSalvarItem} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Código do Item *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PROD-101"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-gray-200 font-mono focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Descrição da Mercadoria / Insumo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cabo de Rede Furukawa Cat6 UTP 305m"
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-gray-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Tipo do Item SPED *</label>
                  <select
                    value={formTipoSped}
                    onChange={(e) => setFormTipoSped(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-gray-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="00">00 - Mercadoria para Revenda</option>
                    <option value="01">01 - Matéria-Prima</option>
                    <option value="02">02 - Embalagem</option>
                    <option value="03">03 - Produto em Processo</option>
                    <option value="04">04 - Produto Acabado</option>
                    <option value="05">05 - Subproduto</option>
                    <option value="06">06 - Produto Intermediário</option>
                    <option value="10">10 - Outros Insumos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Unidade de Medida *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="UN, CX, KG, LT, MT"
                    value={formUnidade}
                    onChange={(e) => setFormUnidade(e.target.value.toUpperCase())}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-gray-200 font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Quantidade Contada *</label>
                  <input
                    type="text"
                    required
                    placeholder="0,000"
                    value={formQuantidade}
                    onChange={(e) => setFormQuantidade(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-gray-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Custo Médio Unitário (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={formCustoMedio}
                    onChange={(e) => setFormCustoMedio(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-gray-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Indicador de Posse / Propriedade *</label>
                  <select
                    value={formIndicadorProp}
                    onChange={(e) => setFormIndicadorProp(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-gray-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="0">0 - Item próprio em poder da empresa</option>
                    <option value="1">1 - Item próprio em poder de terceiros</option>
                    <option value="2">2 - Item de terceiros em poder da empresa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Conta Contábil de Estoque</label>
                  <input
                    type="text"
                    value={formContaContabil}
                    onChange={(e) => setFormContaContabil(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-gray-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#333] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovoItemModal(false)}
                  className="px-4 py-2 text-xs bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium rounded shadow transition"
                >
                  Salvar Item no Inventário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SPED BLOCO H */}
      {showSpedModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 bg-[#222] border-b border-[#333] flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Registros da EFD-ICMS/IPI • SPED Fiscal Bloco H
              </h3>
              <button onClick={() => setShowSpedModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="bg-[#111] p-3 rounded border border-[#333] font-mono text-xs text-emerald-400 whitespace-pre max-h-80 overflow-y-auto select-all leading-relaxed">
                {txtSpedBlocoH}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Total de linhas geradas: <span className="font-mono text-white">{txtSpedBlocoH.split('\n').length}</span> registros</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopiarTxt}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 rounded transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Bloco H .TXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRESSÃO LIVRO REGISTRO DE INVENTÁRIO MODELO 7 A4 */}
      {showPrintModal && inventario && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="Livro Registro de Inventário - Modelo 7"
          subtitulo="Artigo 261 do RIR/2018 • Regulamento do ICMS"
          periodo={`Posição física e contábil em 31 de dezembro de ${ano}`}
        >
          <div className="space-y-4 text-black font-sans text-[10px]">
            {/* CABEÇALHO */}
            <div className="border border-black p-2 space-y-1">
              <div className="font-bold text-xs uppercase">{empresa.razaoSocial}</div>
              <div>CNPJ: {empresa.cnpj} • Inscrição Estadual: {empresa.inscricaoEstadual || 'Isento'}</div>
              <div>Endereço: {empresa.logradouro}, {empresa.numero} - {empresa.bairro} • {empresa.cidade || 'São Paulo'}/{empresa.uf}</div>
              <div>Exercício Social: {ano} • Data do Inventário: 31/12/{ano}</div>
            </div>

            {/* TABELA DE ITENS */}
            <div className="border border-black p-2">
              <div className="font-bold text-xs uppercase mb-2">RELAÇÃO ANALÍTICA DAS MERCADORIAS, MATÉRIAS-PRIMAS E INSUMOS EM ESTOQUE</div>
              <table className="w-full border-collapse border border-black text-[9px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-left">Código</th>
                    <th className="border border-black p-1 text-left">Discriminação das Mercadorias e Produtos</th>
                    <th className="border border-black p-1 text-center">UN</th>
                    <th className="border border-black p-1 text-right">Quantidade</th>
                    <th className="border border-black p-1 text-right">Valor Unitário (R$)</th>
                    <th className="border border-black p-1 text-right font-bold">Valor Total (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.itens.map((it) => (
                    <tr key={it.id} className="border-b border-black">
                      <td className="border border-black p-1 font-mono font-bold">{it.codigoItem}</td>
                      <td className="border border-black p-1">{it.descricaoItem} ({getTipoDescricao(it.tipoItemSped)})</td>
                      <td className="border border-black p-1 text-center font-mono">{it.unidadeMedida}</td>
                      <td className="border border-black p-1 text-right font-mono">{it.quantidade.toFixed(3)}</td>
                      <td className="border border-black p-1 text-right font-mono">{it.custoMedioUnitario.toFixed(2)}</td>
                      <td className="border border-black p-1 text-right font-mono font-bold">{it.valorTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold border-t border-black">
                    <td colSpan={5} className="border border-black p-1 text-right uppercase">TOTAL GERAL DO INVENTÁRIO (31/12/{ano}):</td>
                    <td className="border border-black p-1 text-right font-mono text-xs">
                      R$ {inventario.totalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* TERMO DE ENCERRAMENTO */}
            <div className="border border-black p-3 space-y-4">
              <div className="font-bold uppercase">TERMO DE ENCERRAMENTO DO LIVRO DE INVENTÁRIO</div>
              <p className="text-justify leading-relaxed">
                Aos 31 dias do mês de dezembro de {ano}, encerra-se o presente Livro Registro de Inventário, 
                Modelo 7, contendo o arrolamento completo de todas as mercadorias, matérias-primas, produtos 
                e materiais existentes em estoque nesta data, avaliados pelo custo médio de aquisição/fabricação 
                conforme as disposições da legislação fiscal e comercial vigente, totalizando a importância de 
                <span className="font-bold font-mono"> R$ {inventario.totalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-center border-t border-black pt-1">
                  <div className="font-bold">{empresa.razaoSocial}</div>
                  <div>Contribuinte / Representante Legal</div>
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
    </div>
  );
};
