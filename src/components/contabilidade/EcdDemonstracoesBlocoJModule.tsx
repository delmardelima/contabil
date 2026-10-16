import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Scale,
  DollarSign,
  TrendingUp,
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
  Copy,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoEcdBlocoJ,
  DeclaracaoEcdBlocoJ,
  RegistroJ100Balanco,
  RegistroJ150Dre,
  RegistroJ210Dmpl,
  RegistroJ930Signatario
} from '../../types/contabil';

export const EcdDemonstracoesBlocoJModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [anoCalendario, setAnoCalendario] = useState<number>(2026);
  const [resumo, setResumo] = useState<ResumoEcdBlocoJ | null>(null);
  const [activeTab, setActiveTab] = useState<'balancoJ100' | 'dreJ150' | 'dmplJ210' | 'signatariosJ930' | 'arquivoPvaTxt' | 'laudoA4Oficial'>('balancoJ100');
  const [busca, setBusca] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Arquivo SPED ECD TXT
  const [arquivoTxt, setArquivoTxt] = useState<string>('');
  const [nomeArquivoTxt, setNomeArquivoTxt] = useState<string>('');

  // Modal Nova Linha Balanço J100
  const [modalNovaLinha, setModalNovaLinha] = useState<boolean>(false);
  const [formCodigoAglutinacao, setFormCodigoAglutinacao] = useState<string>('');
  const [formDescricao, setFormDescricao] = useState<string>('');
  const [formNivel, setFormNivel] = useState<number>(3);
  const [formTipoConta, setFormTipoConta] = useState<'S' | 'A'>('A');
  const [formSaldoFinal, setFormSaldoFinal] = useState<number>(50000);
  const [formIndicadorDc, setFormIndicadorDc] = useState<'D' | 'C'>('D');
  const [formNotaRef, setFormNotaRef] = useState<string>('');

  const carregarDados = () => {
    const dados = dbService.getEcdBlocoJ(empresaId, anoCalendario);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [anoCalendario, empresaId]);

  const handleValidarPva = () => {
    if (!resumo?.declaracao) return;
    const res = dbService.validarConsistenciaEcd(resumo.declaracao.id);
    if (res.valido) {
      setNotificacao({ tipo: 'sucesso', texto: res.mensagem });
    } else {
      setNotificacao({ tipo: 'erro', texto: `${res.mensagem} Erros: ${res.erros.join(' | ')}` });
    }
    carregarDados();
  };

  const handleGerarArquivoTxt = () => {
    if (!resumo?.declaracao) return;
    const res = dbService.gerarArquivoSpedEcdTxt(resumo.declaracao.id);
    if (res.sucesso && res.arquivoTxt) {
      setArquivoTxt(res.arquivoTxt);
      setNomeArquivoTxt(res.nomeArquivo || `SPED_ECD_BLOCO_J_${anoCalendario}.txt`);
      setActiveTab('arquivoPvaTxt');
      setNotificacao({ tipo: 'sucesso', texto: res.mensagem });
    } else {
      setNotificacao({ tipo: 'erro', texto: res.mensagem });
    }
  };

  const handleSalvarNovaLinha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumo?.declaracao) return;

    const novaLinha: RegistroJ100Balanco = {
      id: `j100-${Date.now()}`,
      codigoAglutinacao: formCodigoAglutinacao,
      nivel: formNivel,
      tipoConta: formTipoConta,
      descricao: formDescricao,
      valorSaldoInicial: 0,
      indicadorDcInicial: formIndicadorDc,
      valorSaldoFinal: formSaldoFinal,
      indicadorDcFinal: formIndicadorDc,
      notaExplicativaRef: formNotaRef
    };

    const decAtualizada = { ...resumo.declaracao };
    decAtualizada.linhasJ100.push(novaLinha);
    decAtualizada.totalLinhasBlocoJ += 1;

    dbService.salvarDeclaracaoEcdBlocoJ(decAtualizada);
    setNotificacao({ tipo: 'sucesso', texto: `Linha aglutinada '${formDescricao}' adicionada ao Balanço J100.` });
    setModalNovaLinha(false);
    setFormCodigoAglutinacao('');
    setFormDescricao('');
    carregarDados();
  };

  const handleDownloadTxt = () => {
    if (!arquivoTxt) return;
    const blob = new Blob([arquivoTxt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivoTxt || `SPED_ECD_BLOCO_J_${anoCalendario}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopiarTxt = () => {
    if (!arquivoTxt) return;
    navigator.clipboard.writeText(arquivoTxt);
    setNotificacao({ tipo: 'sucesso', texto: 'Arquivo TXT copiado para a área de transferência!' });
  };

  const dec = resumo?.declaracao;
  const linhasFiltradasJ100 = dec?.linhasJ100.filter(l =>
    l.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    l.codigoAglutinacao.includes(busca)
  ) || [];

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
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-neutral-100 tracking-tight">
                ECD Bloco J - Demonstrações Contábeis Regulatórias (Leiaute 9)
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-sky-500/10 border border-sky-500/30 text-sky-300 rounded">
                SPED Contábil / IN RFB nº 2.003
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Balanço J100, DRE J150, DMPL J210 e Signatários J930 estruturados conforme NBC TG / CFC
            </p>
          </div>
        </div>

        {/* Controles de Exercício e Ações */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-neutral-400 font-medium">Ano Calendário:</span>
            <input
              type="number"
              value={anoCalendario}
              onChange={e => setAnoCalendario(Number(e.target.value))}
              className="bg-transparent text-xs text-neutral-200 focus:outline-none w-16 font-mono text-center cursor-pointer"
            />
          </div>

          <button
            onClick={carregarDados}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#252525] border border-white/10 text-neutral-300 hover:bg-[#2c2c2c] hover:text-white transition-all"
            title="Recarregar Demonstrações"
          >
            <RefreshCw size={14} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleValidarPva}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all"
            title="Validar Consistência da Equação Fundamental"
          >
            <ShieldCheck size={14} />
            <span>Validar Bloco J</span>
          </button>

          <button
            onClick={handleGerarArquivoTxt}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950/50 transition-all"
            title="Gerar Arquivo SPED ECD"
          >
            <Download size={14} />
            <span>Gerar SPED TXT</span>
          </button>

          <button
            onClick={() => setModalNovaLinha(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#282828] hover:bg-[#323232] border border-white/10 text-neutral-200 transition-all"
          >
            <Plus size={14} />
            <span>Nova Conta Aglutinada</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas e Totais Regulatórios */}
      <div className="grid grid-cols-5 gap-3 p-4 border-b border-white/5 bg-[#141414]">
        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Ativo Total (J100)</span>
            <Scale size={14} className="text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono">
            R$ {(resumo?.totalAtivo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Circulante + Não Circulante</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Passivo + PL (J100)</span>
            <Building2 size={14} className="text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-indigo-400 font-mono">
            R$ {(resumo?.totalPassivoPl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Equilíbrio Patrimonial</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Diferença (DxP)</span>
            <Scale size={14} className={resumo?.diferencaAtivoPassivo === 0 ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
          <div className={`text-lg font-bold font-mono ${resumo?.diferencaAtivoPassivo === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {(resumo?.diferencaAtivoPassivo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            {resumo?.diferencaAtivoPassivo === 0 ? 'Balanço 100% Equilibrado' : 'Atenção: Balanço Desbalanceado'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Lucro Líquido (J150)</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            R$ {(resumo?.resultadoLiquidoExercicio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Resultado Final do Exercício</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Status Validação</span>
            <FileCheck2 size={14} className="text-teal-400" />
          </div>
          <div className="text-base font-bold font-mono text-neutral-200">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
              dec?.statusValidacao === 'CONFORME'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {dec?.statusValidacao || 'CONFORME'}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">{dec?.totalLinhasBlocoJ || 35} linhas estruturadas</div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex items-center justify-between px-5 pt-2 border-b border-white/10 bg-[#161616]">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('balancoJ100')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'balancoJ100'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Scale size={14} />
            <span>Balanço Patrimonial (J100)</span>
          </button>

          <button
            onClick={() => setActiveTab('dreJ150')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'dreJ150'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <TrendingUp size={14} />
            <span>Demonstração do Resultado (J150)</span>
          </button>

          <button
            onClick={() => setActiveTab('dmplJ210')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'dmplJ210'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Layers size={14} />
            <span>Mutações do PL (J210)</span>
          </button>

          <button
            onClick={() => setActiveTab('signatariosJ930')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'signatariosJ930'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Briefcase size={14} />
            <span>Signatários da ECD (J930)</span>
          </button>

          <button
            onClick={() => setActiveTab('arquivoPvaTxt')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'arquivoPvaTxt'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <FileText size={14} />
            <span>Arquivo SPED TXT (Bloco J)</span>
          </button>

          <button
            onClick={() => setActiveTab('laudoA4Oficial')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'laudoA4Oficial'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Printer size={14} />
            <span>Demonstrações A4 Oficiais</span>
          </button>
        </div>

        {/* Busca Rápida */}
        <div className="flex items-center space-x-2 bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1 mb-1">
          <Search size={13} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar conta ou código aglutinador..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="bg-transparent text-xs text-neutral-200 focus:outline-none w-56 placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 overflow-auto p-5">
        {activeTab === 'balancoJ100' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Registro J100 - Balanço Patrimonial Regulatória da ECD
                </h2>
                <p className="text-xs text-neutral-400">
                  Aglutinação de contas patrimoniais com identificação de nível sintético/analítico e nota explicativa
                </p>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-white/10 font-semibold">
                    <th className="py-2.5 px-3 w-32">Código Aglutinação</th>
                    <th className="py-2.5 px-3 w-16 text-center">Nível</th>
                    <th className="py-2.5 px-3 w-16 text-center">Tipo</th>
                    <th className="py-2.5 px-3">Descrição da Conta Aglutinada</th>
                    <th className="py-2.5 px-3 w-28 text-center">Nota Ref.</th>
                    <th className="py-2.5 px-3 text-right w-36">Saldo Inicial</th>
                    <th className="py-2.5 px-3 text-right w-36">Saldo Final Oficial</th>
                    <th className="py-2.5 px-3 w-16 text-center">D/C</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {linhasFiltradasJ100.map(l => (
                    <tr
                      key={l.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        l.nivel === 1 ? 'bg-white/[0.04] font-bold text-neutral-100' :
                        l.nivel === 2 ? 'bg-white/[0.02] font-semibold text-neutral-200' :
                        'text-neutral-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-sky-400">{l.codigoAglutinacao}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-400">{l.nivel}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          l.tipoConta === 'S' ? 'bg-neutral-800 text-neutral-300' : 'bg-sky-500/10 text-sky-300'
                        }`}>
                          {l.tipoConta}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span style={{ paddingLeft: `${(l.nivel - 1) * 16}px` }}>
                          {l.descricao}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-neutral-400 font-mono">
                        {l.notaExplicativaRef || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-400">
                        R$ {l.valorSaldoInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-medium ${
                        l.nivel === 1 ? 'text-sky-300' : 'text-neutral-100'
                      }`}>
                        R$ {l.valorSaldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-400">{l.indicadorDcFinal}</td>
                    </tr>
                  ))}
                  {linhasFiltradasJ100.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-500 text-xs">
                        Nenhuma conta aglutinada encontrada para os filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dreJ150' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Registro J150 - Demonstração do Resultado do Exercício (DRE)
                </h2>
                <p className="text-xs text-neutral-400">
                  Apuração do Lucro ou Prejuízo com segregação de receitas brutas, deduções tributárias, custos operacionais e tributos s/ lucro
                </p>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-white/10 font-semibold">
                    <th className="py-2.5 px-3 w-32">Código Aglutinação</th>
                    <th className="py-2.5 px-3">Estrutura da DRE</th>
                    <th className="py-2.5 px-3 w-48 text-center">Classificação Regulatória</th>
                    <th className="py-2.5 px-3 text-right w-40">Valor do Exercício</th>
                    <th className="py-2.5 px-3 w-16 text-center">D/C</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dec?.linhasJ150.map(l => (
                    <tr
                      key={l.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        l.indicadorGrupoDRE === 'LUCRO_LIQUIDO' ? 'bg-emerald-950/20 font-bold text-emerald-300' :
                        l.descricao.startsWith('(=)') ? 'bg-white/[0.03] font-semibold text-neutral-100' :
                        'text-neutral-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-sky-400">{l.codigoAglutinacao}</td>
                      <td className="py-2.5 px-3 font-medium">{l.descricao}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                          {l.indicadorGrupoDRE}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-semibold ${
                        l.indicadorGrupoDRE === 'LUCRO_LIQUIDO' ? 'text-emerald-400 text-sm' :
                        l.indicadorDcFinal === 'D' ? 'text-rose-400' : 'text-neutral-100'
                      }`}>
                        {l.indicadorDcFinal === 'D' && l.valorSaldoFinal > 0 ? '-' : ''}
                        R$ {l.valorSaldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-400">{l.indicadorDcFinal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dmplJ210' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Registro J210 - Demonstração das Mutações do Patrimônio Líquido (DMPL)
                </h2>
                <p className="text-xs text-neutral-400">
                  Evolução do Capital Social, Reservas Legais, Dividendos e Lucros Acumulados
                </p>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-white/10 font-semibold">
                    <th className="py-2.5 px-3 w-32">Conta PL</th>
                    <th className="py-2.5 px-3">Fato Contábil / Descrição da Mutação</th>
                    <th className="py-2.5 px-3 text-right w-36">Saldo Inicial</th>
                    <th className="py-2.5 px-3 text-right w-36">Lucro do Exercício</th>
                    <th className="py-2.5 px-3 text-right w-36">Constituição Reserva</th>
                    <th className="py-2.5 px-3 text-right w-36">Dividendos Propostos</th>
                    <th className="py-2.5 px-3 text-right w-36">Saldo Final PL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dec?.linhasJ210.map(l => (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-mono text-sky-400 font-semibold">{l.codigoAglutinacao}</td>
                      <td className="py-2.5 px-3 font-medium text-neutral-200">{l.descricaoFato}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                        R$ {l.saldoInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        {l.lucroPrejuizoPeriodo > 0 ? `+ R$ ${l.lucroPrejuizoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-400">
                        {l.constituicaoReservas > 0 ? `+ R$ ${l.constituicaoReservas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        {l.distribuicaoDividendos > 0 ? `- R$ ${l.distribuicaoDividendos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-300">
                        R$ {l.saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'signatariosJ930' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Registro J930 - Signatários Oficiais da Escrituração Contábil Digital
                </h2>
                <p className="text-xs text-neutral-400">
                  Identificação do Contador responsável técnico com CRC e do Representante Legal da empresa
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {dec?.signatariosJ930.map(s => (
                <div key={s.id} className="p-4 rounded-xl border border-white/10 bg-[#181818] space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-semibold text-neutral-100 text-sm">{s.nome}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {s.qualificacao}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">CPF:</span>
                      <span className="font-mono text-neutral-200">{s.cpf}</span>
                    </div>
                    {s.numeroInscricaoCrc && (
                      <div>
                        <span className="text-neutral-500 block text-[10px]">CRC PROFISSIONAL:</span>
                        <span className="font-mono text-sky-300 font-semibold">{s.ufCrc}-{s.numeroInscricaoCrc}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-neutral-500 block text-[10px]">E-MAIL:</span>
                      <span className="text-neutral-300">{s.email}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">TELEFONE:</span>
                      <span className="text-neutral-300">{s.telefone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#161616]">
              <h3 className="text-xs font-semibold text-neutral-200 mb-2">Registro J900 - Termo de Encerramento Oficial</h3>
              <p className="text-xs text-neutral-400 font-mono leading-relaxed bg-[#121212] p-3 rounded border border-white/5">
                {dec?.termoEncerramentoJ900}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'arquivoPvaTxt' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Arquivo Digital SPED ECD (Bloco J - Demonstrações Contábeis)
                </h2>
                <p className="text-xs text-neutral-400">
                  Estrutura posicional oficial delimitada por pipes (|) conforme Manual de Orientação do Leiaute 9
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopiarTxt}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#252525] border border-white/10 hover:bg-[#2c2c2c] text-neutral-200 transition-all"
                >
                  <Copy size={13} />
                  <span>Copiar TXT</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow transition-all"
                >
                  <Download size={13} />
                  <span>Baixar Arquivo TXT</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                readOnly
                value={arquivoTxt || '<!-- Nenhum arquivo gerado no momento. Clique no botão superior "Gerar SPED TXT". -->'}
                rows={22}
                className="w-full font-mono text-xs p-4 bg-[#141414] border border-white/10 rounded-xl text-sky-300 focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'laudoA4Oficial' && dec && (
          <div className="max-w-4xl mx-auto p-8 rounded-xl bg-white text-neutral-900 shadow-2xl border border-neutral-300 print:m-0 print:p-0">
            {/* Cabeçalho Oficial */}
            <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  BALANÇO PATRIMONIAL & DEMONSTRAÇÃO DO RESULTADO
                </h1>
                <p className="text-xs text-neutral-600 font-semibold uppercase">
                  EMPRESA MATRIZ EXEMPLO LTDA - CNPJ: 12.345.678/0001-90
                </p>
                <p className="text-[11px] text-neutral-500">
                  Escrituração Contábil Digital (ECD) - Exercício Social Encerrado em 31/12/{anoCalendario}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-neutral-100 px-3 py-1 rounded border border-neutral-300">
                  LEIAUTE 9 SPED
                </span>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">Recibo: {dec.reciboEntregaEcd}</p>
              </div>
            </div>

            {/* Balanço Patrimonial A4 */}
            <h2 className="text-xs font-bold uppercase text-neutral-800 border-b border-neutral-400 pb-1 mb-2">
              1. Balanço Patrimonial (Ativo e Passivo)
            </h2>
            <table className="w-full text-left text-[11px] border-collapse mb-6">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 font-bold text-neutral-700">
                  <th className="p-1.5 w-24">Aglutinação</th>
                  <th className="p-1.5">Descrição da Conta</th>
                  <th className="p-1.5 text-center w-20">Nota Ref.</th>
                  <th className="p-1.5 text-right w-32">Exercício {anoCalendario}</th>
                  <th className="p-1.5 text-right w-32">Exercício {anoCalendario - 1}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {dec.linhasJ100.map(l => (
                  <tr key={l.id} className={l.nivel === 1 ? 'font-bold bg-neutral-50' : l.nivel === 2 ? 'font-semibold' : ''}>
                    <td className="p-1.5 font-mono text-neutral-600">{l.codigoAglutinacao}</td>
                    <td className="p-1.5">
                      <span style={{ paddingLeft: `${(l.nivel - 1) * 12}px` }}>
                        {l.descricao}
                      </span>
                    </td>
                    <td className="p-1.5 text-center text-neutral-500 font-mono">{l.notaExplicativaRef || '-'}</td>
                    <td className="p-1.5 text-right font-mono font-medium">
                      R$ {l.valorSaldoFinal.toFixed(2)}
                    </td>
                    <td className="p-1.5 text-right font-mono text-neutral-500">
                      R$ {l.valorSaldoInicial.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* DRE A4 */}
            <h2 className="text-xs font-bold uppercase text-neutral-800 border-b border-neutral-400 pb-1 mb-2">
              2. Demonstração do Resultado do Exercício (DRE)
            </h2>
            <table className="w-full text-left text-[11px] border-collapse mb-8">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 font-bold text-neutral-700">
                  <th className="p-1.5 w-24">Aglutinação</th>
                  <th className="p-1.5">Discriminação das Receitas e Despesas</th>
                  <th className="p-1.5 text-right w-36">Valor em Reais (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {dec.linhasJ150.map(l => (
                  <tr key={l.id} className={l.indicadorGrupoDRE === 'LUCRO_LIQUIDO' ? 'font-bold bg-emerald-50' : l.descricao.startsWith('(=)') ? 'font-semibold' : ''}>
                    <td className="p-1.5 font-mono text-neutral-600">{l.codigoAglutinacao}</td>
                    <td className="p-1.5">{l.descricao}</td>
                    <td className={`p-1.5 text-right font-mono font-medium ${
                      l.indicadorDcFinal === 'D' && l.valorSaldoFinal > 0 ? 'text-rose-700' : 'text-neutral-900'
                    }`}>
                      {l.indicadorDcFinal === 'D' && l.valorSaldoFinal > 0 ? '-' : ''}
                      R$ {l.valorSaldoFinal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signatários Oficiais */}
            <div className="border-t-2 border-neutral-800 pt-6 mt-8">
              <div className="grid grid-cols-2 gap-8 text-center text-xs text-neutral-800">
                <div>
                  <div className="border-t border-neutral-600 pt-1.5">
                    <p className="font-bold">{dec.signatariosJ930[0]?.nome}</p>
                    <p className="text-[11px] text-neutral-600">{dec.signatariosJ930[0]?.qualificacao} - CRC: {dec.signatariosJ930[0]?.ufCrc} {dec.signatariosJ930[0]?.numeroInscricaoCrc}</p>
                  </div>
                </div>
                <div>
                  <div className="border-t border-neutral-600 pt-1.5">
                    <p className="font-bold">{dec.signatariosJ930[1]?.nome}</p>
                    <p className="text-[11px] text-neutral-600">{dec.signatariosJ930[1]?.qualificacao} - CPF: {dec.signatariosJ930[1]?.cpf}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Conta Aglutinada */}
      {modalNovaLinha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 text-neutral-200">
            <h3 className="text-base font-semibold text-neutral-100 mb-1">Adicionar Conta no Balanço J100</h3>
            <p className="text-xs text-neutral-400 mb-4">Mapeamento de aglutinação contábil para a Escrituração Contábil Digital</p>

            <form onSubmit={handleSalvarNovaLinha} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Código Aglutinação</label>
                  <input
                    type="text"
                    required
                    value={formCodigoAglutinacao}
                    onChange={e => setFormCodigoAglutinacao(e.target.value)}
                    placeholder="Ex: 1.01.05"
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Nível</label>
                  <select
                    value={formNivel}
                    onChange={e => setFormNivel(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value={1}>1 - Grupo Geral (Sintética)</option>
                    <option value={2}>2 - Subgrupo (Sintética)</option>
                    <option value={3}>3 - Conta Analítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Descrição da Conta</label>
                <input
                  type="text"
                  required
                  value={formDescricao}
                  onChange={e => setFormDescricao(e.target.value)}
                  placeholder="Ex: Aplicações Financeiras de Curto Prazo"
                  className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Saldo Final Oficial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSaldoFinal}
                    onChange={e => setFormSaldoFinal(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Indicador D/C</label>
                  <select
                    value={formIndicadorDc}
                    onChange={e => setFormIndicadorDc(e.target.value as 'D' | 'C')}
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500 font-mono"
                  >
                    <option value="D">D - Devedor (Ativo/Despesa)</option>
                    <option value="C">C - Credor (Passivo/PL/Receita)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Nota Explicativa Referência</label>
                <input
                  type="text"
                  value={formNotaRef}
                  onChange={e => setFormNotaRef(e.target.value)}
                  placeholder="Ex: Nota 04"
                  className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovaLinha(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-700/50 hover:bg-neutral-700 text-neutral-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all"
                >
                  Salvar Linha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
