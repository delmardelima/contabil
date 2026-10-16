import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ContratoLeasingCPC06, TipoAtivoLeasing, StatusContratoLeasing } from '../../types/contabil';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Calculator,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  Layers,
  Building,
  KeyRound,
  Percent,
  TrendingDown
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface LeasingCpc06ModuleProps {
  empresa: Empresa;
  onIntegracaoSucesso?: () => void;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const LeasingCpc06Module: React.FC<LeasingCpc06ModuleProps> = ({
  empresa,
  onIntegracaoSucesso,
  onOpenReportPreview
}) => {
  const [contratos, setContratos] = useState<ContratoLeasingCPC06[]>(() => dbService.getContratosLeasing(empresa.id));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<ContratoLeasingCPC06 | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [processandoApropriacao, setProcessandoApropriacao] = useState<boolean>(false);

  // Form State
  const [numeroContrato, setNumeroContrato] = useState<string>('');
  const [arrendador, setArrendador] = useState<string>('');
  const [descricaoBem, setDescricaoBem] = useState<string>('');
  const [tipoAtivo, setTipoAtivo] = useState<TipoAtivoLeasing>('VEICULOS');
  const [dataContrato, setDataContrato] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dataInicio, setDataInicio] = useState<string>(new Date().toISOString().slice(0, 10));
  const [prazoMeses, setPrazoMeses] = useState<number>(48);
  const [taxaDescontoAnual, setTaxaDescontoAnual] = useState<number>(12.0);
  const [valorParcelaMensal, setValorParcelaMensal] = useState<string>('5000,00');
  const [valorTotalNominal, setValorTotalNominal] = useState<string>('240000,00');
  const [valorPresenteInicial, setValorPresenteInicial] = useState<string>('189500,00');
  const [saldoDireitoUso, setSaldoDireitoUso] = useState<string>('189500,00');
  const [saldoPassivoArrendamento, setSaldoPassivoArrendamento] = useState<string>('189500,00');
  const [status, setStatus] = useState<StatusContratoLeasing>('ATIVO');
  const [observacoes, setObservacoes] = useState<string>('');

  // Totais
  const totalContratos = contratos.length;
  const totalPresente = contratos.reduce((sum, c) => sum + (c.valorPresenteInicial || 0), 0);
  const totalDireitoUso = contratos.reduce((sum, c) => sum + (c.saldoDireitoUso || 0), 0);
  const totalPassivo = contratos.reduce((sum, c) => sum + (c.saldoPassivoArrendamento || 0), 0);
  const totalPassivoCP = contratos.reduce((sum, c) => sum + (c.passivoCirculante || 0), 0);
  const totalPassivoLP = contratos.reduce((sum, c) => sum + (c.passivoNaoCirculante || 0), 0);
  const totalAmortMensal = contratos.reduce((sum, c) => c.status === 'ATIVO' ? sum + (c.amortizacaoMensalDireitoUso || 0) : sum, 0);
  const totalJurosMes = contratos.reduce((sum, c) => c.status === 'ATIVO' ? sum + (c.jurosApropriarMes || 0) : sum, 0);

  const handleRecarregar = () => {
    setContratos(dbService.getContratosLeasing(empresa.id));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const calcularValoresAutomaticos = (parcela: number, meses: number, taxaAnual: number) => {
    const totalNom = parcela * meses;
    const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
    // PV = PMT * [1 - (1 + i)^-n] / i
    const vp = taxaMensal > 0 ? parcela * ((1 - Math.pow(1 + taxaMensal, -meses)) / taxaMensal) : totalNom;
    const amortMensal = meses > 0 ? vp / meses : 0;
    const jurosPrimeiroMes = vp * taxaMensal;
    return {
      nominal: Math.round(totalNom * 100) / 100,
      valorPresente: Math.round(vp * 100) / 100,
      amortizacao: Math.round(amortMensal * 100) / 100,
      juros: Math.round(jurosPrimeiroMes * 100) / 100
    };
  };

  const handleAbrirCriar = () => {
    setEditando(null);
    setNumeroContrato(`CTR-LEAS-${new Date().getFullYear()}/${String(contratos.length + 1).padStart(3, '0')}`);
    setArrendador('');
    setDescricaoBem('');
    setTipoAtivo('VEICULOS');
    setDataContrato(new Date().toISOString().slice(0, 10));
    setDataInicio(new Date().toISOString().slice(0, 10));
    setPrazoMeses(48);
    setTaxaDescontoAnual(12.0);
    setValorParcelaMensal('6000,00');

    const calcs = calcularValoresAutomaticos(6000, 48, 12);
    setValorTotalNominal(calcs.nominal.toFixed(2).replace('.', ','));
    setValorPresenteInicial(calcs.valorPresente.toFixed(2).replace('.', ','));
    setSaldoDireitoUso(calcs.valorPresente.toFixed(2).replace('.', ','));
    setSaldoPassivoArrendamento(calcs.valorPresente.toFixed(2).replace('.', ','));
    setStatus('ATIVO');
    setObservacoes('');
    setShowModal(true);
  };

  const handleAbrirEditar = (item: ContratoLeasingCPC06) => {
    setEditando(item);
    setNumeroContrato(item.numeroContrato);
    setArrendador(item.arrendador);
    setDescricaoBem(item.descricaoBem);
    setTipoAtivo(item.tipoAtivo);
    setDataContrato(item.dataContrato);
    setDataInicio(item.dataInicio);
    setPrazoMeses(item.prazoMeses);
    setTaxaDescontoAnual(item.taxaDescontoAnual);
    setValorParcelaMensal(item.valorParcelaMensal.toFixed(2).replace('.', ','));
    setValorTotalNominal(item.valorTotalNominal.toFixed(2).replace('.', ','));
    setValorPresenteInicial(item.valorPresenteInicial.toFixed(2).replace('.', ','));
    setSaldoDireitoUso(item.saldoDireitoUso.toFixed(2).replace('.', ','));
    setSaldoPassivoArrendamento(item.saldoPassivoArrendamento.toFixed(2).replace('.', ','));
    setStatus(item.status);
    setObservacoes(item.observacoes || '');
    setShowModal(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricaoBem.trim() || !arrendador.trim()) {
      alert('Informe o arrendador e a descrição do bem arrendado.');
      return;
    }

    const nParcela = parseValor(valorParcelaMensal);
    const nPresente = parseValor(valorPresenteInicial);
    const nSaldoAtivo = parseValor(saldoDireitoUso);
    const nSaldoPassivo = parseValor(saldoPassivoArrendamento);

    const calcs = calcularValoresAutomaticos(nParcela, prazoMeses, taxaDescontoAnual);
    const passivoCP = Math.min(nSaldoPassivo, nParcela * 12);
    const passivoLP = Math.max(0, nSaldoPassivo - passivoCP);

    const novoContrato: ContratoLeasingCPC06 = {
      id: editando ? editando.id : `leas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      empresaId: empresa.id,
      numeroContrato: numeroContrato.trim(),
      arrendador: arrendador.trim(),
      descricaoBem: descricaoBem.trim(),
      tipoAtivo,
      dataContrato,
      dataInicio,
      prazoMeses,
      taxaDescontoAnual,
      valorParcelaMensal: nParcela,
      valorTotalNominal: calcs.nominal,
      valorPresenteInicial: nPresente > 0 ? nPresente : calcs.valorPresente,
      saldoDireitoUso: nSaldoAtivo,
      saldoPassivoArrendamento: nSaldoPassivo,
      passivoCirculante: passivoCP,
      passivoNaoCirculante: passivoLP,
      amortizacaoMensalDireitoUso: calcs.amortizacao,
      jurosApropriarMes: calcs.juros,
      contaDireitoUsoId: 15,
      contaAmortizacaoAcumuladaId: 16,
      contaPassivoCirculanteId: 23,
      contaPassivoNaoCirculanteId: 27,
      contaDespesaJurosId: 46,
      contaDespesaAmortizacaoId: 45,
      status,
      observacoes: observacoes.trim()
    };

    dbService.salvarContratoLeasing(novoContrato);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Contrato ${novoContrato.numeroContrato} salvo com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleExcluir = (id: string, num: string) => {
    if (confirm(`Confirma a exclusão do contrato ${num}?`)) {
      dbService.excluirContratoLeasing(id);
      handleRecarregar();
    }
  };

  const handleApropriarMensal = () => {
    const comp = empresa.competenciaAtiva || '2026-03';
    if (!confirm(`Efetuar a apropriação mensal de Leasing (CPC 06 R2) para a competência ${comp}?\n\nSerão geradas partidas duplas automáticas de amortização do Direito de Uso e apropriação dos juros do passivo.`)) {
      return;
    }

    setProcessandoApropriacao(true);
    try {
      const res = dbService.apropriarMensalLeasingCPC06(empresa.id, comp);
      handleRecarregar();
      if (onIntegracaoSucesso) {
        onIntegracaoSucesso();
      }
      setMensagemSucesso(res.mensagem);
      setTimeout(() => setMensagemSucesso(''), 6000);
    } catch (err: any) {
      alert(`Erro ao apropriar leasing: ${err?.message || err}`);
    } finally {
      setProcessandoApropriacao(false);
    }
  };

  const handleImprimirLaudo = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="p-8 text-neutral-800 bg-white font-sans text-xs">
        {/* Cabeçalho Timbrado */}
        <div className="border-b-2 border-neutral-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
                {empresa.razaoSocial}
              </h1>
              <p className="text-neutral-600 font-mono text-[11px] mt-0.5">
                CNPJ: {empresa.cnpj} | Competência: {empresa.competenciaAtiva} | Regime: {empresa.regimeTributario}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-neutral-900 text-white font-semibold text-[10px] px-2 py-0.5 rounded uppercase">
                CPC 06 (R2) / NBC TG 06 / IFRS 16
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-base font-bold text-neutral-800 uppercase tracking-wide">
              Demonstrativo de Arrendamento Mercantil & Direito de Uso
            </h2>
            <p className="text-[11px] text-neutral-600">
              Controle de Valor Presente, Amortização Linear do Ativo e Encargos Financeiros sobre o Passivo
            </p>
          </div>
        </div>

        {/* Quadro Síntese */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded mb-6 text-center">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Valor Presente Inicial</div>
            <div className="text-sm font-bold text-neutral-800">
              {totalPresente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Ativo Direito de Uso</div>
            <div className="text-sm font-bold text-emerald-700">
              {totalDireitoUso.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Passivo Circulante (12m)</div>
            <div className="text-sm font-bold text-amber-700">
              {totalPassivoCP.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Passivo Não Circulante</div>
            <div className="text-sm font-bold text-neutral-900">
              {totalPassivoLP.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        {/* Grade de Contratos */}
        <table className="w-full border-collapse text-[10px] mb-6">
          <thead>
            <tr className="border-b-2 border-neutral-800 bg-neutral-100 font-bold text-neutral-800 text-left">
              <th className="py-2 px-1">Contrato</th>
              <th className="py-2 px-1">Arrendador & Descrição</th>
              <th className="py-2 px-1">Tipo</th>
              <th className="py-2 px-1 text-center">Prazo / Taxa</th>
              <th className="py-2 px-1 text-right">Parcela Mensal</th>
              <th className="py-2 px-1 text-right">Saldo Direito Uso</th>
              <th className="py-2 px-1 text-right">Passivo Total</th>
              <th className="py-2 px-1 text-right">Amort. Mês</th>
              <th className="py-2 px-1 text-right">Juros Mês</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {contratos.map(ctr => (
              <tr key={ctr.id} className="hover:bg-neutral-50">
                <td className="py-2 px-1 font-mono font-bold">{ctr.numeroContrato}</td>
                <td className="py-2 px-1">
                  <div className="font-semibold">{ctr.descricaoBem}</div>
                  <div className="text-[9px] text-neutral-500">{ctr.arrendador}</div>
                </td>
                <td className="py-2 px-1 font-mono">{ctr.tipoAtivo}</td>
                <td className="py-2 px-1 text-center">
                  {ctr.prazoMeses}m ({ctr.taxaDescontoAnual.toFixed(1)}% a.a.)
                </td>
                <td className="py-2 px-1 text-right font-mono">
                  {ctr.valorParcelaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono text-emerald-800 font-semibold">
                  {ctr.saldoDireitoUso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono text-amber-800 font-semibold">
                  {ctr.saldoPassivoArrendamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono">
                  {ctr.amortizacaoMensalDireitoUso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono text-rose-800">
                  {ctr.jurosApropriarMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-neutral-800 font-bold bg-neutral-100 text-neutral-900">
              <td colSpan={5} className="py-2 px-1 uppercase">Totais Gerais Consolidados</td>
              <td className="py-2 px-1 text-right font-mono text-emerald-900">
                {totalDireitoUso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono text-amber-900">
                {totalPassivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono">
                {totalAmortMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono text-rose-900">
                {totalJurosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Parecer Normativo */}
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50 text-[10px] space-y-1.5 mb-8">
          <div className="font-bold text-neutral-800 uppercase tracking-wide">
            Fundamentação Contábil e Regulatória (CPC 06 R2 / NBC TG 06 / IFRS 16)
          </div>
          <p className="text-neutral-600 leading-relaxed">
            1. Os contratos foram avaliados e reconhecidos no balanço patrimonial como Ativo de Direito de Uso e Passivo de Arrendamento Financeiro pelo valor presente dos fluxos de pagamentos futuros, descontados à taxa incremental de financiamento da entidade.
            <br />
            2. A apropriação mensal segrega adequadamente os encargos financeiros (resultado financeiro) e a amortização contábil linear do direito de uso (custo ou despesa operacional).
          </p>
        </div>

        {/* Assinaturas */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-center text-[10px]">
          <div>
            <div className="border-t border-neutral-400 pt-1 font-bold">{empresa.razaoSocial}</div>
            <div className="text-neutral-500">Administrador / Diretor Financeiro</div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-1 font-bold">Contador Responsável Técnico</div>
            <div className="text-neutral-500">CRC/UF nº 000.000/O-0</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'DEMONSTRATIVO DE LEASING CPC 06 (R2)',
      subtitulo: `${empresa.razaoSocial} - Competência ${empresa.competenciaAtiva} - IFRS 16`,
      conteudo: conteudoA4
    });
  };

  const handleExportarCsv = () => {
    const data = contratos.map(c => ({
      NumeroContrato: c.numeroContrato,
      Arrendador: c.arrendador,
      DescricaoBem: c.descricaoBem,
      TipoAtivo: c.tipoAtivo,
      DataContrato: c.dataContrato,
      DataInicio: c.dataInicio,
      PrazoMeses: c.prazoMeses,
      TaxaDescontoAnual: c.taxaDescontoAnual,
      ValorParcelaMensal: c.valorParcelaMensal,
      ValorTotalNominal: c.valorTotalNominal,
      ValorPresenteInicial: c.valorPresenteInicial,
      SaldoDireitoUso: c.saldoDireitoUso,
      SaldoPassivoArrendamento: c.saldoPassivoArrendamento,
      PassivoCirculante: c.passivoCirculante,
      PassivoNaoCirculante: c.passivoNaoCirculante,
      AmortizacaoMensal: c.amortizacaoMensalDireitoUso,
      JurosMes: c.jurosApropriarMes,
      Status: c.status
    }));
    exportToCSV(data, `Leasing_CPC06_${empresa.cnpj}_${empresa.competenciaAtiva}`);
  };

  const contratosFiltrados = contratos.filter(c => {
    if (filtroTipo !== 'TODOS' && c.tipoAtivo !== filtroTipo) return false;
    if (filtroStatus !== 'TODOS' && c.status !== filtroStatus) return false;
    if (filtroTexto.trim()) {
      const termo = filtroTexto.toLowerCase();
      const matchNum = c.numeroContrato.toLowerCase().includes(termo);
      const matchArr = c.arrendador.toLowerCase().includes(termo);
      const matchBem = c.descricaoBem.toLowerCase().includes(termo);
      if (!matchNum && !matchArr && !matchBem) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-neutral-200 overflow-hidden font-sans">
      {/* 1. Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#171717]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-blue-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Arrendamento Mercantil / Leasing (CPC 06 R2)
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/50 rounded-full">
                IFRS 16 / NBC TG 06
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Reconhecimento do Ativo Direito de Uso, Passivo a Valor Presente e Apropriação Mensal de Juros
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportarCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleImprimirLaudo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Demonstrativo A4</span>
          </button>

          <button
            onClick={handleApropriarMensal}
            disabled={processandoApropriacao}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{processandoApropriacao ? 'Apropriando...' : 'Apropriar Mensal'}</span>
          </button>

          <button
            onClick={handleAbrirCriar}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-950/50 border border-emerald-700/60 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{mensagemSucesso}</span>
        </div>
      )}

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-5 gap-3.5 px-6 pt-4 pb-2">
        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Total de Contratos</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white font-mono">{totalContratos}</span>
            <span className="text-[11px] text-blue-400 font-medium">Cadastrados</span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Valor Presente Inicial</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-neutral-100 font-mono">
              {totalPresente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Ativo Direito de Uso</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {totalDireitoUso.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Passivo Arrendamento Total</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-amber-400 font-mono">
              {totalPassivo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Juros Mensais a Apropriar</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-rose-400 font-mono">
              {totalJurosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filtros */}
      <div className="flex items-center justify-between px-6 py-3 border-y border-neutral-800/60 bg-[#161616]">
        <div className="flex items-center space-x-3 w-1/3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              placeholder="Buscar por número, arrendador ou bem..."
              className="w-full bg-[#1f1f1f] border border-neutral-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <span>Tipo:</span>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="bg-[#1f1f1f] border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="IMOVEIS">Imóveis Comerciais</option>
              <option value="VEICULOS">Veículos & Frotas</option>
              <option value="MAQUINAS_EQUIPAMENTOS">Máquinas & Equipamentos</option>
              <option value="TI_SERVIDORES">TI & Servidores</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <span>Status:</span>
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="bg-[#1f1f1f] border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Contrato Ativo</option>
              <option value="ENCERRADO">Encerrado / Liquidado</option>
              <option value="RESCINDIDO">Rescindido</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tabela de Contratos */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-sm bg-[#171717]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#1c1c1c] text-neutral-400 font-medium">
                <th className="py-2.5 px-3">Contrato</th>
                <th className="py-2.5 px-3">Arrendador & Descrição</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Prazo / WACC</th>
                <th className="py-2.5 px-3 text-right">Parcela Mês</th>
                <th className="py-2.5 px-3 text-right">Direito de Uso</th>
                <th className="py-2.5 px-3 text-right">Passivo Total</th>
                <th className="py-2.5 px-3 text-right">Juros Mês</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {contratosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-neutral-500">
                    <p className="text-sm font-medium">Nenhum contrato de arrendamento mercantil encontrado.</p>
                    <p className="text-xs mt-1">Clique em "Novo Contrato" para registrar locações ou leasings de imóveis, frotas e máquinas.</p>
                  </td>
                </tr>
              ) : (
                contratosFiltrados.map(ctr => (
                  <tr key={ctr.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-2.5 px-3 font-mono font-semibold text-neutral-300">
                      {ctr.numeroContrato}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{ctr.descricaoBem}</div>
                      <div className="text-[11px] text-neutral-400">{ctr.arrendador}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-300">
                      {ctr.tipoAtivo}
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      <div>{ctr.prazoMeses} meses</div>
                      <div className="text-neutral-500">{ctr.taxaDescontoAnual.toFixed(1)}% a.a.</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-neutral-100">
                      {ctr.valorParcelaMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {ctr.saldoDireitoUso.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                      {ctr.saldoPassivoArrendamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                      {ctr.jurosApropriarMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {ctr.status === 'ATIVO' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium text-[10px]">
                          ATIVO
                        </span>
                      )}
                      {ctr.status === 'ENCERRADO' && (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-medium text-[10px]">
                          ENCERRADO
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleAbrirEditar(ctr)}
                          className="p-1 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded transition"
                          title="Editar Contrato"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(ctr.id, ctr.numeroContrato)}
                          className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition"
                          title="Excluir Contrato"
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

      {/* 5. Modal de Cadastro & Edição de Contrato */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-neutral-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#161616]">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">
                  {editando ? 'Editar Contrato de Arrendamento' : 'Novo Contrato de Arrendamento (CPC 06 R2)'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Nº do Contrato</label>
                  <input
                    type="text"
                    value={numeroContrato}
                    onChange={e => setNumeroContrato(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-neutral-400 font-medium mb-1">Arrendador / Locador</label>
                  <input
                    type="text"
                    value={arrendador}
                    onChange={e => setArrendador(e.target.value)}
                    placeholder="Ex: Safra Leasing S/A, Imobiliária Alpha"
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-neutral-400 font-medium mb-1">Descrição do Bem Arrendado</label>
                  <input
                    type="text"
                    value={descricaoBem}
                    onChange={e => setDescricaoBem(e.target.value)}
                    placeholder="Ex: Frota de Veículos Utilitários para Entregas"
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Tipo de Ativo</label>
                  <select
                    value={tipoAtivo}
                    onChange={e => setTipoAtivo(e.target.value as TipoAtivoLeasing)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="VEICULOS">Veículos e Frotas</option>
                    <option value="IMOVEIS">Imóveis Comerciais</option>
                    <option value="MAQUINAS_EQUIPAMENTOS">Máquinas e Equipamentos</option>
                    <option value="TI_SERVIDORES">TI e Servidores</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Data Assinatura</label>
                  <input
                    type="date"
                    value={dataContrato}
                    onChange={e => setDataContrato(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Data Início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={e => setDataInicio(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Prazo (Meses)</label>
                  <input
                    type="number"
                    value={prazoMeses}
                    onChange={e => {
                      const m = parseInt(e.target.value) || 0;
                      setPrazoMeses(m);
                      const calcs = calcularValoresAutomaticos(parseValor(valorParcelaMensal), m, taxaDescontoAnual);
                      setValorTotalNominal(calcs.nominal.toFixed(2).replace('.', ','));
                      setValorPresenteInicial(calcs.valorPresente.toFixed(2).replace('.', ','));
                    }}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">WACC (% a.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={taxaDescontoAnual}
                    onChange={e => {
                      const t = parseFloat(e.target.value) || 0;
                      setTaxaDescontoAnual(t);
                      const calcs = calcularValoresAutomaticos(parseValor(valorParcelaMensal), prazoMeses, t);
                      setValorPresenteInicial(calcs.valorPresente.toFixed(2).replace('.', ','));
                    }}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Parcela Mensal (R$)</label>
                  <input
                    type="text"
                    value={valorParcelaMensal}
                    onChange={e => {
                      setValorParcelaMensal(e.target.value);
                      const calcs = calcularValoresAutomaticos(parseValor(e.target.value), prazoMeses, taxaDescontoAnual);
                      setValorTotalNominal(calcs.nominal.toFixed(2).replace('.', ','));
                      setValorPresenteInicial(calcs.valorPresente.toFixed(2).replace('.', ','));
                    }}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Total Nominal (R$)</label>
                  <input
                    type="text"
                    value={valorTotalNominal}
                    readOnly
                    className="w-full bg-[#1c1c1c] border border-neutral-800 rounded-lg px-3 py-2 text-neutral-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Valor Presente (VP R$)</label>
                  <input
                    type="text"
                    value={valorPresenteInicial}
                    onChange={e => setValorPresenteInicial(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Saldo Ativo Direito de Uso</label>
                  <input
                    type="text"
                    value={saldoDireitoUso}
                    onChange={e => setSaldoDireitoUso(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Saldo Passivo Total</label>
                  <input
                    type="text"
                    value={saldoPassivoArrendamento}
                    onChange={e => setSaldoPassivoArrendamento(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StatusContratoLeasing)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ATIVO">Contrato Ativo</option>
                    <option value="ENCERRADO">Encerrado</option>
                    <option value="RESCINDIDO">Rescindido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">Observações / Cláusulas Especiais</label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Opção de compra, caução bancária ou garantias..."
                  className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition"
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
