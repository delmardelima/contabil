import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileText,
  DollarSign,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Send,
  Database,
  Search,
  ExternalLink,
  Percent,
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  BookOpen,
  Archive,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { BalancoAberturaEmpresa, ItemBalancoAbertura, ResumoBalancosAbertura } from '../../types/contabil';

export const BalancoAberturaModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoBalancosAbertura | null>(null);
  const [selectedBalanco, setSelectedBalanco] = useState<BalancoAberturaEmpresa | null>(null);
  const [activeTab, setActiveTab] = useState<'quadro' | 'criterios' | 'termos' | 'lancamentos'>('quadro');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [modalImprimir, setModalImprimir] = useState(false);
  const [modalNovoItem, setModalNovoItem] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form novo item patrimonial
  const [novoItemContaId, setNovoItemContaId] = useState(1);
  const [novoItemClassificacao, setNovoItemClassificacao] = useState('1.1.1.01.001');
  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemGrupo, setNovoItemGrupo] = useState<'ATIVO_CIRCULANTE' | 'ATIVO_NAO_CIRCULANTE' | 'PASSIVO_CIRCULANTE' | 'PASSIVO_NAO_CIRCULANTE' | 'PATRIMONIO_LIQUIDO'>('ATIVO_CIRCULANTE');
  const [novoItemNatureza, setNovoItemNatureza] = useState<'DEVEDORA' | 'CREDORA'>('DEVEDORA');
  const [novoItemSaldo, setNovoItemSaldo] = useState('');
  const [novoItemCriterio, setNovoItemCriterio] = useState<'CUSTO_HISTORICO' | 'CUSTO_ATRIBUIDO_VALOR_JUSTO' | 'CONCILIACAO_DOCUMENTAL'>('CONCILIACAO_DOCUMENTAL');
  const [novoItemSuporte, setNovoItemSuporte] = useState('');

  const carregarDados = () => {
    try {
      const data = dbService.getBalancosAbertura();
      setResumo(data);
      if (data.balancos.length > 0) {
        if (!selectedBalanco || !data.balancos.some(b => b.id === selectedBalanco.id)) {
          setSelectedBalanco(data.balancos[0]);
        } else {
          const atual = data.balancos.find(b => b.id === selectedBalanco.id);
          if (atual) setSelectedBalanco(atual);
        }
      }
    } catch (e: any) {
      setMensagemErro('Erro ao carregar balanço de abertura: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleFecharEIntegrar = (id: string) => {
    const res = dbService.fecharEIntegrarBalancoAbertura(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleAdicionarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBalanco) return;

    const saldo = parseFloat(novoItemSaldo);
    if (isNaN(saldo) || saldo <= 0) {
      setMensagemErro('Informe um saldo inicial válido maior que zero.');
      return;
    }

    const novoItem: ItemBalancoAbertura = {
      id: `abert-item-${Date.now()}`,
      contaContabilId: novoItemContaId,
      classificacaoConta: novoItemClassificacao,
      nomeConta: novoItemNome || 'Conta do Balanço de Abertura',
      grupo: novoItemGrupo,
      natureza: novoItemNatureza,
      saldoInicialBRL: saldo,
      criterioAvaliacao: novoItemCriterio,
      documentoSuporte: novoItemSuporte || 'Levantamento Físico e Conciliação Documental'
    };

    const novosItens = [...selectedBalanco.itens, novoItem];
    const totalAtivo = novosItens
      .filter(i => i.grupo === 'ATIVO_CIRCULANTE' || i.grupo === 'ATIVO_NAO_CIRCULANTE')
      .reduce((acc, i) => acc + (i.natureza === 'DEVEDORA' ? i.saldoInicialBRL : -i.saldoInicialBRL), 0);
    const totalPassivo = novosItens
      .filter(i => i.grupo === 'PASSIVO_CIRCULANTE' || i.grupo === 'PASSIVO_NAO_CIRCULANTE')
      .reduce((acc, i) => acc + i.saldoInicialBRL, 0);
    const totalPL = novosItens
      .filter(i => i.grupo === 'PATRIMONIO_LIQUIDO')
      .reduce((acc, i) => acc + i.saldoInicialBRL, 0);

    const diferenca = totalAtivo - (totalPassivo + totalPL);

    const balancoAtualizado: BalancoAberturaEmpresa = {
      ...selectedBalanco,
      itens: novosItens,
      totalAtivoInicialBRL: totalAtivo,
      totalPassivoExigivelInicialBRL: totalPassivo,
      patrimonioLiquidoAberturaBRL: totalPL,
      diferencaBalanceamentoBRL: diferenca
    };

    dbService.salvarBalancoAbertura(balancoAtualizado);
    setSelectedBalanco(balancoAtualizado);
    setModalNovoItem(false);
    setNovoItemNome('');
    setNovoItemSaldo('');
    setNovoItemSuporte('');
    setMensagemSucesso('Item patrimonial inserido no Balanço de Abertura.');
    carregarDados();
  };

  const balancoAtual = selectedBalanco || (resumo && resumo.balancos[0]) || null;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Balanço de Abertura & Transição Contábil
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                ITG 1000 / NBC TG 1000
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                Resolução CFC nº 1.418/2012
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-800">
                Domínio CTSALDO
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Levantamento Patrimonial Físico e Documental, Custo Atribuído (Deemed Cost) e Transição para Escrituração Regular
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => carregarDados()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
          {balancoAtual && (
            <>
              <button
                onClick={() => setModalNovoItem(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Item Patrimonial</span>
              </button>
              <button
                onClick={() => handleFecharEIntegrar(balancoAtual.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded transition shadow-sm ${
                  balancoAtual.statusBalanco === 'FECHADO_INTEGRADO'
                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{balancoAtual.statusBalanco === 'FECHADO_INTEGRADO' ? 'Balanço Integrado' : 'Fechar & Integrar Diário'}</span>
              </button>
              <button
                onClick={() => setModalImprimir(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Balanço Oficial A4</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center justify-between text-emerald-200 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center justify-between text-rose-200 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4">
        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Ativo Total Inicial</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {(balancoAtual?.totalAtivoInicialBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Bens e Direitos apurados na abertura</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Passivo Exigível Inicial</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 tracking-tight">
            R$ {(balancoAtual?.totalPassivoExigivelInicialBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Dívidas, Fornecedores e Obrigações</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Patrimônio Líquido de Abertura</span>
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-300 tracking-tight">
            R$ {(balancoAtual?.patrimonioLiquidoAberturaBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-400/80 mt-1">Capital Social + Lucros Acumulados</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Diferença Balanceamento</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className={`text-xl font-bold tracking-tight ${
            Math.abs(balancoAtual?.diferencaBalanceamentoBRL || 0) < 0.01 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            R$ {(balancoAtual?.diferencaBalanceamentoBRL || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {Math.abs(balancoAtual?.diferencaBalanceamentoBRL || 0) < 0.01 ? 'Balanceamento Exato (D = C)' : 'Divergência Ativo vs Passivo+PL'}
          </div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Status do Balanço</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-300 tracking-tight flex items-center space-x-1.5 mt-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{balancoAtual?.statusBalanco.replace('_', ' ')}</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Data Corte: {balancoAtual?.dataCorteAbertura || '01/01/2026'}</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 px-6 border-b border-gray-800 bg-[#161616]">
        <button
          onClick={() => setActiveTab('quadro')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'quadro'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Quadro Patrimonial de Abertura ({balancoAtual?.itens.length || 0} Contas)</span>
        </button>
        <button
          onClick={() => setActiveTab('criterios')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'criterios'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Critérios de Mensuração & Laudos</span>
        </button>
        <button
          onClick={() => setActiveTab('termos')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'termos'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Termos de Abertura e Encerramento</span>
        </button>
        <button
          onClick={() => setActiveTab('lancamentos')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'lancamentos'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Partidas Dobradas no Diário Geral</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto p-6">
        {/* Tab 1: Quadro Patrimonial */}
        {activeTab === 'quadro' && balancoAtual && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar contas por classificação ou nome..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Classificação</th>
                    <th className="py-3 px-4">Denominação da Conta</th>
                    <th className="py-3 px-4">Grupo Patrimonial</th>
                    <th className="py-3 px-4">Critério de Avaliação</th>
                    <th className="py-3 px-4">Documento de Suporte</th>
                    <th className="py-3 px-4 text-center">Nat</th>
                    <th className="py-3 px-4 text-right">Saldo Inicial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {balancoAtual.itens
                    .filter(i => 
                      i.classificacaoConta.includes(filtroTexto) ||
                      i.nomeConta.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                      i.documentoSuporte.toLowerCase().includes(filtroTexto.toLowerCase())
                    )
                    .map(item => (
                      <tr key={item.id} className="hover:bg-gray-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          {item.classificacaoConta}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          {item.nomeConta}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gray-800 text-gray-300 border border-gray-700">
                            {item.grupo.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">
                          {item.criterioAvaliacao.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-300 font-mono">
                          {item.documentoSuporte}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={`px-1.5 py-0.5 text-[10px] rounded ${
                            item.natureza === 'DEVEDORA' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}>
                            {item.natureza === 'DEVEDORA' ? 'D' : 'C'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          R$ {item.saldoInicialBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot className="bg-[#1f1f1f] font-mono font-bold text-white border-t border-gray-700">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-right font-sans">TOTAL DO ATIVO INICIAL:</td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      R$ {balancoAtual.totalAtivoInicialBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-right font-sans">TOTAL DO PASSIVO + PATRIMÔNIO LÍQUIDO:</td>
                    <td className="py-3 px-4 text-right text-blue-400">
                      R$ {(balancoAtual.totalPassivoExigivelInicialBRL + balancoAtual.patrimonioLiquidoAberturaBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Critérios de Mensuração */}
        {activeTab === 'criterios' && balancoAtual && (
          <div className="space-y-6">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Critérios Técnicos de Mensuração Patrimonial na Data de Abertura</span>
                  <span className="text-xs font-mono text-emerald-400">ITG 1000 Item 11 / NBC TG 1000</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Exigências de suporte documental e laudos de avaliação física para início da escrituração
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Estoques */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center space-x-1.5 border-b border-gray-800 pb-2">
                  <Archive className="w-4 h-4 text-amber-400" />
                  <span>1. Inventário Físico de Estoques</span>
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  Avaliado pelo custo histórico de aquisição mais recente ou valor realizável líquido. Registro no Livro Modelo 7 com código NCM, quantidade física conferida em 31/12/2025.
                </p>
                <div className="p-2.5 bg-gray-900 rounded font-mono text-[11px] text-emerald-400">
                  Total Estoques: R$ 160.000,00
                </div>
              </div>

              {/* Imobilizado Deemed Cost */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center space-x-1.5 border-b border-gray-800 pb-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>2. Imobilizado a Custo Atribuído</span>
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  Aplicação da faculdade do Custo Atribuído (*Deemed Cost*) na data de transição para o modelo formal. Máquinas e veículos mensurados a valor de mercado com suporte de laudo pericial.
                </p>
                <div className="p-2.5 bg-gray-900 rounded font-mono text-[11px] text-blue-400">
                  Imobilizado Líquido: R$ 150.000,00
                </div>
              </div>

              {/* Conciliação Financeira */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center space-x-1.5 border-b border-gray-800 pb-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>3. Conciliação Bancária & Circularização</span>
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  Confronto dos saldos das contas bancárias com os extratos em 31/12/2025 e confirmação das duplicatas a receber de clientes e a pagar a fornecedores.
                </p>
                <div className="p-2.5 bg-gray-900 rounded font-mono text-[11px] text-purple-400">
                  Disponibilidades: R$ 115.000,00
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Termos de Abertura */}
        {activeTab === 'termos' && balancoAtual && (
          <div className="space-y-6">
            <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Termo de Abertura do Livro Diário
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-serif bg-gray-900/60 p-4 rounded border border-gray-800">
                "{balancoAtual.termoAberturaTexto}"
              </p>
            </div>

            <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Termo de Encerramento do Balanço de Abertura
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-serif bg-gray-900/60 p-4 rounded border border-gray-800">
                "{balancoAtual.termoEncerramentoTexto}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 p-5 bg-[#181818] rounded-xl border border-gray-800 text-xs font-mono">
              <div>
                <div className="text-gray-400 font-sans">Contador Responsável:</div>
                <div className="font-bold text-white text-sm">{balancoAtual.contadorNome}</div>
                <div className="text-blue-400">{balancoAtual.contadorCrc}</div>
              </div>
              <div>
                <div className="text-gray-400 font-sans">Representante Legal:</div>
                <div className="font-bold text-white text-sm">{balancoAtual.representanteLegalNome}</div>
                <div className="text-gray-400">CPF: {balancoAtual.representanteLegalCpf}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Partidas Dobradas */}
        {activeTab === 'lancamentos' && balancoAtual && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Partidas Dobradas Geradas no Diário Geral</span>
                  <span className="text-xs font-mono text-emerald-400">Contrapartida Conta Transitória de Abertura</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Mapeamento de débito e crédito no diário com balanceamento rigoroso zero
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818] p-4 font-mono text-xs text-gray-300 space-y-2">
              <div className="text-gray-400 font-sans border-b border-gray-800 pb-2">
                Partidas Dobradas de Abertura em {balancoAtual.dataCorteAbertura}:
              </div>
              {balancoAtual.itens.map((item, idx) => (
                <div key={item.id} className="p-2 bg-gray-900/50 rounded flex justify-between items-center">
                  <div>
                    <span className="text-blue-400 font-bold">{idx + 1}. </span>
                    {item.natureza === 'DEVEDORA' ? (
                      <>
                        <span className="text-emerald-400 font-bold">D - </span>
                        <span>{item.classificacaoConta} ({item.nomeConta}) / </span>
                        <span className="text-rose-400 font-bold">C - </span>
                        <span className="text-gray-400">Conta Transitória de Abertura</span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-400 font-bold">D - </span>
                        <span className="text-gray-400">Conta Transitória de Abertura / </span>
                        <span className="text-rose-400 font-bold">C - </span>
                        <span>{item.classificacaoConta} ({item.nomeConta})</span>
                      </>
                    )}
                  </div>
                  <div className="font-bold text-white">
                    R$ {item.saldoInicialBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Balanço Oficial A4 Timbrado */}
      {modalImprimir && balancoAtual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-gray-900 w-full max-w-4xl h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col font-sans p-8 print:p-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-300 print:hidden">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Visualização de Impressão A4 - Balanço Patrimonial de Abertura Oficial
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Balanço</span>
                </button>
                <button
                  onClick={() => setModalImprimir(false)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="border border-gray-400 p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Header Timbrado */}
                <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
                  <div>
                    <h2 className="text-lg font-black tracking-tight uppercase text-gray-900">
                      {balancoAtual.razaoSocial}
                    </h2>
                    <div className="text-xs text-gray-600">
                      CNPJ: {balancoAtual.cnpj} | Norma: {balancoAtual.normaAdotada.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Escrituração Contábil Regular por Partidas Dobradas - Conselho Federal de Contabilidade
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-2.5 py-1 bg-gray-900 text-white font-mono text-xs font-bold uppercase rounded">
                      BALANÇO DE ABERTURA
                    </div>
                    <div className="text-xs font-mono font-bold text-gray-800 mt-1">
                      Data: {balancoAtual.dataCorteAbertura}
                    </div>
                  </div>
                </div>

                <div className="text-center my-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    BALANÇO PATRIMONIAL INICIAL DE ABERTURA
                  </h3>
                  <p className="text-xs text-gray-600">
                    Levantado com base na Resolução CFC nº 1.418/2012 (ITG 1000) e NBC TG 1000
                  </p>
                </div>

                {/* Termo de Abertura */}
                <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-700 italic font-serif">
                  "{balancoAtual.termoAberturaTexto}"
                </div>

                {/* Grid do Balanço */}
                <div className="grid grid-cols-2 gap-6 mt-4">
                  {/* Ativo */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-900 border-b border-gray-800 pb-1">
                      ATIVO
                    </h4>
                    <table className="w-full text-xs font-mono mt-1">
                      <tbody className="divide-y divide-gray-200">
                        {balancoAtual.itens
                          .filter(i => i.grupo === 'ATIVO_CIRCULANTE' || i.grupo === 'ATIVO_NAO_CIRCULANTE')
                          .map(i => (
                            <tr key={i.id}>
                              <td className="py-1 text-gray-600">{i.classificacaoConta}</td>
                              <td className="py-1 font-sans font-medium text-gray-900">{i.nomeConta}</td>
                              <td className="py-1 text-right font-bold">R$ {i.saldoInicialBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        <tr className="border-t-2 border-gray-800 font-bold bg-gray-50">
                          <td colSpan={2} className="py-1.5 font-sans">TOTAL DO ATIVO:</td>
                          <td className="py-1.5 text-right">R$ {balancoAtual.totalAtivoInicialBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Passivo e PL */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-900 border-b border-gray-800 pb-1">
                      PASSIVO E PATRIMÔNIO LÍQUIDO
                    </h4>
                    <table className="w-full text-xs font-mono mt-1">
                      <tbody className="divide-y divide-gray-200">
                        {balancoAtual.itens
                          .filter(i => i.grupo === 'PASSIVO_CIRCULANTE' || i.grupo === 'PASSIVO_NAO_CIRCULANTE' || i.grupo === 'PATRIMONIO_LIQUIDO')
                          .map(i => (
                            <tr key={i.id}>
                              <td className="py-1 text-gray-600">{i.classificacaoConta}</td>
                              <td className="py-1 font-sans font-medium text-gray-900">{i.nomeConta}</td>
                              <td className="py-1 text-right font-bold">R$ {i.saldoInicialBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        <tr className="border-t-2 border-gray-800 font-bold bg-gray-50">
                          <td colSpan={2} className="py-1.5 font-sans">TOTAL PASSIVO + PL:</td>
                          <td className="py-1.5 text-right">R$ {(balancoAtual.totalPassivoExigivelInicialBRL + balancoAtual.patrimonioLiquidoAberturaBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Termo de Encerramento */}
                <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-700 italic font-serif mt-4">
                  "{balancoAtual.termoEncerramentoTexto}"
                </div>
              </div>

              {/* Assinaturas */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-300 text-center text-xs">
                <div>
                  <div className="border-b border-gray-600 mb-1 w-64 mx-auto"></div>
                  <div className="font-bold text-gray-900">{balancoAtual.representanteLegalNome}</div>
                  <div className="text-gray-600">Sócio-Administrador / Representante Legal</div>
                  <div className="text-gray-500 text-[10px]">CPF: {balancoAtual.representanteLegalCpf}</div>
                </div>
                <div>
                  <div className="border-b border-gray-600 mb-1 w-64 mx-auto"></div>
                  <div className="font-bold text-gray-900">{balancoAtual.contadorNome}</div>
                  <div className="text-gray-600">Contador Responsável Técnico</div>
                  <div className="text-gray-500 text-[10px]">{balancoAtual.contadorCrc}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Item */}
      {modalNovoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 text-gray-100 w-full max-w-md rounded-xl shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Novo Item do Balanço de Abertura</span>
              </h3>
              <button onClick={() => setModalNovoItem(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdicionarItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Classificação Contábil</label>
                <input
                  type="text"
                  placeholder="Ex: 1.1.1.02.003"
                  value={novoItemClassificacao}
                  onChange={e => setNovoItemClassificacao(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Denominação da Conta</label>
                <input
                  type="text"
                  placeholder="Ex: Banco Santander S/A"
                  value={novoItemNome}
                  onChange={e => setNovoItemNome(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Grupo Patrimonial</label>
                  <select
                    value={novoItemGrupo}
                    onChange={e => setNovoItemGrupo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ATIVO_CIRCULANTE">Ativo Circulante</option>
                    <option value="ATIVO_NAO_CIRCULANTE">Ativo Não Circulante</option>
                    <option value="PASSIVO_CIRCULANTE">Passivo Circulante</option>
                    <option value="PASSIVO_NAO_CIRCULANTE">Passivo Não Circulante</option>
                    <option value="PATRIMONIO_LIQUIDO">Patrimônio Líquido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Natureza</label>
                  <select
                    value={novoItemNatureza}
                    onChange={e => setNovoItemNatureza(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DEVEDORA">Devedora (Ativo)</option>
                    <option value="CREDORA">Credora (Passivo / PL)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Saldo Inicial (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={novoItemSaldo}
                  onChange={e => setNovoItemSaldo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Critério de Avaliação</label>
                <select
                  value={novoItemCriterio}
                  onChange={e => setNovoItemCriterio(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="CONCILIACAO_DOCUMENTAL">Conciliação Documental / Extratos</option>
                  <option value="CUSTO_HISTORICO">Custo Histórico</option>
                  <option value="CUSTO_ATRIBUIDO_VALOR_JUSTO">Custo Atribuído / Valor Justo (Deemed Cost)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Documento de Suporte</label>
                <input
                  type="text"
                  placeholder="Ex: Extrato Bancário 31/12 ou Laudo Pericial"
                  value={novoItemSuporte}
                  onChange={e => setNovoItemSuporte(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovoItem(false)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm"
                >
                  Adicionar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
