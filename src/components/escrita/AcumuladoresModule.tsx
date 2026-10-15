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
  DollarSign
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
  const [acumuladores, setAcumuladores] = useState<AcumuladorFiscal[]>(dbService.getAcumuladores(empresaId));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<AcumuladorFiscal | null>(null);

  // Form State
  const [codigo, setCodigo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [cfopPadrao, setCfopPadrao] = useState<string>('');
  const [incideICMS, setIncideICMS] = useState<boolean>(false);
  const [incideIPI, setIncideIPI] = useState<boolean>(false);
  const [incidePIS, setIncidePIS] = useState<boolean>(false);
  const [incideCOFINS, setIncideCOFINS] = useState<boolean>(false);
  const [incideISS, setIncideISS] = useState<boolean>(false);
  const [incideSimples, setIncideSimples] = useState<boolean>(true);
  
  // Contas Contábeis
  const [contaDebitoValor, setContaDebitoValor] = useState<number>(0);
  const [contaCreditoValor, setContaCreditoValor] = useState<number>(0);
  const [contaCreditoICMS, setContaCreditoICMS] = useState<number>(0);
  const [contaCreditoPIS, setContaCreditoPIS] = useState<number>(0);
  const [contaCreditoCOFINS, setContaCreditoCOFINS] = useState<number>(0);
  const [historicoId, setHistoricoId] = useState<number>(0);

  const contasAnaliticas = contas.filter(c => c.tipo === 'A');

  const handleAbrirCriar = () => {
    setEditando(null);
    setCodigo((acumuladores.length + 1).toString().padStart(3, '0'));
    setDescricao('');
    setCfopPadrao('');
    setIncideICMS(false);
    setIncideIPI(false);
    setIncidePIS(false);
    setIncideCOFINS(false);
    setIncideISS(false);
    setIncideSimples(true);
    setContaDebitoValor(contasAnaliticas[0]?.id || 1);
    setContaCreditoValor(contasAnaliticas[1]?.id || 2);
    setContaCreditoICMS(0);
    setContaCreditoPIS(0);
    setContaCreditoCOFINS(0);
    setHistoricoId(historicos[0]?.id || 1);
    setShowModal(true);
  };

  const handleAbrirEditar = (a: AcumuladorFiscal) => {
    setEditando(a);
    setCodigo(a.codigo.toString().padStart(3, '0'));
    setDescricao(a.descricao);
    setCfopPadrao(a.cfopPadrao);
    setIncideICMS(a.incideICMS);
    setIncideIPI(a.incideIPI || false);
    setIncidePIS(a.incidePIS);
    setIncideCOFINS(a.incideCOFINS);
    setIncideISS(a.incideISS);
    setIncideSimples(a.incideSimples);
    setContaDebitoValor(a.contaDebitoValor || a.contaContabilDebitoId || 0);
    setContaCreditoValor(a.contaCreditoValor || a.contaContabilCreditoId || 0);
    setContaCreditoICMS(a.contaCreditoICMS || 0);
    setContaCreditoPIS(a.contaCreditoPIS || 0);
    setContaCreditoCOFINS(a.contaCreditoCOFINS || 0);
    setHistoricoId(a.historicoId || 1);
    setShowModal(true);
  };

  const handleSalvar = () => {
    if (!descricao.trim() || !cfopPadrao.trim() || !contaDebitoValor || !contaCreditoValor) {
      alert('Preencha a descrição, CFOP e as contas de débito e crédito.');
      return;
    }

    const payload: AcumuladorFiscal = {
      id: editando ? editando.id : Date.now(),
      empresaId,
      codigo: parseInt(codigo, 10) || (acumuladores.length + 1),
      descricao: descricao.trim(),
      cfopPadrao: cfopPadrao.trim(),
      incideICMS,
      incideIPI,
      incidePIS,
      incideCOFINS,
      incideISS,
      incideSimples,
      contaDebitoValor,
      contaCreditoValor,
      contaCreditoICMS: contaCreditoICMS || undefined,
      contaCreditoPIS: contaCreditoPIS || undefined,
      contaCreditoCOFINS: contaCreditoCOFINS || undefined,
      historicoId: historicoId || undefined
    };

    dbService.saveAcumulador(payload);
    setAcumuladores(dbService.getAcumuladores(empresaId));
    setShowModal(false);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Deseja excluir este Acumulador Fiscal?')) {
      dbService.deleteAcumulador(id);
      setAcumuladores(dbService.getAcumuladores(empresaId));
    }
  };

  const filtrados = acumuladores.filter(a => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return a.codigo.toString().includes(txt) ||
           a.descricao.toLowerCase().includes(txt) ||
           a.cfopPadrao.includes(txt);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Cadastro de Acumuladores Fiscais</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-medium">EFACUMULADOR</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Parametrização central de incidências tributárias (ICMS, PIS, COFINS, ISS) e automação de partidas contábeis.
            </p>
          </div>
        </div>

        <button
          onClick={handleAbrirCriar}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Acumulador</span>
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="px-5 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 bg-[#121212] border border-white/10 rounded px-3 py-1.5 w-72">
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por código, descrição ou CFOP..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="bg-transparent text-neutral-200 outline-none w-full"
          />
        </div>
        <div className="text-neutral-400 font-mono text-[11px]">
          Total: <strong className="text-neutral-200">{filtrados.length}</strong> acumuladores configurados
        </div>
      </div>

      {/* Grade de Acumuladores */}
      <div className="flex-1 overflow-auto p-5 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((a) => {
            const deb = contas.find(c => c.id === a.contaDebitoValor);
            const cred = contas.find(c => c.id === a.contaCreditoValor);

            return (
              <div 
                key={a.id} 
                className="bg-[#181818] rounded-xl border border-white/10 p-4 space-y-3 hover:border-amber-500/40 transition-colors shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      CÓD. {a.codigo.toString().padStart(3, '0')}
                    </span>
                    <span className="font-mono text-xs text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-white/5">
                      CFOP: {a.cfopPadrao}
                    </span>
                  </div>

                  <h3 className="font-semibold text-neutral-100 text-sm">{a.descricao}</h3>

                  {/* Badges de Impostos Incididos */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {a.incideSimples && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">SIMPLES</span>}
                    {a.incideICMS && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">ICMS</span>}
                    {a.incideIPI && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">IPI</span>}
                    {a.incidePIS && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">PIS</span>}
                    {a.incideCOFINS && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">COFINS</span>}
                    {a.incideISS && <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">ISS</span>}
                  </div>

                  {/* Regras Contábeis */}
                  <div className="pt-2 text-xs space-y-1 text-neutral-400 border-t border-white/5">
                    <div className="flex justify-between">
                      <span>Débito:</span>
                      <span className="text-neutral-200 truncate max-w-[180px] font-mono">{deb?.nome || a.contaDebitoValor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crédito:</span>
                      <span className="text-neutral-200 truncate max-w-[180px] font-mono">{cred?.nome || a.contaCreditoValor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleAbrirEditar(a)}
                    className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 rounded transition"
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

      {/* Modal Criar/Editar Acumulador */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-amber-400" />
                <span>{editando ? 'Editar Acumulador Fiscal' : 'Novo Acumulador Fiscal'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Código:</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-neutral-400 mb-1">CFOP Padrão:</label>
                  <input
                    type="text"
                    placeholder="Ex: 5.102 ou 1.102"
                    value={cfopPadrao}
                    onChange={(e) => setCfopPadrao(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
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
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-1.5 text-neutral-100 outline-none focus:border-amber-500"
                />
              </div>

              {/* Incidências de Tributos */}
              <div className="p-3 bg-neutral-900 rounded-lg border border-white/5 space-y-2">
                <span className="block text-neutral-300 font-semibold text-[11px] uppercase tracking-wide">
                  Tributos Incidentes na Operação:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incideSimples} onChange={(e) => setIncideSimples(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>Simples Nac.</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incideICMS} onChange={(e) => setIncideICMS(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>ICMS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incideIPI} onChange={(e) => setIncideIPI(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>IPI</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incidePIS} onChange={(e) => setIncidePIS(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>PIS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incideCOFINS} onChange={(e) => setIncideCOFINS(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>COFINS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incideISS} onChange={(e) => setIncideISS(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>ISS</span>
                  </label>
                </div>
              </div>

              {/* Regras de Integração Contábil */}
              <div className="space-y-2 pt-1">
                <span className="block text-neutral-300 font-semibold text-[11px] uppercase tracking-wide">
                  Contas de Contrapartida Contábil:
                </span>

                <div>
                  <label className="block text-neutral-400 mb-1">Conta Débito (Valor Contábil):</label>
                  <select
                    value={contaDebitoValor}
                    onChange={(e) => setContaDebitoValor(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                  >
                    {contasAnaliticas.map(c => (
                      <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Conta Crédito (Valor Contábil):</label>
                  <select
                    value={contaCreditoValor}
                    onChange={(e) => setContaCreditoValor(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                  >
                    {contasAnaliticas.map(c => (
                      <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium transition"
              >
                Salvar Acumulador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
