import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Scale,
  FileText,
  FileCode,
  Printer,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Percent,
  Search,
  Copy,
  Download,
  ShieldCheck,
  Send,
  DollarSign,
  Briefcase,
  UserCheck,
  Calculator,
  Landmark,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ProcessoTrabalhistaS2500,
  TributosProcessoTrabalhistaS2501,
  ResumoProcessosTrabalhistasS2500S2501,
  TipoOrigemProcessoTrabalhista,
  VerbaProcessoTrabalhista
} from '../../types/contabil';

interface ProcessosProps {
  empresaId?: number;
}

export const ProcessosTrabalhistasESocialS2500Module: React.FC<ProcessosProps> = ({ empresaId = 1 }) => {
  const [activeTab, setActiveTab] = useState<'PROCESSOS_S2500' | 'TRIBUTOS_S2501' | 'RELATORIO_A4' | 'XML_PREVIEW'>('PROCESSOS_S2500');
  const [resumo, setResumo] = useState<ResumoProcessosTrabalhistasS2500S2501 | null>(null);
  const [selectedProcesso, setSelectedProcesso] = useState<ProcessoTrabalhistaS2500 | null>(null);
  const [selectedTributo, setSelectedTributo] = useState<TributosProcessoTrabalhistaS2501 | null>(null);
  const [xmlVisualizacao, setXmlVisualizacao] = useState<string>('');
  const [xmlTitulo, setXmlTitulo] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Form Novo Processo S-2500
  const [modalNovoProcesso, setModalNovoProcesso] = useState(false);
  const [formCnj, setFormCnj] = useState('');
  const [formOrigem, setFormOrigem] = useState<TipoOrigemProcessoTrabalhista>('1_JUSTICA_DO_TRABALHO');
  const [formVara, setFormVara] = useState('');
  const [formUf, setFormUf] = useState('SP');
  const [formMunicipio, setFormMunicipio] = useState('3550308');
  const [formDataSentenca, setFormDataSentenca] = useState('2026-03-20');
  const [formCpf, setFormCpf] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formMatricula, setFormMatricula] = useState('');
  const [formCargo, setFormCargo] = useState('');
  const [formDataAdm, setFormDataAdm] = useState('2023-01-10');
  const [formDataDem, setFormDataDem] = useState('2025-02-15');
  const [formValorRemun, setFormValorRemun] = useState<number>(20000);
  const [formValorIndeniz, setFormValorIndeniz] = useState<number>(10000);
  const [formFgtsJuizo, setFormFgtsJuizo] = useState<number>(2500);

  // Carregar dados
  const carregarDados = () => {
    const dados = dbService.getProcessosTrabalhistasS2500S2501(empresaId);
    setResumo(dados);
    if (dados.processos.length > 0 && !selectedProcesso) {
      setSelectedProcesso(dados.processos[0]);
    }
    if (dados.tributos.length > 0 && !selectedTributo) {
      setSelectedTributo(dados.tributos[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId]);

  const exibirAlerta = (texto: string, tipo: 'sucesso' | 'info' = 'sucesso') => {
    setFeedback({ tipo, texto });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleSalvarProcesso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCnj || !formNome || !formCpf) {
      alert('Preencha os campos obrigatórios (CNJ, Nome e CPF).');
      return;
    }

    const totalCondenacao = Number(formValorRemun) + Number(formValorIndeniz);
    const novoProc: ProcessoTrabalhistaS2500 = {
      id: `proc-s2500-${Date.now()}`,
      empresaId,
      numeroProcessoCnj: formCnj,
      origemProcesso: formOrigem,
      varaTribunal: formVara || 'Vara do Trabalho Competente',
      ufVara: formUf,
      municipioIbgeVara: formMunicipio,
      dataSentencaAcordo: formDataSentenca,
      cpfTrabalhador: formCpf,
      nomeTrabalhador: formNome,
      matriculaOriginal: formMatricula || 'MAT-0001',
      cargoFuncao: formCargo || 'Colaborador',
      dataAdmissaoOriginal: formDataAdm,
      dataDemissaoOriginal: formDataDem,
      houveReconhecimentoVinculo: false,
      motivoDesligamentoJudicial: 'Acordo Homologado em Juízo',
      valorTotalCondenacaoBRL: totalCondenacao,
      valorTotalRemuneratorioBRL: Number(formValorRemun),
      valorTotalIndenizatorioBRL: Number(formValorIndeniz),
      fgtsDepositadoEmJuizoBRL: Number(formFgtsJuizo),
      verbas: [
        {
          id: `vb-rem-${Date.now()}`,
          codigoRubrica: '1001',
          descricaoVerba: 'Diferenças Salariais e Reflexos em DSR/Férias/13º',
          tipoNatureza: 'REMUNERATORIA',
          valorBRL: Number(formValorRemun),
          incidenciaInss: true,
          incidenciaFgts: true,
          incidenciaIrrf: true,
          periodoReferenciaMesAno: '02/2025'
        },
        {
          id: `vb-ind-${Date.now()}`,
          codigoRubrica: '2001',
          descricaoVerba: 'Verbas Indenizatórias (Danos Morais / Multa Art. 477)',
          tipoNatureza: 'INDENIZATORIA',
          valorBRL: Number(formValorIndeniz),
          incidenciaInss: false,
          incidenciaFgts: false,
          incidenciaIrrf: false,
          periodoReferenciaMesAno: '02/2025'
        }
      ],
      statusTransmissao: 'PENDENTE'
    };

    // Criar também registro S-2501 correspondente
    const inssSeg = Number(formValorRemun) * 0.11;
    const inssPatr = Number(formValorRemun) * 0.20;
    const inssRat = Number(formValorRemun) * 0.02;
    const inssTerc = Number(formValorRemun) * 0.058;
    const totInss = inssSeg + inssPatr + inssRat + inssTerc;

    const baseIrrf = Number(formValorRemun) - inssSeg - (Number(formValorRemun) * 0.15); // dedução honorários
    const irrfDevido = Math.max(0, baseIrrf * 0.075); // alíquota efetiva estimada RRA

    const novoTrib: TributosProcessoTrabalhistaS2501 = {
      id: `trib-s2501-${Date.now()}`,
      empresaId,
      processoId: novoProc.id,
      numeroProcessoCnj: formCnj,
      competenciaEnvio: formDataSentenca.slice(0, 7),
      cpfTrabalhador: formCpf,
      nomeTrabalhador: formNome,
      baseCalculoInssSeguradoBRL: Number(formValorRemun),
      inssSeguradoRetidoBRL: inssSeg,
      baseCalculoInssPatronalBRL: Number(formValorRemun),
      inssPatronalDevidoBRL: inssPatr,
      inssRatDevidoBRL: inssRat,
      inssTerceirosDevidoBRL: inssTerc,
      totalInssRecolherBRL: totInss,
      baseCalculoIrrfRraBRL: Number(formValorRemun),
      quantidadeMesesRra: 12,
      deducaoPrevidenciaOficialIrrfBRL: inssSeg,
      deducaoDespesasJudiciaisAdvogadoBRL: Number(formValorRemun) * 0.15,
      baseCalculoEfetivaIrrfRraBRL: baseIrrf,
      valorIrrfDevidoRraBRL: irrfDevido,
      darfCodigoReceita: '6092',
      dataVencimentoDarf: `${formDataSentenca.slice(0, 4)}-${String(Number(formDataSentenca.slice(5, 7)) + 1).padStart(2, '0')}-20`,
      statusTransmissao: 'PENDENTE'
    };

    dbService.salvarProcessoTrabalhistaS2500(novoProc);
    dbService.salvarTributosProcessoTrabalhistaS2501(novoTrib);

    setModalNovoProcesso(false);
    carregarDados();
    exibirAlerta(`Processo Trabalhista CNJ ${formCnj} cadastrado com sucesso.`);
  };

  const handleTransmitirS2500 = (processoId: string) => {
    const res = dbService.gerarXmlS2500(processoId);
    if (res.sucesso) {
      exibirAlerta(res.mensagem);
      setXmlVisualizacao(res.xml);
      setXmlTitulo(`eSocial S-2500 - Processo CNJ: ${selectedProcesso?.numeroProcessoCnj}`);
      carregarDados();
    }
  };

  const handleTransmitirS2501 = (tributoId: string) => {
    const res = dbService.gerarXmlS2501(tributoId);
    if (res.sucesso) {
      exibirAlerta(res.mensagem);
      setXmlVisualizacao(res.xml);
      setXmlTitulo(`eSocial S-2501 - Tributos CNJ: ${selectedTributo?.numeroProcessoCnj}`);
      carregarDados();
    }
  };

  const handleVisualizarXml = (xml: string, titulo: string) => {
    setXmlVisualizacao(xml);
    setXmlTitulo(titulo);
    setActiveTab('XML_PREVIEW');
  };

  const copiarXml = () => {
    navigator.clipboard.writeText(xmlVisualizacao);
    exibirAlerta('XML copiado para a área de transferência!');
  };

  const baixarXml = () => {
    const element = document.createElement('a');
    const file = new Blob([xmlVisualizacao], { type: 'text/xml' });
    element.href = URL.createObjectURL(file);
    element.download = `${xmlTitulo.replace(/[^a-zA-Z0-9]/g, '_')}.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    exibirAlerta('Download do XML iniciado.');
  };

  return (
    <div className="p-6 bg-[#121212] min-h-screen text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Gavel className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                eSocial S-2500 / S-2501
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-400 font-mono">
                  Processos Trabalhistas & Tributos
                </span>
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Gestão judicial, segregação de verbas indenizatórias vs remuneratórias, IRRF RRA Art. 12-A e DARF 6092
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalNovoProcesso(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg shadow-lg shadow-amber-600/20 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Processo S-2500
          </button>
          <button
            onClick={carregarDados}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-all"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between animate-fadeIn text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
          <span className="text-xs text-emerald-500 uppercase tracking-wider font-semibold">Sucesso</span>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Processos Trabalhistas</span>
            <Gavel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {resumo?.totalProcessos || 0}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            S-2500 na competência
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>Total Condenações</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">
            R$ {(resumo?.totalCondenacoesBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Remuneratório + Indenizatório
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>INSS Judicial (S-2501)</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-400">
            R$ {(resumo?.totalInssJudicialBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Segurado + Patronal + Terceiros
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <span>IRRF RRA (Art. 12-A)</span>
            <Landmark className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            R$ {(resumo?.totalIrrfRraJudicialBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            DARF 6092 Acumulados
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-zinc-800 mt-8 space-x-2">
        <button
          onClick={() => setActiveTab('PROCESSOS_S2500')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'PROCESSOS_S2500'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Gavel className="w-4 h-4" />
          Processos S-2500 ({resumo?.processos.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('TRIBUTOS_S2501')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'TRIBUTOS_S2501'
              ? 'border-sky-500 text-sky-400 bg-sky-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          Tributos S-2501 ({resumo?.tributos.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('RELATORIO_A4')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'RELATORIO_A4'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Demonstrativo A4 Timbrado
        </button>

        <button
          onClick={() => setActiveTab('XML_PREVIEW')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'XML_PREVIEW'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Visualizador XML eSocial
        </button>
      </div>

      {/* TAB CONTENT: S-2500 */}
      {activeTab === 'PROCESSOS_S2500' && (
        <div className="mt-6 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-amber-400" />
                  Processos Trabalhistas Cadastrados (Evento S-2500)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Decisões com trânsito em julgado, acordos homologados pelo Judiciário ou CCP/NINTER
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Processo CNJ</th>
                    <th className="px-4 py-3">Trabalhador</th>
                    <th className="px-4 py-3">Vara / Tribunal</th>
                    <th className="px-4 py-3 text-right">Verbas Remun.</th>
                    <th className="px-4 py-3 text-right">Verbas Indeniz.</th>
                    <th className="px-4 py-3 text-right">Total Acordo</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                  {resumo?.processos.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProcesso(p)}
                      className={`hover:bg-zinc-800/30 cursor-pointer transition-colors ${
                        selectedProcesso?.id === p.id ? 'bg-amber-950/20 border-l-2 border-amber-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-amber-300">{p.numeroProcessoCnj}</td>
                      <td className="px-4 py-3 font-sans font-medium text-white">{p.nomeTrabalhador}</td>
                      <td className="px-4 py-3 font-sans text-zinc-400 max-w-xs truncate">{p.varaTribunal}</td>
                      <td className="px-4 py-3 text-right text-emerald-400">
                        R$ {p.valorTotalRemuneratorioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-400">
                        R$ {p.valorTotalIndenizatorioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white">
                        R$ {p.valorTotalCondenacaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                            p.statusTransmissao === 'TRANSMITIDO'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {p.statusTransmissao}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransmitirS2500(p.id);
                            }}
                            className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded border border-amber-500/30 text-xs flex items-center gap-1 transition-all"
                            title="Transmitir S-2500 ao eSocial"
                          >
                            <Send className="w-3 h-3" />
                            Transmitir
                          </button>
                          {p.xmlGerado && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVisualizarXml(p.xmlGerado!, `eSocial S-2500 - CNJ ${p.numeroProcessoCnj}`);
                              }}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs flex items-center gap-1 transition-all"
                              title="Visualizar XML"
                            >
                              <FileCode className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETALHES DO PROCESSO SELECIONADO */}
          {selectedProcesso && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="font-semibold text-white text-base flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-400" />
                    Detalhamento do Processo: {selectedProcesso.numeroProcessoCnj}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Trabalhador: {selectedProcesso.nomeTrabalhador} ({selectedProcesso.cpfTrabalhador}) | Matrícula: {selectedProcesso.matriculaOriginal}
                  </p>
                </div>
                {selectedProcesso.reciboS2500 && (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Recibo eSocial</span>
                    <span className="font-mono text-xs text-emerald-400 font-semibold">{selectedProcesso.reciboS2500}</span>
                  </div>
                )}
              </div>

              {/* VERBAS DISCRIMINADAS */}
              <div className="mt-4">
                <h5 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                  Verbas Homologadas e Incidências Tributárias
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedProcesso.verbas.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-amber-300">
                          Rubrica {v.codigoRubrica}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            v.tipoNatureza === 'REMUNERATORIA'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {v.tipoNatureza}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white mt-1">{v.descricaoVerba}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2 text-xs">
                        <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                          <span>INSS: {v.incidenciaInss ? 'SIM' : 'NÃO'}</span>
                          <span>FGTS: {v.incidenciaFgts ? 'SIM' : 'NÃO'}</span>
                          <span>IRRF: {v.incidenciaIrrf ? 'SIM' : 'NÃO'}</span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          R$ {v.valorBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: S-2501 (TRIBUTOS JUDICIAIS) */}
      {activeTab === 'TRIBUTOS_S2501' && (
        <div className="mt-6 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-sky-400" />
                  Tributos Decorrentes de Processos Trabalhistas (Evento S-2501)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Apuração de contribuições previdenciárias e retenção de IRRF sobre RRA (Art. 12-A Lei 7.713/88)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-800/40 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Processo CNJ</th>
                    <th className="px-4 py-3">Trabalhador</th>
                    <th className="px-4 py-3 text-right">Base INSS</th>
                    <th className="px-4 py-3 text-right">INSS Total</th>
                    <th className="px-4 py-3 text-center">Meses RRA</th>
                    <th className="px-4 py-3 text-right">IRRF RRA</th>
                    <th className="px-4 py-3 text-center">DARF</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                  {resumo?.tributos.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTributo(t)}
                      className={`hover:bg-zinc-800/30 cursor-pointer transition-colors ${
                        selectedTributo?.id === t.id ? 'bg-sky-950/20 border-l-2 border-sky-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-sky-300">{t.numeroProcessoCnj}</td>
                      <td className="px-4 py-3 font-sans font-medium text-white">{t.nomeTrabalhador}</td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        R$ {t.baseCalculoInssPatronalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-sky-400">
                        R$ {t.totalInssRecolherBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center text-amber-300 font-bold">{t.quantidadeMesesRra} m</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">
                        R$ {t.valorIrrfDevidoRraBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold">
                          {t.darfCodigoReceita}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransmitirS2501(t.id);
                            }}
                            className="px-2 py-1 bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 rounded border border-sky-500/30 text-xs flex items-center gap-1 transition-all"
                            title="Transmitir S-2501 ao eSocial"
                          >
                            <Send className="w-3 h-3" />
                            Transmitir
                          </button>
                          {t.xmlGerado && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVisualizarXml(t.xmlGerado!, `eSocial S-2501 - CNJ ${t.numeroProcessoCnj}`);
                              }}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs flex items-center gap-1 transition-all"
                              title="Visualizar XML"
                            >
                              <FileCode className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETALHES DO CÁLCULO TRIBUTÁRIO */}
          {selectedTributo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD PREVIDÊNCIA */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Encargos Previdenciários (INSS Judicial)
                </h4>
                <div className="space-y-2 mt-3 font-mono text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Base de Cálculo Previdenciária:</span>
                    <span className="text-white">R$ {selectedTributo.baseCalculoInssPatronalBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>INSS Segurado Retido:</span>
                    <span className="text-rose-400">- R$ {selectedTributo.inssSeguradoRetidoBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>INSS Patronal (20%):</span>
                    <span className="text-white">R$ {selectedTributo.inssPatronalDevidoBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>GILRAT / FAP (2%):</span>
                    <span className="text-white">R$ {selectedTributo.inssRatDevidoBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Outras Entidades / Terceiros (5,8%):</span>
                    <span className="text-white">R$ {selectedTributo.inssTerceirosDevidoBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm font-bold">
                    <span className="text-sky-300">Total INSS a Recolher:</span>
                    <span className="text-sky-400">R$ {selectedTributo.totalInssRecolherBRL.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* CARD IRRF RRA */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  IRRF sobre RRA (Art. 12-A Lei 7.713/88)
                </h4>
                <div className="space-y-2 mt-3 font-mono text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Rendimentos Brutos Tributáveis:</span>
                    <span className="text-white">R$ {selectedTributo.baseCalculoIrrfRraBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Quantidade de Meses (NM):</span>
                    <span className="text-amber-400 font-bold">{selectedTributo.quantidadeMesesRra} meses</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Dedução Previdência Oficial:</span>
                    <span className="text-emerald-400">- R$ {selectedTributo.deducaoPrevidenciaOficialIrrfBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Dedução Honorários Advocatícios:</span>
                    <span className="text-emerald-400">- R$ {selectedTributo.deducaoDespesasJudiciaisAdvogadoBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Base Efetiva RRA:</span>
                    <span className="text-white">R$ {selectedTributo.baseCalculoEfetivaIrrfRraBRL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm font-bold">
                    <span className="text-emerald-300">IRRF DARF 6092 Devido:</span>
                    <span className="text-emerald-400">R$ {selectedTributo.valorIrrfDevidoRraBRL.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RELATÓRIO A4 */}
      {activeTab === 'RELATORIO_A4' && selectedProcesso && (
        <div className="mt-6 bg-white text-zinc-900 p-8 rounded-xl shadow-2xl max-w-4xl mx-auto font-sans">
          {/* CABEÇALHO TIMBRADO */}
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-900">
                Demonstrativo Oficial de Processo Trabalhista e Encargos
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Instrução para eSocial Eventos S-2500 / S-2501 e DCTFWeb Trabalhista
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold px-2 py-1 bg-zinc-100 border border-zinc-300 rounded">
                CNJ: {selectedProcesso.numeroProcessoCnj}
              </span>
            </div>
          </div>

          {/* DADOS DA RECLAMAÇÃO */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded">
              <span className="font-bold text-zinc-500 uppercase block">Reclamante</span>
              <span className="text-sm font-semibold text-zinc-900">{selectedProcesso.nomeTrabalhador}</span>
              <span className="block text-zinc-600 mt-0.5 font-mono">CPF: {selectedProcesso.cpfTrabalhador}</span>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded">
              <span className="font-bold text-zinc-500 uppercase block">Órgão Julgador</span>
              <span className="text-sm font-semibold text-zinc-900">{selectedProcesso.varaTribunal}</span>
              <span className="block text-zinc-600 mt-0.5 font-mono">Data Sentença: {selectedProcesso.dataSentencaAcordo}</span>
            </div>
          </div>

          {/* QUADRO DE VERBAS */}
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
              Discriminação de Verbas Homologadas
            </h4>
            <table className="w-full text-xs text-left border border-zinc-300">
              <thead className="bg-zinc-100 text-zinc-700 uppercase font-semibold border-b border-zinc-300">
                <tr>
                  <th className="p-2">Rubrica</th>
                  <th className="p-2">Descrição da Verba</th>
                  <th className="p-2 text-center">Natureza</th>
                  <th className="p-2 text-center">Incidência INSS</th>
                  <th className="p-2 text-right">Valor Homologado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {selectedProcesso.verbas.map((v) => (
                  <tr key={v.id}>
                    <td className="p-2 font-bold">{v.codigoRubrica}</td>
                    <td className="p-2 font-sans">{v.descricaoVerba}</td>
                    <td className="p-2 text-center">
                      <span className="font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[10px]">
                        {v.tipoNatureza}
                      </span>
                    </td>
                    <td className="p-2 text-center">{v.incidenciaInss ? 'SIM' : 'NÃO'}</td>
                    <td className="p-2 text-right font-bold">R$ {v.valorBRL.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-zinc-100 font-bold">
                  <td colSpan={4} className="p-2 text-right uppercase">Total da Condenação / Acordo:</td>
                  <td className="p-2 text-right">R$ {selectedProcesso.valorTotalCondenacaoBRL.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALIZADORES RESUMIDOS */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">Total Remuneratório</span>
              <span className="font-mono text-sm font-bold text-zinc-900">
                R$ {selectedProcesso.valorTotalRemuneratorioBRL.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">Total Indenizatório</span>
              <span className="font-mono text-sm font-bold text-zinc-900">
                R$ {selectedProcesso.valorTotalIndenizatorioBRL.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-zinc-100 rounded border border-zinc-200">
              <span className="text-zinc-600 block">FGTS Depositado em Juízo</span>
              <span className="font-mono text-sm font-bold text-zinc-900">
                R$ {selectedProcesso.fgtsDepositadoEmJuizoBRL.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ASSINATURAS */}
          <div className="mt-12 pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs text-zinc-600">
            <div>
              <div className="border-b border-zinc-400 pb-1 mb-1 font-semibold text-zinc-800">
                EMPREGADOR / RESPONSÁVEL LEGAL
              </div>
              <span>Contábil Studio Pro - Sistema Integrado de Gestão</span>
            </div>
            <div>
              <div className="border-b border-zinc-400 pb-1 mb-1 font-semibold text-zinc-800">
                CONTABILIDADE & ASSESSORIA JURÍDICA
              </div>
              <span>CRC / OAB Vinculados</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: XML PREVIEW */}
      {activeTab === 'XML_PREVIEW' && (
        <div className="mt-6 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">{xmlTitulo || 'Estrutura XML eSocial'}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copiarXml}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button
                onClick={baixarXml}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar XML
              </button>
            </div>
          </div>
          <div className="p-4 bg-zinc-950 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-[550px] leading-relaxed">
            <pre>{xmlVisualizacao || 'Nenhum XML gerado ou selecionado.'}</pre>
          </div>
        </div>
      )}

      {/* MODAL NOVO PROCESSO S-2500 */}
      {modalNovoProcesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                Cadastrar Processo Trabalhista (S-2500)
              </h3>
              <button
                onClick={() => setModalNovoProcesso(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSalvarProcesso} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Número do Processo (CNJ)</label>
                  <input
                    type="text"
                    value={formCnj}
                    onChange={(e) => setFormCnj(e.target.value)}
                    placeholder="0001045-88.2025.5.02.0014"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Origem do Processo</label>
                  <select
                    value={formOrigem}
                    onChange={(e) => setFormOrigem(e.target.value as TipoOrigemProcessoTrabalhista)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  >
                    <option value="1_JUSTICA_DO_TRABALHO">1 - Justiça do Trabalho</option>
                    <option value="2_CCP_COMISSAO_CONCILIACAO_PREVIA">2 - CCP (Comissão de Conciliação Prévia)</option>
                    <option value="3_NINTER_NUCLEO_INTERSINDICAL">3 - NINTER (Núcleo Intersindical)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Vara / Tribunal</label>
                  <input
                    type="text"
                    value={formVara}
                    onChange={(e) => setFormVara(e.target.value)}
                    placeholder="14ª Vara do Trabalho de São Paulo - TRT 2"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Data Sentença / Acordo</label>
                  <input
                    type="date"
                    value={formDataSentenca}
                    onChange={(e) => setFormDataSentenca(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Nome do Trabalhador</label>
                  <input
                    type="text"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Nome completo do reclamante"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">CPF do Trabalhador</label>
                  <input
                    type="text"
                    value={formCpf}
                    onChange={(e) => setFormCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Matrícula</label>
                  <input
                    type="text"
                    value={formMatricula}
                    onChange={(e) => setFormMatricula(e.target.value)}
                    placeholder="MAT-0010"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={formCargo}
                    onChange={(e) => setFormCargo(e.target.value)}
                    placeholder="Cargo contratual"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              {/* SEGREGAÇÃO DE VALORES */}
              <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800 space-y-3">
                <span className="font-semibold text-white block">Valores do Acordo / Condenação</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Verbas Remuneratórias (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formValorRemun}
                      onChange={(e) => setFormValorRemun(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-emerald-400 font-mono font-bold"
                    />
                    <span className="text-[10px] text-zinc-500">Incide INSS/FGTS/IRRF</span>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Verbas Indenizatórias (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formValorIndeniz}
                      onChange={(e) => setFormValorIndeniz(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-amber-400 font-mono font-bold"
                    />
                    <span className="text-[10px] text-zinc-500">Sem incidência tributária</span>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">FGTS em Juízo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formFgtsJuizo}
                      onChange={(e) => setFormFgtsJuizo(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono"
                    />
                    <span className="text-[10px] text-zinc-500">Depósito judicial</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalNovoProcesso(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium shadow-md shadow-amber-600/20"
                >
                  Salvar Processo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
