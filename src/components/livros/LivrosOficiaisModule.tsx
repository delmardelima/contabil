import React, { useState } from 'react';
import { ContaContabil, LancamentoContabil, Empresa } from '../../types/contabil';
import { ScrollText, BookOpen, FileCheck, Calendar, Filter } from 'lucide-react';

interface LivrosOficiaisModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  initialContaId?: number;
}

export const LivrosOficiaisModule: React.FC<LivrosOficiaisModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  initialContaId
}) => {
  const [tipoLivro, setTipoLivro] = useState<'DIARIO' | 'RAZAO' | 'TERMOS'>('DIARIO');
  const [selectedContaId, setSelectedContaId] = useState<number>(initialContaId || 0);

  // Ordena lançamentos cronologicamente para livros oficiais
  const lancamentosOrdenados = [...lancamentos].sort((a, b) => 
    new Date(a.dataLancamento).getTime() - new Date(b.dataLancamento).getTime() || a.numeroPartida - b.numeroPartida
  );

  // Filtra para o Razão de conta específica
  const lancamentosRazao = selectedContaId > 0
    ? lancamentosOrdenados.filter(l => l.contaDebitoId === selectedContaId || l.contaCreditoId === selectedContaId)
    : lancamentosOrdenados;

  const contaSelecionada = contas.find(c => c.id === selectedContaId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Top Header do Módulo de Livros Oficiais */}
      <div className="px-4 py-3 bg-[#1c1c1c] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setTipoLivro('DIARIO')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                tipoLivro === 'DIARIO' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Livro Diário Geral
            </button>
            <button
              onClick={() => setTipoLivro('RAZAO')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                tipoLivro === 'RAZAO' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Livro Razão Analítico
            </button>
            <button
              onClick={() => setTipoLivro('TERMOS')}
              className={`px-3 py-1 rounded font-medium transition-all flex items-center space-x-1 ${
                tipoLivro === 'TERMOS' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Termos Oficiais (Abertura/Encerramento)</span>
            </button>
          </div>

          {tipoLivro === 'RAZAO' && (
            <div className="flex items-center space-x-2">
              <span className="text-neutral-400">Filtrar Conta:</span>
              <select
                value={selectedContaId}
                onChange={(e) => setSelectedContaId(Number(e.target.value))}
                className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1 text-neutral-200 outline-none max-w-xs truncate"
              >
                <option value={0}>Todas as Contas Movimentadas</option>
                {contas.filter(c => c.tipo === 'A').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.codigoReduzido} - {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-neutral-400 font-mono text-[11px]">
          Exercício: {empresa.exercicioAtivo} • Livro nº 001
        </div>
      </div>

      {/* Conteúdo do Livro Selecionado */}
      <div className="flex-1 p-4 overflow-y-auto">
        {tipoLivro === 'DIARIO' && (
          <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
              <span>LIVRO DIÁRIO GERAL - REGISTRO CRONOLÓGICO DE TODAS AS TRANSAÇÕES</span>
              <span className="font-mono text-neutral-500">Total de {lancamentosOrdenados.length} partidas</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3 w-16 text-center">Partida</th>
                  <th className="py-2.5 px-3 w-24">Data</th>
                  <th className="py-2.5 px-3">Conta Contábil / Descrição da Transação</th>
                  <th className="py-2.5 px-3 w-32 text-right">Débito (R$)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Crédito (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {lancamentosOrdenados.map((l) => {
                  const debito = contas.find(c => c.id === l.contaDebitoId);
                  const credito = contas.find(c => c.id === l.contaCreditoId);

                  return (
                    <React.Fragment key={l.id}>
                      {/* Linha de Débito */}
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-center font-mono text-neutral-500" rowSpan={2}>
                          #{l.numeroPartida}
                        </td>
                        <td className="py-2 px-3 font-mono text-neutral-400" rowSpan={2}>
                          {new Date(l.dataLancamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-1 px-3">
                          <span className="font-semibold text-blue-400">D - {debito?.nome}</span>
                          <span className="text-[10px] text-neutral-500 font-mono ml-2">({debito?.classificacao})</span>
                        </td>
                        <td className="py-1 px-3 text-right font-mono font-semibold text-blue-400">
                          {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1 px-3 text-right font-mono text-neutral-600">-</td>
                      </tr>
                      {/* Linha de Crédito + Histórico */}
                      <tr className="hover:bg-white/[0.02] border-b border-white/10">
                        <td className="py-1 px-3 pb-2.5">
                          <div className="pl-4">
                            <span className="font-semibold text-indigo-400">C - {credito?.nome}</span>
                            <span className="text-[10px] text-neutral-500 font-mono ml-2">({credito?.classificacao})</span>
                            <div className="text-[11px] text-neutral-400 mt-0.5 italic">
                              Hist: {l.complementoHistorico || 'Transação ordinária'}
                            </div>
                          </div>
                        </td>
                        <td className="py-1 px-3 text-right font-mono text-neutral-600">-</td>
                        <td className="py-1 px-3 text-right font-mono font-semibold text-indigo-400">
                          {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tipoLivro === 'RAZAO' && (
          <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm text-neutral-100">
                  {contaSelecionada ? `${contaSelecionada.codigoReduzido} - ${contaSelecionada.nome}` : 'LIVRO RAZÃO CONTÁBIL GERAL'}
                </h3>
                {contaSelecionada && (
                  <p className="text-xs text-neutral-400 font-mono">
                    Classificação: {contaSelecionada.classificacao} • Natureza: {contaSelecionada.natureza === 'D' ? 'Devedora' : 'Credora'} • Saldo Anterior: R$ {contaSelecionada.saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-900 border-b border-white/10 text-neutral-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3 w-24">Data</th>
                  <th className="py-2.5 px-3 w-16 text-center">Partida</th>
                  <th className="py-2.5 px-3 w-48">Contrapartida</th>
                  <th className="py-2.5 px-3">Histórico</th>
                  <th className="py-2.5 px-3 w-28 text-right">Débito (R$)</th>
                  <th className="py-2.5 px-3 w-28 text-right">Crédito (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {lancamentosRazao.map((l) => {
                  const isDebito = l.contaDebitoId === selectedContaId;
                  const contrapartida = contas.find(c => c.id === (isDebito ? l.contaCreditoId : l.contaDebitoId));

                  return (
                    <tr key={l.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 font-mono text-neutral-400">
                        {new Date(l.dataLancamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-neutral-500">#{l.numeroPartida}</td>
                      <td className="py-2 px-3 font-medium text-neutral-300">{contrapartida?.nome || 'Diversos'}</td>
                      <td className="py-2 px-3 text-neutral-400">{l.complementoHistorico}</td>
                      <td className="py-2 px-3 text-right font-mono text-blue-400">
                        {isDebito || selectedContaId === 0 ? l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-indigo-400">
                        {!isDebito || selectedContaId === 0 ? l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tipoLivro === 'TERMOS' && (
          <div className="grid grid-cols-2 gap-4">
            {/* Termo de Abertura */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-center text-sm mb-4 uppercase tracking-wider text-neutral-100 border-b border-white/10 pb-3">
                TERMO DE ABERTURA
              </h3>
              <div className="text-xs text-neutral-300 leading-relaxed text-justify space-y-3 font-serif">
                <p>
                  Contém este livro o número <strong>001 (um)</strong>, destinado ao <strong>LIVRO DIÁRIO GERAL</strong> da empresa <strong>{empresa.razaoSocial}</strong>, inscrita no CNPJ sob o nº <strong>{empresa.cnpj}</strong>, com sede e foro jurídico na comarca competente.
                </p>
                <p>
                  O presente livro compõe-se de folhas numeradas tipograficamente em ordem sequencial, que servirão para a escrituração cronológica de todas as suas operações contábeis no exercício de <strong>{empresa.exercicioAtivo}</strong>.
                </p>
                <div className="pt-8 text-center space-y-6">
                  <div>
                    <div className="w-64 border-t border-neutral-400 mx-auto" />
                    <strong>{empresa.responsavelLegal}</strong>
                    <div className="text-[11px] text-neutral-400">Responsável Legal - CPF: {empresa.cpfResponsavel}</div>
                  </div>
                  <div>
                    <div className="w-64 border-t border-neutral-400 mx-auto" />
                    <strong>{empresa.contadorNome}</strong>
                    <div className="text-[11px] text-neutral-400">Contador Responsável - {empresa.contadorCRC}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Termo de Encerramento */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-center text-sm mb-4 uppercase tracking-wider text-neutral-100 border-b border-white/10 pb-3">
                TERMO DE ENCERRAMENTO
              </h3>
              <div className="text-xs text-neutral-300 leading-relaxed text-justify space-y-3 font-serif">
                <p>
                  Aos trinta e um dias do mês de dezembro do ano de <strong>{empresa.exercicioAtivo}</strong>, encerra-se o presente <strong>LIVRO DIÁRIO GERAL</strong>, número <strong>001</strong>, pertencente à sociedade empresária <strong>{empresa.razaoSocial}</strong>, CNPJ <strong>{empresa.cnpj}</strong>.
                </p>
                <p>
                  Declaramos sob as penas da lei que todas as operações patrimoniais e financeiras foram registradas em consonância com as Normas Brasileiras de Contabilidade (NBC TG / CPC) e a legislação societária vigente.
                </p>
                <div className="pt-8 text-center space-y-6">
                  <div>
                    <div className="w-64 border-t border-neutral-400 mx-auto" />
                    <strong>{empresa.responsavelLegal}</strong>
                    <div className="text-[11px] text-neutral-400">Responsável Legal - CPF: {empresa.cpfResponsavel}</div>
                  </div>
                  <div>
                    <div className="w-64 border-t border-neutral-400 mx-auto" />
                    <strong>{empresa.contadorNome}</strong>
                    <div className="text-[11px] text-neutral-400">Contador Responsável - {empresa.contadorCRC}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
