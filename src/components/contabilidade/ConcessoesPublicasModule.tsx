import React, { useState, useEffect } from 'react';
import {
  Layers,
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
  Globe2,
  HelpCircle,
  Sparkles,
  Building,
  Clock,
  Landmark,
  Compass,
  Briefcase,
  Zap,
  Droplets,
  Truck
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ContratoConcessaoPublica,
  ResumoConcessoesPublicas,
  ModeloConcessao,
  StatusContratoConcessao,
  SetorConcessao
} from '../../types/contabil';

interface ConcessoesPublicasModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const ConcessoesPublicasModule: React.FC<ConcessoesPublicasModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoConcessoesPublicas | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'contratos' | 'simulador' | 'legislacao'>('contratos');
  const [busca, setBusca] = useState('');
  const [filtroModelo, setFiltroModelo] = useState<string>('TODOS');
  const [filtroSetor, setFiltroSetor] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ContratoConcessaoPublica | null>(null);

  // Formulário State
  const [numeroContratoEdital, setNumeroContratoEdital] = useState('');
  const [poderConcedente, setPoderConcedente] = useState('ANTT - Agência Nacional de Transportes Terrestres');
  const [objetoConcessao, setObjetoConcessao] = useState('');
  const [setor, setSetor] = useState<SetorConcessao>('RODOVIAS_PEDAGIO');
  const [modelo, setModelo] = useState<ModeloConcessao>('BIFURCADO_HIBRIDO');
  const [dataAssinatura, setDataAssinatura] = useState('2024-03-15');
  const [dataInicioOperacao, setDataInicioOperacao] = useState('2025-01-01');
  const [prazoAnos, setPrazoAnos] = useState(30);
  const [dataTerminoConcessao, setDataTerminoConcessao] = useState('2054-03-15');
  const [taxaInternaRetornoTIR, setTaxaInternaRetornoTIR] = useState(9.45);
  const [investimentoTotalCapexEstimadoBRL, setInvestimentoTotalCapexEstimadoBRL] = useState(150000000);
  const [custoConstrucaoIncorridoAcumuladoBRL, setCustoConstrucaoIncorridoAcumuladoBRL] = useState(45000000);
  const [margemLucroConstrucaoPercentual, setMargemLucroConstrucaoPercentual] = useState(10);
  const [saldoAtivoFinanceiroConcessaoBRL, setSaldoAtivoFinanceiroConcessaoBRL] = useState(19800000);
  const [saldoAtivoIntangivelConcessaoBRL, setSaldoAtivoIntangivelConcessaoBRL] = useState(29700000);
  const [receitaOperacaoTarifariaPeriodoBRL, setReceitaOperacaoTarifariaPeriodoBRL] = useState(18500000);
  const [status, setStatus] = useState<StatusContratoConcessao>('FASE_OPERACAO');
  const [observacoes, setObservacoes] = useState('');

  // Simulador ICPC 01 / TIR
  const [simCapexTotal, setSimCapexTotal] = useState(100000000);
  const [simPercGarantiaPublica, setSimPercGarantiaPublica] = useState(40); // 40% Financeiro / 60% Intangível
  const [simMargemConstrucao, setSimMargemConstrucao] = useState(10);
  const [simTIR, setSimTIR] = useState(9.5);
  const [simPrazo, setSimPrazo] = useState(30);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getConcessoesPublicas(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setNumeroContratoEdital(`CONC-${Math.floor(100 + Math.random() * 900)}/${anoFiltro}`);
    setPoderConcedente('ANTT - Agência Nacional de Transportes Terrestres');
    setObjetoConcessao('Concessão Rodoviária de Trecho Rodoviário - Duplicação e Manutenção');
    setSetor('RODOVIAS_PEDAGIO');
    setModelo('BIFURCADO_HIBRIDO');
    setDataAssinatura(new Date().toISOString().split('T')[0]);
    setDataInicioOperacao(new Date().toISOString().split('T')[0]);
    setPrazoAnos(30);
    const dateTerm = new Date();
    dateTerm.setFullYear(dateTerm.getFullYear() + 30);
    setDataTerminoConcessao(dateTerm.toISOString().split('T')[0]);
    setTaxaInternaRetornoTIR(9.45);
    setInvestimentoTotalCapexEstimadoBRL(120000000);
    setCustoConstrucaoIncorridoAcumuladoBRL(35000000);
    setMargemLucroConstrucaoPercentual(10);
    setSaldoAtivoFinanceiroConcessaoBRL(15400000);
    setSaldoAtivoIntangivelConcessaoBRL(23100000);
    setReceitaOperacaoTarifariaPeriodoBRL(12000000);
    setStatus('FASE_CONSTRUCAO');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: ContratoConcessaoPublica) => {
    setItemEdicao(item);
    setNumeroContratoEdital(item.numeroContratoEdital);
    setPoderConcedente(item.poderConcedente);
    setObjetoConcessao(item.objetoConcessao);
    setSetor(item.setor);
    setModelo(item.modelo);
    setDataAssinatura(item.dataAssinatura);
    setDataInicioOperacao(item.dataInicioOperacao);
    setPrazoAnos(item.prazoAnos);
    setDataTerminoConcessao(item.dataTerminoConcessao);
    setTaxaInternaRetornoTIR(item.taxaInternaRetornoTIR);
    setInvestimentoTotalCapexEstimadoBRL(item.investimentoTotalCapexEstimadoBRL);
    setCustoConstrucaoIncorridoAcumuladoBRL(item.custoConstrucaoIncorridoAcumuladoBRL);
    setMargemLucroConstrucaoPercentual(item.margemLucroConstrucaoPercentual);
    setSaldoAtivoFinanceiroConcessaoBRL(item.saldoAtivoFinanceiroConcessaoBRL);
    setSaldoAtivoIntangivelConcessaoBRL(item.saldoAtivoIntangivelConcessaoBRL);
    setReceitaOperacaoTarifariaPeriodoBRL(item.receitaOperacaoTarifariaPeriodoBRL);
    setStatus(item.status);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const receitaConstrucao = Math.round(
      custoConstrucaoIncorridoAcumuladoBRL * (1 + margemLucroConstrucaoPercentual / 100) * 100
    ) / 100;

    const item: ContratoConcessaoPublica = {
      id: itemEdicao ? itemEdicao.id : `conc-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroContratoEdital,
      poderConcedente,
      objetoConcessao,
      setor,
      modelo,
      dataAssinatura,
      dataInicioOperacao,
      prazoAnos,
      dataTerminoConcessao,
      taxaInternaRetornoTIR,
      investimentoTotalCapexEstimadoBRL,
      custoConstrucaoIncorridoAcumuladoBRL,
      margemLucroConstrucaoPercentual,
      receitaConstrucaoReconhecidaBRL: receitaConstrucao,
      saldoAtivoFinanceiroConcessaoBRL,
      saldoAtivoIntangivelConcessaoBRL,
      receitaOperacaoTarifariaPeriodoBRL,
      status,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes.trim() ? observacoes.trim() : undefined
    };

    const res = dbService.salvarContratoConcessao(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    } else {
      alert(res.mensagem);
    }
  };

  const handleExcluir = (id: string, numero: string) => {
    if (confirm(`Tem certeza que deseja remover o contrato de concessão "${numero}"?`)) {
      dbService.excluirContratoConcessao(id);
      carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarReceitaConcessaoContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatPercent = (val: number) => {
    return `${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  // Filtragem da lista
  const contratosFiltrados = (resumo?.contratos || []).filter(item => {
    const matchBusca =
      item.numeroContratoEdital.toLowerCase().includes(busca.toLowerCase()) ||
      item.poderConcedente.toLowerCase().includes(busca.toLowerCase()) ||
      item.objetoConcessao.toLowerCase().includes(busca.toLowerCase());
    const matchModelo = filtroModelo === 'TODOS' || item.modelo === filtroModelo;
    const matchSetor = filtroSetor === 'TODOS' || item.setor === filtroSetor;
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
    return matchBusca && matchModelo && matchSetor && matchStatus;
  });

  const handleImprimirRelatorio = () => {
    if (!resumo || !empresaAtiva) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 20px;">
        <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #0369a1;">DEMONSTRATIVO DE CONTRATOS DE CONCESSÃO DE SERVIÇOS PÚBLICOS</h1>
          <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">ICPC 01 (R1) / IFRIC 12 / NBC TG 01 / CPC 47 - Exercício Fiscal ${anoFiltro}</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Empresa:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Exercício:</strong> ${anoFiltro}</div>
            <div><strong>Total Contratos Ativos:</strong> ${resumo.totalContratosAtivos}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #0284c7;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Capex Total Estimado</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.totalCapexCompromissadoBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #0d9488;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Ativo Financeiro (ICPC 01)</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.saldoConsolidadoAtivoFinanceiroBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #6366f1;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Ativo Intangível (ICPC 01)</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.saldoConsolidadoAtivoIntangivelBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #16a34a;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Receita Operacional Tarifária</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.totalReceitaOperacaoTarifariaBRL)}</div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #334155; margin-bottom: 8px;">Contratos e Concessões em Execução</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #e2e8f0; color: #334155; text-align: left;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Contrato / Edital</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Poder Concedente</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Setor / Modelo</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Capex (BRL)</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Ativo Financeiro</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Ativo Intangível</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">TIR</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.contratos
              .map(
                c => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${c.numeroContratoEdital}<br/><span style="font-size: 9px; font-weight: normal; color: #64748b;">${c.objetoConcessao}</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${c.poderConcedente}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${c.setor.replace(/_/g, ' ')}<br/><span style="font-size: 9px; color: #0284c7;">${c.modelo.replace(/_/g, ' ')}</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(c.investimentoTotalCapexEstimadoBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(c.saldoAtivoFinanceiroConcessaoBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(c.saldoAtivoIntangivelConcessaoBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatPercent(c.taxaInternaRetornoTIR)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: ${
                    c.status === 'FASE_OPERACAO' ? '#dcfce7; color: #166534;' : '#fef9c3; color: #854d0e;'
                  }">${c.status.replace(/_/g, ' ')}</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="font-size: 11px; line-height: 1.5; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <p><strong>Fundamentação e Racional Contábil (ICPC 01 (R1) / IFRIC 12):</strong></p>
          <p>1. A infraestrutura concedida não é reconhecida como Ativo Imobilizado da concessionária, visto que o controle final sobre a utilidade pública do bem permanece com o Poder Concedente ao término do prazo.</p>
          <p>2. A remuneração pelos serviços de construção/melhorias é reconhecida pelo método de percentual de conclusão (PoC) nos moldes do CPC 47.</p>
          <p>3. Os ativos financeiros são remunerados à Taxa Interna de Retorno (TIR) do contrato como receita financeira. Os ativos intangíveis sofrem amortização sistemática com base no tráfego ou tempo de vigência.</p>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">${empresaAtiva.razaoSocial}</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">Concessionária de Serviço Público</p>
          </div>
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">Contador Responsável / Auditoria Independente</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">CRC Ativo / NBC TG 01 / ICPC 01</p>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Demonstrativo ICPC 01 (R1) - Contratos de Concessão de Serviços Públicos',
        subtitulo: `Empresa: ${empresaAtiva.razaoSocial} | Exercício: ${anoFiltro}`,
        conteudoHtml: html
      });
    }
  };

  // Cálculos do simulador ICPC 01
  const simAtivoFinanceiro = (simCapexTotal * (simPercGarantiaPublica / 100));
  const simAtivoIntangivel = (simCapexTotal * ((100 - simPercGarantiaPublica) / 100));
  const simReceitaConstrucaoTotal = simCapexTotal * (1 + simMargemConstrucao / 100);
  const simLucroConstrucao = simReceitaConstrucaoTotal - simCapexTotal;
  const simReceitaFinanceiraAno1 = simAtivoFinanceiro * (simTIR / 100);
  const simAmortizacaoIntangivelAno = simAtivoIntangivel / Math.max(1, simPrazo);

  return (
    <div className="space-y-6">
      {/* Header com identificação e ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1e1e] border border-[#2d2d2d] p-5 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-sky-950/40 border border-sky-800/50 rounded-lg text-sky-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              Contratos de Concessão de Serviços Públicos
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-900/50 text-sky-300 border border-sky-700/50 font-normal">
                ICPC 01 (R1) / IFRIC 12
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Bifurcação Ativo Financeiro vs Ativo Intangível, Receita de Construção (CPC 47 / PoC) e Remuneração pela TIR
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={anoFiltro}
            onChange={e => setAnoFiltro(Number(e.target.value))}
            className="bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-sky-500"
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
            className="flex items-center space-x-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-sky-400 px-3 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Relatório A4</span>
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Contratos Ativos</span>
            <Building className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-gray-100">{resumo?.totalContratosAtivos || 0}</div>
          <div className="text-[11px] text-gray-500 mt-1">Concessões & Parcerias</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Capex Compromissado</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-blue-400 truncate">
            {formatBRL(resumo?.totalCapexCompromissadoBRL || 0)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Investimento Total Previsto</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Ativo Financeiro (ICPC 01)</span>
            <Landmark className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-400 truncate">
            {formatBRL(resumo?.saldoConsolidadoAtivoFinanceiroBRL || 0)}
          </div>
          <div className="text-[11px] text-teal-600 mt-1">Garantia Poder Concedente</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Ativo Intangível (ICPC 01)</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-400 truncate">
            {formatBRL(resumo?.saldoConsolidadoAtivoIntangivelBRL || 0)}
          </div>
          <div className="text-[11px] text-purple-500 mt-1">Direito Cobrança Usuário</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Receita Tarifária</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 truncate">
            {formatBRL(resumo?.totalReceitaOperacaoTarifariaBRL || 0)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Faturamento Operacional</div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-[#2d2d2d] flex space-x-4">
        <button
          onClick={() => setAbaAtiva('contratos')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'contratos'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Contratos de Concessão ({contratosFiltrados.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'simulador'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador ICPC 01 / Bifurcação & TIR</span>
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'legislacao'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Guia Contábil & IFRIC 12</span>
        </button>
      </div>

      {/* ABA 1: CONTRATOS */}
      {abaAtiva === 'contratos' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg text-xs">
            <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por número do contrato, poder concedente ou objeto..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Modelo:</span>
                <select
                  value={filtroModelo}
                  onChange={e => setFiltroModelo(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="TODOS">Todos os Modelos</option>
                  <option value="ATIVO_FINANCEIRO">Ativo Financeiro</option>
                  <option value="ATIVO_INTANGIVEL">Ativo Intangível</option>
                  <option value="BIFURCADO_HIBRIDO">Bifurcado (Híbrido)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Setor:</span>
                <select
                  value={filtroSetor}
                  onChange={e => setFiltroSetor(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="TODOS">Todos os Setores</option>
                  <option value="RODOVIAS_PEDAGIO">Rodovias</option>
                  <option value="SANEAMENTO_BASICO">Saneamento</option>
                  <option value="DISTRIBUICAO_ENERGIA">Energia</option>
                  <option value="ILUMINACAO_PUBLICA">Iluminação</option>
                  <option value="PORTOS_AEROPORTOS">Portos/Aeroportos</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Status:</span>
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="FASE_CONSTRUCAO">Fase Construção</option>
                  <option value="FASE_OPERACAO">Fase Operação</option>
                  <option value="ENCERRADO">Encerrado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid / Tabela de Contratos */}
          {contratosFiltrados.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-12 text-center text-gray-500">
              <Layers className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-sm font-medium">Nenhum contrato de concessão encontrado para os filtros aplicados.</p>
              <button
                onClick={handleNovo}
                className="mt-4 inline-flex items-center space-x-1.5 text-xs text-sky-400 hover:text-sky-300"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar primeiro contrato</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {contratosFiltrados.map(item => {
                const getSetorIcon = (s: SetorConcessao) => {
                  switch (s) {
                    case 'RODOVIAS_PEDAGIO':
                      return <Truck className="w-4 h-4 text-amber-400" />;
                    case 'SANEAMENTO_BASICO':
                      return <Droplets className="w-4 h-4 text-cyan-400" />;
                    case 'DISTRIBUICAO_ENERGIA':
                    case 'ILUMINACAO_PUBLICA':
                      return <Zap className="w-4 h-4 text-yellow-400" />;
                    default:
                      return <Building className="w-4 h-4 text-sky-400" />;
                  }
                };

                return (
                  <div
                    key={item.id}
                    className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-4 hover:border-[#3d3d3d] transition-all space-y-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-[#2d2d2d] pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-[#262626] border border-[#383838] rounded-md mt-0.5">
                          {getSetorIcon(item.setor)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-100 text-sm">{item.numeroContratoEdital}</span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                item.status === 'FASE_OPERACAO'
                                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                                  : item.status === 'FASE_CONSTRUCAO'
                                  ? 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                                  : 'bg-gray-800 border-gray-700 text-gray-400'
                              }`}
                            >
                              {item.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-300">
                              {item.modelo.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            <span className="text-gray-300 font-medium">{item.poderConcedente}</span> • {item.objetoConcessao}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end lg:self-center">
                        <button
                          onClick={() => handleIntegrar(item.id)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors border ${
                            item.integradoContabil
                              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/30'
                              : 'bg-sky-950/40 border-sky-800/60 text-sky-300 hover:bg-sky-900/50'
                          }`}
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{item.integradoContabil ? 'Reintegrar Lote' : 'Integrar Lote Contábil'}</span>
                        </button>

                        <button
                          onClick={() => handleEditar(item)}
                          className="p-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-gray-300 rounded transition-colors"
                          title="Editar contrato"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleExcluir(item.id, item.numeroContratoEdital)}
                          className="p-1.5 bg-[#262626] hover:bg-red-950/50 border border-[#3d3d3d] text-red-400 rounded transition-colors"
                          title="Excluir contrato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Detalhamento financeiro em colunas */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-[#242424] p-3 rounded border border-[#2e2e2e]">
                      <div>
                        <div className="text-gray-500 text-[10px]">Vigência & Prazo</div>
                        <div className="text-gray-200 font-mono mt-0.5">
                          {item.prazoAnos} anos ({item.dataAssinatura.substring(0, 4)} - {item.dataTerminoConcessao.substring(0, 4)})
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-[10px]">TIR do Projeto</div>
                        <div className="text-sky-400 font-semibold font-mono mt-0.5">
                          {formatPercent(item.taxaInternaRetornoTIR)} a.a.
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-[10px]">Capex Total Previsto</div>
                        <div className="text-gray-200 font-semibold font-mono mt-0.5">
                          {formatBRL(item.investimentoTotalCapexEstimadoBRL)}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-[10px]">Ativo Financeiro (ICPC 01)</div>
                        <div className="text-teal-400 font-bold font-mono mt-0.5">
                          {formatBRL(item.saldoAtivoFinanceiroConcessaoBRL)}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-[10px]">Ativo Intangível (ICPC 01)</div>
                        <div className="text-purple-400 font-bold font-mono mt-0.5">
                          {formatBRL(item.saldoAtivoIntangivelConcessaoBRL)}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-[10px]">Receita Tarifária</div>
                        <div className="text-emerald-400 font-bold font-mono mt-0.5">
                          {formatBRL(item.receitaOperacaoTarifariaPeriodoBRL)}
                        </div>
                      </div>
                    </div>

                    {/* Rodapé do card: Receita de Construção PoC & Observações */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2 px-1">
                      <div className="flex items-center space-x-4">
                        <span>
                          Construção Incorrida: <strong className="text-gray-200">{formatBRL(item.custoConstrucaoIncorridoAcumuladoBRL)}</strong>
                        </span>
                        <span>
                          Margem CPC 47: <strong className="text-sky-300">{formatPercent(item.margemLucroConstrucaoPercentual)}</strong>
                        </span>
                        <span>
                          Receita Reconhecida: <strong className="text-teal-300">{formatBRL(item.receitaConstrucaoReconhecidaBRL)}</strong>
                        </span>
                      </div>
                      {item.observacoes && (
                        <div className="text-gray-500 italic truncate max-w-xs" title={item.observacoes}>
                          {item.observacoes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: SIMULADOR ICPC 01 & TIR */}
      {abaAtiva === 'simulador' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-6">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-sky-400" />
              <span>Simulador de Desdobramento Contábil (Bifurcação ICPC 01 / IFRIC 12)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Calcule a segregação entre o Ativo Financeiro (garantia pública de remuneração) e o Ativo Intangível (risco de demanda e tráfego tarifário), com apuração da Receita de Construção CPC 47.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parâmetros de Entrada */}
            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Parâmetros do Contrato</span>
              </h4>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Capex Total de Construção / Obras (BRL)</label>
                <input
                  type="number"
                  value={simCapexTotal}
                  onChange={e => setSimCapexTotal(Number(e.target.value))}
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Garantia Pública incondicional (Ativo Financeiro): {simPercGarantiaPublica}%</span>
                  <span>Risco Tarifário Usuário (Ativo Intangível): {100 - simPercGarantiaPublica}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={simPercGarantiaPublica}
                  onChange={e => setSimPercGarantiaPublica(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Margem Lucro Obras (%)</label>
                  <input
                    type="number"
                    value={simMargemConstrucao}
                    onChange={e => setSimMargemConstrucao(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">TIR Contratual (% a.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simTIR}
                    onChange={e => setSimTIR(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Prazo Concessão (anos)</label>
                  <input
                    type="number"
                    value={simPrazo}
                    onChange={e => setSimPrazo(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Resultados Simulados */}
            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Desdobramento Patrimonial e de Resultado</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1c1c1c] p-3 rounded border border-teal-900/40">
                  <div className="text-[11px] text-teal-400 font-medium">Ativo Financeiro (ICPC 01)</div>
                  <div className="text-base font-bold text-gray-100 mt-1">{formatBRL(simAtivoFinanceiro)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Direito incondicional de recebimento</div>
                </div>

                <div className="bg-[#1c1c1c] p-3 rounded border border-purple-900/40">
                  <div className="text-[11px] text-purple-400 font-medium">Ativo Intangível (ICPC 01)</div>
                  <div className="text-base font-bold text-gray-100 mt-1">{formatBRL(simAtivoIntangivel)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Direito de cobrança de tarifas</div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-[#333333] pt-3">
                <div className="flex justify-between text-gray-300">
                  <span>Receita de Construção Total (CPC 47):</span>
                  <span className="font-semibold text-sky-400">{formatBRL(simReceitaConstrucaoTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Margem Bruta de Construção (Lucro):</span>
                  <span className="font-semibold text-emerald-400">{formatBRL(simLucroConstrucao)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Receita Financeira Anual Estimada (TIR):</span>
                  <span className="font-semibold text-teal-400">{formatBRL(simReceitaFinanceiraAno1)}/ano</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Amortização Linear do Intangível:</span>
                  <span className="font-semibold text-amber-400">{formatBRL(simAmortizacaoIntangivelAno)}/ano</span>
                </div>
              </div>

              <div className="bg-sky-950/30 border border-sky-800/40 p-3 rounded text-[11px] text-sky-300 leading-relaxed">
                <strong>Recomendação Técnica:</strong> Quando a garantia pública cobrir parte substancial do fluxo, classifique como modelo bifurcado híbrido. A receita de construção deve ser tributada pelo PIS/COFINS e IRPJ/CSLL conforme a competência da execução física das obras.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: GUIA CONTÁBIL & LEGISLAÇÃO */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-5">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Fundamentação e Racional Normativo do ICPC 01 (R1) / IFRIC 12</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Diretrizes contábeis aplicáveis a concessionárias e prestadoras de serviços públicos (Leis 8.987/95 e 11.079/04).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 font-semibold">
                <Landmark className="w-4 h-4" />
                <span>1. Modelo do Ativo Financeiro</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Aplicável quando a concessionária tem o direito incondicional de receber quantia específica em dinheiro do Poder Concedente, independentemente do volume de utilização da infraestrutura.
              </p>
              <ul className="list-disc list-inside text-gray-400 text-[10px] space-y-1">
                <li>PPPs Administrativas ou Patrocinadas com garantia mínima de receita;</li>
                <li>Ativo monetário remunerado pela Taxa Interna de Retorno (TIR);</li>
                <li>Sem risco de demanda para a concessionária.</li>
              </ul>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-purple-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>2. Modelo do Ativo Intangível</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Aplicável quando a remuneração depende diretamente do uso da infraestrutura pelos usuários (direito de cobrar pedágios, passagens ou tarifas).
              </p>
              <ul className="list-disc list-inside text-gray-400 text-[10px] space-y-1">
                <li>Concessões comuns de rodovias, ferrovias e aeroportos;</li>
                <li>Risco integral de demanda suportado pela concessionária;</li>
                <li>Amortizado ao longo do prazo da concessão ou pelo volume de tráfego.</li>
              </ul>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-sky-400 font-semibold">
                <Layers className="w-4 h-4" />
                <span>3. Modelo Híbrido (Bifurcado)</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Aplicável quando o contrato prevê simultaneamente uma garantia mínima governamental e o direito de cobrança dos usuários sobre a demanda excedente.
              </p>
              <ul className="list-disc list-inside text-gray-400 text-[10px] space-y-1">
                <li>O Capex inicial é rateado entre Ativo Financeiro e Intangível;</li>
                <li>Exige controle analítico segregado no plano de contas;</li>
                <li>Harmonização fiscal com a Lei 12.973/14 (Art. 35 e seguintes).</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-3">
            <h4 className="text-xs font-semibold text-gray-200">Reconhecimento de Receita de Obras e Construção (CPC 47 / PoC)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
              <div className="p-3 bg-[#1b1b1b] rounded border border-[#333333] space-y-1">
                <div className="text-emerald-400 font-semibold">Lançamento de Obras em Andamento:</div>
                <div className="font-mono text-[11px] text-gray-400">
                  D - Ativo Financeiro/Intangível da Concessão (Ativo)<br />
                  C - Receita de Construção de Infraestrutura (Resultado)
                </div>
              </div>
              <div className="p-3 bg-[#1b1b1b] rounded border border-[#333333] space-y-1">
                <div className="text-sky-400 font-semibold">Lançamento de Custos Incorridos:</div>
                <div className="font-mono text-[11px] text-gray-400">
                  D - Custo dos Serviços de Construção (Resultado)<br />
                  C - Caixa / Fornecedores / Folha a Pagar (Passivo/Ativo)
                </div>
              </div>
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
                <Layers className="w-5 h-5 text-sky-400" />
                <span>{itemEdicao ? 'Editar Contrato de Concessão' : 'Novo Contrato de Concessão Pública'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Número do Contrato / Edital *</label>
                  <input
                    type="text"
                    required
                    value={numeroContratoEdital}
                    onChange={e => setNumeroContratoEdital(e.target.value)}
                    placeholder="Ex: CONC-ROD-2024/002"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Poder Concedente *</label>
                  <input
                    type="text"
                    required
                    value={poderConcedente}
                    onChange={e => setPoderConcedente(e.target.value)}
                    placeholder="Ex: ANTT / ARTESP / Governo Estadual"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Objeto da Concessão *</label>
                <input
                  type="text"
                  required
                  value={objetoConcessao}
                  onChange={e => setObjetoConcessao(e.target.value)}
                  placeholder="Ex: Concessão Rodoviária de Trecho Rodoviário - Duplicação e Manutenção"
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Setor Concessão *</label>
                  <select
                    value={setor}
                    onChange={e => setSetor(e.target.value as SetorConcessao)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="RODOVIAS_PEDAGIO">Rodovias / Pedágio</option>
                    <option value="SANEAMENTO_BASICO">Saneamento Básico</option>
                    <option value="DISTRIBUICAO_ENERGIA">Distribuição de Energia</option>
                    <option value="ILUMINACAO_PUBLICA">Iluminação Pública</option>
                    <option value="PORTOS_AEROPORTOS">Portos e Aeroportos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Modelo ICPC 01 *</label>
                  <select
                    value={modelo}
                    onChange={e => setModelo(e.target.value as ModeloConcessao)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ATIVO_FINANCEIRO">Ativo Financeiro (Garantia)</option>
                    <option value="ATIVO_INTANGIVEL">Ativo Intangível (Tarifa Usuário)</option>
                    <option value="BIFURCADO_HIBRIDO">Bifurcado / Híbrido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Status Contrato *</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StatusContratoConcessao)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="FASE_CONSTRUCAO">Fase de Construção</option>
                    <option value="FASE_OPERACAO">Fase de Operação</option>
                    <option value="ENCERRADO">Encerrado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Data Assinatura</label>
                  <input
                    type="date"
                    value={dataAssinatura}
                    onChange={e => setDataAssinatura(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Início da Operação</label>
                  <input
                    type="date"
                    value={dataInicioOperacao}
                    onChange={e => setDataInicioOperacao(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Prazo (anos)</label>
                  <input
                    type="number"
                    value={prazoAnos}
                    onChange={e => setPrazoAnos(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">TIR Contratual (% a.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxaInternaRetornoTIR}
                    onChange={e => setTaxaInternaRetornoTIR(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Capex Total Estimado (BRL)</label>
                  <input
                    type="number"
                    value={investimentoTotalCapexEstimadoBRL}
                    onChange={e => setInvestimentoTotalCapexEstimadoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Custo Obras Incorrido (BRL)</label>
                  <input
                    type="number"
                    value={custoConstrucaoIncorridoAcumuladoBRL}
                    onChange={e => setCustoConstrucaoIncorridoAcumuladoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Margem Lucro Obras (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={margemLucroConstrucaoPercentual}
                    onChange={e => setMargemLucroConstrucaoPercentual(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Saldo Ativo Financeiro (BRL)</label>
                  <input
                    type="number"
                    value={saldoAtivoFinanceiroConcessaoBRL}
                    onChange={e => setSaldoAtivoFinanceiroConcessaoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Saldo Ativo Intangível (BRL)</label>
                  <input
                    type="number"
                    value={saldoAtivoIntangivelConcessaoBRL}
                    onChange={e => setSaldoAtivoIntangivelConcessaoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Receita Tarifária Período (BRL)</label>
                  <input
                    type="number"
                    value={receitaOperacaoTarifariaPeriodoBRL}
                    onChange={e => setReceitaOperacaoTarifariaPeriodoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Informações contratuais adicionais, garantias reais, repactuações de reequilíbrio econômico-financeiro..."
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-sky-500"
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
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                >
                  Salvar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
