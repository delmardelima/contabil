import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Printer,
  Barcode,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRightLeft
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  LancamentoLivroCaixaCarneLeao,
  ApuracaoMensalCarneLeao,
  TipoLancamentoCarneLeao,
  Empresa
} from '../../types/contabil';

interface CarneLeaoModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo?: React.ReactNode; linhas?: any[] }) => void;
}

export const CarneLeaoModule: React.FC<CarneLeaoModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competencia, setCompetencia] = useState<string>('2026-08');
  const [activeTab, setActiveTab] = useState<'livroCaixa' | 'apuracaoDarf'>('apuracaoDarf');
  const [lancamentos, setLancamentos] = useState<LancamentoLivroCaixaCarneLeao[]>([]);
  const [apuracao, setApuracao] = useState<ApuracaoMensalCarneLeao | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | TipoLancamentoCarneLeao>('TODOS');
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal Novo Lançamento
  const [modalAberto, setModalAberto] = useState(false);
  const [formData, setFormData] = useState<string>('2026-08-10');
  const [formTipo, setFormTipo] = useState<TipoLancamentoCarneLeao>('RECEITA');
  const [formCategoria, setFormCategoria] = useState<any>('TRABALHO_NAO_ASSALARIADO');
  const [formNumeroDoc, setFormNumeroDoc] = useState('');
  const [formHistorico, setFormHistorico] = useState('');
  const [formValor, setFormValor] = useState<number>(0);
  const [formDedutivel, setFormDedutivel] = useState(true);
  const [formCpf, setFormCpf] = useState('');

  const carregarDados = () => {
    const list = dbService.getLancamentosCarneLeao(empresaAtiva.id, competencia);
    setLancamentos(list);
    const ap = dbService.getApuracaoCarneLeao(empresaAtiva.id, competencia);
    setApuracao(ap);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, competencia]);

  const handleSalvarLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: LancamentoLivroCaixaCarneLeao = {
      id: `cl-${Date.now()}`,
      empresaId: empresaAtiva.id,
      data: formData,
      competencia,
      tipo: formTipo,
      categoria: formCategoria,
      numeroDocumento: formNumeroDoc,
      historico: formHistorico,
      valor: Number(formValor),
      dedutivel: formDedutivel,
      cpfBeneficiarioOuPagador: formCpf
    };

    dbService.salvarLancamentoCarneLeao(novo);
    setModalAberto(false);
    carregarDados();
    setMensagemStatus({
      tipo: 'sucesso',
      texto: 'Lançamento escriturado no Livro Caixa com sucesso!'
    });
    setTimeout(() => setMensagemStatus(null), 3000);
  };

  const handleExcluirLancamento = (id: string) => {
    dbService.excluirLancamentoCarneLeao(id);
    carregarDados();
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarCarneLeaoContabil(empresaAtiva.id, competencia);
    setMensagemStatus({
      tipo: res.sucesso ? 'sucesso' : 'erro',
      texto: res.mensagem
    });
    setTimeout(() => setMensagemStatus(null), 5000);
  };

  const handleEmitirDarfA4 = () => {
    if (!apuracao || !onOpenReportPreview) return;

    const relatorioContent = (
      <div className="font-sans text-neutral-800 p-4 space-y-4 max-w-xl mx-auto">
        <div className="border border-neutral-400 p-4 rounded bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Ministério da Fazenda - Receita Federal do Brasil
              </h2>
              <h1 className="text-lg font-black text-neutral-900">
                DARF - Documento de Arrecadação de Receitas Federais
              </h1>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold px-2 py-0.5 border border-neutral-400 rounded bg-neutral-100">
                CÓD. 0190
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2 border-r border-neutral-300 pr-3">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">01. Nome / Razão Social / Contribuinte</span>
                <span className="font-bold text-neutral-900">{empresaAtiva.razaoSocial}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">CPF / CNPJ do Contribuinte</span>
                <span className="font-mono font-bold">{empresaAtiva.cnpj}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">Denominação da Receita</span>
                <span className="font-medium text-neutral-700">IRPF - Carnê-Leão (Rendimentos do Trabalho Não Assalariado e Outros)</span>
              </div>
            </div>

            <div className="space-y-2 pl-2">
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-[10px] text-neutral-500 uppercase">02. Período de Apuração</span>
                <span className="font-mono font-bold">{apuracao.competencia}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-[10px] text-neutral-500 uppercase">03. Número do CPF/CNPJ</span>
                <span className="font-mono">{empresaAtiva.cnpj}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-[10px] text-neutral-500 uppercase">04. Código da Receita</span>
                <span className="font-mono font-bold">0190</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-[10px] text-neutral-500 uppercase">06. Data de Vencimento</span>
                <span className="font-mono font-bold text-rose-700">{apuracao.dataVencimento}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1 bg-neutral-100 p-1 rounded">
                <span className="text-[10px] text-neutral-700 uppercase font-bold">07. Valor do Principal</span>
                <span className="font-mono font-bold text-neutral-900 text-sm">
                  R$ {apuracao.darfRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between bg-neutral-200 p-1.5 rounded font-black text-xs">
                <span>10. VALOR TOTAL</span>
                <span className="font-mono text-sm text-neutral-950">
                  R$ {apuracao.darfRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-300 text-center">
            <p className="text-[10px] text-neutral-500 font-mono tracking-widest mb-1">{apuracao.codigoBarrasDarf}</p>
            <div className="bg-neutral-100 border border-neutral-300 p-2 rounded flex items-center justify-center gap-2">
              <Barcode size={32} className="text-neutral-800" />
              <span className="font-mono text-xs tracking-wider font-bold">{apuracao.codigoBarrasDarf}</span>
            </div>
            <p className="text-[9px] text-neutral-400 mt-1 italic">
              Pagar preferencialmente via canais eletrônicos ou PIX até a data limite de vencimento.
            </p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'DARF Oficial - Código 0190 (Carnê-Leão)',
      subtitulo: `Competência ${apuracao.competencia} - Vencimento ${apuracao.dataVencimento}`,
      conteudo: relatorioContent
    });
  };

  const handleEmitirLivroCaixaA4 = () => {
    if (!apuracao || !onOpenReportPreview) return;

    const relatorioContent = (
      <div className="font-sans text-neutral-800 p-4 space-y-4">
        <div className="border-b border-neutral-300 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wider text-neutral-900">
              Livro Caixa Digital - Apuração do Carnê-Leão (IRPF)
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              Instrução Normativa RFB nº 1.500/2014 & Lei Federal nº 7.713/1988 (Art. 6º)
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded">
              Competência: {competencia}
            </span>
          </div>
        </div>

        {/* Resumo da Apuração */}
        <div className="grid grid-cols-3 gap-3 text-xs bg-neutral-50 p-3 rounded border border-neutral-200">
          <div>
            <span className="text-neutral-500 block text-[10px]">Rendimentos Tributáveis:</span>
            <span className="font-mono font-bold text-neutral-900">
              R$ {apuracao.totalRendimentosTributaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px]">Dedução Livro Caixa Efetiva:</span>
            <span className="font-mono font-bold text-neutral-900">
              R$ {apuracao.deducaoLivroCaixaEfetiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px]">Excesso p/ Mês Seguinte:</span>
            <span className="font-mono font-bold text-amber-700">
              R$ {apuracao.excessoDeducoesParaMesSeguinte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Lançamentos do Mês */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Demonstrativo Analítico dos Lançamentos no Livro Caixa
          </h2>
          <table className="w-full text-[10px] border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 text-neutral-700 text-left">
                <th className="p-1.5 border border-neutral-300">Data</th>
                <th className="p-1.5 border border-neutral-300">Tipo</th>
                <th className="p-1.5 border border-neutral-300">Documento / Histórico</th>
                <th className="p-1.5 border border-neutral-300">CPF / CNPJ</th>
                <th className="p-1.5 border border-neutral-300 text-center">Dedutível</th>
                <th className="p-1.5 border border-neutral-300 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id} className="border-b border-neutral-200">
                  <td className="p-1.5 border border-neutral-200 font-mono">{l.data}</td>
                  <td className="p-1.5 border border-neutral-200 font-bold">
                    <span className={l.tipo === 'RECEITA' ? 'text-emerald-700' : 'text-neutral-700'}>
                      {l.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA'}
                    </span>
                  </td>
                  <td className="p-1.5 border border-neutral-200">
                    <span className="font-mono font-bold">{l.numeroDocumento}</span> - {l.historico}
                  </td>
                  <td className="p-1.5 border border-neutral-200 font-mono">{l.cpfBeneficiarioOuPagador || '-'}</td>
                  <td className="p-1.5 border border-neutral-200 text-center font-bold">
                    {l.dedutivel ? 'SIM' : 'NÃO'}
                  </td>
                  <td className={`p-1.5 border border-neutral-200 text-right font-mono font-bold ${
                    l.tipo === 'RECEITA' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Assinaturas */}
        <div className="pt-6 border-t border-neutral-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
              <p className="font-bold text-neutral-800">{empresaAtiva.razaoSocial}</p>
              <p className="text-neutral-500">Contribuinte / Profissional Liberal</p>
            </div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
              <p className="font-bold text-neutral-800">Contabil Studio Pro</p>
              <p className="text-neutral-500">Escrituração Contábil e Fiscal - CRC/SP</p>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Livro Caixa Digital e Demonstrativo Analítico',
      subtitulo: `Competência ${competencia} - ${empresaAtiva.razaoSocial}`,
      conteudo: relatorioContent
    });
  };

  const lancamentosFiltrados = lancamentos.filter((l) => {
    if (filtroTipo !== 'TODOS' && l.tipo !== filtroTipo) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-[#181818] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              Livro Caixa Digital & Apuração do Carnê-Leão
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                IN RFB nº 1.500/2014 & Art. 6º Lei 7.713/88
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Escrituração de receitas e despesas dedutíveis de profissionais liberais e autônomos com carry-forward de excesso
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#202020] border border-neutral-700 px-2.5 py-1.5 rounded text-xs">
            <span className="text-neutral-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-neutral-200 font-bold focus:outline-none cursor-pointer font-mono"
            />
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition shadow-sm"
          >
            <Plus size={14} />
            Novo Lançamento
          </button>

          <button
            onClick={handleIntegrarContabil}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition shadow-sm"
          >
            <ArrowRightLeft size={14} />
            Integrar Diário
          </button>

          <button
            onClick={handleEmitirDarfA4}
            disabled={!apuracao}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition shadow-sm"
          >
            <Barcode size={14} />
            Guia DARF 0190
          </button>

          <button
            onClick={handleEmitirLivroCaixaA4}
            disabled={!apuracao}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition shadow-sm"
          >
            <Printer size={14} />
            Livro Caixa A4
          </button>
        </div>
      </div>

      {mensagemStatus && (
        <div className={`p-3 text-xs flex items-center gap-2 border-b ${
          mensagemStatus.tipo === 'sucesso'
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
            : 'bg-rose-950/40 text-rose-300 border-rose-800'
        }`}>
          {mensagemStatus.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {mensagemStatus.texto}
        </div>
      )}

      {apuracao && (
        <div className="p-4 space-y-4">
          {/* Dashboard Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Rendimentos Brutos</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                R$ {apuracao.totalRendimentosTributaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Trabalho não assalariado / locação</div>
            </div>

            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Dedução Livro Caixa</span>
                <TrendingDown size={16} className="text-blue-400" />
              </div>
              <div className="text-lg font-bold font-mono text-blue-400">
                R$ {apuracao.deducaoLivroCaixaEfetiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Despesas de custeio aproveitadas</div>
            </div>

            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Excesso p/ Mês Seguinte</span>
                <ArrowRight size={16} className="text-amber-400" />
              </div>
              <div className="text-lg font-bold font-mono text-amber-400">
                R$ {apuracao.excessoDeducoesParaMesSeguinte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Carry-forward Art. 6º Lei 7.713/88</div>
            </div>

            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">DARF 0190 a Recolher</span>
                <Barcode size={16} className="text-rose-400" />
              </div>
              <div className="text-lg font-bold font-mono text-rose-400">
                R$ {apuracao.darfRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Vencimento: {apuracao.dataVencimento}</div>
            </div>
          </div>

          {/* Abas */}
          <div className="border-b border-neutral-800 flex gap-2">
            <button
              onClick={() => setActiveTab('apuracaoDarf')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'apuracaoDarf'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Apuração Mensal & Guia DARF
            </button>
            <button
              onClick={() => setActiveTab('livroCaixa')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'livroCaixa'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Livro Caixa Digital ({lancamentos.length} Lançamentos)
            </button>
          </div>

          {/* Conteúdo Aba Apuração & DARF */}
          {activeTab === 'apuracaoDarf' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quadro de Cálculo */}
              <div className="p-4 bg-[#181818] border border-neutral-800 rounded-lg space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Memória de Cálculo do Carnê-Leão (Tabela Progressiva IRPF 2026)
                </h2>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-[#202020] rounded border border-neutral-800">
                    <span className="text-neutral-300">(+) Rendimentos Brutos Tributáveis</span>
                    <span className="font-mono font-bold text-neutral-100">
                      R$ {apuracao.totalRendimentosTributaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 bg-[#202020] rounded border border-neutral-800">
                    <span className="text-neutral-300">(-) Despesas de Custeio Dedutíveis do Mês</span>
                    <span className="font-mono font-bold text-neutral-300">
                      R$ {apuracao.totalDespesasCusteioDedutiveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 bg-[#202020] rounded border border-neutral-800">
                    <span className="text-amber-400">(-) Excesso de Deduções do Mês Anterior</span>
                    <span className="font-mono font-bold text-amber-400">
                      R$ {apuracao.excessoDeducoesMesAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 bg-blue-950/20 border border-blue-800/40 rounded text-blue-300 font-semibold">
                    <span>(=) Dedução Efetiva do Livro Caixa</span>
                    <span className="font-mono">
                      R$ {apuracao.deducaoLivroCaixaEfetiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 bg-[#202020] rounded border border-neutral-800">
                    <span className="text-neutral-300">(-) Previdência Oficial de Autônomo</span>
                    <span className="font-mono font-bold text-neutral-300">
                      R$ {apuracao.previdenciaOficialAutonomo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 bg-[#202020] rounded border border-neutral-800">
                    <span className="text-neutral-300">(-) Dependentes ({apuracao.dependentesQuantidade} x R$ 189,59)</span>
                    <span className="font-mono font-bold text-neutral-300">
                      R$ {apuracao.valorDeducaoDependentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 bg-neutral-800/60 rounded border border-neutral-700 font-bold text-neutral-100">
                    <span>(=) Base de Cálculo do Imposto</span>
                    <span className="font-mono text-emerald-400">
                      R$ {apuracao.baseCalculoImposto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1">
                    <div>Alíquota Efetiva: <span className="font-bold text-neutral-200">{apuracao.aliquotaEfetiva}%</span></div>
                    <div>Parcela a Deduzir: <span className="font-bold text-neutral-200">R$ {apuracao.parcelaDeduzirTabela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  </div>

                  <div className="flex justify-between p-2.5 bg-rose-950/30 border border-rose-800/60 rounded font-bold text-rose-300 text-sm">
                    <span>(=) DARF Carnê-Leão a Recolher</span>
                    <span className="font-mono text-base">
                      R$ {apuracao.darfRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guia DARF Visual */}
              <div className="p-4 bg-[#181818] border border-neutral-800 rounded-lg flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Guia Oficial de Arrecadação (DARF)
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 text-[10px] font-mono font-bold border border-rose-800">
                      Código 0190
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Período de Apuração:</span>
                      <span className="font-mono text-neutral-200">{apuracao.competencia}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Contribuinte:</span>
                      <span className="font-bold text-neutral-200">{empresaAtiva.razaoSocial}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>CPF / CNPJ:</span>
                      <span className="font-mono text-neutral-200">{empresaAtiva.cnpj}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Data de Vencimento:</span>
                      <span className="font-mono font-bold text-rose-400">{apuracao.dataVencimento}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-800">
                      <span>Valor do Principal:</span>
                      <span className="font-mono font-bold text-neutral-100 text-sm">
                        R$ {apuracao.darfRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#131313] border border-neutral-800 rounded text-center space-y-2">
                  <p className="text-[10px] text-neutral-500 font-mono tracking-wider">{apuracao.codigoBarrasDarf}</p>
                  <div className="flex items-center justify-center gap-2 text-neutral-300">
                    <Barcode size={36} />
                  </div>
                  <button
                    onClick={handleEmitirDarfA4}
                    className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium transition"
                  >
                    Visualizar e Imprimir DARF Timbrada
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo Aba Livro Caixa */}
          {activeTab === 'livroCaixa' && (
            <div className="p-4 bg-[#181818] border border-neutral-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFiltroTipo('TODOS')}
                    className={`px-3 py-1 rounded text-xs transition ${
                      filtroTipo === 'TODOS' ? 'bg-neutral-200 text-neutral-900 font-bold' : 'bg-[#222] text-neutral-400'
                    }`}
                  >
                    Todos ({lancamentos.length})
                  </button>
                  <button
                    onClick={() => setFiltroTipo('RECEITA')}
                    className={`px-3 py-1 rounded text-xs transition ${
                      filtroTipo === 'RECEITA' ? 'bg-emerald-600 text-white font-bold' : 'bg-[#222] text-emerald-400'
                    }`}
                  >
                    Receitas
                  </button>
                  <button
                    onClick={() => setFiltroTipo('DESPESA_CUSTEIO')}
                    className={`px-3 py-1 rounded text-xs transition ${
                      filtroTipo === 'DESPESA_CUSTEIO' ? 'bg-blue-600 text-white font-bold' : 'bg-[#222] text-blue-400'
                    }`}
                  >
                    Despesas de Custeio
                  </button>
                </div>

                <button
                  onClick={() => setModalAberto(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
                >
                  <Plus size={14} />
                  Novo Lançamento
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Tipo</th>
                      <th className="p-2.5">Categoria</th>
                      <th className="p-2.5">Documento</th>
                      <th className="p-2.5">Histórico</th>
                      <th className="p-2.5">CPF / Pagador</th>
                      <th className="p-2.5 text-center">Dedutível</th>
                      <th className="p-2.5 text-right">Valor (R$)</th>
                      <th className="p-2.5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentosFiltrados.map((l) => (
                      <tr key={l.id} className="border-b border-neutral-800/60 hover:bg-neutral-800/30">
                        <td className="p-2.5 font-mono text-neutral-300">{l.data}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.tipo === 'RECEITA'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-950/60 text-blue-300 border border-blue-800'
                          }`}>
                            {l.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA'}
                          </span>
                        </td>
                        <td className="p-2.5 text-neutral-300 font-medium">{l.categoria.replace(/_/g, ' ')}</td>
                        <td className="p-2.5 font-mono text-neutral-300">{l.numeroDocumento}</td>
                        <td className="p-2.5 text-neutral-200">{l.historico}</td>
                        <td className="p-2.5 font-mono text-neutral-400">{l.cpfBeneficiarioOuPagador || '-'}</td>
                        <td className="p-2.5 text-center">
                          {l.dedutivel ? (
                            <span className="text-emerald-400 font-bold">SIM</span>
                          ) : (
                            <span className="text-neutral-500">NÃO</span>
                          )}
                        </td>
                        <td className={`p-2.5 text-right font-mono font-bold ${
                          l.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-neutral-200'
                        }`}>
                          R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleExcluirLancamento(l.id)}
                            className="p-1 text-neutral-500 hover:text-rose-400"
                            title="Excluir Lançamento"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Novo Lançamento */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-neutral-800 bg-[#222] flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-200">
                Novo Lançamento no Livro Caixa
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-neutral-400 hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarLancamento} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Tipo de Lançamento</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as any)}
                    className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200"
                  >
                    <option value="RECEITA">RECEITA</option>
                    <option value="DESPESA_CUSTEIO">DESPESA DE CUSTEIO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Categoria de Livro Caixa</label>
                <select
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value as any)}
                  className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200"
                >
                  {formTipo === 'RECEITA' ? (
                    <>
                      <option value="TRABALHO_NAO_ASSALARIADO">Trabalho Não Assalariado (Honorários / Consultas)</option>
                      <option value="ALUGUEL_RECEBIDO">Aluguel de Imóvel Recebido</option>
                      <option value="EXTERIOR">Rendimentos Recebidos do Exterior</option>
                    </>
                  ) : (
                    <>
                      <option value="ALUGUEL_CONSULTORIO">Aluguel, Condomínio e IPTU do Consultório</option>
                      <option value="SALARIOS_ENCARGOS_SECRETARIA">Salários e Encargos da Secretaria / Recepção</option>
                      <option value="MATERIAL_CONSUMO">Material de Consumo e Insumos Profissionais</option>
                      <option value="ENERGIA_AGUA_TELEFONE">Energia Elétrica, Água e Internet do Consultório</option>
                      <option value="CONSELHO_CLASSE_ANUIDADE">Anuidade de Conselho de Classe (CRM, CRO, OAB)</option>
                      <option value="OUTRAS_DESPESAS_CUSTEIO">Outras Despesas de Custeio Dedutíveis</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Número do Documento</label>
                  <input
                    type="text"
                    required
                    placeholder="Recibo, NF ou Fatura"
                    value={formNumeroDoc}
                    onChange={(e) => setFormNumeroDoc(e.target.value)}
                    className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">CPF / CNPJ Pagador/Beneficiário</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formCpf}
                    onChange={(e) => setFormCpf(e.target.value)}
                    className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Histórico Descritivo</label>
                <input
                  type="text"
                  required
                  placeholder="Descrição minuciosa do serviço ou despesa..."
                  value={formHistorico}
                  onChange={(e) => setFormHistorico(e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formValor}
                    onChange={(e) => setFormValor(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-bold"
                  />
                </div>
                {formTipo === 'DESPESA_CUSTEIO' && (
                  <div className="pt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dedutivel"
                      checked={formDedutivel}
                      onChange={(e) => setFormDedutivel(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="dedutivel" className="text-[11px] text-neutral-300 cursor-pointer">
                      Despesa Dedutível (Art. 6º)
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
