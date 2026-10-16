import React, { useState, useEffect } from 'react';
import {
  Truck,
  FileText,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Printer,
  Trash2,
  FileCheck2,
  Building2,
  Navigation,
  FileDown,
  DollarSign,
  Percent,
  SlidersHorizontal
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoTransporteCteMdfe,
  ConhecimentoTransporteCte,
  ManifestoEletronicoMdfe,
  TipoTomadorFrete,
  ModalidadeFrete
} from '../../types/contabil';

export const CteTransporteFreteModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoTransporteCteMdfe | null>(null);
  const [activeTab, setActiveTab] = useState<'ctes' | 'mdfes' | 'creditoIcms' | 'dacteA4'>('ctes');
  const [busca, setBusca] = useState<string>('');
  const [cteSelecionadoId, setCteSelecionadoId] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais
  const [modalNovoCte, setModalNovoCte] = useState<boolean>(false);

  // Formulário Novo CT-e
  const [formNumero, setFormNumero] = useState<string>('');
  const [formSerie, setFormSerie] = useState<string>('1');
  const [formCnpjEmitente, setFormCnpjEmitente] = useState<string>('');
  const [formRazaoEmitente, setFormRazaoEmitente] = useState<string>('');
  const [formUfOrigem, setFormUfOrigem] = useState<string>('SP');
  const [formUfDestino, setFormUfDestino] = useState<string>('SC');
  const [formCfop, setFormCfop] = useState<string>('2.352');
  const [formCst, setFormCst] = useState<string>('00');
  const [formTomador, setFormTomador] = useState<TipoTomadorFrete>('DESTINATARIO');
  const [formModalidade, setFormModalidade] = useState<ModalidadeFrete>('1_FOB_DESTINATARIO');
  const [formValorFrete, setFormValorFrete] = useState<number>(3500.0);
  const [formAliqIcms, setFormAliqIcms] = useState<number>(12.0);
  const [formChaveNfe, setFormChaveNfe] = useState<string>('');
  const [formObs, setFormObs] = useState<string>('');

  const carregarDados = () => {
    const dados = dbService.getTransporteCteMdfe(empresaId, competencia);
    setResumo(dados);
    if (!cteSelecionadoId && dados.ctes.length > 0) {
      setCteSelecionadoId(dados.ctes[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const cteSelecionado = resumo?.ctes.find(c => c.id === cteSelecionadoId) || resumo?.ctes[0];

  const handleSalvarCte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumero || !formRazaoEmitente) {
      exibirNotificacao('erro', 'Número do CT-e e Transportador Emitente são obrigatórios.');
      return;
    }

    const res = dbService.salvarCteTransporte({
      empresaId,
      numeroCte: formNumero,
      serie: formSerie,
      cnpjEmitente: formCnpjEmitente || '00.000.000/0001-99',
      razaoSocialEmitente: formRazaoEmitente,
      ufOrigem: formUfOrigem,
      ufDestino: formUfDestino,
      cfop: formCfop,
      cstIcms: formCst,
      tomador: formTomador,
      modalidade: formModalidade,
      valorFreteBRL: Number(formValorFrete),
      aliquotaIcmsPercent: Number(formAliqIcms),
      competencia,
      chavesNfeTransportadas: formChaveNfe ? [formChaveNfe] : [],
      observacoes: formObs
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovoCte(false);
      setFormNumero('');
      setFormRazaoEmitente('');
      setFormCnpjEmitente('');
      setFormChaveNfe('');
      setFormObs('');
      carregarDados();
      setCteSelecionadoId(res.cte.id);
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleExcluirCte = (id: string) => {
    if (confirm('Deseja realmente excluir este CT-e da escrituração?')) {
      const res = dbService.excluirCteTransporte(id);
      if (res.sucesso) {
        exibirNotificacao('sucesso', res.mensagem);
        carregarDados();
      } else {
        exibirNotificacao('erro', res.mensagem);
      }
    }
  };

  const handleIntegrarCte = (id: string) => {
    const res = dbService.integrarCteContabil(id);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const ctesFiltrados = resumo?.ctes.filter(c =>
    c.numeroCte.toLowerCase().includes(busca.toLowerCase()) ||
    c.razaoSocialEmitente.toLowerCase().includes(busca.toLowerCase()) ||
    c.chaveAcesso.includes(busca) ||
    c.cfop.includes(busca)
  ) || [];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-[#e0e0e0] overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-[#2d2d2d] bg-[#181818] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                CT-e & MDF-e - Transporte Rodoviário de Cargas
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-950/80 text-blue-300 border border-blue-700/50">
                  Ajuste SINIEF 09/2007 • Domínio esifixocte01
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Escrituração de fretes CIF/FOB, apropriação de crédito de ICMS tomador (CFOPs 1.352/2.352) e conciliação MDF-e
              </p>
            </div>
          </div>
        </div>

        {/* Competência & Ações */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333333]">
            <span className="text-xs text-gray-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-blue-400 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={() => setModalNovoCte(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo CT-e
          </button>

          <button
            onClick={carregarDados}
            title="Atualizar dados"
            className="p-2 bg-[#242424] hover:bg-[#303030] border border-[#333333] rounded-lg text-gray-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta de Notificação */}
      {notificacao && (
        <div
          className={`mx-5 mt-4 p-3 rounded-lg text-xs flex items-center justify-between border ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-200'
              : 'bg-red-950/60 border-red-700/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificacao.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{notificacao.texto}</span>
          </div>
          <button
            onClick={() => setNotificacao(null)}
            className="text-gray-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dashboard KPI Cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Total Frete Contratado (R$)</div>
          <div className="text-2xl font-bold text-white mt-1">
            R$ {(resumo?.totalFreteContratadoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-400 mt-2 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>{resumo?.totalCtes || 0} conhecimentos escriturados</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-white pointer-events-none">
            <Truck className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Crédito ICMS Recuperável (R$)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            R$ {(resumo?.totalCreditosIcmsFreteBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apropriado na apuração ICMS</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-emerald-400 pointer-events-none">
            <Percent className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Manifestos MDF-e Emitidos</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            {resumo?.totalMdfesEmitidos || 0} MDF-es
          </div>
          <div className="text-[11px] text-amber-400 mt-2 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5" />
            <span>Controle de rotas e RNTRC</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-amber-400 pointer-events-none">
            <Navigation className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Modalidade Dominante</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            FOB Destinatário
          </div>
          <div className="text-[11px] text-indigo-300 mt-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>CFOPs 1.352 / 2.352 Ativos</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-indigo-400 pointer-events-none">
            <Layers className="w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 border-b border-[#2d2d2d] flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ctes')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'ctes'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            Conhecimentos de Transporte ({resumo?.ctes.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('creditoIcms')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'creditoIcms'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            Apuração de Crédito ICMS s/ Frete
          </button>
          <button
            onClick={() => setActiveTab('mdfes')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'mdfes'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Navigation className="w-4 h-4" />
            Manifestos de Carga MDF-e ({resumo?.mdfes.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('dacteA4')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'dacteA4'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            Espelho DACTE / Relatório A4
          </button>
        </div>

        {/* Busca rápida */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por CT-e, transportadora ou chave..."
            className="bg-[#202020] border border-[#333333] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-5 flex-1">
        {/* ABA 1: CT-es */}
        {activeTab === 'ctes' && (
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-300">
                Escrituração de CT-e de Frete ({ctesFiltrados.length} documentos)
              </div>
              <div className="text-xs text-gray-400">
                Modelo 57 • Validação de Chave de 44 posições
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#222222] text-gray-400 font-medium border-b border-[#2d2d2d]">
                  <tr>
                    <th className="py-2.5 px-3">Nº CT-e / Série</th>
                    <th className="py-2.5 px-3">Emissão</th>
                    <th className="py-2.5 px-3">Transportadora Emitente</th>
                    <th className="py-2.5 px-3">Rota</th>
                    <th className="py-2.5 px-3">CFOP / CST</th>
                    <th className="py-2.5 px-3">Tomador / Mod.</th>
                    <th className="py-2.5 px-3 text-right">Valor Frete (R$)</th>
                    <th className="py-2.5 px-3 text-right">Alíq. ICMS</th>
                    <th className="py-2.5 px-3 text-right">Crédito Apropriado</th>
                    <th className="py-2.5 px-3 text-center">Status Contábil</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {ctesFiltrados.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#202020] transition-colors cursor-pointer ${
                        c.id === cteSelecionadoId ? 'bg-blue-950/20 border-l-2 border-blue-500' : ''
                      }`}
                      onClick={() => setCteSelecionadoId(c.id)}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-medium text-blue-400">{c.numeroCte}</div>
                        <div className="text-[10px] text-gray-500">Série {c.serie}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">{c.dataEmissao}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{c.razaoSocialEmitente}</div>
                        <div className="text-[10px] text-gray-500 font-mono">CNPJ: {c.cnpjEmitente}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-gray-300">{c.ufOrigem} ➔ {c.ufDestino}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-amber-400 font-semibold">{c.cfop}</span>
                        <span className="text-[10px] text-gray-500 ml-1">/ {c.cstIcms}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2a2a2a] text-gray-300 border border-[#3a3a3a]">
                          {c.tomador}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                        R$ {c.valorFreteBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-400">
                        {c.aliquotaIcmsPercent.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {c.creditoApropriadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {c.integradoContabil ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            Integrado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!c.integradoContabil && (
                            <button
                              onClick={() => handleIntegrarCte(c.id)}
                              title="Integrar ao Diário Geral"
                              className="p-1 text-gray-400 hover:text-emerald-400 bg-[#252525] hover:bg-[#303030] rounded border border-[#383838] cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setCteSelecionadoId(c.id);
                              setActiveTab('dacteA4');
                            }}
                            title="Visualizar DACTE"
                            className="p-1 text-gray-400 hover:text-blue-400 bg-[#252525] hover:bg-[#303030] rounded border border-[#383838] cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirCte(c.id)}
                            title="Excluir CT-e"
                            className="p-1 text-gray-400 hover:text-red-400 bg-[#252525] hover:bg-[#303030] rounded border border-[#383838] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* ABA 2: CRÉDITO ICMS */}
        {activeTab === 'creditoIcms' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  Regras Legais de Apropriação de Crédito de ICMS sobre Fretes
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#202020] rounded-lg border border-[#303030]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-emerald-400">CFOP 1.352 / 2.352 (Aquisição para Comercialização/Industrialização)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                        CRÉDITO 100% PERMITIDO
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px]">
                      Quando o tomador do serviço é o destinatário (frete modalidade FOB) e as mercadorias transportadas são tributadas na saída ou sujeitas à manutenção de crédito, o valor do ICMS destacado no CT-e constitui crédito legítimo (Art. 20 LC 87/1996 - Lei Kandir).
                    </p>
                  </div>

                  <div className="p-3 bg-[#202020] rounded-lg border border-[#303030]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-amber-400">CFOP 1.353 / 2.353 (Transporte de Ativo Imobilizado / Uso e Consumo)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        CRÉDITO RESTRITO / CIAP
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px]">
                      Frete sobre bens do ativo imobilizado agrega ao custo do imobilizado e seu ICMS é apropriado em 1/48 avos via CIAP (Bloco G do SPED). Frete sobre material de uso e consumo não confere direito a crédito.
                    </p>
                  </div>

                  <div className="p-3 bg-[#202020] rounded-lg border border-[#303030]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-blue-400">Frete CIF (Contratado pelo Remetente)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/60 text-blue-300 border border-blue-700/40">
                        SEM CRÉDITO PARA O DESTINATÁRIO
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px]">
                      Na modalidade CIF, o tomador legal é o remetente vendedor, que computa o frete no total da NF-e. O destinatário não pode tomar crédito duplicado do CT-e correspondente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Relação de CT-es com crédito apropriado */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#2d2d2d]">
                <div className="text-xs font-semibold text-gray-300 mb-3">
                  Resumo de Créditos de ICMS Frete na Competência {competencia}
                </div>
                <div className="space-y-2">
                  {resumo?.ctes.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-2.5 bg-[#202020] rounded border border-[#2f2f2f] text-xs">
                      <div>
                        <span className="font-mono font-medium text-white">CT-e {c.numeroCte}</span>
                        <span className="text-gray-400 ml-2">({c.razaoSocialEmitente})</span>
                        <span className="text-[10px] text-gray-500 block font-mono">CFOP {c.cfop} • Modalidade {c.modalidade}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Crédito Apropriado:</span>
                        <span className={`font-mono font-bold ${c.creditoApropriadoBRL > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                          R$ {c.creditoApropriadoBRL.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Totalizador de Crédito */}
            <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  Totalizador de Créditos de ICMS
                </h3>
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl mb-4">
                  <span className="text-xs text-gray-400 block">Total de Créditos na Competência:</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    R$ {(resumo?.totalCreditosIcmsFreteBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="text-xs text-gray-400 space-y-2">
                  <p>• Este montante é exportado para o <strong>Bloco C (Registro C100 / C190)</strong> da EFD ICMS/IPI.</p>
                  <p>• O crédito é lançado automaticamente a crédito da apuração do ICMS Próprio.</p>
                </div>
              </div>

              <div className="p-3 bg-[#202020] rounded-lg border border-[#333333] text-[11px] text-gray-300">
                <span className="font-semibold text-white block mb-1">Impacto no Custo do Estoque:</span>
                O valor do frete sem ICMS recuperável agrega ao custo de aquisição do produto (CPC 16 item 11).
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: MDF-e */}
        {activeTab === 'mdfes' && (
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-300">
                Manifestos Eletrônicos de Documentos Fiscais - MDF-e ({resumo?.mdfes.length || 0})
              </div>
              <div className="text-xs text-gray-400">
                Modelo 58 • Encerramento e Acompanhamento de Carga
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#222222] text-gray-400 font-medium border-b border-[#2d2d2d]">
                  <tr>
                    <th className="py-2.5 px-3">Nº MDF-e / Série</th>
                    <th className="py-2.5 px-3">Emissão</th>
                    <th className="py-2.5 px-3">Percurso</th>
                    <th className="py-2.5 px-3">Placa / Veículo</th>
                    <th className="py-2.5 px-3">RNTRC</th>
                    <th className="py-2.5 px-3 text-right">Qtd CT-es</th>
                    <th className="py-2.5 px-3 text-right">Peso Bruto (KG)</th>
                    <th className="py-2.5 px-3 text-right">Valor Carga (R$)</th>
                    <th className="py-2.5 px-3 text-center">Status Sefaz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {resumo?.mdfes.map(m => (
                    <tr key={m.id} className="hover:bg-[#202020] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-400">{m.numeroMdfe} (S.{m.serie})</td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">{m.dataEmissao}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-300">{m.ufInicio} ➔ {m.ufFim}</td>
                      <td className="py-2.5 px-3 font-mono text-white">{m.placaVeiculo}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">{m.rntrc}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">{m.quantidadeCtes}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">{m.pesoBrutoTotalKg.toLocaleString('pt-BR')} kg</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {m.valorTotalCargaBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: ESPELHO DACTE A4 */}
        {activeTab === 'dacteA4' && cteSelecionado && (
          <div className="flex justify-center">
            <div className="w-[210mm] bg-[#1a1a1a] text-gray-200 border border-[#333333] p-10 shadow-2xl rounded-sm text-xs">
              {/* Topo DACTE */}
              <div className="border-2 border-gray-600 p-3 mb-4 rounded flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-white uppercase tracking-wider">
                    DACTE - DOCUMENTO AUXILIAR DO CONHECIMENTO DE TRANSPORTE ELETRÔNICO
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Modelo 57 • Conhecimento de Transporte Eletrônico para Outros Serviços
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-blue-400">Nº {cteSelecionado.numeroCte}</div>
                  <div className="text-[10px] text-gray-400">SÉRIE {cteSelecionado.serie}</div>
                </div>
              </div>

              {/* Chave de Acesso */}
              <div className="border border-gray-700 p-2.5 bg-[#202020] mb-4 rounded text-center">
                <span className="text-[10px] text-gray-400 block font-semibold">CHAVE DE ACESSO:</span>
                <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                  {cteSelecionado.chaveAcesso}
                </span>
              </div>

              {/* Dados do Emitente e Tomador */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border border-gray-700 p-3 rounded bg-[#202020]">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">EMITENTE (TRANSPORTADOR):</span>
                  <div className="text-xs font-bold text-white">{cteSelecionado.razaoSocialEmitente}</div>
                  <div className="text-[11px] text-gray-300 font-mono">CNPJ: {cteSelecionado.cnpjEmitente}</div>
                  <div className="text-[11px] text-gray-400">UF Início da Prestação: {cteSelecionado.ufOrigem}</div>
                </div>

                <div className="border border-gray-700 p-3 rounded bg-[#202020]">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">TOMADOR DO SERVIÇO:</span>
                  <div className="text-xs font-bold text-white">EMPRESA MODELO S/A ({cteSelecionado.tomador})</div>
                  <div className="text-[11px] text-gray-300 font-mono">CNPJ: 00.000.000/0001-91</div>
                  <div className="text-[11px] text-gray-400">UF Fim da Prestação: {cteSelecionado.ufDestino}</div>
                </div>
              </div>

              {/* Dados da Prestação e Tributos */}
              <div className="border border-gray-700 rounded overflow-hidden mb-6">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#242424] text-gray-300 font-semibold border-b border-gray-700">
                    <tr>
                      <th className="py-1.5 px-2">CFOP</th>
                      <th className="py-1.5 px-2">CST ICMS</th>
                      <th className="py-1.5 px-2">Modalidade</th>
                      <th className="py-1.5 px-2 text-right">Valor Total Frete</th>
                      <th className="py-1.5 px-2 text-right">Base ICMS</th>
                      <th className="py-1.5 px-2 text-right">Alíq. ICMS</th>
                      <th className="py-1.5 px-2 text-right">Valor ICMS</th>
                      <th className="py-1.5 px-2 text-right">Crédito Apropriado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-2 font-mono text-amber-400 font-semibold">{cteSelecionado.cfop}</td>
                      <td className="py-2 px-2 font-mono text-gray-300">{cteSelecionado.cstIcms}</td>
                      <td className="py-2 px-2 text-gray-300">{cteSelecionado.modalidade}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-white">
                        R$ {cteSelecionado.valorFreteBRL.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-gray-300">
                        R$ {cteSelecionado.baseCalculoIcmsBRL.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-gray-300">
                        {cteSelecionado.aliquotaIcmsPercent.toFixed(1)}%
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-gray-300">
                        R$ {cteSelecionado.valorIcmsBRL.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400">
                        R$ {cteSelecionado.creditoApropriadoBRL.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* NF-es Vinculadas */}
              {cteSelecionado.chavesNfeTransportadas && cteSelecionado.chavesNfeTransportadas.length > 0 && (
                <div className="border border-gray-700 p-3 rounded bg-[#202020] mb-6">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">NF-es TRANSPORTADAS VINCULADAS:</span>
                  <div className="space-y-1">
                    {cteSelecionado.chavesNfeTransportadas.map((ch, idx) => (
                      <div key={idx} className="font-mono text-[10px] text-gray-300 bg-[#191919] p-1 rounded">
                        {ch}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações Complementares */}
              <div className="border border-gray-700 p-3 rounded bg-[#202020] text-[10px] text-gray-400 mb-8">
                <span className="font-bold text-gray-300 block mb-1">OBSERVAÇÕES FISCAIS / CONTÁBEIS:</span>
                {cteSelecionado.observacoes || 'Prestação de serviço de transporte rodoviário de cargas com apropriação de crédito tributário na forma da legislação vigente.'}
              </div>

              {/* Canhoto de Recebimento */}
              <div className="border-t-2 border-dashed border-gray-600 pt-4 flex justify-between items-center text-[10px] text-gray-400">
                <div>RECEBEMOS OS SERVIÇOS CONSTANTES DESTE CT-E</div>
                <div className="w-48 border-b border-gray-500 text-center pb-1 text-white">DATA / ASSINATURA</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO CT-e */}
      {modalNovoCte && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1c] border border-[#333333] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              Escriturar Novo Conhecimento de Transporte (CT-e)
            </h3>

            <form onSubmit={handleSalvarCte} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Número CT-e:</label>
                  <input
                    type="text"
                    value={formNumero}
                    onChange={(e) => setFormNumero(e.target.value)}
                    placeholder="001.294.001"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Série:</label>
                  <input
                    type="text"
                    value={formSerie}
                    onChange={(e) => setFormSerie(e.target.value)}
                    placeholder="1"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">CNPJ Transportadora:</label>
                  <input
                    type="text"
                    value={formCnpjEmitente}
                    onChange={(e) => setFormCnpjEmitente(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Razão Social Transportadora:</label>
                  <input
                    type="text"
                    value={formRazaoEmitente}
                    onChange={(e) => setFormRazaoEmitente(e.target.value)}
                    placeholder="Ex: RodoLog Transportes Rodoviários Ltda"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">UF Origem ➔ UF Destino:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formUfOrigem}
                      onChange={(e) => setFormUfOrigem(e.target.value)}
                      placeholder="SP"
                      maxLength={2}
                      className="w-1/2 bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-blue-500 uppercase"
                    />
                    <input
                      type="text"
                      value={formUfDestino}
                      onChange={(e) => setFormUfDestino(e.target.value)}
                      placeholder="SC"
                      maxLength={2}
                      className="w-1/2 bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">CFOP de Entrada:</label>
                  <select
                    value={formCfop}
                    onChange={(e) => setFormCfop(e.target.value)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value="1.352">1.352 - Transporte Ind./Com. Interna (Gera Crédito)</option>
                    <option value="2.352">2.352 - Transporte Ind./Com. Interestadual (Gera Crédito)</option>
                    <option value="1.353">1.353 - Transporte Ativo/Consumo Interna</option>
                    <option value="2.353">2.353 - Transporte Ativo/Consumo Interestadual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tomador do Frete:</label>
                  <select
                    value={formTomador}
                    onChange={(e) => setFormTomador(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="DESTINATARIO">Destinatário</option>
                    <option value="REMETENTE">Remetente</option>
                    <option value="EXPEDIDOR">Expedidor</option>
                    <option value="RECEBEDOR">Recebedor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Modalidade:</label>
                  <select
                    value={formModalidade}
                    onChange={(e) => setFormModalidade(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="1_FOB_DESTINATARIO">1 - FOB (Destinatário)</option>
                    <option value="0_CIF_REMETENTE">0 - CIF (Remetente)</option>
                    <option value="2_TERCEIROS">2 - Terceiros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor do Frete (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorFrete}
                    onChange={(e) => setFormValorFrete(Number(e.target.value))}
                    min="0"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Alíquota ICMS (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAliqIcms}
                    onChange={(e) => setFormAliqIcms(Number(e.target.value))}
                    min="0"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Chave NF-e Transportada (Opcional):</label>
                <input
                  type="text"
                  value={formChaveNfe}
                  onChange={(e) => setFormChaveNfe(e.target.value)}
                  placeholder="352603..."
                  maxLength={44}
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setModalNovoCte(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Salvar CT-e
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
