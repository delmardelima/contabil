import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { RubricaFolha, ContaContabil } from '../../types/contabil';
import { 
  ListTree, 
  Plus, 
  Trash2, 
  Edit2, 
  Sliders, 
  CheckCircle2, 
  Percent, 
  Layers, 
  Search
} from 'lucide-react';

interface RubricasTabelasModuleProps {
  contas: ContaContabil[];
}

export const RubricasTabelasModule: React.FC<RubricasTabelasModuleProps> = ({ contas }) => {
  const [rubricas, setRubricas] = useState<RubricaFolha[]>(dbService.getRubricas());
  const [abaAtiva, setAbaAtiva] = useState<'RUBRICAS' | 'TABELA_INSS' | 'TABELA_IRRF'>('RUBRICAS');
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<RubricaFolha | null>(null);

  // Form State
  const [codigo, setCodigo] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [tipo, setTipo] = useState<'PROVENTO' | 'DESCONTO' | 'INFORMATIVA'>('PROVENTO');
  const [incideINSS, setIncideINSS] = useState<boolean>(true);
  const [incideFGTS, setIncideFGTS] = useState<boolean>(true);
  const [incideIRRF, setIncideIRRF] = useState<boolean>(true);
  const [contaDebitoId, setContaDebitoId] = useState<number>(0);
  const [contaCreditoId, setContaCreditoId] = useState<number>(0);

  const contasAnaliticas = contas.filter(c => c.tipo === 'A');

  const handleAbrirCriar = () => {
    setEditando(null);
    setCodigo((rubricas.length + 101).toString());
    setNome('');
    setTipo('PROVENTO');
    setIncideINSS(true);
    setIncideFGTS(true);
    setIncideIRRF(true);
    setContaDebitoId(contasAnaliticas[0]?.id || 1);
    setContaCreditoId(contasAnaliticas[1]?.id || 2);
    setShowModal(true);
  };

  const handleSalvar = () => {
    if (!nome.trim() || !codigo.trim()) {
      alert('Preencha o código e a descrição da rubrica.');
      return;
    }

    const payload: RubricaFolha = {
      id: editando ? editando.id : Date.now(),
      codigo: codigo.trim(),
      nome: nome.trim(),
      tipo,
      incideINSS,
      incideFGTS,
      incideIRRF,
      contaDebitoId: contaDebitoId || undefined,
      contaCreditoId: contaCreditoId || undefined
    };

    dbService.saveRubrica(payload);
    setRubricas(dbService.getRubricas());
    setShowModal(false);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Deseja excluir esta rubrica?')) {
      dbService.deleteRubrica(id);
      setRubricas(dbService.getRubricas());
    }
  };

  const rubricasFiltradas = rubricas.filter(r => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return String(r.codigo).includes(txt) || r.nome.toLowerCase().includes(txt);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Rubricas, Eventos & Tabelas Oficiais</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">INSS / IRRF</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Catálogo de proventos e descontos para o cálculo dos holerites e parametrização contábil.
            </p>
          </div>
        </div>

        {/* Alternador de Abas */}
        <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-white/10 text-xs">
          <button
            onClick={() => setAbaAtiva('RUBRICAS')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              abaAtiva === 'RUBRICAS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Tabela de Rubricas ({rubricas.length})
          </button>
          <button
            onClick={() => setAbaAtiva('TABELA_INSS')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              abaAtiva === 'TABELA_INSS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Faixas INSS 2026
          </button>
          <button
            onClick={() => setAbaAtiva('TABELA_IRRF')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              abaAtiva === 'TABELA_IRRF' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Faixas IRRF 2026
          </button>
        </div>
      </div>

      {/* Conteúdo Aba 1: Rubricas */}
      {abaAtiva === 'RUBRICAS' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="px-5 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 bg-[#121212] border border-white/10 rounded px-3 py-1.5 w-72">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por código ou descrição de rubrica..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="bg-transparent text-neutral-200 outline-none w-full"
              />
            </div>

            <button
              onClick={handleAbrirCriar}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Rubrica</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px] z-10">
                <tr>
                  <th className="py-2.5 px-3 w-16 text-center">Cód.</th>
                  <th className="py-2.5 px-3">Descrição da Rubrica</th>
                  <th className="py-2.5 px-3 w-28 text-center">Classificação</th>
                  <th className="py-2.5 px-3 w-20 text-center">Inc. INSS</th>
                  <th className="py-2.5 px-3 w-20 text-center">Inc. FGTS</th>
                  <th className="py-2.5 px-3 w-20 text-center">Inc. IRRF</th>
                  <th className="py-2.5 px-3 w-40">Conta Débito</th>
                  <th className="py-2.5 px-3 w-40">Conta Crédito</th>
                  <th className="py-2.5 px-3 w-16 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                {rubricasFiltradas.map((r) => {
                  const deb = contas.find(c => c.id === r.contaDebitoId);
                  const cred = contas.find(c => c.id === r.contaCreditoId);

                  return (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-neutral-100">{r.codigo}</td>
                      <td className="py-2.5 px-3 text-neutral-200 font-sans font-medium">{r.nome}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.tipo === 'PROVENTO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {r.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.incideINSS ? <span className="text-emerald-400 font-bold">SIM</span> : <span className="text-neutral-600">NÃO</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.incideFGTS ? <span className="text-emerald-400 font-bold">SIM</span> : <span className="text-neutral-600">NÃO</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {r.incideIRRF ? <span className="text-emerald-400 font-bold">SIM</span> : <span className="text-neutral-600">NÃO</span>}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400 truncate max-w-[150px] font-sans">
                        {deb?.nome || (r.contaDebitoId ? `Conta ${r.contaDebitoId}` : '-')}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400 truncate max-w-[150px] font-sans">
                        {cred?.nome || (r.contaCreditoId ? `Conta ${r.contaCreditoId}` : '-')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleExcluir(r.id)}
                          className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded transition"
                          title="Excluir"
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
      )}

      {/* Conteúdo Aba 2: Tabela Progressiva INSS 2026 */}
      {abaAtiva === 'TABELA_INSS' && (
        <div className="flex-1 overflow-auto p-6 flex justify-center custom-scrollbar">
          <div className="w-full max-w-3xl bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-neutral-100">Tabela de Contribuição Previdenciária Progressiva (INSS)</h3>
              <p className="text-xs text-neutral-400">Portaria Interministerial MPS/MF - Vigência 2026</p>
            </div>

            <div className="divide-y divide-white/5 font-mono text-xs">
              <div className="py-2.5 grid grid-cols-4 font-bold text-neutral-400 uppercase text-[11px]">
                <div>Faixa Salarial (R$)</div>
                <div>Alíquota</div>
                <div>Parcela a Deduzir</div>
                <div className="text-right">Teto da Faixa</div>
              </div>
              <div className="py-2.5 grid grid-cols-4 text-neutral-200">
                <div>Até R$ 1.518,00</div>
                <div className="text-emerald-400 font-bold">7,50%</div>
                <div>R$ 0,00</div>
                <div className="text-right">R$ 113,85</div>
              </div>
              <div className="py-2.5 grid grid-cols-4 text-neutral-200">
                <div>De R$ 1.518,01 até R$ 2.793,88</div>
                <div className="text-blue-400 font-bold">9,00%</div>
                <div>R$ 22,77</div>
                <div className="text-right">R$ 228,68</div>
              </div>
              <div className="py-2.5 grid grid-cols-4 text-neutral-200">
                <div>De R$ 2.793,89 até R$ 4.190,83</div>
                <div className="text-amber-400 font-bold">12,00%</div>
                <div>R$ 106,59</div>
                <div className="text-right">R$ 396,31</div>
              </div>
              <div className="py-2.5 grid grid-cols-4 text-neutral-200">
                <div>De R$ 4.190,84 até R$ 8.157,41</div>
                <div className="text-rose-400 font-bold">14,00%</div>
                <div>R$ 190,40</div>
                <div className="text-right">R$ 951,63 (TETO)</div>
              </div>
            </div>

            <div className="p-3 bg-neutral-900 rounded-lg text-xs text-neutral-400">
              💡 <strong>Regra de Cálculo Automático:</strong> O Contábil Studio Pro aplica as alíquotas de forma estritamente progressiva fatia a fatia sobre a base tributável do empregado, garantindo exatidão com o eSocial.
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 3: Tabela Progressiva IRRF 2026 */}
      {abaAtiva === 'TABELA_IRRF' && (
        <div className="flex-1 overflow-auto p-6 flex justify-center custom-scrollbar">
          <div className="w-full max-w-3xl bg-[#181818] rounded-xl border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-neutral-100">Tabela Progressiva do Imposto de Renda Retido na Fonte (IRRF)</h3>
              <p className="text-xs text-neutral-400">Instrução Normativa RFB - Base Mensal</p>
            </div>

            <div className="divide-y divide-white/5 font-mono text-xs">
              <div className="py-2.5 grid grid-cols-3 font-bold text-neutral-400 uppercase text-[11px]">
                <div>Base de Cálculo (R$)</div>
                <div>Alíquota</div>
                <div className="text-right">Parcela a Deduzir do IR</div>
              </div>
              <div className="py-2.5 grid grid-cols-3 text-neutral-200">
                <div>Até R$ 2.259,20</div>
                <div className="text-emerald-400 font-bold">ISENTO</div>
                <div className="text-right">R$ 0,00</div>
              </div>
              <div className="py-2.5 grid grid-cols-3 text-neutral-200">
                <div>De R$ 2.259,21 até R$ 2.826,65</div>
                <div className="text-blue-400 font-bold">7,50%</div>
                <div className="text-right">R$ 169,44</div>
              </div>
              <div className="py-2.5 grid grid-cols-3 text-neutral-200">
                <div>De R$ 2.826,66 até R$ 3.751,05</div>
                <div className="text-amber-400 font-bold">15,00%</div>
                <div className="text-right">R$ 381,44</div>
              </div>
              <div className="py-2.5 grid grid-cols-3 text-neutral-200">
                <div>De R$ 3.751,06 até R$ 4.664,68</div>
                <div className="text-purple-400 font-bold">22,50%</div>
                <div className="text-right">R$ 662,77</div>
              </div>
              <div className="py-2.5 grid grid-cols-3 text-neutral-200">
                <div>Acima de R$ 4.664,68</div>
                <div className="text-rose-400 font-bold">27,50%</div>
                <div className="text-right">R$ 896,00</div>
              </div>
            </div>

            <div className="p-3 bg-neutral-900 rounded-lg text-xs text-neutral-400 space-y-1">
              <div>👨‍👧‍👦 <strong>Dedução por Dependente:</strong> R$ 189,59 por mês.</div>
              <div>🏷️ <strong>Desconto Simplificado Opcional:</strong> R$ 564,80 para rendimentos elegíveis.</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Rubrica */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-neutral-100">Nova Rubrica da Folha</h3>
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
                  <label className="block text-neutral-400 mb-1">Tipo:</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                  >
                    <option value="PROVENTO">Provento (+ Vencimento)</option>
                    <option value="DESCONTO">Desconto (- Dedução)</option>
                    <option value="INFORMATIVA">Informativa / Base</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Descrição:</label>
                <input
                  type="text"
                  placeholder="Ex: Gratificação por Função"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-1.5 text-neutral-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-neutral-900 rounded-lg border border-white/5 space-y-2">
                <span className="block text-neutral-300 font-semibold text-[11px] uppercase tracking-wide">
                  Incidências Legais:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incideINSS} onChange={(e) => setIncideINSS(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>INSS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incideFGTS} onChange={(e) => setIncideFGTS(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>FGTS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={incideIRRF} onChange={(e) => setIncideIRRF(e.target.checked)} className="rounded bg-neutral-800" />
                    <span>IRRF</span>
                  </label>
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
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition"
              >
                Salvar Rubrica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
