import React, { useState, useEffect } from 'react';
import {
  Landmark,
  FileText,
  DollarSign,
  TrendingDown,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Send,
  Database,
  Search,
  ExternalLink,
  Percent,
  X,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { ApuracaoPisCofinsFinanceiro, ResumoPisCofinsFinanceiro, DeducaoIntermediacaoFinanceira } from '../../types/contabil';

export const PisCofinsInstituicoesFinanceirasModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoPisCofinsFinanceiro | null>(null);
  const [selectedApuracao, setSelectedApuracao] = useState<ApuracaoPisCofinsFinanceiro | null>(null);
  const [activeTab, setActiveTab] = useState<'apuracoes' | 'deducoes' | 'bloco_i' | 'contabil'>('apuracoes');
  const [filtroCompetencia, setFiltroCompetencia] = useState('');
  const [modalImprimir, setModalImprimir] = useState(false);
  const [modalNovaDeducao, setModalNovaDeducao] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [conteudoSpedBlocoI, setConteudoSpedBlocoI] = useState<string | null>(null);

  // Form nova dedução
  const [novaDeducaoTipo, setNovoDeducaoTipo] = useState('DED_CAPTACAO_RECURSOS');
  const [novaDeducaoDesc, setNovoDeducaoDesc] = useState('');
  const [novaDeducaoValor, setNovoDeducaoValor] = useState('');
  const [novaDeducaoArtigo, setNovoDeducaoArtigo] = useState('Art. 3º § 6º I Lei 9.718/1998');

  const carregarDados = () => {
    try {
      const data = dbService.getApuracaoPisCofinsFinanceiro();
      setResumo(data);
      if (data.apuracoes.length > 0) {
        if (!selectedApuracao || !data.apuracoes.some(a => a.id === selectedApuracao.id)) {
          setSelectedApuracao(data.apuracoes[0]);
        } else {
          const atual = data.apuracoes.find(a => a.id === selectedApuracao.id);
          if (atual) setSelectedApuracao(atual);
        }
      }
    } catch (e: any) {
      setMensagemErro('Erro ao carregar dados de PIS/COFINS Financeiro: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleGerarBlocoI = (id: string) => {
    const res = dbService.gerarBlocoIEfdContribuicoes(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setConteudoSpedBlocoI(res.conteudoSped);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleIntegrarContabilidade = (id: string) => {
    const res = dbService.integrarPisCofinsFinanceiroContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleAdicionarDeducao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApuracao) return;

    const vlr = parseFloat(novaDeducaoValor);
    if (isNaN(vlr) || vlr <= 0) {
      setMensagemErro('Informe um valor de dedução válido.');
      return;
    }

    const novaDeducao: DeducaoIntermediacaoFinanceira = {
      id: `ded-${Date.now()}`,
      codigoTipoDeducao: novaDeducaoTipo,
      descricaoDeducao: novaDeducaoDesc || 'Despesas de captação no mercado financeiro',
      incideSobre: 'PIS_E_COFINS',
      valorDeducaoBRL: vlr,
      dispositivoLegal: novaDeducaoArtigo
    };

    const novasDeducoes = [...selectedApuracao.deducoes, novaDeducao];
    const totalDeducoes = novasDeducoes.reduce((acc, d) => acc + d.valorDeducaoBRL, 0);
    const novaBase = Math.max(0, selectedApuracao.receitaBrutaTotalFinanceiraBRL - totalDeducoes);
    const novoPis = (novaBase * selectedApuracao.aliquotaPisPercentual) / 100;
    const novoCofins = (novaBase * selectedApuracao.aliquotaCofinsPercentual) / 100;

    const apuracaoAtualizada: ApuracaoPisCofinsFinanceiro = {
      ...selectedApuracao,
      deducoes: novasDeducoes,
      totalDeducoesAutorizadasBRL: totalDeducoes,
      baseCalculoPisBRL: novaBase,
      baseCalculoCofinsBRL: novaBase,
      valorPisApuradoBRL: novoPis,
      valorCofinsApuradoBRL: novoCofins,
      totalPisCofinsDevidoBRL: novoPis + novoCofins
    };

    dbService.salvarApuracaoPisCofinsFinanceiro(apuracaoAtualizada);
    setSelectedApuracao(apuracaoAtualizada);
    setModalNovaDeducao(false);
    setNovoDeducaoDesc('');
    setNovoDeducaoValor('');
    setMensagemSucesso('Dedução de intermediação financeira gravada com sucesso.');
    carregarDados();
  };

  const apuracaoAtual = selectedApuracao || (resumo && resumo.apuracoes[0]) || null;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                PIS/COFINS - Entidades Financeiras & Equiparadas
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-900/40 text-amber-300 border border-amber-800">
                Lei nº 9.718/1998 Art. 3º § 6º
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                Bloco I EFD-Contribuições
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                PIS 0,65% / COFINS 4,00%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Cooperativas de Crédito, Bancos, Financeiras, Seguradoras, DTVM - Deduções Legais de Captação e DARF 8109 / 2172
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => carregarDados()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
          {apuracaoAtual && (
            <>
              <button
                onClick={() => handleGerarBlocoI(apuracaoAtual.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gerar Bloco I EFD</span>
              </button>
              <button
                onClick={() => handleIntegrarContabilidade(apuracaoAtual.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded transition shadow-sm ${
                  apuracaoAtual.integradoContabil
                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{apuracaoAtual.integradoContabil ? 'Contabilizado' : 'Integrar Diário'}</span>
              </button>
              <button
                onClick={() => setModalImprimir(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Demonstrativo A4 Timbrado</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center justify-between text-emerald-200 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center justify-between text-rose-200 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4">
        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Receita Bruta Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {(apuracaoAtual?.receitaBrutaTotalFinanceiraBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Intermediação + Tarifas + Variações</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Deduções de Captação</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 tracking-tight">
            R$ {(apuracaoAtual?.totalDeducoesAutorizadasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Juros de CDB/RDB + Repasses (Art. 3º § 6º)</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Base de Cálculo Efetiva</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            R$ {(apuracaoAtual?.baseCalculoPisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-400/80 mt-1">Base tributável líquida</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>PIS (0,65%) - DARF 8109</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300 tracking-tight">
            R$ {(apuracaoAtual?.valorPisApuradoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1">Domínio imposto 104-PIS-EF</div>
        </div>

        <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>COFINS (4,00%) - DARF 2172</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">
            R$ {(apuracaoAtual?.valorCofinsApuradoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Domínio imposto 105-COFINS-EF</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 px-6 border-b border-gray-800 bg-[#161616]">
        <button
          onClick={() => setActiveTab('apuracoes')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'apuracoes'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Apurações Mensais ({resumo?.apuracoes.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('deducoes')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'deducoes'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Deduções Legais de Captação ({apuracaoAtual?.deducoes.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('bloco_i')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'bloco_i'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bloco I - EFD-Contribuições (Sped)</span>
        </button>
        <button
          onClick={() => setActiveTab('contabil')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'contabil'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Partidas Dobradas & Diário Contábil</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto p-6">
        {/* Tab 1: Apurações Mensais */}
        {activeTab === 'apuracoes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por competência..."
                  value={filtroCompetencia}
                  onChange={e => setFiltroCompetencia(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Competência</th>
                    <th className="py-3 px-4">Entidade / CNPJ</th>
                    <th className="py-3 px-4 text-right">Receita Financeira</th>
                    <th className="py-3 px-4 text-right">Deduções Captação</th>
                    <th className="py-3 px-4 text-right">Base Efetiva</th>
                    <th className="py-3 px-4 text-right">PIS (0,65%)</th>
                    <th className="py-3 px-4 text-right">COFINS (4,00%)</th>
                    <th className="py-3 px-4 text-right">Total Devido</th>
                    <th className="py-3 px-4 text-center">Status EFD</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {resumo?.apuracoes
                    .filter(a => a.competencia.includes(filtroCompetencia))
                    .map(a => {
                      const isSelected = selectedApuracao?.id === a.id;
                      return (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedApuracao(a)}
                          className={`hover:bg-gray-800/50 cursor-pointer transition ${isSelected ? 'bg-amber-900/20' : ''}`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {a.competencia}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-200">{a.razaoSocial}</div>
                            <div className="text-[11px] text-gray-500 font-mono">{a.tipoEntidade.replace(/_/g, ' ')} | CNPJ: {a.cnpj}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400">
                            R$ {a.receitaBrutaTotalFinanceiraBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-rose-400">
                            -R$ {a.totalDeducoesAutorizadasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            R$ {a.baseCalculoPisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-cyan-400">
                            R$ {a.valorPisApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-400">
                            R$ {a.valorCofinsApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-purple-300">
                            R$ {a.totalPisCofinsDevidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800 flex items-center justify-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-blue-400" />
                              <span>{a.statusApuracao.replace(/_/g, ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApuracao(a);
                                setModalImprimir(true);
                              }}
                              className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white rounded"
                              title="Demonstrativo A4"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Deduções de Captação */}
        {activeTab === 'deducoes' && apuracaoAtual && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Deduções Autorizadas da Intermediação Financeira - Competência {apuracaoAtual.competencia}</span>
                  <span className="text-xs font-mono text-amber-400">(Lei nº 9.718/1998 Art. 3º § 6º)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Exclusões específicas da base de cálculo para instituições financeiras e equiparadas
                </p>
              </div>
              <button
                onClick={() => setModalNovaDeducao(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Dedução</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#181818]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#202020] text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Código / Tipo</th>
                    <th className="py-3 px-4">Descrição da Dedução</th>
                    <th className="py-3 px-4">Base Legal</th>
                    <th className="py-3 px-4 text-center">Incidência</th>
                    <th className="py-3 px-4 text-right">Valor Deduzido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono">
                  {apuracaoAtual.deducoes.map(d => (
                    <tr key={d.id} className="hover:bg-gray-800/40">
                      <td className="py-3 px-4 text-amber-400 font-bold">{d.codigoTipoDeducao}</td>
                      <td className="py-3 px-4 font-sans text-white">{d.descricaoDeducao}</td>
                      <td className="py-3 px-4 font-sans text-gray-400">{d.dispositivoLegal}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                          {d.incideSobre.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-rose-400 font-bold">
                        -R$ {d.valorDeducaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#1f1f1f] font-mono font-bold text-white border-t border-gray-700">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right font-sans">TOTAL DAS DEDUÇÕES DE CAPTAÇÃO AUTORIZADAS:</td>
                    <td className="py-3 px-4 text-right text-rose-400">
                      -R$ {apuracaoAtual.totalDeducoesAutorizadasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Bloco I Sped */}
        {activeTab === 'bloco_i' && apuracaoAtual && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Arquivo Magnético - Bloco I da EFD-Contribuições</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Registros I010 (Identificação), I100 (Consolidação das Operações), I200 (Deduções Legais) e I300 (Detalhamento)
                </p>
              </div>
              <button
                onClick={() => handleGerarBlocoI(apuracaoAtual.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Exportar Sped Bloco I</span>
              </button>
            </div>

            <div className="p-4 bg-[#0d0d0d] rounded-xl border border-gray-800 font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed">
              <pre>{conteudoSpedBlocoI || `|I001|0|
|I010|${apuracaoAtual.cnpj.replace(/\D/g, '')}|${apuracaoAtual.tipoEntidade}|
|I100|01|${apuracaoAtual.receitasIntermediacaoFinanceiraBRL.toFixed(2)}|${apuracaoAtual.totalDeducoesAutorizadasBRL.toFixed(2)}|${apuracaoAtual.baseCalculoPisBRL.toFixed(2)}|${apuracaoAtual.aliquotaPisPercentual.toFixed(2)}|${apuracaoAtual.valorPisApuradoBRL.toFixed(2)}|${apuracaoAtual.aliquotaCofinsPercentual.toFixed(2)}|${apuracaoAtual.valorCofinsApuradoBRL.toFixed(2)}|
${apuracaoAtual.deducoes.map(d => `|I200|${d.codigoTipoDeducao}|${d.valorDeducaoBRL.toFixed(2)}|${d.descricaoDeducao}|${d.dispositivoLegal}|`).join('\n')}
|I300|01|${apuracaoAtual.receitasPrestacaoServicosTarifasBRL.toFixed(2)}|SERVICOS_TARIFAS_BANCARIAS|
|I990|${apuracaoAtual.deducoes.length + 5}|`}</pre>
            </div>
          </div>
        )}

        {/* Tab 4: Partidas Dobradas */}
        {activeTab === 'contabil' && apuracaoAtual && (
          <div className="space-y-6">
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Integração Contábil Automática no Diário Geral</span>
                  <span className="text-xs font-mono text-emerald-400">(Partidas Dobradas NBC TG / ITG 2000)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Apropriação tempestiva das despesas tributárias com PIS (0,65%) e COFINS (4,00%) de Instituições Financeiras
                </p>
              </div>
              <button
                onClick={() => handleIntegrarContabilidade(apuracaoAtual.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded transition shadow-sm ${
                  apuracaoAtual.integradoContabil
                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{apuracaoAtual.integradoContabil ? 'Lançamentos Efetuados no Diário' : 'Integrar Diário Geral'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lançamento PIS */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-bold text-cyan-400 font-sans">1. Provisão de PIS Faturamento Financeiro (DARF 8109)</span>
                  <span className="text-gray-400 text-[10px]">Alíquota 0,65%</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-gray-300">
                    <span className="text-emerald-400 font-bold">D - </span> 3.1.2.01.001 - Despesa Tributária PIS sobre Receitas de Intermediação
                  </div>
                  <div className="text-gray-300">
                    <span className="text-rose-400 font-bold">C - </span> 2.1.2.01.002 - PIS a Recolher (Passivo Circulante - DARF 8109)
                  </div>
                  <div className="text-white font-bold pt-2 border-t border-gray-800 flex justify-between">
                    <span>Valor do Lançamento:</span>
                    <span>R$ {apuracaoAtual.valorPisApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-[11px] font-sans text-gray-500 pt-1">
                    Histórico: Apropriação PIS Entidade Financeira 0,65% referente a {apuracaoAtual.competencia} (Lei 9.718/98 Art. 3º)
                  </div>
                </div>
              </div>

              {/* Lançamento COFINS */}
              <div className="p-5 bg-[#181818] rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-bold text-amber-400 font-sans">2. Provisão de COFINS Faturamento Financeiro (DARF 2172)</span>
                  <span className="text-gray-400 text-[10px]">Alíquota 4,00%</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-gray-300">
                    <span className="text-emerald-400 font-bold">D - </span> 3.1.2.01.002 - Despesa Tributária COFINS sobre Receitas de Intermediação
                  </div>
                  <div className="text-gray-300">
                    <span className="text-rose-400 font-bold">C - </span> 2.1.2.01.003 - COFINS a Recolher (Passivo Circulante - DARF 2172)
                  </div>
                  <div className="text-white font-bold pt-2 border-t border-gray-800 flex justify-between">
                    <span>Valor do Lançamento:</span>
                    <span>R$ {apuracaoAtual.valorCofinsApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-[11px] font-sans text-gray-500 pt-1">
                    Histórico: Apropriação COFINS Entidade Financeira 4,00% referente a {apuracaoAtual.competencia} (Lei 9.718/98 Art. 3º)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Demonstrativo A4 Timbrado */}
      {modalImprimir && apuracaoAtual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-gray-900 w-full max-w-4xl h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col font-sans p-8 print:p-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-300 print:hidden">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Visualização de Impressão A4 - Demonstrativo PIS/COFINS Entidades Financeiras
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setModalImprimir(false)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Timbrado Document Content */}
            <div className="border border-gray-400 p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Header Timbrado */}
                <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
                  <div>
                    <h2 className="text-lg font-black tracking-tight uppercase text-gray-900">
                      {apuracaoAtual.razaoSocial}
                    </h2>
                    <div className="text-xs text-gray-600">
                      CNPJ: {apuracaoAtual.cnpj} | Enquadramento: {apuracaoAtual.tipoEntidade.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Instituição Financeira / Equiparada - Regime Especial Lei nº 9.718/1998 e Resolução Bacen
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-2.5 py-1 bg-gray-900 text-white font-mono text-xs font-bold uppercase rounded">
                      EFD-CONTRIBUIÇÕES
                    </div>
                    <div className="text-xs font-mono font-bold text-gray-800 mt-1">
                      Competência {apuracaoAtual.competencia}
                    </div>
                  </div>
                </div>

                <div className="text-center my-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    MEMÓRIA DE CÁLCULO E APURAÇÃO DE PIS E COFINS - BLOCO I
                  </h3>
                  <p className="text-xs text-gray-600">
                    Apuração pelo Regime Cumulativo Diferenciado conforme Art. 3º § 6º da Lei nº 9.718/1998 e IN RFB nº 2.121/2022
                  </p>
                </div>

                {/* 1. Receitas Financeiras */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1">
                    1. Composição das Receitas Operacionais Brutas
                  </h4>
                  <table className="w-full text-xs font-mono border border-gray-300">
                    <tbody className="divide-y divide-gray-300">
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">Receitas de Intermediação Financeira (Juros, Títulos e Empréstimos):</td>
                        <td className="py-1.5 px-3 text-right font-bold">R$ {apuracaoAtual.receitasIntermediacaoFinanceiraBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">Receitas de Prestação de Serviços Bancários e Tarifas:</td>
                        <td className="py-1.5 px-3 text-right font-bold">R$ {apuracaoAtual.receitasPrestacaoServicosTarifasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">Receitas de Variações Monetárias e Cambiais Ativas:</td>
                        <td className="py-1.5 px-3 text-right font-bold">R$ {apuracaoAtual.receitasVariacoesMonetariasAtivasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="bg-gray-100 font-bold border-t border-gray-400">
                        <td className="py-1.5 px-3 font-sans">RECEITA OPERACIONAL BRUTA TOTAL:</td>
                        <td className="py-1.5 px-3 text-right">R$ {apuracaoAtual.receitaBrutaTotalFinanceiraBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Deduções Legais de Captação */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1">
                    2. Deduções da Intermediação Financeira (Art. 3º § 6º Lei 9.718/1998)
                  </h4>
                  <table className="w-full text-xs font-mono border border-gray-300">
                    <thead className="bg-gray-100 font-sans text-gray-700">
                      <tr>
                        <th className="py-1.5 px-2 text-left">Código</th>
                        <th className="py-1.5 px-2 text-left">Descrição da Dedução de Captação</th>
                        <th className="py-1.5 px-2 text-left">Dispositivo Legal</th>
                        <th className="py-1.5 px-2 text-right">Valor Deduzido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {apuracaoAtual.deducoes.map(d => (
                        <tr key={d.id}>
                          <td className="py-1 px-2">{d.codigoTipoDeducao}</td>
                          <td className="py-1 px-2 font-sans">{d.descricaoDeducao}</td>
                          <td className="py-1 px-2 font-sans text-gray-600">{d.dispositivoLegal}</td>
                          <td className="py-1 px-2 text-right text-rose-700 font-bold">
                            -R$ {d.valorDeducaoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t border-gray-400">
                      <tr>
                        <td colSpan={3} className="py-1.5 px-2 font-sans">TOTAL DAS DEDUÇÕES DE CAPTAÇÃO AUTORIZADAS:</td>
                        <td className="py-1.5 px-2 text-right text-rose-700">
                          -R$ {apuracaoAtual.totalDeducoesAutorizadasBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* 3. Tributos Devidos */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-800 border-b border-gray-300 pb-1">
                    3. Apuração Final e Guias de Recolhimento DARF
                  </h4>
                  <table className="w-full text-xs font-mono border border-gray-300">
                    <tbody className="divide-y divide-gray-300">
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">Base de Cálculo Efetiva (Receita Bruta - Deduções):</td>
                        <td className="py-1.5 px-3 text-right font-bold">R$ {apuracaoAtual.baseCalculoPisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">PIS a Recolher (Alíquota 0,65% - DARF 8109):</td>
                        <td className="py-1.5 px-3 text-right font-bold text-cyan-800">R$ {apuracaoAtual.valorPisApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans bg-gray-50">COFINS a Recolher (Alíquota 4,00% - DARF 2172):</td>
                        <td className="py-1.5 px-3 text-right font-bold text-amber-800">R$ {apuracaoAtual.valorCofinsApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="bg-gray-100 font-bold border-t border-gray-400">
                        <td className="py-1.5 px-3 font-sans">TOTAL DOS TRIBUTOS A RECOLHER:</td>
                        <td className="py-1.5 px-3 text-right text-purple-900">R$ {apuracaoAtual.totalPisCofinsDevidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assinaturas */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-300 text-center text-xs">
                <div>
                  <div className="border-b border-gray-600 mb-1 w-64 mx-auto"></div>
                  <div className="font-bold text-gray-900">Eduardo Mendonça Guimarães</div>
                  <div className="text-gray-600">Diretor Financeiro / Tesouraria</div>
                  <div className="text-gray-500 text-[10px]">Instituição Financeira Autorizada Bacen</div>
                </div>
                <div>
                  <div className="border-b border-gray-600 mb-1 w-64 mx-auto"></div>
                  <div className="font-bold text-gray-900">Marcus Vinicius Carvalho</div>
                  <div className="text-gray-600">Contador Responsável - CRC 1SP298450/O-2</div>
                  <div className="text-gray-500 text-[10px]">Auditor Independente e Perito Contábil</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Dedução */}
      {modalNovaDeducao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 text-gray-100 w-full max-w-md rounded-xl shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Nova Dedução de Captação (Lei 9.718/98)</span>
              </h3>
              <button onClick={() => setModalNovaDeducao(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdicionarDeducao} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Tipo de Dedução</label>
                <select
                  value={novaDeducaoTipo}
                  onChange={e => setNovoDeducaoTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="DED_CAPTACAO_RECURSOS">Despesas de captação de recursos no mercado (CDB/RDB/Poupança)</option>
                  <option value="DED_INTERMEDIACAO_REPASSES">Despesas com operações de repasse de empréstimos</option>
                  <option value="DED_VARIACAO_CAMBIAL_PASSIVA">Variações monetárias e cambiais passivas</option>
                  <option value="DED_SINISTROS_RETIDOS">Sinistros retidos e despesas com provisões (Seguradoras)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Juros pagos a clientes em certificados de depósito bancário"
                  value={novaDeducaoDesc}
                  onChange={e => setNovoDeducaoDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Dispositivo Legal</label>
                <input
                  type="text"
                  value={novaDeducaoArtigo}
                  onChange={e => setNovoDeducaoArtigo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Valor da Dedução (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={novaDeducaoValor}
                  onChange={e => setNovoDeducaoValor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovaDeducao(false)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded shadow-sm"
                >
                  Salvar Dedução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
