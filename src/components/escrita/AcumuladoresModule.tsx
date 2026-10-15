import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { AcumuladorFiscal, ContaContabil, HistoricoPadrao } from '../../types/contabil';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  CheckCircle2, 
  Search, 
  Tag, 
  Settings2,
  DollarSign,
  X,
  FileSpreadsheet,
  HelpCircle,
  ShieldCheck,
  Percent
} from 'lucide-react';

interface AcumuladoresModuleProps {
  empresaId: number;
  contas: ContaContabil[];
  historicos: HistoricoPadrao[];
}

export const AcumuladoresModule: React.FC<AcumuladoresModuleProps> = ({
  empresaId,
  contas,
  historicos
}) => {
  const [acumuladores, setAcumuladores] = useState<AcumuladorFiscal[]>(() => dbService.getAcumuladores(empresaId));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<AcumuladorFiscal | null>(null);
  const [modalTab, setModalTab] = useState<'GERAL' | 'IMPOSTOS' | 'CONTABILIDADE'>('GERAL');
  const [mensagem, setMensagem] = useState<string>('');

  // Form State - Aba Geral
  const [codigo, setCodigo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [tipoOperacao, setTipoOperacao] = useState<'ENTRADA' | 'SAIDA' | 'SERVICO_PRESTADO' | 'SERVICO_TOMADO'>('SAIDA');
  const [cfopPadrao, setCfopPadrao] = useState<string>('');
  const [cfopsPermitidosStr, setCfopsPermitidosStr] = useState<string>('');

  // Form State - Aba Impostos & Retenções
  const [incideSimples, setIncideSimples] = useState<boolean>(true);
  const [incideICMS, setIncideICMS] = useState<boolean>(false);
  const [aliquotaICMS, setAliquotaICMS] = useState<number>(18);
  const [incideIPI, setIncideIPI] = useState<boolean>(false);
  const [aliquotaIPI, setAliquotaIPI] = useState<number>(0);
  const [incidePIS, setIncidePIS] = useState<boolean>(false);
  const [aliquotaPIS, setAliquotaPIS] = useState<number>(0.65);
  const [incideCOFINS, setIncideCOFINS] = useState<boolean>(false);
  const [aliquotaCOFINS, setAliquotaCOFINS] = useState<number>(3.0);
  const [incideISS, setIncideISS] = useState<boolean>(false);
  const [aliquotaISS, setAliquotaISS] = useState<number>(5.0);

  // Retenções na Fonte
  const [retencaoIRRF, setRetencaoIRRF] = useState<boolean>(false);
  const [retencaoCSRF, setRetencaoCSRF] = useState<boolean>(false);
  const [retencaoINSS, setRetencaoINSS] = useState<boolean>(false);
  
  // Form State - Aba Integração Contábil Detalhada
  const [contaDebitoValor, setContaDebitoValor] = useState<number>(0);
  const [contaCreditoValor, setContaCreditoValor] = useState<number>(0);
  const [contaDebitoICMS, setContaDebitoICMS] = useState<number>(0);
  const [contaCreditoICMS, setContaCreditoICMS] = useState<number>(0);
  const [contaDebitoPIS, setContaDebitoPIS] = useState<number>(0);
  const [contaCreditoPIS, setContaCreditoPIS] = useState<number>(0);
  const [contaDebitoCOFINS, setContaDebitoCOFINS] = useState<number>(0);
  const [contaCreditoCOFINS, setContaCreditoCOFINS] = useState<number>(0);
  const [contaDebitoISS, setContaDebitoISS] = useState<number>(0);
  const [contaCreditoISS, setContaCreditoISS] = useState<number>(0);
  const [historicoId, setHistoricoId] = useState<number>(1);

  const contasAnaliticas = contas.filter(c => c.tipo === 'A');

  const handleAbrirCriar = () => {
    setEditando(null);
    setModalTab('GERAL');
    const proximoCod = (acumuladores.reduce((max, a) => Math.max(max, a.codigo), 0) + 1);
    setCodigo(proximoCod.toString().padStart(3, '0'));
    setDescricao('');
    setTipoOperacao('SAIDA');
    setCfopPadrao('5.102');
    setCfopsPermitidosStr('5.102, 6.102, 5.405');
    setIncideSimples(true);
    setIncideICMS(false);
    setAliquotaICMS(18);
    setIncideIPI(false);
    setAliquotaIPI(0);
    setIncidePIS(false);
    setAliquotaPIS(0.65);
    setIncideCOFINS(false);
    setAliquotaCOFINS(3.0);
    setIncideISS(false);
    setAliquotaISS(5.0);
    setRetencaoIRRF(false);
    setRetencaoCSRF(false);
    setRetencaoINSS(false);

    // Contas padrão
    setContaDebitoValor(11); // Clientes a Receber
    setContaCreditoValor(43); // Receita de Vendas
    setContaDebitoICMS(45);
    setContaCreditoICMS(29);
    setContaDebitoPIS(45);
    setContaCreditoPIS(29);
    setContaDebitoCOFINS(45);
    setContaCreditoCOFINS(29);
    setContaDebitoISS(45);
    setContaCreditoISS(29);
    setHistoricoId(historicos[0]?.id || 1);

    setShowModal(true);
  };

  const handleAbrirEditar = (a: AcumuladorFiscal) => {
    setEditando(a);
    setModalTab('GERAL');
    setCodigo(a.codigo.toString().padStart(3, '0'));
    setDescricao(a.descricao);
    setTipoOperacao((a.tipoOperacao as any) || 'SAIDA');
    setCfopPadrao(a.cfopPadrao);
    setCfopsPermitidosStr((a.cfopsPermitidos || []).join(', ') || a.cfopPadrao);
    setIncideSimples(a.incideSimples);
    setIncideICMS(a.incideICMS);
    setAliquotaICMS(a.aliquotaICMS || 18);
    setIncideIPI(a.incideIPI || false);
    setAliquotaIPI(a.aliquotaIPI || 0);
    setIncidePIS(a.incidePIS);
    setAliquotaPIS(a.aliquotaPIS || 0.65);
    setIncideCOFINS(a.incideCOFINS);
    setAliquotaCOFINS(a.aliquotaCOFINS || 3.0);
    setIncideISS(a.incideISS);
    setAliquotaISS(a.aliquotaISS || 5.0);
    setRetencaoIRRF(a.retencaoIRRF || false);
    setRetencaoCSRF(a.retencaoCSRF || false);
    setRetencaoINSS(a.retencaoINSS || false);

    setContaDebitoValor(a.contaDebitoValor || a.contaContabilDebitoId || 11);
    setContaCreditoValor(a.contaCreditoValor || a.contaContabilCreditoId || 43);
    setContaDebitoICMS(a.contaDebitoICMS || 45);
    setContaCreditoICMS(a.contaCreditoICMS || 29);
    setContaDebitoPIS(a.contaDebitoPIS || 45);
    setContaCreditoPIS(a.contaCreditoPIS || 29);
    setContaDebitoCOFINS(a.contaDebitoCOFINS || 45);
    setContaCreditoCOFINS(a.contaCreditoCOFINS || 29);
    setContaDebitoISS(a.contaDebitoISS || 45);
    setContaCreditoISS(a.contaCreditoISS || 29);
    setHistoricoId(a.historicoId || 1);

    setShowModal(true);
  };

  const handleSalvar = () => {
    if (!descricao.trim() || !cfopPadrao.trim() || !contaDebitoValor || !contaCreditoValor) {
      alert('Preencha a descrição, CFOP e as contas de débito e crédito principais.');
      return;
    }

    const cfopsArray = cfopsPermitidosStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: AcumuladorFiscal = {
      id: editando ? editando.id : Date.now(),
      empresaId,
      codigo: parseInt(codigo) || 1,
      descricao: descricao.trim(),
      tipoOperacao,
      cfopPadrao: cfopPadrao.trim(),
      cfopsPermitidos: cfopsArray.length > 0 ? cfopsArray : [cfopPadrao.trim()],
      incideSimples,
      incideICMS,
      aliquotaICMS: Number(aliquotaICMS),
      incideIPI,
      aliquotaIPI: Number(aliquotaIPI),
      incidePIS,
      aliquotaPIS: Number(aliquotaPIS),
      incideCOFINS,
      aliquotaCOFINS: Number(aliquotaCOFINS),
      incideISS,
      aliquotaISS: Number(aliquotaISS),
      retencaoIRRF,
      retencaoCSRF,
      retencaoINSS,
      contaDebitoValor,
      contaCreditoValor,
      contaContabilDebitoId: contaDebitoValor,
      contaContabilCreditoId: contaCreditoValor,
      contaDebitoICMS,
      contaCreditoICMS,
      contaDebitoPIS,
      contaCreditoPIS,
      contaDebitoCOFINS,
      contaCreditoCOFINS,
      contaDebitoISS,
      contaCreditoISS,
      historicoId
    };

    dbService.saveAcumulador(payload);
    setAcumuladores(dbService.getAcumuladores(empresaId));
    setShowModal(false);
    setMensagem(`Acumulador ${payload.codigo} - ${payload.descricao} salvo com sucesso.`);
    setTimeout(() => setMensagem(''), 4000);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este Acumulador Fiscal?')) {
      dbService.deleteAcumulador(id);
      setAcumuladores(dbService.getAcumuladores(empresaId));
      setMensagem('Acumulador fiscal removido com sucesso.');
      setTimeout(() => setMensagem(''), 4000);
    }
  };

  const filtrados = acumuladores.filter(a => {
    const texto = filtroTexto.toLowerCase();
    return (
      a.descricao.toLowerCase().includes(texto) ||
      a.codigo.toString().includes(texto) ||
      a.cfopPadrao.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Acumuladores Fiscais & Regras Contábeis (`EFACUMULADOR`)</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-medium border border-amber-500/30">
                Padrão Domínio Sistemas
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Parametrização de CFOPs, incidência de tributos e integração automática de partidas contábeis dobradas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Busca Textual */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar acumulador, CFOP..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="bg-[#101010] border border-white/10 rounded-md pl-8 pr-3 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-48 transition"
            />
          </div>

          <button
            onClick={handleAbrirCriar}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Acumulador</span>
          </button>
        </div>
      </div>

      {/* Alerta de Mensagem */}
      {mensagem && (
        <div className="px-5 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagem}</span>
          </div>
          <button onClick={() => setMensagem('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grade de Acumuladores */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((a) => {
            const deb = contas.find(c => c.id === (a.contaDebitoValor || a.contaContabilDebitoId));
            const cred = contas.find(c => c.id === (a.contaCreditoValor || a.contaContabilCreditoId));

            return (
              <div
                key={a.id}
                className="bg-[#181818] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      CÓD. {a.codigo.toString().padStart(3, '0')}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-[11px] text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-white/10">
                        CFOP: {a.cfopPadrao}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        a.tipoOperacao === 'ENTRADA' ? 'bg-sky-500/15 text-sky-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {a.tipoOperacao || 'SAÍDA'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-100 text-sm leading-snug">{a.descricao}</h3>
                    {a.cfopsPermitidos && a.cfopsPermitidos.length > 1 && (
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Permitidos: <span className="font-mono text-neutral-300">{a.cfopsPermitidos.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  {/* Badges de Impostos Incididos */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {a.incideSimples && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">SIMPLES</span>}
                    {a.incideICMS && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">ICMS {a.aliquotaICMS}%</span>}
                    {a.incideIPI && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">IPI</span>}
                    {a.incidePIS && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">PIS {a.aliquotaPIS}%</span>}
                    {a.incideCOFINS && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">COFINS {a.aliquotaCOFINS}%</span>}
                    {a.incideISS && <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">ISS {a.aliquotaISS}%</span>}
                    {a.retencaoIRRF && <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono">RET. IRRF</span>}
                  </div>

                  {/* Regras Contábeis */}
                  <div className="pt-2 text-xs space-y-1 text-neutral-400 border-t border-white/5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span>D (Ativo/Despesa):</span>
                      <span className="text-neutral-200 truncate max-w-[190px] font-mono text-right">{deb?.nome || `Conta #${a.contaDebitoValor}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>C (Passivo/Receita):</span>
                      <span className="text-neutral-200 truncate max-w-[190px] font-mono text-right">{cred?.nome || `Conta #${a.contaCreditoValor}`}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-1.5 pt-3 mt-3 border-t border-white/5">
                  <button
                    onClick={() => handleAbrirEditar(a)}
                    className="p-1.5 hover:bg-white/10 text-neutral-300 hover:text-white rounded transition"
                    title="Editar Acumulador"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExcluir(a.id)}
                    className="p-1.5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded transition"
                    title="Excluir Acumulador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Criar/Editar Acumulador em 3 Abas */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#202020] px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Settings2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">
                  {editando ? `Editar Acumulador Fiscal #${codigo}` : 'Novo Acumulador Fiscal (EFACUMULADOR)'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-Abas do Modal */}
            <div className="flex border-b border-white/10 bg-[#141414] px-5 text-xs">
              <button
                type="button"
                onClick={() => setModalTab('GERAL')}
                className={`py-2.5 px-3 font-medium border-b-2 transition ${
                  modalTab === 'GERAL'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                1. Identificação & CFOPs
              </button>
              <button
                type="button"
                onClick={() => setModalTab('IMPOSTOS')}
                className={`py-2.5 px-3 font-medium border-b-2 transition ${
                  modalTab === 'IMPOSTOS'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                2. Impostos & Retenções
              </button>
              <button
                type="button"
                onClick={() => setModalTab('CONTABILIDADE')}
                className={`py-2.5 px-3 font-medium border-b-2 transition ${
                  modalTab === 'CONTABILIDADE'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                3. Integração Contábil (Partidas)
              </button>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar text-xs">
              {modalTab === 'GERAL' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-neutral-400 mb-1">Código do Acumulador:</label>
                      <input
                        type="text"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-neutral-100 font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1">Tipo de Operação:</label>
                      <select
                        value={tipoOperacao}
                        onChange={(e) => setTipoOperacao(e.target.value as any)}
                        className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-neutral-100 outline-none"
                      >
                        <option value="SAIDA">Saída / Venda</option>
                        <option value="ENTRADA">Entrada / Compra</option>
                        <option value="SERVICO_PRESTADO">Prestação de Serviço</option>
                        <option value="SERVICO_TOMADO">Aquisição de Serviço</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1">CFOP Padrão:</label>
                      <input
                        type="text"
                        placeholder="Ex: 5.102"
                        value={cfopPadrao}
                        onChange={(e) => setCfopPadrao(e.target.value)}
                        className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-neutral-100 font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Descrição Operacional:</label>
                    <input
                      type="text"
                      placeholder="Ex: Venda de Mercadorias para Revenda Dentro do Estado"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-neutral-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">CFOPs Permitidos para Este Acumulador (separados por vírgula):</label>
                    <input
                      type="text"
                      placeholder="Ex: 5.102, 6.102, 5.405, 6.405"
                      value={cfopsPermitidosStr}
                      onChange={(e) => setCfopsPermitidosStr(e.target.value)}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-neutral-100 font-mono outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Ao importar NF-e ou digitar notas, qualquer um destes CFOPs sugerirá este acumulador automaticamente.
                    </span>
                  </div>
                </div>
              )}

              {modalTab === 'IMPOSTOS' && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#202020] border border-white/10 rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incideSimples}
                        onChange={(e) => setIncideSimples(e.target.checked)}
                        className="rounded border-white/20 bg-neutral-800 text-amber-500"
                      />
                      <span className="font-semibold text-neutral-200">Tributado no Simples Nacional (PGDAS-D)</span>
                    </label>
                    <p className="text-[10px] text-neutral-400 mt-1 pl-5">
                      Indica que o faturamento deste acumulador compõe a Receita Bruta da empresa para cálculo do Simples.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* ICMS */}
                    <div className="p-3 bg-[#202020] border border-white/10 rounded-lg space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={incideICMS}
                          onChange={(e) => setIncideICMS(e.target.checked)}
                          className="rounded border-white/20 bg-neutral-800 text-blue-500"
                        />
                        <span className="font-medium text-neutral-200">Incidência de ICMS</span>
                      </label>
                      {incideICMS && (
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Alíquota Padrão (%):</label>
                          <input
                            type="number"
                            value={aliquotaICMS}
                            onChange={(e) => setAliquotaICMS(Number(e.target.value))}
                            className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* IPI */}
                    <div className="p-3 bg-[#202020] border border-white/10 rounded-lg space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={incideIPI}
                          onChange={(e) => setIncideIPI(e.target.checked)}
                          className="rounded border-white/20 bg-neutral-800 text-purple-500"
                        />
                        <span className="font-medium text-neutral-200">Incidência de IPI</span>
                      </label>
                      {incideIPI && (
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Alíquota IPI (%):</label>
                          <input
                            type="number"
                            value={aliquotaIPI}
                            onChange={(e) => setAliquotaIPI(Number(e.target.value))}
                            className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* PIS */}
                    <div className="p-3 bg-[#202020] border border-white/10 rounded-lg space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={incidePIS}
                          onChange={(e) => setIncidePIS(e.target.checked)}
                          className="rounded border-white/20 bg-neutral-800 text-amber-500"
                        />
                        <span className="font-medium text-neutral-200">Incidência de PIS</span>
                      </label>
                      {incidePIS && (
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Alíquota PIS (%):</label>
                          <input
                            type="number"
                            step="0.01"
                            value={aliquotaPIS}
                            onChange={(e) => setAliquotaPIS(Number(e.target.value))}
                            className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* COFINS */}
                    <div className="p-3 bg-[#202020] border border-white/10 rounded-lg space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={incideCOFINS}
                          onChange={(e) => setIncideCOFINS(e.target.checked)}
                          className="rounded border-white/20 bg-neutral-800 text-amber-500"
                        />
                        <span className="font-medium text-neutral-200">Incidência de COFINS</span>
                      </label>
                      {incideCOFINS && (
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Alíquota COFINS (%):</label>
                          <input
                            type="number"
                            step="0.01"
                            value={aliquotaCOFINS}
                            onChange={(e) => setAliquotaCOFINS(Number(e.target.value))}
                            className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Retenções na Fonte */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <span className="text-[11px] font-semibold text-neutral-300 block">Retenções Tributárias na Fonte:</span>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer p-2 bg-[#202020] rounded border border-white/5">
                        <input
                          type="checkbox"
                          checked={retencaoIRRF}
                          onChange={(e) => setRetencaoIRRF(e.target.checked)}
                          className="rounded border-white/20 bg-neutral-800 text-rose-500"
                        />
                        <span className="text-neutral-300">Retenção IRRF (1,5%)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer p-2 bg-[#202020] rounded border border-white/5">
                        <input
                          type="checkbox"
                          checked={retencaoCSRF}
                          onChange={(e) => setRetencaoCSRF(e.target.checked)}
                          className="rounded border-white/20 bg-neutral-800 text-rose-500"
                        />
                        <span className="text-neutral-300">Retenção CSRF (4,65%)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer p-2 bg-[#202020] rounded border border-white/5">
                        <input
                          type="checkbox"
                          checked={retencaoINSS}
                          onChange={(e) => setRetencaoINSS(e.target.checked)}
                          className="rounded border-white/20 bg-neutral-800 text-rose-500"
                        />
                        <span className="text-neutral-300">Retenção INSS (11%)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'CONTABILIDADE' && (
                <div className="space-y-4">
                  {/* Partida Principal do Valor Contábil */}
                  <div className="p-3.5 bg-[#202020] border border-white/10 rounded-lg space-y-3">
                    <span className="text-xs font-bold text-amber-400 block">
                      Partida Dobrada Principal (Valor Contábil / Mercadorias)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1">Conta a Debitar:</label>
                        <select
                          value={contaDebitoValor}
                          onChange={(e) => setContaDebitoValor(Number(e.target.value))}
                          className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                        >
                          {contasAnaliticas.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.classificacao} - {c.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1">Conta a Creditar:</label>
                        <select
                          value={contaCreditoValor}
                          onChange={(e) => setContaCreditoValor(Number(e.target.value))}
                          className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                        >
                          {contasAnaliticas.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.classificacao} - {c.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Partidas de Impostos Fiscais */}
                  <div className="p-3.5 bg-[#202020] border border-white/10 rounded-lg space-y-3">
                    <span className="text-xs font-bold text-blue-400 block">
                      Partidas de Impostos Fiscais (ICMS, PIS, COFINS)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1">Conta Débito Tributos (Dedução / Resultado):</label>
                        <select
                          value={contaDebitoICMS}
                          onChange={(e) => {
                            setContaDebitoICMS(Number(e.target.value));
                            setContaDebitoPIS(Number(e.target.value));
                            setContaDebitoCOFINS(Number(e.target.value));
                          }}
                          className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                        >
                          {contasAnaliticas.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.classificacao} - {c.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1">Conta Crédito Tributos (Obrigações a Recolher):</label>
                        <select
                          value={contaCreditoICMS}
                          onChange={(e) => {
                            setContaCreditoICMS(Number(e.target.value));
                            setContaCreditoPIS(Number(e.target.value));
                            setContaCreditoCOFINS(Number(e.target.value));
                          }}
                          className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                        >
                          {contasAnaliticas.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.classificacao} - {c.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Histórico Padrão */}
                  <div>
                    <label className="block text-neutral-400 mb-1">Histórico Contábil Padrão:</label>
                    <select
                      value={historicoId}
                      onChange={(e) => setHistoricoId(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-neutral-100 outline-none"
                    >
                      {historicos.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.codigo} - {h.descricao}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#202020] px-5 py-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                Sincronização imediata no SQLite local e LAN server (:4590)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-transparent rounded border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvar}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded shadow-sm flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Gravar Acumulador</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
