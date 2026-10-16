import React, { useState, useEffect } from 'react';
import {
  Ship,
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
  Layers,
  Sparkles,
  FileSpreadsheet,
  Anchor,
  Clock,
  Building,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  AtoConcessorioDrawback,
  ResumoDrawback,
  ModalidadeDrawback,
  StatusAtoConcessorio
} from '../../types/contabil';

interface DrawbackIntegradoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const DrawbackIntegradoModule: React.FC<DrawbackIntegradoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoDrawback | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'atos' | 'comprovacao' | 'legislacao'>('atos');
  const [busca, setBusca] = useState('');
  const [filtroModalidade, setFiltroModalidade] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<AtoConcessorioDrawback | null>(null);

  // Formulário
  const [numeroAtoConcessorio, setNumeroAtoConcessorio] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeDrawback>('SUSPENSAO');
  const [dataEmissao, setDataEmissao] = useState('2026-01-15');
  const [dataValidade, setDataValidade] = useState('2027-01-15');
  const [prazoProrrogadoAte, setPrazoProrrogadoAte] = useState('');
  const [produtoFinalExportar, setProdutoFinalExportar] = useState('');
  const [ncmProdutoFinal, setNcmProdutoFinal] = useState('');
  const [moedaAto, setMoedaAto] = useState<'USD' | 'EUR' | 'BRL'>('USD');
  const [valorPrevistoExportacaoFOB, setValorPrevistoExportacaoFOB] = useState(1000000);
  const [valorExportadoComprovadoFOB, setValorExportadoComprovadoFOB] = useState(750000);
  const [numeroDUEComprovacao, setNumeroDUEComprovacao] = useState('');
  const [chaveDue, setChaveDue] = useState('');
  const [valorPrevistoImportacaoCIF, setValorPrevistoImportacaoCIF] = useState(400000);
  const [valorImportadoRealizadoCIF, setValorImportadoRealizadoCIF] = useState(380000);
  const [numeroDeclaracaoImportacaoDI, setNumeroDeclaracaoImportacaoDI] = useState('');
  const [valorInsumosNacionaisAdquiridos, setValorInsumosNacionaisAdquiridos] = useState(200000);
  const [tributosII, setTributosII] = useState(100000);
  const [tributosIPI, setTributosIPI] = useState(50000);
  const [tributosPIS, setTributosPIS] = useState(25000);
  const [tributosCOFINS, setTributosCOFINS] = useState(115000);
  const [tributosICMS, setTributosICMS] = useState(45000);
  const [statusAto, setStatusAto] = useState<StatusAtoConcessorio>('EM_VIGOR');
  const [observacoes, setObservacoes] = useState('');

  // Simulador de Inadimplemento e Risco Tributário
  const [simPercentualNaoExportado, setSimPercentualNaoExportado] = useState(25);
  const [simTaxaSelicAcumulada, setSimTaxaSelicAcumulada] = useState(12.5);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const data = dbService.getDrawback(empresaAtiva.id, anoFiltro);
    setResumo(data);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const handleNovo = () => {
    setItemEdicao(null);
    setNumeroAtoConcessorio(`2026/${Math.floor(1000000 + Math.random() * 9000000)}-1`);
    setModalidade('SUSPENSAO');
    setDataEmissao(new Date().toISOString().split('T')[0]);
    const validade = new Date();
    validade.setFullYear(validade.getFullYear() + 1);
    setDataValidade(validade.toISOString().split('T')[0]);
    setPrazoProrrogadoAte('');
    setProdutoFinalExportar('');
    setNcmProdutoFinal('8483.40.90');
    setMoedaAto('USD');
    setValorPrevistoExportacaoFOB(1000000);
    setValorExportadoComprovadoFOB(0);
    setNumeroDUEComprovacao('');
    setChaveDue('');
    setValorPrevistoImportacaoCIF(400000);
    setValorImportadoRealizadoCIF(0);
    setNumeroDeclaracaoImportacaoDI('');
    setValorInsumosNacionaisAdquiridos(0);
    setTributosII(80000);
    setTributosIPI(45000);
    setTributosPIS(22000);
    setTributosCOFINS(101000);
    setTributosICMS(40000);
    setStatusAto('REGISTRADO');
    setObservacoes('');
    setIsModalOpen(true);
  };

  const handleEditar = (item: AtoConcessorioDrawback) => {
    setItemEdicao(item);
    setNumeroAtoConcessorio(item.numeroAtoConcessorio);
    setModalidade(item.modalidade);
    setDataEmissao(item.dataEmissao);
    setDataValidade(item.dataValidade);
    setPrazoProrrogadoAte(item.prazoProrrogadoAte || '');
    setProdutoFinalExportar(item.produtoFinalExportar);
    setNcmProdutoFinal(item.ncmProdutoFinal);
    setMoedaAto(item.moedaAto);
    setValorPrevistoExportacaoFOB(item.valorPrevistoExportacaoFOB);
    setValorExportadoComprovadoFOB(item.valorExportadoComprovadoFOB);
    setNumeroDUEComprovacao(item.numeroDUEComprovacao || '');
    setChaveDue(item.chaveDue || '');
    setValorPrevistoImportacaoCIF(item.valorPrevistoImportacaoCIF);
    setValorImportadoRealizadoCIF(item.valorImportadoRealizadoCIF);
    setNumeroDeclaracaoImportacaoDI(item.numeroDeclaracaoImportacaoDI || '');
    setValorInsumosNacionaisAdquiridos(item.valorInsumosNacionaisAdquiridos);
    setTributosII(item.tributosII);
    setTributosIPI(item.tributosIPI);
    setTributosPIS(item.tributosPIS);
    setTributosCOFINS(item.tributosCOFINS);
    setTributosICMS(item.tributosICMS);
    setStatusAto(item.statusAto);
    setObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const totalTributos = tributosII + tributosIPI + tributosPIS + tributosCOFINS + tributosICMS;
    const percentualComp = valorPrevistoExportacaoFOB > 0 
      ? Math.min(100, Math.round((valorExportadoComprovadoFOB / valorPrevistoExportacaoFOB) * 10000) / 100) 
      : 0;

    const item: AtoConcessorioDrawback = {
      id: itemEdicao ? itemEdicao.id : `drawback-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroAtoConcessorio,
      modalidade,
      dataEmissao,
      dataValidade,
      prazoProrrogadoAte: prazoProrrogadoAte || undefined,
      produtoFinalExportar,
      ncmProdutoFinal,
      moedaAto,
      valorPrevistoExportacaoFOB,
      valorExportadoComprovadoFOB,
      numeroDUEComprovacao: numeroDUEComprovacao || undefined,
      chaveDue: chaveDue || undefined,
      valorPrevistoImportacaoCIF,
      valorImportadoRealizadoCIF,
      numeroDeclaracaoImportacaoDI: numeroDeclaracaoImportacaoDI || undefined,
      valorInsumosNacionaisAdquiridos,
      tributosSuspensosTotais: totalTributos,
      tributosII,
      tributosIPI,
      tributosPIS,
      tributosCOFINS,
      tributosICMS,
      percentualComprovacao: percentualComp,
      statusAto,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: observacoes || undefined
    };

    const res = dbService.salvarAtoDrawback(item);
    if (res.sucesso) {
      setIsModalOpen(false);
      carregarDados();
    }
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Confirma a exclusão deste Ato Concessório de Drawback?')) {
      const res = dbService.excluirAtoDrawback(id);
      if (res.sucesso) carregarDados();
    }
  };

  const handleIntegrar = (id: string) => {
    const res = dbService.integrarDrawbackContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const atosFiltrados = resumo?.atos.filter(item => {
    const matchBusca = 
      item.numeroAtoConcessorio.toLowerCase().includes(busca.toLowerCase()) ||
      item.produtoFinalExportar.toLowerCase().includes(busca.toLowerCase()) ||
      item.ncmProdutoFinal.toLowerCase().includes(busca.toLowerCase()) ||
      (item.numeroDUEComprovacao && item.numeroDUEComprovacao.toLowerCase().includes(busca.toLowerCase()));

    const matchModalidade = filtroModalidade === 'TODOS' || item.modalidade === filtroModalidade;
    const matchStatus = filtroStatus === 'TODOS' || item.statusAto === filtroStatus;

    return matchBusca && matchModalidade && matchStatus;
  }) || [];

  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview || !empresaAtiva || !resumo) return;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #1e3a8a; text-transform: uppercase;">Demonstrativo de Controle de Drawback Integrado</h2>
          <p style="margin: 4px 0; font-size: 13px; color: #4b5563;">
            Comércio Exterior & Desoneração Aduaneira • Portaria Secex nº 44/2020 • Decreto nº 6.759/2009 (RIR/Aduaneiro)
          </p>
          <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
            Empresa: <strong>${empresaAtiva.razaoSocial}</strong> • CNPJ: ${empresaAtiva.cnpj} • Exercício: ${resumo.anoExercicio}
          </p>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">ATOS CONCESSÓRIOS VIGENTES</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${resumo.totalAtosAtivos} Atos Siscomex</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">COMPROMISSO FOB TOTAL</div>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb;">USD ${resumo.totalExportacaoCompromissadaFOB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">EXPORTAÇÃO REALIZADA (DU-E)</div>
            <div style="font-size: 18px; font-weight: bold; color: #16a34a;">USD ${resumo.totalExportacaoRealizadaFOB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">TRIBUTOS SUSPENSOS/ISENTOS</div>
            <div style="font-size: 18px; font-weight: bold; color: #d97706;">R$ ${resumo.totalTributosSuspensosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e293b; color: #fff;">
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Ato Concessório</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Modalidade</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Produto / NCM</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Compromisso FOB</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Comprovado DU-E</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Insumos CIF/Nac.</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Tributos Suspensos</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #334155;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.atos.map(a => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">${a.numeroAtoConcessorio}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${a.modalidade}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${a.produtoFinalExportar}<br><span style="color:#64748b;">NCM ${a.ncmProdutoFinal}</span></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">${a.moedaAto} ${a.valorPrevistoExportacaoFOB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: bold;">
                  ${a.moedaAto} ${a.valorExportadoComprovadoFOB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
                  <span style="font-size: 10px; color: #64748b;">(${a.percentualComprovacao.toFixed(1)}%)</span>
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">
                  Imp: ${a.valorImportadoRealizadoCIF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
                  Nac: ${a.valorInsumosNacionaisAdquiridos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #d97706;">
                  R$ ${a.tributosSuspensosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">
                  ${a.statusAto}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; line-height: 1.5;">
          <strong>Notas Explicativas & Fundamentação Aduaneira:</strong><br>
          1. O Regime Aduaneiro Especial de Drawback Integrado (Portaria Secex nº 44/2020 e arts. 383 a 426 do Decreto nº 6.759/2009) desonera de II, IPI, PIS-Importação, COFINS-Importação e ICMS a aquisição no mercado interno ou importação de insumos utilizados na fabricação de produtos exportados.<br>
          2. A comprovação do compromisso exportador é realizada mediante vinculação de Declarações Únicas de Exportação (DU-E) no Portal Único Siscomex.<br>
          3. O eventual inadimplemento acarreta a imediata nacionalização das mercadorias com exigência dos tributos suspensos corrigidos pela taxa SELIC mais penalidades legais.
        </div>
      </div>
    `;

    onOpenReportPreview({
      titulo: 'Controle de Drawback Integrado - Secex',
      subtitulo: `Exercício ${resumo.anoExercicio} • ${empresaAtiva.razaoSocial}`,
      conteudoHtml: html
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-slate-100 overflow-hidden font-sans">
      {/* Header Superior */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181818]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Drawback Integrado & Comércio Exterior</h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Portaria Secex 44/2020 • Dec. 6.759/09
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestão de Atos Concessórios Siscomex, Comprovação por DU-E e Controle de Tributos Suspensos (II, IPI, PIS, COFINS e ICMS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-white/5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300">Exercício:</span>
            <select
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(Number(e.target.value))}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#202020]">2026</option>
              <option value={2025} className="bg-[#202020]">2025</option>
              <option value={2024} className="bg-[#202020]">2024</option>
            </select>
          </div>

          <button
            onClick={carregarDados}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition border border-white/5"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Imprimir Relatório
          </button>

          <button
            onClick={handleNovo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Ato Concessório
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5 bg-[#141414]">
        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Atos Concessórios</span>
            <Ship className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {resumo?.totalAtosAtivos || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-blue-400 font-semibold">Ativos / Homologados</span> no Siscomex
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Exportação Comprovada (DU-E)</span>
            <Globe2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            USD {(resumo?.totalExportacaoRealizadaFOB || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            Meta FOB: USD {(resumo?.totalExportacaoCompromissadaFOB || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tributos Aduaneiros Suspensos</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            R$ {(resumo?.totalTributosSuspensosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>II + IPI + PIS + COFINS + ICMS</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1b1b] border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Insumos Importados vs Nacionais</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 mt-2 font-mono">
            R$ {((resumo?.totalInsumosImportadosCIF || 0) + (resumo?.totalInsumosNacionais || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>CIF: R$ {(resumo?.totalInsumosImportadosCIF || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
            <span>Nac: R$ {(resumo?.totalInsumosNacionais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex items-center justify-between px-6 border-b border-white/5 bg-[#181818]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('atos')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'atos'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ship className="w-4 h-4" />
            Atos Concessórios Registrados ({atosFiltrados.length})
          </button>

          <button
            onClick={() => setAbaAtiva('comprovacao')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'comprovacao'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Simulador de Comprovação & Risco Tributário
          </button>

          <button
            onClick={() => setAbaAtiva('legislacao')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
              abaAtiva === 'legislacao'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Regras Siscomex & Base Normativa
          </button>
        </div>

        {abaAtiva === 'atos' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por Ato, NCM, Produto ou DU-E..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-64 bg-[#202020] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <select
              value={filtroModalidade}
              onChange={(e) => setFiltroModalidade(e.target.value)}
              className="bg-[#202020] text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todas as Modalidades</option>
              <option value="SUSPENSAO">Suspensão</option>
              <option value="ISENCAO">Isenção</option>
              <option value="INTERMEDIARIO">Intermediário</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-[#202020] text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="EM_VIGOR">Em Vigor</option>
              <option value="COMPROVADO">Comprovado</option>
              <option value="REGISTRADO">Registrado</option>
              <option value="PRORROGADO">Prorrogado</option>
              <option value="INADIMPLIDO">Inadimplido</option>
            </select>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto p-6">
        {abaAtiva === 'atos' && (
          <div className="bg-[#181818] rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-slate-400 font-semibold border-b border-white/5">
                    <th className="py-3 px-4">Ato Concessório</th>
                    <th className="py-3 px-4">Modalidade</th>
                    <th className="py-3 px-4">Produto a Exportar (NCM)</th>
                    <th className="py-3 px-4 text-right">Compromisso FOB</th>
                    <th className="py-3 px-4 text-right">Comprovado DU-E</th>
                    <th className="py-3 px-4 text-right">Insumos (CIF / Nac.)</th>
                    <th className="py-3 px-4 text-right">Tributos Suspensos</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Contábil</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {atosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500">
                        Nenhum Ato Concessório de Drawback localizado para os filtros informados.
                      </td>
                    </tr>
                  ) : (
                    atosFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-semibold text-white">{item.numeroAtoConcessorio}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Val: {item.dataValidade}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.modalidade === 'SUSPENSAO'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : item.modalidade === 'ISENCAO'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {item.modalidade}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate text-slate-200 font-medium" title={item.produtoFinalExportar}>
                            {item.produtoFinalExportar}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            NCM: {item.ncmProdutoFinal}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="text-slate-200 font-semibold">
                            {item.moedaAto} {item.valorPrevistoExportacaoFOB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="text-emerald-400 font-semibold">
                            {item.moedaAto} {item.valorExportadoComprovadoFOB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="flex items-center justify-end gap-1.5 mt-1">
                            <div className="w-16 bg-[#252525] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${Math.min(100, item.percentualComprovacao)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.percentualComprovacao.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px]">
                          <div className="text-slate-300">
                            CIF: R$ {item.valorImportadoRealizadoCIF.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </div>
                          <div className="text-slate-500">
                            Nac: R$ {item.valorInsumosNacionaisAdquiridos.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="text-amber-400 font-semibold">
                            R$ {item.tributosSuspensosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            II: {item.tributosII.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} | ICMS: {item.tributosICMS.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.statusAto === 'COMPROVADO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.statusAto === 'EM_VIGOR'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : item.statusAto === 'PRORROGADO'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : item.statusAto === 'INADIMPLIDO'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {item.statusAto}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.integradoContabil ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Compensação
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIntegrar(item.id)}
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-[11px] font-medium border border-blue-500/30 transition"
                            >
                              Integrar
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditar(item)}
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition"
                              title="Editar Ato Concessório"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluir(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-white/5 transition"
                              title="Excluir Ato Concessório"
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

        {abaAtiva === 'comprovacao' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-[#181818] p-6 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Calculator className="w-4 h-4" />
                Simulador de Quebra de Compromisso
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Avalie o impacto fiscal de eventual inadimplemento parcial do compromisso FOB de exportação, simulando a exigência dos tributos com multa e SELIC.
              </p>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Percentual de Exportação Inadimplida: {simPercentualNaoExportado}%
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={simPercentualNaoExportado}
                  onChange={(e) => setSimPercentualNaoExportado(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Taxa SELIC Acumulada no Período (% a.a.)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={simTaxaSelicAcumulada}
                  onChange={(e) => setSimTaxaSelicAcumulada(Number(e.target.value))}
                  className="w-full bg-[#202020] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs space-y-2">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Risco de Inadimplemento Siscomex
                </div>
                <div className="text-slate-300">
                  Total de Tributos Suspensos em Carteira:
                  <div className="font-mono font-bold text-white text-sm">
                    R$ {(resumo?.totalTributosSuspensosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-[#181818] p-6 rounded-xl border border-white/5 space-y-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Cálculo de Nacionalização com Tributos Suspensos
              </h3>

              {(() => {
                const totalSuspenso = resumo?.totalTributosSuspensosBRL || 0;
                const principalInadimplido = (totalSuspenso * simPercentualNaoExportado) / 100;
                const jurosMoraSelic = (principalInadimplido * simTaxaSelicAcumulada) / 100;
                const multaDeMoraOficio = principalInadimplido * 0.20; // 20% mora legal
                const debitoTotalExigivel = principalInadimplido + jurosMoraSelic + multaDeMoraOficio;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-[#202020] border border-white/5">
                        <span className="text-[11px] text-slate-400">Principal a Recolher</span>
                        <div className="text-lg font-bold text-white font-mono mt-1">
                          R$ {principalInadimplido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-slate-500">{simPercentualNaoExportado}% dos tributos suspensos</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#202020] border border-white/5">
                        <span className="text-[11px] text-slate-400">Juros de Mora (SELIC)</span>
                        <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                          R$ {jurosMoraSelic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-slate-500">Art. 396 Dec. 6.759/2009</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#202020] border border-white/5">
                        <span className="text-[11px] text-slate-400">Débito Fiscal Consolidado</span>
                        <div className="text-lg font-bold text-rose-400 font-mono mt-1">
                          R$ {debitoTotalExigivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-rose-400/80">Com multa e juros mora</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-200">Recomendações Práticas do Departamento Aduaneiro:</h4>
                      <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                        <li>
                          <strong className="text-white">Pedido de Prorrogação Formal:</strong> Solicitar antes do vencimento do Ato Concessório prorrogação por até 1 (um) ano suplementar com base na Portaria Secex nº 44/2020.
                        </li>
                        <li>
                          <strong className="text-white">Destruição sob Controle Aduaneiro:</strong> Bens inutilizados podem ser destruídos com acompanhamento da Receita Federal sem incidência de multa de ofício.
                        </li>
                        <li>
                          <strong className="text-white">Nacionalização Espontânea:</strong> O recolhimento antes de procedimento fiscal afasta a multa qualificada de 75% a 150%.
                        </li>
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {abaAtiva === 'legislacao' && (
          <div className="bg-[#181818] p-6 rounded-xl border border-white/5 space-y-6 max-w-4xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-blue-400" />
                Dossiê Normativo & Tributário do Drawback Integrado
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Fundamentação jurídica no Direito Aduaneiro brasileiro e nas normas da Secex e RFB
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  PORTARIA SECEX Nº 44/2020
                </span>
                <h3 className="text-xs font-bold text-white">Regulamentação Operacional do Drawback</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Disciplina a concessão, prorrogação, alteração e liquidação dos Atos Concessórios de Drawback nas modalidades Suspensão e Isenção no Portal Único de Comércio Exterior (Siscomex).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  DECRETO Nº 6.759/2009 (RIR ADUANEIRO)
                </span>
                <h3 className="text-xs font-bold text-white">Artigos 383 a 426 - Regime Especial</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Prevê a desoneração do Imposto de Importação (II), IPI, PIS-Importação, COFINS-Importação e do ICMS na aquisição no mercado interno ou importação de matérias-primas e insumos.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Contabilização em Contas de Compensação
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As mercadorias admitidas sob o regime de Drawback com suspensão tributária devem ser registradas em contas de compensação ativas e passivas para salvaguarda patrimonial:
              </p>
              <div className="p-3 bg-[#0c0c0c] rounded-lg font-mono text-[11px] text-slate-300 space-y-1 border border-white/5">
                <div>D: 1.1.9.01 - Tributos Suspensos em Drawback Integrado (Ativo Compensatório)</div>
                <div>C: 2.1.9.01 - Obrigações Vinculadas a Atos Concessórios Siscomex (Passivo Compensatório)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#222]">
              <div className="flex items-center gap-2.5">
                <Anchor className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {itemEdicao ? 'Editar Ato Concessório Drawback' : 'Novo Ato Concessório de Drawback'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Número do Ato Concessório Siscomex *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroAtoConcessorio}
                    onChange={(e) => setNumeroAtoConcessorio(e.target.value)}
                    placeholder="Ex: 2026/0014523-1"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Modalidade Drawback *
                  </label>
                  <select
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value as ModalidadeDrawback)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  >
                    <option value="SUSPENSAO">Suspensão</option>
                    <option value="ISENCAO">Isenção</option>
                    <option value="INTERMEDIARIO">Intermediário</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Data Emissão</label>
                  <input
                    type="date"
                    required
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Data Validade</label>
                  <input
                    type="date"
                    required
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Status do Ato</label>
                  <select
                    value={statusAto}
                    onChange={(e) => setStatusAto(e.target.value as StatusAtoConcessorio)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  >
                    <option value="REGISTRADO">Registrado</option>
                    <option value="EM_VIGOR">Em Vigor</option>
                    <option value="COMPROVADO">Comprovado</option>
                    <option value="PRORROGADO">Prorrogado</option>
                    <option value="INADIMPLIDO">Inadimplido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Produto Final a Exportar *
                  </label>
                  <input
                    type="text"
                    required
                    value={produtoFinalExportar}
                    onChange={(e) => setProdutoFinalExportar(e.target.value)}
                    placeholder="Ex: Conjunto de Transmissão Hidrostática"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">NCM Produto Final</label>
                  <input
                    type="text"
                    required
                    value={ncmProdutoFinal}
                    onChange={(e) => setNcmProdutoFinal(e.target.value)}
                    placeholder="8483.40.90"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Moeda</label>
                  <select
                    value={moedaAto}
                    onChange={(e) => setMoedaAto(e.target.value as any)}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="BRL">BRL - Real</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Previsto Exportação FOB</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorPrevistoExportacaoFOB}
                    onChange={(e) => setValorPrevistoExportacaoFOB(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Realizado Exportação FOB</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorExportadoComprovadoFOB}
                    onChange={(e) => setValorExportadoComprovadoFOB(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Número DU-E Comprovação</label>
                  <input
                    type="text"
                    value={numeroDUEComprovacao}
                    onChange={(e) => setNumeroDUEComprovacao(e.target.value)}
                    placeholder="26BR000845129"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Chave Acesso DU-E</label>
                  <input
                    type="text"
                    value={chaveDue}
                    onChange={(e) => setChaveDue(e.target.value)}
                    placeholder="DUE-2026-BR-000845129-SECEX"
                    className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Detalhamento de Tributos Suspensos */}
              <div className="p-3 bg-[#141414] rounded-xl border border-white/5 space-y-3">
                <div className="text-xs font-semibold text-amber-400">Tributos Aduaneiros Suspensos (R$)</div>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">II</label>
                    <input
                      type="number"
                      value={tributosII}
                      onChange={(e) => setTributosII(Number(e.target.value))}
                      className="w-full bg-[#202020] text-xs text-white px-2 py-1.5 rounded border border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">IPI</label>
                    <input
                      type="number"
                      value={tributosIPI}
                      onChange={(e) => setTributosIPI(Number(e.target.value))}
                      className="w-full bg-[#202020] text-xs text-white px-2 py-1.5 rounded border border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">PIS</label>
                    <input
                      type="number"
                      value={tributosPIS}
                      onChange={(e) => setTributosPIS(Number(e.target.value))}
                      className="w-full bg-[#202020] text-xs text-white px-2 py-1.5 rounded border border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">COFINS</label>
                    <input
                      type="number"
                      value={tributosCOFINS}
                      onChange={(e) => setTributosCOFINS(Number(e.target.value))}
                      className="w-full bg-[#202020] text-xs text-white px-2 py-1.5 rounded border border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">ICMS</label>
                    <input
                      type="number"
                      value={tributosICMS}
                      onChange={(e) => setTributosICMS(Number(e.target.value))}
                      className="w-full bg-[#202020] text-xs text-white px-2 py-1.5 rounded border border-white/10 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Observações Operacionais</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações sobre o desembaraço aduaneiro e fornecedores vinculados..."
                  className="w-full bg-[#141414] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition"
                >
                  Salvar Ato Concessório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
