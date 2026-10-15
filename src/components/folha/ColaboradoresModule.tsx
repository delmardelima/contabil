import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Colaborador, CentroCusto, Empresa } from '../../types/contabil';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  UserCheck, 
  Building, 
  Briefcase, 
  DollarSign, 
  Download
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface ColaboradoresModuleProps {
  empresa: Empresa;
  centrosCusto: CentroCusto[];
}

export const ColaboradoresModule: React.FC<ColaboradoresModuleProps> = ({
  empresa,
  centrosCusto
}) => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(dbService.getColaboradores(empresa.id));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ATIVO' | 'AFASTADO' | 'DESLIGADO'>('ATIVO');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<Colaborador | null>(null);

  // Form State
  const [matricula, setMatricula] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [cargo, setCargo] = useState<string>('');
  const [departamento, setDepartamento] = useState<string>('');
  const [tipoVinculo, setTipoVinculo] = useState<'CLT' | 'PRO_LABORE' | 'ESTAGIO' | 'AUTONOMO'>('CLT');
  const [salarioBase, setSalarioBase] = useState<string>('');
  const [dependentesIRRF, setDependentesIRRF] = useState<number>(0);
  const [centroCustoId, setCentroCustoId] = useState<number>(centrosCusto[0]?.id || 1);
  const [chavePix, setChavePix] = useState<string>('');

  const handleAbrirCriar = () => {
    setEditando(null);
    setMatricula((colaboradores.length + 1).toString().padStart(4, '0'));
    setNome('');
    setCpf('');
    setCargo('Assistente');
    setDepartamento('Administrativo');
    setTipoVinculo('CLT');
    setSalarioBase('3500,00');
    setDependentesIRRF(0);
    setCentroCustoId(centrosCusto[0]?.id || 1);
    setChavePix('');
    setShowModal(true);
  };

  const handleAbrirEditar = (c: Colaborador) => {
    setEditando(c);
    setMatricula(String(c.matricula));
    setNome(c.nome);
    setCpf(c.cpf);
    setCargo(c.cargo);
    setDepartamento(c.departamento || '');
    setTipoVinculo(c.tipoVinculo);
    setSalarioBase(c.salarioBase.toFixed(2).replace('.', ','));
    setDependentesIRRF(c.dependentesIRRF);
    setCentroCustoId(c.centroCustoId || centrosCusto[0]?.id || 1);
    setChavePix(c.dadosBancarios?.chavePix || '');
    setShowModal(true);
  };

  const handleSalvar = () => {
    if (!nome.trim() || !cpf.trim() || !salarioBase) {
      alert('Preencha os campos obrigatórios (Nome, CPF e Salário Base).');
      return;
    }

    const sal = parseFloat(salarioBase.replace(/\./g, '').replace(',', '.'));
    if (isNaN(sal) || sal <= 0) return;

    const payload: Colaborador = {
      id: editando ? editando.id : Date.now(),
      empresaId: empresa.id,
      matricula: matricula || `${colaboradores.length + 1}`,
      nome: nome.trim(),
      cpf: cpf.trim(),
      cargo: cargo.trim() || 'Colaborador',
      departamento: departamento.trim() || 'Geral',
      tipoVinculo,
      dataAdmissao: editando ? editando.dataAdmissao : new Date().toISOString().split('T')[0],
      salarioBase: sal,
      dependentesIRRF,
      centroCustoId,
      dadosBancarios: chavePix ? { chavePix } : undefined,
      status: editando ? editando.status : 'ATIVO'
    };

    dbService.saveColaborador(payload);
    setColaboradores(dbService.getColaboradores(empresa.id));
    setShowModal(false);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Deseja excluir o registro deste colaborador?')) {
      dbService.deleteColaborador(id);
      setColaboradores(dbService.getColaboradores(empresa.id));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Matrícula', 'Nome', 'CPF', 'Vínculo', 'Cargo', 'Departamento', 'Salário Base (R$)', 'Status'];
    const rows = filtrados.map(c => [
      String(c.matricula),
      c.nome,
      c.cpf,
      c.tipoVinculo,
      c.cargo,
      c.departamento || '',
      c.salarioBase.toFixed(2),
      c.status || 'ATIVO'
    ]);
    exportToCSV(`Colaboradores_${empresa.codigo}.csv`, headers, rows);
  };

  const filtrados = colaboradores.filter(c => {
    if (filtroStatus !== 'TODOS' && c.status !== filtroStatus) return false;
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return c.nome.toLowerCase().includes(txt) ||
           c.cpf.includes(txt) ||
           c.cargo.toLowerCase().includes(txt) ||
           String(c.matricula).includes(txt);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Colaboradores, Sócios & Diretoria</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">eSocial</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Gestão de empregados CLT, sócios com pró-labore, estagiários e centros de custo.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAbrirCriar}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Colaborador / Sócio</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
            title="Exportar Lista em CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="px-5 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-neutral-900 rounded-lg p-0.5 border border-white/10">
            {(['TODOS', 'ATIVO', 'AFASTADO', 'DESLIGADO'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filtroStatus === s ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {s === 'TODOS' ? 'Todos os Status' : s}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-[#121212] border border-white/10 rounded px-2.5 py-1 w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou cargo..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="bg-transparent text-neutral-200 outline-none w-full text-xs"
            />
          </div>
        </div>

        <div className="text-neutral-400 font-mono text-[11px]">
          Total: <strong className="text-neutral-200">{filtrados.length}</strong> colaboradores cadastrados
        </div>
      </div>

      {/* Grade de Colaboradores */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px] z-10">
            <tr>
              <th className="py-2.5 px-3 w-16 text-center">Matr.</th>
              <th className="py-2.5 px-3">Nome do Colaborador</th>
              <th className="py-2.5 px-3 w-28">CPF</th>
              <th className="py-2.5 px-3 w-24 text-center">Vínculo</th>
              <th className="py-2.5 px-3">Cargo / Função</th>
              <th className="py-2.5 px-3">Departamento</th>
              <th className="py-2.5 px-3 w-28 text-right">Salário Base</th>
              <th className="py-2.5 px-3 w-20 text-center">Dep. IR</th>
              <th className="py-2.5 px-3 w-20 text-center">Status</th>
              <th className="py-2.5 px-3 w-16 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[12px]">
            {filtrados.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5 px-3 text-center text-neutral-400">{c.matricula}</td>
                <td className="py-2.5 px-3 text-neutral-100 font-bold font-sans">
                  {c.nome}
                </td>
                <td className="py-2.5 px-3 text-neutral-300">{c.cpf}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    c.tipoVinculo === 'PRO_LABORE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {c.tipoVinculo === 'PRO_LABORE' ? 'PRÓ-LABORE' : c.tipoVinculo}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-neutral-300 font-sans">{c.cargo}</td>
                <td className="py-2.5 px-3 text-neutral-400 font-sans">{c.departamento}</td>
                <td className="py-2.5 px-3 text-right font-bold text-neutral-100">
                  R$ {c.salarioBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-center text-neutral-400">{c.dependentesIRRF}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Criar / Editar Colaborador */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-neutral-100">
                {editando ? 'Editar Vínculo Empregatício' : 'Novo Vínculo / Colaborador'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Matrícula:</label>
                  <input
                    type="text"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-neutral-400 mb-1">Tipo de Vínculo:</label>
                  <select
                    value={tipoVinculo}
                    onChange={(e) => setTipoVinculo(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                  >
                    <option value="CLT">Empregado CLT (Carteira Assinada)</option>
                    <option value="PRO_LABORE">Sócio / Diretor (Pró-Labore)</option>
                    <option value="ESTAGIO">Estagiário (Lei 11.788)</option>
                    <option value="AUTONOMO">Autônomo (RPA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  placeholder="Nome do colaborador ou sócio"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-1.5 text-neutral-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">CPF:</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Salário Base (R$):</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={salarioBase}
                    onChange={(e) => setSalarioBase(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-bold text-right outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Cargo / Função:</label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Departamento:</label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Dependentes IRRF:</label>
                  <input
                    type="number"
                    min={0}
                    value={dependentesIRRF}
                    onChange={(e) => setDependentesIRRF(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Chave Pix Pagamento:</label>
                  <input
                    type="text"
                    placeholder="Chave Pix do Colaborador"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
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
                Salvar Colaborador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
