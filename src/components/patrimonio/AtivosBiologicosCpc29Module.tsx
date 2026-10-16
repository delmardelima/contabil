import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Layers,
  Scale,
  Calendar,
  UserCheck,
  Building,
  HelpCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  AtivoBiologicoCpc29,
  ResumoAtivosBiologicos,
  TipoAtivoBiologico,
  CategoriaAtivoBiologico,
  UnidadeMedidaBiologica,
  EstagioMaturacaoBiologico
} from '../../types/contabil';

interface AtivosBiologicosCpc29ModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const AtivosBiologicosCpc29Module: React.FC<AtivosBiologicosCpc29ModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoAtivosBiologicos | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [abaAtiva, setAbaAtiva] = useState<'ativos' | 'simulador' | 'normas'>('ativos');

  // Modal de Cadastro / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AtivoBiologicoCpc29 | null>(null);

  // Form State
  const [codigoItem, setCodigoItem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoAtivoBiologico>('CONSUMIVEL');
  const [categoria, setCategoria] = useState<CategoriaAtivoBiologico>('PECUARIA_BOVINA');
  const [unidadeMedida, setUnidadeMedida] = useState<UnidadeMedidaBiologica>('CABECAS');
  const [quantidade, setQuantidade] = useState<number>(100);
  const [custoHistoricoAquisicao, setCustoHistoricoAquisicao] = useState<number>(100000);
  const [cotacaoMercadoUnitario, setCotacaoMercadoUnitario] = useState<number>(1200);
  const [despesasEstimadasVendaUnitario, setDespesasEstimadasVendaUnitario] = useState<number>(50);
  const [saldoContabilAnterior, setSaldoContabilAnterior] = useState<number>(100000);
  const [dataAvaliacao, setDataAvaliacao] = useState('2026-03-31');
  const [estagioMaturacao, setEstagioMaturacao] = useState<EstagioMaturacaoBiologico>('EM_DESENVOLVIMENTO');
  const [numeroLaudoAvaliacao, setNumeroLaudoAvaliacao] = useState('');
  const [responsavelTecnicoAgronomo, setResponsavelTecnicoAgronomo] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Simulador State
  const [simQuantidade, setSimQuantidade] = useState<number>(500);
  const [simCotacao, setSimCotacao] = useState<number>(3150);
  const [simDespesas, setSimDespesas] = useState<number>(110);
  const [simCustoAnterior, setSimCustoAnterior] = useState<number>(1400000);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getResumoAtivosBiologicos(empresaAtiva.id);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva]);

  const handleOpenNovo = () => {
    setEditingItem(null);
    setCodigoItem(`BIO-${Math.floor(100 + Math.random() * 900)}`);
    setDescricao('');
    setTipo('CONSUMIVEL');
    setCategoria('PECUARIA_BOVINA');
    setUnidadeMedida('CABECAS');
    setQuantidade(100);
    setCustoHistoricoAquisicao(250000);
    setCotacaoMercadoUnitario(2800);
    setDespesasEstimadasVendaUnitario(100);
    setSaldoContabilAnterior(250000);
    setDataAvaliacao(new Date().toISOString().split('T')[0]);
    setEstagioMaturacao('EM_DESENVOLVIMENTO');
    setNumeroLaudoAvaliacao(`LAUDO-AGRO-2026-${Math.floor(10 + Math.random() * 90)}`);
    setResponsavelTecnicoAgronomo('Eng. Agrônomo Responsável');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleOpenEditar = (item: AtivoBiologicoCpc29) => {
    setEditingItem(item);
    setCodigoItem(item.codigoItem);
    setDescricao(item.descricao);
    setTipo(item.tipo);
    setCategoria(item.categoria);
    setUnidadeMedida(item.unidadeMedida);
    setQuantidade(item.quantidade);
    setCustoHistoricoAquisicao(item.custoHistoricoAquisicao);
    setCotacaoMercadoUnitario(item.cotacaoMercadoUnitario);
    setDespesasEstimadasVendaUnitario(item.despesasEstimadasVendaUnitario);
    setSaldoContabilAnterior(item.saldoContabilAnterior);
    setDataAvaliacao(item.dataAvaliacao);
    setEstagioMaturacao(item.estagioMaturacao);
    setNumeroLaudoAvaliacao(item.numeroLaudoAvaliacao);
    setResponsavelTecnicoAgronomo(item.responsavelTecnicoAgronomo);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const valorUnitLiq = Math.max(0, cotacaoMercadoUnitario - despesasEstimadasVendaUnitario);
    const valorTotLiq = Math.round(quantidade * valorUnitLiq * 100) / 100;
    const varValorJusto = Math.round((valorTotLiq - saldoContabilAnterior) * 100) / 100;

    const item: AtivoBiologicoCpc29 = {
      id: editingItem ? editingItem.id : Date.now(),
      empresaId: empresaAtiva.id,
      codigoItem,
      descricao,
      tipo,
      categoria,
      unidadeMedida,
      quantidade: Number(quantidade),
      custoHistoricoAquisicao: Number(custoHistoricoAquisicao),
      cotacaoMercadoUnitario: Number(cotacaoMercadoUnitario),
      despesasEstimadasVendaUnitario: Number(despesasEstimadasVendaUnitario),
      valorJustoUnitarioLiquido: valorUnitLiq,
      valorJustoTotalLiquido: valorTotLiq,
      saldoContabilAnterior: Number(saldoContabilAnterior),
      variacaoValorJusto: varValorJusto,
      dataAvaliacao,
      estagioMaturacao,
      integradoContabil: editingItem ? editingItem.integradoContabil : false,
      numeroLaudoAvaliacao,
      responsavelTecnicoAgronomo,
      observacoes
    };

    dbService.salvarAtivoBiologico(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este ativo biológico?')) {
      dbService.excluirAtivoBiologico(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: number) => {
    const res = dbService.integrarVariacaoBiologicoContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const handleEmitirLaudoA4 = (item: AtivoBiologicoCpc29) => {
    if (!onOpenReportPreview || !empresaAtiva) return;

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.5;">
        <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 18px;">
          <h2 style="margin: 0; color: #065f46; font-size: 15pt; text-transform: uppercase;">
            ${empresaAtiva.razaoSocial}
          </h2>
          <div style="font-size: 9pt; color: #555; margin-top: 4px;">
            CNPJ: ${empresaAtiva.cnpj} | Inscrição Estadual: ${empresaAtiva.inscricaoEstadual || 'Isento'}
          </div>
          <h3 style="margin: 12px 0 0 0; color: #111; font-size: 13pt;">
            LAUDO TÉCNICO PERICIAL DE AVALIAÇÃO DE ATIVOS BIOLÓGICOS (CPC 29 / NBC TG 29)
          </h3>
          <div style="font-size: 9pt; color: #047857; font-weight: bold; margin-top: 2px;">
            Nº ${item.numeroLaudoAvaliacao} — Exercício Social de 2026
          </div>
        </div>

        <div style="margin-bottom: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
            <tr>
              <td style="width: 25%; font-weight: bold; color: #166534;">Código do Item:</td>
              <td style="width: 25%; font-family: monospace;">${item.codigoItem}</td>
              <td style="width: 25%; font-weight: bold; color: #166534;">Data do Laudo:</td>
              <td style="width: 25%;">${new Date(item.dataAvaliacao).toLocaleDateString('pt-BR')}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #166534;">Classificação CPC 29:</td>
              <td>${item.tipo === 'CONSUMIVEL' ? 'Ativo Consumível' : item.tipo === 'PRODUCAO_PLANTA_PORTADORA' ? 'Planta Portadora (CPC 27)' : 'Produto Agrícola no Ponto de Colheita'}</td>
              <td style="font-weight: bold; color: #166534;">Categoria Agropecuária:</td>
              <td>${item.categoria.replace('_', ' ')}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #166534;">Estágio de Maturação:</td>
              <td>${item.estagioMaturacao.replace(/_/g, ' ')}</td>
              <td style="font-weight: bold; color: #166534;">Responsável Técnico:</td>
              <td>${item.responsavelTecnicoAgronomo}</td>
            </tr>
          </table>
        </div>

        <h4 style="color: #065f46; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px;">
          1. ESPECIFICAÇÃO DO BIOMA E CARACTERÍSTICAS ZOOTÉCNICAS / AGRONÔMICAS
        </h4>
        <p style="text-align: justify; font-size: 9.5pt; margin-bottom: 12px;">
          O presente laudo técnico pericial tem por objetivo mensurar e reconhecer a mensuração a <strong>Valor Justo líquido das despesas estimadas no ponto de venda</strong> do ativo biológico <strong>${item.descricao}</strong>, pertencente ao patrimônio da entidade, em estrita conformidade com os Itens 12 a 25 do Pronunciamento Técnico <strong>CPC 29 / NBC TG 29 (Ativo Biológico e Produto Agrícola)</strong> e IAS 41 (Agriculture).
        </p>

        <h4 style="color: #065f46; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px;">
          2. QUADRO DEMONSTRATIVO DE MENSURAÇÃO A VALOR JUSTO
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #047857; color: white;">
              <th style="padding: 6px; border: 1px solid #047857; text-align: left;">Parâmetro de Mensuração</th>
              <th style="padding: 6px; border: 1px solid #047857; text-align: center;">Quantidade / Base</th>
              <th style="padding: 6px; border: 1px solid #047857; text-align: right;">Cotação Unitária (R$)</th>
              <th style="padding: 6px; border: 1px solid #047857; text-align: right;">Total Líquido (R$)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px; border: 1px solid #ddd;">Custo Histórico Acumulado (Formação / Aquisição)</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${item.quantidade.toLocaleString('pt-BR')} ${item.unidadeMedida}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">R$ ${(item.custoHistoricoAquisicao / (item.quantidade || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">R$ ${item.custoHistoricoAquisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 6px; border: 1px solid #ddd;">Cotação Bruta de Mercado Ativo (Commodity / CEPEA)</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${item.quantidade.toLocaleString('pt-BR')} ${item.unidadeMedida}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">R$ ${item.cotacaoMercadoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">R$ ${(item.quantidade * item.cotacaoMercadoUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #ddd; color: #dc2626;">(-) Despesas Estimadas no Ponto de Venda (Frete, Comissões, Tributos)</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${item.quantidade.toLocaleString('pt-BR')} ${item.unidadeMedida}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right; color: #dc2626;">- R$ ${item.despesasEstimadasVendaUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right; color: #dc2626;">- R$ ${(item.quantidade * item.despesasEstimadasVendaUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="background-color: #ecfdf5; font-weight: bold;">
              <td style="padding: 6px; border: 1px solid #a7f3d0; color: #065f46;">(=) VALOR JUSTO LÍQUIDO NO PONTO DE VENDA (CPC 29)</td>
              <td style="padding: 6px; border: 1px solid #a7f3d0; text-align: center;">${item.quantidade.toLocaleString('pt-BR')} ${item.unidadeMedida}</td>
              <td style="padding: 6px; border: 1px solid #a7f3d0; text-align: right; color: #065f46;">R$ ${item.valorJustoUnitarioLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px; border: 1px solid #a7f3d0; text-align: right; color: #065f46;">R$ ${item.valorJustoTotalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #ddd;">(-) Saldo Contábil Escriturado Anterior</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">-</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">-</td>
              <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">R$ ${item.saldoContabilAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="background-color: ${item.variacaoValorJusto >= 0 ? '#f0fdf4' : '#fef2f2'}; font-weight: bold;">
              <td style="padding: 6px; border: 1px solid ${item.variacaoValorJusto >= 0 ? '#86efac' : '#fca5a5'}; color: ${item.variacaoValorJusto >= 0 ? '#166534' : '#991b1b'};">
                (=) VARIAÇÃO RECONHECIDA NO RESULTADO DO EXERCÍCIO (DRE)
              </td>
              <td style="padding: 6px; border: 1px solid ${item.variacaoValorJusto >= 0 ? '#86efac' : '#fca5a5'}; text-align: center;">
                ${item.variacaoValorJusto >= 0 ? 'GANHO' : 'PERDA'}
              </td>
              <td style="padding: 6px; border: 1px solid ${item.variacaoValorJusto >= 0 ? '#86efac' : '#fca5a5'}; text-align: right;">-</td>
              <td style="padding: 6px; border: 1px solid ${item.variacaoValorJusto >= 0 ? '#86efac' : '#fca5a5'}; text-align: right; color: ${item.variacaoValorJusto >= 0 ? '#166534' : '#991b1b'}; font-size: 10pt;">
                ${item.variacaoValorJusto >= 0 ? '+' : ''} R$ ${item.variacaoValorJusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        <h4 style="color: #065f46; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px;">
          3. MEMÓRIA DE LANÇAMENTO CONTÁBIL (PARTIDAS DOBRADAS)
        </h4>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; font-family: monospace; font-size: 8.5pt; margin-bottom: 16px;">
          ${item.variacaoValorJusto >= 0 ? `
          D - 1.1.05.01 - Ativos Biológicos em Formação (Ativo Circulante): R$ ${item.variacaoValorJusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>
          C - 3.1.03.01 - Ganho com Variação a Valor Justo de Ativos Biológicos (Resultado): R$ ${item.variacaoValorJusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>
          <em>Histórico: Reconhecimento do ganho por avaliação a valor justo conf. CPC 29 Item 26 ref. ${item.descricao}.</em>
          ` : `
          D - 4.1.04.08 - Despesa com Perda na Avaliação de Ativos Biológicos (Resultado): R$ ${Math.abs(item.variacaoValorJusto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>
          C - 1.1.05.01 - Ativos Biológicos em Formação (Ativo Circulante): R$ ${Math.abs(item.variacaoValorJusto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br/>
          <em>Histórico: Reconhecimento de perda por variação a valor justo conf. CPC 29 Item 26 ref. ${item.descricao}.</em>
          `}
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 6px; font-weight: bold; font-size: 9.5pt;">
              ${item.responsavelTecnicoAgronomo}
            </div>
            <div style="font-size: 8.5pt; color: #555;">
              Perito Avaliador Agrônomo / Zootecnista Responsável
            </div>
          </div>
          <div style="width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 6px; font-weight: bold; font-size: 9.5pt;">
              Contador Responsável Técnico
            </div>
            <div style="font-size: 8.5pt; color: #555;">
              CRC/SP Oficial Ativo — ERP Contábil Studio Pro
            </div>
          </div>
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'LAUDO TÉCNICO DE ATIVOS BIOLÓGICOS (CPC 29)',
      subtitulo: `${item.descricao} - Nº ${item.numeroLaudoAvaliacao}`,
      conteudoHtml: html
    });
  };

  const itensFiltrados = (resumo?.itens || []).filter(item => {
    const matchBusca =
      item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      item.codigoItem.toLowerCase().includes(busca.toLowerCase()) ||
      item.numeroLaudoAvaliacao.toLowerCase().includes(busca.toLowerCase());
    const matchCat = filtroCategoria === 'TODAS' || item.categoria === filtroCategoria;
    return matchBusca && matchCat;
  });

  // Cálculo do simulador
  const simValorUnitLiquido = Math.max(0, simCotacao - simDespesas);
  const simValorTotalLiquido = Math.round(simQuantidade * simValorUnitLiquido * 100) / 100;
  const simVariacaoDRE = Math.round((simValorTotalLiquido - simCustoAnterior) * 100) / 100;

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200">
      {/* Top Header */}
      <div className="p-4 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-400">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-white tracking-wide">
                Ativos Biológicos e Produtos Agrícolas (CPC 29 / NBC TG 29)
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                IAS 41 Agro
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Mensuração a Valor Justo líquido de despesas de venda, apuração periódica de variações patrimoniais e laudo pericial agronômico
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={carregarDados}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#262626] rounded transition-colors"
            title="Recarregar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenNovo}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Ativo Biológico</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-5 gap-3 p-4 bg-[#161616] border-b border-[#242424]">
        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Valor Justo Líquido Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            R$ {(resumo?.valorTotalJusto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Ativo escriturado a valor de mercado
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Ganhos de Valor Justo</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            + R$ {(resumo?.totalGanhosValorJusto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Receita operacional na DRE
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Perdas por Desvalorização</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 font-mono">
            - R$ {(resumo?.totalPerdasValorJusto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Despesa operacional na DRE
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Impacto Líquido DRE</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-lg font-bold font-mono ${(resumo?.saldoLiquidoVariacaoDRE || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(resumo?.saldoLiquidoVariacaoDRE || 0) >= 0 ? '+' : ''} R$ {(resumo?.saldoLiquidoVariacaoDRE || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Efeito econômico líquido do exercício
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#282828]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Itens Mensurados</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {resumo?.totalItens || 0}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Rebanhos, lavouras e florestas ativas
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 px-4 border-b border-[#262626] bg-[#181818]">
        <button
          onClick={() => setAbaAtiva('ativos')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'ativos'
              ? 'border-emerald-500 text-emerald-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Carteira de Ativos Biológicos & Avaliações
        </button>
        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'simulador'
              ? 'border-emerald-500 text-emerald-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Simulador Interativo CPC 29 Sandbox
        </button>
        <button
          onClick={() => setAbaAtiva('normas')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            abaAtiva === 'normas'
              ? 'border-emerald-500 text-emerald-400 bg-[#202020]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Diretrizes Técnicas CPC 29 vs CPC 27
        </button>
      </div>

      {/* Tab 1: Ativos Biológicos Table */}
      {abaAtiva === 'ativos' && (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por descrição, código ou número de laudo..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-neutral-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="TODAS">Todas as Categorias</option>
                <option value="PECUARIA_BOVINA">Pecuária Bovina</option>
                <option value="LAVOURA_TEMPORARIA">Lavoura Temporária (Grãos)</option>
                <option value="FLORESTA_COMERCIAL">Floresta Comercial</option>
                <option value="CULTURA_PERMANENTE">Cultura Permanente</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto rounded border border-[#262626] bg-[#171717]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#1f1f1f] text-neutral-300 sticky top-0 border-b border-[#2a2a2a]">
                <tr>
                  <th className="p-2.5 font-semibold">Código / Descrição</th>
                  <th className="p-2.5 font-semibold">Categoria / Tipo</th>
                  <th className="p-2.5 font-semibold text-right">Qtd / Unid.</th>
                  <th className="p-2.5 font-semibold text-right">Cotação Mercado</th>
                  <th className="p-2.5 font-semibold text-right">Despesas Venda</th>
                  <th className="p-2.5 font-semibold text-right">Valor Justo Líquido</th>
                  <th className="p-2.5 font-semibold text-right">Variação DRE</th>
                  <th className="p-2.5 font-semibold text-center">Status</th>
                  <th className="p-2.5 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-neutral-500">
                      Nenhum ativo biológico encontrado. Clique em "Novo Ativo Biológico" para registrar a mensuração.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-[#1d1d1d] transition-colors">
                      <td className="p-2.5">
                        <div className="font-semibold text-white">{item.descricao}</div>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          {item.codigoItem} • Laudo: {item.numeroLaudoAvaliacao}
                        </div>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#222] border border-[#333] text-neutral-300">
                          {item.categoria.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-1">
                          {item.tipo === 'CONSUMIVEL' ? 'Consumível' : 'Planta Portadora'}
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {item.quantidade.toLocaleString('pt-BR')} {item.unidadeMedida}
                      </td>
                      <td className="p-2.5 text-right font-mono text-neutral-300">
                        R$ {item.cotacaoMercadoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono text-rose-400">
                        - R$ {item.despesasEstimadasVendaUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-emerald-400">
                        R$ {item.valorJustoTotalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-neutral-500 font-normal">
                          (R$ {item.valorJustoUnitarioLiquido.toFixed(2)}/un)
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.variacaoValorJusto > 0
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                            : item.variacaoValorJusto < 0
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-700/60'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {item.variacaoValorJusto > 0 ? '+' : ''} R$ {item.variacaoValorJusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {item.integradoContabil ? (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            <CheckCircle className="w-3 h-3" />
                            <span>Integrado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/40">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pendente</span>
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleIntegrarContabil(item.id)}
                            className="p-1 text-emerald-400 hover:bg-emerald-950/50 rounded transition-colors"
                            title="Integrar Ajuste no Diário Geral"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEmitirLaudoA4(item)}
                            className="p-1 text-blue-400 hover:bg-blue-950/50 rounded transition-colors"
                            title="Emitir Laudo Pericial A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditar(item)}
                            className="p-1 text-neutral-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Editar Ativo"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id)}
                            className="p-1 text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
                            title="Excluir Ativo"
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
      )}

      {/* Tab 2: Simulador Interativo Sandbox */}
      {abaAtiva === 'simulador' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-4 rounded-lg bg-[#181818] border border-[#262626]">
              <h2 className="text-sm font-semibold text-white mb-1 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Simulador de Variação de Valor Justo (Commodities & Rebanhos)</span>
              </h2>
              <p className="text-xs text-neutral-400 mb-4">
                Teste sensibilidades de flutuação de cotação de mercado líquido de despesas no ponto de venda (fretes até o terminal portuário, despesas alfandegárias, taxas sanitárias).
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Quantidade Estimada (Cabeças, Sacas ou Hectares):
                  </label>
                  <input
                    type="number"
                    value={simQuantidade}
                    onChange={e => setSimQuantidade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Cotação Bruta de Mercado Unitária (R$):
                  </label>
                  <input
                    type="number"
                    value={simCotacao}
                    onChange={e => setSimCotacao(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Despesas Estimadas no Ponto de Venda Unitárias (R$):
                  </label>
                  <input
                    type="number"
                    value={simDespesas}
                    onChange={e => setSimDespesas(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Saldo Contábil Anterior Escriturado (R$):
                  </label>
                  <input
                    type="number"
                    value={simCustoAnterior}
                    onChange={e => setSimCustoAnterior(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#202020] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Simulation Result Box */}
              <div className="p-4 rounded-lg bg-[#202020] border border-[#333]">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-neutral-400">Valor Justo Unitário Líquido</div>
                    <div className="text-lg font-bold text-white font-mono mt-1">
                      R$ {simValorUnitLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Valor Justo Total Líquido</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                      R$ {simValorTotalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-400">Variação a Reconhecer na DRE</div>
                    <div className={`text-lg font-bold font-mono mt-1 ${simVariacaoDRE >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simVariacaoDRE >= 0 ? '+ ' : ''}R$ {simVariacaoDRE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2e2e2e] text-xs text-neutral-400 flex items-center justify-between">
                  <span>
                    Classificação contábil do resultado: <strong>{simVariacaoDRE >= 0 ? 'Outras Receitas Operacionais (Ganhos a Valor Justo)' : 'Despesas Operacionais (Perdas a Valor Justo)'}</strong>
                  </span>
                  <span className="text-emerald-400 font-medium">
                    CPC 29 / NBC TG 29 Item 26
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Normas e Segregação CPC 29 vs CPC 27 */}
      {abaAtiva === 'normas' && (
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-4 text-xs leading-relaxed text-neutral-300">
            <div className="p-4 rounded-lg bg-[#181818] border border-[#262626]">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Diferenciação Regulatória: CPC 29 vs CPC 27 (Plantas Portadoras)</span>
              </h3>
              <p className="mb-2">
                Com a revisão do Pronunciamento Técnico CPC 27 (Imobilizado) e CPC 29 (Ativo Biológico), ocorrida pela introdução das emendas ao IAS 16 e IAS 41:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                <li>
                  <strong className="text-neutral-200">Plantas Portadoras (Bearer Plants - CPC 27):</strong> Árvores e cultivos utilizados exclusivamente para produzir safras agrícolas por mais de um período e que têm remota probabilidade de venda como produto (ex: laranjais, macieiras, parreirais de uva, palmeiras de dendê). <em>São contabilizadas no Ativo Imobilizado ao custo histórico menos depreciação acumulada e perdas por redução ao valor recuperável.</em>
                </li>
                <li>
                  <strong className="text-neutral-200">Produtos Agrícolas na Planta (CPC 29):</strong> A fruta em desenvolvimento nos galhos (ex: as laranjas ou uvas antes da colheita) continua sendo ativo biológico e deve ser mensurada a <strong>Valor Justo menos Despesas de Venda</strong>.
                </li>
                <li>
                  <strong className="text-neutral-200">Ativos Biológicos Consumíveis (CPC 29):</strong> São aqueles colhidos como produto agrícola ou vendidos como ativos biológicos (ex: gado de corte, soja, milho, florestas para celulose/madeira). Mensurados ao Valor Justo na data de cada balanço.
                </li>
                <li>
                  <strong className="text-neutral-200">Ponto de Colheita (Transferência para CPC 16 - Estoques):</strong> No instante da colheita ou abate, o produto agrícola é transferido para Estoques pelo seu valor justo apurado no ponto de corte, passando subsequentemente a ser regulado pelo CPC 16 (Custo ou Valor Realizável Líquido).
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>{editingItem ? 'Editar Ativo Biológico' : 'Novo Ativo Biológico (CPC 29)'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-auto p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Código do Item:</label>
                  <input
                    type="text"
                    required
                    value={codigoItem}
                    onChange={e => setCodigoItem(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Data da Avaliação:</label>
                  <input
                    type="date"
                    required
                    value={dataAvaliacao}
                    onChange={e => setDataAvaliacao(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Descrição Detalhada do Ativo Biológico:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rebanho Bovino Nelore P.O., Lavoura de Milho Safrinha..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Tipo de Ativo:</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as TipoAtivoBiologico)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CONSUMIVEL">Consumível (Abate/Grãos)</option>
                    <option value="PRODUCAO_PLANTA_PORTADORA">Planta Portadora (CPC 27)</option>
                    <option value="PRODUTO_AGRICOLA_COLHEITA">Produto na Colheita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Categoria:</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value as CategoriaAtivoBiologico)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PECUARIA_BOVINA">Pecuária Bovina</option>
                    <option value="LAVOURA_TEMPORARIA">Lavoura Temporária</option>
                    <option value="FLORESTA_COMERCIAL">Floresta Comercial</option>
                    <option value="CULTURA_PERMANENTE">Cultura Permanente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Unidade de Medida:</label>
                  <select
                    value={unidadeMedida}
                    onChange={e => setUnidadeMedida(e.target.value as UnidadeMedidaBiologica)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CABECAS">Cabeças (Animais)</option>
                    <option value="HECTARES">Hectares (Área)</option>
                    <option value="TONELADAS">Toneladas</option>
                    <option value="SACAS_60KG">Sacas de 60kg</option>
                    <option value="ARROBAS_15KG">Arrobas (@ 15kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Quantidade:</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quantidade}
                    onChange={e => setQuantidade(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Cotação Mercado Unitária (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cotacaoMercadoUnitario}
                    onChange={e => setCotacaoMercadoUnitario(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Despesas Venda Unitárias (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={despesasEstimadasVendaUnitario}
                    onChange={e => setDespesasEstimadasVendaUnitario(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Custo Histórico Aquisição/Formação (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={custoHistoricoAquisicao}
                    onChange={e => setCustoHistoricoAquisicao(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Saldo Contábil Anterior Escriturado (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={saldoContabilAnterior}
                    onChange={e => setSaldoContabilAnterior(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Número do Laudo de Avaliação:</label>
                  <input
                    type="text"
                    required
                    value={numeroLaudoAvaliacao}
                    onChange={e => setNumeroLaudoAvaliacao(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Responsável Técnico / CREA / CRMV:</label>
                  <input
                    type="text"
                    required
                    value={responsavelTecnicoAgronomo}
                    onChange={e => setResponsavelTecnicoAgronomo(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Observações Técnicas / Premissas:</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#242424] border border-[#333] rounded text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-[#2e2e2e] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#252525] rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
