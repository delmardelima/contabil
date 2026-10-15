import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { FaturaHonorario, Empresa, ContaContabil } from '../../types/contabil';
import { 
  Receipt, 
  Plus, 
  Printer, 
  CheckCircle2, 
  Zap, 
  DollarSign, 
  Download, 
  CreditCard,
  Layers,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface FaturamentoHonorariosModuleProps {
  empresa: Empresa;
  empresas: Empresa[];
  contas: ContaContabil[];
  onOpenReportPreview?: (config: {
    tipo: 'RECIBO_HONORARIOS' | 'FATURA_HONORARIOS';
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
  }) => void;
  onIntegracaoSucesso?: () => void;
}

export const FaturamentoHonorariosModule: React.FC<FaturamentoHonorariosModuleProps> = ({
  empresa,
  empresas,
  contas,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [faturas, setFaturas] = useState<FaturaHonorario[]>(() => {
    return dbService.getFaturasHonorarios(empresa.competenciaAtiva);
  });
  const [mensagem, setMensagem] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'PENDENTE' | 'PAGO' | 'ATRASADO'>('TODOS');
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  // Modal Baixa de Recebimento
  const [faturaParaBaixar, setFaturaParaBaixar] = useState<FaturaHonorario | null>(null);
  const [contaRecebimentoId, setContaRecebimentoId] = useState<number>(() => {
    const b = contas.find(c => c.nome.toLowerCase().includes('banco') && c.tipo === 'A');
    return b ? b.id : contas[0]?.id || 1;
  });

  // Modal Serviço Extra Avulso
  const [showExtraModal, setShowExtraModal] = useState<boolean>(false);
  const [extraEmpresaId, setExtraEmpresaId] = useState<number>(empresa.id);
  const [extraDescricao, setExtraDescricao] = useState<string>('Alteração Contratual / JUCESP');
  const [extraValor, setExtraValor] = useState<string>('850,00');

  const contasAnaliticas = contas.filter(c => c.tipo === 'A');

  // Geração em lote das faturas com 1 clique para a competência
  const handleGerarLoteFaturas = () => {
    const contratos = dbService.getContratosHonorarios().filter(c => c.status === 'ATIVO');
    let count = 0;

    for (const cont of contratos) {
      // Verifica se já existe fatura
      const jaExiste = faturas.some(f => f.empresaId === cont.empresaId && f.competencia === empresa.competenciaAtiva);
      if (!jaExiste) {
        const valCont = cont.valorMensalBase ?? cont.valorMensal ?? 0;
        const novaFatura: FaturaHonorario = {
          id: Date.now() + cont.id,
          empresaId: cont.empresaId,
          competencia: empresa.competenciaAtiva,
          dataEmissao: new Date().toISOString().split('T')[0],
          dataVencimento: `${empresa.competenciaAtiva}-${cont.diaVencimento.toString().padStart(2, '0')}`,
          valorHonorarioBase: valCont,
          valorBase: valCont,
          servicosExtras: [],
          valorTotal: valCont,
          status: 'PENDENTE'
        };
        dbService.saveFaturaHonorario(novaFatura);
        count++;
      }
    }

    const atualizadas = dbService.getFaturasHonorarios(empresa.competenciaAtiva);
    setFaturas(atualizadas);
    setMensagem(`✅ Geração em lote concluída! ${count} novas faturas de honorários criadas para ${empresa.competenciaAtiva}.`);
  };

  // Salvar Serviço Extra
  const handleAdicionarExtra = () => {
    const val = parseFloat(extraValor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    // Busca fatura do cliente ou cria uma nova
    let fatura = faturas.find(f => f.empresaId === extraEmpresaId);
    if (!fatura) {
      fatura = {
        id: Date.now(),
        empresaId: extraEmpresaId,
        competencia: empresa.competenciaAtiva,
        dataEmissao: new Date().toISOString().split('T')[0],
        dataVencimento: `${empresa.competenciaAtiva}-15`,
        valorBase: 0,
        valorHonorarioBase: 0,
        servicosExtras: [],
        valorTotal: 0,
        status: 'PENDENTE'
      };
    }

    const extras = [...(fatura.servicosExtras || []), {
      descricao: extraDescricao.trim(),
      valor: val
    }];
    const valorBase = fatura.valorHonorarioBase ?? fatura.valorBase ?? 0;
    const totalExtra = extras.reduce((acc, s) => acc + s.valor, 0);

    const faturaAtualizada: FaturaHonorario = {
      ...fatura,
      valorHonorarioBase: valorBase,
      valorBase: valorBase,
      servicosExtras: extras,
      valorTotal: valorBase + totalExtra
    };

    dbService.saveFaturaHonorario(faturaAtualizada);
    setFaturas(dbService.getFaturasHonorarios(empresa.competenciaAtiva));
    setShowExtraModal(false);
    setMensagem(`Serviço extra adicionado com sucesso à fatura do cliente.`);
  };

  // Efetuar Baixa de Recebimento
  const handleConfirmarBaixa = () => {
    if (!faturaParaBaixar) return;

    const atualizada: FaturaHonorario = {
      ...faturaParaBaixar,
      status: 'PAGO',
      dataPagamento: new Date().toISOString().split('T')[0]
    };

    dbService.saveFaturaHonorario(atualizada);
    setFaturas(dbService.getFaturasHonorarios(empresa.competenciaAtiva));
    setFaturaParaBaixar(null);
    setMensagem(`✅ Fatura baixada como PAGA com sucesso!`);
  };

  // Integração Contábil Automática com 1 Clique (Honorários -> Contabilidade)
  const handleIntegrarContabilidade = () => {
    const res = dbService.gerarIntegracaoHonorariosContabil(
      empresa.id,
      empresa.competenciaAtiva
    );

    if (res.count === 0) {
      alert('Não há faturas liquidadas (PAGAS) para integração na competência.');
      return;
    }

    const numLote = res.lote.numeroLote || res.lote.numero;
    setMensagem(`⚡ Integração Contábil Concluída! Lote #${numLote} gerado com ${res.count} partidas dobradas de honorários (Total: R$ ${res.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    if (onIntegracaoSucesso) onIntegracaoSucesso();
  };

  // Imprimir Recibo / Fatura A4
  const handleImprimirFaturaA4 = (f: FaturaHonorario) => {
    const emp = empresas.find(e => e.id === f.empresaId);
    if (!onOpenReportPreview || !emp) return;

    const valorBase = f.valorHonorarioBase ?? f.valorBase ?? 0;
    const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = [
      { descricao: `Prestação de Serviços Contábeis Mensais - Comp. ${f.competencia}`, valor: valorBase }
    ];

    (f.servicosExtras || []).forEach(s => {
      linhas.push({ descricao: `(+) ${s.descricao}`, valor: s.valor });
    });

    linhas.push({
      descricao: '(=) VALOR TOTAL DA FATURA DE HONORÁRIOS',
      valor: f.valorTotal,
      isTotal: true
    });

    onOpenReportPreview({
      tipo: 'RECIBO_HONORARIOS',
      titulo: 'RECIBO & FATURA DE HONORÁRIOS CONTÁBEIS',
      subtitulo: `Cliente: ${emp.razaoSocial} • CNPJ: ${emp.cnpj} • Vencimento: ${f.dataVencimento} • Status: ${f.status}`,
      linhas
    });
  };

  const handleExportCSV = () => {
    const headers = ['Cliente', 'CNPJ', 'Vencimento', 'Valor Base', 'Serviços Extras', 'Valor Total', 'Status', 'Data Pagto'];
    const rows = faturasFiltradas.map(f => {
      const emp = empresas.find(e => e.id === f.empresaId);
      const extras = (f.servicosExtras || []).reduce((acc, s) => acc + s.valor, 0);
      const valorBase = f.valorHonorarioBase ?? f.valorBase ?? 0;
      return [
        emp?.razaoSocial || `Empresa ${f.empresaId}`,
        emp?.cnpj || '',
        f.dataVencimento,
        valorBase.toFixed(2),
        extras.toFixed(2),
        f.valorTotal.toFixed(2),
        f.status,
        f.dataPagamento || '-'
      ];
    });
    exportToCSV(`Faturamento_Honorarios_${empresa.competenciaAtiva}.csv`, headers, rows);
  };

  const faturasFiltradas = faturas.filter(f => {
    if (filtroStatus !== 'TODOS' && f.status !== filtroStatus) return false;
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    const emp = empresas.find(e => e.id === f.empresaId);
    return emp?.razaoSocial.toLowerCase().includes(txt) ||
           emp?.cnpj.includes(txt) ||
           f.valorTotal.toString().includes(txt);
  });

  const totalFaturasGeral = faturasFiltradas.reduce((acc, f) => acc + f.valorTotal, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Faturamento em Lote, Baixas & Recibos A4</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-medium">
                Competência: {empresa.competenciaAtiva}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Geração massiva de cobranças, serviços extras avulsos, baixa bancária e integração contábil.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleGerarLoteFaturas}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Faturar Todas as Empresas (Lote)</span>
          </button>

          <button
            onClick={() => setShowExtraModal(true)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Lançar Serviço Extra</span>
          </button>

          <button
            onClick={handleIntegrarContabilidade}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-md shadow-emerald-900/30"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Integrar Honorários na Contabilidade</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{mensagem}</span>
          </div>
          <button onClick={() => setMensagem('')} className="text-emerald-500 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="px-5 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-neutral-900 rounded-lg p-0.5 border border-white/10">
            {(['TODOS', 'PENDENTE', 'PAGO', 'ATRASADO'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filtroStatus === s ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {s === 'TODOS' ? 'Todas' : s}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-[#121212] border border-white/10 rounded px-2.5 py-1 w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou valor..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="bg-transparent text-neutral-200 outline-none w-full text-xs"
            />
          </div>
        </div>

        <div className="text-neutral-400 font-mono text-[11px] flex items-center space-x-4">
          <span>Faturas: <strong className="text-neutral-200">{faturasFiltradas.length}</strong></span>
          <span>•</span>
          <span>Total Faturado: <strong className="text-purple-400">R$ {totalFaturasGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>

      {/* Grade de Faturas */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px] z-10">
            <tr>
              <th className="py-2.5 px-3">Cliente / Empresa</th>
              <th className="py-2.5 px-3 w-28">Vencimento</th>
              <th className="py-2.5 px-3 w-28 text-right">Honorário Base</th>
              <th className="py-2.5 px-3 w-32 text-right">Serviços Extras</th>
              <th className="py-2.5 px-3 w-32 text-right">Valor Total</th>
              <th className="py-2.5 px-3 w-24 text-center">Status</th>
              <th className="py-2.5 px-3 w-28 text-center">Data Pagto</th>
              <th className="py-2.5 px-3 w-32 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[12px]">
            {faturasFiltradas.map((f) => {
              const emp = empresas.find(e => e.id === f.empresaId);
              const extrasTotal = (f.servicosExtras || []).reduce((acc, s) => acc + s.valor, 0);
              const valorBase = f.valorHonorarioBase ?? f.valorBase ?? 0;

              return (
                <tr key={f.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-neutral-100 font-bold font-sans">
                    {emp?.razaoSocial || `Empresa ID ${f.empresaId}`}
                    <span className="block text-[10px] text-neutral-400 font-mono font-normal">{emp?.cnpj}</span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300">{f.dataVencimento}</td>
                  <td className="py-2.5 px-3 text-right text-neutral-200">
                    R$ {valorBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-400">
                    {extrasTotal > 0 ? `+ R$ ${extrasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-neutral-100 text-sm">
                    R$ {f.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.status === 'PAGO' ? 'bg-emerald-500/20 text-emerald-400' :
                      f.status === 'ATRASADO' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-400">
                    {f.dataPagamento || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {f.status !== 'PAGO' && (
                        <button
                          onClick={() => setFaturaParaBaixar(f)}
                          className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[11px] font-medium transition"
                          title="Dar baixa no recebimento"
                        >
                          Baixar
                        </button>
                      )}

                      <button
                        onClick={() => handleImprimirFaturaA4(f)}
                        className="p-1 hover:bg-neutral-800 text-neutral-300 rounded border border-white/10 transition"
                        title="Imprimir Fatura / Recibo A4"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Baixar Fatura */}
      {faturaParaBaixar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-neutral-100">Baixa de Pagamento de Fatura</h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-900 rounded-lg space-y-1 font-mono">
                <div className="text-neutral-400">Valor a Liquidar:</div>
                <div className="text-xl font-bold text-emerald-400">
                  R$ {faturaParaBaixar.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Conta Bancária de Destino:</label>
                <select
                  value={contaRecebimentoId}
                  onChange={(e) => setContaRecebimentoId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-2 text-neutral-200 outline-none"
                >
                  {contasAnaliticas.map(c => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setFaturaParaBaixar(null)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarBaixa}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Serviço Extra */}
      {showExtraModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-neutral-100">Lançamento de Serviço Extraordinário</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Empresa Cliente:</label>
                <select
                  value={extraEmpresaId}
                  onChange={(e) => setExtraEmpresaId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-2 text-neutral-200 outline-none"
                >
                  {empresas.map(e => (
                    <option key={e.id} value={e.id}>{e.codigo.toString().padStart(3, '0')} - {e.razaoSocial}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Descrição do Serviço:</label>
                <input
                  type="text"
                  value={extraDescricao}
                  onChange={(e) => setExtraDescricao(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Valor do Serviço (R$):</label>
                <input
                  type="text"
                  value={extraValor}
                  onChange={(e) => setExtraValor(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-100 font-mono font-bold text-right outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowExtraModal(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarExtra}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition"
              >
                Adicionar à Fatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
