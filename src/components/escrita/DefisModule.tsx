import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Printer,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  PackageCheck,
  Landmark,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DeclaracaoDefis,
  DadosSocioDefis,
  Empresa
} from '../../types/contabil';

interface DefisModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo?: React.ReactNode; linhas?: any[] }) => void;
}

export const DefisModule: React.FC<DefisModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [anoCalendario, setAnoCalendario] = useState<number>(2025);
  const [activeTab, setActiveTab] = useState<'socioeconomico' | 'socios' | 'transmissao'>('socioeconomico');
  const [declaracao, setDeclaracao] = useState<DeclaracaoDefis | null>(null);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal de Sócio
  const [modalSocioAberto, setModalSocioAberto] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [formCpf, setFormCpf] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formPercentual, setFormPercentual] = useState<number>(50);
  const [formRendimentoIsento, setFormRendimentoIsento] = useState<number>(0);
  const [formProLabore, setFormProLabore] = useState<number>(0);
  const [formIrrf, setFormIrrf] = useState<number>(0);

  const carregarDeclaracao = () => {
    const d = dbService.getDeclaracaoDefis(empresaAtiva.id, anoCalendario);
    setDeclaracao(d);
  };

  useEffect(() => {
    carregarDeclaracao();
  }, [empresaAtiva.id, anoCalendario]);

  const handleSincronizarContabil = () => {
    const d = dbService.autoSincronizarDefisContabil(empresaAtiva.id, anoCalendario);
    setDeclaracao(d);
    setMensagemStatus({
      tipo: 'sucesso',
      texto: 'Dados socioeconômicos e societários sincronizados com sucesso a partir dos saldos do Balancete e Diário!'
    });
    setTimeout(() => setMensagemStatus(null), 4000);
  };

  const handleSalvar = () => {
    if (!declaracao) return;
    dbService.salvarDeclaracaoDefis(declaracao);
    setMensagemStatus({
      tipo: 'sucesso',
      texto: 'Declaração DEFIS salva com sucesso na base de dados!'
    });
    setTimeout(() => setMensagemStatus(null), 3000);
  };

  const handleAbrirModalNovoSocio = () => {
    setEditandoIndex(null);
    setFormCpf('');
    setFormNome('');
    setFormPercentual(0);
    setFormRendimentoIsento(0);
    setFormProLabore(0);
    setFormIrrf(0);
    setModalSocioAberto(true);
  };

  const handleAbrirModalEditarSocio = (index: number) => {
    if (!declaracao) return;
    const s = declaracao.socios[index];
    setEditandoIndex(index);
    setFormCpf(s.cpf);
    setFormNome(s.nome);
    setFormPercentual(s.percentualCapital);
    setFormRendimentoIsento(s.rendimentoIsentoDistribuido);
    setFormProLabore(s.rendimentoTributavelProLabore);
    setFormIrrf(s.impostoRetido);
    setModalSocioAberto(true);
  };

  const handleSalvarSocio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declaracao) return;

    const socio: DadosSocioDefis = {
      cpf: formCpf,
      nome: formNome,
      percentualCapital: Number(formPercentual),
      rendimentoIsentoDistribuido: Number(formRendimentoIsento),
      rendimentoTributavelProLabore: Number(formProLabore),
      impostoRetido: Number(formIrrf)
    };

    const novosSocios = [...declaracao.socios];
    if (editandoIndex !== null) {
      novosSocios[editandoIndex] = socio;
    } else {
      novosSocios.push(socio);
    }

    const totalDist = novosSocios.reduce((acc, s) => acc + s.rendimentoIsentoDistribuido, 0);

    const atualizada: DeclaracaoDefis = {
      ...declaracao,
      socios: novosSocios,
      totalRendimentosDistribuidos: totalDist
    };

    setDeclaracao(atualizada);
    dbService.salvarDeclaracaoDefis(atualizada);
    setModalSocioAberto(false);
  };

  const handleExcluirSocio = (index: number) => {
    if (!declaracao) return;
    const novosSocios = declaracao.socios.filter((_, i) => i !== index);
    const totalDist = novosSocios.reduce((acc, s) => acc + s.rendimentoIsentoDistribuido, 0);
    const atualizada: DeclaracaoDefis = {
      ...declaracao,
      socios: novosSocios,
      totalRendimentosDistribuidos: totalDist
    };
    setDeclaracao(atualizada);
    dbService.salvarDeclaracaoDefis(atualizada);
  };

  const handleEmitirEspelhoA4 = () => {
    if (!declaracao || !onOpenReportPreview) return;

    const relatorioContent = (
      <div className="font-sans text-neutral-800 p-4 space-y-5">
        <div className="border-b border-neutral-300 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-900">
              DEFIS - Declaração de Informações Socioeconômicas e Fiscais
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Simples Nacional - Resolução CGSN nº 140/2018 e LC nº 123/2006
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded text-xs font-bold tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              {declaracao.tipoDeclaracao} - EXERCÍCIO {declaracao.anoExercicio}
            </span>
            <p className="text-[10px] text-neutral-500 mt-1">Ano-Calendário: {declaracao.anoCalendario}</p>
          </div>
        </div>

        {/* Dados Cadastrais */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-3 rounded border border-neutral-200">
          <div>
            <p><span className="font-bold">Razão Social:</span> {empresaAtiva.razaoSocial}</p>
            <p><span className="font-bold">CNPJ:</span> {empresaAtiva.cnpj}</p>
            <p><span className="font-bold">Inscrição Estadual:</span> {empresaAtiva.inscricaoEstadual || 'Isento'}</p>
          </div>
          <div>
            <p><span className="font-bold">Município:</span> {empresaAtiva.cidade} - {empresaAtiva.uf || 'SP'}</p>
            <p><span className="font-bold">Empregados no Início:</span> {declaracao.numeroEmpregadosInicio}</p>
            <p><span className="font-bold">Empregados no Fim:</span> {declaracao.numeroEmpregadosFim}</p>
          </div>
        </div>

        {/* Quadro Socioeconômico */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 border-b border-neutral-200 pb-1">
            Informações Econômico-Fiscais Consolidadas
          </h2>
          <table className="w-full text-xs border-collapse border border-neutral-300">
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="p-2 font-medium bg-neutral-50 w-2/3">Saldo em Caixa e Bancos no Início do Período</td>
                <td className="p-2 text-right font-mono font-bold">R$ {declaracao.saldoCaixaBancosInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="p-2 font-medium bg-neutral-50">Saldo em Caixa e Bancos no Fim do Período</td>
                <td className="p-2 text-right font-mono font-bold text-blue-700">R$ {declaracao.saldoCaixaBancosFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="p-2 font-medium bg-neutral-50">Estoque Inicial de Mercadorias e Insumos</td>
                <td className="p-2 text-right font-mono font-bold">R$ {declaracao.estoqueInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="p-2 font-medium bg-neutral-50">Estoque Final de Mercadorias e Insumos</td>
                <td className="p-2 text-right font-mono font-bold text-blue-700">R$ {declaracao.estoqueFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="p-2 font-medium bg-neutral-50">Total de Aquisição de Mercadorias para Comercialização/Industrialização</td>
                <td className="p-2 text-right font-mono font-bold">R$ {declaracao.totalAquisicaoMercadorias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="p-2 font-medium bg-neutral-50">Total de Despesas Operacionais Pagas no Período</td>
                <td className="p-2 text-right font-mono font-bold">R$ {declaracao.totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-neutral-200 bg-neutral-100 font-bold">
                <td className="p-2">Lucro Contábil Apurado pela Escrituração Mercantil</td>
                <td className="p-2 text-right font-mono text-emerald-800">R$ {declaracao.lucroContabilApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="border-b border-neutral-200 bg-emerald-50 font-bold">
                <td className="p-2 text-emerald-950">Total de Rendimentos Isentos e Não Tributáveis Distribuídos aos Sócios</td>
                <td className="p-2 text-right font-mono text-emerald-800">R$ {declaracao.totalRendimentosDistribuidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quadro de Sócios */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 border-b border-neutral-200 pb-1">
            Rendimentos dos Sócios ou Titular (QSA)
          </h2>
          <table className="w-full text-[11px] border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 text-neutral-700 text-left">
                <th className="p-1.5 border border-neutral-300">CPF</th>
                <th className="p-1.5 border border-neutral-300">Nome do Sócio / Titular</th>
                <th className="p-1.5 border border-neutral-300 text-center">% Capital</th>
                <th className="p-1.5 border border-neutral-300 text-right">Rend. Isento (Lucro)</th>
                <th className="p-1.5 border border-neutral-300 text-right">Pró-Labore</th>
                <th className="p-1.5 border border-neutral-300 text-right">IRRF Retido</th>
              </tr>
            </thead>
            <tbody>
              {declaracao.socios.map((s, idx) => (
                <tr key={idx} className="border-b border-neutral-200">
                  <td className="p-1.5 border border-neutral-200 font-mono">{s.cpf}</td>
                  <td className="p-1.5 border border-neutral-200 font-bold">{s.nome}</td>
                  <td className="p-1.5 border border-neutral-200 text-center font-mono">{s.percentualCapital.toFixed(1)}%</td>
                  <td className="p-1.5 border border-neutral-200 text-right font-mono text-emerald-700 font-bold">
                    R$ {s.rendimentoIsentoDistribuido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 border border-neutral-200 text-right font-mono">
                    R$ {s.rendimentoTributavelProLabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 border border-neutral-200 text-right font-mono">
                    R$ {s.impostoRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Termo e Assinaturas */}
        <div className="pt-4 border-t border-neutral-300 text-xs space-y-4">
          <p className="italic text-neutral-600 bg-neutral-50 p-2.5 rounded border border-neutral-200">
            "{declaracao.termoResponsabilidade}"
          </p>
          <div className="grid grid-cols-2 gap-8 text-center pt-4">
            <div>
              <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
                <p className="font-bold text-neutral-800">{empresaAtiva.razaoSocial}</p>
                <p className="text-neutral-500">Administrador / Sócio Titular</p>
              </div>
            </div>
            <div>
              <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
                <p className="font-bold text-neutral-800">Contabil Studio Pro</p>
                <p className="text-neutral-500">Contador Responsável - CRC/SP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Espelho Oficial DEFIS - Simples Nacional',
      subtitulo: `Ano-Calendário ${declaracao.anoCalendario} - Exercício ${declaracao.anoExercicio} - ${empresaAtiva.razaoSocial}`,
      conteudo: relatorioContent
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-[#181818] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              DEFIS - Declaração de Informações Socioeconômicas e Fiscais
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                Resolução CGSN nº 140/2018
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Escrituração dos dados socioeconômicos, estoques, disponibilidades e distribuição de lucros aos sócios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#202020] border border-neutral-700 px-2.5 py-1.5 rounded text-xs">
            <span className="text-neutral-400">Ano-Calendário:</span>
            <select
              value={anoCalendario}
              onChange={(e) => setAnoCalendario(Number(e.target.value))}
              className="bg-transparent text-neutral-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value={2025} className="bg-[#202020]">2025 (Exercício 2026)</option>
              <option value={2024} className="bg-[#202020]">2024 (Exercício 2025)</option>
              <option value={2023} className="bg-[#202020]">2023 (Exercício 2024)</option>
            </select>
          </div>

          <button
            onClick={handleSincronizarContabil}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition shadow-sm"
          >
            <RefreshCw size={14} />
            Sincronizar c/ Balancete
          </button>

          <button
            onClick={handleSalvar}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition shadow-sm"
          >
            <Save size={14} />
            Salvar
          </button>

          <button
            onClick={handleEmitirEspelhoA4}
            disabled={!declaracao}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition shadow-sm"
          >
            <Printer size={14} />
            Espelho DEFIS A4
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

      {declaracao && (
        <div className="p-4 space-y-4">
          {/* Top Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Caixa e Bancos Final</span>
                <Landmark size={16} className="text-blue-400" />
              </div>
              <div className="text-lg font-bold font-mono text-neutral-100">
                R$ {declaracao.saldoCaixaBancosFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Inicial: R$ {declaracao.saldoCaixaBancosInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Estoque Final</span>
                <PackageCheck size={16} className="text-amber-400" />
              </div>
              <div className="text-lg font-bold font-mono text-neutral-100">
                R$ {declaracao.estoqueFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Inicial: R$ {declaracao.estoqueInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Lucro Contábil Apurado</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                R$ {declaracao.lucroContabilApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Escrituração regular mantida
              </div>
            </div>

            <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-[11px] font-medium">Lucros Isentos Distribuídos</span>
                <Users size={16} className="text-emerald-400" />
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                R$ {declaracao.totalRendimentosDistribuidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Distribuído a {declaracao.socios.length} sócios
              </div>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="border-b border-neutral-800 flex gap-2">
            <button
              onClick={() => setActiveTab('socioeconomico')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'socioeconomico'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Dados Socioeconômicos
            </button>
            <button
              onClick={() => setActiveTab('socios')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'socios'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Quadro Societário & Rendimentos ({declaracao.socios.length})
            </button>
            <button
              onClick={() => setActiveTab('transmissao')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'transmissao'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Termo & Validação PGDAS-D
            </button>
          </div>

          {/* Conteúdo das Abas */}
          {activeTab === 'socioeconomico' && (
            <div className="p-4 bg-[#181818] border border-neutral-800 rounded-lg space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Discriminação das Informações Operacionais da Empresa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[#1e1e1e] border border-neutral-800 rounded space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <PackageCheck size={14} className="text-amber-400" />
                    Estoques de Mercadorias e Materiais
                  </h3>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Estoque Inicial (R$)</label>
                    <input
                      type="number"
                      value={declaracao.estoqueInicial}
                      onChange={(e) => setDeclaracao({ ...declaracao, estoqueInicial: Number(e.target.value) })}
                      className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Estoque Final (R$)</label>
                    <input
                      type="number"
                      value={declaracao.estoqueFinal}
                      onChange={(e) => setDeclaracao({ ...declaracao, estoqueFinal: Number(e.target.value) })}
                      className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#1e1e1e] border border-neutral-800 rounded space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Landmark size={14} className="text-blue-400" />
                    Disponibilidades Financeiras (Caixa e Bancos)
                  </h3>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Saldo Caixa/Bancos Inicial (R$)</label>
                    <input
                      type="number"
                      value={declaracao.saldoCaixaBancosInicial}
                      onChange={(e) => setDeclaracao({ ...declaracao, saldoCaixaBancosInicial: Number(e.target.value) })}
                      className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Saldo Caixa/Bancos Final (R$)</label>
                    <input
                      type="number"
                      value={declaracao.saldoCaixaBancosFinal}
                      onChange={(e) => setDeclaracao({ ...declaracao, saldoCaixaBancosFinal: Number(e.target.value) })}
                      className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#1e1e1e] border border-neutral-800 rounded space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-400" />
                    Compras e Despesas Operacionais
                  </h3>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Total Aquisição de Mercadorias (R$)</label>
                    <input
                      type="number"
                      value={declaracao.totalAquisicaoMercadorias}
                      onChange={(e) => setDeclaracao({ ...declaracao, totalAquisicaoMercadorias: Number(e.target.value) })}
                      className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Total Despesas Operacionais Pagas (R$)</label>
                    <input
                      type="number"
                      value={declaracao.totalDespesasOperacionais}
                      onChange={(e) => setDeclaracao({ ...declaracao, totalDespesasOperacionais: Number(e.target.value) })}
                      className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#1e1e1e] border border-neutral-800 rounded space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Users size={14} className="text-purple-400" />
                    Quadro Funcional (Empregados)
                  </h3>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Número de Empregados no Início do Período</label>
                    <input
                      type="number"
                      value={declaracao.numeroEmpregadosInicio}
                      onChange={(e) => setDeclaracao({ ...declaracao, numeroEmpregadosInicio: Number(e.target.value) })}
                      className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Número de Empregados no Fim do Período</label>
                    <input
                      type="number"
                      value={declaracao.numeroEmpregadosFim}
                      onChange={(e) => setDeclaracao({ ...declaracao, numeroEmpregadosFim: Number(e.target.value) })}
                      className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'socios' && (
            <div className="p-4 bg-[#181818] border border-neutral-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Rendimentos e Distribuição de Lucros aos Sócios
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Segregação de lucros efetivos isentos e pró-labore sujeito à tabela do IRPF e contribuição previdenciária
                  </p>
                </div>
                <button
                  onClick={handleAbrirModalNovoSocio}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
                >
                  <Plus size={14} />
                  Adicionar Sócio
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                      <th className="p-2.5">CPF</th>
                      <th className="p-2.5">Nome do Sócio</th>
                      <th className="p-2.5 text-center">% Capital</th>
                      <th className="p-2.5 text-right">Rend. Isento (Lucro)</th>
                      <th className="p-2.5 text-right">Pró-Labore</th>
                      <th className="p-2.5 text-right">IRRF Retido</th>
                      <th className="p-2.5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declaracao.socios.map((s, idx) => (
                      <tr key={idx} className="border-b border-neutral-800/60 hover:bg-neutral-800/30">
                        <td className="p-2.5 font-mono text-neutral-300">{s.cpf}</td>
                        <td className="p-2.5 font-bold text-neutral-100">{s.nome}</td>
                        <td className="p-2.5 text-center font-mono">{s.percentualCapital.toFixed(1)}%</td>
                        <td className="p-2.5 text-right font-mono text-emerald-400 font-bold">
                          R$ {s.rendimentoIsentoDistribuido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-mono text-neutral-300">
                          R$ {s.rendimentoTributavelProLabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-mono text-neutral-300">
                          R$ {s.impostoRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleAbrirModalEditarSocio(idx)}
                              className="p-1 text-neutral-400 hover:text-blue-400"
                              title="Editar Sócio"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleExcluirSocio(idx)}
                              className="p-1 text-neutral-400 hover:text-rose-400"
                              title="Excluir Sócio"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transmissao' && (
            <div className="p-4 bg-[#181818] border border-neutral-800 rounded-lg space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Termo de Responsabilidade & Status de Envio à RFB
              </h2>

              <div className="p-4 bg-[#1e1e1e] border border-neutral-800 rounded space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck size={20} />
                  <span className="font-bold text-sm">Escrituração Conforme as Diretrizes da LC 123/2006</span>
                </div>
                <textarea
                  rows={3}
                  value={declaracao.termoResponsabilidade}
                  onChange={(e) => setDeclaracao({ ...declaracao, termoResponsabilidade: e.target.value })}
                  className="w-full bg-[#141414] border border-neutral-700 rounded p-2.5 text-xs text-neutral-300 italic focus:outline-none focus:border-blue-500"
                />

                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-neutral-500 block">Status da Declaração:</span>
                    <span className="font-bold text-emerald-400">Pronta para Transmissão via PGDAS-D</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Data de Geração:</span>
                    <span className="font-mono text-neutral-300">
                      {new Date(declaracao.dataGeracao).toLocaleDateString('pt-BR')} às {new Date(declaracao.dataGeracao).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Adicionar/Editar Sócio */}
      {modalSocioAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-neutral-800 bg-[#222] flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-200">
                {editandoIndex !== null ? 'Editar Dados do Sócio' : 'Novo Sócio para DEFIS'}
              </h3>
              <button
                onClick={() => setModalSocioAberto(false)}
                className="text-neutral-400 hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarSocio} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">CPF do Sócio</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={formCpf}
                  onChange={(e) => setFormCpf(e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">% de Capital</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPercentual}
                    onChange={(e) => setFormPercentual(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">IRRF Retido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formIrrf}
                    onChange={(e) => setFormIrrf(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Rendimento Isento Distribuído (Lucro) (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formRendimentoIsento}
                  onChange={(e) => setFormRendimentoIsento(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Rendimento Tributável (Pró-Labore) (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formProLabore}
                  onChange={(e) => setFormProLabore(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalSocioAberto(false)}
                  className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-neutral-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                >
                  Salvar Sócio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
