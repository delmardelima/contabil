import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, AtivoImobilizado, ContaContabil } from '../../types/contabil';
import {
  Archive,
  Plus,
  Trash2,
  Edit2,
  Calculator,
  Zap,
  TrendingDown,
  DollarSign,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  Building
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface AtivoImobilizadoModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  onIntegracaoSucesso?: () => void;
  onOpenReportPreview?: (config: {
    tipo: 'MAPA_DEPRECIACAO' | 'FICHA_BEM';
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
  }) => void;
}

export const AtivoImobilizadoModule: React.FC<AtivoImobilizadoModuleProps> = ({
  empresa,
  contas,
  onIntegracaoSucesso,
  onOpenReportPreview
}) => {
  const [ativos, setAtivos] = useState<AtivoImobilizado[]>(() => dbService.getAtivosImobilizados(empresa.id));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<AtivoImobilizado | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'dados' | 'valores' | 'contabil'>('dados');
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [processandoIntegracao, setProcessandoIntegracao] = useState<boolean>(false);

  // Form State
  const [codigo, setCodigo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [grupo, setGrupo] = useState<'VEICULOS' | 'MAQUINAS' | 'INFORMATICA' | 'MOVEIS' | 'EDIFICACOES' | 'OUTROS'>('INFORMATICA');
  const [dataAquisicao, setDataAquisicao] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dataInicioDepreciacao, setDataInicioDepreciacao] = useState<string>(new Date().toISOString().slice(0, 10));
  const [valorOriginal, setValorOriginal] = useState<string>('0,00');
  const [valorResidual, setValorResidual] = useState<string>('0,00');
  const [taxaDepreciacaoAnual, setTaxaDepreciacaoAnual] = useState<number>(20.0);
  const [vidaUtilMeses, setVidaUtilMeses] = useState<number>(60);
  const [contaAtivoId, setContaAtivoId] = useState<number>(20);
  const [contaDepreciacaoAcumuladaId, setContaDepreciacaoAcumuladaId] = useState<number>(20);
  const [contaDespesaDepreciacaoId, setContaDespesaDepreciacaoId] = useState<number>(57);
  const [ativoStatus, setAtivoStatus] = useState<boolean>(true);

  // Totais
  const totalBens = ativos.length;
  const valorOriginalTotal = ativos.reduce((sum, a) => sum + (a.valorOriginal || 0), 0);
  const depreciacaoAcumuladaTotal = ativos.reduce((sum, a) => sum + (a.depreciacaoAcumulada || 0), 0);
  const valorLiquidoTotal = Math.max(0, valorOriginalTotal - depreciacaoAcumuladaTotal);

  // Simulação de quota do mês
  const calculosMes = dbService.calcularDepreciacaoPeriodo(empresa.id, empresa.competenciaAtiva);
  const totalQuotaMensal = calculosMes.reduce((sum, c) => sum + c.valorMensal, 0);

  const handleAbrirCriar = () => {
    setEditando(null);
    setCodigo(`IMOB-${String(ativos.length + 1).padStart(3, '0')}`);
    setDescricao('');
    setGrupo('INFORMATICA');
    setDataAquisicao(new Date().toISOString().slice(0, 10));
    setDataInicioDepreciacao(new Date().toISOString().slice(0, 10));
    setValorOriginal('10000,00');
    setValorResidual('1000,00');
    setTaxaDepreciacaoAnual(20.0);
    setVidaUtilMeses(60);
    setContaAtivoId(20);
    setContaDepreciacaoAcumuladaId(20);
    setContaDespesaDepreciacaoId(57);
    setAtivoStatus(true);
    setActiveModalTab('dados');
    setShowModal(true);
  };

  const handleAbrirEditar = (item: AtivoImobilizado) => {
    setEditando(item);
    setCodigo(item.codigo);
    setDescricao(item.descricao);
    setGrupo(item.grupo);
    setDataAquisicao(item.dataAquisicao);
    setDataInicioDepreciacao(item.dataInicioDepreciacao);
    setValorOriginal(item.valorOriginal.toFixed(2).replace('.', ','));
    setValorResidual((item.valorResidual || 0).toFixed(2).replace('.', ','));
    setTaxaDepreciacaoAnual(item.taxaDepreciacaoAnual);
    setVidaUtilMeses(item.vidaUtilMeses);
    setContaAtivoId(item.contaAtivoId || 20);
    setContaDepreciacaoAcumuladaId(item.contaDepreciacaoAcumuladaId || 20);
    setContaDespesaDepreciacaoId(item.contaDespesaDepreciacaoId || 57);
    setAtivoStatus(item.ativo);
    setActiveModalTab('dados');
    setShowModal(true);
  };

  const handleSalvar = () => {
    const valOrig = parseFloat(valorOriginal.replace(/\./g, '').replace(',', '.')) || 0;
    const valRes = parseFloat(valorResidual.replace(/\./g, '').replace(',', '.')) || 0;

    const novoAtivo: AtivoImobilizado = {
      id: editando ? editando.id : Date.now(),
      empresaId: empresa.id,
      codigo,
      descricao,
      grupo,
      dataAquisicao,
      dataInicioDepreciacao,
      valorOriginal: valOrig,
      valorResidual: valRes,
      taxaDepreciacaoAnual: Number(taxaDepreciacaoAnual),
      vidaUtilMeses: Number(vidaUtilMeses),
      contaAtivoId: Number(contaAtivoId),
      contaDepreciacaoAcumuladaId: Number(contaDepreciacaoAcumuladaId),
      contaDespesaDepreciacaoId: Number(contaDespesaDepreciacaoId),
      depreciacaoAcumulada: editando ? editando.depreciacaoAcumulada : 0,
      valorContabilAtual: editando ? editando.valorContabilAtual : valOrig,
      ativo: ativoStatus
    };

    dbService.saveAtivoImobilizado(novoAtivo);
    setAtivos(dbService.getAtivosImobilizados(empresa.id));
    setShowModal(false);
    setMensagemSucesso(`Bem patrimonial "${descricao}" salvo com sucesso.`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleExcluir = (id: number) => {
    dbService.deleteAtivoImobilizado(id);
    setAtivos(dbService.getAtivosImobilizados(empresa.id));
    setMensagemSucesso('Bem patrimonial excluído com sucesso.');
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  // Integração Contábil da Depreciação
  const handleIntegrarContabil = () => {
    setProcessandoIntegracao(true);
    setTimeout(() => {
      const res = dbService.integrarDepreciacaoContabil(empresa.id, empresa.competenciaAtiva);
      setProcessandoIntegracao(false);
      if (res.success) {
        setAtivos(dbService.getAtivosImobilizados(empresa.id));
        setMensagemSucesso(`Depreciação de ${empresa.competenciaAtiva} integrada com sucesso! ${res.partidasGeradas} lançamentos gerados no Lote ID ${res.loteId} (Total R$ ${res.totalDepreciado.toFixed(2)}).`);
        if (onIntegracaoSucesso) onIntegracaoSucesso();
      } else {
        setMensagemSucesso('Nenhum bem elegível para depreciação nesta competência.');
      }
      setTimeout(() => setMensagemSucesso(''), 6000);
    }, 400);
  };

  // Exportação CSV
  const handleExportarCSV = () => {
    const data = ativos.map(a => ({
      Codigo: a.codigo,
      Descricao: a.descricao,
      Grupo: a.grupo,
      Aquisicao: a.dataAquisicao,
      InicioDepreciacao: a.dataInicioDepreciacao,
      ValorOriginal: a.valorOriginal,
      ValorResidual: a.valorResidual,
      TaxaAnualPerc: a.taxaDepreciacaoAnual,
      VidaUtilMeses: a.vidaUtilMeses,
      DepreciacaoAcumulada: a.depreciacaoAcumulada || 0,
      SaldoContabilLiquido: (a.valorOriginal - (a.depreciacaoAcumulada || 0)),
      Ativo: a.ativo ? 'SIM' : 'NAO'
    }));
    exportToCSV(data, `Mapa_Ativo_Imobilizado_${empresa.razaoSocial.slice(0, 15)}_${empresa.competenciaAtiva}`);
  };

  // Visualizar Mapa de Depreciação A4
  const handleImprimirMapaA4 = () => {
    if (!onOpenReportPreview) return;
    const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = calculosMes.map(c => ({
      descricao: `${c.ativo.codigo} - ${c.ativo.descricao} (Taxa ${c.ativo.taxaDepreciacaoAnual}% a.a.)`,
      valor: c.valorMensal
    }));

    linhas.push({
      descricao: 'TOTAL DA DEPRECIAÇÃO MENSAL DO EXERCÍCIO',
      valor: totalQuotaMensal,
      isTotal: true
    });

    onOpenReportPreview({
      tipo: 'MAPA_DEPRECIACAO',
      titulo: 'MAPA DEMONSTRATIVO DE DEPRECIAÇÃO DO ATIVO IMOBILIZADO',
      subtitulo: `Competência Ativa: ${empresa.competenciaAtiva} | Conforme Normas CFC / RFB IN 1.700`,
      linhas
    });
  };

  const ativosFiltrados = ativos.filter(a => {
    const matchTexto = a.descricao.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                       a.codigo.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchGrupo = filtroGrupo === 'TODOS' || a.grupo === filtroGrupo;
    return matchTexto && matchGrupo;
  });

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden font-sans">
      {/* Top Banner & Header */}
      <div className="bg-[#181818] border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              Controle de Ativo Imobilizado & Depreciação
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                CPC 27 / RFB
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Gestão patrimonial, vida útil econômica, quotas lineares e contabilização automática em lote
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportarCSV}
            className="px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2c2c2c] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handleImprimirMapaA4}
            className="px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#2c2c2c] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Mapa A4</span>
          </button>
          <button
            onClick={handleIntegrarContabil}
            disabled={processandoIntegracao || totalQuotaMensal === 0}
            className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{processandoIntegracao ? 'Integrando...' : 'Integrar Depreciação (Lote)'}</span>
          </button>
          <button
            onClick={handleAbrirCriar}
            className="px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Bem</span>
          </button>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {mensagemSucesso && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso('')} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-[#141414] border-b border-white/5">
        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Total de Bens</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold text-white font-mono">{totalBens}</span>
            <span className="text-xs text-neutral-500">Cadastrados</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Valor Original (Custo)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-bold text-white font-mono">
              R$ {valorOriginalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider">Depreciação Acumulada</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-bold text-amber-400 font-mono">
              - R$ {depreciacaoAcumuladaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-emerald-400/90 uppercase tracking-wider">Valor Contábil Líquido</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-bold text-emerald-400 font-mono">
              R$ {valorLiquidoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-sky-500/20 bg-sky-950/10 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5" />
            Quota Comp. {empresa.competenciaAtiva}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-bold text-sky-300 font-mono">
              R$ {totalQuotaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#181818] px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código ou descrição do bem..."
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#202020] border border-white/10 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-400">Grupo:</span>
            <select
              value={filtroGrupo}
              onChange={e => setFiltroGrupo(e.target.value)}
              className="bg-[#202020] border border-white/10 rounded text-xs text-neutral-300 px-2 py-1.5 focus:outline-none focus:border-sky-500"
            >
              <option value="TODOS">Todos os Grupos</option>
              <option value="INFORMATICA">Informática / TI (20% a.a.)</option>
              <option value="MAQUINAS">Máquinas & Equipamentos (10% a.a.)</option>
              <option value="VEICULOS">Veículos (20% a.a.)</option>
              <option value="MOVEIS">Móveis & Utensílios (10% a.a.)</option>
              <option value="EDIFICACOES">Edificações / Imóveis (4% a.a.)</option>
              <option value="OUTROS">Outros Bens</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-neutral-400">
          Mostrando <span className="text-white font-mono">{ativosFiltrados.length}</span> de <span className="text-white font-mono">{ativos.length}</span> bens
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1c1c1c] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-white/10 sticky top-0 z-10">
              <th className="py-2.5 px-3">Código</th>
              <th className="py-2.5 px-3">Descrição do Bem</th>
              <th className="py-2.5 px-3">Grupo</th>
              <th className="py-2.5 px-3">Aquisição</th>
              <th className="py-2.5 px-3 text-right">Valor Original</th>
              <th className="py-2.5 px-3 text-right">Taxa Anual</th>
              <th className="py-2.5 px-3 text-right">Deprec. Acumulada</th>
              <th className="py-2.5 px-3 text-right">Saldo Líquido</th>
              <th className="py-2.5 px-3 text-right">Quota Mensal</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {ativosFiltrados.map((item) => {
              const calc = calculosMes.find(c => c.ativo.id === item.id);
              const quota = calc ? calc.valorMensal : 0;
              const depAcum = item.depreciacaoAcumulada || 0;
              const saldoLiq = Math.max(0, item.valorOriginal - depAcum);

              return (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-2 px-3 font-mono text-sky-400 font-medium">{item.codigo}</td>
                  <td className="py-2 px-3 font-medium text-white max-w-xs truncate" title={item.descricao}>
                    {item.descricao}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-white/5">
                      {item.grupo}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-neutral-400 font-mono text-[11px]">{item.dataAquisicao}</td>
                  <td className="py-2 px-3 text-right font-mono text-neutral-200">
                    R$ {item.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-neutral-300">
                    {item.taxaDepreciacaoAnual.toFixed(1)}% a.a.
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-amber-400">
                    R$ {depAcum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-400 font-medium">
                    R$ {saldoLiq.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-sky-300">
                    R$ {quota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      item.ativo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.ativo ? 'ATIVO' : 'BAIXADO'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => handleAbrirEditar(item)}
                        className="p-1 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Editar Bem"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExcluir(item.id)}
                        className="p-1 text-neutral-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                        title="Excluir Bem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {ativosFiltrados.length === 0 && (
              <tr>
                <td colSpan={11} className="py-8 text-center text-neutral-500">
                  Nenhum bem patrimonial encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro / Edição em 3 Abas */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-[#202020] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Archive className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">
                  {editando ? 'Editar Bem Patrimonial' : 'Novo Bem Patrimonial (Ativo Imobilizado)'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex border-b border-white/10 bg-[#161616] px-5 text-xs">
              <button
                onClick={() => setActiveModalTab('dados')}
                className={`py-2.5 px-4 font-medium border-b-2 transition-colors ${
                  activeModalTab === 'dados'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                1. Identificação do Bem
              </button>
              <button
                onClick={() => setActiveModalTab('valores')}
                className={`py-2.5 px-4 font-medium border-b-2 transition-colors ${
                  activeModalTab === 'valores'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                2. Valores & Depreciação
              </button>
              <button
                onClick={() => setActiveModalTab('contabil')}
                className={`py-2.5 px-4 font-medium border-b-2 transition-colors ${
                  activeModalTab === 'contabil'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                3. Vínculo Contábil
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {activeModalTab === 'dados' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Código do Bem *</label>
                    <input
                      type="text"
                      value={codigo}
                      onChange={e => setCodigo(e.target.value)}
                      placeholder="Ex: IMOB-004"
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Grupo do Imobilizado *</label>
                    <select
                      value={grupo}
                      onChange={e => {
                        const g = e.target.value as any;
                        setGrupo(g);
                        if (g === 'INFORMATICA') { setTaxaDepreciacaoAnual(20.0); setVidaUtilMeses(60); }
                        else if (g === 'MAQUINAS') { setTaxaDepreciacaoAnual(10.0); setVidaUtilMeses(120); }
                        else if (g === 'VEICULOS') { setTaxaDepreciacaoAnual(20.0); setVidaUtilMeses(60); }
                        else if (g === 'MOVEIS') { setTaxaDepreciacaoAnual(10.0); setVidaUtilMeses(120); }
                        else if (g === 'EDIFICACOES') { setTaxaDepreciacaoAnual(4.0); setVidaUtilMeses(300); }
                      }}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="INFORMATICA">Informática / TI (20% a.a. - 5 Anos)</option>
                      <option value="MAQUINAS">Máquinas & Equipamentos (10% a.a. - 10 Anos)</option>
                      <option value="VEICULOS">Veículos Automotores (20% a.a. - 5 Anos)</option>
                      <option value="MOVEIS">Móveis e Utensílios (10% a.a. - 10 Anos)</option>
                      <option value="EDIFICACOES">Edificações e Construções (4% a.a. - 25 Anos)</option>
                      <option value="OUTROS">Outros Ativos Tangíveis</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Descrição Detalhada do Bem *</label>
                    <input
                      type="text"
                      value={descricao}
                      onChange={e => setDescricao(e.target.value)}
                      placeholder="Ex: Servidor de Aplicação HP ProLiant DL380 Gen10..."
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="col-span-2 pt-2">
                    <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ativoStatus}
                        onChange={e => setAtivoStatus(e.target.checked)}
                        className="rounded border-white/20 bg-neutral-800 text-sky-500"
                      />
                      <span>Bem em operação ativa (sujeito à depreciação mensal periódica)</span>
                    </label>
                  </div>
                </div>
              )}

              {activeModalTab === 'valores' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Data de Aquisição *</label>
                    <input
                      type="date"
                      value={dataAquisicao}
                      onChange={e => setDataAquisicao(e.target.value)}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Início da Depreciação *</label>
                    <input
                      type="date"
                      value={dataInicioDepreciacao}
                      onChange={e => setDataInicioDepreciacao(e.target.value)}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Valor Original de Aquisição (R$) *</label>
                    <input
                      type="text"
                      value={valorOriginal}
                      onChange={e => setValorOriginal(e.target.value)}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Valor Residual Estimado (R$)</label>
                    <input
                      type="text"
                      value={valorResidual}
                      onChange={e => setValorResidual(e.target.value)}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Taxa de Depreciação Anual (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxaDepreciacaoAnual}
                      onChange={e => setTaxaDepreciacaoAnual(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">Vida Útil Estimada (Meses)</label>
                    <input
                      type="number"
                      value={vidaUtilMeses}
                      onChange={e => setVidaUtilMeses(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {activeModalTab === 'contabil' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Conta do Ativo Imobilizado (Custo Original) *
                    </label>
                    <select
                      value={contaAtivoId}
                      onChange={e => setContaAtivoId(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      {contas.filter(c => c.tipo === 'A' && c.classificacao.startsWith('1')).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.classificacao} - {c.nome} ({c.codigoReduzido})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Conta de Depreciação Acumulada (Ativo Redutora) *
                    </label>
                    <select
                      value={contaDepreciacaoAcumuladaId}
                      onChange={e => setContaDepreciacaoAcumuladaId(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      {contas.filter(c => c.tipo === 'A' && c.classificacao.startsWith('1')).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.classificacao} - {c.nome} ({c.codigoReduzido})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Conta de Despesa com Depreciação (Resultado) *
                    </label>
                    <select
                      value={contaDespesaDepreciacaoId}
                      onChange={e => setContaDespesaDepreciacaoId(Number(e.target.value))}
                      className="w-full bg-[#202020] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      {contas.filter(c => c.tipo === 'A' && (c.classificacao.startsWith('3') || c.classificacao.startsWith('4') || c.classificacao.startsWith('5'))).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.classificacao} - {c.nome} ({c.codigoReduzido})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#202020] px-5 py-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                {activeModalTab === 'dados' && 'Passo 1 de 3'}
                {activeModalTab === 'valores' && 'Passo 2 de 3'}
                {activeModalTab === 'contabil' && 'Passo 3 de 3'}
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-transparent rounded border border-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvar}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded transition-colors shadow-sm"
                >
                  Salvar Bem Patrimonial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
