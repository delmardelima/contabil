import React, { useState, useEffect } from 'react';
import {
  Building2,
  DollarSign,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Send,
  Database,
  Search,
  ExternalLink,
  Percent,
  X,
  CreditCard,
  FileCheck,
  TrendingUp,
  PieChart,
  Users,
  ShieldCheck,
  ChevronRight,
  HardHat
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  EmpreendimentoImobiliarioRet,
  ApuracaoMensalRetImobiliario,
  ResumoEmpreendimentosImobiliarios,
  TipoEmpreendimentoImobiliario,
  NaturezaAfetacaoRet
} from '../../types/contabil';

export const RetImobiliarioScpModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoEmpreendimentosImobiliarios | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<EmpreendimentoImobiliarioRet | null>(null);
  const [selectedApur, setSelectedApur] = useState<ApuracaoMensalRetImobiliario | null>(null);
  const [activeTab, setActiveTab] = useState<'empreendimentos' | 'apuracoes' | 'poc_custos' | 'scp'>('empreendimentos');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  
  // Modals
  const [modalNovoEmp, setModalNovoEmp] = useState(false);
  const [modalNovaApur, setModalNovaApur] = useState(false);
  const [modalDarf, setModalDarf] = useState(false);
  const [modalLaudoA4, setModalLaudoA4] = useState(false);
  
  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State: Empreendimento
  const [formEmp, setFormEmp] = useState<Partial<EmpreendimentoImobiliarioRet>>({
    codigoEmpreendimento: '',
    nomeEmpreendimento: '',
    tipo: 'INCORPORACAO_IMOBILIARIA_RET',
    natureza: 'PROPRIO',
    cnpjAfetacaoOuScp: '',
    matriculaRgi: '',
    cartorioRegistroImoveis: '',
    aliquotaRetUnificadaPercentual: 4.0,
    enquadramentoMcmv: false,
    dataInicioObras: '2025-01-01',
    previsaoConclusao: '2027-12-31',
    totalUnidadesPrevistas: 80,
    unidadesVendidas: 0,
    percentualConclusaoPoc: 0,
    custoTotalOrcadoBRL: 15000000,
    custoIncorridoAcumuladoBRL: 0,
    receitaTotalContratadaBRL: 25000000,
    receitaRecebidaAcumuladaBRL: 0,
    statusObra: 'EM_CONSTRUCAO',
    observacoes: ''
  });

  // Form State: Apuração Mensal
  const [formApur, setFormApur] = useState({
    competencia: '2026-03',
    receitaVendasRecebidasMesBRL: 500000
  });

  const carregarDados = () => {
    try {
      const data = dbService.getEmpreendimentosImobiliarios();
      setResumo(data);
      if (data.empreendimentos.length > 0) {
        if (!selectedEmp || !data.empreendimentos.some(e => e.id === selectedEmp.id)) {
          setSelectedEmp(data.empreendimentos[0]);
        } else {
          const atual = data.empreendimentos.find(e => e.id === selectedEmp.id);
          if (atual) setSelectedEmp(atual);
        }
      }
      if (data.apuracoesMensais.length > 0) {
        if (!selectedApur || !data.apuracoesMensais.some(a => a.id === selectedApur.id)) {
          setSelectedApur(data.apuracoesMensais[0]);
        } else {
          const apurAtual = data.apuracoesMensais.find(a => a.id === selectedApur.id);
          if (apurAtual) setSelectedApur(apurAtual);
        }
      }
    } catch (e: any) {
      setMensagemErro('Erro ao carregar dados do RET Imobiliário: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleIntegrarContabil = (apuracaoId: string) => {
    const res = dbService.integrarRetImobiliarioContabil(apuracaoId);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleSalvarNovoEmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmp.nomeEmpreendimento || !formEmp.codigoEmpreendimento) {
      setMensagemErro('Preencha os campos obrigatórios do empreendimento.');
      return;
    }
    const novo: EmpreendimentoImobiliarioRet = {
      id: 'ret-emp-' + Date.now(),
      empresaId: 1,
      codigoEmpreendimento: formEmp.codigoEmpreendimento || 'EMP-NOVO',
      nomeEmpreendimento: formEmp.nomeEmpreendimento || 'Novo Empreendimento',
      tipo: formEmp.tipo as TipoEmpreendimentoImobiliario || 'INCORPORACAO_IMOBILIARIA_RET',
      natureza: formEmp.natureza as NaturezaAfetacaoRet || 'PROPRIO',
      cnpjAfetacaoOuScp: formEmp.cnpjAfetacaoOuScp || '00.000.000/0001-00',
      matriculaRgi: formEmp.matriculaRgi || 'R-0/000.000',
      cartorioRegistroImoveis: formEmp.cartorioRegistroImoveis || '1º Ofício de Registro de Imóveis',
      aliquotaRetUnificadaPercentual: formEmp.enquadramentoMcmv ? 1.0 : (formEmp.aliquotaRetUnificadaPercentual || 4.0),
      enquadramentoMcmv: !!formEmp.enquadramentoMcmv,
      dataInicioObras: formEmp.dataInicioObras || '2025-01-01',
      previsaoConclusao: formEmp.previsaoConclusao || '2027-12-31',
      totalUnidadesPrevistas: Number(formEmp.totalUnidadesPrevistas) || 50,
      unidadesVendidas: Number(formEmp.unidadesVendidas) || 0,
      percentualConclusaoPoc: Number(formEmp.percentualConclusaoPoc) || 0,
      custoTotalOrcadoBRL: Number(formEmp.custoTotalOrcadoBRL) || 10000000,
      custoIncorridoAcumuladoBRL: Number(formEmp.custoIncorridoAcumuladoBRL) || 0,
      receitaTotalContratadaBRL: Number(formEmp.receitaTotalContratadaBRL) || 20000000,
      receitaRecebidaAcumuladaBRL: Number(formEmp.receitaRecebidaAcumuladaBRL) || 0,
      statusObra: formEmp.statusObra || 'EM_CONSTRUCAO',
      observacoes: formEmp.observacoes || 'Cadastrado no ERP Contábil'
    };

    const res = dbService.salvarEmpreendimentoImobiliario(novo);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovoEmp(false);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleSalvarNovaApur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const base = Number(formApur.receitaVendasRecebidasMesBRL);
    const aliq = selectedEmp.aliquotaRetUnificadaPercentual;
    const isMcmv = selectedEmp.enquadramentoMcmv;

    // Decomposição oficial Lei 10.931/04
    // 4%: IRPJ 1.26%, CSLL 0.66%, PIS 0.37%, COFINS 1.71%
    // 1%: IRPJ 0.31%, CSLL 0.16%, PIS 0.09%, COFINS 0.44%
    const irpj = isMcmv ? (base * 0.0031) : (base * 0.0126);
    const csll = isMcmv ? (base * 0.0016) : (base * 0.0066);
    const pis = isMcmv ? (base * 0.0009) : (base * 0.0037);
    const cofins = isMcmv ? (base * 0.0044) : (base * 0.0171);
    const totalRet = irpj + csll + pis + cofins;

    const novaApur: ApuracaoMensalRetImobiliario = {
      id: `ret-apur-${selectedEmp.id}-${formApur.competencia}`,
      empreendimentoId: selectedEmp.id,
      empresaId: selectedEmp.empresaId,
      competencia: formApur.competencia,
      nomeEmpreendimento: selectedEmp.nomeEmpreendimento,
      cnpjAfetacaoOuScp: selectedEmp.cnpjAfetacaoOuScp || '44.821.905/0002-88',
      receitaVendasRecebidasMesBRL: base,
      aliquotaRetPercentual: aliq,
      valorIrpjRetBRL: Math.round(irpj * 100) / 100,
      valorCsllRetBRL: Math.round(csll * 100) / 100,
      valorPisRetBRL: Math.round(pis * 100) / 100,
      valorCofinsRetBRL: Math.round(cofins * 100) / 100,
      valorTotalRetRecolherBRL: Math.round(totalRet * 100) / 100,
      codigoReceitaDarf: '4095',
      dataVencimentoDarf: `${formApur.competencia}-20`,
      codigoBarrasDarfFebraban: `858900000000 ${Math.round(totalRet).toString().padStart(11, '0')} 409500000000 000000000000`,
      statusApuracao: 'CALCULADO',
      integradoContabil: false,
      observacoes: `Apuração RET ${aliq}% sobre ingressos auferidos no mês.`
    };

    const res = dbService.salvarApuracaoRetImobiliario(novaApur);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovaApur(false);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const empreendimentosFiltrados = (resumo?.empreendimentos || []).filter(e => {
    if (filtroStatus === 'TODOS') return true;
    return e.statusObra === filtroStatus;
  });

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f12] text-gray-100 overflow-hidden font-sans">
      {/* Top Header / Breadcrumb */}
      <div className="h-14 border-b border-gray-800 bg-[#14161b] px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              RET Imobiliário & SCP
              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-full font-mono">
                Lei 10.931/2004 • IN RFB 2.179/2024
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Patrimônio de Afetação RGI • Apuração Unificada 4% (DARF 4095) • CPC 47 (POC %) • Sociedade em Conta de Participação
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalLaudoA4(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded border border-gray-700 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-gray-400" />
            <span>Laudo Oficial A4</span>
          </button>
          <button
            onClick={() => setModalNovoEmp(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Empreendimento</span>
          </button>
          <button
            onClick={carregarDados}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition"
            title="Atualizar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {mensagemSucesso && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-6 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="bg-rose-950/80 border-b border-rose-800/60 px-6 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-[#0e1015] border-b border-gray-800/80">
        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Empreendimentos Registrados</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {resumo?.totalEmpreendimentos || 0}
            </span>
            <span className="text-xs text-amber-400">Afetações / SCP</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Separados e auditados por RGI</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Receita Recebida (Base RET)</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-400 font-mono">
              {formatBRL(resumo?.totalReceitasRecebidasMesBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Ingressos financeiros mensais em caixa</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">RET 4% Unificado (DARF 4095)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {formatBRL(resumo?.totalRetRecolherBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">IRPJ + CSLL + PIS + COFINS consolidado</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Segurança Jurídica & POC</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400">100%</span>
            <span className="text-xs text-gray-400">Blindagem RGI</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Contas correntes vinculadas exclusivas</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 pt-3 bg-[#111318] border-b border-gray-800 flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('empreendimentos')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'empreendimentos'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empreendimentos & Afetações RGI</span>
          </button>

          <button
            onClick={() => setActiveTab('apuracoes')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'apuracoes'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Apuração Mensal RET & DARF 4095</span>
          </button>

          <button
            onClick={() => setActiveTab('poc_custos')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'poc_custos'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Gestão de Custos & POC % (CPC 47)</span>
          </button>

          <button
            onClick={() => setActiveTab('scp')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'scp'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sociedades em Conta de Participação (SCP)</span>
          </button>
        </div>

        {activeTab === 'empreendimentos' && (
          <div className="flex items-center space-x-2 pb-2">
            <span className="text-xs text-gray-400">Filtro de Status:</span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-gray-800 text-gray-200 text-xs px-2.5 py-1 rounded border border-gray-700 outline-none"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PLANEJAMENTO">Planejamento</option>
              <option value="EM_CONSTRUCAO">Em Construção</option>
              <option value="CONCLUIDO_HABITE_SE">Concluído / Habite-se</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: EMPREENDIMENTOS & AFETAÇÕES RGI */}
        {activeTab === 'empreendimentos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {empreendimentosFiltrados.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmp(emp)}
                  className={`bg-[#14161f] border rounded-xl p-5 cursor-pointer transition-all relative overflow-hidden shadow-sm flex flex-col justify-between ${
                    selectedEmp?.id === emp.id
                      ? 'border-amber-500/80 ring-1 ring-amber-500/50 bg-[#161a26]'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                        {emp.codigoEmpreendimento}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          emp.statusObra === 'EM_CONSTRUCAO'
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                            : emp.statusObra === 'CONCLUIDO_HABITE_SE'
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                            : 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                        }`}
                      >
                        {emp.statusObra === 'EM_CONSTRUCAO' ? 'Em Construção' : emp.statusObra === 'CONCLUIDO_HABITE_SE' ? 'Concluído' : 'Planejamento'}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white mt-2 leading-tight">
                      {emp.nomeEmpreendimento}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      CNPJ Afetação: <span className="font-mono text-gray-300">{emp.cnpjAfetacaoOuScp || 'Não informado'}</span>
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-800/80 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Cartório / RGI:</span>
                        <span className="text-gray-200 font-mono">{emp.matriculaRgi}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Alíquota RET:</span>
                        <span className="text-amber-400 font-bold font-mono">
                          {emp.aliquotaRetUnificadaPercentual.toFixed(2)}% {emp.enquadramentoMcmv ? '(MCMV)' : '(Padrão)'}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Unidades:</span>
                        <span className="text-gray-200">
                          {emp.unidadesVendidas} / {emp.totalUnidadesPrevistas} ({((emp.unidadesVendidas / (emp.totalUnidadesPrevistas || 1)) * 100).toFixed(0)}% vendidas)
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso POC */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-gray-400">Evolução POC (Custo Incorrido):</span>
                        <span className="text-amber-400 font-bold">{emp.percentualConclusaoPoc.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(emp.percentualConclusaoPoc, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Custo Total: {formatBRL(emp.custoTotalOrcadoBRL)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmp(emp);
                        setActiveTab('apuracoes');
                      }}
                      className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                    >
                      <span>Apurar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Empreendimento Detail Box */}
            {selectedEmp && (
              <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      Ficha Cadastral e Financeira: {selectedEmp.nomeEmpreendimento}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Registro Cartorial no {selectedEmp.cartorioRegistroImoveis} • Termo de Afetação Averbação {selectedEmp.matriculaRgi}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalNovaApur(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Apuração Mensal</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                    <span className="text-gray-400">Custo Total Orçado:</span>
                    <p className="text-sm font-bold font-mono text-gray-100 mt-1">{formatBRL(selectedEmp.custoTotalOrcadoBRL)}</p>
                    <span className="text-[10px] text-gray-500">Base orçamentária OCPC 01</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                    <span className="text-gray-400">Custo Incorrido Acumulado:</span>
                    <p className="text-sm font-bold font-mono text-amber-400 mt-1">{formatBRL(selectedEmp.custoIncorridoAcumuladoBRL)}</p>
                    <span className="text-[10px] text-amber-500/80">{selectedEmp.percentualConclusaoPoc}% do orçamento</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                    <span className="text-gray-400">Receita Total Contratada:</span>
                    <p className="text-sm font-bold font-mono text-blue-400 mt-1">{formatBRL(selectedEmp.receitaTotalContratadaBRL)}</p>
                    <span className="text-[10px] text-gray-500">Contratos de Promessa de Compra</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
                    <span className="text-gray-400">Receita Recebida Acumulada:</span>
                    <p className="text-sm font-bold font-mono text-emerald-400 mt-1">{formatBRL(selectedEmp.receitaRecebidaAcumuladaBRL)}</p>
                    <span className="text-[10px] text-emerald-500/80">Base faturada e tributada RET</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg text-xs text-amber-200/90 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">Patrimônio de Afetação Blindado (Art. 31-A da Lei 4.591/64):</span>
                    <p className="mt-0.5 text-gray-300 leading-relaxed">
                      O terreno e as acessões objeto de incorporação imobiliária mantêm-se apartados do patrimônio geral da incorporadora, respondendo unicamente pelas dívidas e obrigações vinculadas ao próprio empreendimento.
                      Conta corrente aberta exclusivamente sob o CNPJ próprio da afetação ({selectedEmp.cnpjAfetacaoOuScp}).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APURAÇÃO MENSAL RET & DARF 4095 */}
        {activeTab === 'apuracoes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Demonstrativo Mensal de Apurações do RET 4% (DARF 4095)
                </h2>
                <p className="text-xs text-gray-400">
                  Cálculo dos tributos unificados sob o regime de caixa dos ingressos de vendas de unidades
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalNovaApur(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Apuração de Competência</span>
                </button>
              </div>
            </div>

            <div className="bg-[#14161f] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181b24] text-gray-400 border-b border-gray-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Competência</th>
                    <th className="py-3 px-4">Empreendimento</th>
                    <th className="py-3 px-4">CNPJ Afetação</th>
                    <th className="py-3 px-4 text-right">Receita Recebida</th>
                    <th className="py-3 px-4 text-center">Alíquota</th>
                    <th className="py-3 px-4 text-right">IRPJ (1,26%)</th>
                    <th className="py-3 px-4 text-right">CSLL (0,66%)</th>
                    <th className="py-3 px-4 text-right">PIS (0,37%)</th>
                    <th className="py-3 px-4 text-right">COFINS (1,71%)</th>
                    <th className="py-3 px-4 text-right text-emerald-400">Total DARF 4095</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {(resumo?.apuracoesMensais || []).map((ap) => (
                    <tr
                      key={ap.id}
                      className="hover:bg-gray-800/40 transition cursor-pointer"
                      onClick={() => setSelectedApur(ap)}
                    >
                      <td className="py-3 px-4 font-bold text-amber-400">{ap.competencia}</td>
                      <td className="py-3 px-4 font-sans text-gray-200">{ap.nomeEmpreendimento}</td>
                      <td className="py-3 px-4 text-gray-400">{ap.cnpjAfetacaoOuScp}</td>
                      <td className="py-3 px-4 text-right text-gray-100 font-bold">
                        {formatBRL(ap.receitaVendasRecebidasMesBRL)}
                      </td>
                      <td className="py-3 px-4 text-center text-amber-400 font-bold">
                        {ap.aliquotaRetPercentual.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">{formatBRL(ap.valorIrpjRetBRL)}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{formatBRL(ap.valorCsllRetBRL)}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{formatBRL(ap.valorPisRetBRL)}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{formatBRL(ap.valorCofinsRetBRL)}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                        {formatBRL(ap.valorTotalRetRecolherBRL)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                            ap.integradoContabil
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {ap.integradoContabil ? 'Integrado' : 'Aguardando'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApur(ap);
                              setModalDarf(true);
                            }}
                            className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition"
                            title="Emitir Guia DARF 4095"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          {!ap.integradoContabil && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIntegrarContabil(ap.id);
                              }}
                              className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] rounded transition flex items-center gap-1 font-sans"
                              title="Integrar Provisão Contábil no Diário"
                            >
                              <Database className="w-3 h-3" />
                              <span>Integrar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Decomposição e Fundamentação Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#14161f] border border-gray-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
                  <Percent className="w-4 h-4 text-amber-400" />
                  Decomposição Tributária Unificada - Alíquota 4,00%
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center p-2 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-300">IRPJ (Imposto de Renda Pessoa Jurídica):</span>
                    <div className="text-right font-mono">
                      <span className="text-amber-400 font-bold">1,26%</span>
                      <span className="text-gray-500 text-[10px] block">31,5% da carga total</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-300">CSLL (Contribuição Social sobre o Lucro Líquido):</span>
                    <div className="text-right font-mono">
                      <span className="text-amber-400 font-bold">0,66%</span>
                      <span className="text-gray-500 text-[10px] block">16,5% da carga total</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-300">PIS/PASEP (Contribuição para o PIS):</span>
                    <div className="text-right font-mono">
                      <span className="text-amber-400 font-bold">0,37%</span>
                      <span className="text-gray-500 text-[10px] block">9,25% da carga total</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-300">COFINS (Contribuição para a Seguridade Social):</span>
                    <div className="text-right font-mono">
                      <span className="text-amber-400 font-bold">1,71%</span>
                      <span className="text-gray-500 text-[10px] block">42,75% da carga total</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber-950/40 rounded border border-amber-800/50">
                    <span className="font-bold text-amber-200">Alíquota Unificada Total:</span>
                    <span className="font-mono text-amber-400 font-bold text-sm">4,00%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#14161f] border border-gray-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  Regras Oficiais de Vencimento e Recolhimento
                </h3>
                <ul className="space-y-2 text-xs text-gray-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      <strong className="text-white">Código de Receita:</strong> O pagamento deve ser efetuado impreterivelmente através de DARF com código <code className="bg-gray-800 px-1 py-0.5 rounded text-amber-400">4095</code>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      <strong className="text-white">Vencimento Legal:</strong> Até o 20º (vigésimo) dia do mês subsequente àquele em que houverem sido auferidas as receitas (antecipa se não houver expediente bancário).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      <strong className="text-white">Titularidade do DARF:</strong> Emitido sob o CNPJ específico do Patrimônio de Afetação arquivado no RGI, e não sob o CNPJ da matriz/incorporadora geral.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      <strong className="text-white">Vedação de Compensação Cruzada:</strong> Não é admitida a compensação de débitos do RET com créditos tributários gerais de PIS/COFINS da pessoa jurídica (IN RFB 2.179/2024).
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GESTÃO DE CUSTOS & POC % (CPC 47 / OCPC 01) */}
        {activeTab === 'poc_custos' && (
          <div className="space-y-6">
            <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-4 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-purple-400" />
                    Método de Porcentagem de Conclusão - POC (CPC 47 / OCPC 01)
                  </h2>
                  <p className="text-xs text-gray-400">
                    Apropriação contábil do resultado imobiliário com base na evolução física e financeira da construção
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Fórmula Técnica POC:</span>
                  <p className="text-xs font-mono text-purple-300 font-semibold">
                    POC % = (Custo Incorrido / Custo Orçado Total) × 100
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {(resumo?.empreendimentos || []).map((emp) => {
                  const custoRestante = emp.custoTotalOrcadoBRL - emp.custoIncorridoAcumuladoBRL;
                  const receitaReconhecidaContabil = (emp.receitaTotalContratadaBRL * emp.percentualConclusaoPoc) / 100;
                  const receitaDiferidaApropriar = emp.receitaTotalContratadaBRL - receitaReconhecidaContabil;

                  return (
                    <div key={emp.id} className="p-4 bg-gray-900/60 border border-gray-800 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-400 bg-gray-800 px-2 py-0.5 rounded">
                            {emp.codigoEmpreendimento}
                          </span>
                          <span className="ml-2 text-sm font-bold text-white">{emp.nomeEmpreendimento}</span>
                        </div>
                        <span className="text-xs font-mono text-purple-400 font-bold bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded">
                          POC: {emp.percentualConclusaoPoc.toFixed(2)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-xs font-mono">
                        <div className="p-2.5 bg-[#14161f] rounded border border-gray-800">
                          <span className="text-gray-400 font-sans block text-[11px]">Custo Orçado Total</span>
                          <span className="text-gray-200 font-bold">{formatBRL(emp.custoTotalOrcadoBRL)}</span>
                        </div>
                        <div className="p-2.5 bg-[#14161f] rounded border border-gray-800">
                          <span className="text-gray-400 font-sans block text-[11px]">Custo Incorrido Real</span>
                          <span className="text-amber-400 font-bold">{formatBRL(emp.custoIncorridoAcumuladoBRL)}</span>
                        </div>
                        <div className="p-2.5 bg-[#14161f] rounded border border-gray-800">
                          <span className="text-gray-400 font-sans block text-[11px]">Custo a Incorrer (Saldo)</span>
                          <span className="text-rose-400 font-bold">{formatBRL(custoRestante)}</span>
                        </div>
                        <div className="p-2.5 bg-[#14161f] rounded border border-gray-800">
                          <span className="text-gray-400 font-sans block text-[11px]">Receita Reconhecida CPC 47</span>
                          <span className="text-emerald-400 font-bold">{formatBRL(receitaReconhecidaContabil)}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-400">Evolução Física/Financeira das Obras:</span>
                          <span className="text-amber-400 font-mono font-bold">{emp.percentualConclusaoPoc}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 via-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(emp.percentualConclusaoPoc, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-gray-400 pt-2 border-t border-gray-800">
                        <span>Receita Contratada Total: <strong className="text-gray-200 font-mono">{formatBRL(emp.receitaTotalContratadaBRL)}</strong></span>
                        <span>Receita a Reconhecer Futura: <strong className="text-amber-300 font-mono">{formatBRL(receitaDiferidaApropriar)}</strong></span>
                        <span>Base de Caixa RET Recebida: <strong className="text-blue-300 font-mono">{formatBRL(emp.receitaRecebidaAcumuladaBRL)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIEDADE EM CONTA DE PARTICIPAÇÃO (SCP) */}
        {activeTab === 'scp' && (
          <div className="space-y-6">
            <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-4 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    Sociedades em Conta de Participação (SCP) Imobiliárias
                  </h2>
                  <p className="text-xs text-gray-400">
                    Art. 991 a 996 do Código Civil / IN RFB nº 2.119/2022 (CNPJ próprio e escrituração individualizada)
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 text-xs rounded-full font-mono">
                  Sócio Ostensivo + Participantes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-900/60 rounded-lg border border-gray-800 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Responsabilidades do Sócio Ostensivo
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    O sócio ostensivo exerce a atividade constitutiva do objeto social sob sua exclusiva responsabilidade. Perante terceiros, apenas o sócio ostensivo se obriga.
                  </p>
                  <div className="p-3 bg-black/40 rounded border border-gray-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CNPJ Especial da SCP:</span>
                      <span className="font-mono text-amber-400">Obrigatório pela IN RFB 2.119</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tributação:</span>
                      <span className="text-gray-200">Apurada pelo Ostensivo com DARF sob CNPJ da SCP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distribuição de Resultados:</span>
                      <span className="text-emerald-400 font-semibold">Isenta de IR Fonte (Art. 10 Lei 9.249/95)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/60 rounded-lg border border-gray-800 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-400" />
                    Sócios Participantes (Investidores Ocultos)
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Os sócios participantes entram com aporte financeiro ou terreno e não praticam atos de gestão. A escrituração contábil da SCP pode ser efetuada nos livros do sócio ostensivo ou em livros próprios (SPED ECD / ECF separados).
                  </p>
                  <div className="p-3 bg-black/40 rounded border border-gray-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Aportes de Capital:</span>
                      <span className="text-gray-200">Patrimônio Especial da SCP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prestação de Contas:</span>
                      <span className="text-gray-200">Balanço e Demonstrações Específicas da SCP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Enquadramento no RET:</span>
                      <span className="text-amber-400 font-semibold">Permitido com Patrimônio Afetado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO EMPREENDIMENTO */}
      {modalNovoEmp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Cadastrar Novo Empreendimento Imobiliário
              </h3>
              <button onClick={() => setModalNovoEmp(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoEmp} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Código Identificador *</label>
                  <input
                    type="text"
                    required
                    value={formEmp.codigoEmpreendimento}
                    onChange={(e) => setFormEmp({ ...formEmp, codigoEmpreendimento: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="Ex: EMP-RES-03"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Nome do Empreendimento *</label>
                  <input
                    type="text"
                    required
                    value={formEmp.nomeEmpreendimento}
                    onChange={(e) => setFormEmp({ ...formEmp, nomeEmpreendimento: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                    placeholder="Ex: Reserva Imperial Residencial"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Empreendimento</label>
                  <select
                    value={formEmp.tipo}
                    onChange={(e) => setFormEmp({ ...formEmp, tipo: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                  >
                    <option value="INCORPORACAO_IMOBILIARIA_RET">Incorporação Imobiliária com RET</option>
                    <option value="LOTEAMENTO_URBANO">Loteamento Urbano</option>
                    <option value="CONDOMINIO_FECHADO">Condomínio Fechado</option>
                    <option value="CONSTRUCAO_IMOVEIS_VENDA">Construção para Venda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Natureza da Operação</label>
                  <select
                    value={formEmp.natureza}
                    onChange={(e) => setFormEmp({ ...formEmp, natureza: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                  >
                    <option value="PROPRIO">Patrimônio Próprio Afetado</option>
                    <option value="SCP_SOCIEDADE_CONTA_PARTICIPACAO">Sociedade em Conta de Participação (SCP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">CNPJ Próprio de Afetação</label>
                  <input
                    type="text"
                    value={formEmp.cnpjAfetacaoOuScp}
                    onChange={(e) => setFormEmp({ ...formEmp, cnpjAfetacaoOuScp: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Matrícula no Cartório (RGI)</label>
                  <input
                    type="text"
                    value={formEmp.matriculaRgi}
                    onChange={(e) => setFormEmp({ ...formEmp, matriculaRgi: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="Ex: R-3/105.820"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Cartório de Registro</label>
                  <input
                    type="text"
                    value={formEmp.cartorioRegistroImoveis}
                    onChange={(e) => setFormEmp({ ...formEmp, cartorioRegistroImoveis: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                    placeholder="1º Ofício de Registro de Imóveis"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-300">Enquadramento Minha Casa Minha Vida (MCMV)</span>
                  <p className="text-gray-400 text-[11px]">Alíquota unificada reduzida de 1,00% sobre as receitas auferidas</p>
                </div>
                <input
                  type="checkbox"
                  checked={formEmp.enquadramentoMcmv}
                  onChange={(e) => setFormEmp({ ...formEmp, enquadramentoMcmv: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Custo Total Orçado (BRL)</label>
                  <input
                    type="number"
                    value={formEmp.custoTotalOrcadoBRL}
                    onChange={(e) => setFormEmp({ ...formEmp, custoTotalOrcadoBRL: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Receita Total Contratada (BRL)</label>
                  <input
                    type="number"
                    value={formEmp.receitaTotalContratadaBRL}
                    onChange={(e) => setFormEmp({ ...formEmp, receitaTotalContratadaBRL: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovoEmp(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded"
                >
                  Salvar Empreendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA APURAÇÃO MENSAL */}
      {modalNovaApur && selectedEmp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Nova Apuração RET - {selectedEmp.nomeEmpreendimento}
              </h3>
              <button onClick={() => setModalNovaApur(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaApur} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Competência (AAAA-MM)</label>
                <input
                  type="month"
                  required
                  value={formApur.competencia}
                  onChange={(e) => setFormApur({ ...formApur, competencia: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Receita Bruta Recebida no Mês (Regime de Caixa - BRL)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formApur.receitaVendasRecebidasMesBRL}
                  onChange={(e) => setFormApur({ ...formApur, receitaVendasRecebidasMesBRL: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono text-sm"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Base de cálculo: ingressos financeiros de parcelas, balões, chaves e sinal auferidos na conta de afetação.
                </span>
              </div>

              <div className="p-3 bg-gray-900/80 rounded border border-gray-800 space-y-1.5 font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Alíquota Aplicável:</span>
                  <span className="text-amber-400 font-bold">{selectedEmp.aliquotaRetUnificadaPercentual.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-gray-800">
                  <span>Total RET a Recolher (DARF 4095):</span>
                  <span>
                    {formatBRL((formApur.receitaVendasRecebidasMesBRL * selectedEmp.aliquotaRetUnificadaPercentual) / 100)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovaApur(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded"
                >
                  Gravar e Calcular Apuração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GUIA DARF 4095 COM CÓDIGO DE BARRAS FEBRABAN */}
      {modalDarf && selectedApur && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-2xl shadow-2xl p-6 overflow-y-auto max-h-[95vh] font-sans">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-600 text-white font-bold flex items-center justify-center rounded">
                  DARF
                </div>
                <div>
                  <h3 className="font-bold text-base">MINISTÉRIO DA FAZENDA</h3>
                  <p className="text-xs text-gray-600">SECRETARIA ESPECIAL DA RECEITA FEDERAL DO BRASIL</p>
                  <p className="text-xs font-semibold text-gray-800">Documento de Arrecadação de Receitas Federais</p>
                </div>
              </div>
              <button onClick={() => setModalDarf(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border p-3 rounded bg-gray-50 mb-4 font-mono">
              <div>
                <span className="text-gray-500 block">02 NOME / RAZÃO SOCIAL</span>
                <span className="font-bold text-gray-900">{selectedApur.nomeEmpreendimento}</span>
                <span className="text-gray-500 block mt-2">03 CNPJ DO PATRIMÔNIO DE AFETAÇÃO</span>
                <span className="font-bold text-gray-900">{selectedApur.cnpjAfetacaoOuScp}</span>
              </div>
              <div className="space-y-2 border-l pl-3">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">04 CÓDIGO DA RECEITA:</span>
                  <span className="font-bold text-gray-900">{selectedApur.codigoReceitaDarf}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">05 NÚMERO DE REFERÊNCIA:</span>
                  <span className="font-bold text-gray-900">{selectedApur.competencia.replace('-', '')}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">06 DATA DE VENCIMENTO:</span>
                  <span className="font-bold text-gray-900">{selectedApur.dataVencimentoDarf}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">07 VALOR DO PRINCIPAL:</span>
                  <span className="font-bold text-gray-900">{formatBRL(selectedApur.valorTotalRetRecolherBRL)}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm">
                  <span className="font-bold text-gray-900">10 VALOR TOTAL:</span>
                  <span className="font-bold text-emerald-700">{formatBRL(selectedApur.valorTotalRetRecolherBRL)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-100 rounded border border-gray-300 text-center font-mono space-y-1 mb-4">
              <span className="text-[10px] text-gray-500 block">REPRESENTAÇÃO NUMÉRICA DO CÓDIGO DE BARRAS (PADRÃO FEBRABAN)</span>
              <p className="font-bold tracking-widest text-xs text-gray-900">{selectedApur.codigoBarrasDarfFebraban}</p>
              <div className="h-8 bg-gray-300 mt-2 flex items-center justify-center text-[10px] text-gray-600">
                ||||| | |||| ||| ||||||| ||||| |||| |||||||| |||| ||||| |||||| ||||| ||||||
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir DARF 4095</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LAUDO OFICIAL A4 TIMBRADO */}
      {modalLaudoA4 && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-4xl shadow-2xl p-8 overflow-y-auto max-h-[95vh] font-serif">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-wide text-gray-900 uppercase">
                  Laudo Técnico de Afetação & Apuração Tributária RET
                </h2>
                <p className="text-xs text-gray-600 font-sans">
                  Regime Especial de Tributação das Incorporações Imobiliárias • Lei Federal nº 10.931/2004 e IN RFB nº 2.179/2024
                </p>
              </div>
              <button onClick={() => setModalLaudoA4(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs text-gray-800 leading-relaxed font-sans">
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <h4 className="font-bold text-sm text-gray-900 mb-2">1. IDENTIFICAÇÃO DO INCORPORADOR E DO PATRIMÔNIO AFETADO</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Empresa Incorporadora:</strong> Studio Pro Engenharia e Empreendimentos S.A.</div>
                  <div><strong>CNPJ Matriz:</strong> 44.821.905/0001-07</div>
                  <div><strong>Empreendimento:</strong> {selectedEmp?.nomeEmpreendimento || 'Reserva dos Ipês Residencial'}</div>
                  <div><strong>CNPJ Afetação:</strong> {selectedEmp?.cnpjAfetacaoOuScp || '44.821.905/0002-88'}</div>
                  <div><strong>Registro Imobiliário:</strong> {selectedEmp?.matriculaRgi} ({selectedEmp?.cartorioRegistroImoveis})</div>
                  <div><strong>Alíquota Unificada RET:</strong> {selectedEmp?.aliquotaRetUnificadaPercentual}% (DARF Cód. 4095)</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">2. DEMONSTRATIVO CONSOLIDADO DAS RECEITAS E TRIBUTOS</h4>
                <table className="w-full text-xs text-left border">
                  <thead className="bg-gray-100 font-semibold border-b">
                    <tr>
                      <th className="p-2">Empreendimento</th>
                      <th className="p-2">Competência</th>
                      <th className="p-2 text-right">Receita Caixa (R$)</th>
                      <th className="p-2 text-right">IRPJ (1,26%)</th>
                      <th className="p-2 text-right">CSLL (0,66%)</th>
                      <th className="p-2 text-right">PIS (0,37%)</th>
                      <th className="p-2 text-right">COFINS (1,71%)</th>
                      <th className="p-2 text-right">Total RET (4%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    {(resumo?.apuracoesMensais || []).map((ap) => (
                      <tr key={ap.id}>
                        <td className="p-2 font-sans">{ap.nomeEmpreendimento}</td>
                        <td className="p-2">{ap.competencia}</td>
                        <td className="p-2 text-right">{formatBRL(ap.receitaVendasRecebidasMesBRL)}</td>
                        <td className="p-2 text-right">{formatBRL(ap.valorIrpjRetBRL)}</td>
                        <td className="p-2 text-right">{formatBRL(ap.valorCsllRetBRL)}</td>
                        <td className="p-2 text-right">{formatBRL(ap.valorPisRetBRL)}</td>
                        <td className="p-2 text-right">{formatBRL(ap.valorCofinsRetBRL)}</td>
                        <td className="p-2 text-right font-bold">{formatBRL(ap.valorTotalRetRecolherBRL)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">3. DECLARAÇÃO DE REGULARIDADE E PARECER TÉCNICO</h4>
                <p className="text-justify text-xs text-gray-700">
                  Certificamos para todos os fins fiscais e de auditoria que os ingressos auferidos e submetidos ao Regime Especial de Tributação (RET) refletem a totalidade dos pagamentos recebidos dos adquirentes de unidades autônomas, mantidos em conta corrente bancária segregada, sob a blindagem do patrimônio de afetação instituído conforme o Art. 31-A da Lei nº 4.591/1964. Os demonstrativos e apropriações contábeis foram elaborados em estrita conformidade com as normas técnicas do CPC 47 (OCPC 01) e Resoluções do Conselho Federal de Contabilidade (CFC).
                </p>
              </div>

              <div className="pt-10 grid grid-cols-2 gap-8 text-center border-t text-xs">
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
                  <strong className="block">Dr. Roberto Valadares Mendes</strong>
                  <span className="text-gray-600">Diretor Presidente / Incorporador Responsável</span>
                  <span className="text-gray-500 block font-mono">CPF: 112.334.556-78</span>
                </div>
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
                  <strong className="block">Dra. Amanda Vasconcelos de Souza</strong>
                  <span className="text-gray-600">Contadora Responsável Técnica</span>
                  <span className="text-gray-500 block font-mono">CRC/SP 1SP294850/O-1</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-6">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Laudo A4 Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
