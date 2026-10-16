import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  Building2,
  DollarSign,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ConjuntoNotasExplicativas,
  SecaoNotaExplicativa,
  Empresa
} from '../../types/contabil';

interface NotasExplicativasModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const NotasExplicativasModule: React.FC<NotasExplicativasModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [anoExercicio, setAnoExercicio] = useState<number>(2026);
  const [notas, setNotas] = useState<ConjuntoNotasExplicativas | null>(null);
  const [notaSelecionadaIndex, setNotaSelecionadaIndex] = useState<number>(0);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarDados = () => {
    const dados = dbService.getNotasExplicativas(empresaAtiva.id, anoExercicio);
    setNotas(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, anoExercicio]);

  const handleSalvar = () => {
    if (!notas) return;
    dbService.salvarNotasExplicativas(notas);
    setMensagemStatus({ tipo: 'sucesso', texto: 'Notas Explicativas salvas com sucesso!' });
    setTimeout(() => setMensagemStatus(null), 3000);
  };

  const handleAutoSincronizar = () => {
    const atualizadas = dbService.autoSincronizarSaldosNotasExplicativas(empresaAtiva.id, anoExercicio);
    setNotas({ ...atualizadas });
    setMensagemStatus({ tipo: 'sucesso', texto: 'Saldos do Balanço e DRE sincronizados nas tabelas das notas!' });
    setTimeout(() => setMensagemStatus(null), 3500);
  };

  const handleAtualizarTextoNota = (texto: string) => {
    if (!notas) return;
    const novasSecoes = [...notas.secoes];
    novasSecoes[notaSelecionadaIndex].conteudoTexto = texto;
    setNotas({ ...notas, secoes: novasSecoes });
  };

  const handleToggleAtivaNota = (index: number) => {
    if (!notas) return;
    const novasSecoes = [...notas.secoes];
    novasSecoes[index].ativa = !novasSecoes[index].ativa;
    setNotas({ ...notas, secoes: novasSecoes });
  };

  const handleImprimirRelatorio = () => {
    if (!notas || !onOpenReportPreview) return;
    const content = (
      <div className="text-neutral-900 text-xs p-6 space-y-6 font-serif max-w-4xl mx-auto">
        {/* Cabeçalho Oficial */}
        <div className="border-b-2 border-neutral-900 pb-4 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-neutral-800">{empresaAtiva.razaoSocial}</p>
          <p className="text-[11px] text-neutral-600 font-mono">CNPJ: {empresaAtiva.cnpj} | NIRE: {empresaAtiva.nire || '35.234.567.890'}</p>
          <h1 className="text-base font-bold uppercase mt-3 tracking-wide">{notas.tituloDocumento}</h1>
          <p className="text-xs italic text-neutral-700">{notas.subtitulo}</p>
        </div>

        {/* Declaração Inicial */}
        <div className="bg-neutral-50 p-3 border border-neutral-200 rounded text-[11px] leading-relaxed">
          <p>
            <strong>Declaração da Administração e do Responsável Técnico:</strong> As presentes Notas Explicativas integram as demonstrações contábeis e foram elaboradas em estrita observância à Norma Brasileira de Contabilidade <strong>NBC TG 26 (R5)</strong>, ao Pronunciamento Técnico <strong>CPC 26</strong> e aos dispositivos da Lei nº 6.404/1976.
          </p>
        </div>

        {/* Lista de Notas Explicativas Ativas */}
        <div className="space-y-6 text-justify leading-relaxed">
          {notas.secoes.filter(s => s.ativa).map((secao) => (
            <div key={secao.numeroNota} className="space-y-2">
              <h2 className="font-bold text-sm text-neutral-900 border-b border-neutral-300 pb-1">
                Nota {secao.numeroNota} - {secao.titulo}
              </h2>
              <p className="text-xs text-neutral-800 indent-6 leading-relaxed">
                {secao.conteudoTexto}
              </p>

              {/* Tabela de Dados (se houver) */}
              {secao.tabelaDados && (
                <div className="mt-3 border border-neutral-300 rounded overflow-hidden">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-neutral-300 font-bold">
                        {secao.tabelaDados.cabecalhos.map((c, i) => (
                          <th key={i} className={`py-1.5 px-2 ${i >= 2 ? 'text-right' : 'text-left'}`}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {secao.tabelaDados.linhas.map((linha, lIdx) => (
                        <tr key={lIdx} className="hover:bg-neutral-50">
                          {linha.conta && <td className="py-1 px-2 font-mono text-neutral-600">{linha.conta}</td>}
                          <td className="py-1 px-2">{linha.descricao}</td>
                          <td className="py-1 px-2 font-mono text-right">
                            {typeof linha.anoAtual === 'number' 
                              ? `R$ ${linha.anoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                              : linha.anoAtual}
                          </td>
                          <td className="py-1 px-2 font-mono text-right text-neutral-600">
                            {typeof linha.anoAnterior === 'number' 
                              ? `R$ ${linha.anoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                              : linha.anoAnterior}
                          </td>
                          {linha.observacao && <td className="py-1 px-2 text-neutral-500 italic">{linha.observacao}</td>}
                        </tr>
                      ))}
                    </tbody>
                    {(secao.tabelaDados.totalAtual !== undefined || secao.tabelaDados.totalAnterior !== undefined) && (
                      <tfoot>
                        <tr className="bg-neutral-100 font-bold border-t border-neutral-300">
                          <td colSpan={secao.tabelaDados.linhas[0]?.conta ? 2 : 1} className="py-1.5 px-2 text-right">Total:</td>
                          <td className="py-1.5 px-2 font-mono text-right">
                            R$ {(secao.tabelaDados.totalAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-1.5 px-2 font-mono text-right">
                            R$ {(secao.tabelaDados.totalAnterior || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          {secao.tabelaDados.linhas[0]?.observacao && <td></td>}
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Termo de Encerramento e Assinaturas */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-neutral-900 pt-2">
            <p className="font-bold uppercase">{notas.administradorNome}</p>
            <p className="text-neutral-600">{notas.administradorCargo}</p>
            <p className="text-[10px] text-neutral-500 mt-1">Representante Legal da Sociedade</p>
          </div>
          <div className="border-t border-neutral-900 pt-2">
            <p className="font-bold uppercase">{notas.contadorNome}</p>
            <p className="text-neutral-600">{notas.contadorCrc}</p>
            <p className="text-[10px] text-neutral-500 mt-1">Contador Responsável Técnico</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview('Notas Explicativas às Demonstrações Contábeis', `Exercício ${anoExercicio}`, content, 'portrait');
  };

  const secaoAtual: SecaoNotaExplicativa | undefined = notas?.secoes[notaSelecionadaIndex];

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 select-none overflow-hidden">
      {/* 1. Header do Módulo */}
      <div className="p-4 bg-[#1a1a1a] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">Notas Explicativas às Demonstrações</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                NBC TG 26 (R5) / CPC 26
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Divulgação obrigatória de políticas contábeis, critérios de mensuração e composição analítica de contas (Lei 6.404/76)
            </p>
          </div>
        </div>

        {/* Controles de Topo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#222] border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-xs text-neutral-400 font-medium">Exercício:</span>
            <input
              type="number"
              min="2020"
              max="2035"
              value={anoExercicio}
              onChange={e => setAnoExercicio(parseInt(e.target.value) || 2026)}
              className="bg-transparent text-xs text-white font-mono w-14 outline-none cursor-pointer text-center font-bold"
            />
          </div>

          <button
            onClick={handleAutoSincronizar}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition-colors"
            title="Capturar saldos atualizados de Caixa e Clientes do Balancete"
          >
            <RefreshCw size={14} />
            <span>Sincronizar Balanço</span>
          </button>

          <button
            onClick={handleSalvar}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded-lg text-xs font-medium transition-colors"
          >
            <Printer size={14} />
            <span>Imprimir A4 Timbrado</span>
          </button>
        </div>
      </div>

      {/* Banner de Feedback */}
      {mensagemStatus && (
        <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-b animate-fadeIn ${
          mensagemStatus.tipo === 'sucesso' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-950/40 border-red-500/30 text-red-300'
        }`}>
          <AlertCircle size={14} />
          <span>{mensagemStatus.texto}</span>
        </div>
      )}

      {/* 2. Layout Principal Dividido: Navegador à Esquerda e Editor à Direita */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel Esquerdo: Lista de Notas */}
        <div className="w-80 bg-[#171717] border-r border-white/10 flex flex-col overflow-y-auto">
          <div className="p-3 bg-[#1e1e1e] border-b border-white/10 text-xs font-semibold text-neutral-300 flex items-center justify-between">
            <span>Seções Padronizadas (13 Notas)</span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {notas?.secoes.filter(s => s.ativa).length} ativas
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {notas?.secoes.map((secao, idx) => (
              <div
                key={secao.numeroNota}
                onClick={() => setNotaSelecionadaIndex(idx)}
                className={`p-3 flex items-start gap-2.5 cursor-pointer transition-colors ${
                  notaSelecionadaIndex === idx
                    ? 'bg-blue-600/15 border-l-2 border-blue-500 text-white'
                    : 'hover:bg-white/[0.03] text-neutral-400'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAtivaNota(idx);
                  }}
                  className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${
                    secao.ativa ? 'bg-blue-600 text-white' : 'bg-neutral-800 border border-white/20'
                  }`}
                  title={secao.ativa ? 'Desativar nota do relatório' : 'Ativar nota no relatório'}
                >
                  {secao.ativa && <CheckCircle2 size={12} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-neutral-200">
                      Nota {secao.numeroNota}
                    </span>
                    {secao.tabelaDados && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-white/5 font-mono">
                        TABELA
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">{secao.titulo}</p>
                </div>

                <ChevronRight size={14} className="text-neutral-600 self-center" />
              </div>
            ))}
          </div>
        </div>

        {/* Painel Direito: Editor da Nota Selecionada */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#141414] p-6 space-y-6">
          {secaoAtual ? (
            <div className="max-w-4xl space-y-5">
              {/* Topo do Detalhe */}
              <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Nota Explicativa nº {secaoAtual.numeroNota}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">Ref: {secaoAtual.codigoReferencia}</span>
                  </div>
                  <h2 className="text-base font-bold text-white">{secaoAtual.titulo}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Incluir no Relatório A4:</span>
                  <button
                    onClick={() => handleToggleAtivaNota(notaSelecionadaIndex)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      secaoAtual.ativa 
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-neutral-800 text-neutral-500 border border-white/10'
                    }`}
                  >
                    {secaoAtual.ativa ? 'ATIVADA' : 'INATIVA'}
                  </button>
                </div>
              </div>

              {/* Editor de Texto Explicativo */}
              <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-4 space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Redação Oficial da Nota (Conforme Normas CPC / CFC)
                </label>
                <textarea
                  rows={6}
                  value={secaoAtual.conteudoTexto}
                  onChange={e => handleAtualizarTextoNota(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg p-3 text-xs text-neutral-200 outline-none leading-relaxed focus:border-blue-500/50"
                  placeholder="Descreva as políticas contábeis, critérios de mensuração e contexto fático..."
                />
              </div>

              {/* Tabela de Demonstração Quantitativa (se aplicável) */}
              {secaoAtual.tabelaDados && (
                <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Composição Analítica e Comparativo Anual</h3>
                      <p className="text-[11px] text-neutral-400">Valores em Reais (R$) confrontados com o exercício anterior</p>
                    </div>
                  </div>

                  <div className="border border-white/10 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-neutral-800/50 border-b border-white/10 text-neutral-400 font-semibold">
                          {secaoAtual.tabelaDados.cabecalhos.map((c, i) => (
                            <th key={i} className={`py-2 px-3 ${i >= 2 ? 'text-right' : 'text-left'}`}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {secaoAtual.tabelaDados.linhas.map((l, lIdx) => (
                          <tr key={lIdx} className="hover:bg-white/[0.02]">
                            {l.conta && <td className="py-2 px-3 font-mono text-neutral-400">{l.conta}</td>}
                            <td className="py-2 px-3 text-neutral-200 font-medium">{l.descricao}</td>
                            <td className="py-2 px-3 font-mono text-right text-white">
                              {typeof l.anoAtual === 'number' 
                                ? `R$ ${l.anoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                                : l.anoAtual}
                            </td>
                            <td className="py-2 px-3 font-mono text-right text-neutral-400">
                              {typeof l.anoAnterior === 'number' 
                                ? `R$ ${l.anoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                                : l.anoAnterior}
                            </td>
                            {l.observacao && <td className="py-2 px-3 text-neutral-400 italic text-[11px]">{l.observacao}</td>}
                          </tr>
                        ))}
                      </tbody>
                      {(secaoAtual.tabelaDados.totalAtual !== undefined || secaoAtual.tabelaDados.totalAnterior !== undefined) && (
                        <tfoot>
                          <tr className="bg-neutral-800/30 border-t border-white/10 font-bold">
                            <td colSpan={secaoAtual.tabelaDados.linhas[0]?.conta ? 2 : 1} className="py-2.5 px-3 text-right text-neutral-300">Total:</td>
                            <td className="py-2.5 px-3 font-mono text-right text-emerald-400">
                              R$ {(secaoAtual.tabelaDados.totalAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right text-neutral-400">
                              R$ {(secaoAtual.tabelaDados.totalAnterior || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            {secaoAtual.tabelaDados.linhas[0]?.observacao && <td></td>}
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {/* Box Informativo de Conformidade */}
              <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-300">
                <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Conformidade NBC TG / CFC Assegurada</span>
                  <span className="text-[11px] text-blue-200/80">
                    Ao salvar ou sincronizar, os valores e textos destas notas explicativas serão integrados aos demonstrativos oficiais do encerramento social para fiscalizações da Receita Federal e auditorias externas.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
              Selecione uma nota explicativa no menu lateral.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
