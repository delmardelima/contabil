import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  Percent,
  SlidersHorizontal,
  FileCheck2,
  FileCode2
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoDapiMg,
  DeclaracaoDapiMg,
  ItemOutroCreditoDapi,
  TipoCampoDapiMg
} from '../../types/contabil';

export const DapiMgIcmsModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoDapiMg | null>(null);
  const [activeTab, setActiveTab] = useState<'apuracao' | 'outrosCreditos' | 'arquivoMagnetico' | 'espelhoA4'>('apuracao');
  const [busca, setBusca] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Arquivo magnético
  const [arquivoTxt, setArquivoTxt] = useState<string>('');
  const [nomeArquivo, setNomeArquivo] = useState<string>('');

  // Modal Novo Crédito/Dedução
  const [modalAjuste, setModalAjuste] = useState<boolean>(false);
  const [formCampo, setFormCampo] = useState<TipoCampoDapiMg>('66_OUTROS_CREDITOS');
  const [formCodigo, setFormCodigo] = useState<string>('MG020002');
  const [formDescricao, setFormDescricao] = useState<string>('');
  const [formDispositivo, setFormDispositivo] = useState<string>('RICMS-MG Art. 75');
  const [formValor, setFormValor] = useState<number>(5000.0);

  const carregarDados = () => {
    const dados = dbService.getDapiMg(empresaId, competencia);
    setResumo(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleGerarArquivoTxt = () => {
    if (!resumo?.declaracaoAtual.id) return;
    const res = dbService.gerarArquivoDapiMgTxt(resumo.declaracaoAtual.id);
    if (res.sucesso && res.arquivoTxt) {
      setArquivoTxt(res.arquivoTxt);
      setNomeArquivo(res.nomeArquivo || `DAPI_${competencia}.TXT`);
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
    a.download = nomeArquivo || `DAPI_${competencia}.TXT`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    exibirNotificacao('sucesso', `Download do arquivo ${nomeArquivo} concluído.`);
  };

  const handleSalvarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumo) return;
    if (!formDescricao || formValor <= 0) {
      exibirNotificacao('erro', 'Descrição e Valor são obrigatórios.');
      return;
    }

    const novoItem: ItemOutroCreditoDapi = {
      id: `ajuste-${Date.now()}`,
      campoDapi: formCampo,
      codigoAjuste: formCodigo,
      descricao: formDescricao,
      dispositivoLegal: formDispositivo,
      valorBRL: Number(formValor)
    };

    const dec = { ...resumo.declaracaoAtual };
    dec.detalhesOutrosCreditos = [...dec.detalhesOutrosCreditos, novoItem];

    // Atualizar valor no quadro correspondente
    if (formCampo === '66_OUTROS_CREDITOS') {
      dec.quadro.quadro04Apuracao.outrosCreditosCpo66 += novoItem.valorBRL;
    } else if (formCampo === '90_DEDUCOES_INCENTIVOS') {
      dec.quadro.quadro04Apuracao.deducoesIncentivosCpo90 += novoItem.valorBRL;
    }

    // Recalcular saldo devedor
    const totalDeb = dec.quadro.quadro04Apuracao.totalDebitosSaidas + dec.quadro.quadro04Apuracao.estornoCreditos;
    const totalCred = dec.quadro.quadro04Apuracao.totalCreditosEntradas + dec.quadro.quadro04Apuracao.outrosCreditosCpo66 + dec.quadro.quadro04Apuracao.estornoDebitosCpo73 + dec.quadro.quadro04Apuracao.saldoCredorPeriodoAnterior;
    const saldoDev = Math.max(0, totalDeb - totalCred);
    dec.quadro.quadro04Apuracao.saldoDevedorApurado = saldoDev;
    dec.quadro.quadro04Apuracao.icmsNormalRecolher = Math.max(0, saldoDev - dec.quadro.quadro04Apuracao.deducoesIncentivosCpo90);
    dec.quadro.quadro04Apuracao.totalGeralDaeBRL = dec.quadro.quadro04Apuracao.icmsNormalRecolher + dec.quadro.quadro04Apuracao.icmsStRecolher + dec.quadro.quadro04Apuracao.recomposicaoAliqRecolher;

    const res = dbService.salvarDeclaracaoDapiMg(dec);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalAjuste(false);
      setFormDescricao('');
      setFormValor(0);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const handleIntegrarContabil = () => {
    if (!resumo?.declaracaoAtual.id) return;
    const res = dbService.integrarDapiMgContabil(resumo.declaracaoAtual.id);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const q = resumo?.declaracaoAtual.quadro;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-[#e0e0e0] overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-[#2d2d2d] bg-[#181818] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                DAPI-MG - Apuração ICMS Minas Gerais (Modelo 01)
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-950/80 text-rose-300 border border-rose-700/50">
                  Decreto Estadual nº 48.589/2023 • SIARE
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Demonstrativo de Apuração e Informação do ICMS Normal e ST, outros créditos (Cpo 66) e geração DAE MG
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
              className="bg-transparent text-xs text-rose-400 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={() => setModalAjuste(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Crédito / Dedução
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
          <div className="text-xs font-medium text-gray-400">Total Geral DAE a Recolher (R$)</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            R$ {(q?.quadro04Apuracao.totalGeralDaeBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <span className="text-white font-mono">DAE 313-1 + 317-0</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-rose-400 pointer-events-none">
            <Building2 className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Débito pelas Saídas (Quadro III)</div>
          <div className="text-2xl font-bold text-white mt-1">
            R$ {(q?.quadro03Saidas.impostoDebitado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Base: R$ {(q?.quadro03Saidas.baseCalculoIcms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-white pointer-events-none">
            <Percent className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Crédito pelas Entradas (Quadro II)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            R$ {(q?.quadro02Entradas.impostoCreditado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Base: R$ {(q?.quadro02Entradas.baseCalculoIcms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-emerald-400 pointer-events-none">
            <FileSpreadsheet className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#282828] relative overflow-hidden shadow-sm">
          <div className="text-xs font-medium text-gray-400">Outros Créditos (Campo 66)</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            R$ {(q?.quadro04Apuracao.outrosCreditosCpo66 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-300 mt-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Incentivos Setoriais MG</span>
          </div>
          <div className="absolute -right-3 -bottom-3 opacity-5 text-blue-400 pointer-events-none">
            <Layers className="w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 border-b border-[#2d2d2d] flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('apuracao')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'apuracao'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Apuração Modelo 01 (Quadros II, III e IV)
          </button>
          <button
            onClick={() => setActiveTab('outrosCreditos')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'outrosCreditos'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Detalhamento Outros Créditos / Deduções ({resumo?.declaracaoAtual.detalhesOutrosCreditos.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('arquivoMagnetico')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'arquivoMagnetico'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            Arquivo Magnético TXT SIARE
          </button>
          <button
            onClick={() => setActiveTab('espelhoA4')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'espelhoA4'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            Espelho Oficial DAPI A4
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-5 flex-1">
        {/* ABA 1: APURAÇÃO MODELO 01 */}
        {activeTab === 'apuracao' && q && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quadro II - Entradas */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#2d2d2d]">
                <div className="text-xs font-bold text-white flex items-center gap-2 mb-3 pb-2 border-b border-[#2d2d2d]">
                  <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                  QUADRO II - ENTRADAS DO PERÍODO
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-[#202020] rounded">
                    <span className="text-gray-400">Valor Contábil Total:</span>
                    <span className="font-mono text-white font-semibold">R$ {q.quadro02Entradas.valorContabilTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#202020] rounded">
                    <span className="text-gray-400">Base de Cálculo ICMS:</span>
                    <span className="font-mono text-white">R$ {q.quadro02Entradas.baseCalculoIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-950/30 border border-emerald-800/40 rounded">
                    <span className="text-emerald-300 font-semibold">Imposto Creditado:</span>
                    <span className="font-mono text-emerald-400 font-bold">R$ {q.quadro02Entradas.impostoCreditado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#202020] rounded">
                    <span className="text-gray-400">Isentas ou Não Tributadas:</span>
                    <span className="font-mono text-gray-300">R$ {q.quadro02Entradas.isentasNaoTributadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#202020] rounded">
                    <span className="text-gray-400">Outras Entradas:</span>
                    <span className="font-mono text-gray-300">R$ {q.quadro02Entradas.outrasEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Quadro III - Saídas */}
              <div className="bg-[#181818] p-4 rounded-xl border border-[#2d2d2d]">
                <div className="text-xs font-bold text-white flex items-center gap-2 mb-3 pb-2 border-b border-[#2d2d2d]">
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                  QUADRO III - SAÍDAS DO PERÍODO
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-[#202020] rounded">
                    <span className="text-gray-400">Valor Contábil Total:</span>
                    <span className="font-mono text-white font-semibold">R$ {q.quadro03Saidas.valorContabilTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#202020] rounded">
                    <span className="text-gray-400">Base de Cálculo ICMS:</span>
                    <span className="font-mono text-white">R$ {q.quadro03Saidas.baseCalculoIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-rose-950/30 border border-rose-800/40 rounded">
                    <span className="text-rose-300 font-semibold">Imposto Debitado:</span>
                    <span className="font-mono text-rose-400 font-bold">R$ {q.quadro03Saidas.impostoDebitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#202020] rounded">
                    <span className="text-gray-400">Isentas ou Não Tributadas:</span>
                    <span className="font-mono text-gray-300">R$ {q.quadro03Saidas.isentasNaoTributadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#202020] rounded">
                    <span className="text-gray-400">Outras Saídas:</span>
                    <span className="font-mono text-gray-300">R$ {q.quadro03Saidas.outrasSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quadro IV - Apuração do Imposto */}
            <div className="bg-[#181818] p-5 rounded-xl border border-[#2d2d2d]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-rose-400" />
                  QUADRO IV - DEMONSTRATIVO DE APURAÇÃO DO IMPOSTO & DAE MINAS GERAIS
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGerarArquivoTxt}
                    className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 rounded text-xs border border-[#383838] flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-rose-400" />
                    Gerar Arquivo SIARE
                  </button>
                  <button
                    onClick={handleIntegrarContabil}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Integrar no Diário Geral
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Coluna Débitos */}
                <div className="space-y-2 bg-[#202020] p-3 rounded-lg border border-[#2e2e2e]">
                  <span className="font-semibold text-rose-400 block mb-1">DÉBITOS DO IMPOSTO:</span>
                  <div className="flex justify-between">
                    <span className="text-gray-400">01 - Pelas Saídas:</span>
                    <span className="font-mono text-white">R$ {q.quadro04Apuracao.totalDebitosSaidas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">02 - Outros Débitos:</span>
                    <span className="font-mono text-white">R$ {q.quadro04Apuracao.outrosDebitos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">03 - Estornos de Créditos:</span>
                    <span className="font-mono text-white">R$ {q.quadro04Apuracao.estornoCreditos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#333333] font-bold text-rose-400">
                    <span>(=) TOTAL DE DÉBITOS:</span>
                    <span className="font-mono">R$ {(q.quadro04Apuracao.totalDebitosSaidas + q.quadro04Apuracao.outrosDebitos + q.quadro04Apuracao.estornoCreditos).toFixed(2)}</span>
                  </div>
                </div>

                {/* Coluna Créditos */}
                <div className="space-y-2 bg-[#202020] p-3 rounded-lg border border-[#2e2e2e]">
                  <span className="font-semibold text-emerald-400 block mb-1">CRÉDITOS DO IMPOSTO:</span>
                  <div className="flex justify-between">
                    <span className="text-gray-400">04 - Pelas Entradas:</span>
                    <span className="font-mono text-white">R$ {q.quadro04Apuracao.totalCreditosEntradas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">66 - Outros Créditos:</span>
                    <span className="font-mono text-emerald-400">R$ {q.quadro04Apuracao.outrosCreditosCpo66.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">73 - Estornos de Débitos:</span>
                    <span className="font-mono text-white">R$ {q.quadro04Apuracao.estornoDebitosCpo73.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo Período Anterior:</span>
                    <span className="font-mono text-white">R$ {q.quadro04Apuracao.saldoCredorPeriodoAnterior.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#333333] font-bold text-emerald-400">
                    <span>(=) TOTAL DE CRÉDITOS:</span>
                    <span className="font-mono">R$ {(q.quadro04Apuracao.totalCreditosEntradas + q.quadro04Apuracao.outrosCreditosCpo66 + q.quadro04Apuracao.estornoDebitosCpo73 + q.quadro04Apuracao.saldoCredorPeriodoAnterior).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Totalizadores de Guia DAE */}
              <div className="mt-4 p-4 bg-[#232323] rounded-lg border border-[#333333] flex flex-wrap justify-between items-center gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Saldo Devedor Apurado:</span>
                  <span className="font-mono text-base font-bold text-white">R$ {q.quadro04Apuracao.saldoDevedorApurado.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Deduções Campo 90:</span>
                  <span className="font-mono text-base font-bold text-amber-400">-R$ {q.quadro04Apuracao.deducoesIncentivosCpo90.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">ICMS ST Devido:</span>
                  <span className="font-mono text-base font-bold text-white">R$ {q.quadro04Apuracao.icmsStRecolher.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-right">
                  <span className="text-[10px] text-rose-300 uppercase font-bold block">TOTAL DAE-MG A RECOLHER:</span>
                  <span className="font-mono text-xl font-bold text-rose-400">
                    R$ {q.quadro04Apuracao.totalGeralDaeBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: DETALHAMENTO OUTROS CRÉDITOS */}
        {activeTab === 'outrosCreditos' && (
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-300">
                Itens de Ajustes da Apuração (Campos 66, 73, 90 e 98)
              </div>
              <button
                onClick={() => setModalAjuste(true)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold cursor-pointer"
              >
                + Adicionar Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="bg-[#222222] text-gray-400 font-medium border-b border-[#2d2d2d]">
                  <tr>
                    <th className="py-2.5 px-3">Campo DAPI</th>
                    <th className="py-2.5 px-3">Código Ajuste</th>
                    <th className="py-2.5 px-3">Descrição do Benefício / Ajuste</th>
                    <th className="py-2.5 px-3">Fundamento Legal (RICMS-MG)</th>
                    <th className="py-2.5 px-3 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {resumo?.declaracaoAtual.detalhesOutrosCreditos.map((it) => (
                    <tr key={it.id} className="hover:bg-[#202020] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2a2a2a] text-rose-300 border border-[#3a3a3a]">
                          {it.campoDapi}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-medium">{it.codigoAjuste}</td>
                      <td className="py-2.5 px-3 text-white font-medium">{it.descricao}</td>
                      <td className="py-2.5 px-3 text-gray-400">{it.dispositivoLegal}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {it.valorBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: ARQUIVO MAGNÉTICO TXT SIARE */}
        {activeTab === 'arquivoMagnetico' && (
          <div className="space-y-4">
            <div className="bg-[#181818] p-4 rounded-xl border border-[#2d2d2d] flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-rose-400" />
                  Arquivo Magnético DAPI-MG Modelo 1 (Layout SIARE)
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Geração de lote conforme Manual de Orientação do Contribuinte da SEF/MG
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGerarArquivoTxt}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Gerar Arquivo
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
              <pre>{arquivoTxt || '// Clique em "Gerar Arquivo" para compilar o lote magnético oficial da DAPI-MG.'}</pre>
            </div>
          </div>
        )}

        {/* ABA 4: ESPELHO OFICIAL DAPI A4 */}
        {activeTab === 'espelhoA4' && q && (
          <div className="flex justify-center">
            <div className="w-[210mm] bg-[#1a1a1a] text-gray-200 border border-[#333333] p-10 shadow-2xl rounded-sm text-xs">
              {/* Topo DAPI */}
              <div className="border-b-2 border-rose-500 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    DAPI - DEMONSTRATIVO DE APURAÇÃO E INFORMAÇÃO DO ICMS (MODELO 01)
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-1">
                    SECRETARIA DE ESTADO DE FAZENDA DE MINAS GERAIS • SIARE
                  </p>
                  <p className="text-[10px] text-rose-400 font-semibold mt-0.5">
                    RICMS-MG • Decreto Estadual nº 48.589/2023
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">EMPRESA MODELO MG S/A</div>
                  <div className="text-[10px] text-gray-400 font-mono">IE: {resumo?.declaracaoAtual.inscricaoEstadualMg}</div>
                  <div className="text-[10px] text-rose-400 font-mono mt-1">Competência: {competencia}</div>
                </div>
              </div>

              {/* Tabela do Espelho */}
              <div className="space-y-4 mb-6">
                <div className="border border-gray-700 rounded p-3 bg-[#202020]">
                  <span className="font-bold text-white text-xs block mb-2">1. QUADRO II - ENTRADAS</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>Valor Contábil: <strong className="text-white">R$ {q.quadro02Entradas.valorContabilTotal.toFixed(2)}</strong></div>
                    <div>Base Cálculo: <strong className="text-white">R$ {q.quadro02Entradas.baseCalculoIcms.toFixed(2)}</strong></div>
                    <div>Imposto Creditado: <strong className="text-emerald-400">R$ {q.quadro02Entradas.impostoCreditado.toFixed(2)}</strong></div>
                  </div>
                </div>

                <div className="border border-gray-700 rounded p-3 bg-[#202020]">
                  <span className="font-bold text-white text-xs block mb-2">2. QUADRO III - SAÍDAS</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>Valor Contábil: <strong className="text-white">R$ {q.quadro03Saidas.valorContabilTotal.toFixed(2)}</strong></div>
                    <div>Base Cálculo: <strong className="text-white">R$ {q.quadro03Saidas.baseCalculoIcms.toFixed(2)}</strong></div>
                    <div>Imposto Debitado: <strong className="text-rose-400">R$ {q.quadro03Saidas.impostoDebitado.toFixed(2)}</strong></div>
                  </div>
                </div>

                <div className="border border-gray-700 rounded p-3 bg-[#202020]">
                  <span className="font-bold text-white text-xs block mb-2">3. QUADRO IV - APURAÇÃO FINAL & GUIAS</span>
                  <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div className="space-y-1">
                      <div>Total Débitos: <strong>R$ {(q.quadro04Apuracao.totalDebitosSaidas + q.quadro04Apuracao.estornoCreditos).toFixed(2)}</strong></div>
                      <div>Total Créditos: <strong>R$ {(q.quadro04Apuracao.totalCreditosEntradas + q.quadro04Apuracao.outrosCreditosCpo66 + q.quadro04Apuracao.saldoCredorPeriodoAnterior).toFixed(2)}</strong></div>
                      <div>Saldo Devedor: <strong>R$ {q.quadro04Apuracao.saldoDevedorApurado.toFixed(2)}</strong></div>
                    </div>
                    <div className="space-y-1">
                      <div>DAE 313-1 (ICMS Normal): <strong className="text-rose-400">R$ {q.quadro04Apuracao.icmsNormalRecolher.toFixed(2)}</strong></div>
                      <div>DAE 317-0 (ICMS ST): <strong className="text-rose-400">R$ {q.quadro04Apuracao.icmsStRecolher.toFixed(2)}</strong></div>
                      <div>Total Geral DAE: <strong className="text-rose-400 text-sm">R$ {q.quadro04Apuracao.totalGeralDaeBRL.toFixed(2)}</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assinaturas */}
              <div className="mt-12 pt-8 border-t border-[#333333] grid grid-cols-2 gap-12 text-center text-[10px] text-gray-400">
                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    DIRETORIA ADMINISTRATIVA / TRIBUTÁRIA
                  </div>
                  <div>Contribuinte Responsável MG</div>
                </div>

                <div>
                  <div className="border-b border-gray-500 pb-1 w-3/4 mx-auto mb-1 text-white font-medium">
                    CONTADOR RESPONSÁVEL TÉCNICO
                  </div>
                  <div>CRC 1MG999999/O-0</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO AJUSTE / CRÉDITO */}
      {modalAjuste && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1c] border border-[#333333] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              Lançar Ajuste na DAPI-MG (Outros Créditos / Deduções)
            </h3>

            <form onSubmit={handleSalvarAjuste} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Campo da DAPI:</label>
                <select
                  value={formCampo}
                  onChange={(e) => setFormCampo(e.target.value as any)}
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="66_OUTROS_CREDITOS">Campo 66 - Outros Créditos</option>
                  <option value="73_ESTORNO_DEBITOS">Campo 73 - Estorno de Débitos</option>
                  <option value="90_DEDUCOES_INCENTIVOS">Campo 90 - Deduções / Incentivo Esporte</option>
                  <option value="98_COMPENSACOES_CREDITOS">Campo 98 - Compensações de Créditos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Código Ajuste SEF/MG:</label>
                  <input
                    type="text"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    placeholder="MG020002"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Valor (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValor}
                    onChange={(e) => setFormValor(Number(e.target.value))}
                    min="0"
                    required
                    className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descrição do Ajuste / Benefício:</label>
                <input
                  type="text"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Crédito presumido setorial confecção"
                  required
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Fundamento Legal (RICMS-MG):</label>
                <input
                  type="text"
                  value={formDispositivo}
                  onChange={(e) => setFormDispositivo(e.target.value)}
                  placeholder="Art. 75, Anexo VIII"
                  className="w-full bg-[#252525] border border-[#383838] rounded p-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => setModalAjuste(false)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
