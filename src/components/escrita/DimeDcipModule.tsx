import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Layers,
  Calculator,
  Download,
  Copy,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  Building2,
  Landmark,
  BadgeDollarSign
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { DeclaracaoDimeSc, ItemDcip, TipoDcip } from '../../types/contabil';

export const DimeDcipModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [dime, setDime] = useState<DeclaracaoDimeSc | null>(null);
  const [activeTab, setActiveTab] = useState<'quadros' | 'dcip' | 'arquivoTxt' | 'espelhoA4'>('quadros');

  // Modal Novo DCIP
  const [modalNovoDcip, setModalNovoDcip] = useState<boolean>(false);
  const [formTipoDcip, setFormTipoDcip] = useState<TipoDcip>('TTD_409_IMPORTACAO');
  const [formNumeroDcip, setFormNumeroDcip] = useState<string>('');
  const [formCodigoBeneficio, setFormCodigoBeneficio] = useState<string>('SC800001');
  const [formDescricao, setFormDescricao] = useState<string>('');
  const [formValorCredito, setFormValorCredito] = useState<number>(0);
  const [formProcesso, setFormProcesso] = useState<string>('');

  // Notificações e Arquivo
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [conteudoTxt, setConteudoTxt] = useState<string>('');

  const carregarDados = () => {
    const dados = dbService.getDimeSc(empresaId, competencia);
    setDime(dados);
  };

  useEffect(() => {
    carregarDados();
  }, [competencia]);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSalvarDcip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescricao || formValorCredito <= 0) {
      exibirNotificacao('erro', 'Preencha a descrição e valor de crédito maior que zero.');
      return;
    }

    const res = dbService.salvarItemDcip({
      empresaId,
      competencia,
      tipoDcip: formTipoDcip,
      numeroDcip: formNumeroDcip || `DCIP-SC-${Date.now()}`,
      codigoBeneficio: formCodigoBeneficio,
      descricao: formDescricao,
      valorCreditoBRL: formValorCredito,
      processoAdministrativo: formProcesso
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovoDcip(false);
      setFormNumeroDcip('');
      setFormDescricao('');
      setFormValorCredito(0);
      setFormProcesso('');
      carregarDados();
    }
  };

  const handleExcluirDcip = (id: string) => {
    if (confirm('Deseja realmente excluir este demonstrativo de crédito DCIP?')) {
      const res = dbService.excluirItemDcip(id);
      if (res.sucesso) {
        exibirNotificacao('sucesso', res.mensagem);
        carregarDados();
      }
    }
  };

  const handleRecalcularApuracao = () => {
    const res = dbService.apurarDimeSc(empresaId, competencia);
    if (res.sucesso) {
      setDime(res.declaracao);
      exibirNotificacao('sucesso', res.mensagem);
    }
  };

  const handleGerarArquivoTxt = () => {
    const res = dbService.gerarArquivoDimeScTxt(empresaId, competencia);
    if (res.sucesso) {
      setConteudoTxt(res.arquivo);
      setActiveTab('arquivoTxt');
      exibirNotificacao('sucesso', res.mensagem);
    }
  };

  const handleIntegrarContabil = () => {
    if (!dime) return;
    const res = dbService.integrarDimeScContabil(dime.id);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    }
  };

  const copiarArquivoParaClipboard = () => {
    navigator.clipboard.writeText(conteudoTxt);
    exibirNotificacao('sucesso', 'Layout oficial copiado para a área de transferência.');
  };

  const baixarArquivoTxt = () => {
    const blob = new Blob([conteudoTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DIME_SC_${competencia.replace('-', '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    exibirNotificacao('sucesso', 'Arquivo magnético da DIME baixado com sucesso.');
  };

  return (
    <div className="h-full flex flex-col bg-[#121212] text-neutral-200">
      {/* 1. Header do Módulo */}
      <div className="p-4 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-wide">DIME-SC &amp; DCIP Eletrônica</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Portaria SEF 286/1995
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-neutral-800 text-neutral-300 border border-white/10">
                SAT / SEF-SC
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Declaração de ICMS e Movimento Econômico de Santa Catarina, controle de créditos prévios informados (DCIP), Fundo Social e DARE 1449
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-xs text-neutral-400 mr-2">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleRecalcularApuracao}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium border border-white/10 transition shadow-sm"
          >
            <RefreshCw size={15} />
            <span>Recalcular Quadros</span>
          </button>

          <button
            onClick={() => setModalNovoDcip(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Plus size={15} />
            <span>Novo DCIP</span>
          </button>

          <button
            onClick={handleGerarArquivoTxt}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <FileCode size={15} />
            <span>Gerar Arquivo SAT</span>
          </button>

          <button
            onClick={handleIntegrarContabil}
            disabled={dime?.integradoContabil}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${
              dime?.integradoContabil
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Landmark size={15} />
            <span>{dime?.integradoContabil ? 'Contabilizado' : 'Integrar no Diário'}</span>
          </button>
        </div>
      </div>

      {/* Notificação Toast */}
      {notificacao && (
        <div className={`p-3 text-xs font-medium border-b flex items-center justify-between transition-all ${
          notificacao.tipo === 'sucesso' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {notificacao.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notificacao.texto}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. KPIs dos Quadros da DIME */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-[#141414] border-b border-white/5">
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Quadro 02 - Débitos Totais</span>
            <Calculator size={15} className="text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">
            R$ {(dime?.quadro02.totalDebitosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Saídas próprias e transferências</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Quadro 03 - Créditos por Entradas</span>
            <ShieldCheck size={15} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            R$ {(dime?.quadro03.totalCreditosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Entradas + Saldo Credor Anterior</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Quadro 04 - Créditos Especiais DCIP</span>
            <BadgeDollarSign size={15} className="text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-400">
            R$ {(dime?.quadro04.totalCreditosPresumidosDcipBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-indigo-400/70 mt-1">Benefícios TTD 409 / Pró-Emprego</div>
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Quadro 09 - Saldo a Recolher</span>
            <Landmark size={15} className="text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300">
            R$ {(dime?.quadro09.impostoARecolherBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-300/70 mt-1">DARE 1449 com vencimento dia 10</div>
        </div>
      </div>

      {/* 3. Abas de Navegação */}
      <div className="px-4 border-b border-white/10 bg-[#161616] flex space-x-1">
        <button
          onClick={() => setActiveTab('quadros')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'quadros' ? 'border-emerald-500 text-emerald-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Estrutura dos Quadros DIME
        </button>
        <button
          onClick={() => setActiveTab('dcip')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'dcip' ? 'border-emerald-500 text-emerald-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Créditos Informados Previamente (DCIP)
        </button>
        <button
          onClick={() => setActiveTab('arquivoTxt')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'arquivoTxt' ? 'border-emerald-500 text-emerald-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Arquivo Magnético (.txt SAT)
        </button>
        <button
          onClick={() => setActiveTab('espelhoA4')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
            activeTab === 'espelhoA4' ? 'border-emerald-500 text-emerald-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Espelho Oficial DIME A4
        </button>
      </div>

      {/* 4. Conteúdo das Abas */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'quadros' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quadro 01: Dados Gerais e Movimento Econômico */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-2">
                <span>Quadro 01 - Resumo do Movimento Econômico</span>
                <span className="text-xs text-neutral-400 font-normal">Registro 20</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Faturamento Bruto Total:</span>
                  <span className="font-mono font-bold text-white">
                    R$ {(dime?.quadro01.faturamentoBrutoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Total de Entradas no Período:</span>
                  <span className="font-mono text-neutral-300">
                    R$ {(dime?.quadro01.entradasTotaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Total de Saídas no Período:</span>
                  <span className="font-mono text-neutral-300">
                    R$ {(dime?.quadro01.saidasTotaisBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Operações Tributadas com Alíquota Normal:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    R$ {(dime?.quadro01.totalOperacoesComTributacaoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quadro 02: Débitos do Imposto */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-2">
                <span>Quadro 02 - Discriminação dos Débitos</span>
                <span className="text-xs text-rose-400 font-normal">Registro 21</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Débito pelas Saídas Próprias:</span>
                  <span className="font-mono font-bold text-rose-300">
                    R$ {(dime?.quadro02.debitosSaidasPropriasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Outros Débitos / Ajustes:</span>
                  <span className="font-mono text-neutral-300">
                    R$ {(dime?.quadro02.outrosDebitosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Estorno de Créditos:</span>
                  <span className="font-mono text-neutral-300">
                    R$ {(dime?.quadro02.estornoCreditosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 font-bold text-rose-400">
                  <span>Total de Débitos:</span>
                  <span className="font-mono">
                    R$ {(dime?.quadro02.totalDebitosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quadro 03: Créditos do Imposto */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-2">
                <span>Quadro 03 - Discriminação dos Créditos</span>
                <span className="text-xs text-emerald-400 font-normal">Registro 22</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Créditos pelas Entradas:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    R$ {(dime?.quadro03.creditosEntradasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Saldo Credor do Mês Anterior:</span>
                  <span className="font-mono text-neutral-300">
                    R$ {(dime?.quadro03.saldoCredorPeriodoAnteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 font-bold text-emerald-400">
                  <span>Total de Créditos Básicos:</span>
                  <span className="font-mono">
                    R$ {(dime?.quadro03.totalCreditosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quadro 09 & 11: Apuração e DARE */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-2">
                <span>Quadro 09 &amp; 11 - Saldo e Guia DARE</span>
                <span className="text-xs text-amber-400 font-normal">Registros 29 / 31</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Dedução Créditos Especiais DCIP (Quadro 04):</span>
                  <span className="font-mono font-bold text-indigo-300">
                    - R$ {(dime?.quadro04.totalCreditosPresumidosDcipBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Saldo Apurado (Débitos - Créditos - DCIP):</span>
                  <span className="font-mono font-bold text-white">
                    R$ {(dime?.quadro09.saldoApuradoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">DARE Código 1449 (ICMS Normal):</span>
                  <span className="font-mono font-bold text-amber-400">
                    R$ {(dime?.quadro11.dareIcmsNormalBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 font-bold text-amber-300">
                  <span>DARE Código 1644 (Fundo Social SC 0,1%):</span>
                  <span className="font-mono">
                    R$ {(dime?.quadro11.dareFundoSocialBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 pt-1">
                  Vencimento do DARE: <strong>{dime?.quadro11.dataVencimento}</strong> (10º dia do mês subsequente)
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dcip' && (
          <div className="space-y-4">
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-[#202020] border-b border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-white">Demonstrativo de Créditos Informados Previamente (DCIP)</h3>
                  <p className="text-[11px] text-neutral-400">Benefícios fiscais vinculados ao Quadro 04 da DIME</p>
                </div>
                <button
                  onClick={() => setModalNovoDcip(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                >
                  Novo Crédito DCIP
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#242424] text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Número DCIP</th>
                      <th className="py-2.5 px-3">Tipo Benefício</th>
                      <th className="py-2.5 px-3">Código SAT</th>
                      <th className="py-2.5 px-3">Descrição do Incentivo</th>
                      <th className="py-2.5 px-3">Processo SEF/SC</th>
                      <th className="py-2.5 px-3 text-right">Valor do Crédito</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300">
                    {(dime?.quadro04.itensDcip || []).map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-white">{item.numeroDcip}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">{item.tipoDcip}</td>
                        <td className="py-2.5 px-3 font-mono text-neutral-400">{item.codigoBeneficio}</td>
                        <td className="py-2.5 px-3 max-w-xs truncate" title={item.descricao}>{item.descricao}</td>
                        <td className="py-2.5 px-3 font-mono text-neutral-400">{item.processoAdministrativo || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-300">
                          R$ {item.valorCreditoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleExcluirDcip(item.id)}
                            className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Remover DCIP"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'arquivoTxt' && (
          <div className="space-y-4">
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Arquivo Oficial da DIME-SC (Layout SAT-v2.0)</h3>
                  <p className="text-xs text-neutral-400">Arquivo posicional pronto para importação direta no validador da Secretaria da Fazenda de SC</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copiarArquivoParaClipboard}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium border border-white/10 transition"
                  >
                    <Copy size={14} />
                    <span>Copiar Texto</span>
                  </button>
                  <button
                    onClick={baixarArquivoTxt}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                  >
                    <Download size={14} />
                    <span>Baixar Arquivo SAT</span>
                  </button>
                </div>
              </div>

              <textarea
                value={conteudoTxt || 'Clique no botão "Gerar Arquivo SAT" acima para processar a declaração em formato magnético.'}
                readOnly
                rows={16}
                className="w-full font-mono text-xs bg-[#101010] border border-white/10 rounded-lg p-3 text-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'espelhoA4' && (
          <div className="max-w-4xl mx-auto bg-white text-neutral-900 p-8 rounded-xl shadow-2xl space-y-6">
            <div className="border-b-2 border-neutral-900 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">ESTADO DE SANTA CATARINA - SECRETARIA DE ESTADO DA FAZENDA</h1>
                <h2 className="text-sm font-semibold text-neutral-700">DIME - DECLARAÇÃO DE INFORMAÇÕES DO ICMS E MOVIMENTO ECONÔMICO</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Portaria SEF nº 286/1995 e Anexo 5 do RICMS/SC</p>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-neutral-800">COMPETÊNCIA: {competencia}</div>
                <div className="text-neutral-500">Versão Layout: {dime?.versaoLayout}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div>
                <div className="text-neutral-500">Contribuinte / Estabelecimento:</div>
                <div className="font-bold text-neutral-900">Amil Labs Indústria e Automação S/A</div>
              </div>
              <div>
                <div className="text-neutral-500">CNPJ / Inscrição Estadual (SC):</div>
                <div className="font-bold font-mono text-neutral-900">12.345.678/0001-90 | IE: 250.123.456</div>
              </div>
            </div>

            {/* Tabela dos Quadros */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-neutral-800 border-b border-neutral-300 pb-1 mb-2">QUADRO 02 - DÉBITOS DO IMPOSTO</h4>
                <div className="flex justify-between py-1">
                  <span>Item 01 - Débitos pelas Saídas Próprias:</span>
                  <span className="font-mono font-bold">R$ {(dime?.quadro02.debitosSaidasPropriasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-neutral-200 font-bold">
                  <span>TOTAL DE DÉBITOS (Quadro 02):</span>
                  <span className="font-mono">R$ {(dime?.quadro02.totalDebitosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-neutral-800 border-b border-neutral-300 pb-1 mb-2">QUADRO 03 - CRÉDITOS DO IMPOSTO</h4>
                <div className="flex justify-between py-1">
                  <span>Item 01 - Créditos pelas Entradas:</span>
                  <span className="font-mono">R$ {(dime?.quadro03.creditosEntradasBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Item 02 - Saldo Credor Anterior:</span>
                  <span className="font-mono">R$ {(dime?.quadro03.saldoCredorPeriodoAnteriorBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-neutral-200 font-bold">
                  <span>TOTAL DE CRÉDITOS BÁSICOS (Quadro 03):</span>
                  <span className="font-mono">R$ {(dime?.quadro03.totalCreditosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-neutral-800 border-b border-neutral-300 pb-1 mb-2">QUADRO 04 - CRÉDITOS ESPECIAIS E PRESUMIDOS (DCIP)</h4>
                {(dime?.quadro04.itensDcip || []).map(d => (
                  <div key={d.id} className="flex justify-between py-1">
                    <span>{d.descricao} ({d.numeroDcip}):</span>
                    <span className="font-mono">R$ {d.valorCreditoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 border-t border-neutral-200 font-bold">
                  <span>TOTAL CRÉDITOS ESPECIAIS DCIP:</span>
                  <span className="font-mono">R$ {(dime?.quadro04.totalCreditosPresumidosDcipBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-300">
                <div className="flex justify-between text-sm font-bold text-neutral-900">
                  <span>QUADRO 09 - IMPOSTO A RECOLHER (DARE 1449):</span>
                  <span className="font-mono">R$ {(dime?.quadro09.impostoARecolherBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-700 mt-1">
                  <span>QUADRO 11 - FUNDO SOCIAL SC (DARE 1644 - 0,1%):</span>
                  <span className="font-mono font-bold">R$ {(dime?.quadro11.dareFundoSocialBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-t border-neutral-400 pt-2 font-bold text-neutral-800">
                  Representante Legal da Empresa
                </div>
                <div className="text-neutral-500">CPF do Administrador</div>
              </div>
              <div>
                <div className="border-t border-neutral-400 pt-2 font-bold text-neutral-800">
                  Contabilista Responsável (CRC-SC)
                </div>
                <div className="text-neutral-500">CRC/SC nº 000.000/O</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo DCIP */}
      {modalNovoDcip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full p-6 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">Demonstrativo de Crédito Informado Previamente (DCIP)</h3>
            <p className="text-xs text-neutral-400 mb-4">Cadastre o benefício fiscal homologado para aproveitamento no Quadro 04 da DIME</p>

            <form onSubmit={handleSalvarDcip} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Tipo de Incentivo / Benefício Fiscal</label>
                <select
                  value={formTipoDcip}
                  onChange={(e) => setFormTipoDcip(e.target.value as TipoDcip)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="TTD_409_IMPORTACAO">TTD 409 - Importação Portos/Aeroportos de SC</option>
                  <option value="PRO_EMPREGO">Programa Pró-Emprego SC</option>
                  <option value="CREDITO_PRESUMIDO_AGRO">Crédito Presumido Agroindustrial SC</option>
                  <option value="CREDITO_ATIVO_PERMANENTE">Crédito de Ativo Permanente CIAP</option>
                  <option value="OUTROS_BENEFICIOS">Outros Benefícios Regulamentares SEF/SC</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Número do DCIP</label>
                  <input
                    type="text"
                    value={formNumeroDcip}
                    onChange={(e) => setFormNumeroDcip(e.target.value)}
                    placeholder="Ex: DCIP-SC-2026/00142"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Código do Benefício SAT</label>
                  <input
                    type="text"
                    value={formCodigoBeneficio}
                    onChange={(e) => setFormCodigoBeneficio(e.target.value)}
                    placeholder="Ex: SC800001"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Descrição do Incentivo</label>
                <input
                  type="text"
                  required
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: TTD 409 - Crédito Presumido na Importação Portuária"
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Valor do Crédito Presumido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formValorCredito}
                    onChange={(e) => setFormValorCredito(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Processo Administrativo SEF/SC</label>
                  <input
                    type="text"
                    value={formProcesso}
                    onChange={(e) => setFormProcesso(e.target.value)}
                    placeholder="Ex: SEF/SC 26.00984/2026"
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovoDcip(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg border border-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition"
                >
                  Homologar DCIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
