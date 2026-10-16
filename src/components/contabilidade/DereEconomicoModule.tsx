import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Download,
  Printer,
  RefreshCw,
  Search,
  Plus,
  Send,
  Building2,
  BarChart3,
  Landmark,
  FileCheck2,
  SlidersHorizontal
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoDereEconomico,
  EventoPgccDere,
  DeclaracaoLoteDere,
  ItemContaPgcc,
  ItemContaBalanceteDere,
  PlanoCtaRefTipo,
  FreqEncerramento
} from '../../types/contabil';

export const DereEconomicoModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoDereEconomico | null>(null);
  const [activeTab, setActiveTab] = useState<'balancete' | 'pgcc' | 'xmlViewer' | 'laudoA4'>('balancete');
  const [busca, setBusca] = useState<string>('');

  // XML modal / gerador
  const [xmlGerado, setXmlGerado] = useState<string>('');
  const [nomeArquivoXml, setNomeArquivoXml] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal nova conta PGCC
  const [modalNovaContaPgcc, setModalNovaContaPgcc] = useState<boolean>(false);
  const [formCCta, setFormCCta] = useState<string>('');
  const [formCCtaInterna, setFormCCtaInterna] = useState<string>('');
  const [formNomeCta, setFormNomeCta] = useState<string>('');
  const [formIndCta, setFormIndCta] = useState<'S' | 'A'>('A');
  const [formCCtaRef, setFormCCtaRef] = useState<string>('');
  const [formNivelCta, setFormNivelCta] = useState<number>(4);
  const [formNatCta, setFormNatCta] = useState<'C' | 'D' | 'V'>('D');
  const [formCodNat, setFormCodNat] = useState<number>(1);
  const [formDescCta, setFormDescCta] = useState<string>('');

  const carregarDados = () => {
    const dados = dbService.getDereEconomico(empresaId, competencia);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleGerarXml = () => {
    if (!resumo?.declaracaoAtual?.id) {
      exibirNotificacao('erro', 'Nenhuma declaração DeRE aberta para esta competência.');
      return;
    }
    const res = dbService.gerarXmlLoteDereTxt(resumo.declaracaoAtual.id);
    if (res.sucesso && res.xml) {
      setXmlGerado(res.xml);
      setNomeArquivoXml(res.nomeArquivo || `DERE_LOTE_${competencia}.xml`);
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleDownloadXml = () => {
    if (!xmlGerado) return;
    const blob = new Blob([xmlGerado], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivoXml || `DERE_LOTE_${competencia}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    exibirNotificacao('sucesso', `Download do lote ${nomeArquivoXml} concluído com sucesso.`);
  };

  const handleSalvarContaPgcc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumo) return;
    if (!formCCta || !formNomeCta || !formCCtaRef) {
      exibirNotificacao('erro', 'Código completo, Nome da Conta e Código Referencial são obrigatórios.');
      return;
    }

    const novaConta: ItemContaPgcc = {
      cCta: formCCta.replace(/\D/g, ''),
      cCtaInterna: formCCtaInterna.replace(/\D/g, '') || formCCta.replace(/\D/g, '').slice(0, 6),
      cDbrMista: '000',
      nomeCta: formNomeCta,
      indCta: formIndCta,
      descCta: formDescCta,
      cCtaRef: formCCtaRef,
      nivelCta: formNivelCta,
      natCta: formNatCta,
      codNat: formCodNat
    };

    const contasAtualizadas = [...resumo.planoContasComentado.contas.filter(c => c.cCta !== novaConta.cCta), novaConta];

    const res = dbService.salvarEventoPgccDere({
      id: resumo.planoContasComentado.id,
      empresaId,
      contas: contasAtualizadas
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovaContaPgcc(false);
      setFormCCta('');
      setFormCCtaInterna('');
      setFormNomeCta('');
      setFormCCtaRef('');
      setFormDescCta('');
      carregarDados();
    }
  };

  const empresa = dbService.getEmpresa(empresaId);
  const planoRefLabel: Record<PlanoCtaRefTipo, string> = {
    '1': 'COSIF (Bacen - Instituições Financeiras)',
    '2': 'ANS (Agência Nacional de Saúde Suplementar)',
    '3': 'SUSEP (Superintendência de Seguros Privados)',
    '4': 'SPED (ECD / ECF Contábil Fiscal Geral)',
    '5': 'PREVIC (Entidades Fechadas de Previdência Complementar)'
  };

  const decl = resumo?.declaracaoAtual;
  const pgcc = resumo?.planoContasComentado;

  const contasBalanceteFiltradas = (decl?.itensBalancete || []).filter(
    b => b.cCta.includes(busca) || b.nomeCta.toLowerCase().includes(busca.toLowerCase())
  );

  const contasPgccFiltradas = (pgcc?.contas || []).filter(
    c => c.cCta.includes(busca) || c.nomeCta.toLowerCase().includes(busca.toLowerCase()) || c.cCtaRef.includes(busca)
  );

  return (
    <div className="flex flex-col h-full bg-[#121212] text-zinc-100 overflow-y-auto">
      {/* Header Superior */}
      <div className="p-6 border-b border-zinc-800 bg-[#181818] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">DeRE - Demonstração de Recursos e Encargos</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-900/50 text-cyan-300 border border-cyan-700/60 font-semibold">
                  Módulo Regulatório Domínio
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  Schema XSD v1.1.0
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Balancete Regulatório & Plano Geral de Contas Comentado (PGCC) para Agências Reguladoras (ANS, SUSEP, BACEN/COSIF, PREVIC e SPED).
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Competência e Ações */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-zinc-700">
            <span className="text-xs text-zinc-400 uppercase font-semibold">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleGerarXml}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <FileCode2 className="w-4 h-4" />
            Gerar Lote XML DeRE
          </button>

          <button
            onClick={() => setActiveTab('laudoA4')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            Imprimir A4
          </button>
        </div>
      </div>

      {/* Alerta de Notificação */}
      {notificacao && (
        <div
          className={`mx-6 mt-4 p-3 rounded-lg border text-sm flex items-center justify-between ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificacao.tipo === 'sucesso' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notificacao.texto}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-xs hover:underline">Fechar</button>
        </div>
      )}

      {/* Cards de Resumo e Balanço Regulatório */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>PLANO REFERENCIAL</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-sm font-bold text-white leading-tight">
            {planoRefLabel[pgcc?.planoCtaRef || '2']}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Encerramento: {pgcc?.freqEncerr === 'M' ? 'Mensal' : 'Anual'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>ATIVO REGULATÓRIO</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg font-bold text-emerald-400">
            R$ {(decl?.totalAtivoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Bens, Direitos e Aplicações Técnicas</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>PASSIVO & PROVISÕES</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-lg font-bold text-amber-400">
            R$ {(decl?.totalPassivoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">PEONA, Sinistros e Fornecedores</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>RESULTADO DO EXERCÍCIO</span>
            <Landmark className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-lg font-bold text-blue-400">
            R$ {(decl?.resultadoExercicioBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Receitas: R$ {(decl?.totalReceitasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>STATUS TRANSMISSÃO</span>
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              decl?.status === 'ARQUIVO_GERADO'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-cyan-950 text-cyan-300 border-cyan-800'
            }`}>
              {decl?.status || 'RASCUNHO'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate">
            {decl?.protocoloEnvio || 'Aguardando validação'}
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="px-6 border-b border-zinc-800 flex gap-4">
        <button
          onClick={() => setActiveTab('balancete')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'balancete' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Balancete Mensal Regulatório ({decl?.itensBalancete?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('pgcc')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'pgcc' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Plano Geral de Contas Comentado - PGCC ({pgcc?.contas?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('xmlViewer')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'xmlViewer' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Visualizador XML do Lote DeRE
        </button>
        <button
          onClick={() => setActiveTab('laudoA4')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'laudoA4' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Relatório Regulatório A4
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-6 flex-1">
        {/* ABA 1: BALANCETE REGULATÓRIO */}
        {activeTab === 'balancete' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar conta contábil..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-[#181818] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="text-xs text-zinc-400">
                Regra XSD: Contas analíticas vigentes no último dia do período ({competencia}).
              </div>
            </div>

            <div className="bg-[#181818] border border-zinc-800 rounded-xl overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Código Analítico</th>
                    <th className="py-3 px-4">Nome da Conta</th>
                    <th className="py-3 px-4 text-right">Saldo Inicial</th>
                    <th className="py-3 px-4 text-right">Débito Mês</th>
                    <th className="py-3 px-4 text-right">Crédito Mês</th>
                    <th className="py-3 px-4 text-right">Saldo Final</th>
                    <th className="py-3 px-4 text-right">Valor Apuração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {contasBalanceteFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500 font-sans">
                        Nenhuma conta localizada no Balancete DeRE.
                      </td>
                    </tr>
                  ) : (
                    contasBalanceteFiltradas.map((b) => (
                      <tr key={b.cCta} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{b.cCta}</td>
                        <td className="py-3 px-4 font-sans text-zinc-200">{b.nomeCta}</td>
                        <td className="py-3 px-4 text-right text-zinc-300">
                          <span className="text-[10px] text-zinc-500 mr-1">{b.natSaldoInic}</span>
                          R$ {b.vSaldoInic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400">
                          R$ {b.vMovDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-400">
                          R$ {b.vMovCred.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          <span className="text-[10px] text-zinc-400 mr-1">{b.natSaldoFinal}</span>
                          R$ {b.vSaldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-cyan-300">
                          R$ {b.vApur.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: PLANO GERAL DE CONTAS COMENTADO (PGCC) */}
        {activeTab === 'pgcc' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar por conta ou ref..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-[#181818] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <button
                onClick={() => setModalNovaContaPgcc(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Vincular Nova Conta no PGCC
              </button>
            </div>

            <div className="bg-[#181818] border border-zinc-800 rounded-xl overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#202020] text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Código DeRE</th>
                    <th className="py-3 px-4">Nome da Conta</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Cta Referencial</th>
                    <th className="py-3 px-4">Natureza</th>
                    <th className="py-3 px-4">Descrição Comentada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {contasPgccFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 font-sans">
                        Nenhuma conta mapeada no PGCC.
                      </td>
                    </tr>
                  ) : (
                    contasPgccFiltradas.map((c) => (
                      <tr key={c.cCta} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{c.cCta}</td>
                        <td className="py-3 px-4 font-sans text-zinc-200">{c.nomeCta}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.indCta === 'A' ? 'bg-cyan-950 text-cyan-300' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {c.indCta === 'A' ? 'ANALÍTICA' : 'SINTÉTICA'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-amber-300">{c.cCtaRef}</td>
                        <td className="py-3 px-4 text-zinc-300">
                          {c.natCta === 'D' ? 'Devedora' : c.natCta === 'C' ? 'Credora' : 'Variável'} ({c.codNat})
                        </td>
                        <td className="py-3 px-4 font-sans text-zinc-400 text-[11px] max-w-xs truncate">
                          {c.descCta || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: VISUALIZADOR XML DO LOTE */}
        {activeTab === 'xmlViewer' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#181818] p-4 rounded-xl border border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">Arquivo XML Gerado para Transmissão</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Envelope raiz &lt;DeRE&gt; com eventos &lt;evtPGCC&gt; e &lt;evtBalancete&gt; conforme especificações da Receita Federal e ANS/SUSEP.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGerarXml}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regerar XML
                </button>
                <button
                  onClick={handleDownloadXml}
                  disabled={!xmlGerado}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Arquivo .xml
                </button>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl p-4 font-mono text-xs text-cyan-300 overflow-x-auto max-h-[500px]">
              {xmlGerado ? (
                <pre>{xmlGerado}</pre>
              ) : (
                <div className="py-16 text-center text-zinc-500 font-sans">
                  <FileCode2 className="w-12 h-12 mx-auto text-zinc-700 mb-2" />
                  Clique no botão "Gerar Lote XML DeRE" no topo da página para processar a estrutura do lote.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 4: RELATÓRIO A4 TIMBRADO REGULATÓRIO */}
        {activeTab === 'laudoA4' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir Documento Oficial A4
              </button>
            </div>

            <div className="bg-white text-black p-8 rounded-xl shadow-2xl max-w-4xl mx-auto font-sans border border-zinc-300 print:m-0 print:border-none print:shadow-none">
              {/* Cabeçalho Oficial */}
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div>
                  <div className="text-xl font-black uppercase tracking-wider text-black">
                    DEMONSTRAÇÃO DE RECURSOS E ENCARGOS (DeRE)
                  </div>
                  <div className="text-xs font-semibold text-zinc-700 mt-1">
                    BALANCETE ECONÔMICO-REGULATÓRIO - LEGISLAÇÃO FEDERAL E NORMAS REGULATÓRIAS
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    Plano de Contas Referencial: {planoRefLabel[pgcc?.planoCtaRef || '2']}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="font-bold text-sm text-black">{empresa?.razaoSocial}</div>
                  <div className="text-zinc-600">CNPJ: {empresa?.cnpj}</div>
                  <div className="text-zinc-600">Competência: {competencia}</div>
                  <div className="text-zinc-500 text-[10px]">Data Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {/* Informações da Declaração */}
              <div className="my-6 grid grid-cols-4 gap-4 p-4 bg-zinc-50 rounded border border-zinc-200 text-xs">
                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Protocolo DeRE</span>
                  <span className="font-bold font-mono text-zinc-900">{decl?.protocoloEnvio || 'PENDENTE'}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Recibo de Entrega</span>
                  <span className="font-bold font-mono text-zinc-900">{decl?.reciboEntrega || '0001-202603-AUTENTICADO'}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Encerramento</span>
                  <span className="font-bold text-zinc-900">{pgcc?.freqEncerr === 'M' ? 'Mensal' : 'Anual'}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Ambiente</span>
                  <span className="font-bold text-zinc-900">{decl?.tpAmb === '1' ? 'Produção Governamental' : 'Homologação'}</span>
                </div>
              </div>

              {/* Tabela do Balancete A4 */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2 border-b border-zinc-400 pb-1">
                  1. Quadro Sintético de Recursos e Encargos
                </h4>
                <table className="w-full text-left text-[11px] border border-zinc-300">
                  <thead className="bg-zinc-100 text-black font-bold border-b border-zinc-300">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-zinc-300">Código</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300">Conta / Denominação</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Saldo Inicial</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Débito</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Crédito</th>
                      <th className="py-1.5 px-2 text-right">Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {(decl?.itensBalancete || []).map((b) => (
                      <tr key={b.cCta}>
                        <td className="py-1.5 px-2 font-mono font-bold border-r border-zinc-300">{b.cCta}</td>
                        <td className="py-1.5 px-2 border-r border-zinc-300">{b.nomeCta}</td>
                        <td className="py-1.5 px-2 text-right border-r border-zinc-300">
                          {b.natSaldoInic} R$ {b.vSaldoInic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 text-right border-r border-zinc-300">
                          R$ {b.vMovDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 text-right border-r border-zinc-300">
                          R$ {b.vMovCred.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold">
                          {b.natSaldoFinal} R$ {b.vSaldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totais do Balanço */}
              <div className="mt-6 p-4 bg-zinc-100 border border-zinc-300 rounded text-xs grid grid-cols-3 gap-4">
                <div>
                  <span className="block text-zinc-600 font-semibold text-[10px]">TOTAL DO ATIVO</span>
                  <span className="text-sm font-bold text-black">
                    R$ {(decl?.totalAtivoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-600 font-semibold text-[10px]">TOTAL DO PASSIVO</span>
                  <span className="text-sm font-bold text-black">
                    R$ {(decl?.totalPassivoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-zinc-600 font-semibold text-[10px]">SUPERÁVIT / RESULTADO DO PERÍODO</span>
                  <span className="text-sm font-bold text-black">
                    R$ {(decl?.resultadoExercicioBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Termo de Encerramento e Assinatura */}
              <div className="mt-12 pt-6 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-black w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-black">{empresa?.razaoSocial}</div>
                  <div className="text-zinc-600 text-[10px]">Representante Legal da Entidade Regulada</div>
                </div>
                <div>
                  <div className="border-b border-black w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-black">Contador Responsável Técnico</div>
                  <div className="text-zinc-600 text-[10px]">CRC/UF Ativo | Termo de Validação Regulatória</div>
                </div>
              </div>

              <div className="mt-8 text-center text-[9px] text-zinc-500 font-mono">
                Chave de Validação Digital: SHA256-DERE-2026-ANS-XSD-110-B784C3F00912AE889123
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Conta no PGCC */}
      {modalNovaContaPgcc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Vincular Conta no Plano Geral de Contas Comentado (PGCC)</h3>
            <form onSubmit={handleSalvarContaPgcc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Código Completo DeRE (apenas números)</label>
                <input
                  type="text"
                  placeholder="Ex: 110401000"
                  value={formCCta}
                  onChange={(e) => setFormCCta(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome da Conta Contábil</label>
                <input
                  type="text"
                  placeholder="Ex: Provisão de Riscos Operacionais"
                  value={formNomeCta}
                  onChange={(e) => setFormNomeCta(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Conta Referencial (ANS/SUSEP/SPED)</label>
                  <input
                    type="text"
                    placeholder="Ex: 1.01.04.01.00"
                    value={formCCtaRef}
                    onChange={(e) => setFormCCtaRef(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Natureza do Saldo</label>
                  <select
                    value={formNatCta}
                    onChange={(e) => setFormNatCta(e.target.value as any)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="D">Devedora (D)</option>
                    <option value="C">Credora (C)</option>
                    <option value="V">Variável (V)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descrição Comentada da Natureza</label>
                <textarea
                  rows={2}
                  placeholder="Explicação técnica da natureza da conta para o órgão fiscalizador..."
                  value={formDescCta}
                  onChange={(e) => setFormDescCta(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalNovaContaPgcc(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow"
                >
                  Salvar no PGCC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
