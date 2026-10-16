import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Calculator,
  Calendar,
  Layers,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle,
  FileText,
  TrendingDown,
  Building,
  CreditCard,
  Percent
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ContratoFinanciamento,
  ParcelaAmortizacao,
  SistemaAmortizacao,
  TipoOperacaoCredito,
  Empresa
} from '../../types/contabil';

interface FinanciamentosMutuosModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const FinanciamentosMutuosModule: React.FC<FinanciamentosMutuosModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [contratos, setContratos] = useState<ContratoFinanciamento[]>([]);
  const [contratoSelecionadoId, setContratoSelecionadoId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'contratos' | 'cronograma' | 'simulador'>('contratos');
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Formulário do Simulador / Novo Contrato
  const [novoNumero, setNovoNumero] = useState('CTR-2026-002');
  const [novaDescricao, setNovaDescricao] = useState('Financiamento de Máquinas e Equipamentos FINAME');
  const [novaInstituicao, setNovaInstituicao] = useState('Banco Santander Brasil S.A.');
  const [novoTipo, setNovoTipo] = useState<TipoOperacaoCredito>('FINANCIAMENTO_FINAME');
  const [novoSistema, setNovoSistema] = useState<SistemaAmortizacao>('PRICE');
  const [novoValorPrincipal, setNovoValorPrincipal] = useState<number>(150000);
  const [novaTaxaMensal, setNovaTaxaMensal] = useState<number>(1.15);
  const [novoPrazo, setNovoPrazo] = useState<number>(36);
  const [novaCarencia, setNovaCarencia] = useState<number>(0);
  const [novaDataInicio, setNovaDataInicio] = useState<string>('2026-08-01');
  const [simulacaoParcelas, setSimulacaoParcelas] = useState<ParcelaAmortizacao[]>([]);

  const carregarDados = () => {
    const list = dbService.getContratosFinanciamento(empresaAtiva.id);
    setContratos(list);
    if (list.length > 0 && !contratoSelecionadoId) {
      setContratoSelecionadoId(list[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id]);

  // Recalcular simulação sempre que mudar parâmetros
  useEffect(() => {
    const p = dbService.calcularCronogramaAmortizacao(
      novoValorPrincipal,
      novaTaxaMensal,
      novoPrazo,
      novaCarencia,
      novoSistema,
      novaDataInicio
    );
    setSimulacaoParcelas(p);
  }, [novoValorPrincipal, novaTaxaMensal, novoPrazo, novaCarencia, novoSistema, novaDataInicio]);

  const contratoAtivo = contratos.find(c => c.id === contratoSelecionadoId) || contratos[0];

  // Ações de Contrato e Parcelas
  const handleApropriarJuros = (contratoId: string, competencia: string) => {
    const res = dbService.apropriarJurosMensaisContabil(contratoId, competencia);
    if (res.sucesso) {
      setMensagemStatus({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    } else {
      setMensagemStatus({ tipo: 'erro', texto: res.mensagem });
    }
    setTimeout(() => setMensagemStatus(null), 4000);
  };

  const handleLiquidarParcela = (contratoId: string, numeroParcela: number) => {
    const res = dbService.liquidarParcelaFinanciamento(contratoId, numeroParcela);
    if (res.sucesso) {
      setMensagemStatus({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    } else {
      setMensagemStatus({ tipo: 'erro', texto: res.mensagem });
    }
    setTimeout(() => setMensagemStatus(null), 4000);
  };

  const handleSalvarNovoContrato = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoValorPrincipal <= 0 || novoPrazo <= 0) {
      alert('Informe um valor principal e um prazo válidos.');
      return;
    }

    const parcelas = dbService.calcularCronogramaAmortizacao(
      novoValorPrincipal,
      novaTaxaMensal,
      novoPrazo,
      novaCarencia,
      novoSistema,
      novaDataInicio
    );

    const novoContrato: ContratoFinanciamento = {
      id: `finan-${Date.now()}`,
      empresaId: empresaAtiva.id,
      numeroContrato: novoNumero,
      descricao: novaDescricao,
      instituicaoFinanceira: novaInstituicao,
      tipoOperacao: novoTipo,
      sistemaAmortizacao: novoSistema,
      dataContratacao: novaDataInicio,
      dataPrimeiroVencimento: parcelas[0]?.dataVencimento || novaDataInicio,
      prazoMeses: novoPrazo,
      carenciaMeses: novaCarencia,
      valorContratadoPrincipal: novoValorPrincipal,
      taxaJurosMensal: novaTaxaMensal,
      taxaJurosAnual: Math.round(((Math.pow(1 + novaTaxaMensal / 100, 12) - 1) * 100) * 100) / 100,
      indexador: 'PREFIXADO',
      custoEfetivoTotalCet: Math.round((novaTaxaMensal * 12 + 1.5) * 100) / 100,
      iofFinanciado: Math.round(novoValorPrincipal * 0.015 * 100) / 100,
      seguroFinanciado: 0,
      tacTarifa: 750,
      valorLiquidoLiberado: novoValorPrincipal - 750,
      status: 'ATIVO',
      contaPassivoCurtoPrazoId: 24,
      contaPassivoLongoPrazoId: 28,
      contaEncargosApropriarCpId: 25,
      contaEncargosApropriarLpId: 29,
      contaDespesaJurosId: 48,
      contaBancariaLiberacaoId: 2,
      parcelas,
      totalAmortizado: 0,
      saldoDevedorPrincipal: novoValorPrincipal,
      saldoCurtoPrazo: 0,
      saldoLongoPrazo: 0,
      totalJurosAFuturo: 0,
      observacoes: 'Contrato cadastrado via Simulador de Financiamentos Studio Pro.'
    };

    dbService.salvarContratoFinanciamento(novoContrato);
    carregarDados();
    setContratoSelecionadoId(novoContrato.id);
    setActiveTab('cronograma');
    setMensagemStatus({ tipo: 'sucesso', texto: `Contrato ${novoContrato.numeroContrato} cadastrado com sucesso!` });
    setTimeout(() => setMensagemStatus(null), 4000);
  };

  const handleExcluirContrato = (id: string, numero: string) => {
    if (confirm(`Deseja realmente excluir o contrato de financiamento "${numero}"?`)) {
      dbService.excluirContratoFinanciamento(id);
      carregarDados();
      setMensagemStatus({ tipo: 'sucesso', texto: 'Contrato excluído com sucesso.' });
      setTimeout(() => setMensagemStatus(null), 3000);
    }
  };

  // Relatório Oficial A4
  const handleImprimirRelatorio = () => {
    if (!onOpenReportPreview || !contratoAtivo) return;

    const content = (
      <div className="p-8 text-black bg-white max-w-5xl mx-auto font-sans leading-tight text-xs">
        {/* Cabeçalho */}
        <div className="border-b-2 border-black pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-extrabold tracking-tight uppercase">{empresaAtiva.razaoSocial}</h1>
              <p className="text-[11px] text-gray-700">CNPJ: {empresaAtiva.cnpj} | IE: {empresaAtiva.inscricaoEstadual || 'Isento'}</p>
              <p className="text-[10px] text-gray-600">{empresaAtiva.logradouro}, {empresaAtiva.numero} - {empresaAtiva.cidade}/{empresaAtiva.uf}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 border border-black font-bold text-[10px] bg-gray-100 uppercase">
                NBC TG 38 / CPC 48 (IFRS 9)
              </span>
              <p className="text-[10px] text-gray-500 mt-1">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className="text-center mt-3 pt-2 border-t border-gray-300">
            <h2 className="text-sm font-bold tracking-wider uppercase">
              Demonstrativo de Evolução da Dívida e Cronograma de Amortização Financeira
            </h2>
            <p className="text-[11px] text-gray-600 font-semibold">
              Contrato nº {contratoAtivo.numeroContrato} - {contratoAtivo.instituicaoFinanceira} ({contratoAtivo.descricao})
            </p>
          </div>
        </div>

        {/* Resumo da Operação de Crédito */}
        <div className="grid grid-cols-4 gap-2 border border-black p-3 bg-gray-50 mb-4 text-xs">
          <div>
            <span className="block text-[10px] text-gray-500 uppercase">Valor Contratado</span>
            <span className="font-mono font-bold text-sm">
              R$ {contratoAtivo.valorContratadoPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 uppercase">Sistema / Taxa Mensal</span>
            <span className="font-semibold">{contratoAtivo.sistemaAmortizacao} | {contratoAtivo.taxaJurosMensal.toFixed(2)}% a.m.</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 uppercase">Prazo / Carência</span>
            <span className="font-semibold">{contratoAtivo.prazoMeses} meses ({contratoAtivo.carenciaMeses} carência)</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 uppercase">Saldo Devedor Atual</span>
            <span className="font-mono font-bold text-sm text-blue-900">
              R$ {contratoAtivo.saldoDevedorPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-300">
            <span className="block text-[10px] text-gray-500 uppercase">Passivo Circulante (CP)</span>
            <span className="font-mono font-bold text-blue-800">
              R$ {contratoAtivo.saldoCurtoPrazo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-300">
            <span className="block text-[10px] text-gray-500 uppercase">Passivo Não Circulante (LP)</span>
            <span className="font-mono font-bold text-purple-800">
              R$ {contratoAtivo.saldoLongoPrazo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-300">
            <span className="block text-[10px] text-gray-500 uppercase">Total Juros a Futuro</span>
            <span className="font-mono font-bold text-gray-700">
              R$ {contratoAtivo.totalJurosAFuturo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-300">
            <span className="block text-[10px] text-gray-500 uppercase">Total já Amortizado</span>
            <span className="font-mono font-bold text-emerald-800">
              R$ {contratoAtivo.totalAmortizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Tabela do Cronograma */}
        <div className="border border-black mb-6">
          <div className="bg-gray-200 px-3 py-1 font-bold text-xs border-b border-black">
            CRONOGRAMA DE PAGAMENTOS E SEGREGAÇÃO CONTÁBIL (CP vs LP)
          </div>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-semibold">
                <th className="py-1 px-2 border-r border-gray-300">Parc.</th>
                <th className="py-1 px-2 border-r border-gray-300">Vencimento</th>
                <th className="py-1 px-2 border-r border-gray-300 text-right">Prestação</th>
                <th className="py-1 px-2 border-r border-gray-300 text-right">Amortização</th>
                <th className="py-1 px-2 border-r border-gray-300 text-right">Juros Encargos</th>
                <th className="py-1 px-2 border-r border-gray-300 text-right">Saldo Devedor</th>
                <th className="py-1 px-2 border-r border-gray-300 text-center">Classificação</th>
                <th className="py-1 px-2 text-center">Situação</th>
              </tr>
            </thead>
            <tbody>
              {contratoAtivo.parcelas.map(p => (
                <tr key={p.numeroParcela} className="border-b border-gray-200">
                  <td className="py-1 px-2 font-mono border-r border-gray-200">{p.numeroParcela}/{contratoAtivo.prazoMeses}</td>
                  <td className="py-1 px-2 border-r border-gray-200">{new Date(p.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="py-1 px-2 text-right font-mono border-r border-gray-200">
                    R$ {p.valorPrestacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-2 text-right font-mono border-r border-gray-200">
                    R$ {p.amortizacaoPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-2 text-right font-mono border-r border-gray-200">
                    R$ {p.jurosEncargos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-2 text-right font-mono font-bold border-r border-gray-200">
                    R$ {p.saldoDevedorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-2 text-center border-r border-gray-200 font-semibold text-[10px]">
                    {p.segregacao === 'CURTO_PRAZO' ? 'Passivo Circulante (CP)' : 'Não Circulante (LP)'}
                  </td>
                  <td className="py-1 px-2 text-center font-bold text-[10px]">
                    {p.status === 'PAGA' ? 'QUITADA' : 'A VENCER'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quadro de Assinaturas */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-black text-center text-xs">
          <div>
            <div className="border-t border-black pt-1">
              <p className="font-bold uppercase">{empresaAtiva.responsavelLegal || 'Carlos Eduardo da Silva'}</p>
              <p className="text-[10px] text-gray-600">Representante Legal / Administrador</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-1">
              <p className="font-bold uppercase">{empresaAtiva.contadorNome || 'Roberto Barbosa'}</p>
              <p className="text-[10px] text-gray-600">Contador Responsável Técnico (CRC: {empresaAtiva.contadorCRC || 'SP-123456/O-0'})</p>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `Demonstrativo de Financiamento - ${contratoAtivo.numeroContrato}`,
      `Contrato ${contratoAtivo.instituicaoFinanceira}`,
      content,
      'portrait'
    );
  };

  // Métricas Consolidadas
  const totalPrincipal = contratos.reduce((acc, c) => acc + c.saldoDevedorPrincipal, 0);
  const totalCp = contratos.reduce((acc, c) => acc + c.saldoCurtoPrazo, 0);
  const totalLp = contratos.reduce((acc, c) => acc + c.saldoLongoPrazo, 0);
  const totalJurosFuturos = contratos.reduce((acc, c) => acc + c.totalJurosAFuturo, 0);
  const totalAmortizadoGeral = contratos.reduce((acc, c) => acc + c.totalAmortizado, 0);

  return (
    <div className="flex flex-col h-full bg-[#141414] text-white">
      {/* Header Superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#181818] border-b border-[#2d2d2d]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Controle de Empréstimos, Financiamentos e Mútuos
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                CPC 38 / 48 (IFRS 9)
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Tabela Price/SAC, segregação de Curto e Longo Prazo e apropriação mensal de encargos por competência
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('simulador')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Operação de Crédito</span>
          </button>

          <button
            onClick={handleImprimirRelatorio}
            disabled={!contratoAtivo}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 border border-[#444] rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Emitir Relatório A4</span>
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
            <span>Saldo Devedor Total</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white font-mono">
              R$ {totalPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-gray-400 block mt-0.5">Principal a Amortizar</span>
          </div>
        </div>

        <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-300 text-xs font-semibold">
            <span>Passivo Circulante (CP)</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-blue-200 font-mono">
              R$ {totalCp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-blue-400 block mt-0.5">Próximos 12 meses</span>
          </div>
        </div>

        <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
            <span>Não Circulante (LP)</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-purple-200 font-mono">
              R$ {totalLp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-purple-400 block mt-0.5">Após o exercício seguinte</span>
          </div>
        </div>

        <div className="p-3 bg-[#1c1c1c] rounded-lg border border-[#2d2d2d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Encargos a Apropriar</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-amber-200 font-mono">
              R$ {totalJurosFuturos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-gray-400 block mt-0.5">Conta Redutora do Passivo</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
            <span>Total Amortizado</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-emerald-200 font-mono">
              R$ {totalAmortizadoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Parcelas Liquidadas</span>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center space-x-1 px-4 border-b border-[#2d2d2d] bg-[#161616]">
        <button
          onClick={() => setActiveTab('contratos')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'contratos'
              ? 'border-purple-500 text-purple-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Contratos Bancários & Mútuos ({contratos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cronograma')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'cronograma'
              ? 'border-purple-500 text-purple-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Cronograma de Amortização & CP/LP</span>
        </button>

        <button
          onClick={() => setActiveTab('simulador')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'simulador'
              ? 'border-purple-500 text-purple-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador & Nova Operação</span>
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ABA 1: LISTAGEM DE CONTRATOS */}
        {activeTab === 'contratos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contratos.map(c => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all ${
                    contratoSelecionadoId === c.id
                      ? 'border-purple-500 bg-[#1c1c1c] shadow-lg shadow-purple-950/20'
                      : 'border-[#2d2d2d] bg-[#181818] hover:border-[#3d3d3d]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">
                        {c.tipoOperacao.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-bold text-sm text-white mt-0.5">{c.descricao}</h3>
                      <p className="text-xs text-gray-400">{c.instituicaoFinanceira} • {c.numeroContrato}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {c.status}
                    </span>
                  </div>

                  <div className="my-3 py-2 border-y border-[#2d2d2d] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[11px]">Valor Principal:</span>
                      <span className="font-mono font-bold text-white">
                        R$ {c.valorContratadoPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Taxa de Juros:</span>
                      <span className="font-semibold text-purple-300">
                        {c.taxaJurosMensal.toFixed(2)}% a.m. ({c.sistemaAmortizacao})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Saldo Curto Prazo:</span>
                      <span className="font-mono font-bold text-blue-400">
                        R$ {c.saldoCurtoPrazo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Saldo Longo Prazo:</span>
                      <span className="font-mono font-bold text-purple-400">
                        R$ {c.saldoLongoPrazo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[11px] text-gray-400">
                      {c.parcelas.filter(p => p.status === 'PAGA').length}/{c.prazoMeses} parcelas pagas
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setContratoSelecionadoId(c.id);
                          setActiveTab('cronograma');
                        }}
                        className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded text-xs font-medium border border-purple-500/40"
                      >
                        Ver Cronograma
                      </button>
                      <button
                        onClick={() => handleExcluirContrato(c.id, c.numeroContrato)}
                        title="Excluir Contrato"
                        aria-label="Excluir contrato de financiamento"
                        className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-[#252525]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 2: CRONOGRAMA DE AMORTIZAÇÃO DETALHADO */}
        {activeTab === 'cronograma' && contratoAtivo && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#181818] rounded-lg border border-[#2d2d2d]">
              <div className="flex items-center space-x-3">
                <select
                  value={contratoSelecionadoId}
                  onChange={e => setContratoSelecionadoId(e.target.value)}
                  aria-label="Selecione o Contrato de Financiamento"
                  className="bg-[#242424] text-white font-bold text-xs px-3 py-1.5 rounded border border-[#3a3a3a] focus:outline-none focus:border-purple-500"
                >
                  {contratos.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.numeroContrato} - {c.descricao} ({c.instituicaoFinanceira})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">
                  {contratoAtivo.prazoMeses} parcelas • Amortização {contratoAtivo.sistemaAmortizacao}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Curto Prazo (CP): R$ {contratoAtivo.saldoCurtoPrazo.toFixed(2)}</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>Longo Prazo (LP): R$ {contratoAtivo.saldoLongoPrazo.toFixed(2)}</span>
                </span>
              </div>
            </div>

            <div className="border border-[#2d2d2d] rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-gray-400 font-semibold border-b border-[#2d2d2d]">
                    <th className="py-2.5 px-3">Parc.</th>
                    <th className="py-2.5 px-3">Competência</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3 text-right">Prestação</th>
                    <th className="py-2.5 px-3 text-right">Amortização</th>
                    <th className="py-2.5 px-3 text-right">Juros Encargos</th>
                    <th className="py-2.5 px-3 text-right">Saldo Devedor</th>
                    <th className="py-2.5 px-3 text-center">Classificação</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Ações Contábeis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d2d]">
                  {contratoAtivo.parcelas.map(p => (
                    <tr
                      key={p.numeroParcela}
                      className={`hover:bg-[#1e1e1e] transition-colors ${
                        p.status === 'PAGA' ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-mono font-medium text-gray-300">
                        {p.numeroParcela}/{contratoAtivo.prazoMeses}
                      </td>
                      <td className="py-2 px-3 font-mono text-gray-400">{p.competencia}</td>
                      <td className="py-2 px-3 text-gray-300">
                        {new Date(p.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-white">
                        R$ {p.valorPrestacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400">
                        R$ {p.amortizacaoPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-400">
                        R$ {p.jurosEncargos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-300 font-semibold">
                        R$ {p.saldoDevedorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          p.segregacao === 'CURTO_PRAZO'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        }`}>
                          {p.segregacao === 'CURTO_PRAZO' ? 'CP (Circulante)' : 'LP (Não Circ.)'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'PAGA'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {!p.apropriadoContabil && p.jurosEncargos > 0 && (
                            <button
                              onClick={() => handleApropriarJuros(contratoAtivo.id, p.competencia)}
                              title="Apropriar Encargos Mensais no Diário"
                              className="px-2 py-0.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded text-[10px] font-medium"
                            >
                              Apropriar Juros
                            </button>
                          )}
                          {p.status !== 'PAGA' && (
                            <button
                              onClick={() => handleLiquidarParcela(contratoAtivo.id, p.numeroParcela)}
                              title="Liquidar / Pagar Parcela"
                              className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-medium"
                            >
                              Baixar
                            </button>
                          )}
                          {p.status === 'PAGA' && (
                            <span className="text-[10px] text-gray-500 font-mono">Quitada</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: SIMULADOR & NOVA OPERAÇÃO */}
        {activeTab === 'simulador' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 p-4 bg-[#181818] rounded-xl border border-[#2d2d2d]">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-purple-400" />
                <span>Simulador de Empréstimo / Financiamento</span>
              </h3>

              <form onSubmit={handleSalvarNovoContrato} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Número do Contrato</label>
                  <input
                    type="text"
                    value={novoNumero}
                    onChange={e => setNovoNumero(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Descrição da Operação</label>
                  <input
                    type="text"
                    value={novaDescricao}
                    onChange={e => setNovaDescricao(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Instituição Financeira / Credor</label>
                  <input
                    type="text"
                    value={novaInstituicao}
                    onChange={e => setNovaInstituicao(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400 mb-1">Tipo de Operação</label>
                    <select
                      value={novoTipo}
                      onChange={e => setNovoTipo(e.target.value as TipoOperacaoCredito)}
                      className="w-full px-2 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white"
                    >
                      <option value="CAPITAL_GIRO">Capital de Giro</option>
                      <option value="FINANCIAMENTO_FINAME">FINAME BNDES</option>
                      <option value="EMPRESTIMO_BANCARIO">Empréstimo Comercial</option>
                      <option value="MUTUO_PARTES_LIGADAS">Mútuo c/ Sócios</option>
                      <option value="LEASING_FINANCEIRO">Leasing Financeiro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Sistema Amortização</label>
                    <select
                      value={novoSistema}
                      onChange={e => setNovoSistema(e.target.value as SistemaAmortizacao)}
                      className="w-full px-2 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white"
                    >
                      <option value="PRICE">Tabela Price (Fixas)</option>
                      <option value="SAC">Tabela SAC (Decrescentes)</option>
                      <option value="BULLET">Bullet (Final)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400 mb-1">Valor Principal (R$)</label>
                    <input
                      type="number"
                      step="1000"
                      value={novoValorPrincipal}
                      onChange={e => setNovoValorPrincipal(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Taxa Mensal (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={novaTaxaMensal}
                      onChange={e => setNovaTaxaMensal(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400 mb-1">Prazo (Meses)</label>
                    <input
                      type="number"
                      value={novoPrazo}
                      onChange={e => setNovoPrazo(parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Carência (Meses)</label>
                    <input
                      type="number"
                      value={novaCarencia}
                      onChange={e => setNovaCarencia(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Data da Contratação</label>
                  <input
                    type="date"
                    value={novaDataInicio}
                    onChange={e => setNovaDataInicio(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white text-xs font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors shadow"
                >
                  Salvar Operação e Gerar Contrato
                </button>
              </form>
            </div>

            {/* Pré-visualização da Simulação */}
            <div className="lg:col-span-2 p-4 bg-[#181818] rounded-xl border border-[#2d2d2d] flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white">Simulação do Cronograma Gerado ({simulacaoParcelas.length} Parcelas)</h3>
                <span className="text-xs text-purple-400 font-semibold font-mono">
                  1ª Parcela: R$ {simulacaoParcelas[0]?.valorPrestacao.toFixed(2) || '0.00'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto border border-[#2d2d2d] rounded-lg max-h-[460px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#222]">
                    <tr className="text-gray-400 border-b border-[#333]">
                      <th className="py-2 px-2.5">Nº</th>
                      <th className="py-2 px-2.5">Vencimento</th>
                      <th className="py-2 px-2.5 text-right">Prestação</th>
                      <th className="py-2 px-2.5 text-right">Amortização</th>
                      <th className="py-2 px-2.5 text-right">Juros</th>
                      <th className="py-2 px-2.5 text-right">Saldo Devedor</th>
                      <th className="py-2 px-2.5 text-center">Segregação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d2d2d]">
                    {simulacaoParcelas.map(p => (
                      <tr key={p.numeroParcela} className="hover:bg-[#1f1f1f]">
                        <td className="py-1.5 px-2.5 font-mono text-gray-400">{p.numeroParcela}</td>
                        <td className="py-1.5 px-2.5 text-gray-300">{p.dataVencimento}</td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-bold text-white">
                          R$ {p.valorPrestacao.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-emerald-400">
                          R$ {p.amortizacaoPrincipal.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-amber-400">
                          R$ {p.jurosEncargos.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-gray-300">
                          R$ {p.saldoDevedorFinal.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.segregacao === 'CURTO_PRAZO'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          }`}>
                            {p.segregacao === 'CURTO_PRAZO' ? 'CP' : 'LP'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
