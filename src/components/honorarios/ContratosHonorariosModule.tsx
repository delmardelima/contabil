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
  Download,
  Users,
  Receipt,
  ShieldCheck,
  X
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface ContratosHonorariosModuleProps {
  empresas: Empresa[];
}

export const ContratosHonorariosModule: React.FC<ContratosHonorariosModuleProps> = ({ empresas }) => {
  const [contratos, setContratos] = useState<ContratoHonorario[]>(() => dbService.getContratosHonorarios());
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

  // Reajuste em Lote de Contratos por Índice Oficial
  const [showReajusteModal, setShowReajusteModal] = useState<boolean>(false);
  const [indiceReajuste, setIndiceReajuste] = useState<'IPCA' | 'IGPM' | 'SALARIO_MINIMO' | 'FIXO'>('IPCA');
  const [percentualReajuste, setPercentualReajuste] = useState<number>(4.42);
  const [contratosSelecionadosReajuste, setContratosSelecionadosReajuste] = useState<number[]>([]);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Campos Avançados de Franquia & Retenções
  const [franquiaEmpregados, setFranquiaEmpregados] = useState<number>(5);
  const [valorExcedenteEmpregado, setValorExcedenteEmpregado] = useState<string>('35,00');
  const [franquiaNotas, setFranquiaNotas] = useState<number>(50);
  const [valorExcedenteNota, setValorExcedenteNota] = useState<string>('1,50');
  const [retencaoIRRF, setRetencaoIRRF] = useState<boolean>(false);
  const [retencaoCSRF, setRetencaoCSRF] = useState<boolean>(false);
  const [aliquotaISS, setAliquotaISS] = useState<number>(5.0);

  const handleAbrirCriar = () => {
    setEditando(null);
    setEmpresaId(empresas[0]?.id || 1);
    setValorMensal('2500,00');
    setDiaVencimento(10);
    setIndexadorReajuste('IPCA');
    setMesReajuste(1);
    setCobra13Honorario(true);
    setFranquiaEmpregados(5);
    setValorExcedenteEmpregado('35,00');
    setFranquiaNotas(50);
    setValorExcedenteNota('1,50');
    setRetencaoIRRF(false);
    setRetencaoCSRF(false);
    setAliquotaISS(5.0);
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
    setFranquiaEmpregados(c.franquiaEmpregados ?? 5);
    setValorExcedenteEmpregado((c.valorExcedenteEmpregado ?? 35).toFixed(2).replace('.', ','));
    setFranquiaNotas(c.franquiaNotas ?? 50);
    setValorExcedenteNota((c.valorExcedenteNota ?? 1.5).toFixed(2).replace('.', ','));
    setRetencaoIRRF(!!c.retencaoIRRF);
    setRetencaoCSRF(!!c.retencaoCSRF);
    setAliquotaISS(c.aliquotaISS ?? 5.0);
    setShowModal(true);
  };

  const handleSalvar = () => {
    const val = parseFloat(valorMensal.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor mensal válido.');
      return;
    }

    const valExcColab = parseFloat(valorExcedenteEmpregado.replace(/\./g, '').replace(',', '.')) || 0;
    const valExcNota = parseFloat(valorExcedenteNota.replace(/\./g, '').replace(',', '.')) || 0;

    const payload: ContratoHonorario = {
      id: editando ? editando.id : Date.now(),
      empresaId,
      valorMensal: val,
      valorMensalBase: val,
      diaVencimento,
      indexadorReajuste,
      mesReajuste,
      cobra13Honorario,
      franquiaEmpregados: Number(franquiaEmpregados),
      valorExcedenteEmpregado: valExcColab,
      franquiaNotas: Number(franquiaNotas),
      valorExcedenteNota: valExcNota,
      retencaoIRRF,
      retencaoCSRF,
      aliquotaISS: Number(aliquotaISS),
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

  const handleAbrirReajusteLote = () => {
    const ativosIds = contratos.filter(c => c.ativo !== false && c.status !== 'CANCELADO').map(c => c.id);
    setContratosSelecionadosReajuste(ativosIds);
    setIndiceReajuste('IPCA');
    setPercentualReajuste(4.42);
    setShowReajusteModal(true);
  };

  const handleMudarIndice = (ind: 'IPCA' | 'IGPM' | 'SALARIO_MINIMO' | 'FIXO') => {
    setIndiceReajuste(ind);
    if (ind === 'IPCA') setPercentualReajuste(4.42);
    else if (ind === 'IGPM') setPercentualReajuste(5.10);
    else if (ind === 'SALARIO_MINIMO') setPercentualReajuste(6.85);
    else setPercentualReajuste(5.00);
  };

  const handleToggleSelecionarTodos = () => {
    const ativosIds = contratos.filter(c => c.ativo !== false && c.status !== 'CANCELADO').map(c => c.id);
    if (contratosSelecionadosReajuste.length === ativosIds.length) {
      setContratosSelecionadosReajuste([]);
    } else {
      setContratosSelecionadosReajuste(ativosIds);
    }
  };

  const handleToggleContratoReajuste = (id: number) => {
    if (contratosSelecionadosReajuste.includes(id)) {
      setContratosSelecionadosReajuste(contratosSelecionadosReajuste.filter(i => i !== id));
    } else {
      setContratosSelecionadosReajuste([...contratosSelecionadosReajuste, id]);
    }
  };

  const handleAplicarReajusteLote = () => {
    if (contratosSelecionadosReajuste.length === 0) {
      alert('Selecione ao menos um contrato para reajustar.');
      return;
    }

    const res = dbService.reajustarContratosEmLote({
      indice: indiceReajuste,
      percentual: Number(percentualReajuste),
      dataReajuste: new Date().toISOString().split('T')[0],
      competenciaAplicacao: new Date().toISOString().slice(0, 7),
      contratosIds: contratosSelecionadosReajuste
    });

    if (res.success) {
      setContratos(dbService.getContratosHonorarios());
      setShowReajusteModal(false);
      setMensagemSucesso(`Reajuste aplicado com sucesso para ${res.contratosAtualizados} contratos pelo índice ${indiceReajuste} (${percentualReajuste}%)! Aumento total de MRR: R$ ${res.diferencaMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
      setTimeout(() => setMensagemSucesso(''), 6000);
    }
  };

  const filtrados = contratos.filter(c => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    const emp = empresas.find(e => e.id === c.empresaId);
    return emp?.razaoSocial.toLowerCase().includes(txt) ||
           emp?.cnpj.includes(txt);
  });

  const totalMRR = filtrados.filter(c => c.status !== 'CANCELADO').reduce((acc, c) => acc + (c.valorMensalBase ?? c.valorMensal ?? 0), 0);

  const handleExportCSV = () => {
    const data = filtrados.map(c => {
      const emp = empresas.find(e => e.id === c.empresaId);
      const val = c.valorMensalBase ?? c.valorMensal ?? 0;
      return {
        Empresa: emp?.razaoSocial || `Empresa ${c.empresaId}`,
        CNPJ: emp?.cnpj || '',
        ValorMensalBase: val,
        Vencimento: `Dia ${c.diaVencimento}`,
        Indexador: c.indexadorReajuste,
        MesReajuste: c.mesReajuste,
        DecimoTerceiro: c.cobra13Honorario ? 'SIM' : 'NAO',
        FranquiaEmpregados: c.franquiaEmpregados ?? 0,
        ValorExcEmpregado: c.valorExcedenteEmpregado ?? 0,
        FranquiaNotas: c.franquiaNotas ?? 0,
        ValorExcNota: c.valorExcedenteNota ?? 0,
        RetencaoIRRF: c.retencaoIRRF ? 'SIM' : 'NAO',
        RetencaoCSRF: c.retencaoCSRF ? 'SIM' : 'NAO',
        AliquotaISS: c.aliquotaISS ?? 0,
        Status: c.status || 'ATIVO'
      };
    });
    exportToCSV(data, 'Contratos_Honorarios_Avancados');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Contratos de Prestação de Serviços Contábeis</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-medium border border-purple-500/30">
                MRR: R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Parametrização de honorários base, franquias dinâmicas de folha/fiscal e retenções na fonte
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleAbrirReajusteLote}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Reajuste em Lote por Índice</span>
          </button>

          <button
            onClick={handleAbrirCriar}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {mensagemSucesso && (
        <div className="px-5 py-2.5 bg-purple-950/80 border-b border-purple-500/30 text-purple-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso('')} className="text-purple-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="px-5 py-2.5 bg-[#1c1c1c] border-b border-white/5 flex items-center justify-between text-xs">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por razão social ou CNPJ..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded pl-8 pr-3 py-1 text-neutral-100 placeholder-neutral-500 text-xs outline-none focus:border-purple-500 transition"
          />
        </div>

        <div className="text-neutral-400 text-xs">
          Total de Contratos Ativos: <span className="text-neutral-200 font-bold">{filtrados.length}</span>
        </div>
      </div>

      {/* Tabela de Contratos */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-semibold uppercase tracking-wider text-[11px] z-10">
            <tr>
              <th className="py-2.5 px-3">Empresa Cliente</th>
              <th className="py-2.5 px-3 w-32">CNPJ</th>
              <th className="py-2.5 px-3 w-28 text-right">Valor Base</th>
              <th className="py-2.5 px-3 w-28 text-center">Franquia Folha</th>
              <th className="py-2.5 px-3 w-28 text-center">Franquia Fiscal</th>
              <th className="py-2.5 px-3 w-28 text-center">Retenções</th>
              <th className="py-2.5 px-3 w-20 text-center">Venc.</th>
              <th className="py-2.5 px-3 w-20 text-center">Reajuste</th>
              <th className="py-2.5 px-3 w-20 text-center">Status</th>
              <th className="py-2.5 px-3 w-20 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[12px]">
            {filtrados.map((c) => {
              const emp = empresas.find(e => e.id === c.empresaId);

              return (
                <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 text-neutral-100 font-bold font-sans">
                    {emp?.razaoSocial || `Empresa ID ${c.empresaId}`}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300 font-mono text-[11px]">{emp?.cnpj}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-purple-400">
                    R$ {(c.valorMensalBase ?? c.valorMensal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-300">
                    <span className="text-[11px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20 font-sans">
                      Até {c.franquiaEmpregados ?? 5} (+R$ {(c.valorExcedenteEmpregado ?? 35).toFixed(0)})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-300">
                    <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans">
                      Até {c.franquiaNotas ?? 50} (+R$ {(c.valorExcedenteNota ?? 1.5).toFixed(2)})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1 text-[10px] font-sans">
                      {c.retencaoIRRF && <span className="px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">IRRF</span>}
                      {c.retencaoCSRF && <span className="px-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">CSRF</span>}
                      {c.aliquotaISS && c.aliquotaISS > 0 && <span className="px-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">ISS</span>}
                      {!c.retencaoIRRF && !c.retencaoCSRF && (!c.aliquotaISS || c.aliquotaISS === 0) && (
                        <span className="text-neutral-500">Isento</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-300">Dia {c.diaVencimento}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded border border-white/5 font-sans">
                      {c.indexadorReajuste}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans font-medium">
                      {c.status || 'ATIVO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleAbrirEditar(c)}
                        className="p-1 hover:bg-white/10 text-neutral-400 hover:text-white rounded transition"
                        title="Editar Contrato"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExcluir(c.id)}
                        className="p-1 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded transition"
                        title="Excluir Contrato"
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
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            <div className="bg-[#202020] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">
                  {editando ? 'Editar Contrato de Honorários' : 'Novo Contrato de Honorários'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Empresa Cliente *</label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(Number(e.target.value))}
                  className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {empresas.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.codigo.toString().padStart(3, '0')} - {e.razaoSocial} ({e.cnpj})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Valor Mensal Base (R$) *</label>
                  <input
                    type="text"
                    value={valorMensal}
                    onChange={(e) => setValorMensal(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono font-bold text-right focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Dia de Vencimento *</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={diaVencimento}
                    onChange={(e) => setDiaVencimento(parseInt(e.target.value, 10) || 10)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Seção Franquia Dinâmica */}
              <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-3">
                <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
                  Cobrança Variável por Franquia (Folha & Fiscal)
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Franquia de Empregados (Qtd)</label>
                    <input
                      type="number"
                      min={0}
                      value={franquiaEmpregados}
                      onChange={e => setFranquiaEmpregados(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Valor por Empregado Excedente (R$)</label>
                    <input
                      type="text"
                      value={valorExcedenteEmpregado}
                      onChange={e => setValorExcedenteEmpregado(e.target.value)}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Franquia de Notas Fiscais (Qtd)</label>
                    <input
                      type="number"
                      min={0}
                      value={franquiaNotas}
                      onChange={e => setFranquiaNotas(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Valor por Nota Excedente (R$)</label>
                    <input
                      type="text"
                      value={valorExcedenteNota}
                      onChange={e => setValorExcedenteNota(e.target.value)}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Retenções Tributárias */}
              <div className="p-3 bg-neutral-900/60 rounded-lg border border-white/5 space-y-2">
                <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
                  Retenções Tributárias na Fonte (Faturamento)
                </span>
                
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={retencaoIRRF}
                      onChange={e => setRetencaoIRRF(e.target.checked)}
                      className="rounded border-white/20 bg-neutral-800 text-purple-500"
                    />
                    <span>Retenção IRRF (1,5%)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={retencaoCSRF}
                      onChange={e => setRetencaoCSRF(e.target.checked)}
                      className="rounded border-white/20 bg-neutral-800 text-purple-500"
                    />
                    <span>Retenção CSRF (4,65%)</span>
                  </label>

                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-0.5">Alíquota ISS (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={5}
                      value={aliquotaISS}
                      onChange={e => setAliquotaISS(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Indexador de Reajuste</label>
                  <select
                    value={indexadorReajuste}
                    onChange={(e) => setIndexadorReajuste(e.target.value as any)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="IPCA">IPCA (IBGE)</option>
                    <option value="IGPM">IGP-M (FGV)</option>
                    <option value="SALARIO_MINIMO">Salário Mínimo</option>
                    <option value="FIXO">Valor Fixo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Mês de Reajuste (1-12)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={mesReajuste}
                    onChange={(e) => setMesReajuste(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={cobra13Honorario}
                    onChange={(e) => setCobra13Honorario(e.target.checked)}
                    className="rounded border-white/20 bg-neutral-800 text-purple-500"
                  />
                  <span>Cobrar 13º Honorário no Mês de Dezembro</span>
                </label>
              </div>
            </div>

            <div className="bg-[#202020] px-5 py-3 border-t border-white/10 flex items-center justify-end space-x-2">
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
                className="px-4 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded shadow-sm"
              >
                Salvar Contrato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reajuste em Lote de Contratos */}
      {showReajusteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="bg-[#202020] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Reajuste em Lote de Contratos por Índice Oficial</h3>
                  <p className="text-[11px] text-neutral-400">Simulação e aplicação automática de reajustes contratuais por índices econômicos vigentes</p>
                </div>
              </div>
              <button onClick={() => setShowReajusteModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Índice Econômico Oficial</label>
                  <select
                    value={indiceReajuste}
                    onChange={e => handleMudarIndice(e.target.value as any)}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="IPCA">IPCA (IBGE) - 4,42% a.a.</option>
                    <option value="IGPM">IGP-M (FGV) - 5,10% a.a.</option>
                    <option value="SALARIO_MINIMO">Salário Mínimo - 6,85% a.a.</option>
                    <option value="FIXO">Percentual Fixo Customizado (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Percentual de Reajuste (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={percentualReajuste}
                    onChange={e => setPercentualReajuste(Number(e.target.value))}
                    className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none font-mono focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Tabela de Simulação */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-neutral-400 font-medium">Contratos Ativos Elegíveis ({contratosSelecionadosReajuste.length} selecionados)</span>
                  <button
                    onClick={handleToggleSelecionarTodos}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                  >
                    {contratosSelecionadosReajuste.length === contratos.filter(c => c.ativo !== false).length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                </div>

                <div className="max-h-56 overflow-auto custom-scrollbar border border-white/10 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#222222] border-b border-white/10 text-neutral-400 font-semibold text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-2.5 w-8 text-center">Sel.</th>
                        <th className="py-2 px-2.5">Empresa Cliente</th>
                        <th className="py-2 px-2.5 w-24 text-right">Valor Atual</th>
                        <th className="py-2 px-2.5 w-24 text-right text-purple-400">Novo Valor</th>
                        <th className="py-2 px-2.5 w-24 text-right text-emerald-400">Aumento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {contratos.filter(c => c.ativo !== false).map(c => {
                        const emp = empresas.find(e => e.id === c.empresaId);
                        const valAtual = c.valorMensalBase ?? c.valorMensal ?? 0;
                        const novoVal = Math.round(valAtual * (1 + percentualReajuste / 100) * 100) / 100;
                        const dif = novoVal - valAtual;
                        const isSel = contratosSelecionadosReajuste.includes(c.id);

                        return (
                          <tr key={c.id} className={`hover:bg-white/[0.02] ${isSel ? 'bg-purple-900/10' : 'opacity-60'}`}>
                            <td className="py-1.5 px-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => handleToggleContratoReajuste(c.id)}
                                className="rounded border-white/20 bg-neutral-800 text-purple-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-1.5 px-2.5 font-sans font-medium text-neutral-200">
                              {emp?.razaoSocial || `Empresa ${c.empresaId}`}
                            </td>
                            <td className="py-1.5 px-2.5 text-right text-neutral-400">R$ {valAtual.toFixed(2)}</td>
                            <td className="py-1.5 px-2.5 text-right font-bold text-purple-300">R$ {novoVal.toFixed(2)}</td>
                            <td className="py-1.5 px-2.5 text-right font-bold text-emerald-400">+ R$ {dif.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totalizador de Ganho de MRR */}
              <div className="bg-[#121212] p-3 rounded-lg border border-purple-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 font-sans">Aumento Total de Faturamento Mensal (MRR):</span>
                <strong className="text-emerald-400 font-bold text-sm">
                  + R$ {contratos
                    .filter(c => contratosSelecionadosReajuste.includes(c.id))
                    .reduce((acc, c) => {
                      const v = c.valorMensalBase ?? c.valorMensal ?? 0;
                      return acc + (Math.round(v * (1 + percentualReajuste / 100) * 100) / 100 - v);
                    }, 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </strong>
              </div>
            </div>

            <div className="bg-[#202020] px-5 py-3 border-t border-white/10 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowReajusteModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-transparent rounded border border-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAplicarReajusteLote}
                className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded shadow-sm flex items-center space-x-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Aplicar Reajuste em Lote ({contratosSelecionadosReajuste.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
