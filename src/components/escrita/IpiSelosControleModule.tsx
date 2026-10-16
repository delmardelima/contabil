import React, { useState, useEffect } from 'react';
import {
  Factory,
  Boxes,
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
  ShieldCheck,
  Tag,
  History
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoApuracaoIpiSelos,
  ApuracaoIpiModelo8,
  ItemSeloControle,
  MovimentoSeloControle,
  TipoProdutoSeloIpi,
  TipoMovimentacaoSelo
} from '../../types/contabil';

export const IpiSelosControleModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [resumo, setResumo] = useState<ResumoApuracaoIpiSelos | null>(null);
  const [activeTab, setActiveTab] = useState<'livroModelo8' | 'selosControle' | 'movimentacoesSelos' | 'espelhoLivroA4'>('livroModelo8');
  const [busca, setBusca] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal Novo Movimento de Selo
  const [modalNovoMovimento, setModalNovoMovimento] = useState<boolean>(false);
  const [formSeloId, setFormSeloId] = useState<string>('');
  const [formTipoMov, setFormTipoMov] = useState<TipoMovimentacaoSelo>('SAIDA_APLICACAO_PRODUCAO');
  const [formGuia, setFormGuia] = useState<string>('');
  const [formSerie, setFormSerie] = useState<string>('WH-MG-2026');
  const [formNumIni, setFormNumIni] = useState<number>(120001);
  const [formNumFim, setFormNumFim] = useState<number>(122000);
  const [formQtd, setFormQtd] = useState<number>(2000);
  const [formObs, setFormObs] = useState<string>('Aplicação na linha de envase');

  const carregarDados = () => {
    const dados = dbService.getApuracaoIpiSelos(empresaId, competencia);
    setResumo(dados);
    if (dados.selos.length > 0 && !formSeloId) {
      setFormSeloId(dados.selos[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [competencia, empresaId]);

  const handleIntegrarContabil = () => {
    if (!resumo?.apuracao) return;
    const res = dbService.integrarIpiModelo8Contabil(resumo.apuracao.id);
    if (res.sucesso) {
      setNotificacao({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    } else {
      setNotificacao({ tipo: 'erro', texto: res.mensagem });
    }
  };

  const handleSalvarMovimentoSelo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSeloId) {
      setNotificacao({ tipo: 'erro', texto: 'Selecione o produto de selo correspondente.' });
      return;
    }

    const mov: MovimentoSeloControle = {
      id: `mov-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      tipoMovimentacao: formTipoMov,
      numeroDocumentoGuia: formGuia || `DOC-${Date.now().toString().slice(-4)}`,
      serieSelo: formSerie,
      numeroInicial: formNumIni,
      numeroFinal: formNumFim,
      quantidade: formQtd,
      observacoes: formObs
    };

    const res = dbService.lancarMovimentoSelo(formSeloId, mov);
    if (res.sucesso) {
      setNotificacao({ tipo: 'sucesso', texto: res.mensagem });
      setModalNovoMovimento(false);
      setFormGuia('');
      carregarDados();
    } else {
      setNotificacao({ tipo: 'erro', texto: res.mensagem });
    }
  };

  const apur = resumo?.apuracao;
  const selosFiltrados = resumo?.selos.filter(s =>
    s.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    s.codigoProduto.toLowerCase().includes(busca.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-neutral-200 select-none">
      {/* Banner de Notificação */}
      {notificacao && (
        <div
          className={`flex items-center justify-between px-4 py-2 text-xs font-medium border-b animate-in fade-in duration-200 ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notificacao.tipo === 'sucesso' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{notificacao.texto}</span>
          </div>
          <button
            onClick={() => setNotificacao(null)}
            className="hover:opacity-75 transition-opacity px-2 py-0.5 rounded text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cabeçalho Superior Fluent Dark */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#181818]/90 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Factory size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-neutral-100 tracking-tight">
                Apuração do IPI & Selos de Controle (Livro Modelo 8)
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-orange-500/10 border border-orange-500/30 text-orange-300 rounded">
                Dec. nº 7.212/2010 (RIPI) & IN RFB nº 1.436
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Livro Registro de Apuração do IPI Modelo 8 e controle físico de selos (bebidas/cigarros) com numeração de série
            </p>
          </div>
        </div>

        {/* Controles de Competência e Ações */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-neutral-400 font-medium">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={carregarDados}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#252525] border border-white/10 text-neutral-300 hover:bg-[#2c2c2c] hover:text-white transition-all"
            title="Recarregar Dados"
          >
            <RefreshCw size={14} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => setModalNovoMovimento(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-950/50 transition-all"
          >
            <Plus size={14} />
            <span>Movimentar Selos</span>
          </button>

          <button
            onClick={handleIntegrarContabil}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50 transition-all"
            title="Integrar Apuração do IPI no Diário Geral"
          >
            <FileCheck2 size={14} />
            <span>Integrar Diário</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas e Totais Oficiais */}
      <div className="grid grid-cols-6 gap-3 p-4 border-b border-white/5 bg-[#141414]">
        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Débitos Saídas</span>
            <DollarSign size={14} className="text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 font-mono">
            R$ {(apur?.totalDebitosSaidas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">IPI destacado nas NF-e</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Créditos Entradas</span>
            <Receipt size={14} className="text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            R$ {(apur?.totalCreditosEntradas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Matérias-primas e insumos</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Outros Créditos</span>
            <Tag size={14} className="text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-400 font-mono">
            R$ {(apur?.outrosCreditos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Ressarcimento Selos Art. 312</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">IPI a Recolher</span>
            <Building2 size={14} className="text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            R$ {(apur?.saldoDevedorRecolher || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">DARF Código {apur?.codigoReceitaDarf || '5123'}</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Selos em Estoque</span>
            <Boxes size={14} className="text-orange-400" />
          </div>
          <div className="text-lg font-bold text-orange-400 font-mono">
            {(resumo?.totalSelosDisponiveis || 0).toLocaleString('pt-BR')} un
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Saldo físico em almoxarifado</div>
        </div>

        <div className="p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Selos Aplicados</span>
            <ShieldCheck size={14} className="text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-300 font-mono">
            {(resumo?.totalSelosAplicados || 0).toLocaleString('pt-BR')} un
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Avarias: {resumo?.totalAvarias || 0} un</div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex items-center justify-between px-5 pt-2 border-b border-white/10 bg-[#161616]">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('livroModelo8')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'livroModelo8'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Factory size={14} />
            <span>Livro Registro Modelo 8</span>
          </button>

          <button
            onClick={() => setActiveTab('selosControle')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'selosControle'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Tag size={14} />
            <span>Estoque de Selos de Controle</span>
          </button>

          <button
            onClick={() => setActiveTab('movimentacoesSelos')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'movimentacoesSelos'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <History size={14} />
            <span>Histórico de Lotes & Séries</span>
          </button>

          <button
            onClick={() => setActiveTab('espelhoLivroA4')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'espelhoLivroA4'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <Printer size={14} />
            <span>Espelho Oficial Livro Modelo 8 A4</span>
          </button>
        </div>

        {/* Busca */}
        <div className="flex items-center space-x-2 bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1 mb-1">
          <Search size={13} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar produto ou selo..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="bg-transparent text-xs text-neutral-200 focus:outline-none w-56 placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto p-5">
        {activeTab === 'livroModelo8' && apur && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Quadro de Apuração do IPI (Livro nº {apur.numeroLivro} - Folhas {apur.folhaInicial} a {apur.folhaFinal})
                </h2>
                <p className="text-xs text-neutral-400">
                  Demonstração cronológica dos débitos, créditos, estornos e saldo a recolher conforme Decreto nº 7.212/2010
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                apur.status === 'INTEGRADA_CONTABILIDADE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {apur.status === 'INTEGRADA_CONTABILIDADE' ? '✓ Integrada no Diário' : '● Apuração Fechada'}
              </span>
            </div>

            {/* Grid dos Quadros de Débito e Crédito */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quadro 1: Débitos do IPI */}
              <div className="p-4 rounded-xl border border-white/10 bg-[#181818] space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-semibold text-neutral-100 text-xs uppercase tracking-wider text-rose-400">
                    01. Débitos do Imposto (Saídas)
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-400">
                    R$ {apur.totalGeralDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-[#202020]">
                    <span className="text-neutral-300">001 - Pelo faturamento de produtos tributados</span>
                    <span className="font-mono text-neutral-100">R$ {apur.totalDebitosSaidas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-[#202020]">
                    <span className="text-neutral-300">002 - Outros Débitos</span>
                    <span className="font-mono text-neutral-100">R$ {apur.outrosDebitos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-[#202020]">
                    <span className="text-neutral-300">003 - Estorno de Créditos</span>
                    <span className="font-mono text-neutral-100">R$ {apur.estornoCreditos.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Quadro 2: Créditos do IPI */}
              <div className="p-4 rounded-xl border border-white/10 bg-[#181818] space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-semibold text-neutral-100 text-xs uppercase tracking-wider text-emerald-400">
                    02. Créditos do Imposto (Entradas)
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    R$ {apur.totalGeralCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-[#202020]">
                    <span className="text-neutral-300">101 - Por entradas de insumos e matérias-primas</span>
                    <span className="font-mono text-neutral-100">R$ {apur.totalCreditosEntradas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-[#202020]">
                    <span className="text-neutral-300">102 - Outros Créditos / Ressarcimento de Selos (Art. 312)</span>
                    <span className="font-mono text-cyan-300">R$ {apur.outrosCreditos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-[#202020]">
                    <span className="text-neutral-300">103 - Saldo Credor do Período Anterior</span>
                    <span className="font-mono text-neutral-100">R$ {apur.saldoCredorAnterior.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Totalizadores e DARF */}
            <div className="p-4 rounded-xl border border-white/10 bg-[#161616] flex justify-between items-center">
              <div>
                <span className="text-xs text-neutral-400 block">Confronto Débitos x Créditos:</span>
                <span className="text-sm font-semibold text-neutral-200">
                  R$ {apur.totalGeralDebitos.toFixed(2)} (Déb.) - R$ {apur.totalGeralCreditos.toFixed(2)} (Créd.)
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-amber-400 uppercase font-bold block">Saldo Devedor a Recolher (DARF 5123)</span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  R$ {apur.saldoDevedorRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-neutral-500 block mt-0.5">Vencimento Legal: {apur.vencimentoDarf}</span>
              </div>
            </div>

            {/* Itens e Detalhamentos da Apuração */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-white/10 font-semibold">
                    <th className="py-2.5 px-3 w-24">Natureza</th>
                    <th className="py-2.5 px-3 w-20">Ajuste</th>
                    <th className="py-2.5 px-3">Discriminação do Lançamento</th>
                    <th className="py-2.5 px-3 text-right w-36">Base de Cálculo</th>
                    <th className="py-2.5 px-3 text-center w-20">Alíquota</th>
                    <th className="py-2.5 px-3 text-right w-36">Valor do IPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {apur.itens.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          item.natureza === 'DEBITO' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {item.natureza}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400">{item.codigoAjuste}</td>
                      <td className="py-2.5 px-3 text-neutral-200">{item.descricao}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                        R$ {item.baseCalculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-400">{item.aliquota}%</td>
                      <td className={`py-2.5 px-3 text-right font-mono font-semibold ${
                        item.natureza === 'DEBITO' ? 'text-rose-400' : 'text-emerald-400'
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

        {activeTab === 'selosControle' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Estoque e Controle Físico de Selos de Controle (Arts. 284 a 312 do RIPI)
                </h2>
                <p className="text-xs text-neutral-400">
                  Gestão quantitativa de selos por produto, cor e controle de saldo em almoxarifado
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {selosFiltrados.map(selo => (
                <div key={selo.id} className="p-4 rounded-xl border border-white/10 bg-[#181818] space-y-3">
                  <div className="flex items-start justify-between border-b border-white/10 pb-2">
                    <div>
                      <span className="font-semibold text-neutral-100 text-sm block">{selo.descricao}</span>
                      <span className="text-[11px] font-mono text-neutral-500">{selo.codigoProduto}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {selo.corSelo}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Saldo Inicial:</span>
                      <span className="font-mono text-neutral-200">{selo.saldoInicial.toLocaleString('pt-BR')} un</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>(+) Entradas no Mês:</span>
                      <span className="font-mono font-medium">+{selo.entradasMes.toLocaleString('pt-BR')} un</span>
                    </div>
                    <div className="flex justify-between text-teal-400">
                      <span>(-) Saídas p/ Produção:</span>
                      <span className="font-mono font-medium">-{selo.saidasAplicacao.toLocaleString('pt-BR')} un</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>(-) Perdas / Quebras:</span>
                      <span className="font-mono font-medium">-{selo.perdasAvarias.toLocaleString('pt-BR')} un</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-neutral-100">
                      <span>Saldo Final em Estoque:</span>
                      <span className="font-mono text-orange-400">{selo.saldoFinal.toLocaleString('pt-BR')} un</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFormSeloId(selo.id);
                      setModalNovoMovimento(true);
                    }}
                    className="w-full mt-2 py-1.5 text-xs font-medium rounded-lg bg-[#252525] border border-white/10 hover:bg-[#2c2c2c] text-neutral-300 transition-all text-center"
                  >
                    Movimentar Este Selo
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'movimentacoesSelos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Histórico de Séries e Numerações Movimentadas
                </h2>
                <p className="text-xs text-neutral-400">
                  Rastreabilidade integral das guias de requisição RFB e ordens de produção com faixas numéricas de selos
                </p>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-white/10 font-semibold">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Tipo de Movimentação</th>
                    <th className="py-2.5 px-3">Documento / Guia</th>
                    <th className="py-2.5 px-3">Série do Selo</th>
                    <th className="py-2.5 px-3 text-center">Faixa Numérica (Inicial - Final)</th>
                    <th className="py-2.5 px-3 text-right">Quantidade</th>
                    <th className="py-2.5 px-3">Observações / Destinação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {resumo?.selos.flatMap(s => s.movimentacoes.map(m => ({ ...m, produtoDesc: s.descricao }))).map(mov => (
                    <tr key={mov.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-neutral-300">{mov.data}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          mov.tipoMovimentacao === 'ENTRADA_REQUISICAO_RFB' ? 'bg-emerald-500/10 text-emerald-400' :
                          mov.tipoMovimentacao === 'SAIDA_APLICACAO_PRODUCAO' ? 'bg-teal-500/10 text-teal-300' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {mov.tipoMovimentacao}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-200">{mov.numeroDocumentoGuia}</td>
                      <td className="py-2.5 px-3 font-mono text-orange-400 font-semibold">{mov.serieSelo}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-300">
                        {mov.numeroInicial.toLocaleString('pt-BR')} até {mov.numeroFinal.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-100">
                        {mov.quantidade.toLocaleString('pt-BR')} un
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400 text-[11px]">{mov.observacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'espelhoLivroA4' && apur && (
          <div className="max-w-4xl mx-auto p-8 rounded-xl bg-white text-neutral-900 shadow-2xl border border-neutral-300 print:m-0 print:p-0">
            {/* Cabeçalho do Livro Modelo 8 */}
            <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  LIVRO REGISTRO DE APURAÇÃO DO IPI (MODELO 8)
                </h1>
                <p className="text-xs text-neutral-600 font-semibold uppercase">
                  EMPRESA MATRIZ EXEMPLO LTDA - CNPJ: 12.345.678/0001-90
                </p>
                <p className="text-[11px] text-neutral-500">
                  Emitido em conformidade com o Decreto Federal nº 7.212/2010 (RIPI) e Resolução CFC
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-neutral-100 px-3 py-1 rounded border border-neutral-300">
                  LIVRO Nº {apur.numeroLivro} | FL. {apur.folhaInicial} A {apur.folhaFinal}
                </span>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">Competência: {competencia}</p>
              </div>
            </div>

            {/* Quadro Débitos e Créditos A4 */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="border border-neutral-300 rounded p-3">
                <h3 className="font-bold text-xs uppercase text-neutral-800 border-b border-neutral-300 pb-1 mb-2">
                  ENTRADAS E CRÉDITOS DO PERÍODO
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Crédito s/ Compras Insumos:</span>
                    <span className="font-mono">R$ {apur.totalCreditosEntradas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outros Créditos / Ressarcimento Selos:</span>
                    <span className="font-mono">R$ {apur.outrosCreditos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo Credor Anterior:</span>
                    <span className="font-mono">R$ {apur.saldoCredorAnterior.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-neutral-300 pt-1 text-emerald-800">
                    <span>Total dos Créditos:</span>
                    <span className="font-mono">R$ {apur.totalGeralCreditos.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-300 rounded p-3">
                <h3 className="font-bold text-xs uppercase text-neutral-800 border-b border-neutral-300 pb-1 mb-2">
                  SAÍDAS E DÉBITOS DO PERÍODO
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Débito por Saídas Faturamento:</span>
                    <span className="font-mono">R$ {apur.totalDebitosSaidas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outros Débitos:</span>
                    <span className="font-mono">R$ {apur.outrosDebitos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estorno de Créditos:</span>
                    <span className="font-mono">R$ {apur.estornoCreditos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-neutral-300 pt-1 text-rose-800">
                    <span>Total dos Débitos:</span>
                    <span className="font-mono">R$ {apur.totalGeralDebitos.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Apuração do Saldo e Recolhimento */}
            <div className="p-4 bg-neutral-100 rounded border border-neutral-300 flex justify-between items-center mb-6">
              <div>
                <span className="text-xs text-neutral-600 block font-semibold">GUIA DE RECOLHIMENTO DARF:</span>
                <span className="text-sm font-bold text-neutral-900">Código de Receita: {apur.codigoReceitaDarf} (IPI Demais Mercadorias)</span>
                <span className="text-[11px] text-neutral-500 block">Vencimento: {apur.vencimentoDarf}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-600 block uppercase font-bold">Imposto a Recolher</span>
                <span className="text-2xl font-bold font-mono text-neutral-900">
                  R$ {apur.saldoDevedorRecolher.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quadro de Selos de Controle A4 */}
            <h3 className="font-bold text-xs uppercase text-neutral-800 border-b border-neutral-400 pb-1 mb-2">
              Resumo do Estoque Físico de Selos de Controle (Art. 310 RIPI)
            </h3>
            <table className="w-full text-left text-[11px] border border-neutral-300 border-collapse mb-8">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 font-bold">
                  <th className="p-1.5">Produto Sujeito a Selo</th>
                  <th className="p-1.5">Cor / Padrão</th>
                  <th className="p-1.5 text-right">Saldo Inicial</th>
                  <th className="p-1.5 text-right">Entradas</th>
                  <th className="p-1.5 text-right">Aplicados</th>
                  <th className="p-1.5 text-right">Avarias</th>
                  <th className="p-1.5 text-right">Saldo Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {resumo?.selos.map(s => (
                  <tr key={s.id}>
                    <td className="p-1.5 font-medium">{s.descricao}</td>
                    <td className="p-1.5">{s.corSelo}</td>
                    <td className="p-1.5 text-right font-mono">{s.saldoInicial.toLocaleString('pt-BR')}</td>
                    <td className="p-1.5 text-right font-mono text-emerald-700">+{s.entradasMes.toLocaleString('pt-BR')}</td>
                    <td className="p-1.5 text-right font-mono text-teal-700">-{s.saidasAplicacao.toLocaleString('pt-BR')}</td>
                    <td className="p-1.5 text-right font-mono text-rose-700">-{s.perdasAvarias.toLocaleString('pt-BR')}</td>
                    <td className="p-1.5 text-right font-mono font-bold">{s.saldoFinal.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Termo de Encerramento e Assinaturas */}
            <div className="border-t-2 border-neutral-800 pt-6">
              <p className="text-[10px] text-neutral-500 mb-6 text-justify">
                Termo de Encerramento: O presente período de apuração mensal do IPI contém os registros fiscais e de movimentação de selos autênticos do estabelecimento industrial, encerrado em {apur.dataEncerramento}.
              </p>
              <div className="flex justify-between items-end text-xs text-neutral-800">
                <div className="border-t border-neutral-600 w-64 text-center pt-1">
                  Administrador Responsável
                </div>
                <div className="border-t border-neutral-600 w-72 text-center pt-1">
                  Contador Responsável - CRC/MG
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Movimentação de Selos */}
      {modalNovoMovimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 text-neutral-200">
            <h3 className="text-base font-semibold text-neutral-100 mb-1">Lançar Movimentação de Selo de Controle</h3>
            <p className="text-xs text-neutral-400 mb-4">Registro de requisição, aplicação industrial ou avarias com faixas numéricas</p>

            <form onSubmit={handleSalvarMovimentoSelo} className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-300 mb-1">Produto / Selo</label>
                <select
                  value={formSeloId}
                  onChange={e => setFormSeloId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-orange-500"
                >
                  {resumo?.selos.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.descricao} ({s.corSelo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Tipo de Movimentação</label>
                  <select
                    value={formTipoMov}
                    onChange={e => setFormTipoMov(e.target.value as TipoMovimentacaoSelo)}
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="SAIDA_APLICACAO_PRODUCAO">Aplicação na Produção</option>
                    <option value="ENTRADA_REQUISICAO_RFB">Entrada por Requisição RFB</option>
                    <option value="PERDA_AVARIA_QUEBRA">Avaria / Quebra / Perda</option>
                    <option value="DEVOLUCAO_INUTILIZACAO">Devolução à RFB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Documento / Guia</label>
                  <input
                    type="text"
                    required
                    value={formGuia}
                    onChange={e => setFormGuia(e.target.value)}
                    placeholder="OP-2026-099 ou GRF-01"
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Série do Selo</label>
                  <input
                    type="text"
                    required
                    value={formSerie}
                    onChange={e => setFormSerie(e.target.value)}
                    placeholder="WH-MG-2026"
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Nº Inicial</label>
                  <input
                    type="number"
                    required
                    value={formNumIni}
                    onChange={e => {
                      const ini = Number(e.target.value);
                      setFormNumIni(ini);
                      setFormNumFim(ini + formQtd - 1);
                    }}
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Quantidade</label>
                  <input
                    type="number"
                    required
                    value={formQtd}
                    onChange={e => {
                      const qtd = Number(e.target.value);
                      setFormQtd(qtd);
                      setFormNumFim(formNumIni + qtd - 1);
                    }}
                    className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Observações e Lote</label>
                <input
                  type="text"
                  value={formObs}
                  onChange={e => setFormObs(e.target.value)}
                  placeholder="Ex: Envase Lote 2026-X"
                  className="w-full text-xs p-2.5 rounded-lg bg-[#202020] border border-white/10 text-neutral-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalNovoMovimento(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-700/50 hover:bg-neutral-700 text-neutral-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
