import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, BemIntangivel, CategoriaIntangivel, TipoVidaUtil } from '../../types/contabil';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Calculator,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface AtivoIntangivelModuleProps {
  empresa: Empresa;
  onIntegracaoSucesso?: () => void;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const AtivoIntangivelModule: React.FC<AtivoIntangivelModuleProps> = ({
  empresa,
  onIntegracaoSucesso,
  onOpenReportPreview
}) => {
  const [bens, setBens] = useState<BemIntangivel[]>(() => dbService.getBensIntangiveis(empresa.id));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');
  const [filtroVidaUtil, setFiltroVidaUtil] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<BemIntangivel | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [processandoAmortizacao, setProcessandoAmortizacao] = useState<boolean>(false);

  // Form State
  const [codigoIdentificador, setCodigoIdentificador] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [categoria, setCategoria] = useState<CategoriaIntangivel>('SOFTWARE_SISTEMAS');
  const [tipoVidaUtil, setTipoVidaUtil] = useState<TipoVidaUtil>('DEFINIDA');
  const [dataAquisicao, setDataAquisicao] = useState<string>(new Date().toISOString().slice(0, 10));
  const [inicioAmortizacao, setInicioAmortizacao] = useState<string>(new Date().toISOString().slice(0, 10));
  const [custoAquisicao, setCustoAquisicao] = useState<string>('0,00');
  const [vidaUtilMeses, setVidaUtilMeses] = useState<number>(60);
  const [taxaAmortizacaoAnual, setTaxaAmortizacaoAnual] = useState<number>(20.0);
  const [amortizacaoAcumulada, setAmortizacaoAcumulada] = useState<string>('0,00');
  const [valorResidual, setValorResidual] = useState<string>('0,00');
  const [contaAtivoIntangivelId, setContaAtivoIntangivelId] = useState<number>(21);
  const [contaAmortizacaoAcumuladaId, setContaAmortizacaoAcumuladaId] = useState<number>(22);
  const [contaDespesaAmortizacaoId, setContaDespesaAmortizacaoId] = useState<number>(58);
  const [status, setStatus] = useState<'ATIVO' | 'TOTALMENTE_AMORTIZADO' | 'BAIXADO'>('ATIVO');
  const [observacoes, setObservacoes] = useState<string>('');

  // Totais
  const totalItens = bens.length;
  const custoTotal = bens.reduce((sum, b) => sum + (b.custoAquisicao || 0), 0);
  const amortizacaoTotal = bens.reduce((sum, b) => sum + (b.amortizacaoAcumulada || 0), 0);
  const saldoLiquidoTotal = bens.reduce((sum, b) => sum + (b.valorContabilLiquido || 0), 0);
  
  // Quota do mês estimada
  const quotaMensalTotal = bens.reduce((sum, b) => {
    if (b.status !== 'ATIVO' || b.tipoVidaUtil === 'INDEFINIDA') return sum;
    return sum + (b.quotaMensalAmortizacao || 0);
  }, 0);

  const handleRecarregar = () => {
    setBens(dbService.getBensIntangiveis(empresa.id));
  };

  const handleAbrirCriar = () => {
    setEditando(null);
    setCodigoIdentificador(`INT-${String(bens.length + 1).padStart(3, '0')}`);
    setDescricao('');
    setCategoria('SOFTWARE_SISTEMAS');
    setTipoVidaUtil('DEFINIDA');
    setDataAquisicao(new Date().toISOString().slice(0, 10));
    setInicioAmortizacao(new Date().toISOString().slice(0, 10));
    setCustoAquisicao('25000,00');
    setVidaUtilMeses(60);
    setTaxaAmortizacaoAnual(20.0);
    setAmortizacaoAcumulada('0,00');
    setValorResidual('0,00');
    setContaAtivoIntangivelId(21);
    setContaAmortizacaoAcumuladaId(22);
    setContaDespesaAmortizacaoId(58);
    setStatus('ATIVO');
    setObservacoes('');
    setShowModal(true);
  };

  const handleAbrirEditar = (item: BemIntangivel) => {
    setEditando(item);
    setCodigoIdentificador(item.codigoIdentificador);
    setDescricao(item.descricao);
    setCategoria(item.categoria);
    setTipoVidaUtil(item.tipoVidaUtil);
    setDataAquisicao(item.dataAquisicao);
    setInicioAmortizacao(item.inicioAmortizacao);
    setCustoAquisicao(item.custoAquisicao.toFixed(2).replace('.', ','));
    setVidaUtilMeses(item.vidaUtilMeses || 60);
    setTaxaAmortizacaoAnual(item.taxaAmortizacaoAnual);
    setAmortizacaoAcumulada(item.amortizacaoAcumulada.toFixed(2).replace('.', ','));
    setValorResidual(item.valorResidual.toFixed(2).replace('.', ','));
    setContaAtivoIntangivelId(item.contaAtivoIntangivelId || 21);
    setContaAmortizacaoAcumuladaId(item.contaAmortizacaoAcumuladaId || 22);
    setContaDespesaAmortizacaoId(item.contaDespesaAmortizacaoId || 58);
    setStatus(item.status);
    setObservacoes(item.observacoes || '');
    setShowModal(true);
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      alert('Informe a descrição do bem intangível.');
      return;
    }

    const nCusto = parseValor(custoAquisicao);
    const nResidual = parseValor(valorResidual);
    const nAmortAcum = parseValor(amortizacaoAcumulada);
    const nLiquido = Math.max(0, nCusto - nAmortAcum);

    const baseAmort = Math.max(0, nCusto - nResidual);
    const quotaMensal = tipoVidaUtil === 'INDEFINIDA' ? 0 : Math.round(((baseAmort * (taxaAmortizacaoAnual / 100)) / 12) * 100) / 100;

    const novoBem: BemIntangivel = {
      id: editando ? editando.id : `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      empresaId: empresa.id,
      codigoIdentificador: codigoIdentificador.trim() || `INT-${Date.now().toString().slice(-4)}`,
      descricao: descricao.trim(),
      categoria,
      tipoVidaUtil,
      vidaUtilMeses: tipoVidaUtil === 'INDEFINIDA' ? undefined : vidaUtilMeses,
      taxaAmortizacaoAnual: tipoVidaUtil === 'INDEFINIDA' ? 0 : taxaAmortizacaoAnual,
      dataAquisicao,
      inicioAmortizacao,
      custoAquisicao: nCusto,
      valorResidual: nResidual,
      amortizacaoAcumulada: nAmortAcum,
      valorContabilLiquido: nLiquido,
      quotaMensalAmortizacao: quotaMensal,
      contaAtivoIntangivelId,
      contaAmortizacaoAcumuladaId,
      contaDespesaAmortizacaoId,
      status,
      observacoes: observacoes.trim()
    };

    dbService.salvarBemIntangivel(novoBem);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Bem Intangível "${novoBem.descricao}" salvo com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleExcluir = (id: string, desc: string) => {
    if (confirm(`Confirma a exclusão do bem intangível "${desc}"?`)) {
      dbService.excluirBemIntangivel(id);
      handleRecarregar();
    }
  };

  const handleApropriarAmortizacao = () => {
    const comp = empresa.competenciaAtiva || '2026-03';
    if (!confirm(`Deseja efetuar a apropriação mensal de amortização para a competência ${comp}?\n\nSerão gerados lançamentos contábeis automáticos no Diário Geral.`)) {
      return;
    }

    setProcessandoAmortizacao(true);
    try {
      const res = dbService.apropriarAmortizacaoMensalIntangivel(empresa.id, comp);
      handleRecarregar();
      if (onIntegracaoSucesso) {
        onIntegracaoSucesso();
      }
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 6000);
    } catch (err: any) {
      alert(`Erro ao apropriar amortização: ${err?.message || err}`);
    } finally {
      setProcessandoAmortizacao(false);
    }
  };

  const handleImprimirMapaAmortizacao = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="p-8 text-neutral-800 bg-white font-sans text-xs">
        {/* Cabeçalho Oficial Timbrado */}
        <div className="border-b-2 border-neutral-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
                {empresa.razaoSocial}
              </h1>
              <p className="text-neutral-600 font-mono text-[11px] mt-0.5">
                CNPJ: {empresa.cnpj} | Competência: {empresa.competenciaAtiva} | Regime: {empresa.regimeTributario}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-neutral-900 text-white font-semibold text-[10px] px-2 py-0.5 rounded uppercase">
                CPC 04 / NBC TG 04 (R1)
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-base font-bold text-neutral-800 uppercase tracking-wide">
              Mapa Demonstrativo de Amortização do Ativo Intangível
            </h2>
            <p className="text-[11px] text-neutral-600">
              Demonstrativo Analítico de Custo, Taxas de Amortização, Quotas Mensais e Valor Contábil Residual Líquido
            </p>
          </div>
        </div>

        {/* Quadro Resumo */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded mb-6 text-center">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Total de Bens</div>
            <div className="text-sm font-bold text-neutral-800">{bens.length} itens</div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Custo de Aquisição</div>
            <div className="text-sm font-bold text-neutral-800">
              {custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Amortização Acumulada</div>
            <div className="text-sm font-bold text-amber-700">
              {amortizacaoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Valor Contábil Líquido</div>
            <div className="text-sm font-bold text-emerald-700">
              {saldoLiquidoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        {/* Tabela Analítica de Itens */}
        <table className="w-full border-collapse text-[10px] mb-6">
          <thead>
            <tr className="border-b-2 border-neutral-800 bg-neutral-100 font-bold text-neutral-800 text-left">
              <th className="py-2 px-1">Cód.</th>
              <th className="py-2 px-1">Descrição do Intangível</th>
              <th className="py-2 px-1">Categoria</th>
              <th className="py-2 px-1">Aquisição</th>
              <th className="py-2 px-1">Vida Útil</th>
              <th className="py-2 px-1 text-right">Taxa Anual</th>
              <th className="py-2 px-1 text-right">Custo Aquisição</th>
              <th className="py-2 px-1 text-right">Amort. Acum.</th>
              <th className="py-2 px-1 text-right">Saldo Líquido</th>
              <th className="py-2 px-1 text-right">Quota Mensal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {bens.map(bem => {
              return (
                <tr key={bem.id} className="hover:bg-neutral-50">
                  <td className="py-2 px-1 font-mono">{bem.codigoIdentificador}</td>
                  <td className="py-2 px-1 font-semibold">{bem.descricao}</td>
                  <td className="py-2 px-1 text-neutral-600">
                    {bem.categoria === 'SOFTWARE_SISTEMAS' && 'Softwares'}
                    {bem.categoria === 'MARCAS_PATENTES' && 'Marcas & Patentes'}
                    {bem.categoria === 'DESENVOLVIMENTO_TECNOLOGICO' && 'P&D Tecnológico'}
                    {bem.categoria === 'CONCESSOES_DIREITOS' && 'Concessões & Direitos'}
                    {bem.categoria === 'GOODWILL_FUNDO_COMERCIO' && 'Goodwill'}
                  </td>
                  <td className="py-2 px-1">{new Date(bem.dataAquisicao).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2 px-1">
                    {bem.tipoVidaUtil === 'INDEFINIDA' ? (
                      <span className="italic text-neutral-500">Indefinida (Impairment)</span>
                    ) : (
                      `${bem.vidaUtilMeses || 0} meses`
                    )}
                  </td>
                  <td className="py-2 px-1 text-right font-mono">
                    {bem.tipoVidaUtil === 'INDEFINIDA' ? '-' : `${bem.taxaAmortizacaoAnual.toFixed(1)}%`}
                  </td>
                  <td className="py-2 px-1 text-right font-mono">
                    {bem.custoAquisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono text-amber-800">
                    {bem.amortizacaoAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-bold text-emerald-800">
                    {bem.valorContabilLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono text-neutral-700">
                    {bem.quotaMensalAmortizacao > 0 ? bem.quotaMensalAmortizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-neutral-800 font-bold bg-neutral-100 text-neutral-900">
              <td colSpan={6} className="py-2 px-1 uppercase">Totais Gerais Contábeis</td>
              <td className="py-2 px-1 text-right font-mono">
                {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono text-amber-900">
                {amortizacaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono text-emerald-900">
                {saldoLiquidoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono">
                {quotaMensalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Parecer Técnico e Fundamentação Legal */}
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50 text-[10px] space-y-2 mb-8">
          <div className="font-bold text-neutral-800 uppercase tracking-wide">
            Fundamentação Contábil e Regulatória (CPC 04 / NBC TG 04 / Lei 6.404/76 Art. 179 VI)
          </div>
          <p className="text-neutral-600 leading-relaxed">
            1. O ativo intangível com vida útil definida é amortizado pelo método linear ao longo de sua vida econômica estimada, com revisão periódica dos prazos e valores residuais.
            <br />
            2. Ativos intangíveis com vida útil indefinida (ex: Ágio por Expectativa de Rentabilidade Futura / Goodwill e marcas consolidadas) não sofrem amortização sistemática, sendo submetidos anualmente ao Teste de Recuperabilidade de Ativos (Impairment Test - CPC 01 / NBC TG 01).
            <br />
            3. Todos os lançamentos de amortização foram devidamente contabilizados a débito em contas de Resultado e a crédito em Contas Redutoras do Ativo Não Circulante Intangível.
          </p>
        </div>

        {/* Assinaturas */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-center text-[10px]">
          <div>
            <div className="border-t border-neutral-400 pt-1 font-bold">{empresa.razaoSocial}</div>
            <div className="text-neutral-500">Representante Legal / Administrador</div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-1 font-bold">Contador Responsável Técnico</div>
            <div className="text-neutral-500">CRC/UF nº 000.000/O-0</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'MAPA DE AMORTIZAÇÃO DE BENS INTANGÍVEIS',
      subtitulo: `${empresa.razaoSocial} - Competência ${empresa.competenciaAtiva} - CPC 04 / NBC TG 04`,
      conteudo: conteudoA4
    });
  };

  const handleExportarCsv = () => {
    const data = bens.map(b => ({
      CodigoIdentificador: b.codigoIdentificador,
      Descricao: b.descricao,
      Categoria: b.categoria,
      TipoVidaUtil: b.tipoVidaUtil,
      DataAquisicao: b.dataAquisicao,
      InicioAmortizacao: b.inicioAmortizacao,
      VidaUtilMeses: b.vidaUtilMeses || 0,
      TaxaAmortizacaoAnual: b.taxaAmortizacaoAnual,
      CustoAquisicao: b.custoAquisicao,
      AmortizacaoAcumulada: b.amortizacaoAcumulada,
      ValorResidual: b.valorResidual,
      ValorContabilLiquido: b.valorContabilLiquido,
      QuotaMensalAmortizacao: b.quotaMensalAmortizacao,
      ContaAtivoId: b.contaAtivoIntangivelId,
      ContaAmortizacaoAcumuladaId: b.contaAmortizacaoAcumuladaId,
      ContaDespesaAmortizacaoId: b.contaDespesaAmortizacaoId,
      Status: b.status
    }));
    exportToCSV(data, `Intangiveis_${empresa.cnpj}_${empresa.competenciaAtiva}`);
  };

  // Filtragem
  const bensFiltrados = bens.filter(b => {
    if (filtroCategoria !== 'TODOS' && b.categoria !== filtroCategoria) return false;
    if (filtroVidaUtil !== 'TODOS' && b.tipoVidaUtil !== filtroVidaUtil) return false;
    if (filtroTexto.trim()) {
      const termo = filtroTexto.toLowerCase();
      const matchCod = b.codigoIdentificador.toLowerCase().includes(termo);
      const matchDesc = b.descricao.toLowerCase().includes(termo);
      const matchObs = (b.observacoes || '').toLowerCase().includes(termo);
      if (!matchCod && !matchDesc && !matchObs) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-neutral-200 overflow-hidden font-sans">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#171717]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-950/40 border border-purple-800/60 rounded-xl text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Controle de Bens do Ativo Intangível
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-900/40 text-purple-300 border border-purple-700/50 rounded-full">
                CPC 04 / NBC TG 04
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Escrituração de softwares, marcas/patentes, P&D tecnológico e amortização mensal com integração contábil
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportarCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
            title="Exportar dados para planilha CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleImprimirMapaAmortizacao}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
            title="Visualizar Mapa de Amortização A4 Timbrado"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Mapa A4 Timbrado</span>
          </button>

          <button
            onClick={handleApropriarAmortizacao}
            disabled={processandoAmortizacao}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
            title="Gerar lançamentos de amortização da competência ativa no Diário Geral"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{processandoAmortizacao ? 'Apropriando...' : 'Apropriar Amortização'}</span>
          </button>

          <button
            onClick={handleAbrirCriar}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Bem Intangível</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback de Sucesso */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-950/50 border border-emerald-700/60 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{mensagemSucesso}</span>
        </div>
      )}

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-5 gap-3.5 px-6 pt-4 pb-2">
        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Total de Bens</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white font-mono">{totalItens}</span>
            <span className="text-[11px] text-purple-400 font-medium">Cadastrados</span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Custo Histórico Total</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-neutral-100 font-mono">
              {custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Amortização Acumulada</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-amber-400 font-mono">
              {amortizacaoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Saldo Líquido Contábil</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {saldoLiquidoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Quota Mensal Estimada</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-purple-300 font-mono">
              {quotaMensalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filtros e Pesquisa */}
      <div className="flex items-center justify-between px-6 py-3 border-y border-neutral-800/60 bg-[#161616]">
        <div className="flex items-center space-x-3 w-1/3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              placeholder="Buscar por código identificador ou descrição..."
              className="w-full bg-[#1f1f1f] border border-neutral-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <span>Categoria:</span>
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="bg-[#1f1f1f] border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
            >
              <option value="TODOS">Todas as Categorias</option>
              <option value="SOFTWARE_SISTEMAS">Softwares e Sistemas</option>
              <option value="MARCAS_PATENTES">Marcas e Patentes</option>
              <option value="DESENVOLVIMENTO_TECNOLOGICO">P&D Tecnológico</option>
              <option value="CONCESSOES_DIREITOS">Concessões e Direitos</option>
              <option value="GOODWILL_FUNDO_COMERCIO">Goodwill / Fundo de Comércio</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <span>Vida Útil:</span>
            <select
              value={filtroVidaUtil}
              onChange={e => setFiltroVidaUtil(e.target.value)}
              className="bg-[#1f1f1f] border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="DEFINIDA">Vida Útil Definida (Amortizável)</option>
              <option value="INDEFINIDA">Vida Útil Indefinida (Impairment)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tabela de Bens Intangíveis */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-sm bg-[#171717]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#1c1c1c] text-neutral-400 font-medium">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Descrição & Categoria</th>
                <th className="py-2.5 px-3">Aquisição</th>
                <th className="py-2.5 px-3 text-right">Custo Aquisição</th>
                <th className="py-2.5 px-3">Vida Útil & Taxa</th>
                <th className="py-2.5 px-3 text-right">Amort. Acumulada</th>
                <th className="py-2.5 px-3 text-right">Saldo Líquido</th>
                <th className="py-2.5 px-3 text-right">Quota Mensal</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {bensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-neutral-500">
                    <p className="text-sm font-medium">Nenhum bem intangível encontrado.</p>
                    <p className="text-xs mt-1">Clique em "Novo Bem Intangível" para cadastrar itens de software, marcas, patentes ou goodwill.</p>
                  </td>
                </tr>
              ) : (
                bensFiltrados.map(bem => {
                  return (
                    <tr key={bem.id} className="hover:bg-neutral-800/30 transition">
                      <td className="py-2.5 px-3 font-mono font-semibold text-neutral-300">
                        {bem.codigoIdentificador}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{bem.descricao}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center space-x-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">
                            {bem.categoria}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300 font-mono text-[11px]">
                        {new Date(bem.dataAquisicao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-neutral-100">
                        {bem.custoAquisicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        {bem.tipoVidaUtil === 'INDEFINIDA' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 font-medium">
                            Indefinida (Impairment)
                          </span>
                        ) : (
                          <div>
                            <span className="text-neutral-200 font-semibold">{bem.vidaUtilMeses || 0} meses</span>
                            <span className="text-neutral-500 ml-1">({bem.taxaAmortizacaoAnual.toFixed(1)}% a.a.)</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-400">
                        {bem.amortizacaoAcumulada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {bem.valorContabilLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-purple-300">
                        {bem.quotaMensalAmortizacao > 0 ? bem.quotaMensalAmortizacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {bem.status === 'ATIVO' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium text-[10px]">
                            ATIVO
                          </span>
                        )}
                        {bem.status === 'TOTALMENTE_AMORTIZADO' && (
                          <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 font-medium text-[10px]">
                            AMORTIZADO
                          </span>
                        )}
                        {bem.status === 'BAIXADO' && (
                          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-medium text-[10px]">
                            BAIXADO
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleAbrirEditar(bem)}
                            className="p-1 text-neutral-400 hover:text-purple-400 hover:bg-neutral-800 rounded transition"
                            title="Editar Bem"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(bem.id, bem.descricao)}
                            className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition"
                            title="Excluir Bem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal de Cadastro & Edição de Bem Intangível */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-neutral-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#161616]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">
                  {editando ? 'Editar Bem Intangível' : 'Novo Bem Intangível (CPC 04)'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Seção 1: Identificação */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Código do Bem</label>
                  <input
                    type="text"
                    value={codigoIdentificador}
                    onChange={e => setCodigoIdentificador(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-neutral-400 font-medium mb-1">Descrição do Ativo</label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Ex: ERP Domínio Customizado 2026"
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Categoria (CPC 04)</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value as CategoriaIntangivel)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="SOFTWARE_SISTEMAS">Softwares e Sistemas ERP</option>
                    <option value="MARCAS_PATENTES">Marcas e Patentes</option>
                    <option value="DESENVOLVIMENTO_TECNOLOGICO">P&D Tecnológico (Projetos Internos)</option>
                    <option value="CONCESSOES_DIREITOS">Concessões e Direitos de Uso</option>
                    <option value="GOODWILL_FUNDO_COMERCIO">Goodwill / Fundo de Comércio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Tipo de Vida Útil</label>
                  <select
                    value={tipoVidaUtil}
                    onChange={e => {
                      const t = e.target.value as TipoVidaUtil;
                      setTipoVidaUtil(t);
                      if (t === 'INDEFINIDA') {
                        setTaxaAmortizacaoAnual(0);
                        setVidaUtilMeses(0);
                      } else {
                        setVidaUtilMeses(60);
                        setTaxaAmortizacaoAnual(20.0);
                      }
                    }}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="DEFINIDA">Vida Útil Definida (Amortizável)</option>
                    <option value="INDEFINIDA">Vida Útil Indefinida (Não Amortizável / Impairment)</option>
                  </select>
                </div>
              </div>

              {/* Seção 2: Datas e Prazos */}
              <div className="grid grid-cols-4 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Data Aquisição</label>
                  <input
                    type="date"
                    value={dataAquisicao}
                    onChange={e => setDataAquisicao(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Início Amortização</label>
                  <input
                    type="date"
                    value={inicioAmortizacao}
                    onChange={e => setInicioAmortizacao(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Vida Útil (Meses)</label>
                  <input
                    type="number"
                    value={vidaUtilMeses}
                    disabled={tipoVidaUtil === 'INDEFINIDA'}
                    onChange={e => {
                      const m = parseInt(e.target.value) || 0;
                      setVidaUtilMeses(m);
                      if (m > 0) {
                        setTaxaAmortizacaoAnual(parseFloat(((12 / m) * 100).toFixed(2)));
                      }
                    }}
                    className="w-full bg-[#222] border border-neutral-700 disabled:opacity-40 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Taxa Anual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={taxaAmortizacaoAnual}
                    disabled={tipoVidaUtil === 'INDEFINIDA'}
                    onChange={e => setTaxaAmortizacaoAnual(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#222] border border-neutral-700 disabled:opacity-40 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Seção 3: Valores Financeiros */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Custo Aquisição (R$)</label>
                  <input
                    type="text"
                    value={custoAquisicao}
                    onChange={e => setCustoAquisicao(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Valor Residual (R$)</label>
                  <input
                    type="text"
                    value={valorResidual}
                    onChange={e => setValorResidual(e.target.value)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Amort. Acumulada (R$)</label>
                  <input
                    type="text"
                    value={amortizacaoAcumulada}
                    onChange={e => setAmortizacaoAcumulada(e.target.value)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Seção 4: Contas Contábeis IDs */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Mapeamento Contábil IDs (Plano de Contas)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">ID Conta Ativo (D)</label>
                    <input
                      type="number"
                      value={contaAtivoIntangivelId}
                      onChange={e => setContaAtivoIntangivelId(parseInt(e.target.value) || 21)}
                      className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">ID Redutora (C)</label>
                    <input
                      type="number"
                      value={contaAmortizacaoAcumuladaId}
                      onChange={e => setContaAmortizacaoAcumuladaId(parseInt(e.target.value) || 22)}
                      className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">ID Despesa Amort. (D)</label>
                    <input
                      type="number"
                      value={contaDespesaAmortizacaoId}
                      onChange={e => setContaDespesaAmortizacaoId(parseInt(e.target.value) || 58)}
                      className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 5: Status e Observações */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Status do Bem</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="ATIVO">Ativo em Operação</option>
                    <option value="TOTALMENTE_AMORTIZADO">Totalmente Amortizado</option>
                    <option value="BAIXADO">Baixado / Alienado</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-neutral-400 font-medium mb-1">Observações / Impairment Test</label>
                  <input
                    type="text"
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Registro INPI, Laudo de Avaliação ou testes de recuperabilidade..."
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md transition"
                >
                  Salvar Bem Intangível
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
