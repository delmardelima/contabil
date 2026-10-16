import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  FileCode,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Printer,
  Download,
  Building2,
  Receipt,
  FileText,
  Percent,
  SlidersHorizontal,
  ShieldCheck,
  Briefcase,
  Lock,
  Copy
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoESocialS1200S1210,
  EventoRemuneracaoS1200,
  EventoPagamentoS1210,
  RubricaFolhaItem,
  DemonstrativoDevValores
} from '../../types/contabil';

export const ESocialRemuneracaoPgtosModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoESocialS1200S1210 | null>(null);
  const [activeTab, setActiveTab] = useState<'s1200' | 's1210' | 'visualizadorXml' | 'holeriteEspelho'>('s1200');
  const [busca, setBusca] = useState<string>('');

  // Evento selecionado
  const [selectedColabId, setSelectedColabId] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // XML Visualizado
  const [xmlVisualizado, setXmlVisualizado] = useState<string>('');
  const [nomeArquivoXml, setNomeArquivoXml] = useState<string>('');

  // Modal Novo Trabalhador
  const [modalNovoTrabalhador, setModalNovoTrabalhador] = useState<boolean>(false);
  const [formNome, setFormNome] = useState<string>('');
  const [formCpf, setFormCpf] = useState<string>('');
  const [formMatricula, setFormMatricula] = useState<string>('');
  const [formCargo, setFormCargo] = useState<string>('');
  const [formSalario, setFormSalario] = useState<number>(5000);
  const [formCategoria, setFormCategoria] = useState<number>(101);

  const carregarDados = () => {
    const dados = dbService.getESocialS1200S1210(empresaId, competencia);
    setResumo(dados);
    if (dados.eventosS1200.length > 0 && !selectedColabId) {
      setSelectedColabId(dados.eventosS1200[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia, empresaId]);

  const handleGerarXml = (tipo: 'S-1200' | 'S-1210', id: string) => {
    const res = dbService.gerarXmlESocialEvento(tipo, id);
    if (res.sucesso && res.xml) {
      setXmlVisualizado(res.xml);
      setNomeArquivoXml(res.nomeArquivo || 'evento_esocial.xml');
      setActiveTab('visualizadorXml');
      setNotificacao({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    } else {
      setNotificacao({ tipo: 'erro', texto: res.mensagem });
    }
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarFolhaESocialContabil(competencia, empresaId);
    if (res.sucesso) {
      setNotificacao({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    } else {
      setNotificacao({ tipo: 'erro', texto: res.mensagem });
    }
  };

  const handleSalvarNovoTrabalhador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formCpf) {
      setNotificacao({ tipo: 'erro', texto: 'Preencha Nome e CPF do colaborador.' });
      return;
    }

    const inssCalc = formSalario * 0.11;
    const baseIrrf = formSalario - inssCalc;
    const irrfCalc = baseIrrf > 2259.20 ? (baseIrrf * 0.075) : 0;
    const fgtsCalc = formCategoria === 101 ? formSalario * 0.08 : 0;
    const liquidoCalc = formSalario - inssCalc - irrfCalc;

    const novo1200: EventoRemuneracaoS1200 = {
      id: `s1200-emp${empresaId}-${Date.now()}`,
      empresaId,
      colaboradorId: Date.now(),
      cpfTrabalhador: formCpf,
      nomeTrabalhador: formNome,
      competencia,
      tipoInscricao: 1,
      numeroInscricao: '12.345.678/0001-90',
      tipoAmbiente: 1,
      indRetificacao: 1,
      demonstrativos: [
        {
          ideDmDev: `DMDEV-${competencia.replace('-', '')}-${Math.floor(Math.random() * 900 + 100)}`,
          codCateg: formCategoria,
          cbo: '2522-10',
          matricula: formMatricula || `MATR-${Date.now().toString().slice(-4)}`,
          cargo: formCargo || 'Colaborador',
          remunPerApur: [
            {
              id: `rub-sal-${Date.now()}`,
              codRubr: '1000',
              ideTabRubr: 'TABRUBR01',
              descricao: 'Salário Base Mensal',
              tipoRubrica: '1 - Vencimento',
              tpIncCP: '11',
              tpIncIRRF: '11',
              tpIncFGTS: formCategoria === 101 ? '11' : '00',
              qtdRubr: 30,
              fatorRubr: 1,
              vrRubr: formSalario
            },
            {
              id: `rub-inss-${Date.now()}`,
              codRubr: '9901',
              ideTabRubr: 'TABRUBR01',
              descricao: 'Contribuição Previdenciária Segurado (INSS)',
              tipoRubrica: '2 - Desconto',
              tpIncCP: '00',
              tpIncIRRF: '00',
              tpIncFGTS: '00',
              qtdRubr: 0,
              fatorRubr: 1,
              vrRubr: inssCalc
            },
            {
              id: `rub-irrf-${Date.now()}`,
              codRubr: '9902',
              ideTabRubr: 'TABRUBR01',
              descricao: 'Imposto de Renda Retido na Fonte (IRRF)',
              tipoRubrica: '2 - Desconto',
              tpIncCP: '00',
              tpIncIRRF: '00',
              tpIncFGTS: '00',
              qtdRubr: 0,
              fatorRubr: 1,
              vrRubr: irrfCalc
            }
          ],
          totalVencimentos: formSalario,
          totalDescontos: inssCalc + irrfCalc,
          valorLiquido: liquidoCalc,
          baseCalculoInss: formSalario,
          valorInssRetido: inssCalc,
          baseCalculoIrrf: baseIrrf,
          valorIrrfRetido: irrfCalc,
          baseCalculoFgts: formCategoria === 101 ? formSalario : 0,
          valorFgts: fgtsCalc
        }
      ],
      status: 'RASCUNHO'
    };

    const novo1210: EventoPagamentoS1210 = {
      id: `s1210-emp${empresaId}-${Date.now()}`,
      empresaId,
      colaboradorId: novo1200.colaboradorId,
      cpfBeneficiario: formCpf,
      nomeBeneficiario: formNome,
      dataPagamento: `${competencia}-05`,
      tipoPagamento: '1 - Folha Mensal',
      periodoReferencia: competencia,
      ideDmDev: novo1200.demonstrativos[0].ideDmDev,
      valorLiquidoPago: liquidoCalc,
      status: 'RASCUNHO'
    };

    dbService.salvarEventoRemuneracaoS1200(novo1200);
    dbService.salvarEventoPagamentoS1210(novo1210);

    setNotificacao({ tipo: 'sucesso', texto: `Colaborador ${formNome} cadastrado nos eventos S-1200 e S-1210.` });
    setModalNovoTrabalhador(false);
    setFormNome('');
    setFormCpf('');
    setFormMatricula('');
    carregarDados();
  };

  const handleDownloadXml = () => {
    if (!xmlVisualizado) return;
    const blob = new Blob([xmlVisualizado], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivoXml || 'esocial_evento.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopiarXml = () => {
    if (!xmlVisualizado) return;
    navigator.clipboard.writeText(xmlVisualizado);
    setNotificacao({ tipo: 'sucesso', texto: 'XML copiado para a área de transferência!' });
  };

  const eventosFiltrados1200 = resumo?.eventosS1200.filter(ev =>
    ev.nomeTrabalhador.toLowerCase().includes(busca.toLowerCase()) ||
    ev.cpfTrabalhador.includes(busca)
  ) || [];

  const eventosFiltrados1210 = resumo?.eventosS1210.filter(ev =>
    ev.nomeBeneficiario.toLowerCase().includes(busca.toLowerCase()) ||
    ev.cpfBeneficiario.includes(busca)
  ) || [];

  const colabSelecionado1200 = resumo?.eventosS1200.find(e => e.id === selectedColabId) || resumo?.eventosS1200[0];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-neutral-200 select-none">
      {/* Banner de Notificação */}
      {notificacao && (
        <div
          className={`flex items-center justify-between px-4 py-2 text-xs font-medium border-b animate-in fade-in duration-200 ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notificacao.tipo === 'sucesso' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{notificacao.texto}</span>
          </div>
          <button
            onClick={() => setNotificacao(null)}
            className="hover:opacity-75 transition-opacity px-2 py-0.5 rounded text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cabeçalho Superior Fluent Dark */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#181818]/90 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <FileCode size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-neutral-100 tracking-tight">
                eSocial S-1200 & S-1210 - Remuneração e Pagamentos da Folha
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded">
                MOS v. S-1.3 Oficial
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Geração de XML nativo validado por Schema XSD, assinatura digital e conciliação contábil da folha de pagamento
            </p>
          </div>
        </div>

        {/* Controles de Competência e Ações */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-neutral-400 font-medium">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={carregarDados}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#252525] border border-white/10 text-neutral-300 hover:bg-[#2c2c2c] hover:text-white transition-all"
            title="Recarregar Dados"
          >
            <RefreshCw size={14} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => setModalNovoTrabalhador(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950/50 transition-all"
          >
            <Plus size={14} />
            <span>Novo Colaborador</span>
          </button>

          <button
            onClick={handleIntegrarContabil}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50 transition-all"
            title="Integrar Folha no Livro Diário"
          >
            <FileCheck2 size={14} />
            <span>Integrar Contábil</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas e Totais Oficiais */}
      <div className="grid grid-cols-6 gap-3 p-4 border-b border-white/5 bg-[#141414]">
        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Trabalhadores</span>
            <Users size={14} className="text-teal-400" />
          </div>
          <div className="text-lg font-bold text-neutral-100 font-mono">
            {resumo?.totalColaboradores || 0}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Com demonstrativo ativo</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Folha Bruta</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            R$ {(resumo?.totalFolhaBruta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Total de vencimentos (S-1200)</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">INSS Retido</span>
            <Percent size={14} className="text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            R$ {(resumo?.totalInssRetido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Base para DCTFWeb</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">IRRF s/ Folha</span>
            <Receipt size={14} className="text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 font-mono">
            R$ {(resumo?.totalIrrfRetido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">DARF 0561 Retenção</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">FGTS (8%)</span>
            <ShieldCheck size={14} className="text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-400 font-mono">
            R$ {(resumo?.totalFgts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">FGTS Digital</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Líquido a Pagar</span>
            <Briefcase size={14} className="text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-300 font-mono">
            R$ {(resumo?.totalLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Evento S-1210</div>
        </div>
      </div>

      {/* Abas de Navegação Superior */}
      <div className="flex items-center justify-between px-5 pt-2 border-b border-white/10 bg-[#161616]">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('s1200')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 's1200'
                ? 'border-teal-500 text-teal-400 bg-teal-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            <span>S-1200 - Remuneração do Trabalhador</span>
          </button>

          <button
            onClick={() => setActiveTab('s1210')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 's1210'
                ? 'border-teal-500 text-teal-400 bg-teal-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <DollarSign size={14} />
            <span>S-1210 - Pagamentos de Rendimentos</span>
          </button>

          <button
            onClick={() => setActiveTab('visualizadorXml')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'visualizadorXml'
                ? 'border-teal-500 text-teal-400 bg-teal-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <FileCode size={14} />
            <span>Validador & Schema XML</span>
          </button>

          <button
            onClick={() => setActiveTab('holeriteEspelho')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'holeriteEspelho'
                ? 'border-teal-500 text-teal-400 bg-teal-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Printer size={14} />
            <span>Espelho A4 Holerite & Recibo</span>
          </button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="flex items-center space-x-2 bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1 mb-1">
          <Search size={13} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por colaborador ou CPF..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="bg-transparent text-xs text-neutral-200 focus:outline-none w-56 placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Conteúdo Principal das Abas */}
      <div className="flex-1 overflow-auto p-5">
        {activeTab === 's1200' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Eventos de Remuneração S-1200 por Trabalhador
                </h2>
                <p className="text-xs text-neutral-400">
                  Totalização de vencimentos, adicionais e descontos com identificadores de demonstrativo (ideDmDev)
                </p>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-white/10 font-semibold">
                    <th className="py-2.5 px-3">Trabalhador / CPF</th>
                    <th className="py-2.5 px-3">Matrícula / CBO</th>
                    <th className="py-2.5 px-3 text-right">Vencimentos</th>
                    <th className="py-2.5 px-3 text-right">INSS Segurado</th>
                    <th className="py-2.5 px-3 text-right">IRRF Retido</th>
                    <th className="py-2.5 px-3 text-right">FGTS (8%)</th>
                    <th className="py-2.5 px-3 text-right">Valor Líquido</th>
                    <th className="py-2.5 px-3 text-center">Status eSocial</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {eventosFiltrados1200.map(ev => {
                    const dem = ev.demonstrativos[0];
                    return (
                      <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-neutral-200">{ev.nomeTrabalhador}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">{ev.cpfTrabalhador}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-neutral-300 font-mono">{dem?.matricula || '-'}</div>
                          <div className="text-[11px] text-neutral-500">{dem?.cargo || '-'} ({dem?.cbo})</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-400">
                          R$ {(dem?.totalVencimentos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                          R$ {(dem?.valorInssRetido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                          R$ {(dem?.valorIrrfRetido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-cyan-400">
                          R$ {(dem?.valorFgts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-teal-300">
                          R$ {(dem?.valorLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              ev.status === 'TRANSMITIDO'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : ev.status === 'GERADO_XML'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center space-x-1.5">
                          <button
                            onClick={() => handleGerarXml('S-1200', ev.id)}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/20 transition-all"
                            title="Gerar XML do S-1200"
                          >
                            Gerar XML
                          </button>
                          <button
                            onClick={() => {
                              setSelectedColabId(ev.id);
                              setActiveTab('holeriteEspelho');
                            }}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-neutral-700/40 text-neutral-300 hover:bg-neutral-700 border border-white/10 transition-all"
                            title="Visualizar Holerite"
                          >
                            Holerite
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {eventosFiltrados1200.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-neutral-500 text-xs">
                        Nenhum evento S-1200 encontrado para a competência informada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Detalhamento das Rubricas do Primeiro Colaborador */}
            {colabSelecionado1200 && (
              <div className="p-4 rounded-xl border border-white/10 bg-[#161616] space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal size={16} className="text-teal-400" />
                    <span className="text-xs font-semibold text-neutral-200">
                      Detalhamento das Rubricas: {colabSelecionado1200.nomeTrabalhador} ({colabSelecionado1200.cpfTrabalhador})
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ID Demonstrativo: {colabSelecionado1200.demonstrativos[0]?.ideDmDev}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-emerald-400 mb-2">Vencimentos e Proventos</h3>
                    <div className="space-y-1.5">
                      {colabSelecionado1200.demonstrativos[0]?.remunPerApur
                        .filter(r => r.tipoRubrica === '1 - Vencimento')
                        .map(r => (
                          <div key={r.id} className="flex justify-between items-center text-xs p-2 rounded bg-[#1c1c1c] border border-white/5">
                            <div>
                              <div className="font-medium text-neutral-200">{r.descricao}</div>
                              <div className="text-[10px] text-neutral-500 font-mono">
                                Código: {r.codRubr} | Ref: {r.qtdRubr} | Incidência CP: {r.tpIncCP}
                              </div>
                            </div>
                            <span className="font-mono font-medium text-emerald-400">
                              R$ {r.vrRubr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-rose-400 mb-2">Descontos Oficiais</h3>
                    <div className="space-y-1.5">
                      {colabSelecionado1200.demonstrativos[0]?.remunPerApur
                        .filter(r => r.tipoRubrica === '2 - Desconto')
                        .map(r => (
                          <div key={r.id} className="flex justify-between items-center text-xs p-2 rounded bg-[#1c1c1c] border border-white/5">
                            <div>
                              <div className="font-medium text-neutral-200">{r.descricao}</div>
                              <div className="text-[10px] text-neutral-500 font-mono">
                                Código: {r.codRubr} | Incidência IRRF: {r.tpIncIRRF}
                              </div>
                            </div>
                            <span className="font-mono font-medium text-rose-400">
                              R$ {r.vrRubr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 's1210' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Eventos de Pagamentos de Rendimentos do Trabalho S-1210
                </h2>
                <p className="text-xs text-neutral-400">
                  Informação dos valores líquidos efetivamente pagos e data de quitação financeira
                </p>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-white/10 font-semibold">
                    <th className="py-2.5 px-3">Beneficiário / CPF</th>
                    <th className="py-2.5 px-3">Data Pagamento</th>
                    <th className="py-2.5 px-3">Tipo Pagamento</th>
                    <th className="py-2.5 px-3">Vínculo DMDEV</th>
                    <th className="py-2.5 px-3 text-right">Valor Líquido Pago</th>
                    <th className="py-2.5 px-3 text-center">Status eSocial</th>
                    <th className="py-2.5 px-3 text-center">Recibo de Transmissão</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {eventosFiltrados1210.map(ev => (
                    <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-neutral-200">{ev.nomeBeneficiario}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{ev.cpfBeneficiario}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-300">
                        {ev.dataPagamento}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 border border-white/5 text-neutral-300">
                          {ev.tipoPagamento}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400">
                        {ev.ideDmDev}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                        R$ {ev.valorLiquidoPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-400 text-[11px]">
                        {ev.reciboTransmissao || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleGerarXml('S-1210', ev.id)}
                          className="px-2 py-1 text-[11px] font-medium rounded bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/20 transition-all"
                        >
                          Gerar XML S-1210
                        </button>
                      </td>
                    </tr>
                  ))}
                  {eventosFiltrados1210.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500 text-xs">
                        Nenhum evento de pagamento S-1210 cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'visualizadorXml' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Visualizador de XML e Validação do Schema eSocial (MOS S-1.3)
                </h2>
                <p className="text-xs text-neutral-400">
                  Estrutura XML com namespace oficial, Id do evento e bloco Signature ICP-Brasil
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopiarXml}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#252525] border border-white/10 hover:bg-[#2c2c2c] text-neutral-200 transition-all"
                >
                  <Copy size={13} />
                  <span>Copiar XML</span>
                </button>
                <button
                  onClick={handleDownloadXml}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow transition-all"
                >
                  <Download size={13} />
                  <span>Baixar Arquivo XML</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                readOnly
                value={xmlVisualizado || '<!-- Nenhum XML gerado no momento. Clique em "Gerar XML" em um dos eventos. -->'}
                rows={20}
                className="w-full font-mono text-xs p-4 bg-[#141414] border border-white/10 rounded-xl text-teal-300 focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'holeriteEspelho' && colabSelecionado1200 && (
          <div className="max-w-4xl mx-auto p-8 rounded-xl bg-white text-neutral-900 shadow-2xl border border-neutral-300 print:m-0 print:p-0">
            {/* Cabeçalho do Holerite */}
            <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-4 mb-4">
              <div>
                <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
                  RECIBO DE PAGAMENTO DE SALÁRIO (HOLERITE)
                </h1>
                <p className="text-xs text-neutral-600 font-semibold uppercase">
                  EMPRESA MATRIZ EXEMPLO LTDA - CNPJ: 12.345.678/0001-90
                </p>
                <p className="text-[11px] text-neutral-500">
                  Emitido em conformidade com o Artigo 464 da CLT e eSocial v_S_01_03_00
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-neutral-100 px-3 py-1 rounded border border-neutral-300">
                  COMPETÊNCIA: {competencia}
                </span>
                <p className="text-[11px] text-neutral-500 mt-1">Data Pgto: 05/{competencia.split('-')[1]}/{competencia.split('-')[0]}</p>
              </div>
            </div>

            {/* Identificação do Colaborador */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-neutral-50 rounded border border-neutral-200 text-xs mb-4">
              <div>
                <span className="font-semibold text-neutral-500 block text-[10px]">NOME DO COLABORADOR:</span>
                <span className="font-bold text-neutral-800">{colabSelecionado1200.nomeTrabalhador}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500 block text-[10px]">CPF / MATRÍCULA:</span>
                <span className="font-mono text-neutral-800">{colabSelecionado1200.cpfTrabalhador} | {colabSelecionado1200.demonstrativos[0]?.matricula}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500 block text-[10px]">CARGO / CBO:</span>
                <span className="text-neutral-800">{colabSelecionado1200.demonstrativos[0]?.cargo} ({colabSelecionado1200.demonstrativos[0]?.cbo})</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500 block text-[10px]">CATEGORIA ESOCIAL:</span>
                <span className="font-mono text-neutral-800">{colabSelecionado1200.demonstrativos[0]?.codCateg}</span>
              </div>
            </div>

            {/* Tabela de Rubricas do Holerite */}
            <table className="w-full text-left text-xs border border-neutral-300 border-collapse mb-4">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 font-bold text-neutral-700">
                  <th className="p-2 w-16">Cód.</th>
                  <th className="p-2">Descrição da Rubrica</th>
                  <th className="p-2 text-center w-16">Ref.</th>
                  <th className="p-2 text-right w-28">Vencimentos</th>
                  <th className="p-2 text-right w-28">Descontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {colabSelecionado1200.demonstrativos[0]?.remunPerApur.map(r => (
                  <tr key={r.id}>
                    <td className="p-2 font-mono text-neutral-600">{r.codRubr}</td>
                    <td className="p-2 font-medium">{r.descricao}</td>
                    <td className="p-2 text-center font-mono">{r.qtdRubr || '-'}</td>
                    <td className="p-2 text-right font-mono font-medium text-emerald-800">
                      {r.tipoRubrica === '1 - Vencimento' ? `R$ ${r.vrRubr.toFixed(2)}` : ''}
                    </td>
                    <td className="p-2 text-right font-mono font-medium text-rose-800">
                      {r.tipoRubrica === '2 - Desconto' ? `R$ ${r.vrRubr.toFixed(2)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bases e Totais */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-neutral-100 rounded border border-neutral-300 text-xs mb-6">
              <div>
                <span className="font-semibold text-neutral-600 block text-[10px]">BASE CÁLC. INSS:</span>
                <span className="font-mono font-bold text-neutral-800">
                  R$ {colabSelecionado1200.demonstrativos[0]?.baseCalculoInss.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-neutral-600 block text-[10px]">BASE CÁLC. FGTS:</span>
                <span className="font-mono font-bold text-neutral-800">
                  R$ {colabSelecionado1200.demonstrativos[0]?.baseCalculoFgts.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-neutral-600 block text-[10px]">FGTS DO MÊS (8%):</span>
                <span className="font-mono font-bold text-neutral-800">
                  R$ {colabSelecionado1200.demonstrativos[0]?.valorFgts.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-neutral-600 block text-[10px]">BASE CÁLC. IRRF:</span>
                <span className="font-mono font-bold text-neutral-800">
                  R$ {colabSelecionado1200.demonstrativos[0]?.baseCalculoIrrf.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Totais Finais e Líquido */}
            <div className="flex justify-between items-center p-4 bg-neutral-800 text-white rounded mb-8">
              <div>
                <span className="text-xs text-neutral-300 block">Total de Proventos: R$ {colabSelecionado1200.demonstrativos[0]?.totalVencimentos.toFixed(2)}</span>
                <span className="text-xs text-neutral-300 block">Total de Descontos: R$ {colabSelecionado1200.demonstrativos[0]?.totalDescontos.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-teal-300 uppercase font-bold block">Valor Líquido a Receber</span>
                <span className="text-xl font-bold font-mono">
                  R$ {colabSelecionado1200.demonstrativos[0]?.valorLiquido.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Canhoto de Assinatura */}
            <div className="border-t-2 border-dashed border-neutral-300 pt-6 mt-6">
              <p className="text-[10px] text-neutral-500 mb-6 text-justify">
                Declaro ter recebido a quantia líquida discriminada neste recibo de pagamento, correspondente aos serviços prestados no período de referência, conferindo as horas e deduções legais efetuadas.
              </p>
              <div className="flex justify-between items-end text-xs text-neutral-700">
                <div className="border-t border-neutral-500 w-64 text-center pt-1">
                  Data: ____/____/________
                </div>
                <div className="border-t border-neutral-500 w-72 text-center pt-1">
                  Assinatura do Colaborador
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cadastro de Colaborador */}
      {modalNovoTrabalhador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 text-neutral-200">
            <h3 className="text-base font-semibold text-neutral-100 mb-1">Novo Colaborador no eSocial</h3>
            <p className="text-xs text-neutral-400 mb-4">Adiciona trabalhador com eventos S-1200 e S-1210 na competência ativa</p>

            <form onSubmit={handleSalvarNovoTrabalhador} className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={e => setFormNome(e.target.value)}
                  placeholder="Ex: Fernanda Lima"
                  className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">CPF</label>
                  <input
                    type="text"
                    required
                    value={formCpf}
                    onChange={e => setFormCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Matrícula</label>
                  <input
                    type="text"
                    value={formMatricula}
                    onChange={e => setFormMatricula(e.target.value)}
                    placeholder="MATR-00105"
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={formCargo}
                    onChange={e => setFormCargo(e.target.value)}
                    placeholder="Analista Contábil"
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Categoria eSocial</label>
                  <select
                    value={formCategoria}
                    onChange={e => setFormCategoria(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value={101}>101 - Empregado Geral (CLT)</option>
                    <option value={721}>721 - Contribuinte Individual (Pró-Labore)</option>
                    <option value={901}>901 - Estagiário</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Salário Base Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formSalario}
                  onChange={e => setFormSalario(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovoTrabalhador(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-700/50 hover:bg-neutral-700 text-neutral-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
