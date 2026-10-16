import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  FileText,
  DollarSign,
  Download,
  Copy,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Printer,
  RefreshCw,
  Building,
  Key,
  Users,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  FichaLocacaoDimob,
  FichaIntermediacaoVendaDimob,
  DeclaracaoDimob,
  Empresa,
  RendimentoMensalLocacao
} from '../../types/contabil';

interface DimobModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const DimobModule: React.FC<DimobModuleProps> = ({ empresaAtiva, onOpenReportPreview }) => {
  const [activeTab, setActiveTab] = useState<'locacao' | 'intermediacao' | 'arquivo'>('locacao');
  const [anoCalendario, setAnoCalendario] = useState<number>(2026);
  const [declaracao, setDeclaracao] = useState<DeclaracaoDimob | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [contratoExpandidoId, setContratoExpandidoId] = useState<string | null>(null);

  // Modais
  const [modalLocacaoAberto, setModalLocacaoAberto] = useState(false);
  const [editLocacao, setEditLocacao] = useState<FichaLocacaoDimob | null>(null);

  const [modalIntermediacaoAberto, setModalIntermediacaoAberto] = useState(false);
  const [editIntermediacao, setEditIntermediacao] = useState<FichaIntermediacaoVendaDimob | null>(null);

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, anoCalendario]);

  const carregarDados = () => {
    const dec = dbService.getDeclaracaoDimob(empresaAtiva.id, anoCalendario);
    setDeclaracao(dec);
  };

  const mostrarMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagemStatus({ tipo, texto });
    setTimeout(() => setMensagemStatus(null), 4500);
  };

  const handleSalvarLocacao = (ficha: FichaLocacaoDimob) => {
    dbService.salvarFichaLocacaoDimob(ficha);
    carregarDados();
    setModalLocacaoAberto(false);
    mostrarMensagem('sucesso', 'Contrato de Locação salvo com sucesso!');
  };

  const handleExcluirLocacao = (id: string) => {
    dbService.excluirFichaLocacaoDimob(id);
    carregarDados();
    mostrarMensagem('sucesso', 'Contrato de Locação excluído com sucesso!');
  };

  const handleSalvarIntermediacao = (ficha: FichaIntermediacaoVendaDimob) => {
    dbService.salvarFichaIntermediacaoDimob(ficha);
    carregarDados();
    setModalIntermediacaoAberto(false);
    mostrarMensagem('sucesso', 'Intermediação de Venda salva com sucesso!');
  };

  const handleExcluirIntermediacao = (id: string) => {
    dbService.excluirFichaIntermediacaoDimob(id);
    carregarDados();
    mostrarMensagem('sucesso', 'Registro de Intermediação excluído com sucesso!');
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarDimobContabil(empresaAtiva.id, anoCalendario);
    if (res.sucesso) {
      mostrarMensagem('sucesso', res.mensagem);
    } else {
      mostrarMensagem('erro', res.mensagem);
    }
  };

  const handleCopiarTxt = () => {
    if (!declaracao?.arquivoDimobTxt) return;
    navigator.clipboard.writeText(declaracao.arquivoDimobTxt);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2500);
  };

  const handleBaixarTxt = () => {
    if (!declaracao?.arquivoDimobTxt) return;
    const blob = new Blob([declaracao.arquivoDimobTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DIMOB_${empresaAtiva.cnpj.replace(/\D/g, '')}_${anoCalendario}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Impressão A4 Oficial: Informe de Rendimentos de Locação
  const handleImprimirInformeLocacao = (ficha?: FichaLocacaoDimob) => {
    if (!declaracao || !onOpenReportPreview) return;
    const alvo = ficha || declaracao.fichasLocacao[0];
    if (!alvo) {
      mostrarMensagem('erro', 'Nenhum contrato de locação selecionado para emissão do informe.');
      return;
    }

    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const content = (
      <div className="font-sans text-xs text-neutral-800 leading-relaxed">
        <div className="border-b-2 border-neutral-700 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-bold text-neutral-900 uppercase">
                {empresaAtiva.razaoSocial}
              </h1>
              <p className="text-xs text-neutral-600">
                CNPJ da Administradora: {empresaAtiva.cnpj} | CRECI: 12.345-J
              </p>
              <p className="text-xs text-neutral-600">
                Endereço: {empresaAtiva.logradouro}, {empresaAtiva.numero} - {empresaAtiva.cidade}/{empresaAtiva.uf}
              </p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 font-mono font-bold text-xs rounded">
                DIMOB - INFORME ANUAL DE LOCAÇÃO
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">
                Ano-Calendário: {anoCalendario} | IN RFB nº 1.987/2020
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 bg-neutral-50 p-2.5 border border-neutral-300 rounded">
          <h2 className="text-xs font-bold uppercase text-neutral-800 mb-1">1. Identificação do Proprietário / Locador</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">Nome / Razão Social:</span>
              <strong className="text-neutral-900">{alvo.locadorNome}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">CPF / CNPJ:</span>
              <strong className="font-mono text-neutral-900">{alvo.locadorCpfCnpj}</strong>
            </div>
          </div>
        </div>

        <div className="mb-4 bg-neutral-50 p-2.5 border border-neutral-300 rounded">
          <h2 className="text-xs font-bold uppercase text-neutral-800 mb-1">2. Identificação do Imóvel e do Inquilino (Locatário)</h2>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">Endereço do Imóvel:</span>
              <strong className="text-neutral-900">{alvo.enderecoImovel}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Município / UF / CEP:</span>
              <strong className="text-neutral-900">{alvo.municipioImovel}/{alvo.ufImovel} - {alvo.cepImovel}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Contrato Nº / Tipo:</span>
              <strong className="font-mono text-neutral-900">{alvo.numeroContrato} ({alvo.tipoImovel})</strong>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">Locatário (Inquilino):</span>
              <strong className="text-neutral-900">{alvo.locatarioNome}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">CPF / CNPJ do Locatário:</span>
              <strong className="font-mono text-neutral-900">{alvo.locatarioCpfCnpj}</strong>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase text-neutral-800 mb-2">3. Discriminação Mensal dos Rendimentos e Retenções (R$)</h2>
          <table className="w-full border-collapse text-left border border-neutral-300">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 text-[10px]">
                <th className="p-1 border border-neutral-300">Mês</th>
                <th className="p-1 border border-neutral-300 text-right">Aluguel Bruto (R$)</th>
                <th className="p-1 border border-neutral-300 text-right">Taxa Adm / Comissão (R$)</th>
                <th className="p-1 border border-neutral-300 text-right">IRRF Retido (R$)</th>
                <th className="p-1 border border-neutral-300 text-right">Líquido Repassado (R$)</th>
              </tr>
            </thead>
            <tbody>
              {alvo.rendimentosMensais.map((m, idx) => (
                <tr key={m.mes} className="border-b border-neutral-200">
                  <td className="p-1 border border-neutral-300 font-medium">{mesesNomes[idx]}</td>
                  <td className="p-1 border border-neutral-300 text-right font-mono">
                    {m.rendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono text-neutral-600">
                    {m.valorComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono text-red-600">
                    {m.impostoRetidoFonte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono font-bold text-emerald-700">
                    {m.rendimentoLiquidoLocador.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold">
                <td className="p-1.5 border border-neutral-300 text-right">TOTAL CONSOLIDADO (R$):</td>
                <td className="p-1.5 border border-neutral-300 text-right font-mono">
                  {alvo.totalAnualBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1.5 border border-neutral-300 text-right font-mono text-neutral-700">
                  {alvo.totalAnualComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1.5 border border-neutral-300 text-right font-mono text-red-700">
                  {alvo.totalAnualIrrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1.5 border border-neutral-300 text-right font-mono text-emerald-800">
                  {alvo.totalAnualLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-2.5 bg-neutral-100 border border-neutral-300 rounded text-[10px] text-neutral-600 mb-6">
          <p className="font-bold mb-1">INSTRUÇÕES PARA PREENCHIMENTO DA DECLARAÇÃO DE AJUSTE ANUAL DO IRPF:</p>
          <p>
            Os valores informados acima foram declarados à Secretaria Especial da Receita Federal do Brasil por meio da Declaração de Informações sobre Atividades Imobiliárias (DIMOB). O valor de Aluguel Bruto deduzido da Comissão da Imobiliária constitui o Rendimento Tributável do Locador, sujeito ao Carnê-Leão ou Ajuste Anual.
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-neutral-300 flex justify-between text-center text-xs">
          <div className="w-64 border-t border-neutral-700 pt-1">
            <p className="font-bold">{empresaAtiva.responsavelLegal || 'Administrador Imobiliário'}</p>
            <p className="text-[10px] text-neutral-500">CRECI/SP nº 12.345-J</p>
          </div>
          <div className="w-64 border-t border-neutral-700 pt-1">
            <p className="font-bold">{empresaAtiva.contadorNome || 'Contador Responsável'}</p>
            <p className="text-[10px] text-neutral-500">CRC: {empresaAtiva.contadorCRC || 'Ativo'}</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `Informe Anual de Rendimentos de Locação - Contrato ${alvo.numeroContrato}`,
      `Locador: ${alvo.locadorNome} | Imóvel: ${alvo.codigoImovel}`,
      content,
      'portrait'
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#181818]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                DIMOB - Declaração de Informações sobre Atividades Imobiliárias
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                IN RFB 1.987/2020
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Controle de Locação de Imóveis (R02), Intermediação em Vendas (R03) e Geração Oficial do Arquivo DIMOB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#202020] border border-neutral-700 rounded-md">
            <span className="text-xs text-neutral-400 font-medium">Ano-Calendário:</span>
            <select
              value={anoCalendario}
              onChange={e => setAnoCalendario(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#1c1c1c]">2026</option>
              <option value={2025} className="bg-[#1c1c1c]">2025</option>
              <option value={2024} className="bg-[#1c1c1c]">2024</option>
            </select>
          </div>

          <button
            onClick={handleIntegrarContabil}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md text-xs font-medium text-emerald-400 transition-colors"
            title="Lançar receitas de comissão no Livro Diário Geral"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Integrar Contabilidade
          </button>

          <button
            onClick={() => handleImprimirInformeLocacao()}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md text-xs font-medium text-blue-400 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Informe Locador A4
          </button>

          <button
            onClick={handleBaixarTxt}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar .txt DIMOB
          </button>
        </div>
      </div>

      {/* Banner de Feedback */}
      {mensagemStatus && (
        <div className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
          mensagemStatus.tipo === 'sucesso' 
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
            : 'bg-red-950/60 text-red-300 border-red-800/40'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {mensagemStatus.texto}
          </div>
          <button onClick={() => setMensagemStatus(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-[#181818]/50 border-b border-neutral-800">
        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Locações Administradas</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {declaracao?.fichasLocacao.length || 0} Contratos
          </div>
          <span className="text-[10px] text-neutral-500">
            Total Aluguéis: R$ {(declaracao?.totalGeralLocacoesBruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Comissões de Locação</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {(declaracao?.totalGeralComissoesLocacao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500">
            Taxa média de 10% s/ aluguéis
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Intermediações em Vendas</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {declaracao?.fichasIntermediacao.length || 0} Imóveis
          </div>
          <span className="text-[10px] text-neutral-500">
            Volume: R$ {(declaracao?.totalGeralVendas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Comissões de Vendas</span>
            <Receipt className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {(declaracao?.totalGeralComissoesVenda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            Total Receita Imob: R$ {((declaracao?.totalGeralComissoesLocacao || 0) + (declaracao?.totalGeralComissoesVenda || 0)).toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 border-b border-neutral-800 bg-[#161616]">
        <button
          onClick={() => setActiveTab('locacao')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'locacao'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          Ficha de Locação de Imóveis (R02)
          <span className="px-1.5 py-0.2 bg-neutral-800 text-[10px] rounded-full text-neutral-300">
            {declaracao?.fichasLocacao.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('intermediacao')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'intermediacao'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          Ficha de Intermediação na Venda (R03)
          <span className="px-1.5 py-0.2 bg-neutral-800 text-[10px] rounded-full text-neutral-300">
            {declaracao?.fichasIntermediacao.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('arquivo')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'arquivo'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Arquivo Oficial DIMOB (.txt)
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto p-6">
        {/* ABA 1: LOCAÇÃO R02 */}
        {activeTab === 'locacao' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Contratos de Locação de Imóveis (Registro R02)
                </h3>
                <p className="text-xs text-neutral-400">
                  Rendimento de aluguéis, comissões cobradas pela imobiliária e retenções de IRRF dos locadores.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditLocacao({
                    id: `dimob-loc-${Date.now()}`,
                    empresaId: empresaAtiva.id,
                    anoReferencia: anoCalendario,
                    numeroContrato: '',
                    dataContrato: `${anoCalendario}-01-01`,
                    codigoImovel: '',
                    tipoImovel: 'URBANO',
                    enderecoImovel: '',
                    cepImovel: '',
                    municipioImovel: 'São Paulo',
                    ufImovel: 'SP',
                    locadorCpfCnpj: '',
                    locadorNome: '',
                    locatarioCpfCnpj: '',
                    locatarioNome: '',
                    rendimentosMensais: Array.from({ length: 12 }, (_, i) => ({
                      mes: i + 1,
                      rendimentoBruto: 3000,
                      valorComissao: 300,
                      impostoRetidoFonte: 0,
                      rendimentoLiquidoLocador: 2700
                    })),
                    totalAnualBruto: 36000,
                    totalAnualComissao: 3600,
                    totalAnualIrrf: 0,
                    totalAnualLiquido: 32400
                  });
                  setModalLocacaoAberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                Novo Contrato de Locação
              </button>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                    <th className="p-3 w-8"></th>
                    <th className="p-3 font-semibold">Contrato / Imóvel</th>
                    <th className="p-3 font-semibold">Locador (Proprietário)</th>
                    <th className="p-3 font-semibold">Locatário (Inquilino)</th>
                    <th className="p-3 font-semibold text-right">Aluguel Anual</th>
                    <th className="p-3 font-semibold text-right">Comissão Imob</th>
                    <th className="p-3 font-semibold text-right">IRRF Retido</th>
                    <th className="p-3 font-semibold text-right">Líquido Repassado</th>
                    <th className="p-3 font-semibold text-center w-28">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {declaracao?.fichasLocacao.map(loc => (
                    <React.Fragment key={loc.id}>
                      <tr className="hover:bg-neutral-800/40">
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setContratoExpandidoId(contratoExpandidoId === loc.id ? null : loc.id)}
                            className="text-neutral-400 hover:text-white"
                          >
                            {contratoExpandidoId === loc.id ? (
                              <ChevronDown className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-white">{loc.numeroContrato}</div>
                          <div className="text-[10px] text-neutral-400">{loc.enderecoImovel}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-white font-medium">{loc.locadorNome}</div>
                          <div className="text-[10px] font-mono text-neutral-400">{loc.locadorCpfCnpj}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-neutral-200">{loc.locatarioNome}</div>
                          <div className="text-[10px] font-mono text-neutral-400">{loc.locatarioCpfCnpj}</div>
                        </td>
                        <td className="p-3 text-right font-mono text-neutral-200">
                          R$ {loc.totalAnualBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-amber-400">
                          R$ {loc.totalAnualComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono text-red-400">
                          R$ {loc.totalAnualIrrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          R$ {loc.totalAnualLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleImprimirInformeLocacao(loc)}
                              className="p-1 text-neutral-400 hover:text-blue-400"
                              title="Imprimir Informe do Locador"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditLocacao({ ...loc });
                                setModalLocacaoAberto(true);
                              }}
                              className="p-1 text-neutral-400 hover:text-white"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExcluirLocacao(loc.id)}
                              className="p-1 text-neutral-400 hover:text-red-400"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Grade Mensal Expandida */}
                      {contratoExpandidoId === loc.id && (
                        <tr className="bg-[#121212]">
                          <td colSpan={9} className="p-4 border-y border-neutral-800">
                            <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5" />
                              Memória Mensal de Rendimentos - Contrato {loc.numeroContrato}
                            </h4>
                            <div className="grid grid-cols-6 gap-2 text-[11px]">
                              {loc.rendimentosMensais.map(m => (
                                <div key={m.mes} className="p-2 bg-[#1c1c1c] border border-neutral-800 rounded">
                                  <div className="text-neutral-400 font-semibold mb-1">Mês {m.mes.toString().padStart(2, '0')}</div>
                                  <div className="text-neutral-300 font-mono">Bruto: R$ {m.rendimentoBruto.toLocaleString('pt-BR')}</div>
                                  <div className="text-amber-400 font-mono">Comissão: R$ {m.valorComissao.toLocaleString('pt-BR')}</div>
                                  <div className="text-red-400 font-mono">IRRF: R$ {m.impostoRetidoFonte.toLocaleString('pt-BR')}</div>
                                  <div className="text-emerald-400 font-mono font-bold mt-1 border-t border-neutral-800 pt-1">
                                    Líq: R$ {m.rendimentoLiquidoLocador.toLocaleString('pt-BR')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {(!declaracao?.fichasLocacao || declaracao.fichasLocacao.length === 0) && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-neutral-500">
                        Nenhum contrato de locação escriturado para este ano-calendário.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-[#202020] border-t border-neutral-700 font-bold">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-neutral-300">Totais Consolidados:</td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      R$ {(declaracao?.totalGeralLocacoesBruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-400">
                      R$ {(declaracao?.totalGeralComissoesLocacao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-red-400">
                      R$ {declaracao?.fichasLocacao.reduce((acc, l) => acc + l.totalAnualIrrf, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      R$ {declaracao?.fichasLocacao.reduce((acc, l) => acc + l.totalAnualLiquido, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: INTERMEDIAÇÃO R03 */}
        {activeTab === 'intermediacao' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Intermediação em Vendas de Imóveis (Registro R03)
                </h3>
                <p className="text-xs text-neutral-400">
                  Escrituração de corretagens imobiliárias com comprador, vendedor e nota fiscal de comissão.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditIntermediacao({
                    id: `dimob-vda-${Date.now()}`,
                    empresaId: empresaAtiva.id,
                    anoReferencia: anoCalendario,
                    numeroContrato: '',
                    dataContrato: `${anoCalendario}-01-01`,
                    codigoImovel: '',
                    enderecoImovel: '',
                    municipioImovel: 'São Paulo',
                    ufImovel: 'SP',
                    cepImovel: '',
                    vendedorCpfCnpj: '',
                    vendedorNome: '',
                    compradorCpfCnpj: '',
                    compradorNome: '',
                    dataTransacao: `${anoCalendario}-06-01`,
                    valorTotalVenda: 500000,
                    valorComissaoImobiliaria: 30000,
                    numeroNotaFiscal: ''
                  });
                  setModalIntermediacaoAberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                Nova Intermediação de Venda
              </button>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                    <th className="p-3 font-semibold">Contrato / Imóvel</th>
                    <th className="p-3 font-semibold">Vendedor</th>
                    <th className="p-3 font-semibold">Comprador</th>
                    <th className="p-3 font-semibold text-center">Data Venda</th>
                    <th className="p-3 font-semibold text-right">Valor da Transação</th>
                    <th className="p-3 font-semibold text-right">Comissão Imobiliária</th>
                    <th className="p-3 font-semibold text-center">NF-e</th>
                    <th className="p-3 font-semibold text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {declaracao?.fichasIntermediacao.map(v => (
                    <tr key={v.id} className="hover:bg-neutral-800/40">
                      <td className="p-3">
                        <div className="font-mono font-bold text-white">{v.numeroContrato}</div>
                        <div className="text-[10px] text-neutral-400">{v.enderecoImovel}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-white font-medium">{v.vendedorNome}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{v.vendedorCpfCnpj}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-neutral-200">{v.compradorNome}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{v.compradorCpfCnpj}</div>
                      </td>
                      <td className="p-3 text-center font-mono text-neutral-300">
                        {v.dataTransacao}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-200">
                        R$ {v.valorTotalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-purple-400">
                        R$ {v.valorComissaoImobiliaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center font-mono text-amber-400">
                        {v.numeroNotaFiscal || '-'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditIntermediacao({ ...v });
                              setModalIntermediacaoAberto(true);
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirIntermediacao(v.id)}
                            className="p-1 text-neutral-400 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!declaracao?.fichasIntermediacao || declaracao.fichasIntermediacao.length === 0) && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-500">
                        Nenhuma venda intermediada escriturada para este ano-calendário.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-[#202020] border-t border-neutral-700 font-bold">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-neutral-300">Totais Consolidados:</td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      R$ {(declaracao?.totalGeralVendas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-purple-400">
                      R$ {(declaracao?.totalGeralComissoesVenda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: ARQUIVO DIMOB */}
        {activeTab === 'arquivo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Arquivo Texto Oficial para o Validador DIMOB (RFB)
                </h3>
                <p className="text-xs text-neutral-400">
                  Layout homologado conforme a Instrução Normativa RFB nº 1.987/2020.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopiarTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-xs text-neutral-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedTxt ? 'Copiado!' : 'Copiar Texto'}
                </button>
                <button
                  onClick={handleBaixarTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Arquivo .txt
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#0d0d0d] border border-neutral-800 rounded-lg font-mono text-xs text-emerald-300/90 whitespace-pre overflow-x-auto max-h-[500px]">
              {declaracao?.arquivoDimobTxt || 'Gerando arquivo DIMOB...'}
            </div>
          </div>
        )}
      </div>

      {/* Modal Locação */}
      {modalLocacaoAberto && editLocacao && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-white mb-4">
              Cadastro de Contrato de Locação (DIMOB R02)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Nº do Contrato:</label>
                  <input
                    type="text"
                    value={editLocacao.numeroContrato}
                    onChange={e => setEditLocacao({ ...editLocacao, numeroContrato: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                    placeholder="LOC-2026/01"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Data do Contrato:</label>
                  <input
                    type="date"
                    value={editLocacao.dataContrato}
                    onChange={e => setEditLocacao({ ...editLocacao, dataContrato: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo do Imóvel:</label>
                  <select
                    value={editLocacao.tipoImovel}
                    onChange={e => setEditLocacao({ ...editLocacao, tipoImovel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  >
                    <option value="URBANO">Urbano</option>
                    <option value="RURAL">Rural</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Endereço Completo do Imóvel:</label>
                <input
                  type="text"
                  value={editLocacao.enderecoImovel}
                  onChange={e => setEditLocacao({ ...editLocacao, enderecoImovel: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  placeholder="Av. Paulista, 1000, Apto 42"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">CEP:</label>
                  <input
                    type="text"
                    value={editLocacao.cepImovel}
                    onChange={e => setEditLocacao({ ...editLocacao, cepImovel: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                    placeholder="01310-100"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Município:</label>
                  <input
                    type="text"
                    value={editLocacao.municipioImovel}
                    onChange={e => setEditLocacao({ ...editLocacao, municipioImovel: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">UF:</label>
                  <input
                    type="text"
                    value={editLocacao.ufImovel}
                    onChange={e => setEditLocacao({ ...editLocacao, ufImovel: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono uppercase"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-neutral-400 block mb-1">Locador (Nome / Razão):</label>
                  <input
                    type="text"
                    value={editLocacao.locadorNome}
                    onChange={e => setEditLocacao({ ...editLocacao, locadorNome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CPF/CNPJ do Locador:</label>
                  <input
                    type="text"
                    value={editLocacao.locadorCpfCnpj}
                    onChange={e => setEditLocacao({ ...editLocacao, locadorCpfCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Locatário (Inquilino):</label>
                  <input
                    type="text"
                    value={editLocacao.locatarioNome}
                    onChange={e => setEditLocacao({ ...editLocacao, locatarioNome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CPF/CNPJ do Locatário:</label>
                  <input
                    type="text"
                    value={editLocacao.locatarioCpfCnpj}
                    onChange={e => setEditLocacao({ ...editLocacao, locatarioCpfCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <label className="text-neutral-400 block mb-1 font-semibold text-emerald-400">
                  Preenchimento Rápido do Aluguel Mensal (R$):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    id="inpAluguelRapido"
                    placeholder="Valor mensal (ex: 5000)"
                    defaultValue={editLocacao.rendimentosMensais[0]?.rendimentoBruto || 3000}
                    className="w-48 px-3 py-1.5 bg-[#252525] border border-neutral-700 rounded text-white font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = document.getElementById('inpAluguelRapido') as HTMLInputElement;
                      const val = Number(inp?.value || 3000);
                      const comissao = val * 0.10;
                      const irrf = val > 4664 ? val * 0.275 : val > 3751 ? val * 0.225 : 0;
                      const liq = val - comissao - irrf;

                      const meses = Array.from({ length: 12 }, (_, i) => ({
                        mes: i + 1,
                        rendimentoBruto: val,
                        valorComissao: comissao,
                        impostoRetidoFonte: irrf,
                        rendimentoLiquidoLocador: liq
                      }));

                      setEditLocacao({
                        ...editLocacao,
                        rendimentosMensais: meses,
                        totalAnualBruto: val * 12,
                        totalAnualComissao: comissao * 12,
                        totalAnualIrrf: irrf * 12,
                        totalAnualLiquido: liq * 12
                      });
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded text-xs"
                  >
                    Aplicar aos 12 Meses
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalLocacaoAberto(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSalvarLocacao(editLocacao)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
              >
                Salvar Contrato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Intermediação */}
      {modalIntermediacaoAberto && editIntermediacao && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              Cadastro de Intermediação em Venda (DIMOB R03)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Nº do Contrato/Recibo:</label>
                  <input
                    type="text"
                    value={editIntermediacao.numeroContrato}
                    onChange={e => setEditIntermediacao({ ...editIntermediacao, numeroContrato: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Data da Venda:</label>
                  <input
                    type="date"
                    value={editIntermediacao.dataTransacao}
                    onChange={e => setEditIntermediacao({ ...editIntermediacao, dataTransacao: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Endereço do Imóvel:</label>
                <input
                  type="text"
                  value={editIntermediacao.enderecoImovel}
                  onChange={e => setEditIntermediacao({ ...editIntermediacao, enderecoImovel: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Vendedor (Nome):</label>
                  <input
                    type="text"
                    value={editIntermediacao.vendedorNome}
                    onChange={e => setEditIntermediacao({ ...editIntermediacao, vendedorNome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CPF/CNPJ Vendedor:</label>
                  <input
                    type="text"
                    value={editIntermediacao.vendedorCpfCnpj}
                    onChange={e => setEditIntermediacao({ ...editIntermediacao, vendedorCpfCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Comprador (Nome):</label>
                  <input
                    type="text"
                    value={editIntermediacao.compradorNome}
                    onChange={e => setEditIntermediacao({ ...editIntermediacao, compradorNome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CPF/CNPJ Comprador:</label>
                  <input
                    type="text"
                    value={editIntermediacao.compradorCpfCnpj}
                    onChange={e => setEditIntermediacao({ ...editIntermediacao, compradorCpfCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Valor Venda (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editIntermediacao.valorTotalVenda}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setEditIntermediacao({
                        ...editIntermediacao,
                        valorTotalVenda: v,
                        valorComissaoImobiliaria: v * 0.06
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Comissão (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editIntermediacao.valorComissaoImobiliaria}
                    onChange={e => setEditIntermediacao({ ...editIntermediacao, valorComissaoImobiliaria: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono font-bold text-purple-400"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Nº Nota Fiscal:</label>
                  <input
                    type="text"
                    placeholder="NF-e"
                    value={editIntermediacao.numeroNotaFiscal}
                    onChange={e => setEditIntermediacao({ ...editIntermediacao, numeroNotaFiscal: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalIntermediacaoAberto(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSalvarIntermediacao(editIntermediacao)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
              >
                Salvar Intermediação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
