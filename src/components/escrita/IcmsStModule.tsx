import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ItemCalculoIcmsST } from '../../types/contabil';
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Download,
  Printer,
  X,
  FileText,
  Building,
  Scale,
  Receipt,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface IcmsStModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: {
    titulo: string;
    subtitulo: string;
    conteudo?: React.ReactNode;
    linhas?: any[];
  }) => void;
}

export const IcmsStModule: React.FC<IcmsStModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [itens, setItens] = useState<ItemCalculoIcmsST[]>(() => dbService.getItensIcmsST(empresaAtiva.id));
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroUf, setFiltroUf] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<ItemCalculoIcmsST | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Form State
  const [descricaoMercadoria, setDescricaoMercadoria] = useState<string>('');
  const [ncm, setNcm] = useState<string>('');
  const [cest, setCest] = useState<string>('');
  const [ufOrigem, setUfOrigem] = useState<string>('SP');
  const [ufDestino, setUfDestino] = useState<string>('MG');
  const [valorOperacao, setValorOperacao] = useState<string>('10000,00');
  const [valorFreteSeguroOutros, setValorFreteSeguroOutros] = useState<string>('500,00');
  const [valorIpi, setValorIpi] = useState<string>('0,00');
  const [aliquotaInterestadual, setAliquotaInterestadual] = useState<number>(12.0);
  const [aliquotaInternaDestino, setAliquotaInternaDestino] = useState<number>(18.0);
  const [mvaOriginal, setMvaOriginal] = useState<number>(40.0);
  const [dataVencimento, setDataVencimento] = useState<string>(new Date().toISOString().slice(0, 10));
  const [statusGuia, setStatusGuia] = useState<'PENDENTE' | 'PAGO' | 'COMPENSADO'>('PENDENTE');

  const handleRecarregar = () => {
    setItens(dbService.getItensIcmsST(empresaAtiva.id));
  };

  const parseValor = (valStr: string): number => {
    const cleaned = valStr.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Motor Matemático de ICMS-ST (Convênio ICMS 142/2018)
  const calcularIcmsStCompleto = (
    vOper: number,
    vFrete: number,
    vIpi: number,
    aliqInter: number,
    aliqDest: number,
    mvaOrig: number
  ) => {
    // MVA Ajustada = [(1 + MVA_orig) * (1 - aliq_inter) / (1 - aliq_dest)] - 1
    const aliqInterDec = aliqInter / 100;
    const aliqDestDec = aliqDest / 100;
    const mvaOrigDec = mvaOrig / 100;

    let mvaAjustada = mvaOrig;
    if (aliqDestDec < 1) {
      const fatorAjuste = (1 - aliqInterDec) / (1 - aliqDestDec);
      mvaAjustada = Math.round(((1 + mvaOrigDec) * fatorAjuste - 1) * 10000) / 100;
    }

    const baseProprio = vOper + vFrete;
    const icmsProprio = Math.round(baseProprio * aliqInterDec * 100) / 100;

    const baseST = Math.round((baseProprio + vIpi) * (1 + mvaAjustada / 100) * 100) / 100;
    const debitoSTBruto = Math.round(baseST * aliqDestDec * 100) / 100;
    const icmsStDevido = Math.max(0, Math.round((debitoSTBruto - icmsProprio) * 100) / 100);

    return {
      mvaAjustada,
      baseProprio,
      icmsProprio,
      baseST,
      icmsStDevido
    };
  };

  // Totais
  const totalOperacoes = itens.reduce((s, i) => s + (i.valorOperacao || 0), 0);
  const totalBaseST = itens.reduce((s, i) => s + (i.baseCalculoIcmsST || 0), 0);
  const totalIcmsProprio = itens.reduce((s, i) => s + (i.valorIcmsProprio || 0), 0);
  const totalIcmsST = itens.reduce((s, i) => s + (i.valorIcmsST || 0), 0);
  const pendentesGuia = itens.filter(i => i.statusGuia === 'PENDENTE').length;

  const handleAbrirCriar = () => {
    setEditando(null);
    setDescricaoMercadoria('');
    setNcm('2710.19.32');
    setCest('06.001.00');
    setUfOrigem(empresaAtiva.uf || 'SP');
    setUfDestino('MG');
    setValorOperacao('15000,00');
    setValorFreteSeguroOutros('800,00');
    setValorIpi('0,00');
    setAliquotaInterestadual(12.0);
    setAliquotaInternaDestino(18.0);
    setMvaOriginal(40.0);
    setDataVencimento(new Date().toISOString().slice(0, 10));
    setStatusGuia('PENDENTE');
    setShowModal(true);
  };

  const handleAbrirEditar = (item: ItemCalculoIcmsST) => {
    setEditando(item);
    setDescricaoMercadoria(item.descricaoMercadoria);
    setNcm(item.ncm);
    setCest(item.cest);
    setUfOrigem(item.ufOrigem);
    setUfDestino(item.ufDestino);
    setValorOperacao(item.valorOperacao.toFixed(2).replace('.', ','));
    setValorFreteSeguroOutros(item.valorFreteSeguroOutros.toFixed(2).replace('.', ','));
    setValorIpi(item.valorIpi.toFixed(2).replace('.', ','));
    setAliquotaInterestadual(item.aliquotaInterestadual);
    setAliquotaInternaDestino(item.aliquotaInternaDestino);
    setMvaOriginal(item.mvaOriginal);
    setDataVencimento(item.dataVencimento);
    setStatusGuia(item.statusGuia);
    setShowModal(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricaoMercadoria.trim() || !ncm.trim()) {
      alert('Informe a descrição e a NCM da mercadoria.');
      return;
    }

    const nOper = parseValor(valorOperacao);
    const nFrete = parseValor(valorFreteSeguroOutros);
    const nIpi = parseValor(valorIpi);

    const calc = calcularIcmsStCompleto(
      nOper,
      nFrete,
      nIpi,
      aliquotaInterestadual,
      aliquotaInternaDestino,
      mvaOriginal
    );

    const novoItem: ItemCalculoIcmsST = {
      id: editando ? editando.id : `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      empresaId: empresaAtiva.id,
      descricaoMercadoria: descricaoMercadoria.trim(),
      ncm: ncm.trim(),
      cest: cest.trim(),
      ufOrigem,
      ufDestino,
      valorOperacao: nOper,
      valorFreteSeguroOutros: nFrete,
      valorIpi: nIpi,
      aliquotaInterestadual,
      aliquotaInternaDestino,
      mvaOriginal,
      mvaAjustada: calc.mvaAjustada,
      baseCalculoIcmsProprio: calc.baseProprio,
      valorIcmsProprio: calc.icmsProprio,
      baseCalculoIcmsST: calc.baseST,
      valorIcmsST: calc.icmsStDevido,
      codigoGnre: '10008-0',
      codigoBarrasGnre: `858300000${Math.floor(calc.icmsStDevido).toString().padStart(3, '0')} ${Math.floor(Math.random()*900000+100000)} ${Math.floor(Math.random()*900000+100000)}`,
      dataVencimento,
      statusGuia
    };

    dbService.salvarItemIcmsST(novoItem);
    handleRecarregar();
    setShowModal(false);
    setMensagemSucesso(`Item "${novoItem.descricaoMercadoria}" e Guia GNRE gerados com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleExcluir = (id: string, desc: string) => {
    if (confirm(`Confirma a exclusão do item de ST "${desc}"?`)) {
      dbService.excluirItemIcmsST(id);
      handleRecarregar();
    }
  };

  const handleImprimirGnre = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="p-8 text-neutral-800 bg-white font-sans text-xs">
        {/* Cabeçalho Oficial */}
        <div className="border-b-2 border-neutral-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
                {empresaAtiva.razaoSocial}
              </h1>
              <p className="text-neutral-600 font-mono text-[11px] mt-0.5">
                CNPJ: {empresaAtiva.cnpj} | Competência: {empresaAtiva.competenciaAtiva} | UF Origem: {empresaAtiva.uf}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-neutral-900 text-white font-semibold text-[10px] px-2 py-0.5 rounded uppercase">
                CONVÊNIO ICMS 142/2018
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-base font-bold text-neutral-800 uppercase tracking-wide">
              Memória de Cálculo de ICMS Substituição Tributária (ICMS-ST)
            </h2>
            <p className="text-[11px] text-neutral-600">
              Demonstrativo Analítico de MVA Ajustada, Bases de Cálculo e Guias GNRE Estaduais (Código 10008-0)
            </p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded mb-6 text-center">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Total de Operações</div>
            <div className="text-sm font-bold text-neutral-800">
              {totalOperacoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">Base de Cálculo ST</div>
            <div className="text-sm font-bold text-neutral-900">
              {totalBaseST.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">ICMS Próprio Abatido</div>
            <div className="text-sm font-bold text-amber-700">
              {totalIcmsProprio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-semibold">ICMS-ST Total Devido</div>
            <div className="text-sm font-bold text-rose-700">
              {totalIcmsST.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        {/* Tabela de Itens */}
        <table className="w-full border-collapse text-[10px] mb-6">
          <thead>
            <tr className="border-b-2 border-neutral-800 bg-neutral-100 font-bold text-neutral-800 text-left">
              <th className="py-2 px-1">Mercadoria</th>
              <th className="py-2 px-1">NCM / CEST</th>
              <th className="py-2 px-1 text-center">Fluxo UF</th>
              <th className="py-2 px-1 text-center">MVA Orig / Ajust</th>
              <th className="py-2 px-1 text-right">Vlr Operação</th>
              <th className="py-2 px-1 text-right">BC Próprio</th>
              <th className="py-2 px-1 text-right">ICMS Próprio</th>
              <th className="py-2 px-1 text-right">Base ST</th>
              <th className="py-2 px-1 text-right font-bold text-rose-900">ICMS-ST Devido</th>
              <th className="py-2 px-1 text-center">Guia GNRE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {itens.map(item => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="py-2 px-1 font-semibold">{item.descricaoMercadoria}</td>
                <td className="py-2 px-1 font-mono text-[9px]">{item.ncm} / {item.cest}</td>
                <td className="py-2 px-1 text-center font-bold text-blue-800">
                  {item.ufOrigem} → {item.ufDestino}
                </td>
                <td className="py-2 px-1 text-center font-mono">
                  {item.mvaOriginal.toFixed(1)}% / <span className="font-bold text-purple-800">{item.mvaAjustada.toFixed(2)}%</span>
                </td>
                <td className="py-2 px-1 text-right font-mono">
                  {item.valorOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono">
                  {item.baseCalculoIcmsProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono text-amber-800">
                  {item.valorIcmsProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono">
                  {item.baseCalculoIcmsST.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right font-mono font-bold text-rose-800">
                  {item.valorIcmsST.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-center font-mono text-[9px]">
                  {item.codigoGnre} ({item.statusGuia})
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-neutral-800 font-bold bg-neutral-100 text-neutral-900">
              <td colSpan={4} className="py-2 px-1 uppercase">Totais Gerais de ICMS-ST</td>
              <td className="py-2 px-1 text-right font-mono">
                {totalOperacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono">-</td>
              <td className="py-2 px-1 text-right font-mono text-amber-900">
                {totalIcmsProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono">
                {totalBaseST.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-right font-mono text-rose-900">
                {totalIcmsST.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-1 text-center">{itens.length} guias</td>
            </tr>
          </tfoot>
        </table>

        {/* Parecer Técnico */}
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50 text-[10px] space-y-1.5 mb-8">
          <div className="font-bold text-neutral-800 uppercase tracking-wide">
            Base Regulatória e Fórmula de Ajuste de MVA (Convênio ICMS 142/2018 Cláusula Décima Primeira)
          </div>
          <p className="text-neutral-600 leading-relaxed font-mono">
            MVA ajustada = [(1 + MVA original) * (1 - ALIQ interestadual) / (1 - ALIQ interna)] - 1
            <br />
            Base de Cálculo ST = (Valor Mercadoria + Frete + Seguro + Outras Despesas + IPI) * (1 + MVA ajustada)
            <br />
            ICMS-ST a Recolher = (Base de Cálculo ST * ALIQ interna destino) - ICMS Operação Própria
          </p>
        </div>

        {/* Assinaturas */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-center text-[10px]">
          <div>
            <div className="border-t border-neutral-400 pt-1 font-bold">{empresaAtiva.razaoSocial}</div>
            <div className="text-neutral-500">Contribuinte Substituto Tributário</div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-1 font-bold">Responsável Fiscal / Contábil</div>
            <div className="text-neutral-500">CRC/UF nº 000.000/O-0</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'MEMÓRIA DE CÁLCULO DE ICMS-ST',
      subtitulo: `${empresaAtiva.razaoSocial} - Convênio ICMS 142/2018 - Competência ${empresaAtiva.competenciaAtiva}`,
      conteudo: conteudoA4
    });
  };

  const handleExportarCsv = () => {
    const data = itens.map(i => ({
      Descricao: i.descricaoMercadoria,
      NCM: i.ncm,
      CEST: i.cest,
      Origem: i.ufOrigem,
      Destino: i.ufDestino,
      ValorOperacao: i.valorOperacao,
      FreteOutros: i.valorFreteSeguroOutros,
      IPI: i.valorIpi,
      AliqInter: i.aliquotaInterestadual,
      AliqDest: i.aliquotaInternaDestino,
      MVAOriginal: i.mvaOriginal,
      MVAAjustada: i.mvaAjustada,
      BaseProprio: i.baseCalculoIcmsProprio,
      ICMSProprio: i.valorIcmsProprio,
      BaseST: i.baseCalculoIcmsST,
      ICMSSTDevido: i.valorIcmsST,
      CodigoGNRE: i.codigoGnre,
      StatusGuia: i.statusGuia
    }));
    exportToCSV(data, `ICMS_ST_${empresaAtiva.cnpj}_${empresaAtiva.competenciaAtiva}`);
  };

  const itensFiltrados = itens.filter(i => {
    if (filtroUf !== 'TODOS' && i.ufDestino !== filtroUf) return false;
    if (filtroStatus !== 'TODOS' && i.statusGuia !== filtroStatus) return false;
    if (filtroTexto.trim()) {
      const termo = filtroTexto.toLowerCase();
      const matchDesc = i.descricaoMercadoria.toLowerCase().includes(termo);
      const matchNcm = i.ncm.includes(termo);
      const matchCest = i.cest.includes(termo);
      if (!matchDesc && !matchNcm && !matchCest) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-neutral-200 overflow-hidden font-sans">
      {/* 1. Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#171717]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                ICMS Substituição Tributária (ICMS-ST) & DeSTDA
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-900/40 text-rose-300 border border-rose-700/50 rounded-full">
                Convênio ICMS 142/2018
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cálculo da MVA Ajustada, segregação de ICMS próprio e emissão de Guias GNRE (10008-0)
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
            onClick={handleImprimirGnre}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Memória A4 & GNRE</span>
          </button>

          <button
            onClick={handleAbrirCriar}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Item com ST</span>
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
          <span className="text-[11px] font-medium text-neutral-400">Total Operações c/ ST</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white font-mono">
              {totalOperacoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Base de Cálculo ST</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-neutral-100 font-mono">
              {totalBaseST.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">ICMS Próprio Abatido</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-amber-400 font-mono">
              {totalIcmsProprio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">ICMS-ST Total Devido</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-rose-400 font-mono">
              {totalIcmsST.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800/80 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-neutral-400">Guias GNRE Pendentes</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-rose-300 font-mono">{pendentesGuia}</span>
            <span className="text-[11px] text-neutral-500 font-medium">{itens.length} emitidas</span>
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
              placeholder="Buscar por descrição, NCM ou CEST..."
              className="w-full bg-[#1f1f1f] border border-neutral-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <span>UF Destino:</span>
            <select
              value={filtroUf}
              onChange={e => setFiltroUf(e.target.value)}
              className="bg-[#1f1f1f] border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
            >
              <option value="TODOS">Todas as UFs</option>
              <option value="MG">MG</option>
              <option value="RJ">RJ</option>
              <option value="PR">PR</option>
              <option value="SC">SC</option>
              <option value="RS">RS</option>
              <option value="BA">BA</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <span>Status Guia:</span>
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="bg-[#1f1f1f] border border-neutral-700/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendente de Pagamento</option>
              <option value="PAGO">Pago</option>
              <option value="COMPENSADO">Compensado</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Grade de Itens ST */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="border border-neutral-800 rounded-xl overflow-hidden shadow-sm bg-[#171717]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#1c1c1c] text-neutral-400 font-medium">
                <th className="py-2.5 px-3">Mercadoria</th>
                <th className="py-2.5 px-3">NCM / CEST</th>
                <th className="py-2.5 px-3 text-center">Fluxo</th>
                <th className="py-2.5 px-3 text-center">MVA Orig / Ajustada</th>
                <th className="py-2.5 px-3 text-right">Vlr Operação</th>
                <th className="py-2.5 px-3 text-right">ICMS Próprio</th>
                <th className="py-2.5 px-3 text-right">Base ST</th>
                <th className="py-2.5 px-3 text-right">ICMS-ST Devido</th>
                <th className="py-2.5 px-3 text-center">GNRE</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {itensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-neutral-500">
                    <p className="text-sm font-medium">Nenhuma operação com Substituição Tributária cadastrada.</p>
                    <p className="text-xs mt-1">Clique em "Novo Item com ST" para calcular MVA ajustada e gerar Guia GNRE.</p>
                  </td>
                </tr>
              ) : (
                itensFiltrados.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {item.descricaoMercadoria}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400">
                      {item.ncm} / {item.cest}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-400">
                      {item.ufOrigem} → {item.ufDestino}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                      {item.mvaOriginal.toFixed(1)}% / <span className="text-purple-300 font-bold">{item.mvaAjustada.toFixed(2)}%</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-100 font-medium">
                      {item.valorOperacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                      {item.valorIcmsProprio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-200">
                      {item.baseCalculoIcmsST.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                      {item.valorIcmsST.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        item.statusGuia === 'PAGO'
                          ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                      }`}>
                        {item.codigoGnre} ({item.statusGuia})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleAbrirEditar(item)}
                          className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition"
                          title="Editar Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(item.id, item.descricaoMercadoria)}
                          className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition"
                          title="Excluir Item"
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

      {/* 5. Modal de Cadastro e Cálculo Automático de ICMS-ST */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-neutral-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#161616]">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold text-white">
                  {editando ? 'Editar Cálculo de ICMS-ST' : 'Cálculo de ICMS-ST & MVA Ajustada (Convênio 142/2018)'}
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
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-neutral-400 font-medium mb-1">Descrição da Mercadoria</label>
                  <input
                    type="text"
                    value={descricaoMercadoria}
                    onChange={e => setDescricaoMercadoria(e.target.value)}
                    placeholder="Ex: Óleo Lubrificante Sintético 5W30"
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">NCM (8 dígitos)</label>
                  <input
                    type="text"
                    value={ncm}
                    onChange={e => setNcm(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">CEST (7 dígitos)</label>
                  <input
                    type="text"
                    value={cest}
                    onChange={e => setCest(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">UF Origem</label>
                  <input
                    type="text"
                    value={ufOrigem}
                    maxLength={2}
                    onChange={e => setUfOrigem(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-center focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">UF Destino</label>
                  <input
                    type="text"
                    value={ufDestino}
                    maxLength={2}
                    onChange={e => setUfDestino(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-center focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Alíquota Inter (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aliquotaInterestadual}
                    onChange={e => setAliquotaInterestadual(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Alíquota Destino (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aliquotaInternaDestino}
                    onChange={e => setAliquotaInternaDestino(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Vlr Mercadoria (R$)</label>
                  <input
                    type="text"
                    value={valorOperacao}
                    onChange={e => setValorOperacao(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Frete / Seguro (R$)</label>
                  <input
                    type="text"
                    value={valorFreteSeguroOutros}
                    onChange={e => setValorFreteSeguroOutros(e.target.value)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">IPI (R$)</label>
                  <input
                    type="text"
                    value={valorIpi}
                    onChange={e => setValorIpi(e.target.value)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">MVA Original (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mvaOriginal}
                    onChange={e => setMvaOriginal(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Vencimento da Guia GNRE</label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={e => setDataVencimento(e.target.value)}
                    required
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Status da Guia</label>
                  <select
                    value={statusGuia}
                    onChange={e => setStatusGuia(e.target.value as any)}
                    className="w-full bg-[#222] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="PENDENTE">Pendente de Pagamento</option>
                    <option value="PAGO">Pago</option>
                    <option value="COMPENSADO">Compensado</option>
                  </select>
                </div>
              </div>

              {/* Botões */}
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
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md transition"
                >
                  Salvar e Calcular ICMS-ST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
