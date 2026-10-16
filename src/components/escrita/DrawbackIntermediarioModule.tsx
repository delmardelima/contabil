import React, { useState, useEffect } from 'react';
import {
  Anchor,
  Globe2,
  DollarSign,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Percent,
  X,
  CreditCard,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Package,
  Search,
  Scale,
  Landmark,
  Barcode,
  Truck,
  Ship,
  ExternalLink
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ItemDrawbackIntermediario,
  ResumoDrawbackIntermediario,
  ModalidadeDrawbackIntermediario
} from '../../types/contabil';

export const DrawbackIntermediarioModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoDrawbackIntermediario | null>(null);
  const [selectedAto, setSelectedAto] = useState<ItemDrawbackIntermediario | null>(null);
  const [activeTab, setActiveTab] = useState<'atos_intermediarios' | 'comprovacao_due' | 'tributos_suspensos' | 'laudo_a4'>('atos_intermediarios');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modais
  const [modalNovoAto, setModalNovoAto] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State
  const [formNumeroAto, setFormNumeroAto] = useState('');
  const [formDataEmissao, setFormDataEmissao] = useState('2026-03-01');
  const [formDataValidade, setFormDataValidade] = useState('2027-02-28');
  const [formModalidade, setFormModalidade] = useState<ModalidadeDrawbackIntermediario>('SUSPENSAO');
  const [formExportadorFinal, setFormExportadorFinal] = useState('');
  const [formCnpjExportador, setFormCnpjExportador] = useState('');
  const [formNfRemessa, setFormNfRemessa] = useState('');
  const [formChaveRemessa, setFormChaveRemessa] = useState('');
  const [formDataRemessa, setFormDataRemessa] = useState('2026-03-15');
  const [formDescricao, setFormDescricao] = useState('');
  const [formNcm, setFormNcm] = useState('');
  const [formValorFornecimento, setFormValorFornecimento] = useState(300000);
  const [formIi, setFormIi] = useState(24000);
  const [formIpi, setFormIpi] = useState(15000);
  const [formPis, setFormPis] = useState(6300);
  const [formCofins, setFormCofins] = useState(29100);
  const [formIcms, setFormIcms] = useState(36000);
  const [formDueExportador, setFormDueExportador] = useState('');
  const [formPercentualComprovado, setFormPercentualComprovado] = useState(0);
  const [formObservacoes, setFormObservacoes] = useState('');

  const carregarDados = () => {
    const dados = dbService.getDrawbackIntermediario();
    setResumo(dados);
    if (dados.atos.length > 0 && !selectedAto) {
      setSelectedAto(dados.atos[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarAto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumeroAto || !formExportadorFinal) {
      setMensagemErro('Preencha o número do Ato Concessório e o Fabricante-Exportador Final.');
      return;
    }

    const totalSusp = Number(formIi) + Number(formIpi) + Number(formPis) + Number(formCofins) + Number(formIcms);
    const novo: ItemDrawbackIntermediario = {
      id: `draw-int-${Date.now()}`,
      empresaId: resumo?.empresaId || 1,
      numeroAtoConcessorioIntermediario: formNumeroAto,
      dataEmissaoAto: formDataEmissao,
      dataValidadeAto: formDataValidade,
      modalidade: formModalidade,
      razaoSocialExportadorFinal: formExportadorFinal,
      cnpjExportadorFinal: formCnpjExportador || '00.000.000/0001-00',
      numeroNotaFiscalRemessaIntermediaria: formNfRemessa || 'NF-e 001.000',
      chaveNfeRemessa: formChaveRemessa || '35260300000000000100550010000010001000001000',
      dataRemessa: formDataRemessa,
      descricaoProdutoIntermediario: formDescricao || 'Produto Intermediário para Exportação',
      codigoNcmProdutoIntermediario: formNcm || '8483.40.10',
      valorFornecimentoBRL: Number(formValorFornecimento),
      valorIiSuspensoBRL: Number(formIi),
      valorIpiSuspensoBRL: Number(formIpi),
      valorPisSuspensoBRL: Number(formPis),
      valorCofinsSuspensoBRL: Number(formCofins),
      valorIcmsSuspensoBRL: Number(formIcms),
      valorTotalTributosSuspensosBRL: totalSusp,
      numeroDueExportadorFinal: formDueExportador || undefined,
      percentualComprovado: Number(formPercentualComprovado),
      status: Number(formPercentualComprovado) >= 100 ? 'TOTALMENTE_COMPROVADO' : Number(formPercentualComprovado) > 0 ? 'PARCIALMENTE_COMPROVADO' : 'REGISTRADO_SISCOMEX',
      integradoContabil: false,
      observacoes: formObservacoes || 'Remessa com suspensão tributária para fornecimento a exportador final.'
    };

    const res = dbService.salvarAtoDrawbackIntermediario(novo);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovoAto(false);
      carregarDados();
    } else {
      setMensagemErro('Erro ao salvar Ato de Drawback Intermediário.');
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarDrawbackIntermediarioContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const atosFiltrados = (resumo?.atos || []).filter(item => {
    const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
    const matchBusca = termoBusca === '' ||
      item.numeroAtoConcessorioIntermediario.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.razaoSocialExportadorFinal.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.descricaoProdutoIntermediario.toLowerCase().includes(termoBusca.toLowerCase());
    return matchStatus && matchBusca;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-gray-800 bg-[#181818] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                Drawback Intermediário & Fornecimento Interno (Decreto nº 6.759/2009)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                REGULAMENTO ADUANEIRO ARTS. 383 A 426
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PORTARIA SECEX 44/2020
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Suspensão de II, IPI, PIS, COFINS e ICMS em produtos fornecidos a fabricante-exportador principal (CFOP 5.127/6.127).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalNovoAto(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Ato Intermediário
          </button>
          <button
            onClick={() => setActiveTab('laudo_a4')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Laudo Pericial A4
          </button>
          <button
            onClick={carregarDados}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedbacks */}
      {mensagemSucesso && (
        <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {mensagemErro && (
        <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Atos Intermediários</span>
            <Anchor className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">{resumo?.totalAtosConcessorios || 0}</div>
          <div className="text-[10px] text-gray-500 mt-1">Concessões registradas no Siscomex</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Fornecimento Intermediário</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400">
            R$ {(resumo?.totalFornecimentoIntermediarioBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-blue-400/70 mt-1">Remessas CFOP 5.127/6.127</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Tributos Suspensos Totais</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">
            R$ {(resumo?.totalTributosSuspensosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-400/70 mt-1">II, IPI, PIS, COFINS, ICMS</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Tributos Comprovados</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            R$ {(resumo?.totalTributosComprovadosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Exportação averbada no Siscomex</div>
        </div>

        <div className="bg-[#181818] border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Saldo em Risco</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">
            R$ {(resumo?.totalTributosRiscoInadimplementoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-rose-400/70 mt-1">Pendente de comprovação final</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 px-6 flex gap-4">
        <button
          onClick={() => setActiveTab('atos_intermediarios')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'atos_intermediarios'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Atos Concessórios Intermediários ({resumo?.atos?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('comprovacao_due')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'comprovacao_due'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Ship className="w-4 h-4" />
          Cruzamento DU-E Exportador Final
        </button>
        <button
          onClick={() => setActiveTab('tributos_suspensos')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'tributos_suspensos'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          Composição Tributos Suspensos
        </button>
        <button
          onClick={() => setActiveTab('laudo_a4')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'laudo_a4'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Laudo Pericial de Drawback A4
        </button>
      </div>

      {/* Tab 1: Atos Intermediários */}
      {activeTab === 'atos_intermediarios' && (
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#181818] p-4 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por ato, exportador final ou produto..."
                  value={termoBusca}
                  onChange={e => setTermoBusca(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-[#121212] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-72"
                />
              </div>

              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="bg-[#121212] border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="TOTALMENTE_COMPROVADO">Totalmente Comprovado (100%)</option>
                <option value="PARCIALMENTE_COMPROVADO">Parcialmente Comprovado</option>
                <option value="REGISTRADO_SISCOMEX">Registrado no Siscomex</option>
                <option value="INADIMPLIDO">Inadimplido</option>
              </select>
            </div>

            <div className="text-xs text-gray-400">
              Exibindo <span className="font-semibold text-white">{atosFiltrados.length}</span> concessões
            </div>
          </div>

          <div className="bg-[#181818] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Ato Concessório / Validade</th>
                    <th className="py-3 px-4">Exportador Final Vinculado</th>
                    <th className="py-3 px-4">Produto Intermediário</th>
                    <th className="py-3 px-4 text-right">Fornecimento (R$)</th>
                    <th className="py-3 px-4 text-right">Tributos Suspensos</th>
                    <th className="py-3 px-4 text-center">Comprovação</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {atosFiltrados.map(ato => (
                    <tr key={ato.id} className="hover:bg-[#1d1d1d] transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white font-mono">{ato.numeroAtoConcessorioIntermediario}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">Validade: {ato.dataValidadeAto}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-200">{ato.razaoSocialExportadorFinal}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">CNPJ: {ato.cnpjExportadorFinal}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-300 font-medium">{ato.descricaoProdutoIntermediario}</div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">NCM: {ato.codigoNcmProdutoIntermediario} • {ato.numeroNotaFiscalRemessaIntermediaria}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-300">
                        R$ {ato.valorFornecimentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">
                        R$ {ato.valorTotalTributosSuspensosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-16 bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700">
                            <div
                              className={`h-full ${ato.percentualComprovado >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                              style={{ width: `${Math.min(100, ato.percentualComprovado)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-white">{ato.percentualComprovado}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          ato.status === 'TOTALMENTE_COMPROVADO'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : ato.status === 'PARCIALMENTE_COMPROVADO'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {ato.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ato.integradoContabil ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Compensado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleIntegrarContabil(ato.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded transition"
                          >
                            Integrar Contábil
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cruzamento DU-E */}
      {activeTab === 'comprovacao_due' && (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2">Comprovação de Exportação por Terceiros (DU-E)</h3>
            <p className="text-xs text-gray-400 mb-6">
              O fabricante intermediário comprova a regularidade da suspensão dos tributos através da averbação da DU-E realizada pelo exportador principal.
            </p>

            <div className="space-y-4">
              {(resumo?.atos || []).map(ato => (
                <div key={ato.id} className="p-4 bg-[#141414] border border-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Ato {ato.numeroAtoConcessorioIntermediario}</span>
                        <span className="text-xs text-cyan-400 font-mono">({ato.razaoSocialExportadorFinal})</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Fornecimento: {ato.descricaoProdutoIntermediario} ({ato.numeroNotaFiscalRemessaIntermediaria})
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      {ato.percentualComprovado}% Comprovado
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#181818] p-3 rounded mt-3 border border-gray-800">
                    <div>
                      <span className="text-gray-500">DU-E do Exportador Final:</span>
                      <div className="font-mono text-cyan-300 font-semibold mt-0.5">{ato.numeroDueExportadorFinal || 'Aguardando averbação'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Data de Averbação Siscomex:</span>
                      <div className="text-gray-300 mt-0.5">{ato.dataAverbacaoExportadorFinal || 'Em processamento aduaneiro'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tributos Liberados de Risco:</span>
                      <div className="font-bold text-emerald-400 mt-0.5">
                        R$ {(ato.valorTotalTributosSuspensosBRL * (ato.percentualComprovado / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Composição Tributos Suspensos */}
      {activeTab === 'tributos_suspensos' && (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2">Detalhamento dos 5 Tributos com Suspensão Aduaneira</h3>
            <p className="text-xs text-gray-400 mb-6">
              Quadro analítico de tributos suspensos nos insumos adquiridos pelo fabricante intermediário para industrialização de bens destinados à exportação.
            </p>

            <table className="w-full text-left text-xs border border-gray-800">
              <thead className="bg-[#202020] text-gray-400 font-semibold text-[10px] uppercase">
                <tr>
                  <th className="p-2 border-r border-gray-800">Ato Concessório</th>
                  <th className="p-2 text-right border-r border-gray-800">II Suspenso</th>
                  <th className="p-2 text-right border-r border-gray-800">IPI Suspenso</th>
                  <th className="p-2 text-right border-r border-gray-800">PIS Suspenso</th>
                  <th className="p-2 text-right border-r border-gray-800">COFINS Suspenso</th>
                  <th className="p-2 text-right border-r border-gray-800">ICMS Suspenso</th>
                  <th className="p-2 text-right font-bold text-white">Total Suspenso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {(resumo?.atos || []).map(a => (
                  <tr key={a.id} className="hover:bg-[#1d1d1d]">
                    <td className="p-2 border-r border-gray-800 text-white font-sans">{a.numeroAtoConcessorioIntermediario}</td>
                    <td className="p-2 border-r border-gray-800 text-right text-gray-300">R$ {a.valorIiSuspensoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 border-r border-gray-800 text-right text-gray-300">R$ {a.valorIpiSuspensoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 border-r border-gray-800 text-right text-gray-300">R$ {a.valorPisSuspensoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 border-r border-gray-800 text-right text-gray-300">R$ {a.valorCofinsSuspensoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 border-r border-gray-800 text-right text-cyan-400">R$ {a.valorIcmsSuspensoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right font-bold text-amber-400">R$ {a.valorTotalTributosSuspensosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Laudo A4 */}
      {activeTab === 'laudo_a4' && (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Laudo Pericial A4
            </button>
          </div>

          <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg border border-gray-300 font-sans text-xs">
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-base font-bold text-gray-900 tracking-wide uppercase">
                  LAUDO PERICIAL DE COMPROVAÇÃO DE DRAWBACK INTERMEDIÁRIO
                </h1>
                <p className="text-[11px] text-gray-600">
                  Fundamento Legal: Decreto nº 6.759/2009 (Regulamento Aduaneiro Arts. 383 a 426) e Portaria SECEX nº 44/2020
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Destinação: Receita Federal do Brasil (RFB) e Secretaria de Comércio Exterior (SECEX/MDIC)
                </p>
              </div>
              <div className="text-right text-[10px] text-gray-500 font-mono">
                <div>Competência: 2026-03</div>
                <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* Relação de Atos */}
            <div className="mb-6">
              <h2 className="font-bold text-xs uppercase text-gray-800 border-b border-gray-300 pb-1 mb-2">
                1. Relação de Remessas Intermediárias para Fabricantes-Exportadores
              </h2>
              <table className="w-full text-left text-[11px] border border-gray-300">
                <thead className="bg-gray-100 font-semibold border-b border-gray-300">
                  <tr>
                    <th className="p-1.5">Ato Concessório</th>
                    <th className="p-1.5">Exportador Principal</th>
                    <th className="p-1.5">Produto Intermediário</th>
                    <th className="p-1.5 text-right">Fornecimento</th>
                    <th className="p-1.5 text-right">Tributos Suspensos</th>
                    <th className="p-1.5 text-center">DU-E Averbada</th>
                    <th className="p-1.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(resumo?.atos || []).map((a, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-1.5 font-mono font-semibold">{a.numeroAtoConcessorioIntermediario}</td>
                      <td className="p-1.5">{a.razaoSocialExportadorFinal}</td>
                      <td className="p-1.5">{a.descricaoProdutoIntermediario}</td>
                      <td className="p-1.5 text-right">R$ {a.valorFornecimentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-right font-bold text-amber-800">R$ {a.valorTotalTributosSuspensosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1.5 text-center font-mono">{a.numeroDueExportadorFinal || 'Em averbação'}</td>
                      <td className="p-1.5 text-center font-semibold text-[10px]">{a.percentualComprovado}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Declaração de Responsabilidade */}
            <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-300 text-[11px] leading-relaxed text-gray-700">
              Certificamos que as matérias-primas e insumos adquiridos no mercado interno e/ou importados sob o regime de Drawback Intermediário foram integralmente incorporados aos produtos intermediários fornecidos aos fabricantes-exportadores acima indicados, cumprindo os coeficientes técnicos de produção e as obrigações acessórias do Siscomex Drawback Web.
            </div>

            {/* Assinaturas */}
            <div className="mt-12 pt-8 border-t border-gray-400 grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <div className="border-b border-gray-600 pb-1 mb-1 font-semibold text-gray-900">
                  DIRETOR DE COMÉRCIO EXTERIOR / SUPRIMENTOS
                </div>
                <div className="text-[10px] text-gray-500">Fabricante Intermediário</div>
              </div>
              <div>
                <div className="border-b border-gray-600 pb-1 mb-1 font-semibold text-gray-900">
                  CONTADOR RESPONSÁVEL TÉCNICO
                </div>
                <div className="text-[10px] text-gray-500">CRC/SP Ativo nº 1SP999999/O-0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Ato Intermediário */}
      {modalNovoAto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181818] border border-gray-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-gray-200">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Cadastrar Ato Concessório Intermediário</h3>
              </div>
              <button onClick={() => setModalNovoAto(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarAto} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Nº Ato Siscomex *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 20260055410"
                    value={formNumeroAto}
                    onChange={e => setFormNumeroAto(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Modalidade</label>
                  <select
                    value={formModalidade}
                    onChange={e => setFormModalidade(e.target.value as ModalidadeDrawbackIntermediario)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  >
                    <option value="SUSPENSAO">Suspensão de Tributos</option>
                    <option value="ISENCAO">Isenção de Reposição</option>
                    <option value="RESTITUICAO">Restituição Aduaneira</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Fabricante-Exportador Final Vinculado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Embraer S/A, Marcopolo S/A, WEG S/A"
                  value={formExportadorFinal}
                  onChange={e => setFormExportadorFinal(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Produto Intermediário</label>
                  <input
                    type="text"
                    placeholder="Ex: Componentes elétricos para aeronaves"
                    value={formDescricao}
                    onChange={e => setFormDescricao(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">NCM Produto</label>
                  <input
                    type="text"
                    placeholder="Ex: 8544.30.00"
                    value={formNcm}
                    onChange={e => setFormNcm(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">NF-e Remessa (CFOP 5.127/6.127)</label>
                  <input
                    type="text"
                    placeholder="Ex: NF-e 005.120"
                    value={formNfRemessa}
                    onChange={e => setFormNfRemessa(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Valor do Fornecimento (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorFornecimento}
                    onChange={e => setFormValorFornecimento(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#121212] rounded-lg border border-gray-800 space-y-2">
                <div className="text-gray-300 font-semibold text-[11px]">Tributos Suspensos nos Insumos (R$):</div>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">II (R$)</label>
                    <input type="number" step="0.01" value={formIi} onChange={e => setFormIi(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-white text-[11px]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">IPI (R$)</label>
                    <input type="number" step="0.01" value={formIpi} onChange={e => setFormIpi(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-white text-[11px]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">PIS (R$)</label>
                    <input type="number" step="0.01" value={formPis} onChange={e => setFormPis(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-white text-[11px]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">COFINS (R$)</label>
                    <input type="number" step="0.01" value={formCofins} onChange={e => setFormCofins(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-white text-[11px]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">ICMS (R$)</label>
                    <input type="number" step="0.01" value={formIcms} onChange={e => setFormIcms(Number(e.target.value))} className="w-full bg-[#181818] border border-gray-700 rounded p-1 text-cyan-300 text-[11px]" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovoAto(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold shadow-sm"
                >
                  Salvar Ato Intermediário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
