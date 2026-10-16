import React, { useState, useEffect } from 'react';
import { 
  Empresa, 
  ItemApuracaoIpi, 
  ApuracaoMensalIpi, 
  RegistroK200EstoqueEscriturado 
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  Factory, 
  Package, 
  Calculator, 
  FileText, 
  Printer, 
  Plus, 
  Trash2, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  QrCode, 
  Barcode, 
  Building2, 
  Calendar,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

interface IpiBlocoKModuleProps {
  empresa: Empresa;
  onOpenReportPreview: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
  onIntegracaoSucesso?: () => void;
}

export const IpiBlocoKModule: React.FC<IpiBlocoKModuleProps> = ({ 
  empresa, 
  onOpenReportPreview,
  onIntegracaoSucesso 
}) => {
  const [competencia, setCompetencia] = useState('2026-10');
  const [activeTab, setActiveTab] = useState<'LIVRO_IPI' | 'DARF' | 'BLOCO_K'>('LIVRO_IPI');

  const [itensIpi, setItensIpi] = useState<ItemApuracaoIpi[]>([]);
  const [apuracao, setApuracao] = useState<ApuracaoMensalIpi | null>(null);
  const [registrosK, setRegistrosK] = useState<RegistroK200EstoqueEscriturado[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);

  // Modais
  const [modalNovoItemIpi, setModalNovoItemIpi] = useState(false);
  const [modalNovoItemK, setModalNovoItemK] = useState(false);

  // Form IPI
  const [tipoIpi, setTipoIpi] = useState<'DEBITO_SAIDA' | 'CREDITO_ENTRADA' | 'OUTROS_DEBITOS' | 'OUTROS_CREDITOS'>('DEBITO_SAIDA');
  const [cfopIpi, setCfopIpi] = useState('5.101');
  const [descIpi, setDescIpi] = useState('Venda de Produtos Fabricados pela Empresa');
  const [baseIpi, setBaseIpi] = useState<number>(50000);
  const [aliqIpi, setAliqIpi] = useState<number>(10);
  const [docIpi, setDocIpi] = useState('NF-e 1070 a 1080');

  // Form Bloco K
  const [codItemK, setCodItemK] = useState('MP-002');
  const [descItemK, setDescItemK] = useState('Bobinas de Alumínio Laminado');
  const [tipoItemK, setTipoItemK] = useState<'00_MERCADORIA_REVENDA' | '01_MATERIA_PRIMA' | '02_EMBALAGEM' | '03_PRODUTO_PROCESSO' | '04_PRODUTO_ACABADO'>('01_MATERIA_PRIMA');
  const [unidK, setUnidK] = useState('KG');
  const [qtdK, setQtdK] = useState<number>(2500);
  const [custoK, setCustoK] = useState<number>(18.5);

  const carregarDados = () => {
    const itens = dbService.getItensApuracaoIpi(empresa.id, competencia);
    const ap = dbService.getApuracaoMensalIpi(empresa.id, competencia);
    const regK = dbService.getRegistrosK200(empresa.id, competencia);
    setItensIpi(itens);
    setApuracao(ap);
    setRegistrosK(regK);
  };

  useEffect(() => {
    carregarDados();
  }, [empresa.id, competencia]);

  const handleSalvarItemIpi = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const valIpi = Math.round((baseIpi * (aliqIpi / 100)) * 100) / 100;
      dbService.salvarItemApuracaoIpi({
        empresaId: empresa.id,
        competencia,
        tipo: tipoIpi,
        cfop: cfopIpi,
        descricaoOperacao: descIpi,
        baseCalculo: baseIpi,
        aliquotaMediaIpi: aliqIpi,
        valorIpi: valIpi,
        numeroDocumento: docIpi
      });
      setFeedback({ tipo: 'success', texto: 'Lançamento de IPI escriturado com sucesso no Livro Modelo 8.' });
      setModalNovoItemIpi(false);
      carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: 'Erro ao salvar item de IPI: ' + err.message });
    }
  };

  const handleSalvarItemK = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dbService.salvarRegistroK200({
        empresaId: empresa.id,
        competencia,
        codigoItem: codItemK,
        descricaoItem: descItemK,
        tipoItem: tipoItemK,
        unidadeMedida: unidK,
        quantidadeEstoque: qtdK,
        custoUnitarioMedio: custoK
      });
      setFeedback({ tipo: 'success', texto: 'Item escriturado no Bloco K (Registro K200 - Estoque).' });
      setModalNovoItemK(false);
      carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: 'Erro ao escriturar Bloco K: ' + err.message });
    }
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarIpiContabil(empresa.id, competencia);
    if (res.sucesso) {
      setFeedback({ tipo: 'success', texto: res.mensagem });
      carregarDados();
      if (onIntegracaoSucesso) onIntegracaoSucesso();
    } else {
      setFeedback({ tipo: 'error', texto: res.mensagem });
    }
  };

  // Impressão Oficial A4 do Livro Registro de Apuração do IPI Modelo 8
  const handleImprimirLivroIpi = () => {
    if (!apuracao) return;

    const relatorioA4 = (
      <div className="p-6 bg-white text-neutral-900 font-sans text-xs space-y-4 min-h-[850px]">
        {/* Termo de Abertura do Livro */}
        <div className="border-b-2 border-neutral-900 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider">{empresa.razaoSocial}</h1>
            <h2 className="text-sm font-black uppercase text-neutral-900">LIVRO REGISTRO DE APURAÇÃO DO IPI - MODELO 8</h2>
            <p className="text-[10px] text-neutral-600 font-mono">REGULAMENTO DO IPI (RIPI) - DECRETO Nº 7.212/2010 & EFD-ICMS/IPI</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-neutral-500 block">CNPJ: {empresa.cnpj}</span>
            <span className="text-[10px] font-mono text-neutral-500 block">Inscrição Estadual: {empresa.inscricaoEstadual || 'Isento'}</span>
            <span className="text-[10px] font-bold text-emerald-800 block mt-1">Período de Apuração: {competencia}</span>
          </div>
        </div>

        {/* Quadro 1: Entradas com Crédito do Imposto */}
        <div>
          <div className="bg-neutral-800 text-white px-2 py-1 font-bold text-[10px] uppercase tracking-wide">
            001 - Entradas e Créditos do Imposto (Matérias-Primas, Produtos Intermediários e Embalagens)
          </div>
          <table className="w-full text-[10px] border border-neutral-300 mt-1">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 font-bold border-b border-neutral-300">
                <th className="py-1 px-2 text-left">CFOP</th>
                <th className="py-1 px-2 text-left">Especificação da Operação</th>
                <th className="py-1 px-2 text-left">Documento</th>
                <th className="py-1 px-2 text-right">Base de Cálculo (R$)</th>
                <th className="py-1 px-2 text-center">Alíquota TIPI</th>
                <th className="py-1 px-2 text-right">Crédito IPI (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {itensIpi.filter(i => i.tipo === 'CREDITO_ENTRADA').map(i => (
                <tr key={i.id}>
                  <td className="py-1 px-2 font-mono font-bold">{i.cfop}</td>
                  <td className="py-1 px-2">{i.descricaoOperacao}</td>
                  <td className="py-1 px-2 font-mono">{i.numeroDocumento || '-'}</td>
                  <td className="py-1 px-2 font-mono text-right">R$ {i.baseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2 font-mono text-center">{i.aliquotaMediaIpi}%</td>
                  <td className="py-1 px-2 font-mono text-right font-bold text-emerald-800">
                    R$ {i.valorIpi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold border-t border-neutral-300">
                <td colSpan={5} className="py-1 px-2 text-right text-[9px] uppercase">Total dos Créditos por Entradas:</td>
                <td className="py-1 px-2 font-mono text-right text-emerald-800">
                  R$ {apuracao.totalCreditosEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quadro 2: Saídas com Débito do Imposto */}
        <div>
          <div className="bg-neutral-800 text-white px-2 py-1 font-bold text-[10px] uppercase tracking-wide">
            002 - Saídas e Débitos do Imposto (Produtos Industrializados de Fabricação Própria)
          </div>
          <table className="w-full text-[10px] border border-neutral-300 mt-1">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 font-bold border-b border-neutral-300">
                <th className="py-1 px-2 text-left">CFOP</th>
                <th className="py-1 px-2 text-left">Especificação da Operação</th>
                <th className="py-1 px-2 text-left">Documento</th>
                <th className="py-1 px-2 text-right">Base de Cálculo (R$)</th>
                <th className="py-1 px-2 text-center">Alíquota TIPI</th>
                <th className="py-1 px-2 text-right">Débito IPI (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {itensIpi.filter(i => i.tipo === 'DEBITO_SAIDA').map(i => (
                <tr key={i.id}>
                  <td className="py-1 px-2 font-mono font-bold">{i.cfop}</td>
                  <td className="py-1 px-2">{i.descricaoOperacao}</td>
                  <td className="py-1 px-2 font-mono">{i.numeroDocumento || '-'}</td>
                  <td className="py-1 px-2 font-mono text-right">R$ {i.baseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2 font-mono text-center">{i.aliquotaMediaIpi}%</td>
                  <td className="py-1 px-2 font-mono text-right font-bold text-rose-800">
                    R$ {i.valorIpi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold border-t border-neutral-300">
                <td colSpan={5} className="py-1 px-2 text-right text-[9px] uppercase">Total dos Débitos por Saídas:</td>
                <td className="py-1 px-2 font-mono text-right text-rose-800">
                  R$ {apuracao.totalDebitosSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quadro 3: Apuração dos Saldos (Resumo da Competência) */}
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50">
          <span className="text-[10px] font-black uppercase text-neutral-800 block mb-2">003 - Resumo da Apuração do Saldo do IPI</span>
          <div className="grid grid-cols-2 gap-4 text-[10px]">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>01 - Total dos Débitos por Saídas:</span>
                <span className="font-mono font-bold">R$ {apuracao.totalGeralDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>02 - Outros Débitos / Estornos de Crédito:</span>
                <span className="font-mono">R$ {(apuracao.outrosDebitos + apuracao.estornosCreditos).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-neutral-300 pt-1 text-neutral-900">
                <span>Total Geral dos Débitos:</span>
                <span className="font-mono">R$ {apuracao.totalGeralDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>03 - Total dos Créditos por Entradas:</span>
                <span className="font-mono font-bold">R$ {apuracao.totalGeralCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>04 - Saldo Credor do Período Anterior:</span>
                <span className="font-mono">R$ {apuracao.saldoCredorPeriodoAnterior.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-neutral-300 pt-1 text-neutral-900">
                <span>Total Geral dos Créditos:</span>
                <span className="font-mono">R$ {apuracao.totalGeralCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t-2 border-neutral-800 flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Resultado Final da Apuração:</span>
              <span className={`text-sm font-black ${apuracao.ipiARecolher > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                {apuracao.ipiARecolher > 0 ? 'SALDO DEVEDOR (IPI A RECOLHER)' : 'SALDO CREDOR A TRANSPORTAR'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-black font-mono">
                R$ {(apuracao.ipiARecolher > 0 ? apuracao.ipiARecolher : apuracao.saldoCredorTransportar).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {apuracao.ipiARecolher > 0 && (
                <p className="text-[9px] text-neutral-600">Vencimento DARF Cód. 1097: <strong>{apuracao.dataVencimento}</strong></p>
              )}
            </div>
          </div>
        </div>

        {/* Termo de Encerramento e Assinaturas */}
        <div className="pt-8 border-t border-neutral-300 mt-6 text-[9px] text-neutral-600 space-y-6">
          <p className="leading-tight">
            Lavramos o presente termo para constar que a escrituração do Livro Registro de Apuração do IPI (Modelo 8), referente à competência {competencia}, encontra-se revestida das formalidades legais prescritas pelo Decreto Federal nº 7.212/2010 (RIPI) e legislação complementar.
          </p>

          <div className="grid grid-cols-2 gap-12 text-center pt-4">
            <div className="border-t border-neutral-800 pt-1">
              <span className="font-bold text-neutral-900 block text-[10px]">{empresa.responsavelLegal || 'Representante Legal'}</span>
              <span className="text-[8px] text-neutral-500 uppercase">Administrador / Diretor Geral</span>
            </div>
            <div className="border-t border-neutral-800 pt-1">
              <span className="font-bold text-neutral-900 block text-[10px]">Amilton Silva de Oliveira - CRC-SP 1SP298450/O-2</span>
              <span className="text-[8px] text-neutral-500 uppercase">Contador Responsável Técnico</span>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `LIVRO REGISTRO DE APURAÇÃO DO IPI (MODELO 8) - ${competencia}`,
      `Conforme Decreto nº 7.212/2010 (RIPI) e Guia Prático da EFD-ICMS/IPI`,
      relatorioA4,
      'portrait'
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-100 overflow-hidden">
      {/* Top Banner IPI / Bloco K Fluent */}
      <div className="p-4 bg-[#181818] border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Factory size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-neutral-100">Apuração do IPI (Livro Mod. 8) & Bloco K</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                RIPI Decreto 7.212/2010
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Escrituração Fiscal Industrial, DARF Cód. 1097 e Controle da Produção e Estoque (SPED Bloco K)
            </p>
          </div>
        </div>

        {/* Competência e Abas */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-neutral-900 px-2.5 py-1 rounded-lg border border-white/10 text-xs">
            <Calendar size={13} className="text-neutral-400" />
            <span className="text-neutral-400">Comp:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-neutral-200 font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 bg-neutral-900/80 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('LIVRO_IPI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'LIVRO_IPI' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Livro Mod. 8 (IPI)
            </button>
            <button
              onClick={() => setActiveTab('DARF')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'DARF' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Guia DARF 1097
            </button>
            <button
              onClick={() => setActiveTab('BLOCO_K')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'BLOCO_K' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              SPED Bloco K
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards de Apuração do IPI */}
      {apuracao && (
        <div className="grid grid-cols-4 gap-3 p-4 bg-[#161616] border-b border-white/5">
          <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Débitos s/ Saídas (TIPI)</span>
            <span className="text-base font-mono font-bold text-rose-400">
              R$ {apuracao.totalDebitosSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Faturamento Industrial</span>
          </div>
          <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Créditos s/ Entradas (MP)</span>
            <span className="text-base font-mono font-bold text-emerald-400">
              R$ {apuracao.totalCreditosEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Matérias-Primas e Embalagens</span>
          </div>
          <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Saldo Credor Transportado</span>
            <span className="text-base font-mono font-bold text-blue-400">
              R$ {apuracao.saldoCredorTransportar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Para próxima competência</span>
          </div>
          <div className="p-3 bg-[#181818] border border-amber-500/20 bg-amber-500/[0.02] rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold block">IPI a Recolher (DARF)</span>
              <span className="text-lg font-mono font-black text-amber-400">
                R$ {apuracao.ipiARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">Venc: {apuracao.dataVencimento}</span>
            </div>
            <button
              onClick={handleIntegrarContabil}
              className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow text-xs font-semibold flex items-center space-x-1"
              title="Integrar ao Diário Geral"
            >
              <Zap size={14} />
              <span>Integrar</span>
            </button>
          </div>
        </div>
      )}

      {/* Banner de Feedback */}
      {feedback && (
        <div className={`mx-4 mt-3 px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
          feedback.tipo === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          feedback.tipo === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
          'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-neutral-200">✕</button>
        </div>
      )}

      {/* Conteúdo Dinâmico */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* ABA 1: LIVRO REGISTRO DE APURAÇÃO DO IPI */}
        {activeTab === 'LIVRO_IPI' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Movimentações Escrituradas no Livro Modelo 8: <strong className="text-neutral-200">{itensIpi.length}</strong>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleImprimirLivroIpi}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-white/10"
                >
                  <Printer size={14} />
                  <span>Emitir Livro Modelo 8 A4</span>
                </button>
                <button
                  onClick={() => setModalNovoItemIpi(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow"
                >
                  <Plus size={14} />
                  <span>Novo Lançamento IPI</span>
                </button>
              </div>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/60 text-neutral-400 uppercase text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-2 text-center">CFOP</th>
                    <th className="py-2.5 px-3">Especificação da Operação</th>
                    <th className="py-2.5 px-3">Documento Fiscal</th>
                    <th className="py-2.5 px-3 text-right">Base de Cálculo (R$)</th>
                    <th className="py-2.5 px-2 text-center">Alíquota TIPI</th>
                    <th className="py-2.5 px-3 text-right">Valor do IPI (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {itensIpi.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          item.tipo === 'DEBITO_SAIDA' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          item.tipo === 'CREDITO_ENTRADA' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {item.tipo.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-neutral-200">{item.cfop}</td>
                      <td className="py-2.5 px-3 font-sans text-neutral-300">{item.descricaoOperacao}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{item.numeroDocumento || '-'}</td>
                      <td className="py-2.5 px-3 text-right">R$ {item.baseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-amber-400">{item.aliquotaMediaIpi}%</td>
                      <td className={`py-2.5 px-3 text-right font-black ${
                        item.tipo === 'DEBITO_SAIDA' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        R$ {item.valorIpi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: GUIA DARF OFICIAL DO IPI */}
        {activeTab === 'DARF' && apuracao && (
          <div className="max-w-xl mx-auto space-y-4">
            {apuracao.ipiARecolher === 0 ? (
              <div className="p-8 text-center bg-[#181818] border border-white/5 rounded-xl space-y-2">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-neutral-100">Não há IPI a recolher nesta competência</h3>
                <p className="text-xs text-neutral-400">
                  Os créditos de matérias-primas e insumos superaram os débitos de saídas industriais, gerando saldo credor acumulado de R$ {apuracao.saldoCredorTransportar.toFixed(2)}.
                </p>
              </div>
            ) : (
              <div className="p-6 bg-white text-neutral-900 rounded-xl shadow-2xl border-2 border-neutral-900 space-y-4 font-sans text-xs">
                <div className="border-b-2 border-neutral-900 pb-2 flex justify-between items-center">
                  <div>
                    <h2 className="text-xs font-bold uppercase text-neutral-600">Ministério da Fazenda - Receita Federal do Brasil</h2>
                    <h1 className="text-sm font-black uppercase text-neutral-900">Documento de Arrecadação de Receitas Federais (DARF)</h1>
                  </div>
                  <Barcode size={32} className="text-neutral-900" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 border-r border-neutral-300 pr-3">
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Nome da Empresa</span>
                      <span className="font-bold text-xs">{empresa.razaoSocial}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">CNPJ</span>
                      <span className="font-mono font-bold text-xs">{empresa.cnpj}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Observações</span>
                      <span className="text-[10px] text-neutral-600">IPI - Operações Próprias / Fabricação Industrial (TIPI)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-neutral-200 pb-1">
                      <span className="text-[9px] text-neutral-500 uppercase font-sans">02 - Período de Apuração:</span>
                      <span className="font-bold">{apuracao.competencia}-30</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200 pb-1">
                      <span className="text-[9px] text-neutral-500 uppercase font-sans">04 - Código da Receita:</span>
                      <span className="font-bold text-neutral-900">1097</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200 pb-1">
                      <span className="text-[9px] text-neutral-500 uppercase font-sans">06 - Data de Vencimento:</span>
                      <span className="font-bold text-rose-700">{apuracao.dataVencimento}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-neutral-900 pb-1 pt-1">
                      <span className="text-[9px] text-neutral-500 uppercase font-sans font-bold">07 - Valor do Principal:</span>
                      <span className="font-black text-sm text-neutral-900">
                        R$ {apuracao.ipiARecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Código de Barras e QR Code PIX */}
                <div className="pt-2 border-t border-neutral-300 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase text-neutral-500 block">Linha Digitável FEBRABAN</span>
                    <span className="font-mono font-bold text-[10px] tracking-wider text-neutral-800">
                      85890000001 2 {apuracao.ipiARecolher.toFixed(0).padStart(4, '0')}0001097 5 20261025000 8 00000000000 1
                    </span>
                  </div>
                  <div className="p-1 border border-neutral-400 rounded bg-neutral-100 flex items-center space-x-1.5">
                    <QrCode size={28} className="text-neutral-900" />
                    <span className="text-[8px] font-bold uppercase text-neutral-600">PIX Instantâneo</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: SPED FISCAL BLOCO K (PRODUÇÃO & ESTOQUE) */}
        {activeTab === 'BLOCO_K' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Itens Escriturados no Estoque (Registro K200): <strong className="text-neutral-200">{registrosK.length}</strong>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const txt = dbService.gerarBlocoKSped(empresa.id, competencia);
                    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `SPED_Bloco_K_${competencia}.txt`;
                    a.click();
                  }}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-white/10"
                >
                  <Download size={14} />
                  <span>Exportar Arquivo Bloco K (.txt)</span>
                </button>
                <button
                  onClick={() => setModalNovoItemK(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow"
                >
                  <Plus size={14} />
                  <span>Novo Item K200</span>
                </button>
              </div>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/60 text-neutral-400 uppercase text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-3">Código do Item</th>
                    <th className="py-2.5 px-3">Descrição do Produto / Insumo</th>
                    <th className="py-2.5 px-3">Tipo SPED</th>
                    <th className="py-2.5 px-2 text-center">Unidade</th>
                    <th className="py-2.5 px-3 text-right">Qtd. em Estoque</th>
                    <th className="py-2.5 px-3 text-right">Custo Unitário (R$)</th>
                    <th className="py-2.5 px-3 text-right">Valor Total (R$)</th>
                    <th className="py-2.5 px-2 text-center">Propriedade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {registrosK.map(k => (
                    <tr key={k.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 font-bold text-amber-400">{k.codigoItem}</td>
                      <td className="py-2.5 px-3 font-sans text-neutral-200">{k.descricaoItem}</td>
                      <td className="py-2.5 px-3 font-sans text-neutral-400 text-[10px]">{k.tipoItem.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-neutral-300">{k.unidadeMedida}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-neutral-100">{k.quantidadeEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-right text-neutral-300">R$ {k.custoUnitarioMedio.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-400">
                        R$ {k.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-neutral-400 font-sans">
                          Em seu poder
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visualizador Pipe-Delimited do Bloco K */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide block">
                Pré-visualização dos Registros SPED Bloco K (EFD-ICMS/IPI):
              </span>
              <pre className="text-[10px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-all">
                {dbService.gerarBlocoKSped(empresa.id, competencia)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Modal Lançamento IPI */}
      {modalNovoItemIpi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-md w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-neutral-100 mb-3 flex items-center space-x-2">
              <Factory size={18} className="text-amber-400" />
              <span>Novo Lançamento no Livro Modelo 8 (IPI)</span>
            </h3>
            <form onSubmit={handleSalvarItemIpi} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo de Operação:</label>
                  <select
                    value={tipoIpi}
                    onChange={e => setTipoIpi(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="DEBITO_SAIDA">Débito por Saída</option>
                    <option value="CREDITO_ENTRADA">Crédito por Entrada</option>
                    <option value="OUTROS_DEBITOS">Outros Débitos</option>
                    <option value="OUTROS_CREDITOS">Outros Créditos</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CFOP:</label>
                  <input
                    type="text"
                    value={cfopIpi}
                    onChange={e => setCfopIpi(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descrição da Operação:</label>
                <input
                  type="text"
                  value={descIpi}
                  onChange={e => setDescIpi(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Base de Cálculo (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={baseIpi}
                    onChange={e => setBaseIpi(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Alíquota TIPI (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aliqIpi}
                    onChange={e => setAliqIpi(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Documento Fiscal / Observações:</label>
                <input
                  type="text"
                  value={docIpi}
                  onChange={e => setDocIpi(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div className="p-3 bg-neutral-900 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                <span className="text-neutral-400">IPI Apurado:</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  R$ {(baseIpi * (aliqIpi / 100)).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovoItemIpi(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold shadow"
                >
                  Salvar no Livro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Item Bloco K */}
      {modalNovoItemK && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-md w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-neutral-100 mb-3 flex items-center space-x-2">
              <Package size={18} className="text-amber-400" />
              <span>Novo Registro K200 (Estoque Escriturado)</span>
            </h3>
            <form onSubmit={handleSalvarItemK} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Código do Item:</label>
                  <input
                    type="text"
                    value={codItemK}
                    onChange={e => setCodItemK(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo SPED:</label>
                  <select
                    value={tipoItemK}
                    onChange={e => setTipoItemK(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="01_MATERIA_PRIMA">01 - Matéria-Prima</option>
                    <option value="02_EMBALAGEM">02 - Embalagem</option>
                    <option value="03_PRODUTO_PROCESSO">03 - Produto em Processo</option>
                    <option value="04_PRODUTO_ACABADO">04 - Produto Acabado</option>
                    <option value="00_MERCADORIA_REVENDA">00 - Mercadoria para Revenda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descrição do Item:</label>
                <input
                  type="text"
                  value={descItemK}
                  onChange={e => setDescItemK(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Unidade:</label>
                  <input
                    type="text"
                    value={unidK}
                    onChange={e => setUnidK(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 uppercase font-mono text-center"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Quantidade:</label>
                  <input
                    type="number"
                    step="0.001"
                    value={qtdK}
                    onChange={e => setQtdK(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Custo Médio (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoK}
                    onChange={e => setCustoK(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                <span className="text-neutral-400">Valor Total do Estoque:</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  R$ {(qtdK * custoK).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovoItemK(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold shadow"
                >
                  Escriturar K200
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
