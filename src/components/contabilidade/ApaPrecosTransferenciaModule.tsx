import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
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
  Scale,
  DollarSign,
  ArrowRightLeft,
  Building2,
  Globe2,
  FileCheck2,
  Landmark,
  Briefcase
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  AcordoPrevioPrecoApa,
  ResumoApaTransferPricing,
  TipoAcordoApa,
  MetodoPrecoTransferencia,
  StatusApa
} from '../../types/contabil';

interface ApaPrecosTransferenciaModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const ApaPrecosTransferenciaModule: React.FC<ApaPrecosTransferenciaModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoApaTransferPricing | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'acordos' | 'simulador' | 'diretrizes'>('acordos');
  const [busca, setBusca] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<AcordoPrevioPrecoApa | null>(null);

  // Campos do formulário
  const [formProcesso, setFormProcesso] = useState('10380.720194/2026-10');
  const [formTipoAcordo, setFormTipoAcordo] = useState<TipoAcordoApa>('BILATERAL_MAP_OCDE');
  const [formPais, setFormPais] = useState('ESTADOS UNIDOS DA AMÉRICA (IRS)');
  const [formEntidade, setFormEntidade] = useState('Global Distribution LLC');
  const [formTransacao, setFormTransacao] = useState<'IMPORTACAO_MATERIA_PRIMA' | 'EXPORTACAO_PRODUTOS' | 'ROYALTIES_LICENCA' | 'SERVICOS_INTRAGRUPO'>('EXPORTACAO_PRODUTOS');
  const [formMetodo, setFormMetodo] = useState<MetodoPrecoTransferencia>('MLT_MARGEM_LIQUIDA_TRANSACAO');
  const [formIndicador, setFormIndicador] = useState('Margem Operacional Líquida (ROS)');
  const [formMin, setFormMin] = useState<number>(8.0);
  const [formMediana, setFormMediana] = useState<number>(10.5);
  const [formMax, setFormMax] = useState<number>(13.5);
  const [formDataInicio, setFormDataInicio] = useState('2026-01-01');
  const [formDataFim, setFormDataFim] = useState('2029-12-31');
  const [formStatusApa, setFormStatusApa] = useState<StatusApa>('HOMOLOGADO_VIGENTE');
  const [formVolume, setFormVolume] = useState<number>(12000000);
  const [formMargemEfetiva, setFormMargemEfetiva] = useState<number>(11.0);
  const [formObservacoes, setFormObservacoes] = useState('');

  // Simulador rápido
  const [simVolume, setSimVolume] = useState<number>(10000000);
  const [simMin, setSimMin] = useState<number>(7.0);
  const [simMediana, setSimMediana] = useState<number>(9.5);
  const [simMax, setSimMax] = useState<number>(12.0);
  const [simMargemPraticada, setSimMargemPraticada] = useState<number>(6.0);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getResumoApaTransferPricing(empresaAtiva.id, anoFiltro);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormProcesso(`10380.99${Math.floor(1000 + Math.random() * 9000)}/2026-88`);
    setFormTipoAcordo('BILATERAL_MAP_OCDE');
    setFormPais('REINO UNIDO (HMRC)');
    setFormEntidade('British Logistics & Trade Ltd (Londres)');
    setFormTransacao('EXPORTACAO_PRODUTOS');
    setFormMetodo('MLT_MARGEM_LIQUIDA_TRANSACAO');
    setFormIndicador('Margem Operacional Líquida s/ Vendas Líquidas (ROS)');
    setFormMin(7.5);
    setFormMediana(10.0);
    setFormMax(13.0);
    setFormDataInicio('2026-01-01');
    setFormDataFim('2029-12-31');
    setFormStatusApa('HOMOLOGADO_VIGENTE');
    setFormVolume(15000000);
    setFormMargemEfetiva(10.2);
    setFormObservacoes('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item: AcordoPrevioPrecoApa) => {
    setItemEdicao(item);
    setFormProcesso(item.numeroProcessoRFB);
    setFormTipoAcordo(item.tipoAcordo);
    setFormPais(item.paisJurisdicaoVinculada);
    setFormEntidade(item.entidadeEstrangeiraVinculada);
    setFormTransacao(item.tipoTransacaoControlada);
    setFormMetodo(item.metodoEleito);
    setFormIndicador(item.pllIndicadorRentabilidade);
    setFormMin(item.intervaloArmLengthMin);
    setFormMediana(item.intervaloArmLengthMediana);
    setFormMax(item.intervaloArmLengthMax);
    setFormDataInicio(item.dataInicioVigencia);
    setFormDataFim(item.dataFimVigencia);
    setFormStatusApa(item.statusApa);
    setFormVolume(item.volumeAnualTransacionadoBRL);
    setFormMargemEfetiva(item.margemPraticadaEfetiva);
    setFormObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    // Regra Arm's Length Art. 39 Lei 14.596/23:
    const precisaAjuste = formMargemEfetiva < formMin || formMargemEfetiva > formMax;
    const dif = Math.abs(formMediana - formMargemEfetiva);
    const valorAjuste = precisaAjuste ? Math.round(formVolume * (dif / 100) * 100) / 100 : 0;

    const item: AcordoPrevioPrecoApa = {
      id: itemEdicao ? itemEdicao.id : '',
      empresaId: empresaAtiva.id,
      numeroProcessoRFB: formProcesso.trim(),
      tipoAcordo: formTipoAcordo,
      paisJurisdicaoVinculada: formPais.trim(),
      entidadeEstrangeiraVinculada: formEntidade.trim(),
      tipoTransacaoControlada: formTransacao,
      metodoEleito: formMetodo,
      pllIndicadorRentabilidade: formIndicador.trim(),
      intervaloArmLengthMin: Number(formMin),
      intervaloArmLengthMediana: Number(formMediana),
      intervaloArmLengthMax: Number(formMax),
      dataInicioVigencia: formDataInicio,
      dataFimVigencia: formDataFim,
      statusApa: formStatusApa,
      volumeAnualTransacionadoBRL: Number(formVolume),
      margemPraticadaEfetiva: Number(formMargemEfetiva),
      necessitaAjusteCompensatorio: precisaAjuste,
      valorAjusteCompensatorioBRL: valorAjuste,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: formObservacoes.trim()
    };

    dbService.salvarAcordoApa(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Confirma a exclusão deste acordo prévio de preços de transferência (APA)?')) {
      dbService.excluirAcordoApa(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarAjusteApaContabil(id);
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
        <title>Dossiê APA - Preços de Transferência - ${empresaAtiva.razaoSocial}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.4; padding: 20px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          .title { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 11pt; color: #444; margin: 3px 0 0; }
          .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .kpi-table td { padding: 10px; border: 1px solid #ccc; background: #f9f9f9; }
          .kpi-value { font-size: 13pt; font-weight: bold; color: #1a237e; }
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
          <div class="title">Dossiê e Relatório de Acordos Prévios de Preços de Transferência (APA)</div>
          <div class="subtitle">Advance Pricing Arrangements • Marco OCDE • Lei Federal nº 14.596/2023 • IN RFB nº 2.161/2023</div>
          <div class="subtitle" style="margin-top: 5px;"><strong>Empresa Habilitada:</strong> ${empresaAtiva.razaoSocial} • <strong>CNPJ:</strong> ${empresaAtiva.cnpj} • <strong>Exercício de Acompanhamento:</strong> ${anoFiltro}</div>
        </div>

        <table class="kpi-table">
          <tr>
            <td>
              <div>Acordos Vigentes Homologados</div>
              <div class="kpi-value">${resumo.totalAcordosVigentes} Acordos</div>
            </td>
            <td>
              <div>Volume Anual Transacionado</div>
              <div class="kpi-value">R$ ${resumo.totalVolumeTransacionadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
            <td>
              <div>Ajustes Compensatórios e-LALUR</div>
              <div class="kpi-value" style="color: ${resumo.totalAjustesCompensatoriosApurados > 0 ? '#b71c1c' : '#2e7d32'};">
                R$ ${resumo.totalAjustesCompensatoriosApurados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </td>
            <td>
              <div>Status de Conformidade Global</div>
              <div class="kpi-value" style="color: #0d47a1;">
                ${resumo.totalAjustesCompensatoriosApurados === 0 ? '100% ARM\'S LENGTH' : 'AJUSTE REQUERIDO'}
              </div>
            </td>
          </tr>
        </table>

        <h4>1. Painel de Acordos Prévios e Confronto com o Intervalo Interquartil Arm's Length</h4>
        <table class="data">
          <thead>
            <tr>
              <th>Processo RFB / Tipo</th>
              <th>Entidade Vinculada / Jurisdição</th>
              <th>Transação / Método</th>
              <th class="text-right">Intervalo (Min - Med - Max)</th>
              <th class="text-right">Margem Praticada</th>
              <th class="text-right">Volume (R$)</th>
              <th class="text-right">Ajuste Devido (R$)</th>
              <th>Status / Vigência</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.acordos.map(a => `
              <tr>
                <td><strong>${a.numeroProcessoRFB}</strong><br/><small>${a.tipoAcordo.replace(/_/g, ' ')}</small></td>
                <td><strong>${a.entidadeEstrangeiraVinculada}</strong><br/><small>${a.paisJurisdicaoVinculada}</small></td>
                <td>${a.tipoTransacaoControlada.replace(/_/g, ' ')}<br/><small>Método: ${a.metodoEleito.split('_')[0]}</small></td>
                <td class="text-right">${a.intervaloArmLengthMin.toFixed(1)}% - <strong>${a.intervaloArmLengthMediana.toFixed(1)}%</strong> - ${a.intervaloArmLengthMax.toFixed(1)}%</td>
                <td class="text-right" style="color: ${a.necessitaAjusteCompensatorio ? '#b71c1c' : '#2e7d32'}; font-weight: bold;">
                  ${a.margemPraticadaEfetiva.toFixed(2)}%
                </td>
                <td class="text-right">R$ ${a.volumeAnualTransacionadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right" style="color: ${a.valorAjusteCompensatorioBRL > 0 ? '#b71c1c' : '#111'}; font-weight: bold;">
                  R$ ${a.valorAjusteCompensatorioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td>${a.statusApa}<br/><small>${a.dataInicioVigencia} a ${a.dataFimVigencia}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h4>2. Enquadramento e Procedimento Amigável MAP (Diretrizes da OCDE)</h4>
        <p style="font-size: 9.5pt; text-align: justify; color: #333;">
          Os Acordos Prévios de Preços de Transferência (APA) formalizam, de forma vinculante entre o contribuinte e a Secretaria Especial da Receita Federal do Brasil (RFB) — e autoridades tributárias de outras jurisdições no caso de acordos bilaterais —, os critérios metodológicos de determinação dos preços de transferência para transações controladas futuras, eliminando contingências fiscais e riscos de dupla tributação internacional nos termos dos <strong>Arts. 38 a 41 da Lei nº 14.596/2023</strong>.
        </p>

        <div class="signature-box" style="margin-top: 50px;">
          <div class="sig-line">
            <strong>${empresaAtiva.razaoSocial}</strong><br/>
            Responsável Legal / Tax Director
          </div>
          <div class="sig-line">
            <strong>Perito Contábil / Auditor Independente</strong><br/>
            CRC Ativo e Certificado Digital
          </div>
        </div>

        <div class="footer">
          Documento emitido eletronicamente via ERP Contábil Studio Pro • Padrão OCDE / RFB • Módulo APA Transfer Pricing
        </div>
      </body>
      </html>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: `Dossiê APA - Preços de Transferência - ${empresaAtiva.razaoSocial}`,
        subtitulo: `Exercício ${anoFiltro} • Monitoramento do Intervalo Arm's Length e Ajustes LALUR`,
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

  const acordosFiltrados = (resumo?.acordos || []).filter(a => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      a.numeroProcessoRFB.toLowerCase().includes(term) ||
      a.entidadeEstrangeiraVinculada.toLowerCase().includes(term) ||
      a.paisJurisdicaoVinculada.toLowerCase().includes(term) ||
      a.metodoEleito.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              APA & Acordos Prévios de Preços de Transferência
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-800/80 rounded-full">
              Lei nº 14.596/2023 • IN RFB nº 2.161/2023 (Marco OCDE)
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Gestão de consultas de APA unilateral e bilateral (MAP), intervalo interquartil Arm's Length e apuração de ajustes compensatórios no e-LALUR/e-LACS.
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
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            Dossiê A4
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Acordo (APA)
          </button>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Acordos Homologados Vigentes</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {resumo?.totalAcordosVigentes || 0} Acordos
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Segurança jurídica contratual de 3 a 5 anos
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Volume Anual Transacionado</span>
            <Globe2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono">
            R$ {(resumo?.totalVolumeTransacionadoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Transações transfronteiriças sob termos de APA
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Ajustes Compensatórios e-LALUR</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">
            R$ {(resumo?.totalAjustesCompensatoriosApurados || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Adições no LALUR para retorno à mediana do intervalo
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-sky-900/40 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-sky-300">Conformidade Arm's Length</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono">
            {(() => {
              const total = resumo?.acordos.length || 0;
              const comAjuste = resumo?.acordos.filter(a => a.necessitaAjusteCompensatorio).length || 0;
              if (total === 0) return '100%';
              return `${Math.round(((total - comAjuste) / total) * 100)}% CONFORME`;
            })()}
          </div>
          <div className="text-[11px] text-sky-500/80 mt-1">
            Alinhamento estrito às Diretrizes da OCDE
          </div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex border-b border-neutral-800 space-x-1">
        <button
          onClick={() => setAbaAtiva('acordos')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'acordos'
              ? 'border-sky-500 text-sky-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Acordos Prévios Homologados (APA) ({resumo?.acordos?.length || 0})
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'simulador'
              ? 'border-sky-500 text-sky-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Simulador Interquartil & Ajuste Mediana
        </button>

        <button
          onClick={() => setAbaAtiva('diretrizes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'diretrizes'
              ? 'border-sky-500 text-sky-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Diretrizes OCDE & Lei nº 14.596/2023
        </button>
      </div>

      {/* CONTEÚDO DA ABA ACORDOS */}
      {abaAtiva === 'acordos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-[#1e1e1e] p-2.5 rounded border border-neutral-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por processo RFB, entidade vinculada, país ou método..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
              />
            </div>
            <div className="text-xs text-neutral-400">
              Mostrando <strong className="text-neutral-200">{acordosFiltrados.length}</strong> de {resumo?.acordos?.length || 0} acordos
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#262626] text-neutral-400 uppercase text-[10px] font-semibold tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3">Processo RFB / Tipo</th>
                  <th className="p-3">Entidade Vinculada / Jurisdição</th>
                  <th className="p-3">Transação / Método</th>
                  <th className="p-3 text-right">Intervalo (Min - Med - Max)</th>
                  <th className="p-3 text-right">Margem Praticada</th>
                  <th className="p-3 text-right">Volume (R$)</th>
                  <th className="p-3 text-right">Ajuste e-LALUR (R$)</th>
                  <th className="p-3">Status APA</th>
                  <th className="p-3 text-center">Contábil</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {acordosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-neutral-500 font-sans">
                      Nenhum acordo prévio (APA) registrado para o exercício {anoFiltro}.
                    </td>
                  </tr>
                ) : (
                  acordosFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                      <td className="p-3">
                        <div className="font-semibold text-white">{item.numeroProcessoRFB}</div>
                        <div className="text-[10px] text-neutral-400 font-sans">
                          {item.tipoAcordo === 'BILATERAL_MAP_OCDE' ? 'Bilateral MAP (OCDE)' : 'Unilateral RFB'}
                        </div>
                      </td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-neutral-200 truncate max-w-xs">{item.entidadeEstrangeiraVinculada}</div>
                        <div className="text-[10px] text-neutral-400">{item.paisJurisdicaoVinculada}</div>
                      </td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-sky-300 border border-neutral-700">
                          {item.metodoEleito.split('_')[0]}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5 truncate max-w-xs">
                          {item.pllIndicadorRentabilidade}
                        </div>
                      </td>
                      <td className="p-3 text-right text-neutral-300">
                        {item.intervaloArmLengthMin.toFixed(1)}% - <strong className="text-white">{item.intervaloArmLengthMediana.toFixed(1)}%</strong> - {item.intervaloArmLengthMax.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right font-bold">
                        <span className={item.necessitaAjusteCompensatorio ? 'text-red-400' : 'text-emerald-400'}>
                          {item.margemPraticadaEfetiva.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-white">
                        R$ {item.volumeAnualTransacionadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold">
                        {item.necessitaAjusteCompensatorio ? (
                          <span className="text-red-400">
                            R$ {item.valorAjusteCompensatorioBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-normal">Isento / Conforme</span>
                        )}
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.statusApa === 'HOMOLOGADO_VIGENTE'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {item.statusApa.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {item.dataInicioVigencia} a {item.dataFimVigencia}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {item.integradoContabil ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Integrado
                          </span>
                        ) : item.necessitaAjusteCompensatorio ? (
                          <button
                            onClick={() => handleIntegrarContabil(item.id)}
                            className="px-2 py-1 text-[11px] font-medium bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded transition font-sans"
                            title="Lançar Provisão de Ajuste Compensatório no Diário"
                          >
                            Integrar
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-500 font-sans">N/A</span>
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

      {/* CONTEÚDO DA ABA SIMULADOR */}
      {abaAtiva === 'simulador' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm border-b border-neutral-800 pb-2">
              <Calculator className="w-4 h-4" />
              Simulador do Intervalo Arm's Length e Ajuste à Mediana
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Volume Financeiro da Operação Controlada (R$)</label>
                <input
                  type="number"
                  value={simVolume}
                  onChange={e => setSimVolume(Number(e.target.value))}
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Mínimo (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simMin}
                    onChange={e => setSimMin(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Mediana (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simMediana}
                    onChange={e => setSimMediana(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Máximo (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simMax}
                    onChange={e => setSimMax(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Margem / Rentabilidade Praticada Efetivamente (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={simMargemPraticada}
                  onChange={e => setSimMargemPraticada(Number(e.target.value))}
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 font-semibold text-sm border-b border-neutral-800 pb-2">
                <FileCheck2 className="w-4 h-4 text-sky-400" />
                Diagnóstico de Ajuste Arm's Length (Lei nº 14.596/2023)
              </div>

              {(() => {
                const emConformidade = simMargemPraticada >= simMin && simMargemPraticada <= simMax;
                const dif = Math.abs(simMediana - simMargemPraticada);
                const valorAjuste = emConformidade ? 0 : simVolume * (dif / 100);

                return (
                  <div className="space-y-3 mt-4 text-xs">
                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400">Status no Intervalo Arm's Length:</span>
                      <span className={`font-bold ${emConformidade ? 'text-emerald-400' : 'text-red-400'}`}>
                        {emConformidade ? 'CONFORME (DENTRO DO INTERVALO)' : 'FORA DO INTERVALO (EXIGE AJUSTE)'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400">Ponto de Ajuste Determinado por Lei:</span>
                      <span className="font-bold font-mono text-white">
                        {emConformidade ? 'Nenhum' : `Mediana (${simMediana.toFixed(1)}%)`}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400">Desvio Percentual até a Mediana:</span>
                      <span className="font-bold font-mono text-neutral-200">
                        {emConformidade ? '0.0%' : `${dif.toFixed(2)}%`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-sky-950/40 border border-sky-800/60 p-3 rounded mt-2">
                      <span className="text-sm font-semibold text-sky-300">Ajuste Compensatório LALUR:</span>
                      <span className="text-xl font-bold font-mono text-sky-400">
                        R$ {valorAjuste.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-[11px] text-neutral-400 leading-relaxed">
              <strong className="text-white">Regra do Art. 39 da Lei 14.596/23:</strong> Se o indicador de rentabilidade praticado estiver fora do intervalo Arm's Length estabelecido no APA, a base de cálculo tributária brasileira será obrigatoriamente ajustada para o valor correspondente à <strong>mediana</strong> do intervalo.
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA DIRETRIZES */}
      {abaAtiva === 'diretrizes' && (
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-5 space-y-4 text-xs leading-relaxed text-neutral-300">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-neutral-800 pb-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            Marco Legal dos Acordos Prévios de Preços de Transferência (APA)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Globe2 className="w-4 h-4 text-sky-400" />
                1. Modalidades de APA (Lei 14.596/2023, Art. 38)
              </h3>
              <p className="text-neutral-400 text-justify">
                O contribuinte pode requerer processo de consulta específica perante a Cosit/RFB para celebração de <strong>APA Unilateral</strong> (com vigência perante o Fisco Brasileiro) ou <strong>APA Bilateral/Multilateral</strong> através do procedimento amigável (MAP) previsto nas Convenções para Evitar a Dupla Tributação internacional.
              </p>
            </div>

            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Landmark className="w-4 h-4 text-sky-400" />
                2. Vigência e Efeitos Vinculantes
              </h3>
              <p className="text-neutral-400 text-justify">
                O APA homologado possui eficácia vinculante por período de até <strong>5 anos</strong>, podendo ser prorrogado mediante pedido de renovação tempestivo. Enquanto vigorar, impede a autuação fiscal sobre os métodos e margens pré-acordados, desde que os fatos e hipóteses críticas permaneçam inalterados.
              </p>
            </div>
          </div>

          <div className="p-4 bg-sky-950/20 border border-sky-900/40 rounded space-y-2">
            <div className="font-semibold text-sky-300">Integração Contábil e Fiscal do Ajuste Compensatório:</div>
            <div className="font-mono text-[11px] text-neutral-300 space-y-1">
              <div><strong>1. No Livro Diário Geral (Societário):</strong></div>
              <div><strong>D:</strong> 3.2.1.80 - Despesa com Ajuste de Preço de Transferência (Resultado Operacional)</div>
              <div><strong>C:</strong> 2.1.8.40 - Provisão para Ajustes de Transfer Pricing / Partes Relacionadas (Passivo)</div>
              <div className="pt-1"><strong>2. Na Escrituração Contábil Fiscal (ECF / e-LALUR):</strong></div>
              <div><strong>Adição:</strong> Linha M030 - Ajuste positivo de preços de transferência decorrente de APA (Art. 39 Lei 14.596/23)</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR ACORDO APA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-neutral-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                {itemEdicao ? 'Editar Acordo Prévio (APA)' : 'Novo Acordo Prévio de Preços de Transferência (APA)'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Número do Processo RFB</label>
                  <input
                    type="text"
                    required
                    value={formProcesso}
                    onChange={e => setFormProcesso(e.target.value)}
                    placeholder="10380.720194/2026-10"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Tipo de Acordo</label>
                  <select
                    value={formTipoAcordo}
                    onChange={e => setFormTipoAcordo(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="BILATERAL_MAP_OCDE">BILATERAL MAP (CONVENÇÃO OCDE)</option>
                    <option value="UNILATERAL_RFB">UNILATERAL (RECEITA FEDERAL DO BRASIL)</option>
                    <option value="MULTILATERAL">MULTILATERAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Jurisdição / Autoridade Fiscal Vinculada</label>
                  <input
                    type="text"
                    required
                    value={formPais}
                    onChange={e => setFormPais(e.target.value)}
                    placeholder="ESTADOS UNIDOS (IRS)"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Entidade Estrangeira Vinculada</label>
                  <input
                    type="text"
                    required
                    value={formEntidade}
                    onChange={e => setFormEntidade(e.target.value)}
                    placeholder="Amil Global Technology LLC"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Tipo de Transação Controlada</label>
                  <select
                    value={formTransacao}
                    onChange={e => setFormTransacao(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="EXPORTACAO_PRODUTOS">EXPORTAÇÃO DE PRODUTOS</option>
                    <option value="IMPORTACAO_MATERIA_PRIMA">IMPORTAÇÃO DE MATÉRIA-PRIMA</option>
                    <option value="ROYALTIES_LICENCA">ROYALTIES E LICENCIAMENTO DE MARCAS</option>
                    <option value="SERVICOS_INTRAGRUPO">SERVIÇOS TÉCNICOS INTRAGRUPO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Método Eleito (OCDE)</label>
                  <select
                    value={formMetodo}
                    onChange={e => setFormMetodo(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="MLT_MARGEM_LIQUIDA_TRANSACAO">MLT - MARGEM LÍQUIDA DA TRANSAÇÃO</option>
                    <option value="PIC_PRECO_INDEPENDENTE_COMPARAVEL">PIC - PREÇO INDEPENDENTE COMPARÁVEL</option>
                    <option value="PRL_PRECO_REVENDA_MENOS_LUCRO">PRL - PREÇO DE REVENDA MENOS LUCRO</option>
                    <option value="MCL_CUSTO_MAIS_LUCRO">MCL - CUSTO MAIS LUCRO</option>
                    <option value="RLP_DIVISAO_LUCRO">DRL - DIVISÃO DE LUCRO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Indicador do Nível de Rentabilidade (PLL)</label>
                <input
                  type="text"
                  required
                  value={formIndicador}
                  onChange={e => setFormIndicador(e.target.value)}
                  placeholder="Margem Operacional Líquida s/ Vendas Líquidas (ROS)"
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#181818] p-3 rounded border border-neutral-800">
                <div>
                  <label className="block text-neutral-400 mb-1">Mínimo Arm's Length (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formMin}
                    onChange={e => setFormMin(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Mediana do Intervalo (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formMediana}
                    onChange={e => setFormMediana(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Máximo Arm's Length (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formMax}
                    onChange={e => setFormMax(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Data Início da Vigência</label>
                  <input
                    type="date"
                    required
                    value={formDataInicio}
                    onChange={e => setFormDataInicio(e.target.value)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Data Fim da Vigência</label>
                  <input
                    type="date"
                    required
                    value={formDataFim}
                    onChange={e => setFormDataFim(e.target.value)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Volume Anual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formVolume}
                    onChange={e => setFormVolume(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Margem Praticada (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formMargemEfetiva}
                    onChange={e => setFormMargemEfetiva(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status do Acordo</label>
                  <select
                    value={formStatusApa}
                    onChange={e => setFormStatusApa(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="HOMOLOGADO_VIGENTE">HOMOLOGADO E VIGENTE</option>
                    <option value="EM_NEGOCIACAO_RFB">EM NEGOCIAÇÃO NA RFB</option>
                    <option value="SOLICITADO_PROTOCOLO">SOLICITADO / EM ANÁLISE</option>
                    <option value="REVISAO_SOLICITADA">REVISÃO SOLICITADA</option>
                    <option value="EXPIRADO">EXPIRADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Observações Técnicas e Hipóteses Críticas</label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={e => setFormObservacoes(e.target.value)}
                  placeholder="Detalhamento das hipóteses críticas, ajustes de comparabilidade e parecer do Fisco..."
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-sky-500 focus:outline-none"
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
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded transition font-semibold shadow-sm"
                >
                  Salvar Acordo APA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ApaPrecosTransferenciaModule;
