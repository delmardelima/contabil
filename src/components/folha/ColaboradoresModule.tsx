import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Colaborador, CentroCusto, Empresa, DependenteFolha } from '../../types/contabil';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Building2, 
  Briefcase, 
  DollarSign, 
  Download, 
  Check, 
  X, 
  User, 
  FileText, 
  CreditCard, 
  Calendar, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { 
  maskCPF, 
  validarCPF, 
  maskCEP, 
  formatCurrency, 
  unmask 
} from '../../utils/formatters';
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
  const [activeModalTab, setActiveModalTab] = useState<'pessoais' | 'documentos' | 'contrato' | 'dependentes'>('pessoais');
  
  // Colaborador em Edição (4 abas)
  const [colaboradorEmEdicao, setColaboradorEmEdicao] = useState<Colaborador | null>(null);

  // Modal de Adicionar Dependente
  const [modalDependenteAberto, setModalDependenteAberto] = useState(false);
  const [novoDependente, setNovoDependente] = useState<DependenteFolha>({
    id: Date.now(),
    nome: '',
    cpf: '',
    dataNascimento: '',
    parentesco: 'FILHO',
    finsIRRF: true,
    finsSalarioFamilia: false
  });

  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  React.useEffect(() => {
    setColaboradores(dbService.getColaboradores(empresa.id));
  }, [empresa.id]);

  const filtrados = colaboradores.filter(c => {
    if (filtroStatus !== 'TODOS' && c.status !== filtroStatus) return false;
    if (!filtroTexto) return true;
    const termo = filtroTexto.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      c.cpf.includes(termo) ||
      String(c.matricula).includes(termo) ||
      c.cargo.toLowerCase().includes(termo)
    );
  });

  const handleAbrirCriar = () => {
    const proximaMatricula = colaboradores.length + 1;
    const novo: Colaborador = {
      id: Date.now(),
      empresaId: empresa.id,
      matricula: String(proximaMatricula).padStart(4, '0'),
      matriculaeSocial: `MATR-${String(proximaMatricula).padStart(6, '0')}`,
      nome: '',
      cpf: '',
      dataNascimento: '1990-01-01',
      sexo: 'M',
      estadoCivil: 'SOLTEIRO',
      grauInstrucao: 'SUPERIOR_COMPLETO',
      racaCor: 'BRANCA',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: empresa.cidade || 'São Paulo',
      uf: empresa.uf || 'SP',
      cep: '',
      ctpsNumero: '',
      ctpsSerie: '',
      ctpsUF: empresa.uf || 'SP',
      rgNumero: '',
      rgOrgaoEmissor: 'SSP',
      pisPasep: '',
      tituloEleitor: '',
      categoriaeSocial: '101',
      cbo: '4110-10',
      cargo: 'Assistente Administrativo',
      departamento: 'Administração',
      tipoVinculo: 'CLT',
      salarioBase: 3500.00,
      tipoPagamento: 'MENSALISTA',
      jornadaSemanal: 44,
      dependentesIRRF: 0,
      dependentesSalarioFamilia: 0,
      listaDependentes: [],
      dataAdmissao: new Date().toISOString().split('T')[0],
      centroCustoId: centrosCusto[0]?.id || 1,
      bancoNome: 'Banco Itaú',
      agencia: '',
      contaBancaria: '',
      dadosBancarios: { chavePix: '' },
      ativo: true,
      status: 'ATIVO'
    };
    setColaboradorEmEdicao(novo);
    setActiveModalTab('pessoais');
    setShowModal(true);
  };

  const handleAbrirEditar = (c: Colaborador) => {
    setColaboradorEmEdicao({ ...c });
    setActiveModalTab('pessoais');
    setShowModal(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorEmEdicao) return;

    if (!colaboradorEmEdicao.nome.trim() || !colaboradorEmEdicao.cpf.trim() || !colaboradorEmEdicao.salarioBase) {
      alert('Preencha os campos obrigatórios (Nome, CPF e Salário Base).');
      return;
    }

    // Calcula total de dependentes IRRF e Salário Família
    const deps = colaboradorEmEdicao.listaDependentes || [];
    const depIRRF = deps.filter(d => d.finsIRRF).length;
    const depSF = deps.filter(d => d.finsSalarioFamilia).length;

    const payload: Colaborador = {
      ...colaboradorEmEdicao,
      dependentesIRRF: depIRRF,
      dependentesSalarioFamilia: depSF
    };

    dbService.saveColaborador(payload);
    setColaboradores(dbService.getColaboradores(empresa.id));
    setShowModal(false);
    setColaboradorEmEdicao(null);
    setMensagemSucesso('Colaborador salvo com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Deseja realmente excluir o cadastro deste colaborador?')) {
      dbService.deleteColaborador(id);
      setColaboradores(dbService.getColaboradores(empresa.id));
      setMensagemSucesso('Colaborador excluído.');
      setTimeout(() => setMensagemSucesso(null), 3000);
    }
  };

  // Gestão de Dependentes
  const handleSalvarDependente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorEmEdicao || !novoDependente.nome.trim()) return;

    const lista = colaboradorEmEdicao.listaDependentes || [];
    const atualizada = [...lista, { ...novoDependente, id: Date.now() }];

    setColaboradorEmEdicao({
      ...colaboradorEmEdicao,
      listaDependentes: atualizada,
      dependentesIRRF: atualizada.filter(d => d.finsIRRF).length,
      dependentesSalarioFamilia: atualizada.filter(d => d.finsSalarioFamilia).length
    });

    setModalDependenteAberto(false);
    setNovoDependente({
      id: Date.now(),
      nome: '',
      cpf: '',
      dataNascimento: '',
      parentesco: 'FILHO',
      finsIRRF: true,
      finsSalarioFamilia: false
    });
  };

  const handleExcluirDependente = (id: number) => {
    if (!colaboradorEmEdicao) return;
    const lista = (colaboradorEmEdicao.listaDependentes || []).filter(d => d.id !== id);
    setColaboradorEmEdicao({
      ...colaboradorEmEdicao,
      listaDependentes: lista,
      dependentesIRRF: lista.filter(d => d.finsIRRF).length,
      dependentesSalarioFamilia: lista.filter(d => d.finsSalarioFamilia).length
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Matrícula', 'Matrícula eSocial', 'Nome', 'CPF', 'Vínculo', 'Categoria eSocial', 
      'Cargo', 'CBO', 'Salário Base (R$)', 'Data Admissão', 'Dep. IRRF', 'Status'
    ];
    const rows = filtrados.map(c => [
      String(c.matricula),
      c.matriculaeSocial || '-',
      c.nome,
      c.cpf,
      c.tipoVinculo,
      c.categoriaeSocial || '101',
      c.cargo,
      c.cbo || '-',
      c.salarioBase.toFixed(2),
      c.dataAdmissao,
      c.dependentesIRRF,
      c.status || 'ATIVO'
    ]);
    exportToCSV(`Colaboradores_eSocial_${empresa.codigo}`, rows, headers);
  };

  // Validação CPF no modal
  const cpfLimpo = colaboradorEmEdicao ? unmask(colaboradorEmEdicao.cpf) : '';
  const cpfValido = cpfLimpo.length === 11 ? validarCPF(colaboradorEmEdicao!.cpf) : false;

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Colaboradores, Sócios & eSocial</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                FOEMPREGADO / S-2200
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Controle de vínculos CLT, pró-labore, estagiários, dependentes (IRRF/Salário Família) e eventos do eSocial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mensagemSucesso && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <Check size={14} />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-neutral-200 border border-white/10 transition"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleAbrirCriar}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition active:scale-95"
          >
            <Plus size={15} />
            <span>Novo Colaborador (F2)</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex items-center justify-between gap-4 mt-4 p-3 bg-[#181818] border border-white/10 rounded-xl flex-shrink-0">
        <div className="flex items-center gap-1">
          {(['ATIVO', 'AFASTADO', 'DESLIGADO', 'TODOS'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1 text-xs rounded-lg transition font-medium ${
                filtroStatus === st 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {st === 'TODOS' ? 'Todos' : st === 'ATIVO' ? 'Ativos' : st === 'AFASTADO' ? 'Afastados' : 'Desligados'}
            </button>
          ))}
        </div>

        <div className="relative w-80">
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, matrícula..."
            value={filtroTexto}
            onChange={e => setFiltroTexto(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grade de Colaboradores */}
      <div className="flex-1 mt-4 border border-white/10 rounded-xl overflow-hidden bg-[#181818] flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1c1c1c] text-neutral-400 border-b border-white/10 font-mono sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 w-20 text-center">Matrícula</th>
                <th className="py-2.5 px-4">Nome do Colaborador / Sócio</th>
                <th className="py-2.5 px-3">CPF</th>
                <th className="py-2.5 px-3">Cargo / CBO</th>
                <th className="py-2.5 px-3 text-center">Vínculo</th>
                <th className="py-2.5 px-3 text-right">Salário Base (R$)</th>
                <th className="py-2.5 px-3 text-center">Admissão</th>
                <th className="py-2.5 px-2 text-center">Dep. IRRF</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-center w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-500 text-xs italic">
                    Nenhum colaborador encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtrados.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-neutral-300">
                      #{String(c.matricula).padStart(4, '0')}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-white">
                      <div>{c.nome}</div>
                      {c.matriculaeSocial && (
                        <div className="text-[10px] font-mono text-neutral-400">eSocial: {c.matriculaeSocial}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-300">{c.cpf}</td>
                    <td className="py-2.5 px-3 text-neutral-300">
                      <div>{c.cargo}</div>
                      {c.cbo && <div className="text-[10px] font-mono text-neutral-400">CBO: {c.cbo}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        c.tipoVinculo === 'CLT'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : c.tipoVinculo === 'PRO_LABORE'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {c.tipoVinculo.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(c.salarioBase)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-neutral-400">{c.dataAdmissao}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-semibold text-neutral-300">
                      {c.dependentesIRRF}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.status === 'ATIVO' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : c.status === 'AFASTADO'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}>
                        {c.status || 'ATIVO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAbrirEditar(c)}
                          className="p-1 hover:text-emerald-400 text-neutral-400 transition"
                          title="Editar Colaborador (4 Abas)"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleExcluir(c.id)}
                          className="p-1 hover:text-rose-400 text-neutral-400 transition"
                          title="Excluir Colaborador"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé Totalizador */}
        <div className="p-3 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Mostrando {filtrados.length} de {colaboradores.length} colaboradores</span>
          <span className="font-mono text-neutral-500">Pressione F2 para novo colaborador • eSocial S-2200</span>
        </div>
      </div>

      {/* MODAL: COLABORADOR EM 4 ABAS */}
      {showModal && colaboradorEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-emerald-400" />
                <span>
                  {colaboradorEmEdicao.nome 
                    ? `Editar Colaborador #${colaboradorEmEdicao.matricula} - ${colaboradorEmEdicao.nome}` 
                    : 'Ficha Cadastral do Colaborador (eSocial)'}
                </span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Abas do Formulário */}
            <div className="flex items-center gap-1 border-b border-white/10 pb-2 flex-shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveModalTab('pessoais')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition font-medium ${
                  activeModalTab === 'pessoais' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <User size={13} />
                <span>1. Dados Pessoais & Endereço</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('documentos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition font-medium ${
                  activeModalTab === 'documentos' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText size={13} />
                <span>2. Documentos Trabalhistas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('contrato')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition font-medium ${
                  activeModalTab === 'contrato' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Briefcase size={13} />
                <span>3. Contrato & eSocial (S-2200)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('dependentes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition font-medium ${
                  activeModalTab === 'dependentes' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserCheck size={13} />
                <span>4. Dependentes</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-300 font-mono">
                  {(colaboradorEmEdicao.listaDependentes || []).length}
                </span>
              </button>
            </div>

            {/* Conteúdo do Formulário */}
            <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              
              {/* ABA 1: DADOS PESSOAIS & ENDEREÇO */}
              {activeModalTab === 'pessoais' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.nome}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, nome: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-neutral-300">CPF *</label>
                        {cpfLimpo.length === 11 && (
                          <span className={`text-[10px] flex items-center gap-1 font-semibold ${
                            cpfValido ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {cpfValido ? <Check size={11} /> : <AlertTriangle size={11} />}
                            {cpfValido ? 'Válido' : 'Inválido'}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.cpf}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, cpf: maskCPF(e.target.value) })}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Data Nascimento</label>
                      <input
                        type="date"
                        value={colaboradorEmEdicao.dataNascimento || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, dataNascimento: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Sexo</label>
                      <select
                        value={colaboradorEmEdicao.sexo || 'M'}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, sexo: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Estado Civil</label>
                      <select
                        value={colaboradorEmEdicao.estadoCivil || 'SOLTEIRO'}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, estadoCivil: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="SOLTEIRO">Solteiro(a)</option>
                        <option value="CASADO">Casado(a)</option>
                        <option value="DIVORCIADO">Divorciado(a)</option>
                        <option value="VIUVO">Viúvo(a)</option>
                        <option value="UNIAO_ESTAVEL">União Estável</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Raça / Cor</label>
                      <select
                        value={colaboradorEmEdicao.racaCor || 'BRANCA'}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, racaCor: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="BRANCA">Branca</option>
                        <option value="PRETA">Preta</option>
                        <option value="PARDA">Parda</option>
                        <option value="AMARELA">Amarela</option>
                        <option value="INDIGENA">Indígena</option>
                      </select>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">CEP</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.cep || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, cep: maskCEP(e.target.value) })}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Logradouro / Rua</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.logradouro || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, logradouro: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Número</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.numero || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, numero: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Bairro</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.bairro || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, bairro: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Cidade / Município</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.cidade || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, cidade: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">UF</label>
                      <select
                        value={colaboradorEmEdicao.uf || 'SP'}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, uf: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: DOCUMENTOS TRABALHISTAS */}
              {activeModalTab === 'documentos' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">CTPS Número (Digital)</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.ctpsNumero || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, ctpsNumero: e.target.value })}
                        placeholder="Ex: 1234567"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">CTPS Série</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.ctpsSerie || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, ctpsSerie: e.target.value })}
                        placeholder="Ex: 0010"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">PIS / PASEP / NIT</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.pisPasep || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, pisPasep: e.target.value })}
                        placeholder="000.00000.00-0"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">RG / Documento de Identidade</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.rgNumero || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, rgNumero: e.target.value })}
                        placeholder="Ex: 34.567.890-X"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Órgão Emissor / UF</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.rgOrgaoEmissor || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, rgOrgaoEmissor: e.target.value })}
                        placeholder="Ex: SSP/SP"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Título de Eleitor</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.tituloEleitor || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, tituloEleitor: e.target.value })}
                        placeholder="12 dígitos"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 3: CONTRATO & ESOCIAL (S-2200) */}
              {activeModalTab === 'contrato' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Matrícula Interna</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.matricula}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, matricula: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Matrícula eSocial (S-2200)</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.matriculaeSocial || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, matriculaeSocial: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Categoria eSocial</label>
                      <select
                        value={colaboradorEmEdicao.categoriaeSocial || '101'}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, categoriaeSocial: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="101">101 - Empregado Geral (CLT)</option>
                        <option value="103">103 - Aprendiz</option>
                        <option value="721">721 - Diretor Não Empregado (Pró-Labore c/ FGTS)</option>
                        <option value="722">722 - Diretor Não Empregado (Pró-Labore s/ FGTS)</option>
                        <option value="701">701 - Contribuinte Individual (Autônomo RPA)</option>
                        <option value="901">901 - Estagiário</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Cargo *</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.cargo}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, cargo: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">CBO (Classificação)</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.cbo || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, cbo: e.target.value })}
                        placeholder="Ex: 4110-10"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Data Admissão *</label>
                      <input
                        type="date"
                        value={colaboradorEmEdicao.dataAdmissao}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, dataAdmissao: e.target.value })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo de Vínculo</label>
                      <select
                        value={colaboradorEmEdicao.tipoVinculo}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, tipoVinculo: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="CLT">CLT (Empregado)</option>
                        <option value="PRO_LABORE">Pró-Labore (Sócio)</option>
                        <option value="ESTAGIO">Estágio</option>
                        <option value="AUTONOMO">Autônomo (RPA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Salário Base (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={colaboradorEmEdicao.salarioBase}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, salarioBase: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Jornada Semanal (Horas)</label>
                      <input
                        type="number"
                        value={colaboradorEmEdicao.jornadaSemanal || 44}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, jornadaSemanal: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Centro de Custo</label>
                      <select
                        value={colaboradorEmEdicao.centroCustoId}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, centroCustoId: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {centrosCusto.map(cc => (
                          <option key={cc.id} value={cc.id}>{cc.codigo} - {cc.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dados Bancários */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Banco</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.bancoNome || ''}
                        onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, bancoNome: e.target.value })}
                        placeholder="Ex: Banco Itaú"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Agência / Conta</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={colaboradorEmEdicao.agencia || ''}
                          onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, agencia: e.target.value })}
                          placeholder="Agência"
                          className="w-24 px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          value={colaboradorEmEdicao.contaBancaria || ''}
                          onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, contaBancaria: e.target.value })}
                          placeholder="Conta C/C"
                          className="flex-1 px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">Chave PIX</label>
                      <input
                        type="text"
                        value={colaboradorEmEdicao.dadosBancarios?.chavePix || ''}
                        onChange={e => setColaboradorEmEdicao({ 
                          ...colaboradorEmEdicao, 
                          dadosBancarios: { chavePix: e.target.value } 
                        })}
                        placeholder="CPF, e-mail ou celular"
                        className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Status do Colaborador</label>
                    <select
                      value={colaboradorEmEdicao.status || 'ATIVO'}
                      onChange={e => setColaboradorEmEdicao({ ...colaboradorEmEdicao, status: e.target.value as any })}
                      className="w-48 px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="AFASTADO">Afastado (INSS/Licença)</option>
                      <option value="DESLIGADO">Desligado / Rescindido</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ABA 4: DEPENDENTES (FODEPENDENTE) */}
              {activeModalTab === 'dependentes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Lista de Dependentes (FODEPENDENTE)</h4>
                      <p className="text-[11px] text-neutral-400">Dependentes para dedução legal de IRRF (R$ 189,59/mês) e Salário Família</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModalDependenteAberto(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
                    >
                      <Plus size={14} />
                      <span>Adicionar Dependente</span>
                    </button>
                  </div>

                  {/* Tabela de Dependentes */}
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-[#141414]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#1c1c1c] text-neutral-400 border-b border-white/10 font-mono">
                        <tr>
                          <th className="py-2.5 px-3">Nome do Dependente</th>
                          <th className="py-2.5 px-3">CPF</th>
                          <th className="py-2.5 px-3 text-center">Nascimento</th>
                          <th className="py-2.5 px-3">Parentesco</th>
                          <th className="py-2.5 px-2 text-center">IRRF</th>
                          <th className="py-2.5 px-2 text-center">Sal. Família</th>
                          <th className="py-2.5 px-3 text-center w-16">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {(colaboradorEmEdicao.listaDependentes || []).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-neutral-500 italic">
                              Nenhum dependente cadastrado para este colaborador.
                            </td>
                          </tr>
                        ) : (
                          (colaboradorEmEdicao.listaDependentes || []).map(dep => (
                            <tr key={dep.id} className="hover:bg-white/[0.02] transition">
                              <td className="py-2.5 px-3 font-semibold text-white">{dep.nome}</td>
                              <td className="py-2.5 px-3 font-mono text-neutral-300">{dep.cpf || '-'}</td>
                              <td className="py-2.5 px-3 text-center font-mono text-neutral-400">{dep.dataNascimento}</td>
                              <td className="py-2.5 px-3 text-neutral-300">{dep.parentesco}</td>
                              <td className="py-2.5 px-2 text-center">
                                {dep.finsIRRF ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">Sim</span>
                                ) : (
                                  <span className="text-neutral-500">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                {dep.finsSalarioFamilia ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400">Sim</span>
                                ) : (
                                  <span className="text-neutral-500">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleExcluirDependente(dep.id)}
                                  className="p-1 hover:text-rose-400 text-neutral-400 transition"
                                  title="Remover Dependente"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-[#141414] rounded-lg border border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Total Deduções IRRF: <strong className="text-white">{(colaboradorEmEdicao.listaDependentes || []).filter(d => d.finsIRRF).length} dependente(s)</strong></span>
                    <span className="text-neutral-400">Salário Família: <strong className="text-white">{(colaboradorEmEdicao.listaDependentes || []).filter(d => d.finsSalarioFamilia).length} cota(s)</strong></span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
                >
                  Salvar Ficha do Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: ADICIONAR DEPENDENTE */}
      {modalDependenteAberto && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <UserCheck size={15} className="text-emerald-400" />
                <span>Novo Dependente (eSocial / IRRF)</span>
              </h4>
              <button onClick={() => setModalDependenteAberto(false)} className="text-neutral-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSalvarDependente} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={novoDependente.nome}
                  onChange={e => setNovoDependente({ ...novoDependente, nome: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">CPF (Obrigatório se &gt; 0)</label>
                  <input
                    type="text"
                    value={novoDependente.cpf || ''}
                    onChange={e => setNovoDependente({ ...novoDependente, cpf: maskCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Data Nascimento *</label>
                  <input
                    type="date"
                    value={novoDependente.dataNascimento}
                    onChange={e => setNovoDependente({ ...novoDependente, dataNascimento: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Parentesco</label>
                <select
                  value={novoDependente.parentesco}
                  onChange={e => setNovoDependente({ ...novoDependente, parentesco: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="FILHO">Filho(a) até 21 anos (ou 24 universitário)</option>
                  <option value="CONJUGE">Cônjuge / Companheiro(a)</option>
                  <option value="PAI_MAE">Pai / Mãe / Avós</option>
                  <option value="OUTROS">Outro Dependente sob Tutela</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="depIRRF"
                    checked={novoDependente.finsIRRF}
                    onChange={e => setNovoDependente({ ...novoDependente, finsIRRF: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#141414] border-white/20 text-emerald-600 focus:ring-0"
                  />
                  <label htmlFor="depIRRF" className="text-xs text-neutral-200 cursor-pointer">
                    Dependente para Dedução do Imposto de Renda (IRRF)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="depSF"
                    checked={novoDependente.finsSalarioFamilia}
                    onChange={e => setNovoDependente({ ...novoDependente, finsSalarioFamilia: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#141414] border-white/20 text-emerald-600 focus:ring-0"
                  />
                  <label htmlFor="depSF" className="text-xs text-neutral-200 cursor-pointer">
                    Dependente para Cota de Salário Família (até 14 anos)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalDependenteAberto(false)}
                  className="px-3 py-1.5 text-xs rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                >
                  Confirmar Dependente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
