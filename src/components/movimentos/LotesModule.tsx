import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Search, 
  Scale, 
  FileText 
} from 'lucide-react';
import { LoteContabil, Empresa, LancamentoContabil } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

interface LotesModuleProps {
  empresa: Empresa;
  lancamentos: LancamentoContabil[];
  onOpenLancamentosDoLote?: (loteId: number) => void;
}

export const LotesModule: React.FC<LotesModuleProps> = ({
  empresa,
  lancamentos,
  onOpenLancamentosDoLote
}) => {
  const [lotes, setLotes] = useState<LoteContabil[]>(dbService.getLotes(empresa.id));
  const [selectedLote, setSelectedLote] = useState<LoteContabil | null>(lotes[0] || null);
  const [isModalNovoOpen, setIsModalNovoOpen] = useState(false);
  const [novoNumero, setNovoNumero] = useState(lotes.length + 1);
  const [novaDescricao, setNovaDescricao] = useState('Lote de Movimento Geral');
  const [novaData, setNovaData] = useState(new Date().toISOString().slice(0, 10));

  const handleCriarLote = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: LoteContabil = {
      id: Date.now(),
      empresaId: empresa.id,
      numero: novoNumero,
      descricao: novaDescricao,
      dataLote: novaData,
      status: 'ABERTO',
      totalDebito: 0,
      totalCredito: 0
    };
    dbService.saveLote(novo);
    const atualizados = dbService.getLotes(empresa.id);
    setLotes(atualizados);
    setSelectedLote(novo);
    setIsModalNovoOpen(false);
  };

  const handleAlternarStatus = (lote: LoteContabil) => {
    const lancsDoLote = lancamentos.filter(l => l.loteId === lote.id);
    const debito = lancsDoLote.reduce((acc, l) => acc + (l.contaDebitoId ? l.valor : 0), 0);
    const credito = lancsDoLote.reduce((acc, l) => acc + (l.contaCreditoId ? l.valor : 0), 0);
    const dif = Math.abs(debito - credito);

    let proximoStatus: 'ABERTO' | 'FECHADO' | 'RASCUNHO' = lote.status === 'FECHADO' ? 'ABERTO' : 'FECHADO';

    if (proximoStatus === 'FECHADO' && dif > 0.001) {
      alert(`Não é possível fechar o Lote nº ${lote.numero} pois há diferença de DxC de R$ ${dif.toFixed(2)}. Corrija os lançamentos antes de fechar.`);
      return;
    }

    const updated: LoteContabil = {
      ...lote,
      totalDebito: debito,
      totalCredito: credito,
      status: proximoStatus
    };
    dbService.saveLote(updated);
    setLotes(dbService.getLotes(empresa.id));
    setSelectedLote(updated);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Gestão de Lotes Contábeis (CTLOTE)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Agrupamento & Conciliação
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Controle de status (Aberto, Fechado, Rascunho) e integridade de saldo Débito x Crédito por lote
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setNovoNumero(lotes.reduce((m, l) => Math.max(m, l.numero), 0) + 1);
            setIsModalNovoOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition"
        >
          <Plus size={15} />
          <span>Criar Novo Lote</span>
        </button>
      </div>

      {/* Lista de Lotes */}
      <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-4 overflow-hidden">
        <div className="p-3 bg-[#1a1a1a] border-b border-white/10 flex justify-between items-center text-xs text-neutral-400">
          <span className="font-semibold uppercase">Lotes Cadastrados na Empresa</span>
          <span className="font-mono">{lotes.length} lote(s)</span>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#202020] text-neutral-400 uppercase text-[10px] font-semibold sticky top-0 border-b border-white/10 z-10">
              <tr>
                <th className="py-2.5 px-4 w-20 text-center">Nº Lote</th>
                <th className="py-2.5 px-4 w-28">Data</th>
                <th className="py-2.5 px-4">Descrição do Lote</th>
                <th className="py-2.5 px-4 w-32 text-center">Status</th>
                <th className="py-2.5 px-4 w-32 text-right">Total Débitos</th>
                <th className="py-2.5 px-4 w-32 text-right">Total Créditos</th>
                <th className="py-2.5 px-4 w-32 text-right">Diferença DxC</th>
                <th className="py-2.5 px-4 w-32 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {lotes.map(lote => {
                const lancsDoLote = lancamentos.filter(l => l.loteId === lote.id);
                const debito = lancsDoLote.reduce((acc, l) => acc + (l.contaDebitoId ? l.valor : 0), 0);
                const credito = lancsDoLote.reduce((acc, l) => acc + (l.contaCreditoId ? l.valor : 0), 0);
                const dif = Math.abs(debito - credito);
                const isEquilibrado = dif === 0;

                return (
                  <tr key={lote.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-mono font-bold text-center text-white">
                      #{lote.numero}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-300">
                      {lote.dataLote}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-100">
                      {lote.descricao}
                      <span className="text-[10px] text-neutral-400 font-normal ml-2">
                        ({lancsDoLote.length} partidas)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                        lote.status === 'FECHADO'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : lote.status === 'RASCUNHO'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {lote.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-blue-400">
                      R$ {debito.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-indigo-400">
                      R$ {credito.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right">
                      <span className={isEquilibrado ? 'text-emerald-400' : 'text-rose-400'}>
                        R$ {dif.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleAlternarStatus(lote)}
                        className={`text-xs px-2.5 py-1 rounded border transition font-medium flex items-center justify-center gap-1 mx-auto ${
                          lote.status === 'FECHADO'
                            ? 'bg-amber-600/20 text-amber-300 border-amber-500/30 hover:bg-amber-600/30'
                            : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/30'
                        }`}
                        title={lote.status === 'FECHADO' ? 'Reabrir Lote para Alterações' : 'Fechar e Conciliar Lote'}
                      >
                        {lote.status === 'FECHADO' ? (
                          <>
                            <Unlock size={12} />
                            <span>Reabrir</span>
                          </>
                        ) : (
                          <>
                            <Lock size={12} />
                            <span>Fechar</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Novo Lote */}
      {isModalNovoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1c1c] border border-white/15 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-blue-400" />
              <span>Criar Novo Lote Contábil</span>
            </h3>

            <form onSubmit={handleCriarLote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Número do Lote</label>
                  <input
                    type="number"
                    value={novoNumero}
                    onChange={e => setNovoNumero(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Data de Referência</label>
                  <input
                    type="date"
                    value={novaData}
                    onChange={e => setNovaData(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Descrição / Finalidade do Lote</label>
                <input
                  type="text"
                  value={novaDescricao}
                  onChange={e => setNovaDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalNovoOpen(false)}
                  className="px-4 py-2 text-xs rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                >
                  Confirmar e Criar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
