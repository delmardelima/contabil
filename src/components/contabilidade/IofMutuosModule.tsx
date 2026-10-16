import React, { useState, useEffect } from 'react';
import {
  Coins,
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
  Building2,
  UserCheck,
  Clock,
  Landmark
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  ContratoMutuoIntercompany,
  ResumoIofMutuos,
  TipoTomadorMutuo,
  ModalidadeMutuo
} from '../../types/contabil';

interface IofMutuosModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const IofMutuosModule: React.FC<IofMutuosModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoIofMutuos | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'contratos' | 'calculadora' | 'legislacao'>('contratos');
  const [busca, setBusca] = useState('');

  // Modal de cadastro/edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ContratoMutuoIntercompany | null>(null);

  // Campos do formulário
  const [formContrato, setFormContrato] = useState('MUT-2026/004');
  const [formMutuante, setFormMutuante] = useState('');
  const [formMutuario, setFormMutuario] = useState('FILIAL SP INDÚSTRIA LTDA');
  const [formTipoTomador, setFormTipoTomador] = useState<TipoTomadorMutuo>('PESSOA_JURIDICA_CONTROLADA');
  const [formModalidade, setFormModalidade] = useState<ModalidadeMutuo>('VALOR_FIXO_VENCIMENTO_CERTO');
  const [formDataLibera, setFormDataLibera] = useState('2026-03-01');
  const [formDataVencimento, setFormDataVencimento] = useState('2026-09-01');
  const [formPrazoDias, setFormPrazoDias] = useState<number>(184);
  const [formPrincipal, setFormPrincipal] = useState<number>(300000);
  const [formTaxaJuros, setFormTaxaJuros] = useState<number>(10.75);
  const [formStatusDarf, setFormStatusDarf] = useState<'PENDENTE' | 'RECOLHIDO'>('PENDENTE');
  const [formObservacoes, setFormObservacoes] = useState('');

  // Calculadora Rápida
  const [calcPrincipal, setCalcPrincipal] = useState<number>(500000);
  const [calcTipoTomador, setCalcTipoTomador] = useState<'PJ' | 'PF'>('PJ');
  const [calcDias, setCalcDias] = useState<number>(180);

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getIofMutuos(empresaAtiva.id, anoFiltro);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormContrato(`MUT-2026/00${(resumo?.contratos.length || 0) + 1}`);
    setFormMutuante(`${empresaAtiva?.cnpj || '12.345.678/0001-90'} - ${empresaAtiva?.razaoSocial || 'EMPRESA MATRIZ'}`);
    setFormMutuario('AMIL FILIAL COMPONENTES LTDA');
    setFormTipoTomador('PESSOA_JURIDICA_CONTROLADA');
    setFormModalidade('VALOR_FIXO_VENCIMENTO_CERTO');
    setFormDataLibera(new Date().toISOString().split('T')[0]);
    setFormDataVencimento('2026-10-31');
    setFormPrazoDias(214);
    setFormPrincipal(400000);
    setFormTaxaJuros(11.0);
    setFormStatusDarf('PENDENTE');
    setFormObservacoes('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item: ContratoMutuoIntercompany) => {
    setItemEdicao(item);
    setFormContrato(item.numeroContrato);
    setFormMutuante(item.mutuanteCnpjRazao);
    setFormMutuario(item.mutuarioNomeCnpjCpf);
    setFormTipoTomador(item.tipoTomador);
    setFormModalidade(item.modalidade);
    setFormDataLibera(item.dataContratoLibera);
    setFormDataVencimento(item.dataVencimentoFinal);
    setFormPrazoDias(item.prazoDiasTotal);
    setFormPrincipal(item.valorPrincipalMutuo);
    setFormTaxaJuros(item.taxaJurosPactuadaAno);
    setFormStatusDarf(item.statusDarf);
    setFormObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    // Calcular dias automaticamente
    const d1 = new Date(formDataLibera);
    const d2 = new Date(formDataVencimento);
    const diff = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));

    const aliqDiaria = (formTipoTomador === 'SOCIO_PESSOA_FISICA' || formTipoTomador === 'DIRETOR_PESSOA_FISICA') ? 0.0082 : 0.0041;
    const aliqAdicional = 0.38;
    const diasCalc = Math.min(diff, 365);
    const iofAdicional = Math.round(formPrincipal * (aliqAdicional / 100) * 100) / 100;
    const iofDiario = Math.round(formPrincipal * (aliqDiaria / 100) * diasCalc * 100) / 100;

    const item: ContratoMutuoIntercompany = {
      id: itemEdicao ? itemEdicao.id : '',
      empresaId: empresaAtiva.id,
      numeroContrato: formContrato.trim(),
      mutuanteCnpjRazao: formMutuante.trim() || `${empresaAtiva.cnpj} - ${empresaAtiva.razaoSocial}`,
      mutuarioNomeCnpjCpf: formMutuario.trim(),
      tipoTomador: formTipoTomador,
      modalidade: formModalidade,
      dataContratoLibera: formDataLibera,
      dataVencimentoFinal: formDataVencimento,
      prazoDiasTotal: diff,
      valorPrincipalMutuo: Number(formPrincipal),
      taxaJurosPactuadaAno: Number(formTaxaJuros),
      aliquotaIofDiaria: aliqDiaria,
      aliquotaIofAdicional: aliqAdicional,
      valorIofDiarioTotal: iofDiario,
      valorIofAdicionalTotal: iofAdicional,
      valorTotalIofDevido: Math.round((iofAdicional + iofDiario) * 100) / 100,
      codigoReceitaDarf: '1150',
      dataVencimentoDarf: '2026-04-20',
      statusDarf: formStatusDarf,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: formObservacoes.trim()
    };

    dbService.salvarContratoMutuo(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Confirma a exclusão deste contrato de mútuo e cálculo de IOF?')) {
      dbService.excluirContratoMutuo(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarIofMutuoContabil(id);
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
        <title>Demonstrativo de IOF sobre Mútuos - ${empresaAtiva.razaoSocial}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.4; padding: 20px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          .title { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 11pt; color: #444; margin: 3px 0 0; }
          .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .kpi-table td { padding: 10px; border: 1px solid #ccc; background: #f9f9f9; }
          .kpi-value { font-size: 13pt; font-weight: bold; color: #004d40; }
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
          <div class="title">Demonstrativo e Memória de Cálculo do IOF sobre Operações de Crédito (Mútuo)</div>
          <div class="subtitle">Mútuos Intercompany e Partes Relacionadas • Decreto nº 6.306/2007 (RIOF) • Lei nº 9.779/1999 (Art. 13)</div>
          <div class="subtitle" style="margin-top: 5px;"><strong>Mutuante / Empresa Responsável:</strong> ${empresaAtiva.razaoSocial} • <strong>CNPJ:</strong> ${empresaAtiva.cnpj} • <strong>Exercício:</strong> ${anoFiltro}</div>
        </div>

        <table class="kpi-table">
          <tr>
            <td>
              <div>Volume Principal Mútuos</div>
              <div class="kpi-value">R$ ${resumo.totalPrincipalMutuado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
            <td>
              <div>IOF Adicional (0,38% Flat)</div>
              <div class="kpi-value">R$ ${resumo.totalIofAdicional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
            <td>
              <div>IOF Diário (0,0041% / 0,0082%)</div>
              <div class="kpi-value">R$ ${resumo.totalIofDiario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
            <td>
              <div>Total IOF Devido (DARF 1150)</div>
              <div class="kpi-value" style="color: #b71c1c;">R$ ${resumo.totalIofDevidoDarf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
          </tr>
        </table>

        <h4>1. Relação de Contratos de Mútuo e Discriminação do Imposto Retido</h4>
        <table class="data">
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Tomador / Mutuário</th>
              <th>Tipo Tomador</th>
              <th>Liberação</th>
              <th>Vencimento</th>
              <th class="text-right">Prazo Dias</th>
              <th class="text-right">Principal (R$)</th>
              <th class="text-right">IOF Adic (R$)</th>
              <th class="text-right">IOF Diário (R$)</th>
              <th class="text-right">Total IOF (R$)</th>
              <th>DARF / Status</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.contratos.map(c => `
              <tr>
                <td><strong>${c.numeroContrato}</strong></td>
                <td>${c.mutuarioNomeCnpjCpf}</td>
                <td>${c.tipoTomador.replace(/_/g, ' ')}</td>
                <td>${c.dataContratoLibera}</td>
                <td>${c.dataVencimentoFinal}</td>
                <td class="text-right">${c.prazoDiasTotal} dias</td>
                <td class="text-right">R$ ${c.valorPrincipalMutuo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">R$ ${c.valorIofAdicionalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">R$ ${c.valorIofDiarioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right"><strong>R$ ${c.valorTotalIofDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                <td>${c.codigoReceitaDarf} - ${c.statusDarf}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h4>2. Enquadramento Legal e Responsabilidade da Mutuante</h4>
        <p style="font-size: 9.5pt; text-align: justify; color: #333;">
          Conforme dispõe o <strong>Art. 13 da Lei nº 9.779/1999</strong> e Arts. 7º e 8º do <strong>Decreto nº 6.306/2007 (RIOF)</strong>, as operações de crédito realizadas entre pessoas jurídicas ou entre pessoa jurídica e pessoa física sujeitam-se à incidência do IOF sobre operações de crédito, cabendo à pessoa jurídica mutuante a responsabilidade tributária exclusiva pela retenção e pelo recolhimento do imposto aos cofres públicos federais através do <strong>Código de Receita DARF 1150</strong>.
        </p>

        <div class="signature-box" style="margin-top: 50px;">
          <div class="sig-line">
            <strong>${empresaAtiva.razaoSocial}</strong><br/>
            Diretoria Financeira / Mutuante
          </div>
          <div class="sig-line">
            <strong>Contador Responsável</strong><br/>
            CRC Ativo e Certificado Digital
          </div>
        </div>

        <div class="footer">
          Documento extraído eletronicamente via ERP Contábil Studio Pro • Certificação Digital ICP-Brasil • Módulo IOF Mútuos Intercompany
        </div>
      </body>
      </html>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: `Demonstrativo IOF Mútuos - ${empresaAtiva.razaoSocial}`,
        subtitulo: `Exercício ${anoFiltro} • Apuração do IOF Crédito (DARF 1150)`,
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

  const contratosFiltrados = (resumo?.contratos || []).filter(c => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      c.numeroContrato.toLowerCase().includes(term) ||
      c.mutuarioNomeCnpjCpf.toLowerCase().includes(term) ||
      c.mutuanteCnpjRazao.toLowerCase().includes(term) ||
      c.codigoReceitaDarf.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              IOF sobre Mútuos Intercompany & Operações de Crédito
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80 rounded-full">
              Dec. nº 6.306/2007 (RIOF) • Lei nº 9.779/1999 Art. 13
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Gestão de contratos de mútuo entre coligadas, controladas e sócios, apuração de alíquotas diária e adicional, e emissão de DARF 1150.
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
              <option value={2024} className="bg-[#1e1e1e]">Exercício 2024</option>
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
            title="Imprimir Demonstrativo A4"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Laudo A4
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Contrato de Mútuo
          </button>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Volume Principal Mutuado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            R$ {(resumo?.totalPrincipalMutuado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Total de recursos concedidos em mútuo financeiro
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">IOF Adicional (0,38% Flat)</span>
            <Calculator className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono">
            R$ {(resumo?.totalIofAdicional || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Incidência única na disponibilização dos recursos
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">IOF Diário (Pro Rata Die)</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-400 font-mono">
            R$ {(resumo?.totalIofDiario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            0,0041% (PJ) ou 0,0082% (PF) limitado a 365 dias
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-amber-900/40 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-amber-300">Total IOF Devido (DARF 1150)</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            R$ {(resumo?.totalIofDevidoDarf || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-1">
            Retenção na fonte compulsória pela mutuante
          </div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex border-b border-neutral-800 space-x-1">
        <button
          onClick={() => setAbaAtiva('contratos')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'contratos'
              ? 'border-amber-500 text-amber-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Contratos de Mútuo & IOF ({resumo?.contratos?.length || 0})
        </button>

        <button
          onClick={() => setAbaAtiva('calculadora')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'calculadora'
              ? 'border-amber-500 text-amber-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Calculadora Rápida RIOF
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'legislacao'
              ? 'border-amber-500 text-amber-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Regras de Retenção & DARF 1150
        </button>
      </div>

      {/* CONTEÚDO DA ABA CONTRATOS */}
      {abaAtiva === 'contratos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-[#1e1e1e] p-2.5 rounded border border-neutral-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por contrato, tomador, mutuante ou DARF..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
              />
            </div>
            <div className="text-xs text-neutral-400">
              Mostrando <strong className="text-neutral-200">{contratosFiltrados.length}</strong> de {resumo?.contratos?.length || 0} contratos
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#262626] text-neutral-400 uppercase text-[10px] font-semibold tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3">Contrato / Datas</th>
                  <th className="p-3">Tomador / Mutuário</th>
                  <th className="p-3">Tipo / Modalidade</th>
                  <th className="p-3 text-right">Prazo</th>
                  <th className="p-3 text-right">Principal (R$)</th>
                  <th className="p-3 text-right">Juros a.a.</th>
                  <th className="p-3 text-right">IOF Adic. (R$)</th>
                  <th className="p-3 text-right">IOF Diário (R$)</th>
                  <th className="p-3 text-right">Total IOF (R$)</th>
                  <th className="p-3">DARF / Status</th>
                  <th className="p-3 text-center">Contábil</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {contratosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-center text-neutral-500 font-sans">
                      Nenhum contrato de mútuo registrado para este exercício.
                    </td>
                  </tr>
                ) : (
                  contratosFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                      <td className="p-3">
                        <div className="font-semibold text-white">{item.numeroContrato}</div>
                        <div className="text-[11px] text-neutral-400 font-sans">{item.dataContratoLibera} a {item.dataVencimentoFinal}</div>
                      </td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-neutral-200 truncate max-w-xs">{item.mutuarioNomeCnpjCpf}</div>
                        <div className="text-[10px] text-neutral-500">Mutuante: {item.mutuanteCnpjRazao.split('-')[0]}</div>
                      </td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {item.tipoTomador.replace('PESSOA_JURIDICA_', 'PJ ').replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {item.modalidade === 'VALOR_FIXO_VENCIMENTO_CERTO' ? 'Vencimento Certo' : 'C/C Rotativo'}
                        </div>
                      </td>
                      <td className="p-3 text-right text-neutral-300">
                        {item.prazoDiasTotal} d
                      </td>
                      <td className="p-3 text-right font-semibold text-white">
                        R$ {item.valorPrincipalMutuo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-neutral-300">
                        {item.taxaJurosPactuadaAno.toFixed(2)}%
                      </td>
                      <td className="p-3 text-right text-sky-400">
                        R$ {item.valorIofAdicionalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-teal-400">
                        R$ {item.valorIofDiarioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-amber-400">
                        R$ {item.valorTotalIofDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.statusDarf === 'RECOLHIDO'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {item.statusDarf}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          DARF {item.codigoReceitaDarf} • Venc: {item.dataVencimentoDarf}
                        </div>
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
                            className="px-2 py-1 text-[11px] font-medium bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded transition font-sans"
                            title="Lançar mútuo e retenção de IOF na Contabilidade Geral"
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

      {/* CONTEÚDO DA ABA CALCULADORA */}
      {abaAtiva === 'calculadora' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm border-b border-neutral-800 pb-2">
              <Calculator className="w-4 h-4" />
              Calculadora de IOF Crédito - RIOF Decreto nº 6.306/2007
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Valor do Principal do Mútuo (R$)</label>
                <input
                  type="number"
                  value={calcPrincipal}
                  onChange={e => setCalcPrincipal(Number(e.target.value))}
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Natureza do Mutuário (Tomador dos Recursos)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcTipoTomador('PJ')}
                    className={`p-2 rounded border text-xs font-medium transition ${
                      calcTipoTomador === 'PJ'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                        : 'bg-[#262626] border-neutral-700 text-neutral-400'
                    }`}
                  >
                    Pessoa Jurídica (0,0041% ao dia)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcTipoTomador('PF')}
                    className={`p-2 rounded border text-xs font-medium transition ${
                      calcTipoTomador === 'PF'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                        : 'bg-[#262626] border-neutral-700 text-neutral-400'
                    }`}
                  >
                    Pessoa Física / Sócio (0,0082% ao dia)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Prazo da Operação de Mútuo (Dias Corridos)</label>
                <input
                  type="number"
                  value={calcDias}
                  onChange={e => setCalcDias(Number(e.target.value))}
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  Art. 7º, § 1º do RIOF: Alíquota diária cessa após 365 dias (máximo de 1,5% a.a. para PJ ou 3,0% a.a. para PF).
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 font-semibold text-sm border-b border-neutral-800 pb-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Demonstrativo Analítico do IOF Devido
              </div>

              {(() => {
                const aliqDiaria = calcTipoTomador === 'PF' ? 0.0082 : 0.0041;
                const aliqAdic = 0.38;
                const diasEfetivos = Math.min(calcDias, 365);
                const valorAdic = calcPrincipal * (aliqAdic / 100);
                const valorDiario = calcPrincipal * (aliqDiaria / 100) * diasEfetivos;
                const totalDevido = valorAdic + valorDiario;

                return (
                  <div className="space-y-3 mt-4 text-xs">
                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400">Alíquota Adicional de IOF (0,38% Flat):</span>
                      <span className="font-bold font-mono text-sky-400">
                        R$ {valorAdic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400">
                        Alíquota Diária ({aliqDiaria.toFixed(4)}% x {diasEfetivos} dias):
                      </span>
                      <span className="font-bold font-mono text-teal-400">
                        R$ {valorDiario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400">Alíquota Efetiva Total:</span>
                      <span className="font-bold font-mono text-neutral-200">
                        {((totalDevido / calcPrincipal) * 100).toFixed(4)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-amber-950/40 border border-amber-800/60 p-3 rounded mt-2">
                      <span className="text-sm font-semibold text-amber-300">Total IOF a Recolher:</span>
                      <span className="text-xl font-bold font-mono text-amber-400">
                        R$ {totalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-[11px] text-neutral-400 leading-relaxed">
              <strong className="text-white">Código de Receita DARF:</strong> O imposto deve ser recolhido sob o código <strong>1150</strong> (IOF - Operações de Crédito - PJ) até o 3º dia útil do decêndio subsequente ao da disponibilização dos recursos financeiros ao mutuário.
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA LEGISLAÇÃO */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-5 space-y-4 text-xs leading-relaxed text-neutral-300">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-neutral-800 pb-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Regulamento do IOF sobre Operações de Crédito (Mútuos)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Scale className="w-4 h-4 text-amber-400" />
                1. Incidência Compulsória (Lei nº 9.779/1999, Art. 13)
              </h3>
              <p className="text-neutral-400 text-justify">
                As operações de crédito correspondentes a mútuo de recursos financeiros entre pessoas jurídicas ou entre pessoa jurídica e pessoa física sujeitam-se à incidência do IOF segundo as mesmas normas aplicáveis às operações de financiamento e empréstimos concedidos por instituições financeiras.
              </p>
            </div>

            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Landmark className="w-4 h-4 text-amber-400" />
                2. Responsabilidade Tributária e Prazo de Vencimento
              </h3>
              <p className="text-neutral-400 text-justify">
                A pessoa jurídica que concede o mútuo (mutuante) é legalmente responsável pela retenção e pelo recolhimento do IOF aos cofres públicos. O prazo legal para pagamento do DARF é o <strong>3º dia útil do decêndio subsequente</strong> àquele em que ocorreu o fato gerador (disponibilização do numerário).
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded space-y-2">
            <div className="font-semibold text-amber-300">Estrutura de Partidas Dobradas Contábeis (CFC):</div>
            <div className="font-mono text-[11px] text-neutral-300 space-y-1">
              <div><strong>1. Liberação do Mútuo:</strong></div>
              <div><strong>D:</strong> 1.1.2.05 - Mútuos a Receber de Partes Relacionadas (Ativo Circulante / RLP)</div>
              <div><strong>C:</strong> 1.1.1.02 - Bancos Conta Movimento (Ativo Circulante)</div>
              <div className="pt-1"><strong>2. Retenção do IOF a Recolher:</strong></div>
              <div><strong>D:</strong> 1.1.2.05 - Mútuos a Receber - Reembolso IOF Mutuário</div>
              <div><strong>C:</strong> 2.1.2.08 - IOF Retido a Recolher (Passivo Circulante - DARF 1150)</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR MÚTUO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-neutral-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                {itemEdicao ? 'Editar Contrato de Mútuo' : 'Novo Contrato de Mútuo Intercompany'}
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
                  <label className="block text-neutral-400 mb-1">Número do Contrato</label>
                  <input
                    type="text"
                    required
                    value={formContrato}
                    onChange={e => setFormContrato(e.target.value)}
                    placeholder="MUT-2026/001"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Empresa Mutuante (Concedente)</label>
                  <input
                    type="text"
                    required
                    value={formMutuante}
                    onChange={e => setFormMutuante(e.target.value)}
                    placeholder="CNPJ e Razão Social da Mutuante"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Mutuário (Tomador dos Recursos / Favorecido)</label>
                <input
                  type="text"
                  required
                  value={formMutuario}
                  onChange={e => setFormMutuario(e.target.value)}
                  placeholder="Nome/Razão Social e CPF/CNPJ do Tomador"
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Tipo de Tomador</label>
                  <select
                    value={formTipoTomador}
                    onChange={e => setFormTipoTomador(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="PESSOA_JURIDICA_CONTROLADA">PJ CONTROLADA (0,0041% ao dia)</option>
                    <option value="PESSOA_JURIDICA_COLIGADA">PJ COLIGADA (0,0041% ao dia)</option>
                    <option value="SOCIO_PESSOA_FISICA">SÓCIO PESSOA FÍSICA (0,0082% ao dia)</option>
                    <option value="DIRETOR_PESSOA_FISICA">DIRETOR PESSOA FÍSICA (0,0082% ao dia)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Modalidade do Mútuo</label>
                  <select
                    value={formModalidade}
                    onChange={e => setFormModalidade(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="VALOR_FIXO_VENCIMENTO_CERTO">VALOR FIXO COM VENCIMENTO DETERMINADO</option>
                    <option value="CONTA_CORRENTE_ROTATIVO_SALDO_VARIAVEL">CONTA CORRENTE ROTATIVO (SALDO VARIÁVEL)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#181818] p-3 rounded border border-neutral-800">
                <div>
                  <label className="block text-neutral-400 mb-1">Data da Liberação</label>
                  <input
                    type="date"
                    required
                    value={formDataLibera}
                    onChange={e => setFormDataLibera(e.target.value)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={formDataVencimento}
                    onChange={e => setFormDataVencimento(e.target.value)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Juros Pactuados (% a.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formTaxaJuros}
                    onChange={e => setFormTaxaJuros(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Valor Principal Concedido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrincipal}
                    onChange={e => setFormPrincipal(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status do DARF 1150</label>
                  <select
                    value={formStatusDarf}
                    onChange={e => setFormStatusDarf(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="PENDENTE">PENDENTE DE RECOLHIMENTO</option>
                    <option value="RECOLHIDO">RECOLHIDO AOS COFRES PÚBLICOS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Observações do Mútuo / Garantias</label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={e => setFormObservacoes(e.target.value)}
                  placeholder="Informações adicionais de garantias reais, finalidade e condições contratuais..."
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-amber-500 focus:outline-none"
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition font-semibold shadow-sm"
                >
                  Salvar Mútuo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default IofMutuosModule;
