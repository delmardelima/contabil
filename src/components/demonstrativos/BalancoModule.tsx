import React, { useState } from 'react';
import { ContaContabil, LancamentoContabil } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { exportToCSV } from '../../utils/exportUtils';
import { CheckCircle2, AlertTriangle, Download, FileText, Sliders } from 'lucide-react';

interface BalancoModuleProps {
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
}

function numeroMonetarioPorExtenso(valor: number): string {
  const abs = Math.abs(Math.round(valor * 100) / 100);
  const reais = Math.floor(abs);
  const centavos = Math.round((abs - reais) * 100);

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezADezenove = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const trioPorExtenso = (n: number): string => {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100);
    const resto = n % 100;
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    const partes: string[] = [];
    if (c > 0) partes.push(centenas[c]);
    if (resto >= 10 && resto <= 19) {
      partes.push(dezADezenove[resto - 10]);
    } else {
      if (d > 0) partes.push(dezenas[d]);
      if (u > 0) partes.push(unidades[u]);
    }
    return partes.join(' e ');
  };

  if (reais === 0 && centavos === 0) return 'zero reais';

  const milhoes = Math.floor(reais / 1000000);
  const milhares = Math.floor((reais % 1000000) / 1000);
  const restoReais = reais % 1000;

  const blocos: string[] = [];
  if (milhoes > 0) {
    blocos.push(`${trioPorExtenso(milhoes)} ${milhoes === 1 ? 'milhão' : 'milhões'}`);
  }
  if (milhares > 0) {
    blocos.push(milhares === 1 ? 'mil' : `${trioPorExtenso(milhares)} mil`);
  }
  if (restoReais > 0) {
    blocos.push(trioPorExtenso(restoReais));
  }

  let texto = '';
  if (reais > 0) {
    texto = `${blocos.join(', ')} ${reais === 1 ? 'real' : 'reais'}`;
  }
  if (centavos > 0) {
    const extCent = trioPorExtenso(centavos);
    texto += `${reais > 0 ? ' e ' : ''}${extCent} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }
  return texto;
}

export const BalancoModule: React.FC<BalancoModuleProps> = ({ contas, lancamentos }) => {
  // Opções extraídas de Balan_o_Contabilidade.htm e Op__es_Contabilidade.htm (contabil.exe)
  const [grauMaximo, setGrauMaximo] = useState<number>(4);
  const [imprimirClassificacao, setImprimirClassificacao] = useState<boolean>(true);
  const [desconsiderarZeramento, setDesconsiderarZeramento] = useState<boolean>(false);
  const [destacarSinteticas, setDestacarSinteticas] = useState<boolean>(true);
  const [imprimirValorPorExtenso, setImprimirValorPorExtenso] = useState<boolean>(true);
  const [posicionarPassivoDescobertoAbaixoAtivo, setPosicionarPassivoDescobertoAbaixoAtivo] = useState<boolean>(true);
  const [descricaoFinal, setDescricaoFinal] = useState<string>(
    'Reconhecemos a exatidão do presente Balanço Patrimonial, elaborado em conformidade com a ITG 1000 (Resolução CFC nº 1.418/12) e legislação comercial vigente.'
  );
  const [showDescricaoModal, setShowDescricaoModal] = useState<boolean>(false);

  const {
    ativo,
    passivo,
    patrimonioLiquido,
    totalAtivo,
    totalPassivo,
    totalPL,
    isEquilibrado,
    isPassivoDescoberto
  } = AccountingEngine.generateBalanceSheet(contas, lancamentos, grauMaximo, desconsiderarZeramento);

  // Regra de Op__es_Contabilidade.htm:
  // "Conta Patrimônio Líquido: se o saldo desta for negativo, na emissão do balanço o sistema vai posicionar o grupo do
  // Patrimônio Líquido logo abaixo do Ativo, alterando a descrição para Passivo a Descoberto, conforme determinado pela Resolução CFC nº 847/99."
  const plAbaixoDoAtivo = isPassivoDescoberto && posicionarPassivoDescobertoAbaixoAtivo;
  const totalColunaEsquerda = plAbaixoDoAtivo ? totalAtivo + Math.abs(totalPL) : totalAtivo;
  const totalColunaDireita = plAbaixoDoAtivo ? totalPassivo : totalPassivo + totalPL;

  const handleExportCSV = () => {
    const headers = ['Grupo Patrimonial', 'Classificação', 'Descrição da Conta', 'Tipo', 'Saldo (R$)'];
    const rows: (string | number)[][] = [
      ...ativo.map(i => ['ATIVO', i.classificacao, i.nome, i.tipo === 'S' ? 'Sintética' : 'Analítica', i.saldo]),
      ...passivo.map(i => ['PASSIVO', i.classificacao, i.nome, i.tipo === 'S' ? 'Sintética' : 'Analítica', i.saldo]),
      ...patrimonioLiquido.map(i => [
        isPassivoDescoberto ? 'PASSIVO A DESCOBERTO' : 'PATRIMÔNIO LÍQUIDO',
        i.classificacao,
        i.nome,
        i.tipo === 'S' ? 'Sintética' : 'Analítica',
        i.saldo
      ]),
      ['TOTAL', '', 'TOTAL DO ATIVO', 'TOTAL', totalAtivo],
      ['TOTAL', '', 'TOTAL DO PASSIVO + PL', 'TOTAL', totalPassivo + totalPL]
    ];
    exportToCSV(`Balanco_Patrimonial_${new Date().toISOString().split('T')[0]}`, rows, headers);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto p-4 select-none">
      {/* Barra de Opções do Balanço (Balan_o_Contabilidade.htm) */}
      <div className="mb-3 px-4 py-2.5 bg-[#181818] border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-neutral-400 text-[11px]">Grau máximo:</span>
            <select
              value={grauMaximo}
              onChange={(e) => setGrauMaximo(Number(e.target.value))}
              className="bg-[#121212] border border-white/10 rounded px-2 py-0.5 text-neutral-200 outline-none text-[11px]"
            >
              <option value={1}>Grau 1 (Grupos)</option>
              <option value={2}>Grau 2 (Subgrupos)</option>
              <option value={3}>Grau 3 (Sintético)</option>
              <option value={4}>Grau 4</option>
              <option value={5}>Grau 5 (Analítico)</option>
            </select>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300 text-[11px]">
            <input
              type="checkbox"
              checked={imprimirClassificacao}
              onChange={(e) => setImprimirClassificacao(e.target.checked)}
              className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
            />
            <span>Imprimir classificação</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300 text-[11px]">
            <input
              type="checkbox"
              checked={desconsiderarZeramento}
              onChange={(e) => setDesconsiderarZeramento(e.target.checked)}
              className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
            />
            <span>Desconsiderar zeramento</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300 text-[11px]">
            <input
              type="checkbox"
              checked={destacarSinteticas}
              onChange={(e) => setDestacarSinteticas(e.target.checked)}
              className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
            />
            <span>Destacar sintéticas</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-300 text-[11px]">
            <input
              type="checkbox"
              checked={imprimirValorPorExtenso}
              onChange={(e) => setImprimirValorPorExtenso(e.target.checked)}
              className="rounded bg-neutral-900 border-white/20 text-blue-600 focus:ring-0"
            />
            <span>Valor Ativo/Passivo por extenso</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDescricaoModal(!showDescricaoModal)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 transition-colors text-[11px]"
            title="Botão Descrição final... (Balan_o_Contabilidade.htm)"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Descrição final...</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 transition-colors text-[11px]"
            title="Exportar Balanço Patrimonial para Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Editor inline do Botão Descrição Final (Balan_o_Contabilidade.htm) */}
      {showDescricaoModal && (
        <div className="mb-3 p-3.5 bg-[#1c1c1c] border border-sky-500/30 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sky-300">
              Descrição / Observação Final do Balanço Patrimonial (Impresso no rodapé do demonstrativo)
            </span>
            <button
              onClick={() => setShowDescricaoModal(false)}
              className="text-neutral-400 hover:text-white text-[11px]"
            >
              Fechar ✕
            </button>
          </div>
          <textarea
            rows={2}
            value={descricaoFinal}
            onChange={(e) => setDescricaoFinal(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-lg p-2 text-neutral-200 outline-none text-xs"
            placeholder="Digite a observação ou termo de reconhecimento do Balanço..."
          />
        </div>
      )}

      {/* Top Banner de Validação Contábil do Balanço */}
      <div className={`p-4 rounded-xl border mb-4 flex items-center justify-between shadow-lg ${
        isEquilibrado
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
      }`}>
        <div className="flex items-center space-x-3">
          {isEquilibrado ? (
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm">
              {isEquilibrado
                ? 'Balanço Patrimonial Balanceado & Conforme ITG 1000 / NBC TG'
                : 'Atenção: Balanço Patrimonial com Resultado em Aberto (Pré-Zeramento)'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isEquilibrado
                ? 'Equação Patrimonial Estrita Satisfeita: Ativo = Passivo + Patrimônio Líquido'
                : 'Para igualar Ativo e Passivo + PL, execute a Apuração de Resultado (Zeramento) ou confira partidas pendentes.'}
            </p>
          </div>
        </div>

        {/* Cifras de Fechamento */}
        <div className="flex items-center space-x-6 text-xs font-mono">
          <div className="text-right">
            <span className="text-neutral-400 text-[10px] uppercase block">
              {plAbaixoDoAtivo ? 'Ativo + Passivo a Descoberto:' : 'Total do Ativo:'}
            </span>
            <strong className="text-blue-400 text-sm">
              R$ {totalColunaEsquerda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <span className="text-neutral-600 font-sans text-lg">=</span>
          <div className="text-right">
            <span className="text-neutral-400 text-[10px] uppercase block">
              {plAbaixoDoAtivo ? 'Passivo Exigível:' : 'Passivo + PL:'}
            </span>
            <strong className="text-indigo-400 text-sm">
              R$ {totalColunaDireita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>

      {/* Alerta de Passivo a Descoberto (se PL for negativo - Resolução CFC nº 847/99) */}
      {isPassivoDescoberto && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Resolução CFC nº 847/99 (Opções Contabilidade):</strong> O Patrimônio Líquido encontra-se negativo (devedor). O sistema altera a descrição para <em>"Passivo a Descoberto"</em> e permite posicioná-lo logo abaixo do Ativo.
            </span>
          </div>
          <label className="flex items-center space-x-1.5 cursor-pointer text-amber-200 whitespace-nowrap font-medium">
            <input
              type="checkbox"
              checked={posicionarPassivoDescobertoAbaixoAtivo}
              onChange={(e) => setPosicionarPassivoDescobertoAbaixoAtivo(e.target.checked)}
              className="rounded bg-neutral-900 border-amber-500/40 text-amber-500 focus:ring-0"
            />
            <span>Posicionar abaixo do Ativo (CFC 847/99)</span>
          </label>
        </div>
      )}

      {/* Layout Duas Colunas: Ativo (Esquerda) vs Passivo e PL (Direita) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coluna 1: ATIVO (+ Passivo a Descoberto quando posicionado abaixo do Ativo conforme Op__es_Contabilidade.htm) */}
        <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow-lg flex flex-col space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="font-bold text-neutral-100 text-sm">1. ATIVO TOTAL</h2>
              </div>
              <span className="font-mono font-bold text-blue-400 text-sm">
                R$ {totalAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[500px] pr-1">
              {ativo.map((item, idx) => {
                const isSintetica = item.tipo === 'S';
                const padding = (item.grau - 1) * 14;

                return (
                  <div
                    key={idx}
                    style={{ paddingLeft: `${padding}px` }}
                    className={`flex items-center justify-between py-1.5 px-2 rounded text-xs transition-colors ${
                      isSintetica
                        ? `bg-neutral-900/50 ${destacarSinteticas ? 'font-semibold text-neutral-100' : 'text-neutral-300'}`
                        : 'text-neutral-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {imprimirClassificacao && (
                        <span className="font-mono text-neutral-500 text-[11px]">{item.classificacao}</span>
                      )}
                      <span className="truncate">{item.nome}</span>
                    </div>
                    <span className={`font-mono ${isSintetica && destacarSinteticas ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>
                      {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Se Passivo a Descoberto estiver posicionado logo abaixo do Ativo (Resolução CFC nº 847/99 / Op__es_Contabilidade.htm) */}
          {plAbaixoDoAtivo && (
            <div className="border-t border-amber-500/30 pt-3">
              <div className="flex items-center justify-between pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="font-bold text-amber-300 text-sm">
                    2.03. PASSIVO A DESCOBERTO (Res. CFC nº 847/99)
                  </h2>
                </div>
                <span className="font-mono font-bold text-sm text-amber-400">
                  R$ {Math.abs(totalPL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                {patrimonioLiquido.map((item, idx) => {
                  const isSintetica = item.tipo === 'S';
                  const padding = (item.grau - 1) * 14;
                  return (
                    <div
                      key={idx}
                      style={{ paddingLeft: `${padding}px` }}
                      className={`flex items-center justify-between py-1.5 px-2 rounded text-xs transition-colors ${
                        isSintetica
                          ? `bg-neutral-900/50 ${destacarSinteticas ? 'font-semibold text-neutral-100' : 'text-neutral-300'}`
                          : 'text-neutral-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {imprimirClassificacao && (
                          <span className="font-mono text-neutral-500 text-[11px]">{item.classificacao}</span>
                        )}
                        <span className="truncate">
                          {item.classificacao === '2.03' ? 'PASSIVO A DESCOBERTO' : item.nome}
                        </span>
                      </div>
                      <span className="font-mono text-amber-400">
                        {Math.abs(item.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 2: PASSIVO E PATRIMÔNIO LÍQUIDO */}
        <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow-lg flex flex-col space-y-4">
          {/* 2.1 Passivo Circulante e Não Circulante */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h2 className="font-bold text-neutral-100 text-sm">2. PASSIVO EXIGÍVEL</h2>
              </div>
              <span className="font-mono font-bold text-indigo-400 text-sm">
                R$ {totalPassivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
              {passivo.map((item, idx) => {
                const isSintetica = item.tipo === 'S';
                const padding = (item.grau - 1) * 14;

                return (
                  <div
                    key={idx}
                    style={{ paddingLeft: `${padding}px` }}
                    className={`flex items-center justify-between py-1.5 px-2 rounded text-xs transition-colors ${
                      isSintetica
                        ? `bg-neutral-900/50 ${destacarSinteticas ? 'font-semibold text-neutral-100' : 'text-neutral-300'}`
                        : 'text-neutral-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {imprimirClassificacao && (
                        <span className="font-mono text-neutral-500 text-[11px]">{item.classificacao}</span>
                      )}
                      <span className="truncate">{item.nome}</span>
                    </div>
                    <span className={`font-mono ${isSintetica && destacarSinteticas ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>
                      {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2.2 Patrimônio Líquido (quando positivo ou quando não posicionado abaixo do Ativo) */}
          {!plAbaixoDoAtivo && (
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPassivoDescoberto ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <h2 className="font-bold text-neutral-100 text-sm">
                    {isPassivoDescoberto ? '2.03. PASSIVO A DESCOBERTO' : '2.03. PATRIMÔNIO LÍQUIDO'}
                  </h2>
                </div>
                <span className={`font-mono font-bold text-sm ${isPassivoDescoberto ? 'text-amber-400' : 'text-emerald-400'}`}>
                  R$ {totalPL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                {patrimonioLiquido.map((item, idx) => {
                  const isSintetica = item.tipo === 'S';
                  const padding = (item.grau - 1) * 14;

                  return (
                    <div
                      key={idx}
                      style={{ paddingLeft: `${padding}px` }}
                      className={`flex items-center justify-between py-1.5 px-2 rounded text-xs transition-colors ${
                        isSintetica
                          ? `bg-neutral-900/50 ${destacarSinteticas ? 'font-semibold text-neutral-100' : 'text-neutral-300'}`
                          : 'text-neutral-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {imprimirClassificacao && (
                          <span className="font-mono text-neutral-500 text-[11px]">{item.classificacao}</span>
                        )}
                        <span className="truncate">{item.nome}</span>
                      </div>
                      <span className={`font-mono ${isSintetica && destacarSinteticas ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>
                        {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé Oficial: Imprime Valor do Ativo/Passivo por Extenso & Descrição Final (Balan_o_Contabilidade.htm) */}
      {(imprimirValorPorExtenso || descricaoFinal) && (
        <div className="mt-4 p-4 bg-[#181818] border border-white/10 rounded-xl space-y-2 text-xs">
          {imprimirValorPorExtenso && isEquilibrado && (
            <div className="text-neutral-200">
              <span className="text-neutral-400 font-semibold uppercase text-[10px] block mb-0.5">
                Valor do Ativo / Passivo por Extenso (Impresso somente quando Ativo e Passivo são iguais):
              </span>
              <p className="font-mono text-emerald-400">
                R$ {totalColunaEsquerda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({numeroMonetarioPorExtenso(totalColunaEsquerda)})
              </p>
            </div>
          )}
          {descricaoFinal && (
            <div className="text-neutral-300 pt-1 border-t border-white/5">
              <span className="text-neutral-500 font-semibold uppercase text-[10px] block mb-0.5">
                Descrição Final do Balanço:
              </span>
              <p className="italic">{descricaoFinal}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

