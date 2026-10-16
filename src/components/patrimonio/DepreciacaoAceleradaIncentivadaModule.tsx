import React, { useState, useEffect } from 'react';
import {
  Factory,
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
  FileCheck2,
  Boxes,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  Empresa,
  BemDepreciacaoAcelerada,
  ResumoDepreciacaoAcelerada,
  CategoriaBemIncentivado
} from '../../types/contabil';

interface DepreciacaoAceleradaIncentivadaModuleProps {
  empresaAtiva: Empresa | null;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudoHtml: string;
    imprimirDireto?: boolean;
  }) => void;
}

export const DepreciacaoAceleradaIncentivadaModule: React.FC<DepreciacaoAceleradaIncentivadaModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [resumo, setResumo] = useState<ResumoDepreciacaoAcelerada | null>(null);
  const [anoFiltro, setAnoFiltro] = useState<number>(2026);
  const [abaAtiva, setAbaAtiva] = useState<'ativos' | 'confronto' | 'legislacao'>('ativos');
  const [busca, setBusca] = useState('');

  // Modal formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<BemDepreciacaoAcelerada | null>(null);

  // Campos do formulário
  const [formTombo, setFormTombo] = useState('MAQ-2026-005');
  const [formDescricao, setFormDescricao] = useState('Prensa Dobradeira CNC Hidráulica TruBend 5170');
  const [formCategoria, setFormCategoria] = useState<CategoriaBemIncentivado>('MAQUINAS_FABRIS_PRODUCAO');
  const [formDataAquisicao, setFormDataAquisicao] = useState('2026-02-15');
  const [formDataInstalacao, setFormDataInstalacao] = useState('2026-03-01');
  const [formNfe, setFormNfe] = useState('012480');
  const [formChaveNfe, setFormChaveNfe] = useState('');
  const [formValorAquisicao, setFormValorAquisicao] = useState<number>(950000);
  const [formVidaUtilAnos, setFormVidaUtilAnos] = useState<number>(10);
  const [formTaxaAnual, setFormTaxaAnual] = useState<number>(10.0);
  const [formAnoInstalacao, setFormAnoInstalacao] = useState<number>(2026);
  const [formStatus, setFormStatus] = useState<'EM_DEPRECIACAO_ACELERADA' | 'TOTALMENTE_DEPRECIADO_FISCAL' | 'BAIXADO'>('EM_DEPRECIACAO_ACELERADA');
  const [formObservacoes, setFormObservacoes] = useState('');

  const carregarDados = () => {
    if (!empresaAtiva) return;
    const res = dbService.getBensDepreciacaoAcelerada(empresaAtiva.id, anoFiltro);
    setResumo(res);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva, anoFiltro]);

  const abrirModalNovo = () => {
    setItemEdicao(null);
    setFormTombo(`MAQ-2026-00${(resumo?.bens.length || 0) + 1}`);
    setFormDescricao('Máquina Injetora de Plásticos Elétrica Fanuc Roboshot');
    setFormCategoria('MAQUINAS_FABRIS_PRODUCAO');
    setFormDataAquisicao(new Date().toISOString().split('T')[0]);
    setFormDataInstalacao(new Date().toISOString().split('T')[0]);
    setFormNfe('012550');
    setFormChaveNfe('');
    setFormValorAquisicao(780000);
    setFormVidaUtilAnos(10);
    setFormTaxaAnual(10.0);
    setFormAnoInstalacao(2026);
    setFormStatus('EM_DEPRECIACAO_ACELERADA');
    setFormObservacoes('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item: BemDepreciacaoAcelerada) => {
    setItemEdicao(item);
    setFormTombo(item.numeroPatrimonioTombo);
    setFormDescricao(item.descricaoBem);
    setFormCategoria(item.categoria);
    setFormDataAquisicao(item.dataAquisicao);
    setFormDataInstalacao(item.dataInstalacaoDisponibilizacao);
    setFormNfe(item.numeroNotaFiscal);
    setFormChaveNfe(item.chaveNfe);
    setFormValorAquisicao(item.valorAquisicaoOriginal);
    setFormVidaUtilAnos(item.vidaUtilSocietariaAnos);
    setFormTaxaAnual(item.taxaDepreciacaoSocietariaAnual);
    setFormAnoInstalacao(item.anoInstalacao);
    setFormStatus(item.statusDepreciacao);
    setFormObservacoes(item.observacoes || '');
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const custo = Number(formValorAquisicao);
    const taxaSoc = Number(formTaxaAnual);
    const deprecSocAno = Math.round(custo * (taxaSoc / 100) * 100) / 100;
    const deprecFiscalAno = Math.round(custo * 0.50 * 100) / 100;

    const item: BemDepreciacaoAcelerada = {
      id: itemEdicao ? itemEdicao.id : '',
      empresaId: empresaAtiva.id,
      numeroPatrimonioTombo: formTombo.trim(),
      descricaoBem: formDescricao.trim(),
      categoria: formCategoria,
      dataAquisicao: formDataAquisicao,
      dataInstalacaoDisponibilizacao: formDataInstalacao,
      numeroNotaFiscal: formNfe.trim(),
      chaveNfe: formChaveNfe.trim() || `352601${empresaAtiva.cnpj.replace(/\D/g, '')}55001000${formNfe}1000`,
      valorAquisicaoOriginal: custo,
      vidaUtilSocietariaAnos: Number(formVidaUtilAnos),
      taxaDepreciacaoSocietariaAnual: taxaSoc,
      depreciacaoSocietariaAcumulada: itemEdicao ? itemEdicao.depreciacaoSocietariaAcumulada : deprecSocAno,
      depreciacaoFiscalAceleradaAcumulada: deprecFiscalAno,
      exclusaoParteALalurPeriodo: Math.max(0, Math.round((deprecFiscalAno - deprecSocAno) * 100) / 100),
      adicaoParteALalurFutura: 0,
      saldoParteBContaLalur: Math.round((deprecFiscalAno - deprecSocAno) * 100) / 100,
      anoInstalacao: Number(formAnoInstalacao),
      statusDepreciacao: formStatus,
      integradoContabil: itemEdicao ? itemEdicao.integradoContabil : false,
      observacoes: formObservacoes.trim()
    };

    dbService.salvarBemDepreciacaoAcelerada(item);
    setIsModalOpen(false);
    carregarDados();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Confirma a exclusão deste ativo com depreciação acelerada?')) {
      dbService.excluirBemDepreciacaoAcelerada(id);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarDepreciacaoAceleradaLalur(id);
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
        <title>Laudo de Depreciação Acelerada - ${empresaAtiva.razaoSocial}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.4; padding: 20px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          .title { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 11pt; color: #444; margin: 3px 0 0; }
          .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .kpi-table td { padding: 10px; border: 1px solid #ccc; background: #f9f9f9; }
          .kpi-value { font-size: 13pt; font-weight: bold; color: #0d47a1; }
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
          <div class="title">Demonstrativo e Laudo de Depreciação Acelerada Incentivada</div>
          <div class="subtitle">Bens de Capital Novos para Modernização Fabril • Lei Federal nº 14.871/2024 • Decreto nº 12.175/2024</div>
          <div class="subtitle" style="margin-top: 5px;"><strong>Empresa Contribuinte:</strong> ${empresaAtiva.razaoSocial} • <strong>CNPJ:</strong> ${empresaAtiva.cnpj} • <strong>Exercício Base:</strong> ${anoFiltro}</div>
        </div>

        <table class="kpi-table">
          <tr>
            <td>
              <div>Total de Bens Habilitados</div>
              <div class="kpi-value">${resumo.totalBensHabilitados} Máquinas</div>
            </td>
            <td>
              <div>Custo Total de Aquisição</div>
              <div class="kpi-value">R$ ${resumo.totalCustoAquisicaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
            <td>
              <div>Exclusão Líquida no LALUR (Parte A)</div>
              <div class="kpi-value" style="color: #2e7d32;">R$ ${resumo.totalExclusaoLalurPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
            <td>
              <div>Saldo em Conta LALUR (Parte B)</div>
              <div class="kpi-value" style="color: #c2185b;">R$ ${resumo.totalSaldoParteBLalur.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </td>
          </tr>
        </table>

        <h4>1. Quadro Analítico de Bens, Quotas Fiscais e Conciliação LALUR / CPC 27</h4>
        <table class="data">
          <thead>
            <tr>
              <th>Tombo / Descrição</th>
              <th>Categoria / NF-e</th>
              <th>Instalação</th>
              <th class="text-right">Custo Aquisição (R$)</th>
              <th class="text-right">Deprec. Societária</th>
              <th class="text-right">Deprec. Fiscal (50%)</th>
              <th class="text-right">Exclusão Parte A (R$)</th>
              <th class="text-right">Saldo Parte B (R$)</th>
              <th>Status Fiscal</th>
            </tr>
          </thead>
          <tbody>
            ${resumo.bens.map(b => `
              <tr>
                <td><strong>${b.numeroPatrimonioTombo}</strong><br/>${b.descricaoBem}</td>
                <td>${b.categoria.replace(/_/g, ' ')}<br/><small>NF: ${b.numeroNotaFiscal}</small></td>
                <td>${b.dataInstalacaoDisponibilizacao}</td>
                <td class="text-right">R$ ${b.valorAquisicaoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">R$ ${b.depreciacaoSocietariaAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">R$ ${b.depreciacaoFiscalAceleradaAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="text-right" style="color: #2e7d32; font-weight: bold;">
                  R$ ${b.exclusaoParteALalurPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td class="text-right">R$ ${b.saldoParteBContaLalur.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>${b.statusDepreciacao.replace(/_/g, ' ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h4>2. Enquadramento Legal e Tratamento Tributário</h4>
        <p style="font-size: 9.5pt; text-align: justify; color: #333;">
          A Lei nº 14.871/2024 e o Decreto nº 12.175/2024 autorizam a dedução acelerada das quotas de depreciação fiscal de máquinas e equipamentos novos adquiridos a partir de 2024, à razão de <strong>50% no ano de instalação</strong> e <strong>50% no ano subsequente</strong>. Na escrituração societária (CPC 27), os bens continuam sendo depreciados pela vida útil econômica real, sendo a diferença controlada compulsoriamente na <strong>Parte B do e-LALUR/e-LACS</strong> para futura adição ao Lucro Real quando a depreciação fiscal se exaurir.
        </p>

        <div class="signature-box" style="margin-top: 50px;">
          <div class="sig-line">
            <strong>${empresaAtiva.razaoSocial}</strong><br/>
            Diretoria Industrial / Patrimonial
          </div>
          <div class="sig-line">
            <strong>Contador Responsável</strong><br/>
            CRC Ativo e Certificado Digital
          </div>
        </div>

        <div class="footer">
          Documento emitido eletronicamente via ERP Contábil Studio Pro • Padrão Lei nº 14.871/2024 • Módulo Depreciação Acelerada
        </div>
      </body>
      </html>
    `;

    if (onOpenReportPreview) {
      onOpenReportPreview({
        titulo: `Laudo Depreciação Acelerada - ${empresaAtiva.razaoSocial}`,
        subtitulo: `Exercício ${anoFiltro} • Controle e-LALUR Parte A e Parte B (Lei 14.871/2024)`,
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

  const bensFiltrados = (resumo?.bens || []).filter(b => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      b.numeroPatrimonioTombo.toLowerCase().includes(term) ||
      b.descricaoBem.toLowerCase().includes(term) ||
      b.numeroNotaFiscal.toLowerCase().includes(term) ||
      b.categoria.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] border border-neutral-800 rounded-lg p-4">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-6 h-6 text-sky-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Depreciação Acelerada Incentivada (Bens de Capital)
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-800/80 rounded-full">
              Lei nº 14.871/2024 • Decreto nº 12.175/2024
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Depreciação fiscal de máquinas novas em 2 anos (50% no ano de instalação e 50% no subsequente) com controle de exclusões/adições na Parte A e saldo Parte B do e-LALUR.
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
            title="Imprimir Laudo A4"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            Laudo A4
          </button>

          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Bem Acelerado
          </button>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Bens Habilitados</span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {resumo?.totalBensHabilitados || 0} Máquinas
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Adquiridos a partir de 01/01/2024
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Custo Original de Aquisição</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            R$ {(resumo?.totalCustoAquisicaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Valor base para depreciação em 2 anos
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-emerald-900/40 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-emerald-300">Exclusão LALUR Parte A (Ano)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            R$ {(resumo?.totalExclusaoLalurPeriodo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            Depreciação Acelerada (-) Depreciação CPC 27
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Saldo em Conta LALUR Parte B</span>
            <FileCheck2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-400 font-mono">
            R$ {(resumo?.totalSaldoParteBLalur || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Controlado para futuras adições societárias
          </div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex border-b border-neutral-800 space-x-1">
        <button
          onClick={() => setAbaAtiva('ativos')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'ativos'
              ? 'border-sky-500 text-sky-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Factory className="w-3.5 h-3.5" />
          Ativos & Quotas Fiscais ({resumo?.bens?.length || 0})
        </button>

        <button
          onClick={() => setAbaAtiva('confronto')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'confronto'
              ? 'border-sky-500 text-sky-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Confronto Societário vs Fiscal (LALUR)
        </button>

        <button
          onClick={() => setAbaAtiva('legislacao')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition ${
            abaAtiva === 'legislacao'
              ? 'border-sky-500 text-sky-400 bg-neutral-800/40'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Regulamento da Lei nº 14.871/2024
        </button>
      </div>

      {/* CONTEÚDO DA ABA ATIVOS */}
      {abaAtiva === 'ativos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-[#1e1e1e] p-2.5 rounded border border-neutral-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por tombo, descrição, NF-e ou categoria..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
              />
            </div>
            <div className="text-xs text-neutral-400">
              Mostrando <strong className="text-neutral-200">{bensFiltrados.length}</strong> de {resumo?.bens?.length || 0} máquinas
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#262626] text-neutral-400 uppercase text-[10px] font-semibold tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3">Tombo / Ativo</th>
                  <th className="p-3">Categoria / NF</th>
                  <th className="p-3">Instalação</th>
                  <th className="p-3 text-right">Custo Aquisição (R$)</th>
                  <th className="p-3 text-right">Deprec. Societária</th>
                  <th className="p-3 text-right">Deprec. Fiscal Acel.</th>
                  <th className="p-3 text-right">Exclusão LALUR (R$)</th>
                  <th className="p-3 text-right">Saldo Parte B (R$)</th>
                  <th className="p-3">Status Fiscal</th>
                  <th className="p-3 text-center">Contábil</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {bensFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-neutral-500 font-sans">
                      Nenhum bem patrimonial com depreciação acelerada cadastrado.
                    </td>
                  </tr>
                ) : (
                  bensFiltrados.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                      <td className="p-3">
                        <div className="font-semibold text-white">{item.numeroPatrimonioTombo}</div>
                        <div className="text-[11px] text-neutral-300 font-sans truncate max-w-xs">{item.descricaoBem}</div>
                      </td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-sky-300 border border-neutral-700">
                          {item.categoria.replace(/_/g, ' ')}
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-0.5">NF: {item.numeroNotaFiscal}</div>
                      </td>
                      <td className="p-3 font-sans text-neutral-300">
                        {item.dataInstalacaoDisponibilizacao}
                        <div className="text-[10px] text-neutral-500">Ano: {item.anoInstalacao}</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-white">
                        R$ {item.valorAquisicaoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-neutral-300">
                        R$ {item.depreciacaoSocietariaAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-neutral-500 font-sans">{item.taxaDepreciacaoSocietariaAnual.toFixed(1)}% a.a.</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-sky-400">
                        R$ {item.depreciacaoFiscalAceleradaAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        R$ {item.exclusaoParteALalurPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-teal-400">
                        R$ {item.saldoParteBContaLalur.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.statusDepreciacao === 'TOTALMENTE_DEPRECIADO_FISCAL' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                          item.statusDepreciacao === 'EM_DEPRECIACAO_ACELERADA' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {item.statusDepreciacao.replace(/_/g, ' ')}
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
                            className="px-2 py-1 text-[11px] font-medium bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded transition font-sans"
                            title="Lançar ajuste no e-LALUR Parte A/B"
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

      {/* CONTEÚDO DA ABA CONFRONTO */}
      {abaAtiva === 'confronto' && (
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-5 space-y-4 text-xs leading-relaxed text-neutral-300">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-neutral-800 pb-2">
            <Scale className="w-5 h-5 text-sky-400" />
            Mecanismo de Conciliação Contábil vs Fiscal (Parte A e Parte B do e-LALUR)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                1. Fase de Exclusão (Anos 1 e 2 - Incentivo Imediato)
              </h3>
              <p className="text-neutral-400 text-justify">
                Nos 2 primeiros anos da máquina, a depreciação fiscal acelerada (50% a.a.) supera a depreciação societária econômica (10% a.a.). A diferença positiva é <strong>excluída do Lucro Líquido na Parte A do e-LALUR/e-LACS</strong>, reduzindo a base do IRPJ e da CSLL, e debitada na conta correspondente na <strong>Parte B</strong>.
              </p>
            </div>

            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Clock className="w-4 h-4 text-amber-400" />
                2. Fase de Reversão / Adição (Do 3º ao 10º Ano)
              </h3>
              <p className="text-neutral-400 text-justify">
                A partir do 3º ano, a depreciação fiscal atinge 100% e cessa. A depreciação societária que continuar sendo debitada no resultado da empresa (DRE) deverá ser <strong>adicionada ao Lucro Líquido na Parte A</strong> até a baixa do bem, baixando o saldo acumulado da conta na <strong>Parte B</strong> até zerá-lo.
              </p>
            </div>
          </div>

          <div className="p-4 bg-sky-950/20 border border-sky-900/40 rounded space-y-2">
            <div className="font-semibold text-sky-300">Exemplo Prático para Máquina de R$ 1.000.000,00 (Vida Útil Societária 10 anos):</div>
            <table className="w-full text-left text-xs text-neutral-300 mt-2">
              <thead className="bg-[#1f2937] text-neutral-400 text-[10px]">
                <tr>
                  <th className="p-2">Ano</th>
                  <th className="p-2 text-right">Deprec. Societária DRE (10%)</th>
                  <th className="p-2 text-right">Deprec. Fiscal Acelerada (50%)</th>
                  <th className="p-2 text-right">Ajuste e-LALUR Parte A</th>
                  <th className="p-2 text-right">Saldo Parte B LALUR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono">
                <tr>
                  <td className="p-2">Ano 1 (Instalação)</td>
                  <td className="p-2 text-right">R$ 100.000,00</td>
                  <td className="p-2 text-right">R$ 500.000,00</td>
                  <td className="p-2 text-right text-emerald-400 font-bold">(-) Exclusão: R$ 400.000,00</td>
                  <td className="p-2 text-right">R$ 400.000,00 (Credor)</td>
                </tr>
                <tr>
                  <td className="p-2">Ano 2</td>
                  <td className="p-2 text-right">R$ 100.000,00</td>
                  <td className="p-2 text-right">R$ 500.000,00</td>
                  <td className="p-2 text-right text-emerald-400 font-bold">(-) Exclusão: R$ 400.000,00</td>
                  <td className="p-2 text-right">R$ 800.000,00 (Credor)</td>
                </tr>
                <tr>
                  <td className="p-2">Anos 3 a 10 (Cada ano)</td>
                  <td className="p-2 text-right">R$ 100.000,00</td>
                  <td className="p-2 text-right">R$ 0,00 (100% esgotado)</td>
                  <td className="p-2 text-right text-amber-400 font-bold">(+) Adição: R$ 100.000,00</td>
                  <td className="p-2 text-right">Reduz R$ 100k/ano até R$ 0,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA LEGISLAÇÃO */}
      {abaAtiva === 'legislacao' && (
        <div className="bg-[#1e1e1e] border border-neutral-800 rounded-lg p-5 space-y-4 text-xs leading-relaxed text-neutral-300">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-neutral-800 pb-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            Requisitos e Condições da Lei Federal nº 14.871/2024
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Factory className="w-4 h-4 text-sky-400" />
                1. Requisitos de Habilitação do Bem
              </h3>
              <ul className="list-disc list-inside space-y-1 text-neutral-400">
                <li>Bens novos (máquinas, equipamentos, aparelhos e instrumentos);</li>
                <li>Adquiridos a partir de 1º de janeiro de 2024 até o limite regulamentar;</li>
                <li>Destinados ao Ativo Imobilizado e empregados diretamente na atividade produtiva;</li>
                <li>Pessoa jurídica tributada no <strong>Lucro Real</strong>.</li>
              </ul>
            </div>

            <div className="bg-[#262626] p-4 rounded border border-neutral-800 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <FileCheck2 className="w-4 h-4 text-sky-400" />
                2. Decreto Regulamentador nº 12.175/2024
              </h3>
              <p className="text-neutral-400 text-justify">
                O Decreto nº 12.175/2024 fixou o teto global de renúncia fiscal e estabeleceu as NCMs setoriais contempladas na indústria de transformação, química, metalmecânica e automação, vedando a aplicação do benefício a bens usados ou sublocados a terceiros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR BEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-neutral-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Factory className="w-5 h-5 text-sky-400" />
                {itemEdicao ? 'Editar Bem Acelerado' : 'Novo Ativo com Depreciação Acelerada (Lei 14.871/24)'}
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
                <div>
                  <label className="block text-neutral-400 mb-1">Número Tombo / Patrimônio</label>
                  <input
                    type="text"
                    required
                    value={formTombo}
                    onChange={e => setFormTombo(e.target.value)}
                    placeholder="MAQ-2026-001"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-neutral-400 mb-1">Categoria do Bem Fabril</label>
                  <select
                    value={formCategoria}
                    onChange={e => setFormCategoria(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="MAQUINAS_FABRIS_PRODUCAO">MÁQUINAS FABRIS DE PRODUÇÃO</option>
                    <option value="EQUIPAMENTOS_INDUSTRIAIS_AUTOMACAO">EQUIPAMENTOS DE AUTOMAÇÃO INDUSTRIAL</option>
                    <option value="SISTEMAS_ROBOTICOS_MANUFATURA">SISTEMAS ROBÓTICOS DE MANUFATURA</option>
                    <option value="APARELHOS_INSTRUMENTOS_MEDICAO">APARELHOS E INSTRUMENTOS DE MEDIÇÃO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Descrição Detalhada do Bem Novo</label>
                <input
                  type="text"
                  required
                  value={formDescricao}
                  onChange={e => setFormDescricao(e.target.value)}
                  placeholder="Modelo, fabricante, capacidade produtiva e especificações"
                  className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Número NF-e Aquisição</label>
                  <input
                    type="text"
                    required
                    value={formNfe}
                    onChange={e => setFormNfe(e.target.value)}
                    placeholder="012480"
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Data da Aquisição</label>
                  <input
                    type="date"
                    required
                    value={formDataAquisicao}
                    onChange={e => setFormDataAquisicao(e.target.value)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Data de Instalação / Uso</label>
                  <input
                    type="date"
                    required
                    value={formDataInstalacao}
                    onChange={e => setFormDataInstalacao(e.target.value)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#181818] p-3 rounded border border-neutral-800">
                <div className="md:col-span-2">
                  <label className="block text-neutral-400 mb-1">Custo de Aquisição Original (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formValorAquisicao}
                    onChange={e => setFormValorAquisicao(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Vida Societária (Anos)</label>
                  <input
                    type="number"
                    required
                    value={formVidaUtilAnos}
                    onChange={e => setFormVidaUtilAnos(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Taxa CPC 27 (% a.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formTaxaAnual}
                    onChange={e => setFormTaxaAnual(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Ano de Início da Depreciação Acelerada</label>
                  <select
                    value={formAnoInstalacao}
                    onChange={e => setFormAnoInstalacao(Number(e.target.value))}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value={2026}>2026 (50% em 2026 e 50% em 2027)</option>
                    <option value={2025}>2025 (50% em 2025 e 50% em 2026)</option>
                    <option value={2024}>2024 (50% em 2024 e 50% em 2025)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status da Depreciação</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#262626] border border-neutral-700 rounded p-2 text-white font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="EM_DEPRECIACAO_ACELERADA">EM DEPRECIAÇÃO ACELERADA (ANOS 1 E 2)</option>
                    <option value="TOTALMENTE_DEPRECIADO_FISCAL">TOTALMENTE DEPRECIADO FISCAL (100% ATINGIDO)</option>
                    <option value="BAIXADO">BAIXADO / ALIENADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Observações Técnicas e Localização na Fábrica</label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={e => setFormObservacoes(e.target.value)}
                  placeholder="Setor fabril de instalação, processo de usinagem e parecer técnico..."
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
                  Salvar Bem Acelerado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DepreciacaoAceleradaIncentivadaModule;
