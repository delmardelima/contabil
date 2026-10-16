import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  OperacaoPrecoTransferencia,
  MetodoPrecoTransferencia,
  TipoOperacaoVinculada,
  DossieTransferPricing
} from '../../types/contabil';
import {
  Globe2,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  ShieldCheck,
  Building2,
  Coins,
  SendHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface PrecosTransferenciaModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const PrecosTransferenciaModule: React.FC<PrecosTransferenciaModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [exercicio, setExercicio] = useState<number>(empresaAtiva.exercicioAtivo || 2026);
  const [operacoes, setOperacoes] = useState<OperacaoPrecoTransferencia[]>(() =>
    dbService.getOperacoesTransferPricing(empresaAtiva.id, empresaAtiva.exercicioAtivo || 2026)
  );
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<OperacaoPrecoTransferencia | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Form State
  const [tipoOperacao, setTipoOperacao] = useState<TipoOperacaoVinculada>('IMPORTACAO_BENS');
  const [metodoUtilizado, setMetodoUtilizado] = useState<MetodoPrecoTransferencia>('PIC_PRECO_INDEPENDENTE_COMPARAVEL');
  const [contraparteVinculadaNome, setContraparteVinculadaNome] = useState<string>('');
  const [paisJurisdicao, setPaisJurisdicao] = useState<string>('Estados Unidos');
  const [jurisdicaoTributacaoFavorecida, setJurisdicaoTributacaoFavorecida] = useState<boolean>(false);
  const [descricaoItemOuTransacao, setDescricaoItemOuTransacao] = useState<string>('');
  const [volumeQuantidade, setVolumeQuantidade] = useState<string>('1000');
  const [precoPraticadoUnitario, setPrecoPraticadoUnitario] = useState<string>('450,00');
  const [precoParametroArmLengthUnitario, setPrecoParametroArmLengthUnitario] = useState<string>('390,00');
  const [intervaloInterquartilMin, setIntervaloInterquartilMin] = useState<string>('375,00');
  const [intervaloInterquartilMax, setIntervaloInterquartilMax] = useState<string>('410,00');
  const [statusApuracao, setStatusApuracao] = useState<'CONFORME_ARMS_LENGTH' | 'AJUSTE_EXIGIDO' | 'HOMOLOGADO_RFB'>('AJUSTE_EXIGIDO');
  const [observacoes, setObservacoes] = useState<string>('');

  const handleRecarregar = () => {
    setOperacoes(dbService.getOperacoesTransferPricing(empresaAtiva.id, exercicio));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const calcularAjuste = (tipo: TipoOperacaoVinculada, qtd: number, praticadoUnit: number, paramUnit: number) => {
    const totPraticado = Math.round(qtd * praticadoUnit * 100) / 100;
    const totParametro = Math.round(qtd * paramUnit * 100) / 100;

    let ajuste = 0;
    if (tipo === 'IMPORTACAO_BENS' || tipo === 'SERVICOS_INTANGIVEIS' || tipo === 'FINANCEIRO_MUTUO') {
      // Na importação/despesa: se praticado > parâmetro, custo a maior -> ajuste positivo
      if (praticadoUnit > paramUnit) {
        ajuste = Math.round((totPraticado - totParametro) * 100) / 100;
      }
    } else if (tipo === 'EXPORTACAO_BENS') {
      // Na exportação/receita: se praticado < parâmetro, receita a menor -> ajuste positivo
      if (praticadoUnit < paramUnit) {
        ajuste = Math.round((totParametro - totPraticado) * 100) / 100;
      }
    }

    return {
      totPraticado,
      totParametro,
      ajuste
    };
  };

  const abrirModalNovo = () => {
    setEditando(null);
    setTipoOperacao('IMPORTACAO_BENS');
    setMetodoUtilizado('PIC_PRECO_INDEPENDENTE_COMPARAVEL');
    setContraparteVinculadaNome('Global Tech Parts LLC (Controladora)');
    setPaisJurisdicao('Estados Unidos');
    setJurisdicaoTributacaoFavorecida(false);
    setDescricaoItemOuTransacao('Módulos de Controle Eletrônico ECU-2026');
    setVolumeQuantidade('1000');
    setPrecoPraticadoUnitario('450,00');
    setPrecoParametroArmLengthUnitario('390,00');
    setIntervaloInterquartilMin('375,00');
    setIntervaloInterquartilMax('410,00');
    setStatusApuracao('AJUSTE_EXIGIDO');
    setObservacoes('');
    setShowModal(true);
  };

  const abrirModalEditar = (op: OperacaoPrecoTransferencia) => {
    setEditando(op);
    setTipoOperacao(op.tipoOperacao);
    setMetodoUtilizado(op.metodoUtilizado);
    setContraparteVinculadaNome(op.contraparteVinculadaNome);
    setPaisJurisdicao(op.paisJurisdicao);
    setJurisdicaoTributacaoFavorecida(op.jurisdicaoTributacaoFavorecida);
    setDescricaoItemOuTransacao(op.descricaoItemOuTransacao);
    setVolumeQuantidade(op.volumeQuantidade.toString());
    setPrecoPraticadoUnitario(op.precoPraticadoUnitario.toFixed(2).replace('.', ','));
    setPrecoParametroArmLengthUnitario(op.precoParametroArmLengthUnitario.toFixed(2).replace('.', ','));
    setIntervaloInterquartilMin(op.intervaloInterquartilMin.toFixed(2).replace('.', ','));
    setIntervaloInterquartilMax(op.intervaloInterquartilMax.toFixed(2).replace('.', ','));
    setStatusApuracao(op.statusApuracao);
    setObservacoes(op.observacoes || '');
    setShowModal(true);
  };

  const handleSalvarOperacao = (e: React.FormEvent) => {
    e.preventDefault();
    const qtd = parseValor(volumeQuantidade);
    const pratU = parseValor(precoPraticadoUnitario);
    const paramU = parseValor(precoParametroArmLengthUnitario);
    const iMin = parseValor(intervaloInterquartilMin);
    const iMax = parseValor(intervaloInterquartilMax);

    const { totPraticado, totParametro, ajuste } = calcularAjuste(tipoOperacao, qtd, pratU, paramU);

    const operacaoData: OperacaoPrecoTransferencia = {
      id: editando ? editando.id : `tp_${Date.now()}`,
      empresaId: empresaAtiva.id,
      exercicio,
      tipoOperacao,
      metodoUtilizado,
      contraparteVinculadaNome,
      paisJurisdicao,
      jurisdicaoTributacaoFavorecida,
      descricaoItemOuTransacao,
      volumeQuantidade: qtd,
      precoPraticadoUnitario: pratU,
      valorTotalPraticado: totPraticado,
      precoParametroArmLengthUnitario: paramU,
      valorTotalParametroArmLength: totParametro,
      intervaloInterquartilMin: iMin,
      intervaloInterquartilMax: iMax,
      ajustePositivoLalurApurado: ajuste,
      statusApuracao: ajuste > 0 ? 'AJUSTE_EXIGIDO' : 'CONFORME_ARMS_LENGTH',
      integradoLalur: editando ? editando.integradoLalur : false,
      observacoes
    };

    dbService.salvarOperacaoTransferPricing(operacaoData);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Operação de Preço de Transferência com "${contraparteVinculadaNome}" salva com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleExcluirOperacao = (id: string, desc: string) => {
    if (confirm(`Excluir a operação "${desc}"?`)) {
      dbService.excluirOperacaoTransferPricing(id);
      handleRecarregar();
      setMensagemSucesso(`Operação excluída.`);
      setTimeout(() => setMensagemSucesso(''), 4000);
    }
  };

  const handleIntegrarLalur = (opId: string) => {
    const res = dbService.integrarAjusteLalurTransferPricing(opId);
    if (res.sucesso) {
      handleRecarregar();
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 7000);
    } else {
      alert(res.mensagem);
    }
  };

  // Consolidação
  const dossie: DossieTransferPricing = dbService.getDossieTransferPricing(empresaAtiva.id, exercicio);

  // Filtros
  const operacoesFiltradas = operacoes.filter(op => {
    const matchTexto = op.contraparteVinculadaNome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      op.descricaoItemOuTransacao.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      op.paisJurisdicao.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchMetodo = filtroMetodo === 'TODOS' || op.metodoUtilizado === filtroMetodo;
    const matchTipo = filtroTipo === 'TODOS' || op.tipoOperacao === filtroTipo;
    return matchTexto && matchMetodo && matchTipo;
  });

  const handleExportarCSV = () => {
    const rows = operacoesFiltradas.map(op => ({
      ID: op.id,
      Exercicio: op.exercicio,
      Tipo: op.tipoOperacao,
      Metodo: op.metodoUtilizado,
      Contraparte: op.contraparteVinculadaNome,
      Pais: op.paisJurisdicao,
      ParaisoFiscal: op.jurisdicaoTributacaoFavorecida ? 'SIM' : 'NÃO',
      Descricao: op.descricaoItemOuTransacao,
      Qtd: op.volumeQuantidade,
      PrecoPraticadoUnit: op.precoPraticadoUnitario,
      TotalPraticado: op.valorTotalPraticado,
      PrecoParametroUnit: op.precoParametroArmLengthUnitario,
      TotalParametro: op.valorTotalParametroArmLength,
      IntervaloMin: op.intervaloInterquartilMin,
      IntervaloMax: op.intervaloInterquartilMax,
      AjusteLalur: op.ajustePositivoLalurApurado,
      Status: op.statusApuracao,
      IntegradoLalur: op.integradoLalur ? 'SIM' : 'NÃO'
    }));
    exportToCSV(rows, `transfer_pricing_lei14596_${exercicio}_${empresaAtiva.cnpj.replace(/\D/g, '')}`);
  };

  const handleImprimirDossie = () => {
    if (!onOpenReportPreview) return;

    onOpenReportPreview({
      titulo: 'DOSSIÊ DE PREÇOS DE TRANSFERÊNCIA - ARQUIVO LOCAL (LOCAL FILE)',
      subtitulo: `Lei nº 14.596/2023 | IN RFB nº 2.161/2023 - Padrão OCDE - Exercício Social ${exercicio}`,
      conteudo: (
        <div className="p-8 space-y-6 text-slate-800 text-xs">
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">{empresaAtiva.razaoSocial}</h1>
              <p className="text-slate-600">CNPJ: {empresaAtiva.cnpj} | Grupo Multinacional Vinculado</p>
              <p className="text-slate-600 font-semibold mt-1">DEMONSTRATIVO DE AJUSTES AO PRINCÍPIO ARM'S LENGTH NO LALUR/LACS</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-300">
                LEI 14.596 / OCDE
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL PRATICADO (BRL)</span>
              <span className="font-bold text-sm text-slate-900">
                R$ {dossie.totalValorPraticado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL PARÂMETRO ARM'S LENGTH</span>
              <span className="font-bold text-sm text-blue-800">
                R$ {dossie.totalValorParametro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AJUSTE IRPJ (25%)</span>
              <span className="font-bold text-sm text-amber-800">
                R$ {dossie.totalAjustePositivoIRPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AJUSTE CSLL (9%)</span>
              <span className="font-bold text-sm text-rose-800">
                R$ {dossie.totalAjustePositivoCSLL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Tabela de Operações */}
          <div>
            <h2 className="font-bold text-sm uppercase text-slate-800 mb-2 border-b border-slate-300 pb-1">
              Relação Analítica de Operações Controladas com Partes Vinculadas
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-700 text-[10px] uppercase">
                  <th className="p-2 border border-slate-300">Contraparte / País</th>
                  <th className="p-2 border border-slate-300">Operação / Método</th>
                  <th className="p-2 border border-slate-300 text-right">Praticado (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Parâmetro (R$)</th>
                  <th className="p-2 border border-slate-300 text-right">Interquartil</th>
                  <th className="p-2 border border-slate-300 text-right">Ajuste LALUR</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {operacoesFiltradas.map((op, idx) => (
                  <tr key={op.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold">{op.contraparteVinculadaNome}</div>
                      <div className="text-[10px] text-slate-600">{op.paisJurisdicao} {op.jurisdicaoTributacaoFavorecida ? '(Paraíso Fiscal)' : ''}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-semibold text-slate-800">{op.tipoOperacao}</div>
                      <div className="text-[10px] text-blue-700 font-mono">{op.metodoUtilizado}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      R$ {op.valorTotalPraticado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-blue-800 font-semibold">
                      R$ {op.valorTotalParametroArmLength.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-[10px] text-slate-600">
                      R$ {op.intervaloInterquartilMin.toFixed(2)} - {op.intervaloInterquartilMax.toFixed(2)}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-amber-800">
                      {op.ajustePositivoLalurApurado > 0
                        ? `R$ ${op.ajustePositivoLalurApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        op.statusApuracao === 'AJUSTE_EXIGIDO'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {op.statusApuracao}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enquadramento Legal OCDE */}
          <div className="border border-slate-300 bg-slate-50 p-4 rounded text-[11px] leading-relaxed">
            <h3 className="font-bold text-slate-800 uppercase mb-1">Princípio Arm's Length e Regras da Lei nº 14.596/2023:</h3>
            <p className="text-slate-700">
              A Lei nº 14.596/2023 alinhou a legislação brasileira de preços de transferência aos padrões da OCDE, adotando o Princípio Arm's Length (Art. 2º), pelo qual os termos e condições de uma transação controlada entre partes vinculadas devem ser estabelecidos de forma comparável àqueles que seriam acordados entre partes não vinculadas em transações comparáveis. Verificada divergência desfavorável ao fisco brasileiro fora do intervalo interquartil de comparabilidade, o contribuinte deve efetuar o competente ajuste positivo na apuração do Lucro Real e da Base de Cálculo da CSLL no LALUR/LACS do exercício correspondente.
            </p>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-200">
      {/* Header */}
      <div className="border-b border-[#2d2d2d] bg-[#1a1a1a] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">
              Preços de Transferência - Transfer Pricing (Lei 14.596/23 / OCDE)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Princípio Arm's Length, Métodos Transacionais (PIC, PRL, MCL, MLT), Intervalo Interquartil e Adição no LALUR
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Exercício Selector */}
          <select
            value={exercicio}
            onChange={e => {
              const a = parseInt(e.target.value) || 2026;
              setExercicio(a);
              setOperacoes(dbService.getOperacoesTransferPricing(empresaAtiva.id, a));
            }}
            className="bg-[#242424] border border-[#383838] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value={2026}>Exercício 2026</option>
            <option value={2025}>Exercício 2025</option>
            <option value={2024}>Exercício 2024</option>
          </select>

          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-[#383838] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            Exportar CSV
          </button>
          <button
            onClick={handleImprimirDossie}
            className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-[#383838] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Dossiê Local File A4
          </button>
          <button
            onClick={abrirModalNovo}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Operação Controlada
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Operações Controladas</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
              {dossie.totalOperacoesVinculadas} <span className="text-xs font-normal text-slate-400">transações</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Vinculadas e Intercompany</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Total Praticado (BRL)</span>
              <Coins className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 mt-1 font-mono">
              R$ {dossie.totalValorPraticado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Preço efetivo registrado</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Parâmetro Arm's Length</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              R$ {dossie.totalValorParametro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Preço de mercado OCDE</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Ajuste IRPJ no LALUR (25%)</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
              R$ {dossie.totalAjustePositivoIRPJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Tributação devida IRPJ</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Ajuste CSLL no LACS (9%)</span>
              <Percent className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1 font-mono">
              R$ {dossie.totalAjustePositivoCSLL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Tributação devida CSLL</div>
          </div>
        </div>

        {/* Tabela de Operações Controladas */}
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden shadow-sm">
          {/* Barra de Filtros */}
          <div className="p-3 border-b border-[#2d2d2d] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#181818]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar vinculada, país ou item..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filtroMetodo}
                onChange={e => setFiltroMetodo(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="TODOS">Todos os Métodos OCDE</option>
                <option value="PIC_PRECO_INDEPENDENTE_COMPARAVEL">PIC (Preço Independente)</option>
                <option value="PRL_PRECO_REVENDA_MENOS_LUCRO">PRL (Preço de Revenda)</option>
                <option value="MCL_CUSTO_MAIS_LUCRO">MCL (Custo Mais Lucro)</option>
                <option value="MLT_MARGEM_LIQUIDA_TRANSACAO">MLT (Margem Líquida)</option>
                <option value="RLP_DIVISAO_LUCRO">RLP (Divisão do Lucro)</option>
              </select>

              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="TODOS">Todos os Tipos de Operação</option>
                <option value="IMPORTACAO_BENS">Importação de Bens</option>
                <option value="EXPORTACAO_BENS">Exportação de Bens</option>
                <option value="SERVICOS_INTANGIVEIS">Serviços e Intangíveis</option>
                <option value="FINANCEIRO_MUTUO">Operação Financeira / Mútuo</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Mostrando <span className="font-bold text-slate-200">{operacoesFiltradas.length}</span> transação(ões)
            </div>
          </div>

          {/* Tabela Analítica */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#161616] text-slate-400 border-b border-[#2d2d2d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Contraparte Vinculada / Jurisdição</th>
                  <th className="py-2.5 px-3">Operação / Item</th>
                  <th className="py-2.5 px-3">Método OCDE</th>
                  <th className="py-2.5 px-3 text-right">Preço Praticado</th>
                  <th className="py-2.5 px-3 text-right">Parâmetro Arm's Length</th>
                  <th className="py-2.5 px-3 text-right">Intervalo Interquartil</th>
                  <th className="py-2.5 px-3 text-right">Ajuste LALUR</th>
                  <th className="py-2.5 px-3 text-center">Status / LALUR</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {operacoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Nenhuma operação de preço de transferência encontrada para o exercício {exercicio}.
                    </td>
                  </tr>
                ) : (
                  operacoesFiltradas.map(op => (
                    <tr key={op.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{op.contraparteVinculadaNome}</div>
                        <div className="text-[11px] text-slate-400">
                          {op.paisJurisdicao}
                          {op.jurisdicaoTributacaoFavorecida && (
                            <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] bg-red-950/60 text-red-400 border border-red-500/30">
                              Paraíso Fiscal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#262626] text-slate-300 border border-[#383838]">
                          {op.tipoOperacao}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">{op.descricaoItemOuTransacao}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-blue-400 font-semibold">
                        {op.metodoUtilizado}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                        R$ {op.precoPraticadoUnitario.toFixed(2)} / un
                        <div className="text-[10px] text-slate-500">
                          Total: R$ {op.valorTotalPraticado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                        R$ {op.precoParametroArmLengthUnitario.toFixed(2)} / un
                        <div className="text-[10px] text-slate-500">
                          Total: R$ {op.valorTotalParametroArmLength.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                        R$ {op.intervaloInterquartilMin.toFixed(2)} - R$ {op.intervaloInterquartilMax.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {op.ajustePositivoLalurApurado > 0 ? (
                          <span className="text-amber-400">
                            R$ {op.ajustePositivoLalurApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">Conforme</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          op.statusApuracao === 'AJUSTE_EXIGIDO'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {op.statusApuracao}
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {op.integradoLalur ? 'Adicionado LALUR' : 'Pendente LALUR'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {op.ajustePositivoLalurApurado > 0 && !op.integradoLalur && (
                            <button
                              onClick={() => handleIntegrarLalur(op.id)}
                              title="Adicionar Ajuste Positivo ao LALUR Parte A"
                              className="p-1 rounded hover:bg-amber-950/60 text-amber-400 border border-amber-500/30 transition-colors"
                            >
                              <SendHorizontal className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => abrirModalEditar(op)}
                            title="Editar Operação"
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirOperacao(op.id, op.descricaoItemOuTransacao)}
                            title="Excluir Operação"
                            className="p-1 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nova / Editar Operação */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#202020]">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-slate-100">
                  {editando ? 'Editar Transação Controlada' : 'Nova Operação com Parte Vinculada (Transfer Pricing)'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarOperacao} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tipo de Operação *
                  </label>
                  <select
                    value={tipoOperacao}
                    onChange={e => setTipoOperacao(e.target.value as TipoOperacaoVinculada)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="IMPORTACAO_BENS">Importação de Bens e Insumos</option>
                    <option value="EXPORTACAO_BENS">Exportação de Bens e Produtos</option>
                    <option value="SERVICOS_INTANGIVEIS">Serviços Técnicos e Intangíveis</option>
                    <option value="FINANCEIRO_MUTUO">Operação Financeira / Mútuo Intercompany</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Método de Determinação OCDE *
                  </label>
                  <select
                    value={metodoUtilizado}
                    onChange={e => setMetodoUtilizado(e.target.value as MetodoPrecoTransferencia)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="PIC_PRECO_INDEPENDENTE_COMPARAVEL">PIC - Preço Independente Comparável (CUP)</option>
                    <option value="PRL_PRECO_REVENDA_MENOS_LUCRO">PRL - Preço de Revenda menos Lucro (RPM)</option>
                    <option value="MCL_CUSTO_MAIS_LUCRO">MCL - Custo Mais Lucro (CPM)</option>
                    <option value="MLT_MARGEM_LIQUIDA_TRANSACAO">MLT - Margem Líquida da Transação (TNMM)</option>
                    <option value="RLP_DIVISAO_LUCRO">RLP - Divisão do Lucro (PSM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nome da Contraparte Vinculada *
                  </label>
                  <input
                    type="text"
                    required
                    value={contraparteVinculadaNome}
                    onChange={e => setContraparteVinculadaNome(e.target.value)}
                    placeholder="Empresa Controladora, Afiliada ou Coligada no Exterior"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    País / Jurisdição *
                  </label>
                  <input
                    type="text"
                    required
                    value={paisJurisdicao}
                    onChange={e => setPaisJurisdicao(e.target.value)}
                    placeholder="Ex: Suíça, Alemanha, Estados Unidos"
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkParaiso"
                  checked={jurisdicaoTributacaoFavorecida}
                  onChange={e => setJurisdicaoTributacaoFavorecida(e.target.checked)}
                  className="rounded border-[#444] text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chkParaiso" className="text-xs text-slate-300 cursor-pointer">
                  País com Tributação Favorecida ou Regime Fiscal Privilegiado (Paraíso Fiscal / IN RFB 1.037/10)
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descrição do Item, Bem ou Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={descricaoItemOuTransacao}
                  onChange={e => setDescricaoItemOuTransacao(e.target.value)}
                  placeholder="Ex: Circuitos Integrados Mod-Z ou Licença de Software Especializado"
                  className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Volume / Quantidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={volumeQuantidade}
                    onChange={e => setVolumeQuantidade(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Preço Praticado Unitário (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={precoPraticadoUnitario}
                    onChange={e => setPrecoPraticadoUnitario(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Preço Parâmetro Arm's Length (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={precoParametroArmLengthUnitario}
                    onChange={e => setPrecoParametroArmLengthUnitario(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Intervalo Interquartil Mínimo (R$)
                  </label>
                  <input
                    type="text"
                    value={intervaloInterquartilMin}
                    onChange={e => setIntervaloInterquartilMin(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Intervalo Interquartil Máximo (R$)
                  </label>
                  <input
                    type="text"
                    value={intervaloInterquartilMax}
                    onChange={e => setIntervaloInterquartilMax(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Simulação Dinâmica do Ajuste */}
              {(() => {
                const q = parseValor(volumeQuantidade);
                const pratU = parseValor(precoPraticadoUnitario);
                const paramU = parseValor(precoParametroArmLengthUnitario);
                const { totPraticado, totParametro, ajuste } = calcularAjuste(tipoOperacao, q, pratU, paramU);
                const irpj = Math.round(ajuste * 0.25 * 100) / 100;
                const csll = Math.round(ajuste * 0.09 * 100) / 100;

                return (
                  <div className="p-3 rounded-lg bg-[#182028] border border-blue-500/30 text-xs space-y-1.5">
                    <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" />
                      Apuração de Divergência Arm's Length e Ajuste Tributário:
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Praticado:</span>
                        <span className="font-mono font-bold text-slate-200">
                          R$ {totPraticado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Parâmetro:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          R$ {totParametro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Adição LALUR:</span>
                        <span className={`font-mono font-bold ${ajuste > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {ajuste > 0 ? `R$ ${ajuste.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Conforme'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">IRPJ + CSLL (34%):</span>
                        <span className="font-mono font-bold text-rose-400">
                          R$ {(irpj + csll).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Observações e Justificativa de Comparabilidade
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Detalhamento da análise funcional, riscos assumidos e ajustes de comparabilidade..."
                  className="w-full bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-4 border-t border-[#2d2d2d] flex justify-end gap-2 bg-[#202020] -mx-5 -mb-5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-[#2e2e2e] hover:bg-[#383838] text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
                >
                  {editando ? 'Atualizar Operação' : 'Salvar Operação Controlada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
