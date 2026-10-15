import React, { useState, useEffect, useRef } from 'react';
import { ContaContabil, HistoricoPadrao, LancamentoContabil, PartidaMultiplaItem, CentroCusto, LoteContabil, LancamentoPadrao } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  Plus, 
  Trash2, 
  Copy, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Search, 
  Download,
  RotateCcw,
  Edit2,
  PieChart,
  Repeat,
  Save,
  Check
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface LancamentosModuleProps {
  contas: ContaContabil[];
  historicos: HistoricoPadrao[];
  lancamentos: LancamentoContabil[];
  empresaId: number;
  onAddLancamento: (l: Omit<LancamentoContabil, 'id' | 'createdAt'>) => void;
  onDeleteLancamento: (id: number) => void;
  onDuplicateLancamento: (l: LancamentoContabil) => void;
  onEditLancamento?: (l: LancamentoContabil) => void;
  onEstornoLancamento?: (id: number) => void;
}

export const LancamentosModule: React.FC<LancamentosModuleProps> = ({
  contas,
  historicos,
  lancamentos,
  empresaId,
  onAddLancamento,
  onDeleteLancamento,
  onDuplicateLancamento,
  onEditLancamento,
  onEstornoLancamento
}) => {
  // Modo de Partida: Simples (1D x 1C) vs Composta/Múltipla (1:N, N:N)
  const [modo, setModo] = useState<'SIMPLES' | 'MULTIPLA'>('SIMPLES');

  // Centros de custo, lotes e lançamentos padrão da empresa
  const centrosCusto = dbService.getCentrosCusto(empresaId);
  const lotes = dbService.getLotes(empresaId);
  const lancamentosPadrao = dbService.getLancamentosPadrao(empresaId);

  // Form Partida Simples
  const [dataLanc, setDataLanc] = useState(new Date().toISOString().split('T')[0]);
  const [codDebito, setCodDebito] = useState<string>('');
  const [codCredito, setCodCredito] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [codHistorico, setCodHistorico] = useState<string>('');
  const [complemento, setComplemento] = useState<string>('');
  const [centroCustoId, setCentroCustoId] = useState<number>(0);
  const [loteId, setLoteId] = useState<number>(lotes[0]?.id || 1);
  const [erroMsg, setErroMsg] = useState<string>('');

  // Partida Múltipla Grade
  const [multiplasItens, setMultiplasItens] = useState<PartidaMultiplaItem[]>([
    { id: '1', tipo: 'DEBITO', contaId: 0, valor: 0, complemento: '' },
    { id: '2', tipo: 'CREDITO', contaId: 0, valor: 0, complemento: '' }
  ]);

  // Modal Edição Direta
  const [editandoLancamento, setEditandoLancamento] = useState<LancamentoContabil | null>(null);
  const [editDebitoId, setEditDebitoId] = useState<number>(0);
  const [editCreditoId, setEditCreditoId] = useState<number>(0);
  const [editValor, setEditValor] = useState<string>('');
  const [editComplemento, setEditComplemento] = useState<string>('');
  const [editData, setEditData] = useState<string>('');

  // Modal F11 (Contas e Históricos Recentes)
  const [showF11Modal, setShowF11Modal] = useState<boolean>(false);

  // Filtro de listagem
  const [filtroTexto, setFiltroTexto] = useState('');

  // Refs para navegação fluida por Enter
  const inputDebitoRef = useRef<HTMLInputElement>(null);
  const inputCreditoRef = useRef<HTMLInputElement>(null);
  const inputValorRef = useRef<HTMLInputElement>(null);
  const inputHistRef = useRef<HTMLInputElement>(null);
  const inputComplRef = useRef<HTMLInputElement>(null);

  // Contas analíticas
  const contasAnaliticas = contas.filter(c => c.tipo === 'A');

  // Encontrar conta selecionada no form
  const contaDebitoObj = contas.find(c => c.codigoReduzido.toString() === codDebito || c.classificacao === codDebito);
  const contaCreditoObj = contas.find(c => c.codigoReduzido.toString() === codCredito || c.classificacao === codCredito);
  const historicoObj = historicos.find(h => h.codigo.toString() === codHistorico);

  // Escuta tecla F11 globalmente dentro do módulo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        setShowF11Modal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Aplicação Rápida de Lançamento Padrão
  const handleAplicarLancamentoPadrao = (padraoId: number) => {
    const p = lancamentosPadrao.find(item => item.id === padraoId);
    if (!p) return;

    const cDeb = contas.find(c => c.id === p.contaDebitoId);
    const cCred = contas.find(c => c.id === p.contaCreditoId);
    const h = historicos.find(hist => hist.id === p.historicoId);

    if (cDeb) setCodDebito(cDeb.codigoReduzido.toString());
    if (cCred) setCodCredito(cCred.codigoReduzido.toString());
    if (h) setCodHistorico(h.codigo.toString());
    if (p.complementoPadrao) setComplemento(p.complementoPadrao);
  };

  // Gravar Partida Simples
  const handleGravarSimples = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErroMsg('');

    if (!contaDebitoObj || contaDebitoObj.tipo !== 'A') {
      setErroMsg('Selecione uma Conta Débito válida e do tipo ANALÍTICA.');
      inputDebitoRef.current?.focus();
      return;
    }
    if (!contaCreditoObj || contaCreditoObj.tipo !== 'A') {
      setErroMsg('Selecione uma Conta Crédito válida e do tipo ANALÍTICA.');
      inputCreditoRef.current?.focus();
      return;
    }
    if (contaDebitoObj.id === contaCreditoObj.id) {
      setErroMsg('A conta de Débito não pode ser idêntica à conta de Crédito.');
      return;
    }
    const numValor = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numValor) || numValor <= 0) {
      setErroMsg('Informe um valor monetário positivo válido.');
      inputValorRef.current?.focus();
      return;
    }

    onAddLancamento({
      empresaId,
      numeroPartida: lancamentos.length + 1,
      loteId: loteId || undefined,
      dataLancamento: dataLanc,
      tipoPartida: 'SIMPLES',
      contaDebitoId: contaDebitoObj.id,
      contaCreditoId: contaCreditoObj.id,
      valor: numValor,
      centroCustoId: centroCustoId || undefined,
      historicoId: historicoObj?.id,
      complementoHistorico: complemento
    });

    // Limpa campos para o próximo lançamento mantendo a data e foca no débito
    setCodDebito('');
    setCodCredito('');
    setValor('');
    setCodHistorico('');
    setComplemento('');
    setTimeout(() => inputDebitoRef.current?.focus(), 50);
  };

  // Gravar Partida Múltipla Garantindo o Mesmo numeroPartida
  const handleGravarMultipla = () => {
    const debitos = multiplasItens.filter(i => i.tipo === 'DEBITO' && i.contaId && i.valor > 0);
    const creditos = multiplasItens.filter(i => i.tipo === 'CREDITO' && i.contaId && i.valor > 0);

    const totDeb = debitos.reduce((acc, i) => acc + i.valor, 0);
    const totCred = creditos.reduce((acc, i) => acc + i.valor, 0);

    if (Math.abs(totDeb - totCred) > 0.01) {
      alert('Total de Débitos diverge do Total de Créditos na Partida Múltipla.');
      return;
    }

    const proximoNumeroPartida = lancamentos.length + 1;

    // Casos de Decomposição: 1:N (1 Débito para N Créditos), N:1 (N Débitos para 1 Crédito), ou N:N
    if (debitos.length === 1) {
      // 1:N
      const debUnico = debitos[0];
      for (const c of creditos) {
        onAddLancamento({
          empresaId,
          numeroPartida: proximoNumeroPartida,
          loteId: loteId || undefined,
          dataLancamento: dataLanc,
          tipoPartida: 'MULTIPLA',
          contaDebitoId: debUnico.contaId,
          contaCreditoId: c.contaId,
          valor: c.valor,
          centroCustoId: c.centroCustoId || centroCustoId || undefined,
          complementoHistorico: c.complemento || debUnico.complemento || 'Partida Múltipla Composta'
        });
      }
    } else if (creditos.length === 1) {
      // N:1
      const credUnico = creditos[0];
      for (const d of debitos) {
        onAddLancamento({
          empresaId,
          numeroPartida: proximoNumeroPartida,
          loteId: loteId || undefined,
          dataLancamento: dataLanc,
          tipoPartida: 'MULTIPLA',
          contaDebitoId: d.contaId,
          contaCreditoId: credUnico.contaId,
          valor: d.valor,
          centroCustoId: d.centroCustoId || centroCustoId || undefined,
          complementoHistorico: d.complemento || credUnico.complemento || 'Partida Múltipla Composta'
        });
      }
    } else {
      // N:N genérico
      for (let i = 0; i < Math.max(debitos.length, creditos.length); i++) {
        const d = debitos[i % debitos.length];
        const c = creditos[i % creditos.length];
        const valParcial = Math.min(d.valor, c.valor);
        onAddLancamento({
          empresaId,
          numeroPartida: proximoNumeroPartida,
          loteId: loteId || undefined,
          dataLancamento: dataLanc,
          tipoPartida: 'MULTIPLA',
          contaDebitoId: d.contaId,
          contaCreditoId: c.contaId,
          valor: valParcial,
          centroCustoId: centroCustoId || undefined,
          complementoHistorico: d.complemento || c.complemento || 'Partida Múltipla N:N'
        });
      }
    }

    // Reset da grade múltipla
    setMultiplasItens([
      { id: '1', tipo: 'DEBITO', contaId: 0, valor: 0, complemento: '' },
      { id: '2', tipo: 'CREDITO', contaId: 0, valor: 0, complemento: '' }
    ]);
  };

  // Abrir Modal de Edição Direta
  const handleAbrirEditar = (l: LancamentoContabil) => {
    setEditandoLancamento(l);
    setEditDebitoId(l.contaDebitoId || 0);
    setEditCreditoId(l.contaCreditoId || 0);
    setEditValor(l.valor.toFixed(2).replace('.', ','));
    setEditComplemento(l.complementoHistorico);
    setEditData(l.dataLancamento);
  };

  const handleSalvarEdicao = () => {
    if (!editandoLancamento) return;
    const valNum = parseFloat(editValor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valNum) || valNum <= 0) return;

    const atualizado: LancamentoContabil = {
      ...editandoLancamento,
      contaDebitoId: editDebitoId,
      contaCreditoId: editCreditoId,
      valor: valNum,
      complementoHistorico: editComplemento,
      dataLancamento: editData
    };

    if (onEditLancamento) {
      onEditLancamento(atualizado);
    } else {
      dbService.updateLancamento(atualizado);
    }
    setEditandoLancamento(null);
  };

  // Estorno Automático 1-Clique (Inverte Débito e Crédito)
  const handleEstorno = (l: LancamentoContabil) => {
    if (confirm(`Confirmar estorno automático da partida nº ${l.numeroPartida} no valor de R$ ${l.valor.toFixed(2)}?`)) {
      if (onEstornoLancamento) {
        onEstornoLancamento(l.id);
      } else {
        dbService.estornarLancamento(l.id);
      }
    }
  };

  // Cálculo DxC de Partida Múltipla
  const totalMultiploDebito = multiplasItens.filter(i => i.tipo === 'DEBITO').reduce((acc, i) => acc + (i.valor || 0), 0);
  const totalMultiploCredito = multiplasItens.filter(i => i.tipo === 'CREDITO').reduce((acc, i) => acc + (i.valor || 0), 0);
  const diferencaMultipla = Math.abs(totalMultiploDebito - totalMultiploCredito);

  // Filtragem da lista
  const lancamentosFiltrados = lancamentos.filter(l => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    const deb = contas.find(c => c.id === l.contaDebitoId)?.nome.toLowerCase() || '';
    const cred = contas.find(c => c.id === l.contaCreditoId)?.nome.toLowerCase() || '';
    const compl = l.complementoHistorico.toLowerCase();
    return deb.includes(txt) || cred.includes(txt) || compl.includes(txt) || l.valor.toString().includes(txt) || l.numeroPartida.toString().includes(txt);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Top Header do Módulo: Alternador Simples / Múltipla + Indicador DxC */}
      <div className="px-4 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Tipo de Partida:</span>
          <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setModo('SIMPLES')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                modo === 'SIMPLES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Partida Simples (1D x 1C)
            </button>
            <button
              onClick={() => setModo('MULTIPLA')}
              className={`px-3 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
                modo === 'MULTIPLA'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Partida Múltipla (1:N / N:N)</span>
            </button>
          </div>
        </div>

        {/* Lançamento Padrão & Atalho F11 */}
        <div className="flex items-center space-x-2">
          {lancamentosPadrao.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) handleAplicarLancamentoPadrao(Number(e.target.value));
              }}
              defaultValue=""
              className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1 text-xs text-neutral-300 outline-none max-w-[200px]"
            >
              <option value="" disabled>Lançamento Padrão...</option>
              {lancamentosPadrao.map(p => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.descricao}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowF11Modal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-800/80 hover:bg-neutral-800 rounded border border-white/10 text-neutral-300 text-xs transition-colors"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>Consultar Frequentes</span>
            <kbd className="bg-neutral-900 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10">F11</kbd>
          </button>
        </div>
      </div>

      {/* Formulário Partida Simples */}
      {modo === 'SIMPLES' ? (
        <form onSubmit={handleGravarSimples} className="p-4 bg-[#1e1e1e] border-b border-white/10">
          {erroMsg && (
            <div className="mb-3 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{erroMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-12 gap-3 text-xs">
            {/* 1. Data */}
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Data Lançamento</label>
              <input
                type="date"
                value={dataLanc}
                onChange={(e) => setDataLanc(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
              />
            </div>

            {/* 2. Conta Débito */}
            <div className="col-span-3">
              <label className="block text-[11px] font-medium text-blue-400 mb-1">Conta Débito (Cód / Nome)</label>
              <div className="flex space-x-1.5">
                <input
                  ref={inputDebitoRef}
                  type="text"
                  placeholder="Red."
                  value={codDebito}
                  onChange={(e) => setCodDebito(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inputCreditoRef.current?.focus();
                    }
                  }}
                  className="w-16 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
                />
                <select
                  value={contaDebitoObj?.id || ''}
                  onChange={(e) => {
                    const c = contas.find(item => item.id === Number(e.target.value));
                    if (c) setCodDebito(c.codigoReduzido.toString());
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 focus:border-blue-500 outline-none truncate"
                >
                  <option value="">Selecione Conta Débito...</option>
                  {contasAnaliticas.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Conta Crédito */}
            <div className="col-span-3">
              <label className="block text-[11px] font-medium text-indigo-400 mb-1">Conta Crédito (Cód / Nome)</label>
              <div className="flex space-x-1.5">
                <input
                  ref={inputCreditoRef}
                  type="text"
                  placeholder="Red."
                  value={codCredito}
                  onChange={(e) => setCodCredito(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inputValorRef.current?.focus();
                    }
                  }}
                  className="w-16 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
                />
                <select
                  value={contaCreditoObj?.id || ''}
                  onChange={(e) => {
                    const c = contas.find(item => item.id === Number(e.target.value));
                    if (c) setCodCredito(c.codigoReduzido.toString());
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 focus:border-blue-500 outline-none truncate"
                >
                  <option value="">Selecione Conta Crédito...</option>
                  {contasAnaliticas.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Valor */}
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-emerald-400 mb-1">Valor da Partida (R$)</label>
              <input
                ref={inputValorRef}
                type="text"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    inputHistRef.current?.focus();
                  }
                }}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-semibold text-right focus:border-blue-500 outline-none"
              />
            </div>

            {/* 5. Lote Contábil */}
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Lote</label>
              <select
                value={loteId}
                onChange={(e) => setLoteId(Number(e.target.value))}
                className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 outline-none"
              >
                {lotes.map(l => (
                  <option key={l.id} value={l.id}>Lote #{l.numeroLote}</option>
                ))}
              </select>
            </div>

            {/* 6. Histórico Padrão */}
            <div className="col-span-4">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Histórico Padrão</label>
              <div className="flex space-x-1.5">
                <input
                  ref={inputHistRef}
                  type="text"
                  placeholder="Cód."
                  value={codHistorico}
                  onChange={(e) => setCodHistorico(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inputComplRef.current?.focus();
                    }
                  }}
                  className="w-16 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-100 font-mono focus:border-blue-500 outline-none"
                />
                <select
                  value={historicoObj?.id || ''}
                  onChange={(e) => {
                    const h = historicos.find(item => item.id === Number(e.target.value));
                    if (h) setCodHistorico(h.codigo.toString());
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 focus:border-blue-500 outline-none truncate"
                >
                  <option value="">Selecione Histórico...</option>
                  {historicos.map((h) => (
                    <option key={h.id} value={h.id}>{h.codigo} - {h.descricao}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 7. Complemento */}
            <div className="col-span-6">
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">Complemento / Descrição</label>
              <input
                ref={inputComplRef}
                type="text"
                placeholder="Ex: Ref. NF-e 4921 Prestação de Serviços de Consultoria"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGravarSimples();
                  }
                }}
                className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 focus:border-blue-500 outline-none"
              />
            </div>

            {/* 8. Botão Gravar */}
            <div className="col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded shadow transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Gravar Partida</span>
                <kbd className="bg-blue-700/60 px-1 rounded text-[10px] font-mono">↵</kbd>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Partida Múltipla / Composta */
        <div className="p-4 bg-[#1e1e1e] border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-neutral-300">Grade de Lançamento Composto (Mesmo Nº de Partida):</span>
            </div>

            <div className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center space-x-2 ${
              diferencaMultipla === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
            }`}>
              <span>Déb: R$ {totalMultiploDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>•</span>
              <span>Créd: R$ {totalMultiploCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>•</span>
              <strong>DxC: R$ {diferencaMultipla.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            {multiplasItens.map((item, idx) => (
              <div key={item.id} className="flex items-center space-x-2 text-xs">
                <span className="font-mono text-neutral-500 w-4">{idx + 1}.</span>
                <select
                  value={item.tipo}
                  onChange={(e) => {
                    const next = [...multiplasItens];
                    next[idx].tipo = e.target.value as 'DEBITO' | 'CREDITO';
                    setMultiplasItens(next);
                  }}
                  className={`w-24 px-2 py-1 rounded font-semibold border ${
                    item.tipo === 'DEBITO' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  <option value="DEBITO">DÉBITO</option>
                  <option value="CREDITO">CRÉDITO</option>
                </select>

                <select
                  value={item.contaId || ''}
                  onChange={(e) => {
                    const next = [...multiplasItens];
                    next[idx].contaId = Number(e.target.value);
                    setMultiplasItens(next);
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1 text-neutral-200 outline-none truncate"
                >
                  <option value="">Selecione Conta Analítica...</option>
                  {contasAnaliticas.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Valor R$"
                  value={item.valor || ''}
                  onChange={(e) => {
                    const next = [...multiplasItens];
                    next[idx].valor = parseFloat(e.target.value) || 0;
                    setMultiplasItens(next);
                  }}
                  className="w-32 bg-[#121212] border border-white/10 rounded px-2 py-1 text-right font-mono text-neutral-100 outline-none"
                />

                <input
                  type="text"
                  placeholder="Complemento de histórico..."
                  value={item.complemento}
                  onChange={(e) => {
                    const next = [...multiplasItens];
                    next[idx].complemento = e.target.value;
                    setMultiplasItens(next);
                  }}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-2 py-1 text-neutral-200 outline-none"
                />

                <button
                  onClick={() => {
                    if (multiplasItens.length > 2) {
                      setMultiplasItens(multiplasItens.filter((_, i) => i !== idx));
                    }
                  }}
                  className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setMultiplasItens([
                  ...multiplasItens,
                  { id: Date.now().toString(), tipo: 'CREDITO', contaId: 0, valor: 0, complemento: '' }
                ]);
              }}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Linha</span>
            </button>

            <button
              disabled={diferencaMultipla !== 0 || multiplasItens.some(i => !i.contaId || i.valor <= 0)}
              onClick={handleGravarMultipla}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded shadow transition-colors text-xs flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gravar Partida Múltipla</span>
            </button>
          </div>
        </div>
      )}

      {/* Grade de Lançamentos Registrados */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Diário de Lançamentos ({lancamentosFiltrados.length})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const headers = ['Partida', 'Data', 'Conta Débito', 'Conta Crédito', 'Valor', 'Histórico / Complemento'];
                const rows = lancamentosFiltrados.map(l => {
                  const deb = contas.find(c => c.id === l.contaDebitoId)?.nome || '';
                  const cred = contas.find(c => c.id === l.contaCreditoId)?.nome || '';
                  return [l.numeroPartida, l.dataLancamento, deb, cred, l.valor, l.complementoHistorico];
                });
                exportToCSV(`Lancamentos_Contabeis_${new Date().toISOString().split('T')[0]}`, rows, headers);
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filtrar por conta, valor ou histórico..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="bg-neutral-900 border border-white/10 rounded pl-8 pr-3 py-1 text-xs text-neutral-200 outline-none w-64 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tabela de Lançamentos */}
        <div className="flex-1 bg-[#181818] border border-white/10 rounded-lg overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-900/90 sticky top-0 border-b border-white/10 text-neutral-400 font-medium z-10">
              <tr>
                <th className="py-2 px-3 w-16 text-center">Partida</th>
                <th className="py-2 px-3 w-24">Data</th>
                <th className="py-2 px-3 w-48">Conta Débito</th>
                <th className="py-2 px-3 w-48">Conta Crédito</th>
                <th className="py-2 px-3 w-32 text-right">Valor (R$)</th>
                <th className="py-2 px-3">Histórico / Complemento</th>
                <th className="py-2 px-3 w-28 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {lancamentosFiltrados.map((l) => {
                const debito = contas.find(c => c.id === l.contaDebitoId);
                const credito = contas.find(c => c.id === l.contaCreditoId);
                const hist = historicos.find(h => h.id === l.historicoId);

                return (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-2 px-3 text-center font-mono text-neutral-500">#{l.numeroPartida}</td>
                    <td className="py-2 px-3 font-mono text-neutral-300">
                      {new Date(l.dataLancamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-blue-400">{debito?.nome || 'Conta Inexistente'}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">Red: {debito?.codigoReduzido} • {debito?.classificacao}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-indigo-400">{credito?.nome || 'Conta Inexistente'}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">Red: {credito?.codigoReduzido} • {credito?.classificacao}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">
                      {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-neutral-300">
                      {hist && <span className="font-semibold text-neutral-400 mr-1.5">[{hist.codigo}]</span>}
                      <span>{l.complementoHistorico || (hist?.descricao)}</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAbrirEditar(l)}
                          className="p-1 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 rounded"
                          title="Editar Lançamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEstorno(l)}
                          className="p-1 hover:bg-amber-500/20 text-neutral-400 hover:text-amber-300 rounded"
                          title="Estorno Automático (Inverter DxC)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateLancamento(l)}
                          className="p-1 hover:bg-blue-500/20 text-neutral-400 hover:text-blue-300 rounded"
                          title="Duplicar Partida"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLancamento(l.id)}
                          className="p-1 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edição Direta de Lançamento */}
      {editandoLancamento && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-neutral-100">
              Editar Lançamento #{editandoLancamento.numeroPartida}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Data:</label>
                  <input
                    type="date"
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Valor (R$):</label>
                  <input
                    type="text"
                    value={editValor}
                    onChange={(e) => setEditValor(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-bold text-right outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Conta Débito:</label>
                <select
                  value={editDebitoId}
                  onChange={(e) => setEditDebitoId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                >
                  {contasAnaliticas.map(c => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Conta Crédito:</label>
                <select
                  value={editCreditoId}
                  onChange={(e) => setEditCreditoId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                >
                  {contasAnaliticas.map(c => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Complemento / Descrição:</label>
                <input
                  type="text"
                  value={editComplemento}
                  onChange={(e) => setEditComplemento(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditandoLancamento(null)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEdicao}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal F11 */}
      {showF11Modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#202020] border border-white/10 rounded-xl shadow-2xl p-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-neutral-200">Consulta Rápida de Contas e Históricos (F11)</span>
              </div>
              <button onClick={() => setShowF11Modal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <span className="font-medium text-neutral-400 uppercase tracking-wider text-[10px]">Contas Analíticas Recorrentes:</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {contasAnaliticas.slice(0, 8).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCodDebito(c.codigoReduzido.toString());
                        setShowF11Modal(false);
                      }}
                      className="p-2 bg-neutral-900/60 border border-white/5 hover:border-blue-500 rounded text-left transition-colors"
                    >
                      <div className="font-medium text-neutral-200">{c.codigoReduzido} - {c.nome}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{c.classificacao}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium text-neutral-400 uppercase tracking-wider text-[10px]">Históricos Padrão Frequentes:</span>
                <div className="space-y-1 mt-1">
                  {historicos.slice(0, 5).map(h => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setCodHistorico(h.codigo.toString());
                        setShowF11Modal(false);
                      }}
                      className="w-full p-2 bg-neutral-900/60 border border-white/5 hover:border-blue-500 rounded text-left transition-colors"
                    >
                      <div className="font-medium text-neutral-300">[{h.codigo}] {h.descricao}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setShowF11Modal(false)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-200"
              >
                Fechar (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
