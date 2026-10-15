import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tractor, 
  Plus, 
  FileText, 
  Download, 
  Printer, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Building2, 
  Landmark, 
  Trash2, 
  CheckCircle, 
  Copy, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ImovelRuralLCDPR, LancamentoLCDPR } from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const LcdprModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [ano, setAno] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'lancamentos' | 'imoveis' | 'resumo' | 'exportacao'>('lancamentos');

  const [imoveis, setImoveis] = useState<ImovelRuralLCDPR[]>([]);
  const [lancamentos, setLancamentos] = useState<LancamentoLCDPR[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'RECEITA' | 'DESPESA'>('TODOS');
  const [filtroImovel, setFiltroImovel] = useState<string>('TODOS');

  // Modais
  const [showNovoLancamentoModal, setShowNovoLancamentoModal] = useState(false);
  const [showNovoImovelModal, setShowNovoImovelModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [txtGerado, setTxtGerado] = useState<string>('');
  const [copiado, setCopiado] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form Lançamento
  const [novoLancForm, setNovoLancForm] = useState({
    data: '2026-03-15',
    imovelRuralId: 1,
    contaBancaria: 'Banco do Brasil C/C 45900-1 (Ag. 0048)',
    tipoDocumento: '1' as '1' | '2' | '3' | '4' | '5',
    numeroDocumento: '',
    participanteNome: '',
    participanteCnpjCpf: '',
    tipoLancamento: 'RECEITA' as 'RECEITA' | 'DESPESA',
    descricao: '',
    valor: ''
  });

  // Form Imóvel
  const [novoImovelForm, setNovoImovelForm] = useState({
    nomeImovel: '',
    nirf: '',
    codigoIncra: '',
    endereco: '',
    municipio: '',
    uf: 'SP',
    codigoIbge: '3543402',
    tipoExploracao: '1' as '1' | '2' | '3' | '4',
    percentualParticipacao: 100
  });

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa();
    if (emp) {
      setEmpresa(emp);
      const ims = dbService.getImoveisRurais(emp.id);
      setImoveis(ims);
      if (ims.length > 0 && !novoLancForm.imovelRuralId) {
        setNovoLancForm(prev => ({ ...prev, imovelRuralId: ims[0].id }));
      }
      const lancs = dbService.getLancamentosLCDPR(emp.id, ano);
      setLancamentos(lancs);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [ano]);

  // KPIs
  const totais = useMemo(() => {
    const totalReceitas = lancamentos.reduce((acc, l) => acc + l.valorEntrada, 0);
    const totalDespesas = lancamentos.reduce((acc, l) => acc + l.valorSaida, 0);
    const resultado = totalReceitas - totalDespesas;
    const margem = totalReceitas > 0 ? (resultado / totalReceitas) * 100 : 0;
    return {
      totalReceitas,
      totalDespesas,
      resultado,
      margem,
      qtdLancamentos: lancamentos.length
    };
  }, [lancamentos]);

  // Resumo mensal
  const resumoMensal = useMemo(() => {
    const meses = [
      { mes: 1, nome: 'Janeiro' },
      { mes: 2, nome: 'Fevereiro' },
      { mes: 3, nome: 'Março' },
      { mes: 4, nome: 'Abril' },
      { mes: 5, nome: 'Maio' },
      { mes: 6, nome: 'Junho' },
      { mes: 7, nome: 'Julho' },
      { mes: 8, nome: 'Agosto' },
      { mes: 9, nome: 'Setembro' },
      { mes: 10, nome: 'Outubro' },
      { mes: 11, nome: 'Novembro' },
      { mes: 12, nome: 'Dezembro' }
    ];

    let saldoAcumulado = 0;
    return meses.map(m => {
      const mesFormatado = `${ano}-${String(m.mes).padStart(2, '0')}`;
      const lancsMes = lancamentos.filter(l => l.data.startsWith(mesFormatado));
      const receitas = lancsMes.reduce((acc, l) => acc + l.valorEntrada, 0);
      const despesas = lancsMes.reduce((acc, l) => acc + l.valorSaida, 0);
      const saldoMes = receitas - despesas;
      saldoAcumulado += saldoMes;

      return {
        mes: m.mes,
        nome: m.nome,
        periodo: mesFormatado,
        receitas,
        despesas,
        saldoMes,
        saldoAcumulado,
        qtd: lancsMes.length
      };
    });
  }, [lancamentos, ano]);

  // Filtro de lançamentos
  const lancamentosFiltrados = useMemo(() => {
    return lancamentos.filter(l => {
      const matchSearch = 
        l.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.participanteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchTipo = 
        filtroTipo === 'TODOS' || l.tipoLancamento === filtroTipo;

      const matchImovel = 
        filtroImovel === 'TODOS' || String(l.imovelRuralId) === filtroImovel;

      return matchSearch && matchTipo && matchImovel;
    });
  }, [lancamentos, searchTerm, filtroTipo, filtroImovel]);

  // Handlers
  const handleGravarLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;

    const valorNum = parseFloat(novoLancForm.valor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      setFeedbackMsg({ tipo: 'error', texto: 'Informe um valor numérico válido maior que zero.' });
      return;
    }

    try {
      dbService.saveLancamentoLCDPR({
        empresaId: empresa.id,
        ano,
        data: novoLancForm.data,
        imovelRuralId: Number(novoLancForm.imovelRuralId),
        contaBancaria: novoLancForm.contaBancaria,
        tipoDocumento: novoLancForm.tipoDocumento,
        numeroDocumento: novoLancForm.numeroDocumento || 'S/N',
        participanteNome: novoLancForm.participanteNome || 'DIVERSOS',
        participanteCnpjCpf: novoLancForm.participanteCnpjCpf || '00.000.000/0001-00',
        tipoLancamento: novoLancForm.tipoLancamento,
        descricao: novoLancForm.descricao,
        valorEntrada: novoLancForm.tipoLancamento === 'RECEITA' ? valorNum : 0,
        valorSaida: novoLancForm.tipoLancamento === 'DESPESA' ? valorNum : 0
      });

      setFeedbackMsg({ tipo: 'success', texto: 'Lançamento do Livro Caixa Rural registrado com sucesso!' });
      setShowNovoLancamentoModal(false);
      setNovoLancForm(prev => ({
        ...prev,
        numeroDocumento: '',
        participanteNome: '',
        participanteCnpjCpf: '',
        descricao: '',
        valor: ''
      }));
      carregarDados();
    } catch {
      setFeedbackMsg({ tipo: 'error', texto: 'Erro ao salvar lançamento LCDPR.' });
    }
  };

  const handleExcluirLancamento = (id: number) => {
    if (confirm('Confirma a exclusão deste lançamento do Livro Caixa Digital do Produtor Rural?')) {
      const ok = dbService.deleteLancamentoLCDPR(id);
      if (ok) {
        setFeedbackMsg({ tipo: 'success', texto: 'Lançamento excluído com sucesso.' });
        carregarDados();
      }
    }
  };

  const handleGravarImovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;

    if (!novoImovelForm.nomeImovel || !novoImovelForm.nirf) {
      setFeedbackMsg({ tipo: 'error', texto: 'Preencha o Nome do Imóvel e o NIRF obrigatório.' });
      return;
    }

    try {
      dbService.saveImovelRural({
        empresaId: empresa.id,
        nomeImovel: novoImovelForm.nomeImovel,
        nirf: novoImovelForm.nirf,
        codigoIncra: novoImovelForm.codigoIncra,
        endereco: novoImovelForm.endereco,
        municipio: novoImovelForm.municipio,
        uf: novoImovelForm.uf,
        codigoIbge: novoImovelForm.codigoIbge,
        tipoExploracao: novoImovelForm.tipoExploracao,
        percentualParticipacao: Number(novoImovelForm.percentualParticipacao)
      });

      setFeedbackMsg({ tipo: 'success', texto: 'Imóvel Rural cadastrado com sucesso.' });
      setShowNovoImovelModal(false);
      setNovoImovelForm({
        nomeImovel: '',
        nirf: '',
        codigoIncra: '',
        endereco: '',
        municipio: '',
        uf: 'SP',
        codigoIbge: '3543402',
        tipoExploracao: '1',
        percentualParticipacao: 100
      });
      carregarDados();
    } catch {
      setFeedbackMsg({ tipo: 'error', texto: 'Erro ao salvar imóvel rural.' });
    }
  };

  const handleGerarTxt = () => {
    if (!empresa) return;
    const txt = dbService.gerarArquivoTxtLCDPR(empresa.id, ano);
    setTxtGerado(txt);
    setActiveTab('exportacao');
    setFeedbackMsg({ tipo: 'success', texto: `Arquivo LCDPR do ano ${ano} gerado com sucesso conforme IN RFB nº 1.848/2018!` });
  };

  const handleDownloadTxt = () => {
    if (!txtGerado) return;
    const element = document.createElement('a');
    const file = new Blob([txtGerado], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `LCDPR_${empresa?.cnpj.replace(/\D/g, '') || 'EMPRESA'}_${ano}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopiarTxt = () => {
    if (!txtGerado) return;
    navigator.clipboard.writeText(txtGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-gray-200 overflow-hidden font-sans">
      {/* HEADER BAR */}
      <div className="bg-[#181818] border-b border-[#2a2a2a] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-100">Livro Caixa Digital do Produtor Rural (LCDPR)</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                  IN RFB nº 1.848/2018
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {empresa ? `${empresa.razaoSocial} • CNPJ: ${empresa.cnpj}` : 'Selecione uma empresa'} • Exercício Social {ano}
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLES DO TOPO */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded border border-[#333]">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Exercício:</span>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#202020]">2026</option>
              <option value={2025} className="bg-[#202020]">2025</option>
              <option value={2024} className="bg-[#202020]">2024</option>
            </select>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 rounded border border-[#3a3a3a] transition"
            title="Visualizar e Imprimir Livro Caixa Oficial A4"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Imprimir A4
          </button>

          <button
            onClick={handleGerarTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-700/80 hover:bg-emerald-600 text-white font-medium rounded shadow transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Gerar TXT RFB
          </button>

          <button
            onClick={() => setShowNovoLancamentoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium rounded shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedbackMsg && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between border-b ${
          feedbackMsg.tipo === 'success' 
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.tipo === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI DASHBOARD CARDS */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Receitas da Atividade</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              R$ {totais.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Venda de Safras e Produção</div>
          </div>
          <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Despesas & Custeio</div>
            <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
              R$ {totais.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Insumos, Máquinas, Mão de Obra</div>
          </div>
          <div className="p-2 rounded bg-rose-950/40 text-rose-400 border border-rose-800/30">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Resultado da Atividade</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${totais.resultado >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {totais.resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {totais.resultado >= 0 ? 'Superávit Operacional' : 'Déficit no Exercício'}
            </div>
          </div>
          <div className={`p-2 rounded border ${totais.resultado >= 0 ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30' : 'bg-rose-950/40 text-rose-400 border-rose-800/30'}`}>
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Margem Líquida</div>
            <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
              {totais.margem.toFixed(2)}%
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Rentabilidade Agropecuária</div>
          </div>
          <div className="p-2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/30">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Imóveis Rurais</div>
            <div className="text-base font-bold text-sky-400 font-mono mt-0.5">
              {imoveis.length} {imoveis.length === 1 ? 'Propriedade' : 'Propriedades'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">{totais.qtdLancamentos} lançamentos vinculados</div>
          </div>
          <div className="p-2 rounded bg-sky-950/40 text-sky-400 border border-sky-800/30">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="px-6 border-b border-[#2a2a2a] flex gap-2">
        <button
          onClick={() => setActiveTab('lancamentos')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'lancamentos'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Demonstrativo do Livro Caixa (Registro Q100)
        </button>
        <button
          onClick={() => setActiveTab('imoveis')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'imoveis'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Imóveis Rurais & Contas Bancárias (0030/0040)
        </button>
        <button
          onClick={() => setActiveTab('resumo')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'resumo'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Resumo Mensal da Atividade (Registro Q200)
        </button>
        <button
          onClick={() => setActiveTab('exportacao')}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'exportacao'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Arquivo Digital RFB (.TXT)
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="flex-1 overflow-auto p-6">
        {/* ABA 1: LANÇAMENTOS DO LIVRO CAIXA */}
        {activeTab === 'lancamentos' && (
          <div className="space-y-4">
            {/* BARRA DE FILTROS */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#181818] p-3 rounded border border-[#2a2a2a]">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Pesquisar por histórico, documento ou participante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#202020] border border-[#333] text-xs text-gray-200 rounded px-3 py-1.5 w-72 focus:outline-none focus:border-emerald-500"
                />

                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as any)}
                  className="bg-[#202020] border border-[#333] text-xs text-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TODOS">Todos os Lançamentos</option>
                  <option value="RECEITA">Apenas Receitas (Entradas)</option>
                  <option value="DESPESA">Apenas Despesas (Saídas)</option>
                </select>

                <select
                  value={filtroImovel}
                  onChange={(e) => setFiltroImovel(e.target.value)}
                  className="bg-[#202020] border border-[#333] text-xs text-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TODOS">Todos os Imóveis Rurais</option>
                  {imoveis.map(im => (
                    <option key={im.id} value={String(im.id)}>
                      {im.codigoImovel} - {im.nomeImovel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-gray-400">
                Mostrando <span className="font-semibold text-gray-200">{lancamentosFiltrados.length}</span> de {lancamentos.length} lançamentos
              </div>
            </div>

            {/* TABELA DE LANÇAMENTOS */}
            <div className="bg-[#181818] rounded-lg border border-[#2a2a2a] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#202020] text-gray-400 border-b border-[#2a2a2a]">
                  <tr>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Imóvel Rural</th>
                    <th className="py-2.5 px-3">Conta Bancária</th>
                    <th className="py-2.5 px-3">Documento</th>
                    <th className="py-2.5 px-3">Participante / Favorecido</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Histórico / Descrição</th>
                    <th className="py-2.5 px-3 text-right">Entradas (R$)</th>
                    <th className="py-2.5 px-3 text-right">Saídas (R$)</th>
                    <th className="py-2.5 px-3 text-right">Saldo Progressivo</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {lancamentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-gray-500">
                        Nenhum lançamento encontrado para os filtros selecionados no ano {ano}.
                      </td>
                    </tr>
                  ) : (
                    lancamentosFiltrados.map((l) => (
                      <tr key={l.id} className="hover:bg-[#1f1f1f] transition">
                        <td className="py-2.5 px-3 font-mono text-gray-300">
                          {l.data.split('-').reverse().join('/')}
                        </td>
                        <td className="py-2.5 px-3 text-gray-200 font-medium">
                          {l.imovelNome}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px]">
                          {l.contaBancaria}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-300">
                          {l.numeroDocumento}
                        </td>
                        <td className="py-2.5 px-3 text-gray-300">
                          <div>{l.participanteNome}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{l.participanteCnpjCpf}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            l.tipoLancamento === 'RECEITA' 
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                          }`}>
                            {l.tipoLancamento}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-300 max-w-xs truncate" title={l.descricao}>
                          {l.descricao}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-medium">
                          {l.valorEntrada > 0 ? l.valorEntrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-medium">
                          {l.valorSaida > 0 ? l.valorSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-100">
                          R$ {l.saldoProgressivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleExcluirLancamento(l.id)}
                            className="p-1 text-gray-500 hover:text-rose-400 rounded transition"
                            title="Excluir Lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {lancamentosFiltrados.length > 0 && (
                  <tfoot className="bg-[#202020] font-semibold text-gray-200 border-t border-[#333]">
                    <tr>
                      <td colSpan={7} className="py-2.5 px-3 text-right uppercase text-[11px]">
                        Totais do Período:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        R$ {totais.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        R$ {totais.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-white font-bold">
                        R$ {totais.resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: IMÓVEIS RURAIS E CONTAS BANCÁRIAS */}
        {activeTab === 'imoveis' && (
          <div className="space-y-6">
            <div className="bg-[#181818] p-4 rounded-lg border border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Relação de Imóveis Rurais Cadastrados (Registro 0030)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Propriedades exploradas com atividade agrícola, pecuária ou agroindustrial.
                  </p>
                </div>
                <button
                  onClick={() => setShowNovoImovelModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Imóvel Rural
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imoveis.map(im => (
                  <div key={im.id} className="bg-[#202020] p-4 rounded-lg border border-[#333] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Código {im.codigoImovel}
                        </span>
                        <h4 className="text-sm font-bold text-gray-100 mt-1">{im.nomeImovel}</h4>
                        <div className="text-xs text-gray-400">{im.endereco}</div>
                        <div className="text-xs text-gray-400">{im.municipio} - {im.uf} (IBGE: {im.codigoIbge})</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase">Participação</div>
                        <div className="text-sm font-bold text-emerald-400 font-mono">{im.percentualParticipacao.toFixed(2)}%</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#2a2a2a] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">NIRF:</span>{' '}
                        <span className="font-mono text-gray-200 font-semibold">{im.nirf}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">INCRA:</span>{' '}
                        <span className="font-mono text-gray-200 font-semibold">{im.codigoIncra || 'Não inf.'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Tipo de Exploração:</span>{' '}
                        <span className="text-gray-200">
                          {im.tipoExploracao === '1' && '1 - Individual (Produtor Único)'}
                          {im.tipoExploracao === '2' && '2 - Condomínio / Co-propriedade'}
                          {im.tipoExploracao === '3' && '3 - Parceria Rural'}
                          {im.tipoExploracao === '4' && '4 - Arrendamento Rural'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUADRO DE CONTAS BANCÁRIAS */}
            <div className="bg-[#181818] p-4 rounded-lg border border-[#2a2a2a]">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2 mb-2">
                <Landmark className="w-4 h-4 text-sky-400" />
                Contas Bancárias da Atividade Rural (Registro 0040)
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Contas correntes de livre movimentação exclusiva ou mista dos recursos rurais.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#202020] rounded border border-[#333]">
                  <div className="text-[10px] text-sky-400 font-mono">Conta 001</div>
                  <div className="text-xs font-bold text-gray-200 mt-1">Banco do Brasil S/A (001)</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">Agência: 0048 • C/C: 45900-1</div>
                  <div className="text-[10px] text-gray-500 mt-1">Vinculada à Fazenda Santa Cruz</div>
                </div>
                <div className="p-3 bg-[#202020] rounded border border-[#333]">
                  <div className="text-[10px] text-sky-400 font-mono">Conta 002</div>
                  <div className="text-xs font-bold text-gray-200 mt-1">Sicoob Cooperativa de Crédito (756)</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">Agência: 3120 • C/C: 88120-4</div>
                  <div className="text-[10px] text-gray-500 mt-1">Conta de Custeio e Financiamento</div>
                </div>
                <div className="p-3 bg-[#202020] rounded border border-[#333]">
                  <div className="text-[10px] text-sky-400 font-mono">Conta 003</div>
                  <div className="text-xs font-bold text-gray-200 mt-1">Caixa Econômica Federal (104)</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">Agência: 0214 • C/C: 10450-9</div>
                  <div className="text-[10px] text-gray-500 mt-1">Recebimento Pronaf / Pronamp</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: RESUMO MENSAL (REGISTRO Q200) */}
        {activeTab === 'resumo' && (
          <div className="space-y-4">
            <div className="bg-[#181818] p-4 rounded-lg border border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Resumo Mensal da Atividade Agropecuária (Registro Q200)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Evolução das entradas e saídas mensais com apuração do saldo do exercício {ano}.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#202020] text-gray-400 border-b border-[#2a2a2a]">
                    <tr>
                      <th className="py-2.5 px-3">Mês / Competência</th>
                      <th className="py-2.5 px-3 text-center">Nº Lançamentos</th>
                      <th className="py-2.5 px-3 text-right">Total Receitas (R$)</th>
                      <th className="py-2.5 px-3 text-right">Total Despesas (R$)</th>
                      <th className="py-2.5 px-3 text-right">Saldo do Mês (R$)</th>
                      <th className="py-2.5 px-3 text-right">Saldo Acumulado (R$)</th>
                      <th className="py-2.5 px-3 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {resumoMensal.map((m) => (
                      <tr key={m.mes} className="hover:bg-[#1f1f1f] transition">
                        <td className="py-2.5 px-3 font-medium text-gray-200">
                          {m.nome} / {ano}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-gray-400">
                          {m.qtd}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                          {m.receitas > 0 ? m.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                          {m.despesas > 0 ? m.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-medium ${m.saldoMes >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {m.saldoMes !== 0 ? m.saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${m.saldoAcumulado >= 0 ? 'text-gray-100' : 'text-rose-400'}`}>
                          R$ {m.saldoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            m.saldoMes > 0 
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                              : m.saldoMes < 0
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {m.saldoMes > 0 ? 'Superavitário' : m.saldoMes < 0 ? 'Deficitário' : 'Sem Movimento'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#202020] font-semibold text-gray-200 border-t border-[#333]">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-3 uppercase text-[11px]">
                        Totalização Geral do Ano {ano}:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        R$ {totais.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        R$ {totais.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-white font-bold">
                        R$ {totais.resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-300 font-bold">
                        R$ {totais.resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center">
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {totais.resultado >= 0 ? 'LUCRO RURAL' : 'PREJUÍZO RURAL'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: ARQUIVO DIGITAL RFB (.TXT) */}
        {activeTab === 'exportacao' && (
          <div className="space-y-4">
            <div className="bg-[#181818] p-4 rounded-lg border border-[#2a2a2a]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Arquivo Digital LCDPR (Leiaute Oficial RFB)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Arquivo pipe-delimited (|) pronto para validação no PVA LCDPR da Receita Federal.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopiarTxt}
                    disabled={!txtGerado}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] disabled:opacity-50 text-gray-200 rounded border border-[#3a3a3a] transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    disabled={!txtGerado}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded shadow transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Arquivo .TXT
                  </button>
                </div>
              </div>

              {!txtGerado ? (
                <div className="p-8 text-center bg-[#151515] rounded border border-dashed border-[#333] space-y-3">
                  <FileText className="w-8 h-8 text-gray-500 mx-auto" />
                  <div className="text-xs text-gray-300 font-medium">Nenhum arquivo digital gerado no momento.</div>
                  <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                    Clique no botão abaixo para processar todos os lançamentos e compilar os registros 0000 a 9999.
                  </p>
                  <button
                    onClick={handleGerarTxt}
                    className="px-4 py-2 text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded shadow transition"
                  >
                    Gerar Arquivo do Exercício {ano}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[#111] p-3 rounded border border-[#333] font-mono text-[11px] text-emerald-300 max-h-96 overflow-y-auto whitespace-pre leading-relaxed select-all">
                    {txtGerado}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div>
                      Linhas geradas: <span className="font-mono text-white">{txtGerado.split('\n').length}</span> registros
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Estrutura compatível com IN RFB 1.848/2018
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL NOVO LANÇAMENTO */}
      {showNovoLancamentoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-[#222] border-b border-[#333] flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Novo Lançamento do Livro Caixa Rural (Registro Q100)
              </h3>
              <button onClick={() => setShowNovoLancamentoModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGravarLancamento} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Data do Movimento *</label>
                  <input
                    type="date"
                    required
                    value={novoLancForm.data}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Tipo de Operação *</label>
                  <select
                    value={novoLancForm.tipoLancamento}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, tipoLancamento: e.target.value as any }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="RECEITA" className="text-emerald-400">RECEITA (Venda de Produção / Entrada)</option>
                    <option value="DESPESA" className="text-rose-400">DESPESA (Insumo / Custeio / Saída)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Imóvel Rural Vinculado *</label>
                  <select
                    value={novoLancForm.imovelRuralId}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, imovelRuralId: Number(e.target.value) }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    {imoveis.map(im => (
                      <option key={im.id} value={im.id}>
                        {im.codigoImovel} - {im.nomeImovel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Conta Bancária *</label>
                  <input
                    type="text"
                    required
                    value={novoLancForm.contaBancaria}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, contaBancaria: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Tipo Documento</label>
                  <select
                    value={novoLancForm.tipoDocumento}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, tipoDocumento: e.target.value as any }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1">1 - Nota Fiscal</option>
                    <option value="2">2 - Fatura</option>
                    <option value="3">3 - Recibo</option>
                    <option value="4">4 - Contrato</option>
                    <option value="5">5 - Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Nº do Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: NF-e 1450"
                    value={novoLancForm.numeroDocumento}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, numeroDocumento: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Valor (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={novoLancForm.valor}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, valor: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Nome do Participante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cooperativa Agroindustrial"
                    value={novoLancForm.participanteNome}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, participanteNome: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">CNPJ / CPF do Participante *</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0001-00"
                    value={novoLancForm.participanteCnpjCpf}
                    onChange={(e) => setNovoLancForm(prev => ({ ...prev, participanteCnpjCpf: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1 font-medium">Histórico / Descrição da Operação *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Venda de 800 sacas de milho safrinha colheita 2026..."
                  value={novoLancForm.descricao}
                  onChange={(e) => setNovoLancForm(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-[#333] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovoLancamentoModal(false)}
                  className="px-4 py-2 text-xs bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded shadow transition"
                >
                  Gravar Lançamento LCDPR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO IMÓVEL RURAL */}
      {showNovoImovelModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1c] border border-[#333] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-[#222] border-b border-[#333] flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Cadastrar Imóvel Rural (Registro 0030)
              </h3>
              <button onClick={() => setShowNovoImovelModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGravarImovel} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1 font-medium">Nome do Imóvel Rural *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fazenda Boa Esperança"
                  value={novoImovelForm.nomeImovel}
                  onChange={(e) => setNovoImovelForm(prev => ({ ...prev, nomeImovel: e.target.value }))}
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">NIRF (8 Dígitos) *</label>
                  <input
                    type="text"
                    required
                    placeholder="12345678"
                    value={novoImovelForm.nirf}
                    onChange={(e) => setNovoImovelForm(prev => ({ ...prev, nirf: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Código INCRA</label>
                  <input
                    type="text"
                    placeholder="98765432100"
                    value={novoImovelForm.codigoIncra}
                    onChange={(e) => setNovoImovelForm(prev => ({ ...prev, codigoIncra: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1 font-medium">Endereço / Rodovia / Linha</label>
                <input
                  type="text"
                  placeholder="Ex: Rodovia SP-330 Km 42 - Zona Rural"
                  value={novoImovelForm.endereco}
                  onChange={(e) => setNovoImovelForm(prev => ({ ...prev, endereco: e.target.value }))}
                  className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Município</label>
                  <input
                    type="text"
                    placeholder="Ribeirão Preto"
                    value={novoImovelForm.municipio}
                    onChange={(e) => setNovoImovelForm(prev => ({ ...prev, municipio: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={novoImovelForm.uf}
                    onChange={(e) => setNovoImovelForm(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Cód. IBGE</label>
                  <input
                    type="text"
                    value={novoImovelForm.codigoIbge}
                    onChange={(e) => setNovoImovelForm(prev => ({ ...prev, codigoIbge: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">Tipo de Exploração</label>
                  <select
                    value={novoImovelForm.tipoExploracao}
                    onChange={(e) => setNovoImovelForm(prev => ({ ...prev, tipoExploracao: e.target.value as any }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1">1 - Individual</option>
                    <option value="2">2 - Condomínio</option>
                    <option value="3">3 - Parceria</option>
                    <option value="4">4 - Arrendamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">% Participação</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={novoImovelForm.percentualParticipacao}
                    onChange={(e) => setNovoImovelForm(prev => ({ ...prev, percentualParticipacao: Number(e.target.value) }))}
                    className="w-full bg-[#141414] border border-[#333] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#333] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovoImovelModal(false)}
                  className="px-4 py-2 text-xs bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded shadow transition"
                >
                  Salvar Imóvel Rural
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELATÓRIO A4 OFICIAL - LIVRO CAIXA DIGITAL DO PRODUTOR RURAL */}
      {showPrintModal && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          empresa={empresa}
          tituloRelatorio="Livro Caixa do Produtor Rural"
          subtitulo="Demonstrativo da Atividade Agropecuária • IN RFB nº 1.848/2018"
          periodo={`Exercício ${ano}`}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            {/* CABEÇALHO DA PROPRIEDADE / PRODUTOR */}
            <div className="border border-black p-3 space-y-1">
              <div className="font-bold text-sm">{empresa.razaoSocial}</div>
              <div>CNPJ / CPF: {empresa.cnpj} • Endereço: {empresa.logradouro}, {empresa.numero}</div>
              <div>Município: {empresa.cidade || 'São Paulo'} - {empresa.uf} (Cód. IBGE: {empresa.codigoIbge})</div>
              <div>Data de Emissão: {new Date().toLocaleDateString('pt-BR')} • Exercício Social: {ano}</div>
            </div>

            {/* QUADRO 1: IMÓVEIS RURAIS VINCULADOS */}
            <div className="p-2 border border-black">
              <div className="font-bold mb-2">1. IMÓVEIS RURAIS VINCULADOS À ATIVIDADE AGROPECUÁRIA (REGISTRO 0030)</div>
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-left">Cód.</th>
                    <th className="border border-black p-1 text-left">Denominação do Imóvel</th>
                    <th className="border border-black p-1 text-left">NIRF</th>
                    <th className="border border-black p-1 text-left">Cód. INCRA</th>
                    <th className="border border-black p-1 text-left">Localização</th>
                    <th className="border border-black p-1 text-center">Exploração</th>
                    <th className="border border-black p-1 text-right">% Part.</th>
                  </tr>
                </thead>
                <tbody>
                  {imoveis.map(im => (
                    <tr key={im.id} className="border-b border-black">
                      <td className="border border-black p-1 font-mono font-bold">{im.codigoImovel}</td>
                      <td className="border border-black p-1">{im.nomeImovel}</td>
                      <td className="border border-black p-1 font-mono">{im.nirf}</td>
                      <td className="border border-black p-1 font-mono">{im.codigoIncra || '-'}</td>
                      <td className="border border-black p-1">{im.municipio} / {im.uf}</td>
                      <td className="border border-black p-1 text-center">
                        {im.tipoExploracao === '1' ? 'Individual' : im.tipoExploracao === '2' ? 'Condomínio' : im.tipoExploracao === '3' ? 'Parceria' : 'Arrendamento'}
                      </td>
                      <td className="border border-black p-1 text-right font-mono">{im.percentualParticipacao.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QUADRO 2: DEMONSTRATIVO ANALÍTICO DOS LANÇAMENTOS */}
            <div className="p-2 border border-black">
              <div className="font-bold mb-2">2. DEMONSTRATIVO ANALÍTICO DO LIVRO CAIXA RURAL (REGISTRO Q100)</div>
              <table className="w-full border-collapse border border-black text-[9px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-left">Data</th>
                    <th className="border border-black p-1 text-left">Imóvel</th>
                    <th className="border border-black p-1 text-left">Doc.</th>
                    <th className="border border-black p-1 text-left">Favorecido / Participante</th>
                    <th className="border border-black p-1 text-left">Histórico da Operação</th>
                    <th className="border border-black p-1 text-right">Entradas (R$)</th>
                    <th className="border border-black p-1 text-right">Saídas (R$)</th>
                    <th className="border border-black p-1 text-right">Saldo (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((l) => (
                    <tr key={l.id} className="border-b border-black">
                      <td className="border border-black p-1 font-mono">{l.data.split('-').reverse().join('/')}</td>
                      <td className="border border-black p-1">{l.imovelNome}</td>
                      <td className="border border-black p-1 font-mono">{l.numeroDocumento}</td>
                      <td className="border border-black p-1">{l.participanteNome}</td>
                      <td className="border border-black p-1">{l.descricao}</td>
                      <td className="border border-black p-1 text-right font-mono">
                        {l.valorEntrada > 0 ? l.valorEntrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="border border-black p-1 text-right font-mono">
                        {l.valorSaida > 0 ? l.valorSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="border border-black p-1 text-right font-mono font-bold">
                        {l.saldoProgressivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold border-t border-black">
                    <td colSpan={5} className="border border-black p-1 text-right uppercase">Total Acumulado:</td>
                    <td className="border border-black p-1 text-right font-mono">
                      R$ {totais.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black p-1 text-right font-mono">
                      R$ {totais.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black p-1 text-right font-mono">
                      R$ {totais.resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* QUADRO 3: RESUMO MENSAL DA ATIVIDADE */}
            <div className="p-2 border border-black">
              <div className="font-bold mb-2">3. RESUMO MENSAL DA ATIVIDADE RURAL (REGISTRO Q200)</div>
              <table className="w-full border-collapse border border-black text-[9px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-left">Mês</th>
                    <th className="border border-black p-1 text-right">Entradas / Receitas (R$)</th>
                    <th className="border border-black p-1 text-right">Saídas / Despesas (R$)</th>
                    <th className="border border-black p-1 text-right">Resultado do Mês (R$)</th>
                    <th className="border border-black p-1 text-right">Saldo Acumulado (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoMensal.map((m) => (
                    <tr key={m.mes} className="border-b border-black">
                      <td className="border border-black p-1 font-medium">{m.nome} / {ano}</td>
                      <td className="border border-black p-1 text-right font-mono">
                        {m.receitas > 0 ? m.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="border border-black p-1 text-right font-mono">
                        {m.despesas > 0 ? m.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="border border-black p-1 text-right font-mono font-medium">
                        {m.saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-black p-1 text-right font-mono font-bold">
                        {m.saldoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TERMOS DE ENCERRAMENTO E ASSINATURAS */}
            <div className="border border-black p-4 space-y-3">
              <div className="font-bold">4. TERMO DE ENCERRAMENTO E DECLARAÇÃO DA ESCRITURAÇÃO</div>
              <p className="text-[10px] text-justify leading-relaxed">
                Declaramos sob as penas da lei que o presente Livro Caixa Digital do Produtor Rural (LCDPR) 
                contém a escrituração autêntica, exata e completa de todas as receitas, despesas de custeio, 
                investimentos e demais valores decorrentes da exploração da atividade agropecuária desenvolvida 
                no exercício de {ano}, atendendo rigorosamente à Instrução Normativa RFB nº 1.848/2018.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="text-center border-t border-black pt-1">
                  <div className="font-bold">{empresa.razaoSocial}</div>
                  <div>Produtor Rural / Representante Legal</div>
                  <div className="text-[10px]">CPF / CNPJ: {empresa.cnpj}</div>
                </div>
                <div className="text-center border-t border-black pt-1">
                  <div className="font-bold">Contabilista Responsável</div>
                  <div>CRC/UF: CRC-SP 241.982/O-4</div>
                  <div className="text-[10px]">Assinatura com Certificado Digital ICP-Brasil</div>
                </div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
