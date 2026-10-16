import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Building2,
  DollarSign,
  Calendar,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Printer,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DeclaracaoDirf,
  BeneficiarioDirf,
  RendimentoMensalDirf,
  Empresa
} from '../../types/contabil';

interface DirfModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

const MESES_NOMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DirfModule: React.FC<DirfModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [anoCalendario, setAnoCalendario] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'bpf' | 'bpj' | 'txt' | 'conciliacao'>('bpf');
  const [declaracao, setDeclaracao] = useState<DeclaracaoDirf | null>(null);
  const [expandedBeneficiarioId, setExpandedBeneficiarioId] = useState<string | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais de Cadastro
  const [modalBeneficiarioAberto, setModalBeneficiarioAberto] = useState(false);
  const [editandoBeneficiario, setEditandoBeneficiario] = useState<BeneficiarioDirf | null>(null);
  const [formTipo, setFormTipo] = useState<'PF' | 'PJ'>('PF');
  const [formCpfCnpj, setFormCpfCnpj] = useState('');
  const [formNomeRazao, setFormNomeRazao] = useState('');
  const [formCodigoReceita, setFormCodigoReceita] = useState('0561');
  const [formDescricaoCodigo, setFormDescricaoCodigo] = useState('Rendimentos do Trabalho Assalariado (CLT / Pró-Labore)');
  const [formMolestiaGrave, setFormMolestiaGrave] = useState(false);
  const [formMeses, setFormMeses] = useState<RendimentoMensalDirf[]>(
    Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      rendimentoBruto: 5000,
      previdenciaOficial: 550,
      dependentes: 189.59,
      pensaoAlimenticia: 0,
      outrasDeducoes: 0,
      irrfRetido: 450
    }))
  );

  const carregarDados = () => {
    const dec = dbService.getDeclaracaoDirf(empresaAtiva.id, anoCalendario);
    setDeclaracao(dec);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, anoCalendario]);

  const handleCopiarTxt = () => {
    if (!declaracao?.arquivoTxt) return;
    navigator.clipboard.writeText(declaracao.arquivoTxt);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2500);
  };

  const handleDownloadTxt = () => {
    if (!declaracao?.arquivoTxt) return;
    const blob = new Blob([declaracao.arquivoTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DIRF_${empresaAtiva.cnpj.replace(/\D/g, '')}_${anoCalendario}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const abrirModalNovoBeneficiario = (tipo: 'PF' | 'PJ') => {
    setEditandoBeneficiario(null);
    setFormTipo(tipo);
    setFormCpfCnpj('');
    setFormNomeRazao('');
    if (tipo === 'PF') {
      setFormCodigoReceita('0561');
      setFormDescricaoCodigo('Rendimentos do Trabalho Assalariado (CLT / Pró-Labore)');
      setFormMeses(Array.from({ length: 12 }, (_, i) => ({
        mes: i + 1,
        rendimentoBruto: 6000,
        previdenciaOficial: 680,
        dependentes: 189.59,
        pensaoAlimenticia: 0,
        outrasDeducoes: 0,
        irrfRetido: 520
      })));
    } else {
      setFormCodigoReceita('1708');
      setFormDescricaoCodigo('Remuneração de Serviços Prestados por Pessoa Jurídica');
      setFormMeses(Array.from({ length: 12 }, (_, i) => ({
        mes: i + 1,
        rendimentoBruto: 12000,
        previdenciaOficial: 0,
        dependentes: 0,
        pensaoAlimenticia: 0,
        outrasDeducoes: 0,
        irrfRetido: 180
      })));
    }
    setFormMolestiaGrave(false);
    setModalBeneficiarioAberto(true);
  };

  const abrirModalEdicao = (b: BeneficiarioDirf) => {
    setEditandoBeneficiario(b);
    setFormTipo(b.tipoBeneficiario);
    setFormCpfCnpj(b.cpfCnpj);
    setFormNomeRazao(b.nomeRazaoSocial);
    setFormCodigoReceita(b.codigoReceita);
    setFormDescricaoCodigo(b.descricaoCodigo);
    setFormMolestiaGrave(!!b.molestiaGrave);
    setFormMeses(b.meses.map(m => ({ ...m })));
    setModalBeneficiarioAberto(true);
  };

  const handleSalvarBeneficiario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCpfCnpj.trim() || !formNomeRazao.trim()) {
      alert('Preencha o CPF/CNPJ e o Nome/Razão Social do beneficiário.');
      return;
    }

    const novoBeneficiario: BeneficiarioDirf = {
      id: editandoBeneficiario ? editandoBeneficiario.id : `dirf-${formTipo.toLowerCase()}-${Date.now()}`,
      empresaId: empresaAtiva.id,
      anoCalendario,
      tipoBeneficiario: formTipo,
      cpfCnpj: formCpfCnpj,
      nomeRazaoSocial: formNomeRazao,
      codigoReceita: formCodigoReceita,
      descricaoCodigo: formDescricaoCodigo,
      molestiaGrave: formMolestiaGrave,
      meses: formMeses,
      totalRendimentoBruto: 0,
      totalPrevidencia: 0,
      totalDependentes: 0,
      totalPensao: 0,
      totalIrrf: 0
    };

    dbService.salvarBeneficiarioDirf(novoBeneficiario);
    setModalBeneficiarioAberto(false);
    carregarDados();
    setMensagemStatus({ tipo: 'sucesso', texto: `Beneficiário ${novoBeneficiario.nomeRazaoSocial} salvo com sucesso!` });
    setTimeout(() => setMensagemStatus(null), 4000);
  };

  const handleExcluirBeneficiario = (id: string, nome: string) => {
    if (confirm(`Deseja realmente remover o beneficiário "${nome}" da DIRF?`)) {
      dbService.excluirBeneficiarioDirf(id);
      carregarDados();
      setMensagemStatus({ tipo: 'sucesso', texto: 'Beneficiário removido com sucesso.' });
      setTimeout(() => setMensagemStatus(null), 3000);
    }
  };

  const handleIntegrarContabilidade = () => {
    const res = dbService.integrarDirfContabil(empresaAtiva.id, anoCalendario);
    if (res.sucesso) {
      setMensagemStatus({ tipo: 'sucesso', texto: res.mensagem });
    } else {
      setMensagemStatus({ tipo: 'erro', texto: res.mensagem });
    }
    setTimeout(() => setMensagemStatus(null), 5000);
  };

  // Impressão do Comprovante de Rendimentos A4
  const handleImprimirComprovante = (b: BeneficiarioDirf) => {
    if (!onOpenReportPreview) return;

    const content = (
      <div className="p-8 text-black bg-white max-w-4xl mx-auto font-sans leading-tight text-xs">
        {/* Cabeçalho Oficial */}
        <div className="border border-black p-3 mb-3 text-center bg-gray-100">
          <h1 className="text-sm font-bold tracking-wider uppercase">Ministério da Fazenda - Secretaria Especial da Receita Federal do Brasil</h1>
          <h2 className="text-base font-extrabold mt-1">COMPROVANTE DE RENDIMENTOS PAGOS E DE RETENÇÃO DE IMPOSTO DE RENDA NA FONTE</h2>
          <p className="text-[11px] font-semibold mt-0.5">Ano-Calendário de {anoCalendario} / Exercício de {anoCalendario + 1}</p>
        </div>

        {/* Quadro 1: Fonte Pagadora */}
        <div className="border border-black mb-3">
          <div className="bg-gray-200 px-2 py-1 font-bold border-b border-black text-[11px]">
            1. FONTE PAGADORA PESSOA JURÍDICA
          </div>
          <div className="grid grid-cols-3 p-2 gap-2">
            <div className="col-span-1">
              <span className="block text-[10px] text-gray-600 font-semibold">CNPJ</span>
              <span className="font-mono font-bold text-xs">{empresaAtiva.cnpj}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-[10px] text-gray-600 font-semibold">Nome Empresarial</span>
              <span className="font-bold text-xs uppercase">{empresaAtiva.razaoSocial}</span>
            </div>
          </div>
        </div>

        {/* Quadro 2: Pessoa Física Beneficiária */}
        <div className="border border-black mb-3">
          <div className="bg-gray-200 px-2 py-1 font-bold border-b border-black text-[11px]">
            2. PESSOA FÍSICA BENEFICIÁRIA DOS RENDIMENTOS
          </div>
          <div className="grid grid-cols-3 p-2 gap-2">
            <div>
              <span className="block text-[10px] text-gray-600 font-semibold">CPF</span>
              <span className="font-mono font-bold text-xs">{b.cpfCnpj}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-[10px] text-gray-600 font-semibold">Nome Completo</span>
              <span className="font-bold text-xs uppercase">{b.nomeRazaoSocial}</span>
            </div>
            <div className="col-span-3 pt-1 border-t border-gray-300">
              <span className="block text-[10px] text-gray-600 font-semibold">Natureza do Rendimento / Código</span>
              <span className="font-medium text-xs">{b.codigoReceita} - {b.descricaoCodigo}</span>
            </div>
          </div>
        </div>

        {/* Quadro 3: Rendimentos Tributáveis, Deduções e IRRF */}
        <div className="border border-black mb-3">
          <div className="bg-gray-200 px-2 py-1 font-bold border-b border-black text-[11px]">
            3. RENDIMENTOS TRIBUTÁVEIS, DEDUÇÕES E IMPOSTO RETIDO NA FONTE (Valores em Reais)
          </div>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-1.5 pl-3">01. Total dos rendimentos (inclusive férias e gratificações)</td>
                <td className="p-1.5 text-right font-mono font-bold pr-3">
                  R$ {b.totalRendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-1.5 pl-3">02. Contribuição previdenciária oficial (INSS)</td>
                <td className="p-1.5 text-right font-mono pr-3">
                  R$ {b.totalPrevidencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-1.5 pl-3">03. Contribuições a entidades de previdência complementar e FAPI</td>
                <td className="p-1.5 text-right font-mono pr-3">R$ 0,00</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-1.5 pl-3">04. Pensão alimentícia judicial</td>
                <td className="p-1.5 text-right font-mono pr-3">
                  R$ {b.totalPensao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-1.5 pl-3">05. Dedução de dependentes legais</td>
                <td className="p-1.5 text-right font-mono pr-3">
                  R$ {b.totalDependentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="bg-blue-50 font-bold">
                <td className="p-1.5 pl-3 text-blue-900">06. Imposto sobre a Renda Retido na Fonte (IRRF)</td>
                <td className="p-1.5 text-right font-mono pr-3 text-blue-950 font-extrabold">
                  R$ {b.totalIrrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quadro 4: Rendimentos Isentos */}
        <div className="border border-black mb-3">
          <div className="bg-gray-200 px-2 py-1 font-bold border-b border-black text-[11px]">
            4. RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS
          </div>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-1.5 pl-3">01. Parcela isenta de proventos de aposentadoria ou pensão (65 anos ou mais)</td>
                <td className="p-1.5 text-right font-mono pr-3">R$ 0,00</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-1.5 pl-3">02. Diárias e ajudas de custo</td>
                <td className="p-1.5 text-right font-mono pr-3">R$ 0,00</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-1.5 pl-3">03. Lucros e dividendos apurados e distribuídos</td>
                <td className="p-1.5 text-right font-mono pr-3">R$ 0,00</td>
              </tr>
              <tr>
                <td className="p-1.5 pl-3">04. Outros rendimentos isentos</td>
                <td className="p-1.5 text-right font-mono pr-3">R$ 0,00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quadro 5: Informações Complementares */}
        <div className="border border-black mb-4">
          <div className="bg-gray-200 px-2 py-1 font-bold border-b border-black text-[11px]">
            5. INFORMAÇÕES COMPLEMENTARES
          </div>
          <div className="p-2 text-[10px] text-gray-700 min-h-[45px]">
            Valores apurados em conformidade com a Instrução Normativa RFB nº 1.990/2020 e Art. 718 do Decreto nº 9.580/2018 (RIR/2018).
            Documento emitido digitalmente pelo ERP Contábil Studio Pro em {new Date().toLocaleDateString('pt-BR')}.
          </div>
        </div>

        {/* Quadro 6: Responsável pelas Informações */}
        <div className="border border-black p-3">
          <div className="grid grid-cols-2 gap-6 items-end pt-3">
            <div>
              <span className="block text-[10px] text-gray-600">Local e Data de Emissão</span>
              <p className="font-semibold text-xs mt-1">{empresaAtiva.cidade || 'São Paulo'} - {empresaAtiva.uf || 'SP'}, {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-black pt-1">
                <p className="font-bold text-xs uppercase">{empresaAtiva.responsavelLegal || 'Carlos Eduardo da Silva'}</p>
                <p className="text-[10px] text-gray-600">Representante Legal da Fonte Pagadora (CPF: {empresaAtiva.cpfResponsavel || '123.456.789-00'})</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `Comprovante Anual de Rendimentos - ${b.nomeRazaoSocial}`,
      `Ano-Calendário ${anoCalendario} - DIRF RFB`,
      content,
      'portrait'
    );
  };

  const beneficiariosPf = declaracao?.beneficiarios.filter(b => b.tipoBeneficiario === 'PF') || [];
  const beneficiariosPj = declaracao?.beneficiarios.filter(b => b.tipoBeneficiario === 'PJ') || [];

  return (
    <div className="flex flex-col h-full bg-[#141414] text-white">
      {/* Header Superior com Seletor de Ano e Ações */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#181818] border-b border-[#2d2d2d]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">DIRF - Declaração do Imposto de Renda Retido na Fonte</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                IN RFB 1.990/2020
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Ano-Calendário de retenção e geração do arquivo magnético para o PVA DIRF da Receita Federal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333]">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Ano-Calendário:</span>
            <select
              value={anoCalendario}
              onChange={e => setAnoCalendario(Number(e.target.value))}
              aria-label="Ano-Calendário da DIRF"
              className="bg-[#2a2a2a] text-white font-bold text-xs px-2 py-1 rounded border border-[#444] focus:outline-none focus:border-blue-500"
            >
              <option value={2026}>2026 (Ref. 2027)</option>
              <option value={2025}>2025 (Ref. 2026)</option>
              <option value={2024}>2024 (Ref. 2025)</option>
            </select>
          </div>

          <button
            onClick={handleIntegrarContabilidade}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Integrar Contábil</span>
          </button>
        </div>
      </div>

      {/* Banner de Mensagens */}
      {mensagemStatus && (
        <div className={`mx-4 mt-3 p-3 rounded-lg flex items-center space-x-2 text-xs font-medium border ${
          mensagemStatus.tipo === 'sucesso'
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
            : 'bg-red-950/40 text-red-300 border-red-500/30'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{mensagemStatus.texto}</span>
        </div>
      )}

      {/* KPI Cards Superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
        <div className="p-3 bg-[#1c1c1c] rounded-lg border border-[#2d2d2d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Beneficiários</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white">
              {declaracao ? declaracao.totalBeneficiariosPf + declaracao.totalBeneficiariosPj : 0}
            </span>
            <span className="text-[11px] text-gray-400 block mt-0.5">
              {declaracao?.totalBeneficiariosPf || 0} PF / {declaracao?.totalBeneficiariosPj || 0} PJ
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#1c1c1c] rounded-lg border border-[#2d2d2d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Rendimento Bruto</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white font-mono">
              R$ {declaracao?.totalRendimentosTributaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Tributável Anual</span>
          </div>
        </div>

        <div className="p-3 bg-[#1c1c1c] rounded-lg border border-[#2d2d2d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Previdência Oficial</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white font-mono">
              R$ {beneficiariosPf.reduce((acc, b) => acc + b.totalPrevidencia, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-gray-400 block mt-0.5">Dedução INSS</span>
          </div>
        </div>

        <div className="p-3 bg-[#1c1c1c] rounded-lg border border-[#2d2d2d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Dependentes</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white font-mono">
              R$ {beneficiariosPf.reduce((acc, b) => acc + b.totalDependentes, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-purple-400 block mt-0.5">Dedução Legal</span>
          </div>
        </div>

        <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-300 text-xs font-semibold">
            <span>IRRF Total Retido</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-blue-200 font-mono">
              R$ {declaracao?.totalIrrfRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
            <span className="text-[11px] text-blue-400 block mt-0.5">A Recolher / DIRF</span>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center space-x-1 px-4 border-b border-[#2d2d2d] bg-[#161616]">
        <button
          onClick={() => setActiveTab('bpf')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'bpf'
              ? 'border-blue-500 text-blue-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pessoas Físicas (BPF - {beneficiariosPf.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bpj')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'bpj'
              ? 'border-blue-500 text-blue-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Pessoas Jurídicas (BPJ - {beneficiariosPj.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('txt')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'txt'
              ? 'border-blue-500 text-blue-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Arquivo PVA DIRF (.txt)</span>
        </button>

        <button
          onClick={() => setActiveTab('conciliacao')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'conciliacao'
              ? 'border-blue-500 text-blue-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Resumo & Conciliação</span>
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ABA 1: BENEFICIÁRIOS PF */}
        {activeTab === 'bpf' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Beneficiários Pessoa Física (Registro BPFDEC)</h2>
                <p className="text-xs text-gray-400">Rendimentos do trabalho assalariado (0561), aluguéis (3208) e autônomos</p>
              </div>
              <button
                onClick={() => abrirModalNovoBeneficiario('PF')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Beneficiário PF</span>
              </button>
            </div>

            <div className="border border-[#2d2d2d] rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-gray-400 font-semibold border-b border-[#2d2d2d]">
                    <th className="py-2.5 px-3">CPF</th>
                    <th className="py-2.5 px-3">Nome do Beneficiário</th>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3 text-right">Rend. Bruto</th>
                    <th className="py-2.5 px-3 text-right">Previdência</th>
                    <th className="py-2.5 px-3 text-right">Dependentes</th>
                    <th className="py-2.5 px-3 text-right text-blue-400 font-bold">IRRF Retido</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d2d]">
                  {beneficiariosPf.map(b => (
                    <React.Fragment key={b.id}>
                      <tr className="hover:bg-[#1e1e1e] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-300">{b.cpfCnpj}</td>
                        <td className="py-2.5 px-3 font-medium text-white">{b.nomeRazaoSocial}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono text-[11px]">
                            {b.codigoReceita}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          R$ {b.totalRendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-400">
                          R$ {b.totalPrevidencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-400">
                          R$ {b.totalDependentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">
                          R$ {b.totalIrrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setExpandedBeneficiarioId(expandedBeneficiarioId === b.id ? null : b.id)}
                              title="Ver Meses"
                              aria-label="Ver detalhamento dos 12 meses"
                              className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#252525]"
                            >
                              {expandedBeneficiarioId === b.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleImprimirComprovante(b)}
                              title="Emitir Comprovante A4"
                              aria-label="Emitir Comprovante Anual de Rendimentos A4"
                              className="p-1 text-emerald-400 hover:text-emerald-300 rounded hover:bg-[#252525]"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => abrirModalEdicao(b)}
                              title="Editar"
                              aria-label="Editar beneficiário"
                              className="p-1 text-blue-400 hover:text-blue-300 rounded hover:bg-[#252525]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirBeneficiario(b.id, b.nomeRazaoSocial)}
                              title="Excluir"
                              aria-label="Excluir beneficiário"
                              className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-[#252525]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-grid expandido dos 12 meses */}
                      {expandedBeneficiarioId === b.id && (
                        <tr className="bg-[#121212]">
                          <td colSpan={8} className="p-3">
                            <div className="border border-[#333] rounded p-3 bg-[#161616]">
                              <h4 className="text-xs font-semibold text-gray-300 mb-2">Detalhamento Mensal de Rendimentos e Retenções (12 Meses)</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {b.meses.map(m => (
                                  <div key={m.mes} className="p-2 rounded bg-[#1c1c1c] border border-[#2d2d2d] text-[11px]">
                                    <div className="flex justify-between font-bold text-gray-300 border-b border-[#333] pb-1 mb-1">
                                      <span>{MESES_NOMES[m.mes - 1]}</span>
                                      <span className="text-blue-400 font-mono">IR: R$ {m.irrfRetido.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                      <span>Bruto:</span>
                                      <span className="font-mono">R$ {m.rendimentoBruto.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                      <span>INSS:</span>
                                      <span className="font-mono">R$ {m.previdenciaOficial.toFixed(2)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {beneficiariosPf.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-500">
                        Nenhum beneficiário pessoa física cadastrado na DIRF deste ano-calendário.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: BENEFICIÁRIOS PJ */}
        {activeTab === 'bpj' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Beneficiários Pessoa Jurídica (Registro BPJDEC)</h2>
                <p className="text-xs text-gray-400">Serviços profissionais prestados por PJ (1708) e retenções CSRF (5952)</p>
              </div>
              <button
                onClick={() => abrirModalNovoBeneficiario('PJ')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Beneficiário PJ</span>
              </button>
            </div>

            <div className="border border-[#2d2d2d] rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-gray-400 font-semibold border-b border-[#2d2d2d]">
                    <th className="py-2.5 px-3">CNPJ</th>
                    <th className="py-2.5 px-3">Razão Social do Prestador</th>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3 text-right">Rend. Bruto Anual</th>
                    <th className="py-2.5 px-3 text-right text-blue-400 font-bold">IRRF Retido Anual</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d2d]">
                  {beneficiariosPj.map(b => (
                    <React.Fragment key={b.id}>
                      <tr className="hover:bg-[#1e1e1e] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-300">{b.cpfCnpj}</td>
                        <td className="py-2.5 px-3 font-medium text-white">{b.nomeRazaoSocial}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono text-[11px]">
                            {b.codigoReceita}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          R$ {b.totalRendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">
                          R$ {b.totalIrrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setExpandedBeneficiarioId(expandedBeneficiarioId === b.id ? null : b.id)}
                              title="Ver Meses"
                              aria-label="Ver detalhamento dos 12 meses"
                              className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#252525]"
                            >
                              {expandedBeneficiarioId === b.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => abrirModalEdicao(b)}
                              title="Editar"
                              aria-label="Editar beneficiário PJ"
                              className="p-1 text-blue-400 hover:text-blue-300 rounded hover:bg-[#252525]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirBeneficiario(b.id, b.nomeRazaoSocial)}
                              title="Excluir"
                              aria-label="Excluir beneficiário PJ"
                              className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-[#252525]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedBeneficiarioId === b.id && (
                        <tr className="bg-[#121212]">
                          <td colSpan={6} className="p-3">
                            <div className="border border-[#333] rounded p-3 bg-[#161616]">
                              <h4 className="text-xs font-semibold text-gray-300 mb-2">Retenções Mensais de Serviços Prestados</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {b.meses.map(m => (
                                  <div key={m.mes} className="p-2 rounded bg-[#1c1c1c] border border-[#2d2d2d] text-[11px]">
                                    <div className="flex justify-between font-bold text-gray-300 border-b border-[#333] pb-1 mb-1">
                                      <span>{MESES_NOMES[m.mes - 1]}</span>
                                      <span className="text-blue-400 font-mono">IR: R$ {m.irrfRetido.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                      <span>Faturamento:</span>
                                      <span className="font-mono">R$ {m.rendimentoBruto.toFixed(2)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {beneficiariosPj.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        Nenhum beneficiário pessoa jurídica com retenção cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: ARQUIVO PVA DIRF (.TXT) */}
        {activeTab === 'txt' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Arquivo Magnético para Importação no PVA DIRF</h2>
                <p className="text-xs text-gray-400">Formato pipe-delimited oficial da Instrução Normativa RFB nº 1.990/2020</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopiarTxt}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 border border-[#444] rounded text-xs transition-colors"
                >
                  {copiedTxt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedTxt ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo .txt</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-black/60 border border-[#2d2d2d] rounded-lg">
              <pre className="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap select-all max-h-[500px]">
                {declaracao?.arquivoTxt || 'Nenhum dado gerado para a DIRF.'}
              </pre>
            </div>
          </div>
        )}

        {/* ABA 4: RESUMO & CONCILIAÇÃO */}
        {activeTab === 'conciliacao' && (
          <div className="space-y-6">
            <div className="p-4 bg-[#181818] rounded-lg border border-[#2d2d2d]">
              <h3 className="text-sm font-bold text-white mb-2">Termo de Conciliação e Conferência Fiscal da DIRF</h3>
              <p className="text-xs text-gray-400 mb-4">
                Demonstrativo de cruzamento entre as retenções na fonte informadas na DIRF e as contas de passivo tributário da contabilidade.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded bg-[#1f1f1f] border border-[#333]">
                  <h4 className="text-xs font-semibold text-gray-300 border-b border-[#333] pb-1.5 mb-2">
                    Retenções Apuradas na DIRF ({anoCalendario})
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>Código 0561 (Trabalho Assalariado CLT / Pró-Labore):</span>
                      <span className="font-mono font-bold">
                        R$ {beneficiariosPf.filter(b => b.codigoReceita === '0561').reduce((acc, b) => acc + b.totalIrrf, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Código 1708 (Serviços Profissionais Prestados por PJ):</span>
                      <span className="font-mono font-bold">
                        R$ {beneficiariosPj.filter(b => b.codigoReceita === '1708').reduce((acc, b) => acc + b.totalIrrf, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Código 3208 (Aluguéis Pagos a Pessoas Físicas):</span>
                      <span className="font-mono font-bold">
                        R$ {beneficiariosPf.filter(b => b.codigoReceita === '3208').reduce((acc, b) => acc + b.totalIrrf, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-blue-400 font-bold border-t border-[#333] pt-2">
                      <span>Total Geral de IRRF a Recolher:</span>
                      <span className="font-mono text-sm">
                        R$ {declaracao?.totalIrrfRetido.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#1f1f1f] border border-[#333]">
                  <h4 className="text-xs font-semibold text-gray-300 border-b border-[#333] pb-1.5 mb-2">
                    Amarração Contábil (Passivo Circulante)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>Conta Contábil Passiva:</span>
                      <span className="font-mono">2.1.04.01.0001 (IRRF a Recolher)</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Natureza do Lançamento:</span>
                      <span>Crédito (Obrigação Fiscal)</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Contrapartida:</span>
                      <span>Resultado (Despesa de Pessoal / Fornecedores)</span>
                    </div>
                    <div className="pt-2 border-t border-[#333]">
                      <button
                        onClick={handleIntegrarContabilidade}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Executar Lançamento Contábil das Retenções
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Inclusão/Edição de Beneficiário */}
      {modalBeneficiarioAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                {editandoBeneficiario ? 'Editar Beneficiário DIRF' : `Novo Beneficiário ${formTipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}`}
              </h3>
              <button
                onClick={() => setModalBeneficiarioAberto(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarBeneficiario} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    {formTipo === 'PF' ? 'CPF' : 'CNPJ'}
                  </label>
                  <input
                    type="text"
                    value={formCpfCnpj}
                    onChange={e => setFormCpfCnpj(e.target.value)}
                    placeholder={formTipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Código de Receita RFB
                  </label>
                  <select
                    value={formCodigoReceita}
                    onChange={e => {
                      setFormCodigoReceita(e.target.value);
                      if (e.target.value === '0561') setFormDescricaoCodigo('Rendimentos do Trabalho Assalariado (CLT / Pró-Labore)');
                      else if (e.target.value === '1708') setFormDescricaoCodigo('Remuneração de Serviços Prestados por Pessoa Jurídica');
                      else if (e.target.value === '3208') setFormDescricaoCodigo('Aluguéis e Royalties Pagos a Pessoa Física');
                      else if (e.target.value === '0588') setFormDescricaoCodigo('Rendimentos de Aplicações Financeiras');
                      else if (e.target.value === '5952') setFormDescricaoCodigo('CSRF Retenção de PIS/COFINS/CSLL');
                    }}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="0561">0561 - Trabalho Assalariado (CLT / Pró-Labore)</option>
                    <option value="1708">1708 - Remuneração de Serviços Prestados por PJ</option>
                    <option value="3208">3208 - Aluguéis e Royalties Pagos a PF</option>
                    <option value="0588">0588 - Rendimentos de Aplicações Financeiras</option>
                    <option value="5952">5952 - Retenção CSRF 4,65%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Nome Completo / Razão Social
                </label>
                <input
                  type="text"
                  value={formNomeRazao}
                  onChange={e => setFormNomeRazao(e.target.value)}
                  placeholder="Nome do titular ou razão social"
                  className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {formTipo === 'PF' && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="chkMolestia"
                    checked={formMolestiaGrave}
                    onChange={e => setFormMolestiaGrave(e.target.checked)}
                    className="rounded bg-[#242424] border-[#3a3a3a] text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="chkMolestia" className="text-xs text-gray-300">
                    Portador de Moléstia Grave (Isenção legal de IRPF)
                  </label>
                </div>
              )}

              {/* Tabela de 12 Meses para Edição */}
              <div className="border border-[#333] rounded-lg p-2.5 bg-[#141414]">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Valores Mensais de Rendimento e Retenção</h4>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {formMeses.map((m, idx) => (
                    <div key={m.mes} className="grid grid-cols-4 gap-2 items-center bg-[#1c1c1c] p-1.5 rounded border border-[#2d2d2d] text-xs">
                      <span className="font-semibold text-gray-300">{MESES_NOMES[m.mes - 1]}:</span>
                      <div>
                        <span className="block text-[10px] text-gray-500">Rend. Bruto</span>
                        <input
                          type="number"
                          step="0.01"
                          value={m.rendimentoBruto}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            const novos = [...formMeses];
                            novos[idx].rendimentoBruto = val;
                            setFormMeses(novos);
                          }}
                          className="w-full px-1.5 py-0.5 rounded bg-[#282828] border border-[#444] text-white font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-500">Previdência</span>
                        <input
                          type="number"
                          step="0.01"
                          value={m.previdenciaOficial}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            const novos = [...formMeses];
                            novos[idx].previdenciaOficial = val;
                            setFormMeses(novos);
                          }}
                          className="w-full px-1.5 py-0.5 rounded bg-[#282828] border border-[#444] text-white font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] text-blue-400">IRRF Retido</span>
                        <input
                          type="number"
                          step="0.01"
                          value={m.irrfRetido}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            const novos = [...formMeses];
                            novos[idx].irrfRetido = val;
                            setFormMeses(novos);
                          }}
                          className="w-full px-1.5 py-0.5 rounded bg-[#282828] border border-blue-500/50 text-blue-300 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#2d2d2d]">
                <button
                  type="button"
                  onClick={() => setModalBeneficiarioAberto(false)}
                  className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                >
                  Salvar Beneficiário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
