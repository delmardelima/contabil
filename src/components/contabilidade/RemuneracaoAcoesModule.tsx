import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Calculator,
  Calendar,
  Edit,
  Trash2,
  ShieldCheck,
  DollarSign,
  ArrowRightLeft,
  FileCheck2,
  Building,
  Users,
  Percent,
  Clock,
  Landmark,
  Layers,
  HelpCircle,
  Sliders,
  Award,
  Activity
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ConcessaoOpcaoAcoes,
  ResumoRemuneracaoAcoes,
  TipoPlanoAcoes,
  StatusPlanoAcoes
} from '../../types/contabil';

interface RemuneracaoAcoesModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const RemuneracaoAcoesModule: React.FC<RemuneracaoAcoesModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoRemuneracaoAcoes | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'planos' | 'simulador' | 'legislacao'>('planos');
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ConcessaoOpcaoAcoes | null>(null);

  // Formulário State
  const [numeroPlanoEdital, setNumeroPlanoEdital] = useState('');
  const [nomeBeneficiario, setNomeBeneficiario] = useState('');
  const [cargoBeneficiario, setCargoBeneficiario] = useState('Diretor Executivo');
  const [tipoPlano, setTipoPlano] = useState<TipoPlanoAcoes>('STOCK_OPTIONS_EQUITY');
  const [dataOutorgaGrantDate, setDataOutorgaGrantDate] = useState('2025-01-15');
  const [dataInicioVesting, setDataInicioVesting] = useState('2025-01-15');
  const [dataFimVesting, setDataFimVesting] = useState('2028-01-15');
  const [prazoVestingMeses, setPrazoVestingMeses] = useState(36);
  const [mesesDecorridos, setMesesDecorridos] = useState(12);
  const [quantidadeOpcoesOutorgadas, setQuantidadeOpcoesOutorgadas] = useState(100000);
  const [precoExercicioStrikeBRL, setPrecoExercicioStrikeBRL] = useState(25);
  const [precoAcaoNaOutorgaSpotBRL, setPrecoAcaoNaOutorgaSpotBRL] = useState(24.5);
  const [taxaLivreRiscoSelicPercentual, setTaxaLivreRiscoSelicPercentual] = useState(10.75);
  const [volatilidadeEsperadaPercentual, setVolatilidadeEsperadaPercentual] = useState(32.5);
  const [valorJustoUnitarioBlackScholesBRL, setValorJustoUnitarioBlackScholesBRL] = useState(8.4);
  const [status, setStatus] = useState<StatusPlanoAcoes>('EM_VESTING');
  const [observacoes, setObservacoes] = useState('');

  // Simulador Black-Scholes-Merton
  const [bsSpot, setBsSpot] = useState(30.0);
  const [bsStrike, setBsStrike] = useState(30.0);
  const [bsPrazoAnos, setBsPrazoAnos] = useState(3.0);
  const [bsTaxaSelic, setBsTaxaSelic] = useState(10.5);
  const [bsVolatilidade, setBsVolatilidade] = useState(35.0);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getRemuneracaoAcoes(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setNumeroPlanoEdital(`SOP-${anoFiltro}/${Math.floor(100 + Math.random() * 900)}`);
    setNomeBeneficiario('Eduardo Vasconcelos Rezende');
    setCargoBeneficiario('Diretor de Operações e Supply Chain');
    setTipoPlano('STOCK_OPTIONS_EQUITY');
    setDataOutorgaGrantDate(new Date().toISOString().split('T')[0]);
    setDataInicioVesting(new Date().toISOString().split('T')[0]);
    const dFim = new Date();
    dFim.setFullYear(dFim.getFullYear() + 3);
    setDataFimVesting(dFim.toISOString().split('T')[0]);
    setPrazoVestingMeses(36);
    setMesesDecorridos(1);
    setQuantidadeOpcoesOutorgadas(80000);
    setPrecoExercicioStrikeBRL(28.0);
    setPrecoAcaoNaOutorgaSpotBRL(27.5);
    setTaxaLivreRiscoSelicPercentual(10.75);
    setVolatilidadeEsperadaPercentual(33.0);
    setValorJustoUnitarioBlackScholesBRL(9.2);
    setStatus('EM_VESTING');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: ConcessaoOpcaoAcoes) => {
    setItemEdicao(item);
    setNumeroPlanoEdital(item.numeroPlanoEdital);
    setNomeBeneficiario(item.nomeBeneficiario);
    setCargoBeneficiario(item.cargoBeneficiario);
    setTipoPlano(item.tipoPlano);
    setDataOutorgaGrantDate(item.dataOutorgaGrantDate);
    setDataInicioVesting(item.dataInicioVesting);
    setDataFimVesting(item.dataFimVesting);
    setPrazoVestingMeses(item.prazoVestingMeses);
    setMesesDecorridos(item.mesesDecorridos);
    setQuantidadeOpcoesOutorgadas(item.quantidadeOpcoesOutorgadas);
    setPrecoExercicioStrikeBRL(item.precoExercicioStrikeBRL);
    setPrecoAcaoNaOutorgaSpotBRL(item.precoAcaoNaOutorgaSpotBRL);
    setTaxaLivreRiscoSelicPercentual(item.taxaLivreRiscoSelicPercentual);
    setVolatilidadeEsperadaPercentual(item.volatilidadeEsperadaPercentual);
    setValorJustoUnitarioBlackScholesBRL(item.valorJustoUnitarioBlackScholesBRL);
    setStatus(item.status);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const valorJustoTotal = Math.round((quantidadeOpcoesOutorgadas * valorJustoUnitarioBlackScholesBRL) * 100) / 100;
    const despesaMensal = prazoVestingMeses > 0 ? Math.round((valorJustoTotal / prazoVestingMeses) * 100) / 100 : 0;
    const despesaAcumulada = Math.round((despesaMensal * mesesDecorridos) * 100) / 100;
    const saldoApropriar = Math.max(0, valorJustoTotal - despesaAcumulada);

    const item: ConcessaoOpcaoAcoes = {
      id: itemEdicao ? itemEdicao.id : `sop-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroPlanoEdital,
      nomeBeneficiario,
      cargoBeneficiario,
      tipoPlano,
      dataOutorgaGrantDate,
      dataInicioVesting,
      dataFimVesting,
      prazoVestingMeses,
      mesesDecorridos,
      quantidadeOpcoesOutorgadas,
      precoExercicioStrikeBRL,
      precoAcaoNaOutorgaSpotBRL,
      taxaLivreRiscoSelicPercentual,
      volatilidadeEsperadaPercentual,
      valorJustoUnitarioBlackScholesBRL,
      valorJustoTotalOutorgaBRL: valorJustoTotal,
      despesaApropriadaAcumuladaBRL: despesaAcumulada,
      saldoApropriarVestingBRL: saldoApropriar,
      despesaMensalCompetenciaBRL: despesaMensal,
      status,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes.trim() ? observacoes.trim() : undefined
    };

    const res = dbService.salvarConcessaoOpcaoAcoes(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    } else {
      alert(res.mensagem);
    }
  };

  const handleExcluir = (id: string, numero: string) => {
    if (confirm(`Tem certeza que deseja remover o plano "${numero}"?`)) {
      dbService.excluirConcessaoOpcaoAcoes(id);
      carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarDespesaAcoesContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filtragem da lista
  const itensFiltrados = (resumo?.concessoes || []).filter(item => {
    const matchBusca =
      item.numeroPlanoEdital.toLowerCase().includes(busca.toLowerCase()) ||
      item.nomeBeneficiario.toLowerCase().includes(busca.toLowerCase()) ||
      item.cargoBeneficiario.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'TODOS' || item.tipoPlano === filtroTipo;
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
    return matchBusca && matchTipo && matchStatus;
  });

  const handleImprimirRelatorio = () => {
    if (!resumo || !empresaAtiva) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 20px;">
        <div style="border-bottom: 2px solid #8b5cf6; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #6d28d9;">DEMONSTRATIVO DE REMUNERAÇÃO BASEADA EM AÇÕES (STOCK OPTIONS)</h1>
          <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">CPC 10 (R1) / IFRS 2 / Lei 6.404/76 / Tema Repetitivo 1.226 STJ - Exercício ${anoFiltro}</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Empresa:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Exercício:</strong> ${anoFiltro}</div>
            <div><strong>Total de Planos Ativos:</strong> ${resumo.totalPlanosAtivos}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #8b5cf6;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Total de Opções Outorgadas</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${resumo.totalOpcoesOutorgadas.toLocaleString('pt-BR')} ações</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #0284c7;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Valor Justo Total (Outorga)</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.valorJustoTotalCompromissadoBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #10b981;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Reserva de Opções no PL</div>
            <div style="font-size: 15px; font-weight: bold; color: #047857; margin-top: 4px;">${formatBRL(resumo.saldoReservaOpcoesPL_BRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Despesa Reconhecida Exercício</div>
            <div style="font-size: 15px; font-weight: bold; color: #b45309; margin-top: 4px;">${formatBRL(resumo.despesaReconhecidaExercicioBRL)}</div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #334155; margin-bottom: 8px;">Planos Outorgados e Apropriação Linear de Vesting</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #e2e8f0; color: #334155; text-align: left;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Plano / Beneficiário</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Tipo / Modalidade</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Outorga</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Qtd Opções</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Strike (R$)</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Valor Justo (Unit)</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Despesa Acumulada</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Vesting</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.concessoes
              .map(
                c => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${c.numeroPlanoEdital}<br/><span style="font-size: 9px; font-weight: normal; color: #64748b;">${c.nomeBeneficiario} (${c.cargoBeneficiario})</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${c.tipoPlano === 'STOCK_OPTIONS_EQUITY' ? 'Ações (PL)' : c.tipoPlano === 'PHANTOM_SHARES_CASH' ? 'Phantom (Caixa)' : 'Restricted (RSU)'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${c.dataOutorgaGrantDate}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${c.quantidadeOpcoesOutorgadas.toLocaleString('pt-BR')}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(c.precoExercicioStrikeBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(c.valorJustoUnitarioBlackScholesBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #047857;">${formatBRL(c.despesaApropriadaAcumuladaBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: #dcfce7; color: #166534;">${c.mesesDecorridos}/${c.prazoVestingMeses} meses</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="font-size: 11px; line-height: 1.5; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <p><strong>Racional Técnico e Tese STJ (Tema Repetitivo 1.226):</strong></p>
          <p>1. <strong>Natureza Mercantil:</strong> A 1ª Seção do STJ pacificou em recurso repetitivo que os Planos de Opção de Compra de Ações (Stock Options) possuem caráter estritamente mercantil e contratual, não configurando remuneração salarial.</p>
          <p>2. <strong>Incidência Tributária:</strong> Não há incidência de contribuição previdenciária patronal ou retenção de IRRF no momento da outorga ou exercício. O IRPF é devido exclusivamente como Ganho de Capital quando o beneficiário alienar as ações em bolsa.</p>
          <p>3. <strong>Contabilização Societária (CPC 10 / IFRS 2):</strong> O valor justo mensurado na Grant Date é reconhecido no resultado do exercício linearmente durante o vesting period em contrapartida à Reserva de Opções Outorgadas no PL.</p>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">Comitê de Pessoas & Remuneração</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">Conselho de Administração / AGE</p>
          </div>
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">Contador Responsável / Auditoria Independente</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">CRC Ativo / NBC TG 10 (R1)</p>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Demonstrativo de Remuneração Baseada em Ações (CPC 10 / IFRS 2)',
        subtitulo: `Empresa: ${empresaAtiva.razaoSocial} | Exercício: ${anoFiltro}`,
        conteudoHtml: html
      });
    }
  };

  // Cálculo de aproximação Black-Scholes para simulação interativa
  const r = bsTaxaSelic / 100;
  const sigma = bsVolatilidade / 100;
  const T = Math.max(0.1, bsPrazoAnos);
  const d1 = (Math.log(bsSpot / bsStrike) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  // Aproximação da Normal Cumulativa N(x)
  const normCDF = (x: number) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.sqrt(2.0);
    const t = 1.0 / (1.0 + p * absX);
    const erf = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return 0.5 * (1.0 + sign * erf);
  };

  const bsCallPrice = Math.max(0, bsSpot * normCDF(d1) - bsStrike * Math.exp(-r * T) * normCDF(d2));

  return (
    <div className="space-y-6">
      {/* Header com identificação e ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1e1e] border border-[#2d2d2d] p-5 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-lg text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              Remuneração Baseada em Ações
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50 font-normal">
                CPC 10 (R1) / IFRS 2 / Tema 1.226 STJ
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Planos de Stock Options e Phantom Shares, precificação Black-Scholes, vesting linear no PL e tese jurídica do STJ
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={anoFiltro}
            onChange={e => setAnoFiltro(Number(e.target.value))}
            className="bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option value={2026}>Exercício 2026</option>
            <option value={2025}>Exercício 2025</option>
            <option value={2024}>Exercício 2024</option>
          </select>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] rounded text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center space-x-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-purple-400 px-3 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Relatório A4</span>
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Outorga (SOP)</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Planos Ativos</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-gray-100">{resumo?.totalPlanosAtivos || 0}</div>
          <div className="text-[11px] text-gray-500 mt-1">Concessões em Vesting</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Opções Outorgadas</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-blue-400 truncate">
            {(resumo?.totalOpcoesOutorgadas || 0).toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Ações Compromissadas</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Valor Justo Outorga</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-400 truncate">
            {formatBRL(resumo?.valorJustoTotalCompromissadoBRL || 0)}
          </div>
          <div className="text-[11px] text-teal-600 mt-1">Black-Scholes Grant Date</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Reserva de Opções no PL</span>
            <Landmark className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 truncate">
            {formatBRL(resumo?.saldoReservaOpcoesPL_BRL || 0)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Patrimônio Líquido Acumulado</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Despesa no Exercício</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 truncate">
            {formatBRL(resumo?.despesaReconhecidaExercicioBRL || 0)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Impacto Anual em DRE</div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-[#2d2d2d] flex space-x-4">
        <button
          onClick={() => setAbaAtiva('planos')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'planos'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Planos & Outorgas ({itensFiltrados.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'simulador'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Calculadora Black-Scholes-Merton</span>
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'legislacao'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Tese STJ (Tema 1.226) & Racional CPC 10</span>
        </button>
      </div>

      {/* ABA 1: PLANOS */}
      {abaAtiva === 'planos' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg text-xs">
            <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por número do plano, beneficiário ou cargo..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Modalidade:</span>
                <select
                  value={filtroTipo}
                  onChange={e => setFiltroTipo(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="TODOS">Todas as Modalidades</option>
                  <option value="STOCK_OPTIONS_EQUITY">Stock Options (Ações/PL)</option>
                  <option value="PHANTOM_SHARES_CASH">Phantom Shares (Caixa)</option>
                  <option value="RESTRICTED_SHARES_RSU">Restricted Shares (RSU)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Status:</span>
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="EM_VESTING">Em Vesting</option>
                  <option value="EXERCIDO_LIQUIDADO">Exercido/Liquidado</option>
                  <option value="CANCELADO_EXPIRADO">Cancelado/Expirado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Concessões */}
          {itensFiltrados.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-12 text-center text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-sm font-medium">Nenhum plano de remuneração em ações encontrado.</p>
              <button
                onClick={handleNovo}
                className="mt-4 inline-flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar primeira outorga</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {itensFiltrados.map(item => (
                <div
                  key={item.id}
                  className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-4 hover:border-[#3d3d3d] transition-all space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-[#2d2d2d] pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-[#262626] border border-[#383838] rounded-md mt-0.5">
                        <Award className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-100 text-sm">{item.numeroPlanoEdital}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300">
                            {item.tipoPlano === 'STOCK_OPTIONS_EQUITY'
                              ? 'Stock Options (PL)'
                              : item.tipoPlano === 'PHANTOM_SHARES_CASH'
                              ? 'Phantom Shares (Caixa)'
                              : 'Restricted Shares (RSU)'}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          <span className="text-gray-200 font-medium">{item.nomeBeneficiario}</span> ({item.cargoBeneficiario}) • Outorga: {item.dataOutorgaGrantDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end lg:self-center">
                      <button
                        onClick={() => handleIntegrar(item.id)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors border ${
                          item.integradoContabil
                            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/30'
                            : 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50'
                        }`}
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{item.integradoContabil ? 'Reintegrar Quota' : 'Integrar Quota Mensal'}</span>
                      </button>

                      <button
                        onClick={() => handleEditar(item)}
                        className="p-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-gray-300 rounded transition-colors"
                        title="Editar outorga"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleExcluir(item.id, item.numeroPlanoEdital)}
                        className="p-1.5 bg-[#262626] hover:bg-red-950/50 border border-[#3d3d3d] text-red-400 rounded transition-colors"
                        title="Excluir outorga"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes Financeiros */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-[#242424] p-3 rounded border border-[#2e2e2e]">
                    <div>
                      <div className="text-gray-500 text-[10px]">Quantidade de Ações</div>
                      <div className="text-gray-100 font-semibold font-mono mt-0.5">
                        {item.quantidadeOpcoesOutorgadas.toLocaleString('pt-BR')}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Preço Strike / Spot</div>
                      <div className="text-gray-300 font-mono mt-0.5">
                        {formatBRL(item.precoExercicioStrikeBRL)} / {formatBRL(item.precoAcaoNaOutorgaSpotBRL)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Fair Value Unitário</div>
                      <div className="text-teal-400 font-bold font-mono mt-0.5">
                        {formatBRL(item.valorJustoUnitarioBlackScholesBRL)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Valor Justo Total</div>
                      <div className="text-purple-300 font-bold font-mono mt-0.5">
                        {formatBRL(item.valorJustoTotalOutorgaBRL)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Progresso Vesting</div>
                      <div className="text-blue-400 font-semibold mt-0.5">
                        {item.mesesDecorridos} de {item.prazoVestingMeses} meses ({Math.round((item.mesesDecorridos / item.prazoVestingMeses) * 100)}%)
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Quota Mensal DRE</div>
                      <div className="text-amber-400 font-bold font-mono mt-0.5">
                        {formatBRL(item.despesaMensalCompetenciaBRL)}/mês
                      </div>
                    </div>
                  </div>

                  {/* Rodapé: Acumulado & Observações */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2 px-1">
                    <div className="flex items-center space-x-4">
                      <span>
                        Despesa Acumulada no PL/Resultado: <strong className="text-emerald-300">{formatBRL(item.despesaApropriadaAcumuladaBRL)}</strong>
                      </span>
                      <span>
                        Saldo Remanescente a Apropriar: <strong className="text-gray-300">{formatBRL(item.saldoApropriarVestingBRL)}</strong>
                      </span>
                    </div>
                    {item.observacoes && (
                      <div className="text-gray-500 italic truncate max-w-xs" title={item.observacoes}>
                        {item.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: CALCULADORA BLACK-SCHOLES */}
      {abaAtiva === 'simulador' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-6">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-purple-400" />
              <span>Modelo Black-Scholes-Merton para Precificação de Opções de Ações (Grant Date)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Avaliação atuarial do valor justo de opções de compra de ações européias conforme exigido pelo item 10 do CPC 10 (R1) e IFRS 2.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Variáveis do Modelo</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Preço da Ação na Outorga - Spot (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bsSpot}
                    onChange={e => setBsSpot(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Preço de Exercício - Strike (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bsStrike}
                    onChange={e => setBsStrike(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Prazo (anos)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={bsPrazoAnos}
                    onChange={e => setBsPrazoAnos(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Taxa Selic (% a.a.)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={bsTaxaSelic}
                    onChange={e => setBsTaxaSelic(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Volatilidade (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={bsVolatilidade}
                    onChange={e => setBsVolatilidade(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="bg-purple-950/30 border border-purple-800/40 p-3 rounded text-[11px] text-purple-300 leading-relaxed">
                <strong>Parâmetros Normativos:</strong> O CPC 10 determina que o valor justo é fixado na Data da Outorga e não é reavaliado posteriormente para opções liquidadas em ações, permanecendo imutável até a expiração ou exercício.
              </div>
            </div>

            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Resultados da Precificação</span>
              </h4>

              <div className="bg-[#1c1c1c] p-4 rounded border border-purple-900/40">
                <div className="text-xs text-purple-400 font-semibold">Valor Justo Unitário da Opção (Call Black-Scholes)</div>
                <div className="text-2xl font-bold text-gray-100 mt-1">{formatBRL(bsCallPrice)} / ação</div>
                <div className="text-xs text-gray-400 mt-1">
                  d1 = {d1.toFixed(4)} • d2 = {d2.toFixed(4)} • N(d1) [Delta] = {normCDF(d1).toFixed(4)}
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-[#333333] pt-3">
                <div className="flex justify-between text-gray-300">
                  <span>Simulação para Lote de 100.000 Ações:</span>
                  <span className="font-semibold text-purple-400">{formatBRL(bsCallPrice * 100000)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Quota de Despesa Mensal (36 meses):</span>
                  <span className="font-semibold text-emerald-400">{formatBRL((bsCallPrice * 100000) / 36)}/mês</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Economia Previdenciária Estimada (Tema 1.226):</span>
                  <span className="font-semibold text-teal-400">{formatBRL((bsCallPrice * 100000) * 0.288)} (CPP + RAT + Terceiros)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: LEGISLAÇÃO & TEMA 1.226 STJ */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-5">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Diretrizes Societárias, Contábeis e Jurisprudência Vinculante do STJ</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Julgamento histórico do Tema Repetitivo 1.226 do Superior Tribunal de Justiça e harmonização com o CPC 10 (R1).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-purple-400 font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>1. Tema Repetitivo 1.226 do STJ</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                A 1ª Seção do STJ firmou a tese de que os planos de Stock Option oferecidos a executivos e empregados possuem <strong>natureza mercantil</strong> e não salarial, desde que haja onerosidade (pagamento do preço de exercício) e risco de mercado.
              </p>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-teal-400 font-semibold flex items-center space-x-1.5">
                <Landmark className="w-4 h-4" />
                <span>2. Não Incidência Previdenciária</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Diante da natureza comercial, não há incidência de contribuições previdenciárias patronais (CPP de 20%, RAT e Sistema S) nem recolhimento de FGTS na concessão ou no momento do exercício das opções.
              </p>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>3. Contabilização CPC 10 / IFRS 2</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                D - Despesa de Remuneração com Opções de Ações (Resultado)<br />
                C - Opções de Ações Outorgadas (Patrimônio Líquido - Reserva de Capital)<br />
                O lançamento é mensal e linear durante o período de carência (vesting period).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg max-w-3xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-3">
              <h3 className="text-base font-bold text-gray-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>{itemEdicao ? 'Editar Concessão de Opções' : 'Nova Concessão de Stock Options'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Número do Plano / Edital *</label>
                  <input
                    type="text"
                    required
                    value={numeroPlanoEdital}
                    onChange={e => setNumeroPlanoEdital(e.target.value)}
                    placeholder="Ex: SOP-2024/001"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Beneficiário *</label>
                  <input
                    type="text"
                    required
                    value={nomeBeneficiario}
                    onChange={e => setNomeBeneficiario(e.target.value)}
                    placeholder="Ex: Carlos Eduardo de Souza"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Cargo / Função *</label>
                  <input
                    type="text"
                    required
                    value={cargoBeneficiario}
                    onChange={e => setCargoBeneficiario(e.target.value)}
                    placeholder="Ex: Diretor de Tecnologia (CTO)"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Modalidade *</label>
                  <select
                    value={tipoPlano}
                    onChange={e => setTipoPlano(e.target.value as TipoPlanoAcoes)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="STOCK_OPTIONS_EQUITY">Stock Options (Ações/PL)</option>
                    <option value="PHANTOM_SHARES_CASH">Phantom Shares (Caixa/Passivo)</option>
                    <option value="RESTRICTED_SHARES_RSU">Restricted Shares (RSU)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Data Outorga (Grant Date) *</label>
                  <input
                    type="date"
                    required
                    value={dataOutorgaGrantDate}
                    onChange={e => setDataOutorgaGrantDate(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Status *</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StatusPlanoAcoes)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="EM_VESTING">Em Vesting</option>
                    <option value="EXERCIDO_LIQUIDADO">Exercido / Liquidado</option>
                    <option value="CANCELADO_EXPIRADO">Cancelado / Expirado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Prazo Vesting (meses) *</label>
                  <input
                    type="number"
                    required
                    value={prazoVestingMeses}
                    onChange={e => setPrazoVestingMeses(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Meses Decorridos *</label>
                  <input
                    type="number"
                    required
                    value={mesesDecorridos}
                    onChange={e => setMesesDecorridos(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Qtd Opções Outorgadas *</label>
                  <input
                    type="number"
                    required
                    value={quantidadeOpcoesOutorgadas}
                    onChange={e => setQuantidadeOpcoesOutorgadas(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Preço Strike (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={precoExercicioStrikeBRL}
                    onChange={e => setPrecoExercicioStrikeBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Preço Spot Outorga (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precoAcaoNaOutorgaSpotBRL}
                    onChange={e => setPrecoAcaoNaOutorgaSpotBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Taxa Selic (% a.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={taxaLivreRiscoSelicPercentual}
                    onChange={e => setTaxaLivreRiscoSelicPercentual(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Volatilidade (% a.a.)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={volatilidadeEsperadaPercentual}
                    onChange={e => setVolatilidadeEsperadaPercentual(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Fair Value Black-Scholes *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorJustoUnitarioBlackScholesBRL}
                    onChange={e => setValorJustoUnitarioBlackScholesBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Observações Técnicas / Condições de Performance</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Metas de EBITDA, lock-up de 12 meses após exercício, cláusula de bad leaver / good leaver..."
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#2d2d2d]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-gray-300 rounded text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                >
                  Salvar Outorga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
