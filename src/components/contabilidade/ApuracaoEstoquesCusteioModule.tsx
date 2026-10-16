import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Search,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  PackageCheck,
  TrendingDown,
  TrendingUp,
  FileCheck2,
  SlidersHorizontal,
  FolderOpen,
  DollarSign
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoApuracaoEstoques,
  FichaEstoqueProduto,
  ItemMovimentoKardex,
  MetodoCusteioEstoque,
  TipoMovimentacaoEstoque
} from '../../types/contabil';

export const ApuracaoEstoquesCusteioModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoApuracaoEstoques | null>(null);
  const [activeTab, setActiveTab] = useState<'produtos' | 'kardex' | 'apuracaoMensal' | 'laudoA4'>('produtos');
  const [busca, setBusca] = useState<string>('');
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais
  const [modalProduto, setModalProduto] = useState<boolean>(false);
  const [modalMovimento, setModalMovimento] = useState<boolean>(false);

  // Formulário Produto
  const [formProdCodigo, setFormProdCodigo] = useState<string>('');
  const [formProdDescricao, setFormProdDescricao] = useState<string>('');
  const [formProdNcm, setFormProdNcm] = useState<string>('');
  const [formProdUnidade, setFormProdUnidade] = useState<string>('UN');
  const [formProdTipo, setFormProdTipo] = useState<'MERCADORIA_REVENDA' | 'MATERIA_PRIMA' | 'PRODUTO_ACABADO' | 'EMBALAGEM'>('MERCADORIA_REVENDA');
  const [formProdMetodo, setFormProdMetodo] = useState<MetodoCusteioEstoque>('MEDIA_PONDERADA_MOVEL');
  const [formProdSaldoQtd, setFormProdSaldoQtd] = useState<number>(100);
  const [formProdCustoUnit, setFormProdCustoUnit] = useState<number>(50.0);

  // Formulário Movimento Kardex
  const [formMovTipo, setFormMovTipo] = useState<TipoMovimentacaoEstoque>('SAIDA_VENDA');
  const [formMovData, setFormMovData] = useState<string>('2026-03-25');
  const [formMovDoc, setFormMovDoc] = useState<string>('NF-e 001.990');
  const [formMovQtd, setFormMovQtd] = useState<number>(10);
  const [formMovCustoUnit, setFormMovCustoUnit] = useState<number>(0);

  const carregarDados = () => {
    const dados = dbService.getApuracaoEstoques(empresaId, competencia);
    setResumo(dados);
    if (!produtoSelecionadoId && dados.fichas.length > 0) {
      setProdutoSelecionadoId(dados.fichas[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const produtoSelecionado = resumo?.fichas.find(f => f.id === produtoSelecionadoId) || resumo?.fichas[0];

  const handleSalvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProdCodigo || !formProdDescricao) {
      exibirNotificacao('erro', 'Código e Descrição do produto são obrigatórios.');
      return;
    }

    const res = dbService.salvarFichaEstoqueProduto({
      empresaId,
      codigoProduto: formProdCodigo,
      descricao: formProdDescricao,
      ncm: formProdNcm || '8471.50.10',
      unidadeMedida: formProdUnidade,
      tipoItem: formProdTipo,
      metodoCusteio: formProdMetodo,
      saldoInicialQuantidade: Number(formProdSaldoQtd),
      saldoInicialCustoUnitarioBRL: Number(formProdCustoUnit)
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalProduto(false);
      setFormProdCodigo('');
      setFormProdDescricao('');
      setFormProdNcm('');
      carregarDados();
      setProdutoSelecionadoId(res.ficha.id);
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleSalvarMovimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoSelecionado) {
      exibirNotificacao('erro', 'Selecione um produto antes de lançar a movimentação.');
      return;
    }
    if (formMovQtd <= 0) {
      exibirNotificacao('erro', 'A quantidade da movimentação deve ser superior a zero.');
      return;
    }

    const res = dbService.lancarMovimentoKardex(produtoSelecionado.id, {
      data: formMovData,
      documento: formMovDoc,
      tipo: formMovTipo,
      quantidade: Number(formMovQtd),
      custoUnitarioBRL: Number(formMovCustoUnit) || produtoSelecionado.custoMedioFinalBRL
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalMovimento(false);
      setFormMovDoc('');
      setFormMovQtd(0);
      setFormMovCustoUnit(0);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleIntegrarCmv = () => {
    if (!resumo) return;
    const res = dbService.integrarCmvContabil(empresaId, competencia, resumo.totalCmvPeriodoBRL);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const fichasFiltradas = resumo?.fichas.filter(f =>
    f.codigoProduto.toLowerCase().includes(busca.toLowerCase()) ||
    f.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    f.ncm.includes(busca)
  ) || [];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-[#e0e0e0] overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-[#2d2d2d] bg-[#181818] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Apuração de Estoques & Métodos de Custeio
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  CPC 16 (R1) / RIR 2018
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Média Ponderada Móvel e PEPS/FIFO, Ficha Kardex perpétua e apuração de CMV/CPV integrado à Contabilidade
              </p>
            </div>
          </div>
        </div>

        {/* Competência & Ações */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333333]">
            <span className="text-xs text-gray-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-emerald-400 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={() => setModalProduto(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 bg-[#242424] hover:bg-[#303030] border border-[#333333] rounded-lg text-gray-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta de Notificação */}
      {notificacao && (
        <div
          className={`mx-5 mt-4 p-3 rounded-lg text-xs flex items-center justify-between border ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-200'
              : 'bg-red-950/60 border-red-700/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificacao.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{notificacao.texto}</span>
          </div>
          <button
            onClick={() => setNotificacao(null)}
            className="text-gray-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dashboard KPI Cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Estoque Final Total (R$)</div>
          <div className="text-2xl font-bold text-white mt-1">
            R$ {(resumo?.valorTotalEstoqueBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>{resumo?.totalProdutosApurados || 0} itens valorizados</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-white pointer-events-none">
            <Boxes className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">CMV / CPV do Período (R$)</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            R$ {(resumo?.totalCmvPeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Custo baixado no resultado</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-amber-400 pointer-events-none">
            <DollarSign className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Entradas no Mês (Compras/Prod.)</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">
            R$ {(resumo?.apuracaoAtual?.totalEntradasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Líquido de ICMS/PIS/COFINS</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-emerald-400 pointer-events-none">
            <TrendingUp className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Variação Patrimonial Estoque</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            R$ {(resumo?.apuracaoAtual?.variacaoEstoquePeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-300 mt-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>{resumo?.apuracaoAtual?.metodoPadrao || 'MÉDIA MÓVEL'}</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-blue-400 pointer-events-none">
            <Layers className="w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 border-b border-[#2d2d2d] flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'produtos'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Inventário de Produtos ({resumo?.fichas.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('kardex')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'kardex'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Ficha Kardex Contábil {produtoSelecionado ? `(${produtoSelecionado.codigoProduto})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('apuracaoMensal')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'apuracaoMensal'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Demonstrativo de CMV & Integração
          </button>
          <button
            onClick={() => setActiveTab('laudoA4')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'laudoA4'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            Laudo de Inventário A4
          </button>
        </div>

        {/* Busca rápida */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código, produto ou NCM..."
            className="bg-[#202020] border border-[#333333] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 w-64"
          />
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-5 flex-1">
        {/* ABA 1: PRODUTOS */}
        {activeTab === 'produtos' && (
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-300">
                Posição Físico-Financeira do Estoque ({fichasFiltradas.length} itens)
              </div>
              <div className="text-xs text-gray-400">
                Critério de Avaliação: Conforme Resolução CFC nº 1.170/09 e Art. 299 do RIR/2018
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#222222] text-gray-400 font-medium border-b border-[#2d2d2d]">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Descrição do Item</th>
                    <th className="py-2.5 px-3">NCM</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Método</th>
                    <th className="py-2.5 px-3 text-right">Saldo Inicial Qtd</th>
                    <th className="py-2.5 px-3 text-right">Saldo Final Qtd</th>
                    <th className="py-2.5 px-3 text-right">Custo Médio Unit. (R$)</th>
                    <th className="py-2.5 px-3 text-right">Saldo Final Total (R$)</th>
                    <th className="py-2.5 px-3 text-right">CMV Período (R$)</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {fichasFiltradas.map((f) => (
                    <tr
                      key={f.id}
                      className={`hover:bg-[#202020] transition-colors cursor-pointer ${
                        f.id === produtoSelecionadoId ? 'bg-emerald-950/20 border-l-2 border-emerald-500' : ''
                      }`}
                      onClick={() => setProdutoSelecionadoId(f.id)}
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-emerald-400">{f.codigoProduto}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{f.descricao}</div>
                        <div className="text-[10px] text-gray-500">Unidade: {f.unidadeMedida} | Conta: {f.contaContabilEstoque}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">{f.ncm}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2a2a2a] text-gray-300 border border-[#3a3a3a]">
                          {f.tipoItem}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          {f.metodoCusteio === 'MEDIA_PONDERADA_MOVEL' ? 'Média Móvel' : 'PEPS / FIFO'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-400">
                        {f.saldoInicialQuantidade} {f.unidadeMedida}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                        {f.saldoFinalQuantidade} {f.unidadeMedida}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                        R$ {f.custoMedioFinalBRL.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {f.saldoFinalValorTotalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                        R$ {f.cmvPeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setProdutoSelecionadoId(f.id);
                              setActiveTab('kardex');
                            }}
                            title="Ver Ficha Kardex"
                            className="p-1 text-gray-400 hover:text-emerald-400 bg-[#252525] hover:bg-[#303030] rounded border border-[#383838] cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setProdutoSelecionadoId(f.id);
                              setModalMovimento(true);
                            }}
                            title="Lançar Movimento (Entrada/Saída)"
                            className="p-1 text-gray-400 hover:text-blue-400 bg-[#252525] hover:bg-[#303030] rounded border border-[#383838] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: KARDEX */}
        {activeTab === 'kardex' && produtoSelecionado && (
          <div className="space-y-4">
            {/* Cabeçalho do Produto no Kardex */}
            <div className="bg-[#181818] p-4 rounded-xl border border-[#2d2d2d] flex flex-wrap justify-between items-center gap-4">
              <div>
                <div className="text-xs text-emerald-400 font-mono font-semibold">
                  {produtoSelecionado.codigoProduto} • {produtoSelecionado.ncm}
                </div>
                <div className="text-base font-bold text-white mt-0.5">{produtoSelecionado.descricao}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                  <span>Método: <strong className="text-emerald-300">{produtoSelecionado.metodoCusteio}</strong></span>
                  <span>•</span>
                  <span>Unidade: <strong className="text-white">{produtoSelecionado.unidadeMedida}</strong></span>
                  <span>•</span>
                  <span>Conta Estoque: <strong className="text-gray-300">{produtoSelecionado.contaContabilEstoque}</strong></span>
                  <span>•</span>
                  <span>Conta CMV: <strong className="text-gray-300">{produtoSelecionado.contaContabilCmvCpv}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalMovimento(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Lançar Movimento
                </button>
              </div>
            </div>

            {/* Tabela do Kardex */}
            <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 bg-[#1f1f1f] border-b border-[#2d2d2d] flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-300">
                  Extrato Cronológico de Movimentações ({produtoSelecionado.movimentacoes.length} registros)
                </span>
                <span className="text-xs text-gray-400">
                  Valores sem impostos recuperáveis (ICMS, PIS, COFINS deduzidos)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300 border-collapse">
                  <thead className="bg-[#242424] text-gray-400 font-medium border-b border-[#2d2d2d]">
                    <tr>
                      <th className="py-2 px-2.5">Data</th>
                      <th className="py-2 px-2.5">Documento</th>
                      <th className="py-2 px-2.5">Tipo Operação</th>
                      <th className="py-2 px-2.5 text-center bg-[#282828] border-x border-[#333333]" colSpan={3}>
                        ENTRADAS
                      </th>
                      <th className="py-2 px-2.5 text-center bg-[#252525] border-r border-[#333333]" colSpan={3}>
                        SAÍDAS (CMV)
                      </th>
                      <th className="py-2 px-2.5 text-center bg-[#202020]" colSpan={3}>
                        SALDO DISPONÍVEL
                      </th>
                    </tr>
                    <tr className="text-[11px] text-gray-400 bg-[#1e1e1e] border-b border-[#2d2d2d]">
                      <th></th>
                      <th></th>
                      <th></th>
                      {/* Entradas */}
                      <th className="py-1 px-2 text-right">Qtd</th>
                      <th className="py-1 px-2 text-right">Unit (R$)</th>
                      <th className="py-1 px-2 text-right border-r border-[#333333]">Total (R$)</th>
                      {/* Saídas */}
                      <th className="py-1 px-2 text-right">Qtd</th>
                      <th className="py-1 px-2 text-right">Unit (R$)</th>
                      <th className="py-1 px-2 text-right border-r border-[#333333]">Total (R$)</th>
                      {/* Saldo */}
                      <th className="py-1 px-2 text-right">Qtd</th>
                      <th className="py-1 px-2 text-right">Médio (R$)</th>
                      <th className="py-1 px-2 text-right">Total (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {produtoSelecionado.movimentacoes.map((m) => {
                      const isEntrada = m.tipo === 'ENTRADA_COMPRA' || m.tipo === 'ENTRADA_PRODUCAO' || m.tipo === 'SALDO_INICIAL' || m.tipo === 'AJUSTE_INVENTARIO_GANHO';
                      const isSaida = m.tipo === 'SAIDA_VENDA' || m.tipo === 'SAIDA_CONSUMO_PROCESSO' || m.tipo === 'AJUSTE_INVENTARIO_PERDA';

                      return (
                        <tr key={m.id} className="hover:bg-[#202020] transition-colors">
                          <td className="py-2 px-2.5 font-mono text-gray-400">{m.data}</td>
                          <td className="py-2 px-2.5 font-medium text-white">{m.documento}</td>
                          <td className="py-2 px-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                isEntrada
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                              }`}
                            >
                              {m.tipo}
                            </span>
                          </td>

                          {/* Entradas */}
                          <td className="py-2 px-2 text-right font-mono text-emerald-400">
                            {isEntrada ? m.quantidade : '-'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-emerald-300">
                            {isEntrada ? `R$ ${m.custoUnitarioBRL.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-medium text-emerald-400 border-r border-[#333333]">
                            {isEntrada ? `R$ ${m.custoTotalBRL.toFixed(2)}` : '-'}
                          </td>

                          {/* Saídas */}
                          <td className="py-2 px-2 text-right font-mono text-amber-400">
                            {isSaida ? m.quantidade : '-'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-amber-300">
                            {isSaida ? `R$ ${m.custoUnitarioBRL.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-medium text-amber-400 border-r border-[#333333]">
                            {isSaida ? `R$ ${m.custoTotalBRL.toFixed(2)}` : '-'}
                          </td>

                          {/* Saldo Final da Linha */}
                          <td className="py-2 px-2 text-right font-mono font-semibold text-white">
                            {m.saldoQuantidade}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-gray-300">
                            R$ {m.custoMedioUnitarioBRL.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400">
                            R$ {m.saldoValorTotalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

        {/* ABA 3: DEMONSTRATIVO DE CMV & INTEGRAÇÃO CONTÁBIL */}
        {activeTab === 'apuracaoMensal' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Equação Geral da Apuração do Custo das Mercadorias Vendidas (CMV)
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 bg-[#202020] rounded-lg border border-[#303030]">
                    <span className="text-gray-300 font-medium">(+) Estoque Inicial (EI)</span>
                    <span className="font-mono text-white font-semibold">
                      R$ {(resumo?.apuracaoAtual?.totalEstoqueInicialBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-[#202020] rounded-lg border border-[#303030]">
                    <span className="text-emerald-400 font-medium">(+) Entradas Líquidas de Impostos (Compras/Produção)</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      R$ {(resumo?.apuracaoAtual?.totalEntradasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-[#202020] rounded-lg border border-[#303030]">
                    <span className="text-blue-400 font-medium">(-) Estoque Final em 31/03 (EF)</span>
                    <span className="font-mono text-blue-400 font-semibold">
                      R$ {(resumo?.apuracaoAtual?.totalEstoqueFinalBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-amber-950/30 rounded-lg border border-amber-800/40 mt-4">
                    <div>
                      <span className="text-sm text-amber-300 font-bold block">(=) Custo das Mercadorias Vendidas (CMV)</span>
                      <span className="text-[11px] text-gray-400">CMV = EI + Compras - EF</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-amber-400">
                      R$ {(resumo?.totalCmvPeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações Regulatórias */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#2d2d2d] text-xs text-gray-400 space-y-2">
                <div className="font-semibold text-gray-300 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  Conformidade Fiscal e CPC 16 (R1)
                </div>
                <p>
                  • <strong>Exclusão de Tributos Recuperáveis:</strong> Os créditos de ICMS (LC 87/96), PIS e COFINS não-cumulativos (Leis 10.637/02 e 10.833/03) foram deduzidos do valor de aquisição, compondo o custo puro do produto.
                </p>
                <p>
                  • <strong>Inventário Periódico e Permanente:</strong> O sistema mantém apuração contínua pelo método da Média Ponderada Móvel, atendendo expressamente ao RIR/2018 Art. 299 e Bloco H da EFD ICMS/IPI.
                </p>
              </div>
            </div>

            {/* Painel de Integração Contábil */}
            <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Integração no Diário Geral
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Geração automática do lançamento contábil de apuração do CMV no encerramento da competência {competencia}.
                </p>

                <div className="space-y-3 bg-[#202020] p-3.5 rounded-lg border border-[#2f2f2f] text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block">PARTIDA A DÉBITO:</span>
                    <span className="text-white font-medium">4.01.01.01.001 - CMV / Custo das Mercadorias</span>
                    <span className="text-emerald-400 font-mono block mt-0.5">R$ {(resumo?.totalCmvPeriodoBRL || 0).toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t border-[#333333]">
                    <span className="text-[10px] text-gray-500 font-bold block">PARTIDA A CRÉDITO:</span>
                    <span className="text-white font-medium">1.01.04.01.001 - Estoque de Mercadorias para Revenda</span>
                    <span className="text-emerald-400 font-mono block mt-0.5">R$ {(resumo?.totalCmvPeriodoBRL || 0).toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t border-[#333333] text-[11px] text-gray-400">
                    Histórico Padrão: <em>Apuração Mensal do CMV da competência {competencia}</em>
                  </div>
                </div>
              </div>

              <button
                onClick={handleIntegrarCmv}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Integrar CMV ao Diário Geral
              </button>
            </div>
          </div>
        )}

        {/* ABA 4: LAUDO DE INVENTÁRIO A4 */}
        {activeTab === 'laudoA4' && (
          <div className="flex justify-center">
            <div className="w-[210mm] bg-[#1a1a1a] text-gray-200 border border-[#333333] p-10 shadow-2xl rounded-sm print:m-0 print:border-none print:shadow-none text-xs">
              {/* Cabeçalho A4 */}
              <div className="border-b-2 border-emerald-500 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    DEMONSTRATIVO OFICIAL DE INVENTÁRIO FÍSICO-FINANCEIRO
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Apuração de Estoques, Ficha Kardex e Custo das Mercadorias Vendidas (CMV)
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    Conformidade CPC 16 (R1) • Pronunciamento Técnico CPC nº 16 • RIR/2018 Art. 299
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">EMPRESA MODELO S/A</div>
                  <div className="text-[10px] text-gray-400">CNPJ: 00.000.000/0001-91</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">Competência: {competencia}</div>
                </div>
              </div>

              {/* Resumo da Posição */}
              <div className="mb-6 grid grid-cols-3 gap-4 p-3 bg-[#222222] border border-[#333333] rounded">
                <div>
                  <span className="text-[10px] text-gray-400 block">TOTAL DE ITENS NO INVENTÁRIO:</span>
                  <span className="text-sm font-bold text-white font-mono">{resumo?.totalProdutosApurados || 0} produtos</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">SALDO DO ESTOQUE FINAL:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    R$ {(resumo?.valorTotalEstoqueBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">CMV / CPV COMPUTADO:</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    R$ {(resumo?.totalCmvPeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Tabela do Inventário */}
              <table className="w-full text-left text-[11px] border-collapse mb-8">
                <thead>
                  <tr className="border-b border-gray-600 font-semibold text-gray-300">
                    <th className="py-1.5 px-2">Código</th>
                    <th className="py-1.5 px-2">Descrição do Produto</th>
                    <th className="py-1.5 px-2">NCM</th>
                    <th className="py-1.5 px-2">UN</th>
                    <th className="py-1.5 px-2 text-right">Qtd Final</th>
                    <th className="py-1.5 px-2 text-right">Custo Médio</th>
                    <th className="py-1.5 px-2 text-right">Valor Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {resumo?.fichas.map((f) => (
                    <tr key={f.id}>
                      <td className="py-1.5 px-2 font-mono text-emerald-400">{f.codigoProduto}</td>
                      <td className="py-1.5 px-2 text-white">{f.descricao}</td>
                      <td className="py-1.5 px-2 font-mono text-gray-400">{f.ncm}</td>
                      <td className="py-1.5 px-2 text-gray-400">{f.unidadeMedida}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-white">{f.saldoFinalQuantidade}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-gray-300">R$ {f.custoMedioFinalBRL.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-400">
                        R$ {f.saldoFinalValorTotalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-500 font-bold text-white">
                    <td colSpan={6} className="py-2 px-2 text-right">VALOR TOTAL DO INVENTÁRIO FÍSICO-FINANCEIRO:</td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-400">
                      R$ {(resumo?.valorTotalEstoqueBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Termo de Encerramento e Assinaturas */}
              <div className="mt-12 pt-8 border-t border-[#333333] grid grid-cols-2 gap-12 text-center text-[10px] text-gray-400">
                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    DIRETORIA ADMINISTRATIVA / CONTROLE DE ESTOQUE
                  </div>
                  <div>Responsável pelo Inventário Físico</div>
                </div>

                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    CONTADOR RESPONSÁVEL TÉCNICO
                  </div>
                  <div>CRC 1SP999999/O-0</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO PRODUTO */}
      {modalProduto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1c] border border-[#333333] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              Cadastrar Produto para Controle Permanente
            </h3>

            <form onSubmit={handleSalvarProduto} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Código do Produto (SPED 0200):</label>
                <input
                  type="text"
                  value={formProdCodigo}
                  onChange={(e) => setFormProdCodigo(e.target.value)}
                  placeholder="Ex: PROD-701"
                  required
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descrição do Item:</label>
                <input
                  type="text"
                  value={formProdDescricao}
                  onChange={(e) => setFormProdDescricao(e.target.value)}
                  placeholder="Ex: Sensor Óptico Industrial 24V"
                  required
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">NCM:</label>
                  <input
                    type="text"
                    value={formProdNcm}
                    onChange={(e) => setFormProdNcm(e.target.value)}
                    placeholder="8471.50.10"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Unidade de Medida:</label>
                  <input
                    type="text"
                    value={formProdUnidade}
                    onChange={(e) => setFormProdUnidade(e.target.value)}
                    placeholder="UN, KG, M, CX"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Item:</label>
                  <select
                    value={formProdTipo}
                    onChange={(e) => setFormProdTipo(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MERCADORIA_REVENDA">Mercadoria para Revenda</option>
                    <option value="MATERIA_PRIMA">Matéria-Prima</option>
                    <option value="PRODUTO_ACABADO">Produto Acabado</option>
                    <option value="EMBALAGEM">Embalagem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Método de Custeio:</label>
                  <select
                    value={formProdMetodo}
                    onChange={(e) => setFormProdMetodo(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MEDIA_PONDERADA_MOVEL">Média Ponderada Móvel</option>
                    <option value="PEPS_FIFO">PEPS / FIFO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Saldo Inicial (Qtd):</label>
                  <input
                    type="number"
                    value={formProdSaldoQtd}
                    onChange={(e) => setFormProdSaldoQtd(Number(e.target.value))}
                    min="0"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Custo Unitário Inicial (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProdCustoUnit}
                    onChange={(e) => setFormProdCustoUnit(Number(e.target.value))}
                    min="0"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setModalProduto(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO MOVIMENTO KARDEX */}
      {modalMovimento && produtoSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1c] border border-[#333333] rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Lançar Movimento Kardex
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Item: <strong className="text-white">{produtoSelecionado.codigoProduto} - {produtoSelecionado.descricao}</strong>
            </p>

            <form onSubmit={handleSalvarMovimento} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Tipo da Movimentação:</label>
                <select
                  value={formMovTipo}
                  onChange={(e) => setFormMovTipo(e.target.value as any)}
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="SAIDA_VENDA">Saída por Venda (CMV)</option>
                  <option value="ENTRADA_COMPRA">Entrada por Compra (Aquisição)</option>
                  <option value="ENTRADA_PRODUCAO">Entrada por Produção (CPV)</option>
                  <option value="SAIDA_CONSUMO_PROCESSO">Saída p/ Consumo no Processo</option>
                  <option value="AJUSTE_INVENTARIO_PERDA">Ajuste de Inventário (Perda)</option>
                  <option value="AJUSTE_INVENTARIO_GANHO">Ajuste de Inventário (Ganho)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Data:</label>
                  <input
                    type="date"
                    value={formMovData}
                    onChange={(e) => setFormMovData(e.target.value)}
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Documento / NF-e:</label>
                  <input
                    type="text"
                    value={formMovDoc}
                    onChange={(e) => setFormMovDoc(e.target.value)}
                    placeholder="NF-e 001.234"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Quantidade ({produtoSelecionado.unidadeMedida}):</label>
                  <input
                    type="number"
                    value={formMovQtd}
                    onChange={(e) => setFormMovQtd(Number(e.target.value))}
                    min="1"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">
                    {formMovTipo.startsWith('ENTRADA') ? 'Custo Unit. Líquido (R$):' : 'Custo Unit. Automático (R$):'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formMovCustoUnit || (formMovTipo.startsWith('SAIDA') ? produtoSelecionado.custoMedioFinalBRL : '')}
                    onChange={(e) => setFormMovCustoUnit(Number(e.target.value))}
                    disabled={formMovTipo.startsWith('SAIDA')}
                    placeholder={`R$ ${produtoSelecionado.custoMedioFinalBRL.toFixed(2)}`}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setModalMovimento(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
