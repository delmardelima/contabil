import React, { useState, useEffect } from 'react';
import {
  Landmark,
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
  Scale,
  DollarSign,
  ArrowRightLeft,
  FileCheck2,
  Globe2,
  HelpCircle,
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  HabilitacaoBeneficioFcbf,
  ResumoFcbfCompensacao,
  TipoBeneficioIcmsFcbf,
  StatusHabilitacaoFcbf
} from '../../types/contabil';

interface FcbfCompensacaoModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const FcbfCompensacaoModule: React.FC<FcbfCompensacaoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoFcbfCompensacao | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'beneficios' | 'cronograma' | 'legislacao'>('beneficios');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<HabilitacaoBeneficioFcbf | null>(null);

  // Campos do formulário
  const [formAto, setFormAto] = useState('Decreto Estadual nº 66.000/2021');
  const [formUf, setFormUf] = useState('SP');
  const [formTipo, setFormTipo] = useState<TipoBeneficioIcmsFcbf>('CREDITO_PRESUMIDO_ICMS');
  const [formDescricao, setFormDescricao] = useState('Crédito presumido de ICMS para indústria de bens de capital');
  const [formFundamento, setFormFundamento] = useState('Art. 30 do Anexo III do RICMS/SP c/c LC 160/17');
  const [formConfaz, setFormConfaz] = useState('CONFAZ-CERT-SP-00890/20');
  const [formDataInicio, setFormDataInicio] = useState('2021-01-01');
  const [formDataFim, setFormDataFim] = useState('2032-12-31');
  const [formValorAnual, setFormValorAnual] = useState<number>(1200000);
  const [formStatus, setFormStatus] = useState<StatusHabilitacaoFcbf>('HABILITADO_CONFAZ');
  const [formObservacoes, setFormObservacoes] = useState('');

  // Simulador rápido
  const [simValorAnual, setSimValorAnual] = useState<number>(2000000);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getHabilitacoesFcbf(empresaAtiva.id, anoFiltro);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormAto(`Decreto Estadual nº 6${Math.floor(1000 + Math.random() * 9000)}/2021`);
    setFormUf('MG');
    setFormTipo('CREDITO_PRESUMIDO_ICMS');
    setFormDescricao('Crédito presumido setorial em operações industriais com aço e automação');
    setFormFundamento('Lei Estadual MG nº 22.549/2017 c/c Convênio ICMS 190/2017');
    setFormConfaz(`CONFAZ-CERT-MG-00${Math.floor(100 + Math.random() * 900)}/19`);
    setFormDataInicio('2021-01-01');
    setFormDataFim('2032-12-31');
    setFormValorAnual(1500000);
    setFormStatus('HABILITADO_CONFAZ');
    setFormObservacoes('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item: HabilitacaoBeneficioFcbf) => {
    setItemEdicao(item);
    setFormAto(item.numeroAtoConcessivo);
    setFormUf(item.ufConcessora);
    setFormTipo(item.tipoBeneficio);
    setFormDescricao(item.descricaoIncentivo);
    setFormFundamento(item.fundamentoLegalEstadual);
    setFormConfaz(item.registroConfazNumero);
    setFormDataInicio(item.dataInicioVigencia);
    setFormDataFim(item.dataFimVigenciaPrevista);
    setFormValorAnual(item.valorMedioAnualBeneficioBRL);
    setFormStatus(item.statusHabilitacao);
    setFormObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const anual = Number(formValorAnual);
    const item: HabilitacaoBeneficioFcbf = {
      id: itemEdicao ? itemEdicao.id : '',
      empresaId: empresaAtiva.id,
      numeroAtoConcessivo: formAto.trim(),
      ufConcessora: formUf.trim().toUpperCase(),
      tipoBeneficio: formTipo,
      descricaoIncentivo: formDescricao.trim(),
      fundamentoLegalEstadual: formFundamento.trim(),
      registroConfazNumero: formConfaz.trim(),
      dataInicioVigencia: formDataInicio,
      dataFimVigenciaPrevista: formDataFim,
      valorMedioAnualBeneficioBRL: anual,
      statusHabilitacao: formStatus,
      cronogramaCompensacaoTransitoriedade: {
        ano2029: Math.round(anual * 0.90 * 100) / 100,
        ano2030: Math.round(anual * 0.80 * 100) / 100,
        ano2031: Math.round(anual * 0.70 * 100) / 100,
        ano2032: Math.round(anual * 0.60 * 100) / 100
      },
      totalEstimadoCompensacaoUniaoBRL: Math.round(anual * (0.90 + 0.80 + 0.70 + 0.60) * 100) / 100,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: formObservacoes.trim()
    };

    dbService.salvarHabilitacaoFcbf(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Confirma a exclusão deste ato concessivo do FCBF?')) {
      dbService.excluirHabilitacaoFcbf(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarFcbfContabil(id);
    alert(res.mensagem);
    carregarDados();
  };

  const handleImprimirRelatorio = () => {
    if (!resumo || !empresaAtiva) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Dossiê Habilitatório FCBF - ${empresaAtiva.razaoSocial}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.4; padding: 20px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          .title { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 11pt; color: #444; margin: 3px 0 0; }
          .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .kpi-table td { padding: 10px; border: 1px solid #ccc; background: #f9f9f9; }
          .kpi-value { font-size: 13pt; font-weight: bold; color: #1b5e20; }
          table.data { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 9.5pt; }
          table.data th, table.data td { border: 1px solid #aaa; padding: 6px; text-align: left; }
          table.data th { background: #eee; font-weight: bold; }
          .text-right { text-align: right; }
          .footer { margin-top: 40px; border-top: 1px solid #aaa; padding-top: 15px; font-size: 9pt; color: #555; }
          .signature-box { margin-top: 40px; display: flex; justify-content: space-between; }
          .sig-line { width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px; font-size: 10pt; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Dossiê e Memória de Cálculo - Fundo de Compensação de Benefícios Fiscais (FCBF)</div>
          <div class="subtitle">Emenda Constitucional nº 132/2023 (Reforma Tributária) • Lei Complementar nº 160/2017 • PLP 68/2024</div>
          <div class="subtitle" style="margin-top: 5px;"><strong>Contribuinte Habilitado:</strong> ${empresaAtiva.razaoSocial} • <strong>CNPJ:</strong> ${empresaAtiva.cnpj} • <strong>Exercício Base:</strong> ${anoFiltro}</div>
        </div>

        <table class="kpi-table">
          <tr>
            <td>
              <div>Benefícios Habilitados CONFAZ</div>
              <div class="kpi-value">${resumo.totalBeneficiosHabilitados} Atos Concessivos</div>
            </td>
            <td>
              <div>Valor Médio Anual Desonerado</div>
              <div class="kpi-value">R$ ${resumo.totalValorAnualBeneficiosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
            <td>
              <div>Total Compensação Estimada (2029-2032)</div>
              <div class="kpi-value" style="color: #0d47a1;">R$ ${resumo.totalCompensacaoPrevistaPeriodoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
            <td>
              <div>Garantia Constitucional</div>
              <div class="kpi-value" style="color: #1b5e20;">ART. 159-A CF/88</div>
            </td>
          </tr>
        </table>

        <h4>1. Relação de Benefícios Fiscais Estaduais e Cronograma Transicional da União</h4>
        <table class="data">
          <thead>
            <tr>
              <th>Ato Concessivo / UF</th>
              <th>Tipo de Benefício</th>
              <th>Registro CONFAZ</th>
              <th class="text-right">Valor Anual (R$)</th>
              <th class="text-right">2029 (90%)</th>
              <th class="text-right">2030 (80%)</th>
              <th class="text-right">2031 (70%)</th>
              <th class="text-right">2032 (60%)</th>
              <th class="text-right">Total FCBF (R$)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.habilitacoes.map(h => `
              <tr>
                <td><strong>${h.numeroAtoConcessivo}</strong><br/><small>UF: ${h.ufConcessora} • Vigência: ${h.dataInicioVigencia} a ${h.dataFimVigenciaPrevista}</small></td>
                <td>${h.tipoBeneficio.replace(/_/g, ' ')}<br/><small>${h.descricaoIncentivo}</small></td>
                <td><strong>${h.registroConfazNumero}</strong></td>
                <td class="text-right">R$ ${h.valorMedioAnualBeneficioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">R$ ${h.cronogramaCompensacaoTransitoriedade.ano2029.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">R$ ${h.cronogramaCompensacaoTransitoriedade.ano2030.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">R$ ${h.cronogramaCompensacaoTransitoriedade.ano2031.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">R$ ${h.cronogramaCompensacaoTransitoriedade.ano2032.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right"><strong>R$ ${h.totalEstimadoCompensacaoUniaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                <td>${h.statusHabilitacao.replace(/_/g, ' ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h4>2. Fundamentação e Segurança Jurídica da Transição Tributária</h4>
        <p style="font-size: 9.5pt; text-align: justify; color: #333;">
          Nos termos do <strong>Artigo 159-A da Constituição Federal</strong>, acrescido pela Emenda Constitucional nº 132/2023, a União entregará recursos ao Fundo de Compensação de Benefícios Fiscais para compensar as pessoas jurídicas beneficiárias de incentivos convalidados pela Lei Complementar nº 160/2017 e vigentes até 31/12/2032. A apuração de perdas e habilitação de créditos é submetida ao Comitê Gestor do IBS e à Receita Federal do Brasil.
        </p>

        <div class="signature-box" style="margin-top: 50px;">
          <div class="sig-line">
            <strong>${empresaAtiva.razaoSocial}</strong><br/>
            Diretoria Tributária / Beneficiária
          </div>
          <div class="sig-line">
            <strong>Contador Responsável</strong><br/>
            CRC Ativo e Certificado Digital
          </div>
        </div>

        <div class="footer">
          Documento gerado eletronicamente via ERP Contábil Studio Pro • Padrão Reforma Tributária EC 132/2023 • Módulo FCBF
        </div>
      </body>
      </html>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: `Dossiê FCBF - ${empresaAtiva.razaoSocial}`,
        subtitulo: `Exercício ${anoFiltro} • Compensação Federal de Incentivos de ICMS (EC 132/2023)`,
        conteudoHtml: html
      });
    } else {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    }
  };

  const itensFiltrados = (resumo?.habilitacoes || []).filter(h => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      h.numeroAtoConcessivo.toLowerCase().includes(term) ||
      h.ufConcessora.toLowerCase().includes(term) ||
      h.descricaoIncentivo.toLowerCase().includes(term) ||
      h.registroConfazNumero.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              FCBF - Fundo de Compensação de Benefícios Fiscais
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-full">
              EC nº 132/2023 • LC nº 160/2017 • PLP 68/2024
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Gestão e habilitação de incentivos fiscais de ICMS convalidados no CONFAZ para compensação financeira pela União de 2029 a 2032.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#2d2d2d] border border-neutral-700 rounded px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 mr-2" />
            <select
              value={anoFiltro}
              onChange={e => setAnoFiltro(Number(e.target.value))}
              aria-label="Filtrar por ano de exercício"
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#1e1e1e]">Exercício 2026</option>
              <option value={2025} className="bg-[#1e1e1e]">Exercício 2025</option>
              <option value={2027} className="bg-[#1e1e1e]">Exercício 2027</option>
            </select>
          </div>

          <button
            onClick={carregarDados}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#2d2d2d] hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded transition"
            title="Recarregar dados"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-600 rounded transition"
            title="Imprimir Dossiê A4"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Dossiê A4
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Habilitação FCBF
          </button>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Benefícios Convalidados CONFAZ</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {resumo?.totalBeneficiosHabilitados || 0} Atos
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Convalidados formalmente pela LC 160/2017
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Desoneração Média Anual</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono">
            R$ {(resumo?.totalValorAnualBeneficiosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Base anual de incentivos de ICMS apurados
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-emerald-900/40 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-emerald-300">Total Compensação União (2029-32)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            R$ {(resumo?.totalCompensacaoPrevistaPeriodoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            Repasse compulsório do FCBF no período transicional
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Regulamentação Transitória</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-400 font-mono">
            90% a 60%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Escalonamento regressivo quadrienal do benefício
          </div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex border-b border-neutral-800 space-x-1">
        <button
          onClick={() => setAbaAtiva('beneficios')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'beneficios'
              ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Benefícios & Atos Concessivos ({resumo?.habilitacoes?.length || 0})
        </button>

        <button
          onClick={() => setAbaAtiva('cronograma')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'cronograma'
              ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Simulador do Cronograma 2029-2032
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'legislacao'
              ? 'border-emerald-500 text-emerald-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Marco Constitucional (Art. 159-A CF/88)
        </button>
      </div>

      {/* CONTEÚDO DA ABA BENEFÍCIOS */}
      {abaAtiva === 'beneficios' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-[#1e1e1e] p-2.5 rounded border border-neutral-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por ato concessivo, UF, descrição ou CONFAZ..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
              />
            </div>
            <div className="text-xs text-neutral-400">
              Mostrando <strong className="text-neutral-200">{itensFiltrados.length}</strong> de {resumo?.habilitacoes?.length || 0} atos
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#262626] text-neutral-400 uppercase text-[10px] font-semibold tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3">Ato Concessivo / UF</th>
                  <th className="p-3">Tipo / Descrição</th>
                  <th className="p-3">Registro CONFAZ</th>
                  <th className="p-3 text-right">Média Anual (R$)</th>
                  <th className="p-3 text-right">2029 (90%)</th>
                  <th className="p-3 text-right">2030 (80%)</th>
                  <th className="p-3 text-right">2031 (70%)</th>
                  <th className="p-3 text-right">2032 (60%)</th>
                  <th className="p-3 text-right">Total FCBF (R$)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Contábil</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {itensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-center text-neutral-500 font-sans">
                      Nenhum benefício fiscal de ICMS habilitado para compensação no FCBF.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                      <td className="p-3">
                        <div className="font-semibold text-white">{item.numeroAtoConcessivo}</div>
                        <div className="text-[11px] text-neutral-400 font-sans">UF: <strong>{item.ufConcessora}</strong> • Até {item.dataFimVigenciaPrevista}</div>
                      </td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-emerald-300 border border-neutral-700">
                          {item.tipoBeneficio.replace(/_/g, ' ')}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5 truncate max-w-xs">{item.descricaoIncentivo}</div>
                      </td>
                      <td className="p-3 text-neutral-200">
                        {item.registroConfazNumero}
                      </td>
                      <td className="p-3 text-right font-semibold text-white">
                        R$ {item.valorMedioAnualBeneficioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-neutral-300">
                        R$ {item.cronogramaCompensacaoTransitoriedade.ano2029.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-neutral-300">
                        R$ {item.cronogramaCompensacaoTransitoriedade.ano2030.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-neutral-300">
                        R$ {item.cronogramaCompensacaoTransitoriedade.ano2031.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-neutral-300">
                        R$ {item.cronogramaCompensacaoTransitoriedade.ano2032.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        R$ {item.totalEstimadoCompensacaoUniaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.statusHabilitacao === 'HOMOLOGADO_DIREITO_CREDITORIO' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          item.statusHabilitacao === 'HABILITADO_CONFAZ' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {item.statusHabilitacao.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {item.integradoContabil ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Integrado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleIntegrarContabil(item.id)}
                            className="px-2 py-1 text-[11px] font-medium bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded transition font-sans"
                            title="Reconhecer direito creditório na Contabilidade Geral"
                          >
                            Integrar
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => abrirModalEditar(item)}
                            className="p-1 hover:bg-neutral-700 text-neutral-300 rounded transition"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id)}
                            className="p-1 hover:bg-red-950 text-red-400 rounded transition"
                            title="Excluir"
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

      {/* CONTEÚDO DA ABA CRONOGRAMA */}
      {abaAtiva === 'cronograma' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm border-b border-neutral-800 pb-2">
              <Calculator className="w-4 h-4" />
              Simulador Transicional de Compensação do FCBF
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">
                  Benefício / Desoneração Anual Média de ICMS (R$)
                </label>
                <input
                  type="number"
                  value={simValorAnual}
                  onChange={e => setSimValorAnual(Number(e.target.value))}
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded space-y-2 text-neutral-300">
                <div className="font-semibold text-white">Escalonamento Constitucional (Art. 159-A CF/88):</div>
                <ul className="list-disc list-inside space-y-1 text-neutral-400">
                  <li><strong>Ano 2029:</strong> 90% do valor do incentivo compensado pela União</li>
                  <li><strong>Ano 2030:</strong> 80% do valor do incentivo compensado pela União</li>
                  <li><strong>Ano 2031:</strong> 70% do valor do incentivo compensado pela União</li>
                  <li><strong>Ano 2032:</strong> 60% do valor do incentivo compensado pela União</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 font-semibold text-sm border-b border-neutral-800 pb-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                Projeção Financeira dos Repasses Federais
              </div>

              {(() => {
                const c2029 = simValorAnual * 0.90;
                const c2030 = simValorAnual * 0.80;
                const c2031 = simValorAnual * 0.70;
                const c2032 = simValorAnual * 0.60;
                const total = c2029 + c2030 + c2031 + c2032;

                return (
                  <div className="space-y-3 mt-4 text-xs font-mono">
                    <div className="flex justify-between border-b border-neutral-800 pb-2 font-sans">
                      <span className="text-neutral-400">Parcela 2029 (90%):</span>
                      <span className="font-bold text-white">R$ {c2029.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between border-b border-neutral-800 pb-2 font-sans">
                      <span className="text-neutral-400">Parcela 2030 (80%):</span>
                      <span className="font-bold text-white">R$ {c2030.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between border-b border-neutral-800 pb-2 font-sans">
                      <span className="text-neutral-400">Parcela 2031 (70%):</span>
                      <span className="font-bold text-white">R$ {c2031.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between border-b border-neutral-800 pb-2 font-sans">
                      <span className="text-neutral-400">Parcela 2032 (60%):</span>
                      <span className="font-bold text-white">R$ {c2032.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between items-center bg-emerald-950/40 border border-emerald-800/60 p-3 rounded mt-2 font-sans">
                      <span className="text-sm font-semibold text-emerald-300">Total a Receber do FCBF:</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-[11px] text-neutral-400 leading-relaxed">
              <strong className="text-white">Homologação Comitê Gestor IBS:</strong> Os valores serão creditados mediante compensação em conta gráfica no novo sistema integrado do Imposto sobre Bens e Serviços (IBS) e da Contribuição sobre Bens e Serviços (CBS).
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA LEGISLAÇÃO */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-5 space-y-4 text-xs leading-relaxed text-neutral-300">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-neutral-800 pb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Regulamento e Princípios Constitucionais do FCBF
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Scale className="w-4 h-4 text-emerald-400" />
                1. Artigo 159-A da Constituição Federal (EC nº 132/2023)
              </h3>
              <p className="text-neutral-400 text-justify">
                A União constituirá o Fundo de Compensação de Benefícios Fiscais com o objetivo de compensar pessoas jurídicas beneficiárias de incentivos de ICMS concedidos por prazo certo e em função de determinadas condições, convalidados nos termos da Lei Complementar nº 160/2017, vigentes em 31/05/2023 e com término previsto até 31/12/2032.
              </p>
            </div>

            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Landmark className="w-4 h-4 text-emerald-400" />
                2. Natureza Jurídica e Contabilização Societária (CPC 07)
              </h3>
              <p className="text-neutral-400 text-justify">
                Os recursos entregues pelo FCBF possuem natureza jurídica de subvenção governamental compensatória da extinção de incentivos tributários pretéritos, devendo ser reconhecidos no Ativo Realizável a Longo Prazo contra Reserva de Incentivos Fiscais no Patrimônio Líquido, observando-se os ditames do Pronunciamento Técnico CPC 07 (R1).
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded space-y-2">
            <div className="font-semibold text-emerald-300">Estrutura de Partidas Dobradas Contábeis:</div>
            <div className="font-mono text-[11px] text-neutral-300 space-y-1">
              <div><strong>1. Homologação do Direito Creditório:</strong></div>
              <div><strong>D:</strong> 1.2.1.15 - Créditos Fiscais a Realizar - Direitos FCBF (Ativo Não Circulante - RLP)</div>
              <div><strong>C:</strong> 2.2.2.05 - Subvenções Governamentais a Realizar (Passivo Não Circulante / PL)</div>
              <div className="pt-1"><strong>2. Realização da Compensação Anual (2029 a 2032):</strong></div>
              <div><strong>D:</strong> 2.1.2.xx - Obrigações Tributárias IBS / CBS a Recolher</div>
              <div><strong>C:</strong> 1.2.1.15 - Créditos Fiscais a Realizar - Direitos FCBF</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR HABILITAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-neutral-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-400" />
                {itemEdicao ? 'Editar Habilitação FCBF' : 'Nova Habilitação de Benefício Fiscal (FCBF)'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-neutral-400 mb-1">Ato Concessivo Estadual (Decreto / Regime Especial)</label>
                  <input
                    type="text"
                    required
                    value={formAto}
                    onChange={e => setFormAto(e.target.value)}
                    placeholder="Decreto nº 65.255/2020"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">UF Concessora</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formUf}
                    onChange={e => setFormUf(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-emerald-500 focus:outline-none text-center uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Tipo de Benefício ICMS</label>
                  <select
                    value={formTipo}
                    onChange={e => setFormTipo(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="CREDITO_PRESUMIDO_ICMS">CRÉDITO PRESUMIDO DE ICMS</option>
                    <option value="REDUCAO_BASE_CALCULO">REDUÇÃO DE BASE DE CÁLCULO</option>
                    <option value="ISENCAO_ICMS">ISENÇÃO DE ICMS</option>
                    <option value="DIFERIMENTO_COM_DESONERACAO">DIFERIMENTO COM DESONERAÇÃO FINAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Certificado de Registro CONFAZ (LC 160/17)</label>
                  <input
                    type="text"
                    required
                    value={formConfaz}
                    onChange={e => setFormConfaz(e.target.value)}
                    placeholder="CONFAZ-CERT-SP-00412/18"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Descrição do Incentivo Fiscal e Objeto da Atividade</label>
                <input
                  type="text"
                  required
                  value={formDescricao}
                  onChange={e => setFormDescricao(e.target.value)}
                  placeholder="Incentivo fiscal para fabricação de bens industriais..."
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Fundamento Legal Estadual e Regulamentar</label>
                <input
                  type="text"
                  required
                  value={formFundamento}
                  onChange={e => setFormFundamento(e.target.value)}
                  placeholder="Artigo do Regulamento de ICMS e Lei Estadual concessora"
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#181818] p-3 rounded border border-neutral-800">
                <div>
                  <label className="block text-neutral-400 mb-1">Início da Vigência</label>
                  <input
                    type="date"
                    required
                    value={formDataInicio}
                    onChange={e => setFormDataInicio(e.target.value)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Término Previsto (Máx 2032)</label>
                  <input
                    type="date"
                    required
                    value={formDataFim}
                    onChange={e => setFormDataFim(e.target.value)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Média Anual do Benefício (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formValorAnual}
                    onChange={e => setFormValorAnual(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Status de Habilitação</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="HABILITADO_CONFAZ">HABILITADO E CONVALIDADO NO CONFAZ</option>
                  <option value="SUBMETIDO_COMITE_GESTOR_IBS">SUBMETIDO AO COMITÊ GESTOR DO IBS</option>
                  <option value="HOMOLOGADO_DIREITO_CREDITORIO">HOMOLOGADO DIREITO CREDITÓRIO (DEFINITIVO)</option>
                  <option value="EM_ANALISE_RECEITA_FEDERAL">EM ANÁLISE NA RECEITA FEDERAL</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Observações e Informações Complementares</label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={e => setFormObservacoes(e.target.value)}
                  placeholder="Condições resolutivas do ato concessivo e laudo pericial..."
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition font-semibold shadow-sm"
                >
                  Salvar Habilitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FcbfCompensacaoModule;
