import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Printer, 
  QrCode, 
  Trash2, 
  DollarSign, 
  FileText, 
  Archive, 
  CheckCircle2, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import { 
  ItemInventarioPatrimonial, 
  BaixaAtivoImobilizado, 
  AtivoImobilizado, 
  Empresa 
} from '../../types/contabil';
import { ReportPrintPreviewModal } from '../layout/ReportPrintPreviewModal';

export const InventarioPatrimonioModule: React.FC = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [activeTab, setActiveTab] = useState<'INVENTARIO' | 'BAIXAS' | 'LEGAL'>('INVENTARIO');
  const [itensInventario, setItensInventario] = useState<ItemInventarioPatrimonial[]>([]);
  const [baixas, setBaixas] = useState<BaixaAtivoImobilizado[]>([]);
  const [ativos, setAtivos] = useState<AtivoImobilizado[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'info'; mensagem: string } | null>(null);

  // Modais de impressão
  const [showPrintTermoResponsabilidade, setShowPrintTermoResponsabilidade] = useState<boolean>(false);
  const [showPrintTermoBaixa, setShowPrintTermoBaixa] = useState<boolean>(false);
  const [selectedBaixa, setSelectedBaixa] = useState<BaixaAtivoImobilizado | null>(null);

  // Form de Nova Baixa
  const [novaBaixa, setNovaBaixa] = useState<{
    ativoId: number;
    dataBaixa: string;
    motivoBaixa: 'VENDA' | 'DESCARTE_SUCATEAMENTO' | 'PERDA_SINISTRO' | 'DOACAO';
    valorVendaAlienacao: number;
    numeroNotaFiscalVenda: string;
    serieNotaFiscalVenda: string;
    compradorNome: string;
    compradorCnpjCpf: string;
  }>({
    ativoId: 1,
    dataBaixa: new Date().toISOString().split('T')[0],
    motivoBaixa: 'VENDA',
    valorVendaAlienacao: 0,
    numeroNotaFiscalVenda: '',
    serieNotaFiscalVenda: '1',
    compradorNome: '',
    compradorCnpjCpf: ''
  });

  const carregarDados = () => {
    const emp = dbService.getActiveEmpresa() || dbService.getEmpresas()[0];
    setEmpresa(emp);
    if (emp) {
      setItensInventario(dbService.getItensInventarioPatrimonial(emp.id));
      setBaixas(dbService.getBaixasAtivos(emp.id));
      setAtivos(dbService.getAtivosImobilizados(emp.id));
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;

    const baixaRegistrada = dbService.registrarBaixaAtivo({
      empresaId: empresa.id,
      ...novaBaixa
    });

    setFeedback({
      tipo: 'success',
      mensagem: `Baixa do bem ${baixaRegistrada.codigoBem} registrada com sucesso! Resultado: ${baixaRegistrada.tipoResultado} de R$ ${baixaRegistrada.resultadoOperacao.toFixed(2)}. Lote #${baixaRegistrada.loteContabilId} gerado.`
    });

    carregarDados();
    setActiveTab('BAIXAS');
  };

  const formatarMoeda = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  const totalGanhos = baixas.filter(b => b.tipoResultado === 'GANHO_CAPITAL').reduce((acc, b) => acc + b.resultadoOperacao, 0);
  const totalPerdas = baixas.filter(b => b.tipoResultado === 'PERDA_CAPITAL').reduce((acc, b) => acc + Math.abs(b.resultadoOperacao), 0);

  const inventarioFiltrado = itensInventario.filter(i => 
    i.codigoPatrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.responsavelNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#141414] text-slate-100 overflow-y-auto font-sans p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Archive className="w-7 h-7 text-cyan-400" />
              Gestão Patrimonial, Inventário & Baixas de Ativos
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              CPC 27 / NBC TG 27
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Controle de Plaquetas com QR Code • Termos de Cautela & Responsabilidade • Apuração de Ganho/Perda de Capital na Alienação
          </p>
        </div>

        {/* Controles de Topo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">
              {empresa ? `${empresa.codigo} - ${empresa.razaoSocial}` : 'Selecionando...'}
            </span>
          </div>

          <button
            onClick={() => setShowPrintTermoResponsabilidade(true)}
            className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#2d2d2d] text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-[#333] transition"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            Termo de Cautela A4
          </button>
        </div>
      </div>

      {/* Alertas */}
      {feedback && (
        <div className={`mt-4 p-3.5 rounded-lg text-xs flex items-center justify-between border ${
          feedback.tipo === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
          feedback.tipo === 'error' ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' :
          'bg-blue-950/40 border-blue-500/30 text-blue-300'
        }`}>
          <span>{feedback.mensagem}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-6">
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Bens Tombados</span>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {itensInventario.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Plaquetas ativas</span>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Localizados no Inventário</span>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            {itensInventario.filter(i => i.situacaoInventario === 'LOCALIZADO').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">100% de conformidade física</span>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Alienações / Baixas</span>
          <div className="text-2xl font-bold text-slate-300 mt-2 font-mono">
            {baixas.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Bens desincorporados</span>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Ganho de Capital Tributável</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {formatarMoeda(totalGanhos)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Base IRPJ 15% + CSLL 9%</span>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Perdas de Capital</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 mt-2 font-mono">
            {formatarMoeda(totalPerdas)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Despesa não operacional</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] mb-6">
        <button
          onClick={() => setActiveTab('INVENTARIO')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'INVENTARIO'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Inventário Físico & Plaquetas ({itensInventario.length})
        </button>

        <button
          onClick={() => setActiveTab('BAIXAS')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'BAIXAS'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Baixas & Alienação de Bens ({baixas.length})
        </button>

        <button
          onClick={() => setActiveTab('LEGAL')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'LEGAL'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Normas CPC 27 & Ganho de Capital
        </button>
      </div>

      {/* TAB 1: INVENTÁRIO */}
      {activeTab === 'INVENTARIO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por plaqueta, ativo, responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Registros Encontrados: {inventarioFiltrado.length}
            </span>
          </div>

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#202020] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#2a2a2a]">
                  <tr>
                    <th className="py-3 px-4">Plaqueta / QR Code</th>
                    <th className="py-3 px-4">Descrição do Bem</th>
                    <th className="py-3 px-4">Centro de Custo / Depto</th>
                    <th className="py-3 px-4">Responsável Atual</th>
                    <th className="py-3 px-4">Localização Física</th>
                    <th className="py-3 px-4 text-center">Conservação</th>
                    <th className="py-3 px-4 text-center">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {inventarioFiltrado.map(item => (
                    <tr key={item.id} className="hover:bg-[#202020]/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5" />
                          {item.codigoPatrimonio}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.qrCodeIdentificador}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.descricao}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{item.centroCustoNome}</div>
                        <div className="text-[11px] text-slate-400">{item.departamento}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-300">{item.responsavelNome}</div>
                        <div className="text-[11px] text-slate-500 font-mono">CPF: {item.responsavelCpf}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                        {item.localizacaoFisica}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.estadoConservacao}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.situacaoInventario}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BAIXAS E ALIENAÇÃO */}
      {activeTab === 'BAIXAS' && (
        <div className="space-y-6">
          {/* Formulário de Registro de Baixa */}
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5 shadow-sm max-w-4xl">
            <h3 className="text-sm font-semibold text-white mb-1">Registrar Baixa ou Alienação de Bem (CPC 27)</h3>
            <p className="text-xs text-slate-400 mb-4">
              Informe os dados da operação para apuração automática do Ganho/Perda de Capital e contabilização no Diário.
            </p>

            <form onSubmit={handleSalvarBaixa} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Selecione o Ativo *</label>
                  <select
                    required
                    value={novaBaixa.ativoId}
                    onChange={(e) => setNovaBaixa({ ...novaBaixa, ativoId: Number(e.target.value) })}
                    className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {ativos.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.codigo} - {a.descricao} ({formatarMoeda(a.valorOriginal)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data da Baixa *</label>
                  <input
                    type="date"
                    required
                    value={novaBaixa.dataBaixa}
                    onChange={(e) => setNovaBaixa({ ...novaBaixa, dataBaixa: e.target.value })}
                    className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Motivo da Baixa *</label>
                  <select
                    value={novaBaixa.motivoBaixa}
                    onChange={(e) => setNovaBaixa({ ...novaBaixa, motivoBaixa: e.target.value as any })}
                    className="w-full bg-[#202020] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="VENDA">Venda / Alienação a Terceiros</option>
                    <option value="DESCARTE_SUCATEAMENTO">Descarte / Sucateamento</option>
                    <option value="PERDA_SINISTRO">Perda / Sinistro / Furto</option>
                    <option value="DOACAO">Doação</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#202020] p-4 rounded-lg border border-[#2a2a2a]">
                <div>
                  <label className="block text-emerald-400 font-medium mb-1">Valor da Venda / Alienação (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={novaBaixa.valorVendaAlienacao || ''}
                    onChange={(e) => setNovaBaixa({ ...novaBaixa, valorVendaAlienacao: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#181818] border border-emerald-500/30 rounded-lg px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Número NF-e Venda</label>
                  <input
                    type="text"
                    placeholder="ex: 1099"
                    value={novaBaixa.numeroNotaFiscalVenda}
                    onChange={(e) => setNovaBaixa({ ...novaBaixa, numeroNotaFiscalVenda: e.target.value })}
                    className="w-full bg-[#181818] border border-[#333] rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Comprador / Adquirente</label>
                  <input
                    type="text"
                    placeholder="ex: AUTO PEÇAS DO BRASIL LTDA"
                    value={novaBaixa.compradorNome}
                    onChange={(e) => setNovaBaixa({ ...novaBaixa, compradorNome: e.target.value.toUpperCase() })}
                    className="w-full bg-[#181818] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Efetivar Baixa & Contabilizar
                </button>
              </div>
            </form>
          </div>

          {/* Relação de Baixas */}
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-semibold text-white">Histórico de Bens Baixados e Alienados</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#202020] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#2a2a2a]">
                  <tr>
                    <th className="py-3 px-4">Código / Bem</th>
                    <th className="py-3 px-4 text-center">Data Baixa</th>
                    <th className="py-3 px-4">Motivo</th>
                    <th className="py-3 px-4 text-right">Custo Aquisição</th>
                    <th className="py-3 px-4 text-right">Deprec. Acumulada</th>
                    <th className="py-3 px-4 text-right">Valor Residual</th>
                    <th className="py-3 px-4 text-right">Valor Venda</th>
                    <th className="py-3 px-4 text-right">Resultado</th>
                    <th className="py-3 px-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {baixas.map(b => (
                    <tr key={b.id} className="hover:bg-[#202020]/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{b.codigoBem}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{b.descricaoBem}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {b.dataBaixa}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#252525] text-slate-300 border border-[#333]">
                          {b.motivoBaixa}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatarMoeda(b.valorAquisicaoOriginal)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {formatarMoeda(b.depreciacaoAcumuladaData)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                        {formatarMoeda(b.valorContabilResidual)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-white font-bold">
                        {formatarMoeda(b.valorVendaAlienacao)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={b.tipoResultado === 'GANHO_CAPITAL' ? 'text-emerald-400' : 'text-rose-400'}>
                          {b.resultadoOperacao > 0 ? '+' : ''}{formatarMoeda(b.resultadoOperacao)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedBaixa(b);
                            setShowPrintTermoBaixa(true);
                          }}
                          className="px-2 py-1 bg-[#252525] hover:bg-[#303030] text-slate-300 rounded text-[11px] transition flex items-center gap-1 mx-auto"
                        >
                          <Printer className="w-3 h-3" /> Termo
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

      {/* TAB 3: LEGAL */}
      {activeTab === 'LEGAL' && (
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 shadow-sm space-y-4 max-w-4xl text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Normas de Desincorporação e Ganho de Capital (CPC 27)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
              <h4 className="font-semibold text-cyan-400">Desincorporação do Ativo</h4>
              <p className="text-slate-300 leading-relaxed">
                O valor contábil de um item do ativo imobilizado deve ser baixado por ocasião de sua alienação ou quando não há expectativa de quaisquer benefícios econômicos futuros com a sua utilização ou descarte.
              </p>
            </div>
            <div className="bg-[#202020] p-4 rounded-lg border border-[#2a2a2a] space-y-2">
              <h4 className="font-semibold text-emerald-400">Tributação do Ganho de Capital</h4>
              <p className="text-slate-300 leading-relaxed">
                Os ganhos ou perdas decorrentes da desincorporação devem ser determinados pela diferença entre o valor líquido da alienação e o valor contábil do item, sendo incluídos no resultado e tributados à alíquota de 15% (IRPJ) e 9% (CSLL).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRESSÃO TERMO DE RESPONSABILIDADE */}
      {showPrintTermoResponsabilidade && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintTermoResponsabilidade}
          onClose={() => setShowPrintTermoResponsabilidade(false)}
          empresa={empresa}
          tituloRelatorio="Termo de Responsabilidade e Guarda de Bens Patrimoniais"
          subtitulo="Controle de Cautela de Ativos • Inventário Físico CPC 27"
          periodo={new Date().toISOString().substring(0, 7)}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            <div className="border border-black p-3 space-y-1">
              <div className="font-bold text-sm">{empresa.razaoSocial}</div>
              <div>CNPJ: {empresa.cnpj} • Endereço: {empresa.logradouro}, {empresa.numero}</div>
              <div>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
            </div>

            <div className="p-2 border border-black">
              <div className="font-bold mb-2">1. RELAÇÃO DE BENS SOB RESPONSABILIDADE</div>
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black p-1 text-left">Plaqueta</th>
                    <th className="border border-black p-1 text-left">Descrição do Bem</th>
                    <th className="border border-black p-1 text-left">Departamento</th>
                    <th className="border border-black p-1 text-left">Responsável</th>
                    <th className="border border-black p-1 text-center">Conservação</th>
                  </tr>
                </thead>
                <tbody>
                  {itensInventario.map(item => (
                    <tr key={item.id} className="border-b border-black">
                      <td className="border border-black p-1 font-mono font-bold">{item.codigoPatrimonio}</td>
                      <td className="border border-black p-1">{item.descricao}</td>
                      <td className="border border-black p-1">{item.departamento}</td>
                      <td className="border border-black p-1">{item.responsavelNome}</td>
                      <td className="border border-black p-1 text-center">{item.estadoConservacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-justify space-y-2 border border-black p-3">
              <p>
                Pelo presente instrumento, o(s) colaborador(es) acima nominado(s) declara(m) ter recebido em perfeito estado de conservação e funcionamento o(s) equipamento(s) e bem(bens) especificado(s), comprometendo-se a zelar por sua guarda, manutenção e uso estritamente profissional.
              </p>
            </div>

            <div className="pt-10 flex justify-between text-center text-xs">
              <div className="w-64 border-t border-black pt-1">
                <div>{empresa.razaoSocial}</div>
                <div className="text-[10px] text-gray-600">Gestão de Patrimônio</div>
              </div>
              <div className="w-64 border-t border-black pt-1">
                <div>Colaborador / Responsável</div>
                <div className="text-[10px] text-gray-600">Assinatura</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}

      {/* MODAL IMPRESSÃO TERMO DE BAIXA */}
      {showPrintTermoBaixa && selectedBaixa && empresa && (
        <ReportPrintPreviewModal
          isOpen={showPrintTermoBaixa}
          onClose={() => setShowPrintTermoBaixa(false)}
          empresa={empresa}
          tituloRelatorio="Termo Oficial de Baixa e Alienação de Ativo Imobilizado"
          subtitulo="Demonstrativo de Ganho ou Perda de Capital • Pronunciamento CPC 27"
          periodo={selectedBaixa.dataBaixa}
        >
          <div className="space-y-6 text-black font-sans text-xs">
            <div className="border border-black p-3 space-y-1">
              <div className="font-bold text-sm">{empresa.razaoSocial}</div>
              <div>CNPJ: {empresa.cnpj}</div>
              <div>Data da Baixa: {selectedBaixa.dataBaixa} • Motivo: {selectedBaixa.motivoBaixa}</div>
            </div>

            <div className="border border-black p-3 space-y-2">
              <div className="font-bold border-b border-black pb-1">DEMONSTRATIVO ANALÍTICO DA DESINCORPORAÇÃO</div>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="space-y-1">
                  <div><strong>Código do Bem:</strong> {selectedBaixa.codigoBem}</div>
                  <div><strong>Descrição:</strong> {selectedBaixa.descricaoBem}</div>
                  <div><strong>Data de Aquisição:</strong> {selectedBaixa.dataAquisicao}</div>
                  <div><strong>Comprador:</strong> {selectedBaixa.compradorNome || 'Não Aplicável'}</div>
                  <div><strong>NF-e Venda:</strong> {selectedBaixa.numeroNotaFiscalVenda || '-'}</div>
                </div>

                <div className="space-y-1 border-l border-black pl-4">
                  <div className="flex justify-between">
                    <span>Custo Histórico Original:</span>
                    <span>{formatarMoeda(selectedBaixa.valorAquisicaoOriginal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>(-) Depreciação Acumulada:</span>
                    <span>-{formatarMoeda(selectedBaixa.depreciacaoAcumuladaData)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-black pt-1">
                    <span>(=) Valor Contábil Residual:</span>
                    <span>{formatarMoeda(selectedBaixa.valorContabilResidual)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Valor da Alienação / Venda:</span>
                    <span>{formatarMoeda(selectedBaixa.valorVendaAlienacao)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t-2 border-black pt-1">
                    <span>RESULTADO DA OPERAÇÃO:</span>
                    <span>{formatarMoeda(selectedBaixa.resultadoOperacao)} ({selectedBaixa.tipoResultado})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 flex justify-between text-center text-xs">
              <div className="w-64 border-t border-black pt-1">
                <div>Diretoria Administrativa</div>
                <div className="text-[10px] text-gray-600">Aprovação da Baixa</div>
              </div>
              <div className="w-64 border-t border-black pt-1">
                <div>Contador Responsável</div>
                <div className="text-[10px] text-gray-600">CRC/SP 1SP123456/O-0</div>
              </div>
            </div>
          </div>
        </ReportPrintPreviewModal>
      )}
    </div>
  );
};
