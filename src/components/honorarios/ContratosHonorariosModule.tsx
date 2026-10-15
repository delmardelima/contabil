import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { ContratoHonorario, Empresa } from '../../types/contabil';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  Download
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface ContratosHonorariosModuleProps {
  empresas: Empresa[];
}

export const ContratosHonorariosModule: React.FC<ContratosHonorariosModuleProps> = ({ empresas }) => {
  const [contratos, setContratos] = useState<ContratoHonorario[]>(dbService.getContratosHonorarios());
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<ContratoHonorario | null>(null);

  // Form State
  const [empresaId, setEmpresaId] = useState<number>(empresas[0]?.id || 1);
  const [valorMensal, setValorMensal] = useState<string>('');
  const [diaVencimento, setDiaVencimento] = useState<number>(10);
  const [indexadorReajuste, setIndexadorReajuste] = useState<'IGPM' | 'IPCA' | 'SALARIO_MINIMO' | 'FIXO'>('IPCA');
  const [mesReajuste, setMesReajuste] = useState<number>(1);
  const [cobra13Honorario, setCobra13Honorario] = useState<boolean>(true);

  const handleAbrirCriar = () => {
    setEditando(null);
    setEmpresaId(empresas[0]?.id || 1);
    setValorMensal('2500,00');
    setDiaVencimento(10);
    setIndexadorReajuste('IPCA');
    setMesReajuste(1);
    setCobra13Honorario(true);
    setShowModal(true);
  };

  const handleAbrirEditar = (c: ContratoHonorario) => {
    setEditando(c);
    setEmpresaId(c.empresaId);
    const v = c.valorMensalBase ?? c.valorMensal ?? 0;
    setValorMensal(v.toFixed(2).replace('.', ','));
    setDiaVencimento(c.diaVencimento);
    setIndexadorReajuste(c.indexadorReajuste);
    setMesReajuste(c.mesReajuste);
    setCobra13Honorario(c.cobra13Honorario);
    setShowModal(true);
  };

  const handleSalvar = () => {
    const val = parseFloat(valorMensal.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor mensal válido.');
      return;
    }

    const payload: ContratoHonorario = {
      id: editando ? editando.id : Date.now(),
      empresaId,
      valorMensal: val,
      valorMensalBase: val,
      diaVencimento,
      indexadorReajuste,
      mesReajuste,
      cobra13Honorario,
      status: editando ? editando.status : 'ATIVO',
      dataInicio: editando ? editando.dataInicio : new Date().toISOString().split('T')[0]
    };

    dbService.saveContratoHonorario(payload);
    setContratos(dbService.getContratosHonorarios());
    setShowModal(false);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Deseja excluir este contrato de honorários?')) {
      dbService.deleteContratoHonorario(id);
      setContratos(dbService.getContratosHonorarios());
    }
  };

  const handleExportCSV = () => {
    const headers = ['Empresa', 'CNPJ', 'Valor Mensal (R$)', 'Vencimento', 'Indexador', 'Mês Reajuste', '13º Honorário', 'Status'];
    const rows = filtrados.map(c => {
      const emp = empresas.find(e => e.id === c.empresaId);
      const val = c.valorMensalBase ?? c.valorMensal ?? 0;
      return [
        emp?.razaoSocial || `Empresa ${c.empresaId}`,
        emp?.cnpj || '',
        val.toFixed(2),
        `Dia ${c.diaVencimento}`,
        c.indexadorReajuste,
        `Mês ${c.mesReajuste}`,
        c.cobra13Honorario ? 'SIM' : 'NAO',
        c.status || 'ATIVO'
      ];
    });
    exportToCSV(`Contratos_Honorarios.csv`, headers, rows);
  };

  const filtrados = contratos.filter(c => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    const emp = empresas.find(e => e.id === c.empresaId);
    return emp?.razaoSocial.toLowerCase().includes(txt) ||
           emp?.cnpj.includes(txt);
  });

  const totalMRR = filtrados.filter(c => c.status !== 'CANCELADO').reduce((acc, c) => acc + (c.valorMensalBase ?? c.valorMensal ?? 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Contratos de Prestação de Serviços Contábeis</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-medium">Honorários</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Parametrização de honorários mensais por cliente, regras de reajuste anual e 13º honorário.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAbrirCriar}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Contrato</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
            title="Exportar Contratos em CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="px-5 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 bg-[#121212] border border-white/10 rounded px-2.5 py-1 w-72">
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por cliente ou CNPJ..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="bg-transparent text-neutral-200 outline-none w-full text-xs"
          />
        </div>

        <div className="text-neutral-400 font-mono text-[11px] flex items-center space-x-4">
          <span>Contratos Ativos: <strong className="text-neutral-200">{filtrados.length}</strong></span>
          <span>•</span>
          <span>MRR Total: <strong className="text-purple-400">R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>

      {/* Grade de Contratos */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px] z-10">
            <tr>
              <th className="py-2.5 px-3">Empresa Cliente</th>
              <th className="py-2.5 px-3 w-36">CNPJ</th>
              <th className="py-2.5 px-3 w-28 text-right">Valor Mensal</th>
              <th className="py-2.5 px-3 w-24 text-center">Vencimento</th>
              <th className="py-2.5 px-3 w-28 text-center">Indexador</th>
              <th className="py-2.5 px-3 w-24 text-center">Mês Reajuste</th>
              <th className="py-2.5 px-3 w-24 text-center">13º Honorário</th>
              <th className="py-2.5 px-3 w-20 text-center">Status</th>
              <th className="py-2.5 px-3 w-16 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[12px]">
            {filtrados.map((c) => {
              const emp = empresas.find(e => e.id === c.empresaId);

              return (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-neutral-100 font-bold font-sans">
                    {emp?.razaoSocial || `Empresa ID ${c.empresaId}`}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300">{emp?.cnpj}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-purple-400">
                    R$ {(c.valorMensalBase ?? c.valorMensal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-300">Dia {c.diaVencimento}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                      {c.indexadorReajuste}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-400">Mês {c.mesReajuste}</td>
                  <td className="py-2.5 px-3 text-center">
                    {c.cobra13Honorario ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        SIM (DEZ)
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-500">NÃO</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleAbrirEditar(c)}
                        className="p-1 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 rounded transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExcluir(c.id)}
                        className="p-1 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Criar / Editar Contrato */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-neutral-100">
                {editando ? 'Editar Contrato de Honorários' : 'Novo Contrato de Honorários'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Empresa Cliente:</label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-2 text-neutral-200 outline-none"
                >
                  {empresas.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.codigo.toString().padStart(3, '0')} - {e.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Valor Mensal Base (R$):</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={valorMensal}
                    onChange={(e) => setValorMensal(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-bold text-right outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Dia de Vencimento:</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={diaVencimento}
                    onChange={(e) => setDiaVencimento(parseInt(e.target.value, 10) || 10)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Indexador de Reajuste:</label>
                  <select
                    value={indexadorReajuste}
                    onChange={(e) => setIndexadorReajuste(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                  >
                    <option value="IPCA">IPCA (IBGE)</option>
                    <option value="IGPM">IGP-M (FGV)</option>
                    <option value="SALARIO_MINIMO">Salário Mínimo</option>
                    <option value="FIXO">Valor Fixo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Mês de Reajuste (1-12):</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={mesReajuste}
                    onChange={(e) => setMesReajuste(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cobra13Honorario}
                    onChange={(e) => setCobra13Honorario(e.target.checked)}
                    className="rounded bg-neutral-800"
                  />
                  <span className="text-neutral-200">Cobrar 13º Honorário no Mês de Dezembro</span>
                </label>
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
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition"
              >
                Salvar Contrato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
