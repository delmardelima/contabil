import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Printer,
  Download,
  Building2,
  Receipt,
  FileCode2,
  Percent,
  SlidersHorizontal,
  FileCheck2,
  Landmark
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoDctfMensal,
  DeclaracaoDctfMensal,
  DebitoApuradoDctf,
  TipoTributoDctf,
  FormaTributacaoLucroDctf,
  QualificacaoPjDctf
} from '../../types/contabil';

export const DctfMensalModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoDctfMensal | null>(null);
  const [activeTab, setActiveTab] = useState<'debitos' | 'vinculacoes' | 'arquivoPva' | 'espelhoA4'>('debitos');
  const [busca, setBusca] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Arquivo PVA
  const [arquivoTxt, setArquivoTxt] = useState<string>('');
  const [nomeArquivo, setNomeArquivo] = useState<string>('');

  // Modal Novo Débito
  const [modalNovoDebito, setModalNovoDebito] = useState<boolean>(false);
  const [formTributo, setFormTributo] = useState<TipoTributoDctf>('IRPJ');
  const [formCodigoReceita, setFormCodigoReceita] = useState<string>('2089');
  const [formDescricao, setFormDescricao] = useState<string>('IRPJ - Lucro Presumido');
  const [formPeriodicidade, setFormPeriodicidade] = useState<'MENSAL' | 'TRIMESTRAL'>('TRIMESTRAL');
  const [formVencimento, setFormVencimento] = useState<string>('2026-04-30');
  const [formValorPrincipal, setFormValorPrincipal] = useState<number>(25000.0);
  const [formValorPagoDarf, setFormValorPagoDarf] = useState<number>(25000.0);
  const [formAutenticacaoDarf, setFormAutenticacaoDarf] = useState<string>('');

  const carregarDados = () => {
    const dados = dbService.getDctfMensal(empresaId, competencia);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSalvarDebito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumo) return;
    if (!formCodigoReceita || formValorPrincipal <= 0) {
      exibirNotificacao('erro', 'Código da receita e valor devido são obrigatórios.');
      return;
    }

    const res = dbService.salvarDebitoDctf(resumo.declaracao.id, {
      tributo: formTributo,
      codigoReceita: formCodigoReceita,
      descricaoTributo: formDescricao,
      periodicidade: formPeriodicidade,
      periodoApuracao: formPeriodicidade === 'TRIMESTRAL' ? `${competencia.slice(0, 4)}-1T` : competencia,
      dataVencimento: formVencimento,
      valorPrincipalDevidoBRL: Number(formValorPrincipal),
      pagamentosDarf: formValorPagoDarf > 0 ? [
        {
          dataPagamento: new Date().toISOString().split('T')[0],
          valorPagoBRL: Number(formValorPagoDarf),
          darfAutenticacaoBancaria: formAutenticacaoDarf || `AUT-${Date.now()}`
        }
      ] : []
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovoDebito(false);
      setFormCodigoReceita('');
      setFormDescricao('');
      setFormValorPrincipal(0);
      setFormValorPagoDarf(0);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleGerarArquivoTxt = () => {
    if (!resumo?.declaracao.id) return;
    const res = dbService.gerarArquivoDctfTxt(resumo.declaracao.id);
    if (res.sucesso && res.arquivoTxt) {
      setArquivoTxt(res.arquivoTxt);
      setNomeArquivo(res.nomeArquivo || `DCTF_MENSAL_${competencia}.DEC`);
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleDownloadTxt = () => {
    if (!arquivoTxt) return;
    const blob = new Blob([arquivoTxt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo || `DCTF_MENSAL_${competencia}.DEC`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    exibirNotificacao('sucesso', `Download da declaração ${nomeArquivo} concluído.`);
  };

  const handleIntegrarContabil = () => {
    if (!resumo?.declaracao.id) return;
    const res = dbService.integrarDctfContabil(resumo.declaracao.id);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const debitosFiltrados = resumo?.declaracao.debitos.filter(d =>
    d.descricaoTributo.toLowerCase().includes(busca.toLowerCase()) ||
    d.codigoReceita.includes(busca) ||
    d.tributo.toLowerCase().includes(busca.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-[#e0e0e0] overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-[#2d2d2d] bg-[#181818] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                DCTF Mensal Tradicional (PVA Receita Federal)
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-950/80 text-teal-300 border border-teal-700/50">
                  IN RFB nº 2.005/2021 • Domínio esf02
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Declaração de Débitos e Créditos Tributários Federais (IRPJ, CSLL, PIS, COFINS, IPI, IRRF e CIDE) com quitação via DARF e DCOMP
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
              className="bg-transparent text-xs text-teal-400 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={() => setModalNovoDebito(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Débito Declarado
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
          <div className="text-xs font-medium text-gray-400">Total de Débitos Declarados (R$)</div>
          <div className="text-2xl font-bold text-white mt-1">
            R$ {(resumo?.declaracao.totalDebitosDeclaradosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-teal-400 mt-2 flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" />
            <span>{resumo?.declaracao.debitos.length || 0} tributos federais</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-white pointer-events-none">
            <Receipt className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Pagamentos Vinculados (DARF)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            R$ {(resumo?.declaracao.totalPagamentosDarfBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Comprovantes bancários quitados</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-emerald-400 pointer-events-none">
            <CheckCircle2 className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Compensações c/ DCOMP (R$)</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            R$ {(resumo?.declaracao.totalCompensacoesDcompBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-300 mt-2 flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Créditos de PER/DCOMP vinculados</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-blue-400 pointer-events-none">
            <ArrowRightLeft className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Saldo Remanescente a Pagar</div>
          <div className={`text-2xl font-bold mt-1 ${(resumo?.declaracao.saldoTotalPagarBRL || 0) === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            R$ {(resumo?.declaracao.saldoTotalPagarBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <span className="text-white font-mono">Status: {resumo?.declaracao.statusTransmissao}</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-teal-400 pointer-events-none">
            <FileText className="w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 border-b border-[#2d2d2d] flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('debitos')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'debitos'
                ? 'border-teal-500 text-teal-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Débitos Federais Apurados ({resumo?.declaracao.debitos.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('vinculacoes')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'vinculacoes'
                ? 'border-teal-500 text-teal-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Vinculação de DARFs e DCOMPs
          </button>
          <button
            onClick={() => setActiveTab('arquivoPva')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'arquivoPva'
                ? 'border-teal-500 text-teal-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            Arquivo Magnético PVA (.DEC)
          </button>
          <button
            onClick={() => setActiveTab('espelhoA4')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'espelhoA4'
                ? 'border-teal-500 text-teal-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            Espelho DCTF A4
          </button>
        </div>

        {/* Busca rápida */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código, tributo ou descrição..."
            className="bg-[#202020] border border-[#333333] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500 w-64"
          />
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-5 flex-1">
        {/* ABA 1: DÉBITOS FEDERAIS */}
        {activeTab === 'debitos' && (
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-300">
                Débitos Declarados em DCTF Mensal ({debitosFiltrados.length} obrigações)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGerarArquivoTxt}
                  className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 rounded text-xs border border-[#383838] flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
                  Gerar Lote PVA
                </button>
                <button
                  onClick={handleIntegrarContabil}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Integrar no Diário Geral
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#222222] text-gray-400 font-medium border-b border-[#2d2d2d]">
                  <tr>
                    <th className="py-2.5 px-3">Código Receita</th>
                    <th className="py-2.5 px-3">Tributo</th>
                    <th className="py-2.5 px-3">Descrição da Obrigação</th>
                    <th className="py-2.5 px-3">Periodicidade / Período</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3 text-right">Valor Devido (R$)</th>
                    <th className="py-2.5 px-3 text-right">DARF Pago (R$)</th>
                    <th className="py-2.5 px-3 text-right">Compensação DCOMP</th>
                    <th className="py-2.5 px-3 text-right">Saldo a Pagar</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {debitosFiltrados.map((d) => {
                    const totalPago = d.pagamentosDarf.reduce((acc, p) => acc + p.valorPagoBRL, 0);
                    const totalComp = d.compensacoesDcomp.reduce((acc, c) => acc + c.valorCompensadoBRL, 0);

                    return (
                      <tr key={d.id} className="hover:bg-[#202020] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-400">{d.codigoReceita}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2a2a2a] text-gray-300 border border-[#3a3a3a]">
                            {d.tributo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-white font-medium">{d.descricaoTributo}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-400">
                          {d.periodicidade} ({d.periodoApuracao})
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-400">{d.dataVencimento}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          R$ {d.valorPrincipalDevidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                          R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-blue-400">
                          R$ {totalComp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          <span className={d.saldoDevedorRemanescenteBRL === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                            R$ {d.saldoDevedorRemanescenteBRL.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {d.saldoDevedorRemanescenteBRL === 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                              Quitado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/40">
                              Pendente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: VINCULAÇÕES DE DARFs E DCOMPs */}
        {activeTab === 'vinculacoes' && (
          <div className="space-y-4">
            <div className="bg-[#181818] p-4 rounded-xl border border-[#2d2d2d]">
              <div className="text-xs font-bold text-white mb-2">Comprovantes de Arrecadação Vinculados aos Débitos</div>
              <p className="text-xs text-gray-400 mb-4">
                Demonstração da quitação integral dos débitos federais declarados em DCTF através de DARFs pagos e declarações de compensação PER/DCOMP.
              </p>

              <div className="space-y-3">
                {resumo?.declaracao.debitos.map((deb) => (
                  <div key={deb.id} className="p-3 bg-[#202020] rounded-lg border border-[#2e2e2e] text-xs">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#2d2d2d]">
                      <div>
                        <span className="font-mono font-bold text-teal-400">{deb.codigoReceita}</span>
                        <span className="text-white font-medium ml-2">{deb.descricaoTributo}</span>
                      </div>
                      <span className="font-mono text-white font-bold">
                        Débito: R$ {deb.valorPrincipalDevidoBRL.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      {/* Pagamentos DARF */}
                      <div>
                        <span className="text-gray-400 font-semibold block mb-1">PAGAMENTOS COM DARF:</span>
                        {deb.pagamentosDarf.length > 0 ? (
                          <div className="space-y-1">
                            {deb.pagamentosDarf.map((p, idx) => (
                              <div key={idx} className="flex justify-between p-1.5 bg-[#191919] rounded">
                                <span className="text-gray-300 font-mono">Data: {p.dataPagamento}</span>
                                <span className="text-emerald-400 font-mono font-bold">R$ {p.valorPagoBRL.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Nenhum DARF vinculado</span>
                        )}
                      </div>

                      {/* Compensações DCOMP */}
                      <div>
                        <span className="text-gray-400 font-semibold block mb-1">COMPENSAÇÕES DCOMP:</span>
                        {deb.compensacoesDcomp.length > 0 ? (
                          <div className="space-y-1">
                            {deb.compensacoesDcomp.map((c, idx) => (
                              <div key={idx} className="flex justify-between p-1.5 bg-[#191919] rounded">
                                <span className="text-blue-300 font-mono">{c.numeroDcomp}</span>
                                <span className="text-blue-400 font-mono font-bold">R$ {c.valorCompensadoBRL.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Nenhuma DCOMP vinculada</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: ARQUIVO MAGNÉTICO PVA (.DEC) */}
        {activeTab === 'arquivoPva' && (
          <div className="space-y-4">
            <div className="bg-[#181818] p-4 rounded-xl border border-[#2d2d2d] flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-teal-400" />
                  Arquivo da DCTF Mensal Tradicional (PVA RFB)
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Layout posicional oficial para importação no programa validador da Receita Federal
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGerarArquivoTxt}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Gerar Arquivo .DEC
                </button>
                {arquivoTxt && (
                  <button
                    onClick={handleDownloadTxt}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download {nomeArquivo}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl p-4 font-mono text-xs text-gray-300 overflow-x-auto">
              <pre>{arquivoTxt || '// Clique em "Gerar Arquivo .DEC" para compilar a DCTF Mensal oficial.'}</pre>
            </div>
          </div>
        )}

        {/* ABA 4: ESPELHO OFICIAL DCTF A4 */}
        {activeTab === 'espelhoA4' && resumo && (
          <div className="flex justify-center">
            <div className="w-[210mm] bg-[#1a1a1a] text-gray-200 border border-[#333333] p-10 shadow-2xl rounded-sm text-xs">
              {/* Topo DCTF */}
              <div className="border-b-2 border-teal-500 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    DCTF MENSAL - DECLARAÇÃO DE DÉBITOS E CRÉDITOS TRIBUTÁRIOS FEDERAIS
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-1">
                    MINISTÉRIO DA FAZENDA • SECRETARIA DA RECEITA FEDERAL DO BRASIL
                  </p>
                  <p className="text-[10px] text-teal-400 font-semibold mt-0.5">
                    Instrução Normativa RFB nº 2.005/2021 & IN RFB nº 1.599/2015
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">EMPRESA MODELO CONTÁBIL S/A</div>
                  <div className="text-[10px] text-gray-400 font-mono">CNPJ: 00.000.000/0001-91</div>
                  <div className="text-[10px] text-teal-400 font-mono mt-1">Competência: {competencia}</div>
                </div>
              </div>

              {/* Informações da PJ */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-[#202020] border border-gray-700 rounded text-[11px]">
                <div>
                  <span className="text-[10px] text-gray-400 block">FORMA DE TRIBUTAÇÃO:</span>
                  <span className="text-white font-bold">{resumo.declaracao.formaTributacao}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">QUALIFICAÇÃO:</span>
                  <span className="text-white font-bold">{resumo.declaracao.qualificacaoPj}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">STATUS DA DECLARAÇÃO:</span>
                  <span className="text-teal-400 font-bold">{resumo.declaracao.statusTransmissao}</span>
                </div>
              </div>

              {/* Tabela dos Débitos e Quitação */}
              <table className="w-full text-left text-[11px] border-collapse mb-8">
                <thead>
                  <tr className="border-b border-gray-600 font-semibold text-gray-300">
                    <th className="py-1 px-2">Código</th>
                    <th className="py-1 px-2">Tributo / Descrição</th>
                    <th className="py-1 px-2">Vencimento</th>
                    <th className="py-1 px-2 text-right">Valor Débito</th>
                    <th className="py-1 px-2 text-right">DARF Pago</th>
                    <th className="py-1 px-2 text-right">Comp. DCOMP</th>
                    <th className="py-1 px-2 text-right">Saldo Devedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {resumo.declaracao.debitos.map((d) => {
                    const totalPago = d.pagamentosDarf.reduce((acc, p) => acc + p.valorPagoBRL, 0);
                    const totalComp = d.compensacoesDcomp.reduce((acc, c) => acc + c.valorCompensadoBRL, 0);

                    return (
                      <tr key={d.id}>
                        <td className="py-1 px-2 font-mono text-teal-400 font-bold">{d.codigoReceita}</td>
                        <td className="py-1 px-2 text-white">{d.descricaoTributo}</td>
                        <td className="py-1 px-2 font-mono text-gray-400">{d.dataVencimento}</td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-white">
                          R$ {d.valorPrincipalDevidoBRL.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 text-right font-mono text-emerald-400">
                          R$ {totalPago.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 text-right font-mono text-blue-400">
                          R$ {totalComp.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-gray-300">
                          R$ {d.saldoDevedorRemanescenteBRL.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-500 font-bold text-white">
                    <td colSpan={3} className="py-1.5 px-2 text-right">TOTAIS DECLARADOS:</td>
                    <td className="py-1.5 px-2 text-right font-mono">
                      R$ {resumo.declaracao.totalDebitosDeclaradosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-emerald-400">
                      R$ {resumo.declaracao.totalPagamentosDarfBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-blue-400">
                      R$ {resumo.declaracao.totalCompensacoesDcompBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-teal-400">
                      R$ {resumo.declaracao.saldoTotalPagarBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Recibo e Assinaturas */}
              <div className="mt-12 pt-8 border-t border-[#333333] grid grid-cols-2 gap-12 text-center text-[10px] text-gray-400">
                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    DIRETORIA TRIBUTÁRIA / FISCAL
                  </div>
                  <div>Contribuinte Responsável RFB</div>
                </div>

                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    CONTADOR RESPONSÁVEL TÉCNICO
                  </div>
                  <div>CRC 1SP999999/O-0</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO DÉBITO DECLARADO */}
      {modalNovoDebito && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1c] border border-[#333333] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" />
              Declarar Novo Débito Federal em DCTF
            </h3>

            <form onSubmit={handleSalvarDebito} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tributo:</label>
                  <select
                    value={formTributo}
                    onChange={(e) => setFormTributo(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="IRPJ">IRPJ</option>
                    <option value="CSLL">CSLL</option>
                    <option value="PIS_PASEP">PIS/PASEP</option>
                    <option value="COFINS">COFINS</option>
                    <option value="IPI">IPI</option>
                    <option value="IRRF">IRRF</option>
                    <option value="CIDE">CIDE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Código da Receita:</label>
                  <input
                    type="text"
                    value={formCodigoReceita}
                    onChange={(e) => setFormCodigoReceita(e.target.value)}
                    placeholder="2089"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descrição do Tributo:</label>
                <input
                  type="text"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: IRPJ - Lucro Presumido Apuração Trimestral"
                  required
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Periodicidade:</label>
                  <select
                    value={formPeriodicidade}
                    onChange={(e) => setFormPeriodicidade(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="TRIMESTRAL">Trimestral (IRPJ/CSLL)</option>
                    <option value="MENSAL">Mensal (PIS/COFINS/IRRF)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data de Vencimento:</label>
                  <input
                    type="date"
                    value={formVencimento}
                    onChange={(e) => setFormVencimento(e.target.value)}
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor Principal Devido (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorPrincipal}
                    onChange={(e) => setFormValorPrincipal(Number(e.target.value))}
                    min="0"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Valor Quitado via DARF (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValorPagoDarf}
                    onChange={(e) => setFormValorPagoDarf(Number(e.target.value))}
                    min="0"
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Autenticação Bancária DARF (Opcional):</label>
                <input
                  type="text"
                  value={formAutenticacaoDarf}
                  onChange={(e) => setFormAutenticacaoDarf(e.target.value)}
                  placeholder="BRADESCO.20260428.110293"
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono text-[11px] focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setModalNovoDebito(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Salvar Débito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
