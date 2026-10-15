import React, { useState } from 'react';
import { ContaContabil, TipoConta, NaturezaConta } from '../../types/contabil';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Download, 
  X, 
  ShieldCheck, 
  Tag, 
  PieChart
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface PlanoContasModuleProps {
  contas: ContaContabil[];
  empresaId: number;
  mascaraPlano: string;
  onSaveConta: (conta: ContaContabil) => void;
  onDeleteConta: (id: number) => void;
}

// Planos Referenciais Oficiais SPED ECD/ECF (RFB)
const PLANO_REFERENCIAL_RFB = [
  { codigo: '1.01.01.01.00', descricao: 'Caixa Geral da RFB', natureza: '01' },
  { codigo: '1.01.01.02.00', descricao: 'Bancos Conta Movimento no País', natureza: '01' },
  { codigo: '1.01.01.03.00', descricao: 'Aplicações de Liquidez Imediata', natureza: '01' },
  { codigo: '1.01.02.01.00', descricao: 'Clientes Nacionais - Duplicatas a Receber', natureza: '01' },
  { codigo: '1.01.04.01.00', descricao: 'Estoques de Mercadorias para Revenda', natureza: '01' },
  { codigo: '1.01.05.01.00', descricao: 'Tributos a Compensar / Recuperar (ICMS/PIS/COFINS)', natureza: '01' },
  { codigo: '1.02.02.01.00', descricao: 'Máquinas, Equipamentos e Instalações', natureza: '01' },
  { codigo: '1.02.02.02.00', descricao: 'Equipamentos de Informática e Computadores', natureza: '01' },
  { codigo: '1.02.02.99.00', descricao: '(-) Depreciação Acumulada do Imobilizado', natureza: '01' },
  { codigo: '2.01.01.01.00', descricao: 'Fornecedores Nacionais no País', natureza: '02' },
  { codigo: '2.01.02.01.00', descricao: 'Obrigações Trabalhistas e Previdenciárias a Pagar', natureza: '02' },
  { codigo: '2.01.03.01.00', descricao: 'Tributos Federais a Recolher (Simples/IRPJ/CSLL/PIS)', natureza: '02' },
  { codigo: '2.01.03.02.00', descricao: 'Tributos Estaduais e Municipais a Recolher (ICMS/ISS)', natureza: '02' },
  { codigo: '2.03.01.01.00', descricao: 'Capital Social Subscrito e Integralizado', natureza: '03' },
  { codigo: '2.03.04.01.00', descricao: 'Lucros ou Prejuízos Acumulados', natureza: '03' },
  { codigo: '3.01.01.01.00', descricao: 'Receita Bruta sobre Vendas de Mercadorias', natureza: '04' },
  { codigo: '3.01.01.02.00', descricao: 'Receita Bruta sobre Serviços Prestados', natureza: '04' },
  { codigo: '3.01.01.05.00', descricao: '(-) Deduções da Receita Bruta e Tributos Faturados', natureza: '04' },
  { codigo: '3.02.01.01.00', descricao: 'Custos das Mercadorias Vendidas (CMV)', natureza: '04' },
  { codigo: '3.03.01.01.00', descricao: 'Despesas com Pessoal e Encargos Sociais', natureza: '04' },
  { codigo: '3.03.01.02.00', descricao: 'Despesas Administrativas e Gerais de Escritório', natureza: '04' },
  { codigo: '3.03.01.03.00', descricao: 'Despesas e Receitas Financeiras Líquidas', natureza: '04' }
];

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
  const [contaEmEdicao, setContaEmEdicao] = useState<ContaContabil | null>(null);

  // Campos do formulário
  const [classificacao, setClassificacao] = useState('');
  const [codigoReduzido, setCodigoReduzido] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoConta>('A');
  const [natureza, setNatureza] = useState<NaturezaConta>('D');
  const [grau, setGrau] = useState<number>(5);
  const [codigoReferencialRFB, setCodigoReferencialRFB] = useState('');
  const [naturezaSped, setNaturezaSped] = useState<'01' | '02' | '03' | '04' | '05'>('01');
  const [exigeCentroCusto, setExigeCentroCusto] = useState(false);
  const [ativa, setAtiva] = useState(true);
  const [formErro, setFormErro] = useState('');

  const contasFiltradas = contas
    .filter(c => {
      if (filtroTipo !== 'TODOS' && c.tipo !== filtroTipo) return false;
      if (!busca) return true;
      const b = busca.toLowerCase();
      return (
        c.nome.toLowerCase().includes(b) ||
        c.classificacao.includes(b) ||
        c.codigoReduzido.toString().includes(b) ||
        (c.codigoReferencialRFB || '').includes(b)
      );
    })
    .sort((a, b) => a.classificacao.localeCompare(b.classificacao, undefined, { numeric: true }));

  const handleAbrirNovaConta = () => {
    setContaEmEdicao(null);
    setClassificacao('');
    // Próximo código reduzido
    const proximoReduzido = contas.reduce((max, c) => Math.max(max, c.codigoReduzido || 0), 0) + 1;
    setCodigoReduzido(String(proximoReduzido));
    setNome('');
    setTipo('A');
    setNatureza('D');
    setGrau(5);
    setCodigoReferencialRFB('');
    setNaturezaSped('01');
    setExigeCentroCusto(false);
    setAtiva(true);
    setFormErro('');
    setShowModal(true);
  };

  const handleAbrirEdicao = (c: ContaContabil) => {
    setContaEmEdicao(c);
    setClassificacao(c.classificacao);
    setCodigoReduzido(String(c.codigoReduzido));
    setNome(c.nome);
    setTipo(c.tipo);
    setNatureza(c.natureza);
    setGrau(c.grau);
    setCodigoReferencialRFB(c.codigoReferencialRFB || '');
    setNaturezaSped(c.naturezaSped || (c.natureza === 'D' ? '01' : '02'));
    setExigeCentroCusto(c.exigeCentroCusto || false);
    setAtiva(c.ativa !== false);
    setFormErro('');
    setShowModal(true);
  };

  const handleSalvarConta = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErro('');

    if (!classificacao.trim() || !nome.trim() || !codigoReduzido.trim()) {
      setFormErro('Preencha os campos obrigatórios: Classificação, Reduzido e Nome.');
      return;
    }

    const codRed = parseInt(codigoReduzido, 10);
    if (isNaN(codRed)) {
      setFormErro('Código reduzido inválido.');
      return;
    }

    const contaSalva: ContaContabil = {
      id: contaEmEdicao ? contaEmEdicao.id : Date.now(),
      empresaId,
      classificacao: classificacao.trim(),
      codigoReduzido: codRed,
      nome: nome.trim(),
      tipo,
      natureza,
      grau,
      saldoAnterior: contaEmEdicao ? contaEmEdicao.saldoAnterior : 0,
      codigoReferencialRFB: codigoReferencialRFB || undefined,
      naturezaSped,
      exigeCentroCusto,
      ativa
    };

    onSaveConta(contaSalva);
    setShowModal(false);
  };

  const handleExportarCSV = () => {
    const headers = [
      'Classificação', 'Cód. Reduzido', 'Descrição da Conta', 'Tipo', 'Natureza', 
      'Grau', 'Cód. Ref. RFB (SPED)', 'Nat. SPED', 'Centro Custo', 'Saldo Anterior', 'Status'
    ];
    const rows = contasFiltradas.map(c => [
      c.classificacao,
      c.tipo === 'A' ? c.codigoReduzido : '-',
      c.nome,
      c.tipo === 'S' ? 'Sintética' : 'Analítica',
      c.natureza === 'D' ? 'Devedora' : 'Credora',
      c.grau,
      c.codigoReferencialRFB || '-',
      c.naturezaSped || '-',
      c.exigeCentroCusto ? 'Sim' : 'Não',
      c.saldoAnterior,
      c.ativa !== false ? 'Ativa' : 'Inativa'
    ]);
    exportToCSV(`Plano_de_Contas_Empresa_${empresaId}`, rows, headers);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Barra de Filtros e Ações de Topo */}
      <div className="px-4 py-3 bg-[#1c1c1c] border-b border-white/10 flex items-center justify-between text-xs flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-semibold text-neutral-200">
            <FolderTree className="w-4 h-4 text-blue-400" />
            <span>Plano de Contas Oficial (CTCONTA / SPED ECD)</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Máscara */}
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <span>Máscara:</span>
            <span className="font-mono font-bold text-blue-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/5">
              {mascaraPlano}
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Filtro Sintética / Analítica */}
          <div className="flex items-center bg-neutral-900 rounded p-0.5 border border-white/10">
            <button
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-2.5 py-1 rounded text-xs transition ${filtroTipo === 'TODOS' ? 'bg-blue-600 text-white font-medium shadow' : 'text-neutral-400 hover:text-white'}`}
            >
              Todas ({contas.length})
            </button>
            <button
              onClick={() => setFiltroTipo('S')}
              className={`px-2.5 py-1 rounded text-xs transition ${filtroTipo === 'S' ? 'bg-blue-600 text-white font-medium shadow' : 'text-neutral-400 hover:text-white'}`}
            >
              Sintéticas
            </button>
            <button
              onClick={() => setFiltroTipo('A')}
              className={`px-2.5 py-1 rounded text-xs transition ${filtroTipo === 'A' ? 'bg-blue-600 text-white font-medium shadow' : 'text-neutral-400 hover:text-white'}`}
            >
              Analíticas
            </button>
          </div>
        </div>

        {/* Busca e Botão Nova Conta */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, conta, ref RFB..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 w-64 outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleExportarCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#222] hover:bg-[#2a2a2a] text-neutral-200 border border-white/10 rounded-lg text-xs transition font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleAbrirNovaConta}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta (F2)</span>
          </button>
        </div>
      </div>

      {/* Grid de Contas */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818] shadow-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1c1c1c] border-b border-white/10 text-neutral-400 font-mono sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 w-40">Classificação</th>
                <th className="py-2.5 px-2 w-16 text-center">Reduzido</th>
                <th className="py-2.5 px-4">Descrição da Conta</th>
                <th className="py-2.5 px-2 w-20 text-center">Tipo</th>
                <th className="py-2.5 px-2 w-20 text-center">Natureza</th>
                <th className="py-2.5 px-2 w-16 text-center">Grau</th>
                <th className="py-2.5 px-3">Cód. Referencial SPED (RFB)</th>
                <th className="py-2.5 px-2 text-center">C. Custo</th>
                <th className="py-2.5 px-3 w-28 text-right">Saldo Anterior</th>
                <th className="py-2.5 px-2 w-20 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {contasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-500 italic">
                    Nenhuma conta encontrada para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                contasFiltradas.map((c) => {
                  const isSintetica = c.tipo === 'S';
                  const padding = (c.grau - 1) * 14;

                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-white/[0.02] transition ${
                        isSintetica ? 'bg-neutral-900/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-mono font-bold text-neutral-300">{c.classificacao}</td>
                      <td className="py-2 px-2 text-center font-mono text-neutral-200">
                        {c.tipo === 'A' ? (
                          <span className="bg-neutral-900 px-1.5 py-0.5 rounded border border-white/5 font-bold">
                            {c.codigoReduzido}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2 px-4">
                        <div style={{ paddingLeft: `${padding}px` }} className="flex items-center space-x-1.5">
                          {isSintetica ? (
                            <ChevronRight className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 mr-1 flex-shrink-0" />
                          )}
                          <span className={isSintetica ? 'text-white' : 'text-neutral-300'}>
                            {c.nome}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          isSintetica 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {isSintetica ? 'Sintética' : 'Analítica'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold">
                        <span className={c.natureza === 'D' ? 'text-blue-400' : 'text-emerald-400'}>
                          {c.natureza === 'D' ? 'D' : 'C'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-neutral-400">{c.grau}</td>
                      <td className="py-2 px-3 font-mono text-xs text-neutral-400 truncate max-w-[200px]" title={c.codigoReferencialRFB}>
                        {c.codigoReferencialRFB ? (
                          <span className="text-emerald-400 font-semibold">{c.codigoReferencialRFB}</span>
                        ) : (
                          <span className="text-neutral-600 italic">Sem vínculo</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-[11px]">
                        {c.exigeCentroCusto ? (
                          <span className="text-amber-400 font-bold" title="Exige Centro de Custo">Sim</span>
                        ) : (
                          <span className="text-neutral-600">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-300">
                        {c.saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleAbrirEdicao(c)}
                            className="p-1 hover:bg-blue-500/20 text-neutral-400 hover:text-blue-400 rounded transition"
                            title="Editar Conta (SPED)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteConta(c.id)}
                            className="p-1 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded transition"
                            title="Excluir Conta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* MODAL: CRIAR / EDITAR CONTA COM SPED REFERENCIAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSalvarConta} className="w-full max-w-xl bg-[#181818] border border-white/15 rounded-xl shadow-2xl p-6 text-xs space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-400" />
                <span>{contaEmEdicao ? `Editar Conta #${contaEmEdicao.codigoReduzido} - ${contaEmEdicao.nome}` : 'Cadastrar Nova Conta Contábil'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {formErro && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs">
                {formErro}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-neutral-300 font-medium mb-1">Classificação Contábil (Estrutura) *</label>
                  <input
                    type="text"
                    placeholder="Ex: 1.01.01.001.0005"
                    value={classificacao}
                    onChange={(e) => setClassificacao(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-100 font-mono text-xs outline-none focus:border-blue-500"
                    required
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Siga a máscara da empresa: {mascaraPlano}</p>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Cód. Reduzido *</label>
                  <input
                    type="number"
                    placeholder="Ex: 105"
                    value={codigoReduzido}
                    onChange={(e) => setCodigoReduzido(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-100 font-mono text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Nome / Descrição da Conta *</label>
                <input
                  type="text"
                  placeholder="Ex: Banco Santander S.A. - Conta Corrente"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-100 text-xs font-semibold outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Tipo de Conta</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoConta)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-100 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="A">Analítica (Recebe Partidas)</option>
                    <option value="S">Sintética (Grupo Totalizador)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Natureza do Saldo</label>
                  <select
                    value={natureza}
                    onChange={(e) => setNatureza(e.target.value as NaturezaConta)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-100 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="D">D - Devedora (Ativo/Custos/Despesas)</option>
                    <option value="C">C - Credora (Passivo/PL/Receitas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Grau Hierárquico</label>
                  <select
                    value={grau}
                    onChange={(e) => setGrau(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-100 text-xs outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 - Grupo Primário (1 dígito)</option>
                    <option value={2}>2 - Subgrupo (ex: 1.1)</option>
                    <option value={3}>3 - Grupo Específico (ex: 1.1.1)</option>
                    <option value={4}>4 - Subconta (ex: 1.1.1.01)</option>
                    <option value={5}>5 - Analítica Final (Lançamentos)</option>
                  </select>
                </div>
              </div>

              {/* Vínculo SPED Referencial RFB (ECD / ECF) */}
              <div className="p-3.5 bg-[#141414] border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <ShieldCheck size={16} />
                  <span>Vínculo com Plano de Contas Referencial RFB (SPED ECD / ECF)</span>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Conta Referencial da Receita Federal</label>
                  <select
                    value={codigoReferencialRFB}
                    onChange={(e) => setCodigoReferencialRFB(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-neutral-100 font-mono text-xs outline-none focus:border-blue-500"
                  >
                    <option value="">Nenhuma (Não mapeada para SPED)</option>
                    {PLANO_REFERENCIAL_RFB.map(ref => (
                      <option key={ref.codigo} value={ref.codigo}>
                        {ref.codigo} - {ref.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 mb-1">Natureza da Conta no SPED</label>
                    <select
                      value={naturezaSped}
                      onChange={(e) => setNaturezaSped(e.target.value as any)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-neutral-100 text-xs outline-none focus:border-blue-500"
                    >
                      <option value="01">01 - Contas de Ativo</option>
                      <option value="02">02 - Contas de Passivo</option>
                      <option value="03">03 - Patrimônio Líquido</option>
                      <option value="04">04 - Contas de Resultado</option>
                      <option value="05">05 - Contas de Compensação</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="checkExigeCC"
                      checked={exigeCentroCusto}
                      onChange={(e) => setExigeCentroCusto(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#181818] border-white/20 text-blue-600 focus:ring-0"
                    />
                    <label htmlFor="checkExigeCC" className="text-xs text-neutral-200 cursor-pointer font-medium">
                      Obrigar Centro de Custo
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="checkContaAtiva"
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
                />
                <label htmlFor="checkContaAtiva" className="text-xs text-neutral-200 cursor-pointer font-medium">
                  Conta Ativa para Lançamentos
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/30 transition text-xs active:scale-95"
              >
                {contaEmEdicao ? 'Salvar Alterações' : 'Cadastrar Conta'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
