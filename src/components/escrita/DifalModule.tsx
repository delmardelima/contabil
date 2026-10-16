import React, { useState, useMemo } from 'react';
import { 
  Empresa, 
  ResumoDifalCompetencia, 
  ItemDifalApuracao,
  ItemDifalPartilhaSaida,
  ApuracaoDifalUfDestino,
  ResumoPartilhaInterestadual
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Scale,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Search,
  Zap,
  Calendar,
  Layers,
  Info,
  QrCode,
  DollarSign,
  Receipt,
  FileCode,
  Copy,
  Download,
  Plus,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Check
} from 'lucide-react';

interface DifalModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
  onIntegracaoSucesso?: () => void;
}

export const DifalModule: React.FC<DifalModuleProps> = ({
  empresa,
  onOpenReportPreview,
  onIntegracaoSucesso
}) => {
  const [competencia, setCompetencia] = useState(empresa.competenciaAtiva || '2026-10');
  const [abaAtiva, setAbaAtiva] = useState<'entradas' | 'saidas_partilha' | 'guias_uf' | 'sped_bloco_e'>('saidas_partilha');
  const [busca, setBusca] = useState('');
  const [notificacao, setNotificacao] = useState<{ tipo: 'success' | 'info'; mensagem: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [modalNovoItem, setModalNovoItem] = useState(false);

  // Form State para inclusão de nova nota de saída
  const [novoCliente, setNovoCliente] = useState('');
  const [novoCpfCnpj, setNovoCpfCnpj] = useState('');
  const [novoNumeroNota, setNovoNumeroNota] = useState(1070);
  const [novoUfDestino, setNovoUfDestino] = useState('RJ');
  const [novoValorOperacao, setNovoValorOperacao] = useState(10000);
  const [novoAliqInter, setNovoAliqInter] = useState(12);
  const [novoAliqDest, setNovoAliqDest] = useState(20);
  const [novoAliqFcp, setNovoAliqFcp] = useState(2);

  // Resumos do banco SQLite
  const resumoEntradas: ResumoDifalCompetencia = useMemo(() => {
    return dbService.getResumoDifalCompetencia(empresa.id, competencia);
  }, [empresa.id, competencia]);

  const resumoPartilha: ResumoPartilhaInterestadual = useMemo(() => {
    return dbService.getResumoPartilhaInterestadual(empresa.id, competencia);
  }, [empresa.id, competencia]);

  const itensFiltradosEntradas = useMemo(() => {
    return resumoEntradas.itens.filter(i => 
      i.destinatarioRemetente.toLowerCase().includes(busca.toLowerCase()) ||
      i.numeroNota.toString().includes(busca) ||
      i.cfop.includes(busca)
    );
  }, [resumoEntradas.itens, busca]);

  const itensFiltradosSaidas = useMemo(() => {
    return resumoPartilha.itens.filter(i => 
      i.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      i.numeroNota.toString().includes(busca) ||
      i.ufDestino.toLowerCase().includes(busca.toLowerCase())
    );
  }, [resumoPartilha.itens, busca]);

  // Integração Contábil Direta das Entradas
  const handleIntegrarContabilEntradas = () => {
    const res = dbService.integrarDifalContabil(empresa.id, competencia);
    if (res.success) {
      setNotificacao({
        tipo: 'success',
        mensagem: `DIFAL de Entradas integrado com sucesso! Lote nº ${res.loteId} gerado no Livro Diário com R$ ${res.total.toFixed(2)}.`
      });
      onIntegracaoSucesso?.();
    } else {
      setNotificacao({
        tipo: 'info',
        mensagem: 'Não há valores devidos de DIFAL nesta competência.'
      });
    }
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Integração Contábil da Partilha Interestadual (Saídas)
  const handleIntegrarContabilPartilha = () => {
    const res = dbService.integrarPartilhaInterestadualContabil(empresa.id, competencia);
    if (res.sucesso) {
      setNotificacao({
        tipo: 'success',
        mensagem: res.mensagem
      });
      onIntegracaoSucesso?.();
    } else {
      setNotificacao({
        tipo: 'info',
        mensagem: res.mensagem
      });
    }
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Salvar nova operação de saída
  const handleSalvarNovoItem = (e: React.FormEvent) => {
    e.preventDefault();
    const difalPerc = novoAliqDest - novoAliqInter;
    const difalVal = novoValorOperacao * (difalPerc / 100);
    const fcpVal = novoValorOperacao * (novoAliqFcp / 100);
    const tot = difalVal + fcpVal;
    const isDare = novoUfDestino === 'SC' || novoUfDestino === 'SP';

    const novo: ItemDifalPartilhaSaida = {
      id: `part-${Date.now()}`,
      numeroNota: Number(novoNumeroNota),
      serie: '1',
      dataEmissao: `${competencia}-15`,
      cliente: novoCliente || 'Consumidor Final Não Contribuinte',
      cnpjCpf: novoCpfCnpj || '000.000.000-00',
      ufOrigem: empresa.uf || 'SP',
      ufDestino: novoUfDestino,
      valorTotalOperacao: Number(novoValorOperacao),
      baseCalculoICMS: Number(novoValorOperacao),
      aliquotaInterestadual: Number(novoAliqInter),
      aliquotaInternaDestino: Number(novoAliqDest),
      percentualDifal: difalPerc,
      aliquotaFCP: Number(novoAliqFcp),
      valorDifalDestino: difalVal,
      valorFCPDestino: fcpVal,
      valorTotalDevido: tot,
      codigoReceitaGNRE: isDare ? `DARE-${novoUfDestino}` : '10010-2',
      guiaTipo: isDare ? 'DARE' : 'GNRE',
      statusPagamento: 'PENDENTE'
    };

    dbService.salvarItemPartilha(novo);
    setModalNovoItem(false);
    setNotificacao({
      tipo: 'success',
      mensagem: `Operação de saída para ${novoUfDestino} registrada com sucesso! DIFAL + FCP: R$ ${tot.toFixed(2)}.`
    });
    setTimeout(() => setNotificacao(null), 4000);
  };

  // Exportar CSV
  const handleExportarCSVSaidas = () => {
    const dados = resumoPartilha.itens.map(i => ({
      NotaFiscal: i.numeroNota,
      DataEmissao: i.dataEmissao,
      Cliente: i.cliente,
      CNPJ_CPF: i.cnpjCpf,
      Rota: `${i.ufOrigem} -> ${i.ufDestino}`,
      ValorOperacao: i.valorTotalOperacao,
      BaseICMS: i.baseCalculoICMS,
      AliqInterestadual: i.aliquotaInterestadual,
      AliqInternaDestino: i.aliquotaInternaDestino,
      PercentualDifal: i.percentualDifal,
      ValorDifalDestino: i.valorDifalDestino,
      AliqFCP: i.aliquotaFCP,
      ValorFCPDestino: i.valorFCPDestino,
      TotalDevido: i.valorTotalDevido,
      TipoGuia: i.guiaTipo,
      Status: i.statusPagamento
    }));
    exportToCSV(dados, `DIFAL_Partilha_EC87_${competencia}`);
  };

  // Copiar Bloco E SPED
  const handleCopiarSped = () => {
    navigator.clipboard.writeText(resumoPartilha.spedBlocoE.conteudoSpedTxt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  // Download SPED Bloco E
  const handleDownloadSped = () => {
    const blob = new Blob([resumoPartilha.spedBlocoE.conteudoSpedTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPED_EFD_ICMS_BLOCO_E_${competencia.replace('-', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Impressão Oficial da Guia (GNRE ou DARE) por UF
  const handleImprimirGuiaUf = (apuracao: ApuracaoDifalUfDestino) => {
    if (!onOpenReportPreview) return;

    const isDare = apuracao.guiaTipo === 'DARE';
    const tituloGuia = isDare 
      ? `DARE - Documento de Arrecadação de Receitas Estaduais (${apuracao.uf})` 
      : `GNRE - Guia Nacional de Recolhimento de Tributos Estaduais (${apuracao.uf})`;

    const conteudoA4 = (
      <div className="space-y-4 text-neutral-900 font-sans max-w-xl mx-auto p-4 border border-neutral-400 bg-white shadow-sm">
        {/* Cabeçalho Guia */}
        <div className="border-b-2 border-neutral-900 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 text-white font-bold flex items-center justify-center text-xs tracking-tighter ${isDare ? 'bg-blue-900' : 'bg-emerald-900'}`}>
              {apuracao.guiaTipo}
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase">{tituloGuia}</h2>
              <p className="text-[10px] text-neutral-600">Secretaria da Fazenda do Estado de Destino ({apuracao.nomeEstado} - {apuracao.uf})</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold bg-neutral-100 px-2 py-1 border border-neutral-300">
              Cód. {apuracao.codigoReceita}
            </span>
            <p className="text-[8px] text-neutral-500 uppercase mt-0.5">ICMS DIFAL Consumidor Final Não Contribuinte (EC 87/15)</p>
          </div>
        </div>

        {/* Informações da Guia */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Contribuinte / Razão Social Remetente</span>
            <span className="font-semibold">{empresa.razaoSocial}</span>
          </div>
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">CNPJ / Inscrição Estadual</span>
            <span className="font-mono font-bold">{empresa.cnpj} | IE: {empresa.inscricaoEstadual || 'ISENTO'}</span>
          </div>

          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Período de Referência</span>
            <span className="font-mono font-bold">{competencia}</span>
          </div>
          <div className="border border-neutral-300 p-2 rounded">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Data de Vencimento</span>
            <span className="font-mono font-bold text-rose-700">{apuracao.vencimento}</span>
          </div>

          <div className="border border-neutral-300 p-2 rounded bg-neutral-50">
            <span className="text-[9px] uppercase font-bold text-neutral-500 block">ICMS DIFAL Devido ({apuracao.uf})</span>
            <span className="font-mono font-bold">R$ {apuracao.totalDifalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            {apuracao.totalFcpDevido > 0 && (
              <span className="text-[9px] text-neutral-600 block mt-0.5">
                (+) FCP Combate à Pobreza: R$ {apuracao.totalFcpDevido.toFixed(2)}
              </span>
            )}
          </div>
          <div className="border-2 border-neutral-900 p-2 rounded bg-neutral-100 text-right">
            <span className="text-[9px] uppercase font-bold text-neutral-600 block">Total Geral a Recolher</span>
            <span className="font-mono text-sm font-black text-black">
              R$ {apuracao.totalGeralRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Linha Digitável e Barcode */}
        <div className="border-t-2 border-neutral-900 pt-3 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8px] uppercase font-bold text-neutral-500 block">Representação Numérica do Código de Barras (Febraban)</span>
            <div className="font-mono text-xs font-bold tracking-widest bg-neutral-100 p-1.5 border border-neutral-300">
              {apuracao.linhaDigitavel}
            </div>
            <p className="text-[8px] text-neutral-500">
              Autenticação mecânica / Recolhimento válido em toda a rede bancária autorizada e canais de autoatendimento.
            </p>
          </div>
          <div className="text-center p-2 border border-neutral-300 rounded bg-neutral-50">
            <QrCode className="w-10 h-10 mx-auto text-neutral-800" />
            <span className="text-[7px] uppercase font-bold text-neutral-600 block mt-0.5">PIX {apuracao.guiaTipo}</span>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: `${apuracao.guiaTipo} Oficial - ICMS Partilha Interestadual (${apuracao.uf})`,
      subtitulo: `${empresa.razaoSocial} - Competência ${competencia}`,
      conteudo: conteudoA4
    });
  };

  // Impressão Oficial do Livro de Partilha Interestadual A4
  const handleImprimirLivroPartilhaA4 = () => {
    if (!onOpenReportPreview) return;

    const conteudoA4 = (
      <div className="space-y-6 text-neutral-900 font-sans p-6 bg-white min-h-[800px]">
        {/* Cabeçalho Oficial */}
        <div className="border-b-2 border-neutral-900 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold uppercase tracking-wider">{empresa.razaoSocial}</h1>
            <p className="text-xs text-neutral-600 font-mono">CNPJ: {empresa.cnpj} | IE: {empresa.inscricaoEstadual || 'ISENTO'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase text-neutral-800">Livro Registro de Apuração do ICMS DIFAL</h2>
            <p className="text-[10px] text-neutral-500">Partilha Interestadual a Não Contribuinte (EC 87/15 & Convênio 236/21)</p>
            <p className="text-[10px] font-mono font-bold text-emerald-800">Competência: {competencia}</p>
          </div>
        </div>

        {/* Quadro 1: Resumo Consolidado por Estado Favorecido */}
        <div>
          <h3 className="text-xs font-bold uppercase bg-neutral-100 p-1.5 border border-neutral-300 text-neutral-800 mb-2">
            Quadro I - Apuração Consolidada do DIFAL e FCP por Unidade Federativa de Destino
          </h3>
          <table className="w-full text-left text-[10px] border-collapse border border-neutral-300">
            <thead className="bg-neutral-50 font-bold uppercase text-[9px]">
              <tr>
                <th className="py-1 px-2 border border-neutral-300">UF Destino</th>
                <th className="py-1 px-2 border border-neutral-300">Estado Favorecido</th>
                <th className="py-1 px-2 text-center border border-neutral-300">Docs</th>
                <th className="py-1 px-2 text-right border border-neutral-300">Base de Cálculo Total</th>
                <th className="py-1 px-2 text-right border border-neutral-300">DIFAL Devido</th>
                <th className="py-1 px-2 text-right border border-neutral-300">FCP Devido</th>
                <th className="py-1 px-2 text-right border border-neutral-300 font-bold">Total da Guia</th>
                <th className="py-1 px-2 text-center border border-neutral-300">Tipo Guia</th>
              </tr>
            </thead>
            <tbody>
              {resumoPartilha.apuracoesPorUf.map(u => (
                <tr key={u.uf}>
                  <td className="py-1 px-2 border border-neutral-300 font-bold">{u.uf}</td>
                  <td className="py-1 px-2 border border-neutral-300">{u.nomeEstado}</td>
                  <td className="py-1 px-2 text-center border border-neutral-300 font-mono">{u.totalOperacoes}</td>
                  <td className="py-1 px-2 text-right border border-neutral-300 font-mono">R$ {u.valorTotalBase.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right border border-neutral-300 font-mono">R$ {u.totalDifalDevido.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right border border-neutral-300 font-mono">R$ {u.totalFcpDevido.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right border border-neutral-300 font-mono font-bold text-black">R$ {u.totalGeralRecolher.toFixed(2)}</td>
                  <td className="py-1 px-2 text-center border border-neutral-300 font-bold">{u.guiaTipo}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-100 font-bold text-[10px]">
              <tr>
                <td colSpan={3} className="py-1.5 px-2 text-right uppercase border border-neutral-300">Totais Oficiais:</td>
                <td className="py-1.5 px-2 text-right border border-neutral-300 font-mono">
                  R$ {resumoPartilha.apuracoesPorUf.reduce((a, b) => a + b.valorTotalBase, 0).toFixed(2)}
                </td>
                <td className="py-1.5 px-2 text-right border border-neutral-300 font-mono">
                  R$ {resumoPartilha.totalGeralDifal.toFixed(2)}
                </td>
                <td className="py-1.5 px-2 text-right border border-neutral-300 font-mono">
                  R$ {resumoPartilha.totalGeralFCP.toFixed(2)}
                </td>
                <td className="py-1.5 px-2 text-right border border-neutral-300 font-mono text-black">
                  R$ {resumoPartilha.totalGeralRecolher.toFixed(2)}
                </td>
                <td className="border border-neutral-300"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quadro 2: Relação das Notas Emitidas */}
        <div>
          <h3 className="text-xs font-bold uppercase bg-neutral-100 p-1.5 border border-neutral-300 text-neutral-800 mb-2">
            Quadro II - Discriminação Analítica dos Documentos Fiscais Sujeitos à Partilha
          </h3>
          <table className="w-full text-left text-[9px] border-collapse border border-neutral-300">
            <thead className="bg-neutral-50 font-bold uppercase text-[8px]">
              <tr>
                <th className="py-1 px-1 border border-neutral-300">NF</th>
                <th className="py-1 px-1 border border-neutral-300">Data</th>
                <th className="py-1 px-1 border border-neutral-300">Destinatário</th>
                <th className="py-1 px-1 border border-neutral-300">CNPJ / CPF</th>
                <th className="py-1 px-1 text-center border border-neutral-300">UF</th>
                <th className="py-1 px-1 text-right border border-neutral-300">Valor Base</th>
                <th className="py-1 px-1 text-center border border-neutral-300">Al. Inter.</th>
                <th className="py-1 px-1 text-center border border-neutral-300">Al. Dest.</th>
                <th className="py-1 px-1 text-right border border-neutral-300">DIFAL</th>
                <th className="py-1 px-1 text-right border border-neutral-300 font-bold">Total Devido</th>
              </tr>
            </thead>
            <tbody>
              {resumoPartilha.itens.map(i => (
                <tr key={i.id}>
                  <td className="py-0.5 px-1 border border-neutral-300 font-mono">#{i.numeroNota}</td>
                  <td className="py-0.5 px-1 border border-neutral-300">{i.dataEmissao}</td>
                  <td className="py-0.5 px-1 border border-neutral-300 truncate max-w-[120px]">{i.cliente}</td>
                  <td className="py-0.5 px-1 border border-neutral-300 font-mono">{i.cnpjCpf}</td>
                  <td className="py-0.5 px-1 text-center border border-neutral-300 font-bold">{i.ufDestino}</td>
                  <td className="py-0.5 px-1 text-right border border-neutral-300 font-mono">R$ {i.baseCalculoICMS.toFixed(2)}</td>
                  <td className="py-0.5 px-1 text-center border border-neutral-300">{i.aliquotaInterestadual}%</td>
                  <td className="py-0.5 px-1 text-center border border-neutral-300">{i.aliquotaInternaDestino}%</td>
                  <td className="py-0.5 px-1 text-right border border-neutral-300 font-mono">R$ {i.valorDifalDestino.toFixed(2)}</td>
                  <td className="py-0.5 px-1 text-right border border-neutral-300 font-mono font-bold">R$ {i.valorTotalDevido.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quadro de Assinaturas */}
        <div className="pt-8 border-t border-neutral-400 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-neutral-900 w-3/4 mx-auto pt-1 font-bold">
              {empresa.razaoSocial}
            </div>
            <p className="text-[10px] text-neutral-500">Contribuinte / Representante Legal</p>
          </div>
          <div>
            <div className="border-t border-neutral-900 w-3/4 mx-auto pt-1 font-bold">
              Amilton Silva de Oliveira
            </div>
            <p className="text-[10px] text-neutral-500">Contador Responsável - CRC-SP 1SP298450/O-2</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Livro Fiscal de Apuração do ICMS DIFAL - Partilha Interestadual',
      subtitulo: `${empresa.razaoSocial} - Competência ${competencia}`,
      conteudo: conteudoA4
    });
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Scale size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>DIFAL & Partilha Interestadual (EC 87/2015 & Convênio 236/2021)</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                SPED Bloco E300 / GNRE / DARE
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Cálculo do ICMS interestadual em saídas a consumidor final não contribuinte, adicional de FCP e compras de Uso/Consumo/Ativo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Seletor de Competência */}
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 mr-2" />
            <span className="text-neutral-400 mr-1.5">Comp:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none text-xs"
            />
          </div>

          <button
            onClick={() => setModalNovoItem(true)}
            className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Operação Saída</span>
          </button>

          <button
            onClick={handleImprimirLivroPartilhaA4}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Livro Partilha A4</span>
          </button>

          <button
            onClick={handleExportarCSVSaidas}
            className="px-3 py-1.5 text-xs bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleIntegrarContabilPartilha}
            className="px-3 py-1.5 text-xs font-semibold rounded shadow bg-sky-600 hover:bg-sky-500 text-white flex items-center space-x-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Integrar Contábil (1-Clique)</span>
          </button>
        </div>
      </div>

      {/* Banner de Notificação */}
      {notificacao && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs animate-in fade-in flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{notificacao.mensagem}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-neutral-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Navegação por Abas Fluent */}
      <div className="flex items-center space-x-2 mt-4 border-b border-white/10 pb-2 flex-shrink-0">
        <button
          onClick={() => setAbaAtiva('saidas_partilha')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
            abaAtiva === 'saidas_partilha'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Saídas Não Contribuinte (EC 87/15)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            {resumoPartilha.itens.length}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('guias_uf')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
            abaAtiva === 'guias_uf'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Apuração por UF Favorecida & Guias</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            {resumoPartilha.apuracoesPorUf.length} UFs
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('sped_bloco_e')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
            abaAtiva === 'sped_bloco_e'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>SPED Fiscal Bloco E (E300/E310/E316)</span>
        </button>

        <button
          onClick={() => setAbaAtiva('entradas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
            abaAtiva === 'entradas'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Entradas (Uso/Consumo & Ativo - DeSTDA)</span>
        </button>
      </div>

      {/* KPI Cards Dinâmicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-shrink-0">
        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Operações Interestaduais</span>
          <div className="text-xl font-bold font-mono text-white">
            {abaAtiva === 'entradas' ? resumoEntradas.totalOperacoes : resumoPartilha.itens.length} Documentos
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">
            {abaAtiva === 'entradas' ? 'Compras interestaduais' : 'Vendas interestaduais consumidor final'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">Base de Cálculo Total</span>
          <div className="text-xl font-bold font-mono text-sky-400">
            R$ {(abaAtiva === 'entradas' ? resumoEntradas.totalBaseCalculo : resumoPartilha.apuracoesPorUf.reduce((a, b) => a + b.valorTotalBase, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-sans">Valor total das operações tributáveis</span>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase">ICMS DIFAL Destino</span>
          <div className="text-xl font-bold font-mono text-amber-400">
            R$ {(abaAtiva === 'entradas' ? resumoEntradas.totalDifalDevido : resumoPartilha.totalGeralDifal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 block font-mono">Diferencial devido aos estados de destino</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] text-emerald-300 font-medium uppercase">Total Guias a Recolher (DIFAL + FCP)</span>
          <div className="text-xl font-bold font-mono text-emerald-300">
            R$ {(abaAtiva === 'entradas' ? resumoEntradas.totalGeralGuia : resumoPartilha.totalGeralRecolher).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400/80 block font-sans">
            Recolhimento via GNRE ou DARE estadual
          </span>
        </div>
      </div>

      {/* Conteúdo da Aba 1: Saídas Não Contribuinte (EC 87/15) */}
      {abaAtiva === 'saidas_partilha' && (
        <div className="flex-1 flex flex-col mt-4 overflow-hidden">
          {/* Busca rápida */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 flex-shrink-0">
            <div className="relative w-80">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por cliente, NF ou UF destino..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-xs text-neutral-400">
              <span className="font-mono text-white font-semibold">{itensFiltradosSaidas.length}</span> partida(s) de partilha interestadual
            </div>
          </div>

          <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase text-[11px] z-10">
                  <tr>
                    <th className="py-2.5 px-3">NF / Emissão</th>
                    <th className="py-2.5 px-3">Cliente / Destinatário</th>
                    <th className="py-2.5 px-3 text-center">Rota</th>
                    <th className="py-2.5 px-3 text-right">Valor Operação</th>
                    <th className="py-2.5 px-3 text-center">Alíq. Inter.</th>
                    <th className="py-2.5 px-3 text-center">Alíq. Dest.</th>
                    <th className="py-2.5 px-3 text-center">DIFAL %</th>
                    <th className="py-2.5 px-3 text-right">DIFAL (R$)</th>
                    <th className="py-2.5 px-3 text-center">FCP %</th>
                    <th className="py-2.5 px-3 text-right">FCP (R$)</th>
                    <th className="py-2.5 px-3 text-right font-bold text-white">Total Devido</th>
                    <th className="py-2.5 px-3 text-center">Guia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                  {itensFiltradosSaidas.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3">
                        <span className="text-sky-400 font-bold block">#{item.numeroNota}</span>
                        <span className="text-[10px] text-neutral-500 font-sans">{item.dataEmissao}</span>
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <div className="font-medium text-white">{item.cliente}</div>
                        <div className="text-[11px] text-neutral-400">{item.cnpjCpf}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">
                          {item.ufOrigem} ➔ {item.ufDestino}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-neutral-300">
                        R$ {item.valorTotalOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center text-neutral-400">{item.aliquotaInterestadual}%</td>
                      <td className="py-2 px-3 text-center text-neutral-400">{item.aliquotaInternaDestino}%</td>
                      <td className="py-2 px-3 text-center text-amber-400 font-bold">{item.percentualDifal}%</td>
                      <td className="py-2 px-3 text-right text-amber-300">R$ {item.valorDifalDestino.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center text-rose-400">{item.aliquotaFCP}%</td>
                      <td className="py-2 px-3 text-right text-rose-300">R$ {item.valorFCPDestino.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400">
                        R$ {item.valorTotalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.guiaTipo === 'DARE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {item.guiaTipo}
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

      {/* Conteúdo da Aba 2: Guias Consolidadas por UF */}
      {abaAtiva === 'guias_uf' && (
        <div className="flex-1 overflow-auto mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resumoPartilha.apuracoesPorUf.map(u => (
              <div key={u.uf} className="p-4 rounded-xl bg-[#181818] border border-white/10 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      {u.nomeEstado} ({u.uf})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-neutral-800 text-neutral-300 border border-white/10">
                      {u.guiaTipo}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Operações:</span>
                      <span className="font-mono text-white">{u.totalOperacoes} nota(s)</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Base de Cálculo:</span>
                      <span className="font-mono text-sky-400">R$ {u.valorTotalBase.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>DIFAL Apurado:</span>
                      <span className="font-mono text-amber-400">R$ {u.totalDifalDevido.toFixed(2)}</span>
                    </div>
                    {u.totalFcpDevido > 0 && (
                      <div className="flex justify-between text-neutral-400">
                        <span>FCP Combate à Pobreza:</span>
                        <span className="font-mono text-rose-400">R$ {u.totalFcpDevido.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-200 font-bold pt-2 border-t border-white/10 text-sm">
                      <span>Total da Guia:</span>
                      <span className="font-mono text-emerald-400">R$ {u.totalGeralRecolher.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-neutral-500 font-mono">Venc: {u.vencimento}</span>
                  <button
                    onClick={() => handleImprimirGuiaUf(u)}
                    className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded border border-emerald-500/30 flex items-center gap-1 transition-colors"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Emitir {u.guiaTipo} A4</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 3: SPED Fiscal Bloco E */}
      {abaAtiva === 'sped_bloco_e' && (
        <div className="flex-1 flex flex-col mt-4 overflow-hidden bg-[#181818] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Registros E300 / E310 / E316 - EFD-ICMS/IPI</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                  Leiaute Oficial RFB
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Bloco oficial de apuração do ICMS DIFAL e FCP por Unidade Federativa de destino para validação no PVA
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopiarSped}
                className="px-3 py-1.5 text-xs bg-[#222] hover:bg-[#2a2a2a] text-neutral-200 rounded border border-white/10 flex items-center space-x-1.5 transition-colors"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado ? 'Copiado!' : 'Copiar Bloco E'}</span>
              </button>
              <button
                onClick={handleDownloadSped}
                className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .TXT</span>
              </button>
            </div>
          </div>

          <div className="flex-1 mt-3 bg-[#111] p-3 rounded-lg border border-white/5 font-mono text-xs overflow-auto text-emerald-400 select-text whitespace-pre leading-relaxed">
            {resumoPartilha.spedBlocoE.conteudoSpedTxt}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 4: Entradas (Uso/Consumo & Ativo) */}
      {abaAtiva === 'entradas' && (
        <div className="flex-1 flex flex-col mt-4 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 flex-shrink-0">
            <div className="relative w-80">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por fornecedor, NF ou CFOP..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleIntegrarContabilEntradas}
              disabled={resumoEntradas.status === 'INTEGRADO'}
              className={`px-3 py-1.5 text-xs font-semibold rounded shadow flex items-center space-x-1.5 transition-colors ${
                resumoEntradas.status === 'INTEGRADO'
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{resumoEntradas.status === 'INTEGRADO' ? 'DIFAL Entradas Integrado' : 'Integrar Entradas Contábil'}</span>
            </button>
          </div>

          <div className="flex-1 bg-[#181818] border border-white/10 rounded-xl flex flex-col mt-3 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase text-[11px] z-10">
                  <tr>
                    <th className="py-2.5 px-3">NF / Emissão</th>
                    <th className="py-2.5 px-3">Fornecedor / Emitente</th>
                    <th className="py-2.5 px-3 text-center">Rota</th>
                    <th className="py-2.5 px-3">Destinação / CFOP</th>
                    <th className="py-2.5 px-3 text-right">Valor Operação</th>
                    <th className="py-2.5 px-3 text-center">Alíq. Inter.</th>
                    <th className="py-2.5 px-3 text-center">Alíq. Interna</th>
                    <th className="py-2.5 px-3 text-center">DIFAL %</th>
                    <th className="py-2.5 px-3 text-right font-bold text-white">Valor Devido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                  {itensFiltradosEntradas.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3">
                        <span className="text-sky-400 font-bold block">#{item.numeroNota}</span>
                        <span className="text-[10px] text-neutral-500 font-sans">{item.dataEmissao}</span>
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <div className="font-medium text-white">{item.destinatarioRemetente}</div>
                        <div className="text-[11px] text-neutral-400">{item.cnpjCpf}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">
                          {item.ufOrigem} ➔ {item.ufDestino}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans text-xs">
                        <span className="text-neutral-300 block">{item.tipoOperacao.replace(/_/g, ' ')}</span>
                        <span className="font-mono text-[10px] text-neutral-500">CFOP {item.cfop}</span>
                      </td>
                      <td className="py-2 px-3 text-right text-neutral-300">
                        R$ {item.valorOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center text-neutral-400">{item.aliquotaInterestadual}%</td>
                      <td className="py-2 px-3 text-center text-neutral-400">{item.aliquotaInternaDestino}%</td>
                      <td className="py-2 px-3 text-center text-amber-400 font-bold">{item.percentualDifal}%</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400">
                        R$ {item.valorTotalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Operação de Saída */}
      {modalNovoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Lançar Operação Interestadual (EC 87/2015)</span>
              </h3>
              <button onClick={() => setModalNovoItem(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSalvarNovoItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Nº Nota Fiscal</label>
                  <input
                    type="number"
                    value={novoNumeroNota}
                    onChange={e => setNovoNumeroNota(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">UF Destino</label>
                  <select
                    value={novoUfDestino}
                    onChange={e => {
                      const uf = e.target.value;
                      setNovoUfDestino(uf);
                      if (uf === 'RJ') { setNovoAliqDest(20); setNovoAliqFcp(2); }
                      else if (uf === 'MG') { setNovoAliqDest(18); setNovoAliqFcp(2); }
                      else if (uf === 'BA') { setNovoAliqDest(19); setNovoAliqFcp(2); }
                      else if (uf === 'SC') { setNovoAliqDest(17); setNovoAliqFcp(0); }
                      else if (uf === 'RS') { setNovoAliqDest(17); setNovoAliqFcp(2); }
                    }}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold"
                  >
                    <option value="RJ">RJ - Rio de Janeiro (Aliq: 20% / FCP: 2%)</option>
                    <option value="MG">MG - Minas Gerais (Aliq: 18% / FCP: 2%)</option>
                    <option value="BA">BA - Bahia (Aliq: 19% / FCP: 2%)</option>
                    <option value="SC">SC - Santa Catarina (Aliq: 17% / DARE)</option>
                    <option value="RS">RS - Rio Grande do Sul (Aliq: 17% / FCP: 2%)</option>
                    <option value="PR">PR - Paraná (Aliq: 19.5% / FCP: 0%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Nome do Cliente / Consumidor Final</label>
                <input
                  type="text"
                  value={novoCliente}
                  onChange={e => setNovoCliente(e.target.value)}
                  placeholder="Nome completo do destinatário"
                  className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">CPF / CNPJ Destinatário</label>
                  <input
                    type="text"
                    value={novoCpfCnpj}
                    onChange={e => setNovoCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Valor da Operação (R$)</label>
                  <input
                    type="number"
                    value={novoValorOperacao}
                    onChange={e => setNovoValorOperacao(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-white/10 rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-[#161616] rounded border border-white/5">
                <div>
                  <label className="text-neutral-500 block text-[10px]">Alíq. Interestadual</label>
                  <span className="font-mono text-white font-bold">{novoAliqInter}%</span>
                </div>
                <div>
                  <label className="text-neutral-500 block text-[10px]">Alíq. Interna Destino</label>
                  <span className="font-mono text-white font-bold">{novoAliqDest}%</span>
                </div>
                <div>
                  <label className="text-neutral-500 block text-[10px]">Alíq. FCP Destino</label>
                  <span className="font-mono text-rose-400 font-bold">{novoAliqFcp}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalNovoItem(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow"
                >
                  Confirmar e Calcular DIFAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
