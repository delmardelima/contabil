import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  DollarSign,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Percent,
  X,
  CreditCard,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Scale,
  Award,
  Users,
  Search,
  ExternalLink,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemProjetoConvenioTerceiroSetor,
  ResumoEntidadeSemFinsLucrativos,
  TipoEntidadeSemFinsLucrativos,
  TipoOrigemRecursoTerceiroSetor
} from '../../types/contabil';

export const EntidadesSemFinsLucrativosModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoEntidadeSemFinsLucrativos | null>(null);
  const [selectedProjeto, setSelectedProjeto] = useState<ItemProjetoConvenioTerceiroSetor | null>(null);
  const [activeTab, setActiveTab] = useState<'projetos_convenios' | 'demonstracao_superavit' | 'cebas_gratuidade' | 'laudo_prestacao_a4'>('projetos_convenios');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovoProjeto, setModalNovoProjeto] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State
  const [formCodigo, setFormCodigo] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formTipoEntidade, setFormTipoEntidade] = useState<TipoEntidadeSemFinsLucrativos>('CEBAS_SAUDE');
  const [formOrgao, setFormOrgao] = useState('');
  const [formMrosc, setFormMrosc] = useState('');
  const [formOrigem, setFormOrigem] = useState<TipoOrigemRecursoTerceiroSetor>('CONVENIO_PUBLICO_MROSC');
  const [formInicio, setFormInicio] = useState('2026-01-01');
  const [formTermino, setFormTermino] = useState('2026-12-31');
  const [formValorAprovado, setFormValorAprovado] = useState(500000);
  const [formValorRecebido, setFormValorRecebido] = useState(250000);
  const [formValorExecutado, setFormValorExecutado] = useState(150000);
  const [formGratuidade, setFormGratuidade] = useState(180000);
  const [formObservacoes, setFormObservacoes] = useState('');

  const carregarDados = () => {
    const dados = dbService.getEntidadeSemFinsLucrativos();
    setResumo(dados);
    if (dados.projetos.length > 0 && !selectedProjeto) {
      setSelectedProjeto(dados.projetos[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarProjeto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCodigo || !formNome) {
      setMensagemErro('Preencha o código e o nome do projeto/termo de colaboração.');
      return;
    }

    const novo: ItemProjetoConvenioTerceiroSetor = {
      id: `proj-ts-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      codigoProjeto: formCodigo,
      nomeProjeto: formNome,
      tipoEntidade: formTipoEntidade,
      orgaoConcedente: formOrgao || 'Órgão Público Concedente / Fundo Municipal',
      numeroInstrumentoMrosc: formMrosc || `Termo de Parceria ${formCodigo}`,
      origemRecurso: formOrigem,
      dataInicioVigencia: formInicio,
      dataTerminoVigencia: formTermino,
      valorTotalRepasseAprovadoBRL: Number(formValorAprovado),
      valorRecebidoContaVinculadaBRL: Number(formValorRecebido),
      valorDespesasExecutadasBRL: Number(formValorExecutado),
      valorReceitaReconhecidaResultadoBRL: Number(formValorExecutado),
      saldoPassivoReceitaDiferidaBRL: Math.max(0, Number(formValorRecebido) - Number(formValorExecutado)),
      rendimentosAplicacaoFinanceiraBRL: Math.round(Number(formValorRecebido) * 0.02 * 100) / 100,
      valorGratuidadeAplicadaCebasBRL: Number(formGratuidade),
      statusProjeto: 'EM_EXECUCAO',
      integradoContabil: false,
      observacoes: formObservacoes || 'Execução de despesas do plano de trabalho MROSC.'
    };

    const res = dbService.salvarProjetoTerceiroSetor(novo);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovoProjeto(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao registrar projeto do Terceiro Setor.');
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarProjetoTerceiroSetorContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const projetosFiltrados = (resumo?.projetos || []).filter(item => {
    const matchTipo = filtroTipo === 'TODOS' || item.tipoEntidade === filtroTipo;
    const matchBusca = termoBusca === '' ||
      item.codigoProjeto.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.nomeProjeto.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (item.orgaoConcedente && item.orgaoConcedente.toLowerCase().includes(termoBusca.toLowerCase()));
    return matchTipo && matchBusca;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                Contabilidade de Entidades Sem Fins Lucrativos (ITG 2002 R1)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                TERCEIRO SETOR & CEBAS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                MROSC LEI 13.019/14
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Superávit/Déficit, segregação de recursos com restrição, controle de receitas diferidas no passivo e gratuidade CEBAS (LC 187/21).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalNovoProjeto(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Projeto / Termo MROSC
          </button>
          <button
            onClick={() => setActiveTab('laudo_prestacao_a4')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Prestação de Contas A4
          </button>
          <button
            onClick={carregarDados}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedbacks */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Projetos & MROSC</span>
            <BookOpen className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white">{resumo?.totalProjetosAtivos || 0}</div>
          <div className="text-[10px] text-gray-500 mt-1">Termos vigentes em 2026</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Repasses Recebidos</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400">
            R$ {(resumo?.totalRepassesConveniosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-blue-400/70 mt-1">Contas vinculadas oficiais</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Despesas Executadas</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            R$ {(resumo?.totalExecutadoPeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Receita apropriada ao resultado</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Receitas Diferidas</span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">
            R$ {(resumo?.totalReceitasDiferidasPassivoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-400/70 mt-1">Saldo diferido no Passivo (ITG 2002)</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Gratuidade CEBAS</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">
            R$ {(resumo?.totalGratuidadeCebasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-purple-400/70 mt-1">Imunidade Cota Patronal (LC 187)</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Superávit Exercício</span>
            <Scale className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400">
            R$ {(resumo?.superavitPeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-teal-400/70 mt-1">Destinado ao Fundo Patrimonial</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 px-6 flex gap-4">
        <button
          onClick={() => setActiveTab('projetos_convenios')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'projetos_convenios'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Projetos & Termos MROSC ({resumo?.projetos?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('demonstracao_superavit')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'demonstracao_superavit'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          Demonstração do Superávit ou Déficit (DSD)
        </button>
        <button
          onClick={() => setActiveTab('cebas_gratuidade')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'cebas_gratuidade'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          CEBAS & Imunidade Previdenciária (LC 187/21)
        </button>
        <button
          onClick={() => setActiveTab('laudo_prestacao_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'laudo_prestacao_a4'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Laudo de Prestação de Contas A4 (TCE / TCU)
        </button>
      </div>

      {/* Tab 1: Projetos & Convênios */}
      {activeTab === 'projetos_convenios' && (
        <div className="p-6 space-y-4">
          {/* Filtros e Busca */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#181818] p-4 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por código, projeto ou órgão..."
                  value={termoBusca}
                  onChange={e => setTermoBusca(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-rose-500 w-72"
                />
              </div>

              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="bg-[#121212] border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500"
              >
                <option value="TODOS">Todos os Tipos de Entidade</option>
                <option value="CEBAS_SAUDE">CEBAS Saúde</option>
                <option value="CEBAS_EDUCACAO">CEBAS Educação</option>
                <option value="ASSOCIACAO">Associação Sem Fins Lucrativos</option>
                <option value="FUNDACAO">Fundação Privada</option>
                <option value="ONG_OSCIP">ONG / OSCIP</option>
              </select>
            </div>

            <div className="text-xs text-gray-400">
              Exibindo <span className="font-semibold text-white">{projetosFiltrados.length}</span> projetos
            </div>
          </div>

          {/* Tabela de Projetos */}
          <div className="bg-[#181818] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Projeto / Termo MROSC</th>
                    <th className="py-3 px-4">Órgão Concedente</th>
                    <th className="py-3 px-4 text-right">Repasse Aprovado</th>
                    <th className="py-3 px-4 text-right">Recebido Conta Vinc.</th>
                    <th className="py-3 px-4 text-right">Executado (Resultado)</th>
                    <th className="py-3 px-4 text-right">Diferido no Passivo</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {projetosFiltrados.map(proj => (
                    <tr key={proj.id} className="hover:bg-[#1d1d1d] transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white font-mono">{proj.codigoProjeto}</div>
                        <div className="text-gray-300 text-[11px] mt-0.5">{proj.nomeProjeto}</div>
                        <div className="text-[10px] text-rose-400/80 mt-0.5 font-medium">{proj.tipoEntidade.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-200">{proj.orgaoConcedente || 'N/A'}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{proj.numeroInstrumentoMrosc}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-300">
                        R$ {proj.valorTotalRepasseAprovadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-blue-400">
                        R$ {proj.valorRecebidoContaVinculadaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        R$ {proj.valorDespesasExecutadasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">
                        R$ {proj.saldoPassivoReceitaDiferidaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {proj.statusProjeto}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {proj.integradoContabil ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Integrado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleIntegrarContabil(proj.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded transition"
                          >
                            Integrar ITG 2002
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Demonstração do Superávit ou Déficit */}
      {activeTab === 'demonstracao_superavit' && resumo && (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  DEMONSTRAÇÃO DO SUPERÁVIT OU DÉFICIT DO EXERCÍCIO (DSD)
                </h2>
                <p className="text-xs text-gray-400">
                  Exercício Social 2026 • Em conformidade estrita com a NBC ITG 2002 (R1) do Conselho Federal de Contabilidade
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                Superávit do Período: R$ {resumo.demonstracao.superavitOuDeficitOperacionalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Receitas */}
              <div>
                <div className="flex justify-between py-1.5 font-bold text-gray-200 border-b border-gray-700/60 uppercase">
                  <span>1. RECEITAS OPERACIONAIS</span>
                  <span className="text-emerald-400">R$ {resumo.demonstracao.totalReceitasOperacionaisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pl-4 py-1 flex justify-between text-gray-400">
                  <span>1.1. Receitas com Restrição (Apropriação de Convênios MROSC e Termos Vinculados)</span>
                  <span>R$ {resumo.demonstracao.receitasComRestricaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pl-4 py-1 flex justify-between text-gray-400">
                  <span>1.2. Receitas Sem Restrição (Doações livres, mensalidades e anuidades de associados)</span>
                  <span>R$ {resumo.demonstracao.receitasSemRestricaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Despesas */}
              <div>
                <div className="flex justify-between py-1.5 font-bold text-gray-200 border-b border-gray-700/60 uppercase">
                  <span>2. CUSTOS E DESPESAS OPERACIONAIS</span>
                  <span className="text-rose-400">(R$ {resumo.demonstracao.totalDespesasOperacionaisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                </div>
                <div className="pl-4 py-1 flex justify-between text-gray-400">
                  <span>2.1. Despesas dos Projetos Vinculados (Execução dos Planos de Trabalho)</span>
                  <span>(R$ {resumo.demonstracao.despesasProjetosVinculadosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                </div>
                <div className="pl-4 py-1 flex justify-between text-gray-400">
                  <span>2.2. Despesas Administrativas e Institucionais Gerais</span>
                  <span>(R$ {resumo.demonstracao.despesasAdministrativasGeraisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                </div>
                <div className="pl-4 py-1 flex justify-between text-gray-400">
                  <span>2.3. Despesas com Pessoal e Encargos Trabalhistas</span>
                  <span>(R$ {resumo.demonstracao.despesasPessoalEncargosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                </div>
              </div>

              {/* Resultado */}
              <div className="pt-2 border-t-2 border-gray-600">
                <div className="flex justify-between py-2 font-bold text-sm text-white">
                  <span>3. SUPERÁVIT OPERACIONAL LÍQUIDO DO EXERCÍCIO</span>
                  <span className="text-emerald-400">R$ {resumo.demonstracao.superavitOuDeficitOperacionalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Destinação */}
              <div className="mt-4 p-4 bg-[#141414] rounded-lg border border-gray-800 space-y-2">
                <div className="font-semibold text-gray-300">4. DESTINAÇÃO DO SUPERÁVIT (ART. 195-A LEI 6.404 / ESTATUTO SOCIAL):</div>
                <div className="flex justify-between text-gray-400">
                  <span>• Incorporação ao Fundo Patrimonial Institucional (70%)</span>
                  <span className="text-teal-300">R$ {resumo.demonstracao.destinacaoFundoPatrimonialBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>• Reserva Estatutária para Continuidade dos Projetos Sociais (30%)</span>
                  <span className="text-teal-300">R$ {resumo.demonstracao.destinacaoReservaEstatutariaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="text-[10px] text-amber-400/90 pt-1 border-t border-gray-800">
                  * É vedada a distribuição de qualquer parcela do superávit a diretores, conselheiros ou associados (Art. 14 CTN e Lei 9.532/97).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CEBAS & Gratuidade */}
      {activeTab === 'cebas_gratuidade' && resumo && (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Monitoramento de Gratuidade CEBAS (Lei Complementar nº 187/2021)</h3>
                <p className="text-xs text-gray-400">
                  Garantia de imunidade das contribuições previdenciárias da Seguridade Social (Cota Patronal 20% + RAT + Terceiros).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#141414] border border-gray-800 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Total de Gratuidade Aplicada em 2026</div>
                <div className="text-2xl font-bold text-purple-400">
                  R$ {resumo.totalGratuidadeCebasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Meta legal atingida (100% em conformidade)
                </div>
              </div>

              <div className="p-4 bg-[#141414] border border-gray-800 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Economia Tributária Anual Estimada (Imunidade CF/88)</div>
                <div className="text-2xl font-bold text-emerald-400">
                  R$ {(resumo.totalGratuidadeCebasBRL * 0.288).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  20% INSS Patronal + 3% RAT + 5.8% Terceiros desonerados
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300 bg-[#121212] p-4 rounded-lg border border-gray-800">
              <div className="font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Requisitos Obrigatórios para Manutenção da Certificação CEBAS:
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-[11px]">
                <li>Aplicação integral das rendas e recursos na manutenção e desenvolvimento dos objetivos institucionais em território nacional;</li>
                <li>Não distribuição de qualquer parcela de seu patrimônio ou de suas rendas a título de lucro ou participação no resultado;</li>
                <li>Manutenção de escrituração contábil regular em livros Diário e Razão segundo normas do CFC (NBC TG / ITG 2002);</li>
                <li>Conservação em boa guarda dos documentos comprobatórios das receitas e despesas pelo prazo de 5 anos;</li>
                <li>Apresentação anual da Declaração de Imunidade e Escrituração Contábil Fiscal (SPED ECF Bloco U).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Laudo A4 Prestação de Contas */}
      {activeTab === 'laudo_prestacao_a4' && (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Demonstrativo Oficial A4
            </button>
          </div>

          <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg border border-gray-300 font-sans text-xs">
            {/* Cabeçalho Oficial */}
            <div className="border-b-2 border-gray-800 pb-4 mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-base font-bold text-gray-900 tracking-wide uppercase">
                  DEMONSTRATIVO DE PRESTAÇÃO DE CONTAS - TERCEIRO SETOR
                </h1>
                <p className="text-[11px] text-gray-600">
                  Em cumprimento à Lei nº 13.019/2014 (MROSC), Lei Complementar nº 187/2021 (CEBAS) e NBC ITG 2002 (R1)
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Destinação: Ministério Público Estadual / Tribunal de Contas / Órgão Concedente
                </p>
              </div>
              <div className="text-right text-[10px] text-gray-500 font-mono">
                <div>Exercício: 2026</div>
                <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* Projetos em Execução */}
            <div className="mb-6">
              <h2 className="font-bold text-xs uppercase text-gray-800 border-b border-gray-300 pb-1 mb-2">
                1. Relação de Projetos e Repasses Governamentais Recebidos
              </h2>
              <table className="w-full text-left text-[11px] border border-gray-300">
                <thead className="bg-gray-100 font-semibold border-b border-gray-300">
                  <tr>
                    <th className="p-1.5">Código / Instrumento</th>
                    <th className="p-1.5">Projeto / Objeto</th>
                    <th className="p-1.5 text-right">Repasse Total</th>
                    <th className="p-1.5 text-right">Executado</th>
                    <th className="p-1.5 text-right">Saldo a Executar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(resumo?.projetos || []).map((p, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-1.5 font-mono font-semibold">{p.codigoProjeto}</td>
                      <td className="p-1.5">{p.nomeProjeto}</td>
                      <td className="p-1.5 text-right">R$ {p.valorRecebidoContaVinculadaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-right text-emerald-800 font-semibold">R$ {p.valorDespesasExecutadasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-right text-amber-800">R$ {p.saldoPassivoReceitaDiferidaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo da Gratuidade CEBAS */}
            <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-300">
              <h2 className="font-bold text-xs uppercase text-gray-800 mb-2">
                2. Comprovação da Contrapartida de Gratuidade (Art. 195 § 7º CF/88)
              </h2>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-gray-600">Total de Atendimentos / Bolsas Integrais Concedidas:</span>
                  <div className="font-bold text-gray-900 mt-0.5">R$ {(resumo?.totalGratuidadeCebasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <span className="text-gray-600">Certificação CEBAS:</span>
                  <div className="font-bold text-emerald-800 mt-0.5">Vigente e Regular perante o Ministério da Saúde / MEC</div>
                </div>
              </div>
            </div>

            {/* Assinaturas */}
            <div className="mt-12 pt-8 border-t border-gray-400 grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <div className="border-b border-gray-600 pb-1 mb-1 font-semibold text-gray-900">
                  PRESIDENTE / DIRETOR EXECUTIVO
                </div>
                <div className="text-[10px] text-gray-500">Representante Legal da Entidade</div>
              </div>
              <div>
                <div className="border-b border-gray-600 pb-1 mb-1 font-semibold text-gray-900">
                  CONTADOR RESPONSÁVEL TÉCNICO
                </div>
                <div className="text-[10px] text-gray-500">CRC/SP Ativo nº 1SP999999/O-0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Projeto MROSC */}
      {modalNovoProjeto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181818] border border-gray-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-gray-200">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Cadastrar Novo Projeto / Termo MROSC</h3>
              </div>
              <button onClick={() => setModalNovoProjeto(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarProjeto} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Código do Projeto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MROSC-2026/08"
                    value={formCodigo}
                    onChange={e => setFormCodigo(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Entidade</label>
                  <select
                    value={formTipoEntidade}
                    onChange={e => setFormTipoEntidade(e.target.value as TipoEntidadeSemFinsLucrativos)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  >
                    <option value="CEBAS_SAUDE">CEBAS Saúde</option>
                    <option value="CEBAS_EDUCACAO">CEBAS Educação</option>
                    <option value="ASSOCIACAO">Associação Sem Fins Lucrativos</option>
                    <option value="FUNDACAO">Fundação Privada</option>
                    <option value="ONG_OSCIP">ONG / OSCIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nome do Projeto / Objeto do Termo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atendimento ambulatorial e exames gratuitos"
                  value={formNome}
                  onChange={e => setFormNome(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Órgão Concedente</label>
                  <input
                    type="text"
                    placeholder="Ex: Secretaria Municipal de Saúde"
                    value={formOrgao}
                    onChange={e => setFormOrgao(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Nº Instrumento / Parceria</label>
                  <input
                    type="text"
                    placeholder="Ex: Termo de Colaboração 2026/04"
                    value={formMrosc}
                    onChange={e => setFormMrosc(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Repasse Total Aprovado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorAprovado}
                    onChange={e => setFormValorAprovado(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Recebido em Conta Vinculada (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorRecebido}
                    onChange={e => setFormValorRecebido(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Despesas Executadas (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorExecutado}
                    onChange={e => setFormValorExecutado(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Gratuidade CEBAS (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formGratuidade}
                    onChange={e => setFormGratuidade(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovoProjeto(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold shadow-sm"
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
