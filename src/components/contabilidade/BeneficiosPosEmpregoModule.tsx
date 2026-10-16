import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Plus,
  RefreshCw,
  Printer,
  TrendingDown,
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
  Activity,
  Heart
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  AvaliacaoAtuarialPlano,
  ResumoBeneficiosPosEmprego,
  ModalidadePlanoPrevidencia,
  StatusPlanoPrevidencia
} from '../../types/contabil';

interface BeneficiosPosEmpregoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const BeneficiosPosEmpregoModule: React.FC<BeneficiosPosEmpregoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoBeneficiosPosEmprego | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'planos' | 'simulador' | 'legislacao'>('planos');
  const [busca, setBusca] = useState('');
  const [filtroModalidade, setFiltroModalidade] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<AvaliacaoAtuarialPlano | null>(null);

  // Formulário State
  const [codigoPlanoSusepPrevic, setCodigoPlanoSusepPrevic] = useState('');
  const [nomeEntidadeFechadaEFPC, setNomeEntidadeFechadaEFPC] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadePlanoPrevidencia>('BENEFICIO_DEFINIDO_BD');
  const [dataAvaliacaoAtuarial, setDataAvaliacaoAtuarial] = useState('2025-12-31');
  const [atuarioResponsavel, setAtuarioResponsavel] = useState('Atuário Dr. Henrique Villas Boas');
  const [registroIbaAtuario, setRegistroIbaAtuario] = useState('MIBA nº 1.482');
  const [obrigacaoAtuarialTotalVBO_BRL, setObrigacaoAtuarialTotalVBO_BRL] = useState(40000000);
  const [ativosGarantidoresDoPlanoBRL, setAtivosGarantidoresDoPlanoBRL] = useState(36000000);
  const [taxaDescontoAtuarialNominalPercentual, setTaxaDescontoAtuarialNominalPercentual] = useState(9.85);
  const [taxaInflacaoEsperadaIPCA_Percentual, setTaxaInflacaoEsperadaIPCA_Percentual] = useState(4.1);
  const [custoServicoCorrenteExercicioBRL, setCustoServicoCorrenteExercicioBRL] = useState(1200000);
  const [custoServicoPassadoExercicioBRL, setCustoServicoPassadoExercicioBRL] = useState(0);
  const [jurosLiquidosSobrePassivoAtuarialBRL, setJurosLiquidosSobrePassivoAtuarialBRL] = useState(394000);
  const [ganhosOuPerdasAtuariaisRemensuracaoDRA_BRL, setGanhosOuPerdasAtuariaisRemensuracaoDRA_BRL] = useState(-350000);
  const [contribuicaoEfetivaPagaPatrocinadorBRL, setContribuicaoEfetivaPagaPatrocinadorBRL] = useState(1500000);
  const [status, setStatus] = useState<StatusPlanoPrevidencia>('ATIVO_DEFICITARIO');
  const [observacoes, setObservacoes] = useState('');

  // Simulador de Sensibilidade Atuarial (+/- 100 bps)
  const [simVBO, setSimVBO] = useState(45000000);
  const [simAtivos, setSimAtivos] = useState(41800000);
  const [simTaxaDescontoBase, setSimTaxaDescontoBase] = useState(9.85);
  const [simDuracaoPassivoAnos, setSimDuracaoPassivoAnos] = useState(12.5); // Modified Duration

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getBeneficiosPosEmprego(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setCodigoPlanoSusepPrevic(`PREV-PLANO-${anoFiltro}/00${Math.floor(1 + Math.random() * 9)}`);
    setNomeEntidadeFechadaEFPC('Fundação de Previdência Complementar Industrial Multipatrocinada');
    setModalidade('BENEFICIO_DEFINIDO_BD');
    setDataAvaliacaoAtuarial('2025-12-31');
    setAtuarioResponsavel('Atuário Dr. Leonardo Fagundes');
    setRegistroIbaAtuario('MIBA nº 1.632');
    setObrigacaoAtuarialTotalVBO_BRL(35000000);
    setAtivosGarantidoresDoPlanoBRL(32500000);
    setTaxaDescontoAtuarialNominalPercentual(9.85);
    taxaInflacaoEsperadaIPCA_Percentual;
    setCustoServicoCorrenteExercicioBRL(1100000);
    setCustoServicoPassadoExercicioBRL(0);
    setJurosLiquidosSobrePassivoAtuarialBRL(246250);
    setGanhosOuPerdasAtuariaisRemensuracaoDRA_BRL(-280000);
    setContribuicaoEfetivaPagaPatrocinadorBRL(1300000);
    setStatus('ATIVO_DEFICITARIO');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: AvaliacaoAtuarialPlano) => {
    setItemEdicao(item);
    setCodigoPlanoSusepPrevic(item.codigoPlanoSusepPrevic);
    setNomeEntidadeFechadaEFPC(item.nomeEntidadeFechadaEFPC);
    setModalidade(item.modalidade);
    setDataAvaliacaoAtuarial(item.dataAvaliacaoAtuarial);
    setAtuarioResponsavel(item.atuarioResponsavel);
    setRegistroIbaAtuario(item.registroIbaAtuario);
    setObrigacaoAtuarialTotalVBO_BRL(item.obrigacaoAtuarialTotalVBO_BRL);
    setAtivosGarantidoresDoPlanoBRL(item.ativosGarantidoresDoPlanoBRL);
    setTaxaDescontoAtuarialNominalPercentual(item.taxaDescontoAtuarialNominalPercentual);
    setTaxaInflacaoEsperadaIPCA_Percentual(item.taxaInflacaoEsperadaIPCA_Percentual);
    setCustoServicoCorrenteExercicioBRL(item.custoServicoCorrenteExercicioBRL);
    setCustoServicoPassadoExercicioBRL(item.custoServicoPassadoExercicioBRL);
    setJurosLiquidosSobrePassivoAtuarialBRL(item.jurosLiquidosSobrePassivoAtuarialBRL);
    setGanhosOuPerdasAtuariaisRemensuracaoDRA_BRL(item.ganhosOuPerdasAtuariaisRemensuracaoDRA_BRL);
    setContribuicaoEfetivaPagaPatrocinadorBRL(item.contribuicaoEfetivaPagaPatrocinadorBRL);
    setStatus(item.status);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const deficitOuSuperavit = Math.round((ativosGarantidoresDoPlanoBRL - obrigacaoAtuarialTotalVBO_BRL) * 100) / 100;
    const computedStatus: StatusPlanoPrevidencia =
      deficitOuSuperavit > 0 ? 'ATIVO_SUPERAVITARIO' : deficitOuSuperavit < 0 ? 'ATIVO_DEFICITARIO' : 'EM_EQUILIBRIO';

    const item: AvaliacaoAtuarialPlano = {
      id: itemEdicao ? itemEdicao.id : `prev-${Date.now()}`,
      empresaId: empresaAtiva.id,
      codigoPlanoSusepPrevic,
      nomeEntidadeFechadaEFPC,
      modalidade,
      dataAvaliacaoAtuarial,
      atuarioResponsavel,
      registroIbaAtuario,
      obrigacaoAtuarialTotalVBO_BRL,
      ativosGarantidoresDoPlanoBRL,
      superavitOuDeficitAtuarialLiquidoBRL: deficitOuSuperavit,
      taxaDescontoAtuarialNominalPercentual,
      taxaInflacaoEsperadaIPCA_Percentual,
      custoServicoCorrenteExercicioBRL,
      custoServicoPassadoExercicioBRL,
      jurosLiquidosSobrePassivoAtuarialBRL,
      ganhosOuPerdasAtuariaisRemensuracaoDRA_BRL,
      contribuicaoEfetivaPagaPatrocinadorBRL,
      status: computedStatus,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes.trim() ? observacoes.trim() : undefined
    };

    const res = dbService.salvarAvaliacaoAtuarial(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    } else {
      alert(res.mensagem);
    }
  };

  const handleExcluir = (id: string, cod: string) => {
    if (confirm(`Tem certeza que deseja remover o plano atuarial "${cod}"?`)) {
      dbService.excluirAvaliacaoAtuarial(id);
      carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarPassivoAtuarialContabil(id);
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
  const itensFiltrados = (resumo?.planos || []).filter(item => {
    const matchBusca =
      item.codigoPlanoSusepPrevic.toLowerCase().includes(busca.toLowerCase()) ||
      item.nomeEntidadeFechadaEFPC.toLowerCase().includes(busca.toLowerCase()) ||
      item.atuarioResponsavel.toLowerCase().includes(busca.toLowerCase());
    const matchModalidade = filtroModalidade === 'TODOS' || item.modalidade === filtroModalidade;
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
    return matchBusca && matchModalidade && matchStatus;
  });

  const handleImprimirRelatorio = () => {
    if (!resumo || !empresaAtiva) return;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 20px;">
        <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #047857;">DEMONSTRATIVO DE BENEFÍCIOS PÓS-EMPREGO & AVALIAÇÃO ATUARIAL</h1>
          <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">CPC 33 (R1) / IAS 19 / Resolução CNPC nº 32/2019 - Exercício ${anoFiltro}</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Empresa Patrocinadora:</strong> ${empresaAtiva.razaoSocial}</div>
            <div><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</div>
            <div><strong>Exercício:</strong> ${anoFiltro}</div>
            <div><strong>Total de Planos Patrocinados:</strong> ${resumo.totalPlanosPatrocinados}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #059669;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Obrigações Atuariais (VBO)</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.obrigacaoAtuarialConsolidadaBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #0284c7;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Ativos Garantidores</div>
            <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 4px;">${formatBRL(resumo.ativosGarantidoresConsolidadosBRL)}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #ef4444;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Déficit Atuarial Líquido</div>
            <div style="font-size: 15px; font-weight: bold; color: #b91c1c; margin-top: 4px;">${formatBRL(Math.abs(resumo.deficitOuSuperavitLiquidoConsolidadoBRL))}</div>
          </div>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Despesa Previdenciária DRE</div>
            <div style="font-size: 15px; font-weight: bold; color: #b45309; margin-top: 4px;">${formatBRL(resumo.despesaTotalPrevidenciaExercicioBRL)}</div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #334155; margin-bottom: 8px;">Planos de Previdência Fechada e Posição Atuarial Líquida</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #e2e8f0; color: #334155; text-align: left;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Plano / Entidade EFPC</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Atuário / Registro</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Modalidade</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Obrigação (VBO)</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Ativos Garantidores</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Saldo Líquido</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Custo Serviço Corrente</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.planos
              .map(
                p => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${p.codigoPlanoSusepPrevic}<br/><span style="font-size: 9px; font-weight: normal; color: #64748b;">${p.nomeEntidadeFechadaEFPC}</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.atuarioResponsavel}<br/><span style="font-size: 9px; color: #64748b;">${p.registroIbaAtuario}</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.modalidade === 'BENEFICIO_DEFINIDO_BD' ? 'Benefício Definido (BD)' : p.modalidade === 'CONTRIBUICAO_VARIAVEL_CV' ? 'Contribuição Variável (CV)' : 'Contribuição Definida (CD)'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(p.obrigacaoAtuarialTotalVBO_BRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(p.ativosGarantidoresDoPlanoBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: ${p.superavitOuDeficitAtuarialLiquidoBRL < 0 ? '#b91c1c' : '#047857'};">${formatBRL(p.superavitOuDeficitAtuarialLiquidoBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${formatBRL(p.custoServicoCorrenteExercicioBRL)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: ${
                    p.status === 'ATIVO_DEFICITARIO' ? '#fee2e2; color: #991b1b;' : '#dcfce7; color: #166534;'
                  }">${p.status.replace(/_/g, ' ')}</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="font-size: 11px; line-height: 1.5; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <p><strong>Fundamentação Atuarial e Normativa (CPC 33 (R1) / IAS 19):</strong></p>
          <p>1. <strong>Método do Crédito Unitário Projetado (PUCM):</strong> As obrigações atuariais são descontadas a valor presente com base na curva soberana de juros reais de longo prazo (NTN-B).</p>
          <p>2. <strong>Remensurações em Outros Resultados Abrangentes:</strong> Ganhos e perdas atuariais decorrentes de mudanças em premissas financeiras e atuariais são contabilizados diretamente no Patrimônio Líquido (DRA), vedada reclassificação posterior para o Resultado.</p>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">Atuário Responsável Técnico</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">Instituto Brasileiro de Atuária (IBA)</p>
          </div>
          <div style="width: 45%; border-top: 1px solid #334155; padding-top: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">Contador Responsável / Auditoria Independente</p>
            <p style="margin: 0; font-size: 10px; color: #64748b;">CRC Ativo / NBC TG 33 (R1)</p>
          </div>
        </div>
      </div>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: 'Demonstrativo Atuarial de Benefícios Pós-Emprego (CPC 33 / IAS 19)',
        subtitulo: `Empresa: ${empresaAtiva.razaoSocial} | Exercício: ${anoFiltro}`,
        conteudoHtml: html
      });
    }
  };

  // Cálculos do simulador de sensibilidade atuarial
  // Se a taxa de desconto subir 100 bps (+1%), o VBO cai aproximadamente (Duration * 1%)
  const simDeltaVBO_Alta100 = -simVBO * (simDuracaoPassivoAnos * 0.01);
  const simNovoVBO_Alta100 = simVBO + simDeltaVBO_Alta100;
  const simDeficitAlta100 = simAtivos - simNovoVBO_Alta100;

  // Se a taxa de desconto cair 100 bps (-1%), o VBO sobe aproximadamente (Duration * 1%)
  const simDeltaVBO_Queda100 = simVBO * (simDuracaoPassivoAnos * 0.01);
  const simNovoVBO_Queda100 = simVBO + simDeltaVBO_Queda100;
  const simDeficitQueda100 = simAtivos - simNovoVBO_Queda100;

  return (
    <div className="space-y-6">
      {/* Header com identificação e ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1e1e] border border-[#2d2d2d] p-5 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-emerald-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              Planos de Benefícios Pós-Emprego
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 font-normal">
                CPC 33 (R1) / IAS 19 / Res. CNPC 32
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Avaliação atuarial de previdência fechada (EFPC), método PUCM, remensurações em DRA e segregação de passivo líquido
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={anoFiltro}
            onChange={e => setAnoFiltro(Number(e.target.value))}
            className="bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
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
            className="flex items-center space-x-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-emerald-400 px-3 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Relatório A4</span>
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Plano Atuarial</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Planos Patrocinados</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-gray-100">{resumo?.totalPlanosPatrocinados || 0}</div>
          <div className="text-[11px] text-gray-500 mt-1">Fundos de Previdência</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Obrigações Atuariais (VBO)</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 truncate">
            {formatBRL(resumo?.obrigacaoAtuarialConsolidadaBRL || 0)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Passivo Atuarial Total</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Ativos Garantidores</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-blue-400 truncate">
            {formatBRL(resumo?.ativosGarantidoresConsolidadosBRL || 0)}
          </div>
          <div className="text-[11px] text-blue-500 mt-1">Carteira de Investimentos</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Déficit / Superávit Líquido</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-lg font-bold truncate ${
            (resumo?.deficitOuSuperavitLiquidoConsolidadoBRL || 0) < 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {formatBRL(resumo?.deficitOuSuperavitLiquidoConsolidadoBRL || 0)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Posição Patrimonial Líquida</div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Despesa no Exercício</span>
            <TrendingDown className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-400 truncate">
            {formatBRL(resumo?.despesaTotalPrevidenciaExercicioBRL || 0)}
          </div>
          <div className="text-[11px] text-purple-500 mt-1">Impacto DRE (Serviço + Juros)</div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-[#2d2d2d] flex space-x-4">
        <button
          onClick={() => setAbaAtiva('planos')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'planos'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Planos & Avaliações Atuariais ({itensFiltrados.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'simulador'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador de Sensibilidade da Taxa de Desconto</span>
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            abaAtiva === 'legislacao'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Racional Atuarial CPC 33 & CNPC 32</span>
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
                placeholder="Buscar por código do plano, entidade EFPC ou atuário..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Modalidade:</span>
                <select
                  value={filtroModalidade}
                  onChange={e => setFiltroModalidade(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TODOS">Todas as Modalidades</option>
                  <option value="BENEFICIO_DEFINIDO_BD">Benefício Definido (BD)</option>
                  <option value="CONTRIBUICAO_VARIAVEL_CV">Contribuição Variável (CV)</option>
                  <option value="CONTRIBUICAO_DEFINIDA_CD">Contribuição Definida (CD)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-gray-400">Status:</span>
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="bg-[#262626] border border-[#3d3d3d] rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="ATIVO_DEFICITARIO">Déficit Atuarial</option>
                  <option value="ATIVO_SUPERAVITARIO">Superávit Atuarial</option>
                  <option value="EM_EQUILIBRIO">Em Equilíbrio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Planos */}
          {itensFiltrados.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-12 text-center text-gray-500">
              <HeartPulse className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-sm font-medium">Nenhum plano atuarial de previdência complementar encontrado.</p>
              <button
                onClick={handleNovo}
                className="mt-4 inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar primeira avaliação atuarial</span>
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
                        <HeartPulse className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-100 text-sm">{item.codigoPlanoSusepPrevic}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                            {item.modalidade === 'BENEFICIO_DEFINIDO_BD'
                              ? 'Benefício Definido (BD)'
                              : item.modalidade === 'CONTRIBUICAO_VARIAVEL_CV'
                              ? 'Contribuição Variável (CV)'
                              : 'Contribuição Definida (CD)'}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              item.status === 'ATIVO_DEFICITARIO'
                                ? 'bg-rose-950/60 border-rose-800/60 text-rose-400'
                                : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                            }`}
                          >
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          <span className="text-gray-200 font-medium">{item.nomeEntidadeFechadaEFPC}</span> • Atuário: {item.atuarioResponsavel} ({item.registroIbaAtuario})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end lg:self-center">
                      <button
                        onClick={() => handleIntegrar(item.id)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors border ${
                          item.integradoContabil
                            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/30'
                            : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
                        }`}
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{item.integradoContabil ? 'Reintegrar Ajuste' : 'Integrar Lote Contábil'}</span>
                      </button>

                      <button
                        onClick={() => handleEditar(item)}
                        className="p-1.5 bg-[#262626] hover:bg-[#333333] border border-[#3d3d3d] text-gray-300 rounded transition-colors"
                        title="Editar plano"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleExcluir(item.id, item.codigoPlanoSusepPrevic)}
                        className="p-1.5 bg-[#262626] hover:bg-red-950/50 border border-[#3d3d3d] text-red-400 rounded transition-colors"
                        title="Excluir plano"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes Financeiros */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-[#242424] p-3 rounded border border-[#2e2e2e]">
                    <div>
                      <div className="text-gray-500 text-[10px]">Obrigações Atuariais (VBO)</div>
                      <div className="text-rose-400 font-bold font-mono mt-0.5">{formatBRL(item.obrigacaoAtuarialTotalVBO_BRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Ativos Garantidores</div>
                      <div className="text-blue-400 font-bold font-mono mt-0.5">{formatBRL(item.ativosGarantidoresDoPlanoBRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Saldo Atuarial Líquido</div>
                      <div className={`font-bold font-mono mt-0.5 ${
                        item.superavitOuDeficitAtuarialLiquidoBRL < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {formatBRL(item.superavitOuDeficitAtuarialLiquidoBRL)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Taxa Desconto NTN-B</div>
                      <div className="text-teal-400 font-semibold mt-0.5">{formatPercent(item.taxaDescontoAtuarialNominalPercentual)} a.a.</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Custo Serviço Corrente</div>
                      <div className="text-amber-400 font-semibold font-mono mt-0.5">{formatBRL(item.custoServicoCorrenteExercicioBRL)}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-[10px]">Remensuração em DRA</div>
                      <div className={`font-mono mt-0.5 ${
                        item.ganhosOuPerdasAtuariaisRemensuracaoDRA_BRL < 0 ? 'text-rose-300' : 'text-emerald-300'
                      }`}>
                        {formatBRL(item.ganhosOuPerdasAtuariaisRemensuracaoDRA_BRL)}
                      </div>
                    </div>
                  </div>

                  {/* Rodapé: Contribuição Paga & Observações */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2 px-1">
                    <div className="flex items-center space-x-4">
                      <span>
                        Contribuição Anual Patrocinador: <strong className="text-gray-200">{formatBRL(item.contribuicaoEfetivaPagaPatrocinadorBRL)}</strong>
                      </span>
                      <span>
                        Juros Líquidos Passivo: <strong className="text-gray-300">{formatBRL(item.jurosLiquidosSobrePassivoAtuarialBRL)}</strong>
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

      {/* ABA 2: SIMULADOR DE SENSIBILIDADE */}
      {abaAtiva === 'simulador' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-6">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Simulador de Sensibilidade Atuarial (Stress Test da Curva de Juros)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Avalie o impacto no passivo atuarial (VBO) e no déficit patrimonial decorrente de variações de 100 bps (+/- 1,00%) na taxa de desconto de longo prazo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Premissas Atuariais Básicas</span>
              </h4>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Obrigações Atuariais Base - VBO (R$)</label>
                <input
                  type="number"
                  value={simVBO}
                  onChange={e => setSimVBO(Number(e.target.value))}
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Ativos Garantidores do Fundo (R$)</label>
                <input
                  type="number"
                  value={simAtivos}
                  onChange={e => setSimAtivos(Number(e.target.value))}
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Taxa Desconto Base (% a.a.)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={simTaxaDescontoBase}
                    onChange={e => setSimTaxaDescontoBase(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Modified Duration (anos)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simDuracaoPassivoAnos}
                    onChange={e => setSimDuracaoPassivoAnos(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded text-[11px] text-emerald-300 leading-relaxed">
                <strong>Análise de Sensibilidade Obrigatória (CPC 33 item 145):</strong> As entidades são obrigadas a divulgar em notas explicativas o efeito de um aumento ou redução razoavelmente possível em cada premissa atuarial relevante.
              </div>
            </div>

            <div className="space-y-4 bg-[#242424] p-4 rounded-lg border border-[#2e2e2e]">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Cenários de Estresse da Curva de Juros</span>
              </h4>

              <div className="space-y-3">
                <div className="bg-[#1c1c1c] p-3 rounded border border-emerald-900/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-400 font-semibold">Cenário A: Aumento de +1,00% na Taxa (NTN-B {(simTaxaDescontoBase + 1).toFixed(2)}%)</span>
                    <span className="text-[10px] text-emerald-300 font-bold">Redução do VBO</span>
                  </div>
                  <div className="text-lg font-bold text-gray-100 mt-1">{formatBRL(simNovoVBO_Alta100)}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Impacto Líquido: Alívio de {formatBRL(Math.abs(simDeltaVBO_Alta100))} no déficit atuarial (Novo saldo: {formatBRL(simDeficitAlta100)})
                  </div>
                </div>

                <div className="bg-[#1c1c1c] p-3 rounded border border-rose-900/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-rose-400 font-semibold">Cenário B: Queda de -1,00% na Taxa (NTN-B {(simTaxaDescontoBase - 1).toFixed(2)}%)</span>
                    <span className="text-[10px] text-rose-300 font-bold">Agravamento do VBO</span>
                  </div>
                  <div className="text-lg font-bold text-gray-100 mt-1">{formatBRL(simNovoVBO_Queda100)}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Impacto Líquido: Aumento de {formatBRL(simDeltaVBO_Queda100)} no déficit atuarial (Novo saldo: {formatBRL(simDeficitQueda100)})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: DIRETRIZES TÉCNICAS & CNPC 32 */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 space-y-5">
          <div className="border-b border-[#2d2d2d] pb-3">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Diretrizes e Regras Contábeis para Benefícios Pós-Emprego (CPC 33 R1)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Normas contábeis e atuariais emitidas pelo CFC, CPC, IASB e Conselho Nacional de Previdência Complementar (CNPC).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                <Landmark className="w-4 h-4" />
                <span>1. Passivo Atuarial Líquido</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                O passivo reconhecido no balanço patrimonial da patrocinadora é o déficit atuarial líquido (Valor Presente das Obrigações Atuariais deduzido do Valor Justo dos Ativos Garantidores do plano administrados pela EFPC).
              </p>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-teal-400 font-semibold flex items-center space-x-1.5">
                <Heart className="w-4 h-4" />
                <span>2. Outros Resultados Abrangentes</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                As remensurações do passivo atuarial líquido (ganhos e perdas atuariais decorrentes de novos laudos e retorno dos ativos acima/abaixo da taxa de desconto) são reconhecidas integralmente em Outros Resultados Abrangentes (DRA) no Patrimônio Líquido.
              </p>
            </div>

            <div className="bg-[#242424] border border-[#2e2e2e] p-4 rounded-lg space-y-2">
              <div className="text-blue-400 font-semibold flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span>3. Despesa no Resultado</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Apenas dois componentes transitam pelo DRE: o Custo do Serviço Corrente (direitos adicionais acumulados no ano pelos empregados ativos) e os Juros Líquidos sobre o Passivo/Ativo Líquido apurados à taxa de desconto NTN-B.
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
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <span>{itemEdicao ? 'Editar Plano de Benefício Atuarial' : 'Novo Plano de Benefício Atuarial (CPC 33)'}</span>
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
                  <label className="block text-gray-300 font-medium mb-1">Código do Plano (SUSEP / PREVIC) *</label>
                  <input
                    type="text"
                    required
                    value={codigoPlanoSusepPrevic}
                    onChange={e => setCodigoPlanoSusepPrevic(e.target.value)}
                    placeholder="Ex: PREV-PATROC-BD-01"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Entidade Fechada (EFPC) *</label>
                  <input
                    type="text"
                    required
                    value={nomeEntidadeFechadaEFPC}
                    onChange={e => setNomeEntidadeFechadaEFPC(e.target.value)}
                    placeholder="Ex: Fundação de Seguridade Social Multipatrocinada"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Modalidade *</label>
                  <select
                    value={modalidade}
                    onChange={e => setModalidade(e.target.value as ModalidadePlanoPrevidencia)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BENEFICIO_DEFINIDO_BD">Benefício Definido (BD)</option>
                    <option value="CONTRIBUICAO_VARIAVEL_CV">Contribuição Variável (CV)</option>
                    <option value="CONTRIBUICAO_DEFINIDA_CD">Contribuição Definida (CD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Atuário Responsável *</label>
                  <input
                    type="text"
                    required
                    value={atuarioResponsavel}
                    onChange={e => setAtuarioResponsavel(e.target.value)}
                    placeholder="Ex: Atuário Dr. Henrique Villas Boas"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Registro IBA Atuário *</label>
                  <input
                    type="text"
                    required
                    value={registroIbaAtuario}
                    onChange={e => setRegistroIbaAtuario(e.target.value)}
                    placeholder="Ex: MIBA nº 1.482"
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Data Avaliação Atuarial *</label>
                  <input
                    type="date"
                    required
                    value={dataAvaliacaoAtuarial}
                    onChange={e => setDataAvaliacaoAtuarial(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Taxa Desconto NTN-B (% a.a.) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={taxaDescontoAtuarialNominalPercentual}
                    onChange={e => setTaxaDescontoAtuarialNominalPercentual(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Inflação IPCA (% a.a.) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={taxaInflacaoEsperadaIPCA_Percentual}
                    onChange={e => setTaxaInflacaoEsperadaIPCA_Percentual(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Obrigações Atuariais - VBO (R$) *</label>
                  <input
                    type="number"
                    required
                    value={obrigacaoAtuarialTotalVBO_BRL}
                    onChange={e => setObrigacaoAtuarialTotalVBO_BRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Ativos Garantidores do Plano (R$) *</label>
                  <input
                    type="number"
                    required
                    value={ativosGarantidoresDoPlanoBRL}
                    onChange={e => setAtivosGarantidoresDoPlanoBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Custo Serviço Corrente (R$)</label>
                  <input
                    type="number"
                    value={custoServicoCorrenteExercicioBRL}
                    onChange={e => setCustoServicoCorrenteExercicioBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Juros Líquidos Passivo (R$)</label>
                  <input
                    type="number"
                    value={jurosLiquidosSobrePassivoAtuarialBRL}
                    onChange={e => setJurosLiquidosSobrePassivoAtuarialBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Remensuração DRA (R$)</label>
                  <input
                    type="number"
                    value={ganhosOuPerdasAtuariaisRemensuracaoDRA_BRL}
                    onChange={e => setGanhosOuPerdasAtuariaisRemensuracaoDRA_BRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Contribuição Patrocinador (R$)</label>
                  <input
                    type="number"
                    value={contribuicaoEfetivaPagaPatrocinadorBRL}
                    onChange={e => setContribuicaoEfetivaPagaPatrocinadorBRL(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Observações Técnicas / Premissas Biométricas</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Tábua de mortalidade AT-2000, tábua de entrada em invalidez, idade média de aposentadoria, rotatividade..."
                  className="w-full bg-[#262626] border border-[#3d3d3d] rounded px-3 py-1.5 text-gray-100 focus:outline-none focus:border-emerald-500"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                >
                  Salvar Plano Atuarial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
