import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Layers,
  Percent,
  Download,
  Copy,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { ItemFci, ResumoFci, FaixaConteudoImportacao } from '../../types/contabil';

export const FciModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoFci | null>(null);
  const [activeTab, setActiveTab] = useState<'painel' | 'itens' | 'arquivoTxt' | 'laudoA4'>('painel');
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroFaixa, setFiltroFaixa] = useState<string>('TODAS');

  // Modals e Formulários
  const [modalNovoItem, setModalNovoItem] = useState<boolean>(false);
  const [formCodigo, setFormCodigo] = useState<string>('');
  const [formDescricao, setFormDescricao] = useState<string>('');
  const [formNcm, setFormNcm] = useState<string>('');
  const [formUnidade, setFormUnidade] = useState<string>('UN');
  const [formParcelaImportada, setFormParcelaImportada] = useState<number>(0);
  const [formSaidaInterestadual, setFormSaidaInterestadual] = useState<number>(0);
  const [formObservacoes, setFormObservacoes] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [conteudoTxt, setConteudoTxt] = useState<string>('');

  const carregarDados = () => {
    const dados = dbService.getFci(empresaId, competencia);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCodigo || !formDescricao || formSaidaInterestadual <= 0) {
      exibirNotificacao('erro', 'Preencha o código, descrição e valor de saída interestadual maior que zero.');
      return;
    }

    const res = dbService.salvarItemFci({
      empresaId,
      codigoItem: formCodigo,
      descricaoItem: formDescricao,
      ncm: formNcm,
      unidadeMedida: formUnidade,
      valorParcelaImportadaBRL: formParcelaImportada,
      valorSaidaInterestadualBRL: formSaidaInterestadual,
      observacoes: formObservacoes
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovoItem(false);
      setFormCodigo('');
      setFormDescricao('');
      setFormNcm('');
      setFormParcelaImportada(0);
      setFormSaidaInterestadual(0);
      setFormObservacoes('');
      carregarDados();
    }
  };

  const handleExcluirItem = (id: string) => {
    if (confirm('Deseja realmente remover esta apuração de FCI?')) {
      const res = dbService.excluirItemFci(id);
      if (res.sucesso) {
        exibirNotificacao('sucesso', res.mensagem);
        carregarDados();
      }
    }
  };

  const handleGerarArquivoTxt = () => {
    const res = dbService.gerarArquivoFciTxt(empresaId, competencia);
    if (res.sucesso) {
      setConteudoTxt(res.arquivo);
      setActiveTab('arquivoTxt');
      exibirNotificacao('sucesso', res.mensagem);
    }
  };

  const copiarArquivoParaClipboard = () => {
    navigator.clipboard.writeText(conteudoTxt);
    exibirNotificacao('sucesso', 'Conteúdo magnético copiado para a área de transferência.');
  };

  const baixarArquivoTxt = () => {
    const blob = new Blob([conteudoTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FCI_${competencia.replace('-', '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    exibirNotificacao('sucesso', 'Arquivo magnético baixado com sucesso.');
  };

  const itensFiltrados = (resumo?.itens || []).filter(item => {
    const matchesTexto = item.codigoItem.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      item.descricaoItem.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      item.ncm.includes(filtroTexto);
    const matchesFaixa = filtroFaixa === 'TODAS' || item.faixaConteudo === filtroFaixa;
    return matchesTexto && matchesFaixa;
  });

  return (
    <div className="h-full flex flex-col bg-[#121212] text-neutral-200">
      {/* 1. Header do Módulo */}
      <div className="p-4 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Globe size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-wide">FCI - Ficha de Conteúdo de Importação</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Res. SF 13/2012
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-neutral-800 text-neutral-300 border border-white/10">
                Convênio ICMS 38/2013
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Apuração do percentual de conteúdo de importação (CI), enquadramento de alíquotas interestaduais (4% vs 12%) e controle de tag &lt;nFCI&gt;
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-xs text-neutral-400 mr-2">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setModalNovoItem(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Plus size={15} />
            <span>Calcular Novo Item</span>
          </button>

          <button
            onClick={handleGerarArquivoTxt}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <FileCode size={15} />
            <span>Gerar Arquivo SEFAZ</span>
          </button>
        </div>
      </div>

      {/* Notificação Toast */}
      {notificacao && (
        <div className={`p-3 text-xs font-medium border-b flex items-center justify-between transition-all ${
          notificacao.tipo === 'sucesso' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {notificacao.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notificacao.texto}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. KPIs Rápidos de Conformidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-[#141414] border-b border-white/5">
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total de Itens com FCI</span>
            <Layers size={15} className="text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">{resumo?.totalItensFci || 0}</div>
          <div className="text-[10px] text-neutral-500 mt-1">Produtos industrializados no período</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Conteúdo Importado &gt; 40% (Alíquota 4%)</span>
            <Percent size={15} className="text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">{resumo?.totalItensComAliquota4 || 0}</div>
          <div className="text-[10px] text-rose-400/70 mt-1">Obrigatoriedade de ICMS 4% interestadual</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Conteúdo &le; 40% (Alíquota Normal)</span>
            <ShieldCheck size={15} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{resumo?.totalItensComAliquotaNormal || 0}</div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Alíquotas padrão de 7% ou 12%</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Média de Conteúdo de Importação</span>
            <Globe size={15} className="text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300">
            {resumo?.mediaConteudoImportacaoPercentual ? `${resumo.mediaConteudoImportacaoPercentual.toFixed(2)}%` : '0,00%'}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Média ponderada do mix de saídas</div>
        </div>
      </div>

      {/* 3. Navegação por Abas */}
      <div className="px-4 border-b border-white/10 bg-[#161616] flex space-x-1">
        <button
          onClick={() => setActiveTab('painel')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'painel' ? 'border-indigo-500 text-indigo-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Itens & Apurações da FCI
        </button>
        <button
          onClick={() => setActiveTab('arquivoTxt')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'arquivoTxt' ? 'border-indigo-500 text-indigo-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Arquivo Magnético (.txt SEFAZ)
        </button>
        <button
          onClick={() => setActiveTab('laudoA4')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'laudoA4' ? 'border-indigo-500 text-indigo-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Laudo Oficial A4 &amp; Memória de Cálculo
        </button>
      </div>

      {/* 4. Conteúdo das Abas */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'painel' && (
          <div className="space-y-4">
            {/* Barra de Filtros */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181818] p-3 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <Search size={16} className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filtrar por código, descrição ou NCM..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
                  <span>Faixa de Conteúdo:</span>
                  <select
                    value={filtroFaixa}
                    onChange={(e) => setFiltroFaixa(e.target.value)}
                    className="bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="TODAS">Todas as Faixas</option>
                    <option value="SUPERIOR_40_PORCENTO">Superior a 40% (ICMS 4%)</option>
                    <option value="ATE_40_PORCENTO">Até 40% (Alíquota Normal)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid de Itens FCI */}
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#202020] text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Código Item</th>
                      <th className="py-2.5 px-3">Descrição Mercadoria</th>
                      <th className="py-2.5 px-3">NCM</th>
                      <th className="py-2.5 px-3 text-right">Parcela Importada (P)</th>
                      <th className="py-2.5 px-3 text-right">Saída Interestadual (S)</th>
                      <th className="py-2.5 px-3 text-center">Conteúdo (CI %)</th>
                      <th className="py-2.5 px-3 text-center">Alíquota ICMS</th>
                      <th className="py-2.5 px-3 text-center">CST Origem</th>
                      <th className="py-2.5 px-3">Número de Controle FCI (&lt;nFCI&gt;)</th>
                      <th className="py-2.5 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300">
                    {itensFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3 font-mono font-semibold text-white">{item.codigoItem}</td>
                        <td className="py-2.5 px-3 max-w-xs truncate" title={item.descricaoItem}>{item.descricaoItem}</td>
                        <td className="py-2.5 px-3 font-mono text-neutral-400">{item.ncm}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-300">
                          R$ {item.valorParcelaImportadaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-300">
                          R$ {item.valorSaidaInterestadualBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            item.percentualConteudoImportacao > 40
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {item.percentualConteudoImportacao.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded ${
                            item.aliquotaIcmsInterestadual === 4.0
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {item.aliquotaIcmsInterestadual.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-neutral-300">
                          {item.cstOrigemSugerido}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-amber-300/90 select-all">
                          {item.numeroControleFci}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleExcluirItem(item.id)}
                            className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Excluir Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {itensFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-neutral-500">
                          Nenhum item de FCI encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Guia Informativo de Resolução do Senado 13/2012 */}
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs space-y-2">
              <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
                <HelpCircle size={16} />
                <span>Regras Oficiais de Preenchimento da NF-e (Ajuste SINIEF 19/2012)</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Nas operações interestaduais com bens ou mercadorias com Conteúdo de Importação superior a 40%, o contribuinte deve emitir a NF-e aplicando a alíquota de <strong>4%</strong>, informando no campo Origem da Mercadoria o código <strong>"3"</strong> ou <strong>"8"</strong>, e destacando o Número de Controle da FCI obtido junto à SEFAZ na tag <code className="text-indigo-300 bg-black/40 px-1 py-0.5 rounded">&lt;nFCI&gt;</code> do Grupo I05.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'arquivoTxt' && (
          <div className="space-y-4">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Arquivo Digital da FCI - Padrão SEFAZ</h3>
                  <p className="text-xs text-neutral-400">Layout posicional oficial delimitado por pipes conforme Convênio ICMS 38/2013</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copiarArquivoParaClipboard}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium border border-white/10 transition"
                  >
                    <Copy size={14} />
                    <span>Copiar Texto</span>
                  </button>
                  <button
                    onClick={baixarArquivoTxt}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                  >
                    <Download size={14} />
                    <span>Baixar Arquivo .txt</span>
                  </button>
                </div>
              </div>

              <textarea
                value={conteudoTxt || 'Clique no botão "Gerar Arquivo SEFAZ" acima para gerar o arquivo magnético oficial.'}
                readOnly
                rows={16}
                className="w-full font-mono text-xs bg-[#101010] border border-white/10 rounded-lg p-3 text-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'laudoA4' && (
          <div className="max-w-4xl mx-auto bg-white text-neutral-900 p-8 rounded-xl shadow-2xl space-y-6">
            <div className="border-b-2 border-neutral-900 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">DEMONSTRATIVO DE CONTEÚDO DE IMPORTAÇÃO (FCI)</h1>
                <p className="text-xs text-neutral-600 mt-1">
                  Resolução do Senado Federal nº 13/2012 / Convênio ICMS nº 38/2013 / Ajuste SINIEF nº 19/2012
                </p>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-neutral-800">COMPETÊNCIA: {competencia}</div>
                <div className="text-neutral-500 mt-0.5">Emitido em: {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div>
                <div className="text-neutral-500">Razão Social do Estabelecimento:</div>
                <div className="font-bold text-neutral-900">Amil Labs Indústria e Automação S/A</div>
              </div>
              <div>
                <div className="text-neutral-500">CNPJ / Inscrição Estadual:</div>
                <div className="font-bold font-mono text-neutral-900">12.345.678/0001-90 | IE: 112.334.455.667</div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">1. Quadro Demonstrativo dos Cálculos de Conteúdo de Importação</h3>
              <table className="w-full text-left text-[11px] border-collapse border border-neutral-300">
                <thead className="bg-neutral-100 text-neutral-700">
                  <tr>
                    <th className="border border-neutral-300 p-2">Item</th>
                    <th className="border border-neutral-300 p-2">Descrição</th>
                    <th className="border border-neutral-300 p-2">NCM</th>
                    <th className="border border-neutral-300 p-2 text-right">Parcela Importada (P)</th>
                    <th className="border border-neutral-300 p-2 text-right">Saída Interestadual (S)</th>
                    <th className="border border-neutral-300 p-2 text-center">CI (%)</th>
                    <th className="border border-neutral-300 p-2 text-center">Alíquota</th>
                    <th className="border border-neutral-300 p-2 text-center">CST</th>
                    <th className="border border-neutral-300 p-2">Controle FCI (&lt;nFCI&gt;)</th>
                  </tr>
                </thead>
                <tbody>
                  {(resumo?.itens || []).map(i => (
                    <tr key={i.id} className="border-b border-neutral-200">
                      <td className="border border-neutral-300 p-2 font-mono font-bold">{i.codigoItem}</td>
                      <td className="border border-neutral-300 p-2">{i.descricaoItem}</td>
                      <td className="border border-neutral-300 p-2 font-mono">{i.ncm}</td>
                      <td className="border border-neutral-300 p-2 text-right font-mono">
                        R$ {i.valorParcelaImportadaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-neutral-300 p-2 text-right font-mono">
                        R$ {i.valorSaidaInterestadualBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-neutral-300 p-2 text-center font-bold">
                        {i.percentualConteudoImportacao.toFixed(2)}%
                      </td>
                      <td className="border border-neutral-300 p-2 text-center font-bold">
                        {i.aliquotaIcmsInterestadual.toFixed(1)}%
                      </td>
                      <td className="border border-neutral-300 p-2 text-center font-bold">{i.cstOrigemSugerido}</td>
                      <td className="border border-neutral-300 p-2 font-mono text-[10px]">{i.numeroControleFci}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-8 border-t border-neutral-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-t border-neutral-400 pt-2 font-bold text-neutral-800">
                  Responsável Técnico / Engenharia Industrial
                </div>
                <div className="text-neutral-500">CREA / Matrícula Funcional</div>
              </div>
              <div>
                <div className="border-t border-neutral-400 pt-2 font-bold text-neutral-800">
                  Contador Responsável / Auditor Tributário
                </div>
                <div className="text-neutral-500">CRC/UF nº 000.000/O</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Item FCI */}
      {modalNovoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full p-6 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">Cálculo de Ficha de Conteúdo de Importação</h3>
            <p className="text-xs text-neutral-400 mb-4">Insira os dados do item industrializado para apuração do CI conforme Resolução SF 13/2012</p>

            <form onSubmit={handleSalvarItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Código do Produto</label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    placeholder="Ex: PRD-MOD-100"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">NCM</label>
                  <input
                    type="text"
                    required
                    value={formNcm}
                    onChange={(e) => setFormNcm(e.target.value)}
                    placeholder="Ex: 8471.50.10"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Descrição do Produto</label>
                <input
                  type="text"
                  required
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Módulo Eletrônico de Controle Industrial"
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Parcela Importada (P)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formParcelaImportada}
                    onChange={(e) => setFormParcelaImportada(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-neutral-500">Valor CIF dos insumos importados</span>
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Valor Saída Interestadual (S)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSaidaInterestadual}
                    onChange={(e) => setFormSaidaInterestadual(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-neutral-500">Valor líquido de tributos</span>
                </div>
              </div>

              {/* Preview Dinâmico do CI */}
              {formSaidaInterestadual > 0 && (
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Conteúdo de Importação (CI):</span>
                    <span className="font-bold text-white">
                      {((formParcelaImportada / formSaidaInterestadual) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Alíquota ICMS Aplicável:</span>
                    <span className="font-bold text-indigo-400">
                      {(formParcelaImportada / formSaidaInterestadual) * 100 > 40 ? '4,0% (Interestadual 4%)' : '12,0% ou 7,0% (Alíquota Normal)'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Observações Internas</label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Informações adicionais de homologação..."
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovoItem(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg border border-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
                >
                  Homologar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
