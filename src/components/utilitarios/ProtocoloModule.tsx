import React, { useState, useMemo } from 'react';
import {
  Empresa,
  ProtocoloDocumento,
  ItemProtocoloDocumento,
  TipoMovimentoProtocolo,
  StatusProtocolo
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  Send,
  Download,
  Plus,
  Trash2,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Search,
  FileText,
  Calendar,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Edit2,
  X,
  Mail,
  Phone
} from 'lucide-react';

interface ProtocoloModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const ProtocoloModule: React.FC<ProtocoloModuleProps> = ({ empresa, onOpenReportPreview }) => {
  const [protocolos, setProtocolos] = useState<ProtocoloDocumento[]>(() => dbService.getProtocolos(empresa.id));
  const [activeTab, setActiveTab] = useState<'LISTA' | 'NOVO'>('LISTA');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'SAIDA_ESCRITORIO' | 'ENTRADA_ESCRITORIO'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'EMITIDO' | 'ENTREGUE' | 'CONFIRMADO_ASSINADO'>('TODOS');
  const [busca, setBusca] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form State Novo Protocolo
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentoProtocolo>('SAIDA_ESCRITORIO');
  const [competencia, setCompetencia] = useState(empresa.competenciaAtiva || '2026-10');
  const [usuarioResponsavel, setUsuarioResponsavel] = useState('Ana Paula Ferreira (Controladoria)');
  const [nomeContato, setNomeContato] = useState('');
  const [documentoContato, setDocumentoContato] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [exigeAssinatura, setExigeAssinatura] = useState(true);

  // Grade de Itens do Protocolo
  const [itens, setItens] = useState<ItemProtocoloDocumento[]>([
    {
      id: 'item-1',
      descricaoDocumento: 'Guia de Recolhimento do Simples Nacional (DAS)',
      competencia: '2026-09',
      dataVencimento: '2026-10-20',
      valorOriginal: 14850.00,
      quantidadeVias: 1,
      tipoVia: 'ORIGINAL',
      observacao: 'Recolhimento via Domicílio Tributário Eletrônico'
    }
  ]);

  // Modal rápido de adição de item
  const [novoDocDesc, setNovoDocDesc] = useState('');
  const [novoDocComp, setNovoDocComp] = useState('2026-09');
  const [novoDocVenc, setNovoDocVenc] = useState('2026-10-20');
  const [novoDocValor, setNovoDocValor] = useState<number>(0);
  const [novoDocVias, setNovoDocVias] = useState<number>(1);
  const [novoDocTipoVia, setNovoDocTipoVia] = useState<'ORIGINAL' | 'COPIA' | 'DIGITAL'>('ORIGINAL');

  const carregarProtocolos = () => {
    setProtocolos(dbService.getProtocolos(empresa.id));
  };

  const handleAdicionarItem = () => {
    if (!novoDocDesc.trim()) return;
    const novo: ItemProtocoloDocumento = {
      id: `doc-${Date.now()}`,
      descricaoDocumento: novoDocDesc.trim(),
      competencia: novoDocComp,
      dataVencimento: novoDocVenc || undefined,
      valorOriginal: novoDocValor > 0 ? novoDocValor : undefined,
      quantidadeVias: novoDocVias,
      tipoVia: novoDocTipoVia
    };
    setItens(prev => [...prev, novo]);
    setNovoDocDesc('');
    setNovoDocValor(0);
  };

  const handleRemoverItem = (id: string) => {
    setItens(prev => prev.filter(i => i.id !== id));
  };

  const handleSalvarProtocolo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeContato.trim() || itens.length === 0) {
      setFeedback({ tipo: 'error', texto: 'Informe o nome do contato receptor/entregador e inclua ao menos um documento no protocolo.' });
      return;
    }

    const res = dbService.salvarProtocolo({
      empresaId: empresa.id,
      tipoMovimento,
      dataHoraEmissao: new Date().toISOString(),
      competencia,
      usuarioResponsavelNome: usuarioResponsavel,
      nomeContatoRecepcao: nomeContato.trim(),
      documentoContatoRecepcao: documentoContato.trim() || undefined,
      emailContatoNotificacao: emailContato.trim() || undefined,
      telefoneContato: telefoneContato.trim() || undefined,
      status: 'EMITIDO',
      observacoesGerais: observacoesGerais.trim() || undefined,
      itens,
      exigeAssinaturaFisica: exigeAssinatura
    });

    carregarProtocolos();
    setActiveTab('LISTA');
    setFeedback({ tipo: 'success', texto: `Protocolo nº ${res.numeroProtocolo} gerado com sucesso!` });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleConfirmarRecebimento = (proto: ProtocoloDocumento) => {
    dbService.atualizarStatusProtocolo(
      proto.id,
      'CONFIRMADO_ASSINADO',
      new Date().toISOString(),
      proto.nomeContatoRecepcao
    );
    carregarProtocolos();
    setFeedback({ tipo: 'success', texto: `Protocolo nº ${proto.numeroProtocolo} confirmado e assinado com sucesso!` });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExcluirProtocolo = (id: number) => {
    if (confirm('Deseja realmente cancelar este protocolo?')) {
      dbService.excluirProtocolo(id);
      carregarProtocolos();
    }
  };

  const handleImprimirProtocoloA4 = (proto: ProtocoloDocumento) => {
    if (!onOpenReportPreview) return;

    const dataEmissaoFormatada = new Date(proto.dataHoraEmissao).toLocaleDateString('pt-BR');
    const horaEmissaoFormatada = new Date(proto.dataHoraEmissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const totalValorGuias = proto.itens.reduce((acc, it) => acc + (it.valorOriginal || 0), 0);

    const relatorioContent = (
      <div className="font-sans text-neutral-900 space-y-6 text-xs p-3">
        {/* Top Header Timbrado */}
        <div className="border-b-2 border-neutral-900 pb-3 flex justify-between items-start">
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              {proto.tipoMovimento === 'SAIDA_ESCRITORIO' ? 'PROTOCOLO DE ENTREGA DE DOCUMENTOS E GUIAS (SAÍDA)' : 'PROTOCOLO DE RECEBIMENTO DE DOCUMENTOS CONTÁBEIS (ENTRADA)'}
            </div>
            <h1 className="text-xl font-black text-neutral-900 font-mono tracking-tight">
              PROTOCOLO Nº {proto.numeroProtocolo}
            </h1>
            <p className="text-[11px] text-neutral-600">
              Emitido em: {dataEmissaoFormatada} às {horaEmissaoFormatada} • Competência: {proto.competencia}
            </p>
          </div>
          <div className="text-right text-[11px] border border-neutral-400 p-2 rounded bg-neutral-50">
            <div className="font-bold">{empresa.razaoSocial}</div>
            <div className="font-mono text-[10px]">CNPJ: {empresa.cnpj}</div>
            <div className="font-mono text-[10px]">IE: {empresa.inscricaoEstadual || 'ISENTO'}</div>
          </div>
        </div>

        {/* Informações das Partes */}
        <div className="grid grid-cols-2 gap-4 border border-neutral-300 p-3 rounded bg-neutral-50/50">
          <div>
            <div className="font-bold uppercase text-[10px] text-neutral-500 mb-1">Responsável pela Emissão / Escritório</div>
            <div className="font-bold text-neutral-800 text-[11px]">{proto.usuarioResponsavelNome}</div>
            <div className="text-neutral-600">Departamento Contábil / Fiscal / Pessoal</div>
          </div>
          <div>
            <div className="font-bold uppercase text-[10px] text-neutral-500 mb-1">
              {proto.tipoMovimento === 'SAIDA_ESCRITORIO' ? 'Destinatário / Receptor do Cliente' : 'Portador / Entregador'}
            </div>
            <div className="font-bold text-neutral-800 text-[11px]">{proto.nomeContatoRecepcao}</div>
            <div className="font-mono text-neutral-600">
              {proto.documentoContatoRecepcao ? `CPF/RG: ${proto.documentoContatoRecepcao}` : 'Documento verificado na entrega'}
            </div>
            {proto.emailContatoNotificacao && (
              <div className="text-neutral-500 text-[10px]">E-mail: {proto.emailContatoNotificacao}</div>
            )}
          </div>
        </div>

        {/* Grade de Documentos */}
        <div>
          <h3 className="font-bold uppercase text-neutral-800 border-b border-neutral-400 pb-1 mb-2 flex justify-between items-center">
            <span>Relação Detalhada dos Documentos Entregues</span>
            <span className="font-mono text-[10px] font-normal text-neutral-500">
              Total de Itens: {proto.itens.length} {totalValorGuias > 0 ? `• Total em Guias: R$ ${totalValorGuias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
            </span>
          </h3>

          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b-2 border-neutral-900 bg-neutral-100 font-bold">
                <th className="py-1.5 px-2">Item</th>
                <th className="py-1.5 px-2">Discriminação do Documento / Guia</th>
                <th className="py-1.5 px-2 text-center">Comp.</th>
                <th className="py-1.5 px-2 text-center">Vencimento</th>
                <th className="py-1.5 px-2 text-center">Vias</th>
                <th className="py-1.5 px-2 text-center">Tipo</th>
                <th className="py-1.5 px-2 text-right">Valor Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {proto.itens.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 px-2 font-mono text-neutral-500">{idx + 1}</td>
                  <td className="py-1.5 px-2">
                    <div className="font-semibold text-neutral-900">{it.descricaoDocumento}</div>
                    {it.observacao && <div className="text-[10px] text-neutral-500 italic">{it.observacao}</div>}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono">{it.competencia || '-'}</td>
                  <td className="py-1.5 px-2 text-center font-mono font-bold text-neutral-800">
                    {it.dataVencimento ? new Date(it.dataVencimento).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono">{it.quantidadeVias}</td>
                  <td className="py-1.5 px-2 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-neutral-200 font-mono">
                      {it.tipoVia}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">
                    {it.valorOriginal ? `R$ ${it.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            {totalValorGuias > 0 && (
              <tfoot>
                <tr className="border-t-2 border-neutral-900 font-bold bg-neutral-100">
                  <td colSpan={6} className="py-2 px-2 text-right uppercase">Total Acumulado das Obrigações a Recolher:</td>
                  <td className="py-2 px-2 text-right font-mono text-sm text-neutral-900">
                    R$ {totalValorGuias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Termo de Responsabilidade & Declaração de Recebimento */}
        <div className="p-3 border border-neutral-300 rounded bg-neutral-50 text-[10px] leading-relaxed text-neutral-700">
          <p className="font-bold text-neutral-900 uppercase mb-1">Termo de Ciência e Responsabilidade</p>
          <p>
            Declaramos ter recebido nesta data, em perfeitas condições de legibilidade e conferência, os documentos e guias acima discriminados, ficando sob nossa inteira responsabilidade o tempestivo recolhimento dos tributos e cumprimento das exigências fiscais/trabalhistas nos prazos assinalados.
          </p>
        </div>

        {/* Canhoto Destacável de Entrega com Assinatura */}
        <div className="pt-8 border-t-2 border-dashed border-neutral-400 mt-6 space-y-4">
          <div className="flex justify-between items-center text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
            <span>✂ CANHOTO DE DEVOLUÇÃO ASSINADO AO ESCRITÓRIO CONTÁBIL</span>
            <span>PROTOCOLO Nº {proto.numeroProtocolo}</span>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 text-center text-[10px]">
            <div>
              <div className="border-t border-neutral-800 pt-1 font-bold">{proto.usuarioResponsavelNome}</div>
              <div className="text-neutral-500 font-mono">Entregue por / Escritório Contábil</div>
              <div className="text-neutral-400 font-mono text-[9px] mt-0.5">Data: ____/____/________ às ____:____</div>
            </div>
            <div>
              <div className="border-t border-neutral-800 pt-1 font-bold">{proto.nomeContatoRecepcao}</div>
              <div className="text-neutral-500 font-mono">
                {proto.documentoContatoRecepcao ? `CPF/RG: ${proto.documentoContatoRecepcao}` : 'Assinatura do Responsável'}
              </div>
              <div className="text-neutral-400 font-mono text-[9px] mt-0.5">Data: ____/____/________ às ____:____</div>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `PROTOCOLO DE DOCUMENTOS Nº ${proto.numeroProtocolo}`,
      `Cliente: ${empresa.razaoSocial} • ${proto.tipoMovimento === 'SAIDA_ESCRITORIO' ? 'Saída do Escritório' : 'Entrada no Escritório'}`,
      relatorioContent,
      'portrait'
    );
  };

  const protocolosFiltrados = useMemo(() => {
    return protocolos.filter(p => {
      const matchTipo = filtroTipo === 'TODOS' || p.tipoMovimento === filtroTipo;
      const matchStatus = filtroStatus === 'TODOS' || p.status === filtroStatus;
      const matchBusca = !busca.trim() || 
        p.numeroProtocolo.toLowerCase().includes(busca.toLowerCase()) ||
        p.nomeContatoRecepcao.toLowerCase().includes(busca.toLowerCase()) ||
        p.itens.some(it => it.descricaoDocumento.toLowerCase().includes(busca.toLowerCase()));
      return matchTipo && matchStatus && matchBusca;
    });
  }, [protocolos, filtroTipo, filtroStatus, busca]);

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-200 select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-4 bg-[#181818] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-neutral-100">Protocolo de Documentos & Malotes</h1>
              <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 rounded-full font-mono border border-purple-500/30">
                GEPROTOCOLO
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Controle de Entrada e Saída de Guias DAS/DARF, Folhas, Extratos e Comprovantes com Canhoto de Assinatura A4
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'LISTA' ? (
            <button
              onClick={() => setActiveTab('NOVO')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Emitir Novo Protocolo</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('LISTA')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 text-xs transition"
            >
              <span>Voltar à Relação</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`mx-4 mt-3 p-3 rounded-lg flex items-center justify-between text-xs ${
          feedback.tipo === 'success' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.tipo === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'LISTA' ? (
          <div className="space-y-4">
            {/* Filtros e Busca */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181818] p-3 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFiltroTipo('TODOS')}
                  className={`px-3 py-1 rounded text-xs transition ${filtroTipo === 'TODOS' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  Todos os Fluxos
                </button>
                <button
                  onClick={() => setFiltroTipo('SAIDA_ESCRITORIO')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-xs transition ${filtroTipo === 'SAIDA_ESCRITORIO' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                  <span>Saída (Entregas ao Cliente)</span>
                </button>
                <button
                  onClick={() => setFiltroTipo('ENTRADA_ESCRITORIO')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-xs transition ${filtroTipo === 'ENTRADA_ESCRITORIO' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Entrada (Recebimento de Documentos)</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar protocolo, contato ou documento..."
                  className="bg-[#202020] border border-white/10 rounded-lg px-3 py-1 text-xs text-neutral-200 placeholder-neutral-500 w-64 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Grid de Protocolos */}
            <div className="bg-[#181818] rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#222222] text-neutral-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Nº Protocolo</th>
                    <th className="py-2.5 px-3">Fluxo</th>
                    <th className="py-2.5 px-3">Data / Hora Emissão</th>
                    <th className="py-2.5 px-3">Receptor / Portador</th>
                    <th className="py-2.5 px-3">Qtd. Documentos</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {protocolosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500">
                        Nenhum protocolo localizado para os filtros informados.
                      </td>
                    </tr>
                  ) : (
                    protocolosFiltrados.map((proto) => {
                      const dataFormatada = new Date(proto.dataHoraEmissao).toLocaleDateString('pt-BR');
                      const horaFormatada = new Date(proto.dataHoraEmissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                      const totalValor = proto.itens.reduce((acc, it) => acc + (it.valorOriginal || 0), 0);

                      return (
                        <tr key={proto.id} className="hover:bg-white/5 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-100 flex items-center space-x-1.5">
                            <span className="text-purple-400">#</span>
                            <span>{proto.numeroProtocolo}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            {proto.tipoMovimento === 'SAIDA_ESCRITORIO' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                <ArrowUpRight className="w-3 h-3" />
                                <span>Saída</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                <ArrowDownLeft className="w-3 h-3" />
                                <span>Entrada</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-neutral-400">
                            {dataFormatada} {horaFormatada}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-neutral-200">{proto.nomeContatoRecepcao}</div>
                            {proto.documentoContatoRecepcao && (
                              <div className="text-[10px] text-neutral-500 font-mono">{proto.documentoContatoRecepcao}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-neutral-300">{proto.itens.length} documento(s)</div>
                            {totalValor > 0 && (
                              <div className="text-[10px] text-emerald-400 font-mono">
                                Total: R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {proto.status === 'CONFIRMADO_ASSINADO' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Confirmado / Assinado</span>
                              </span>
                            ) : proto.status === 'ENTREGUE' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
                                <Clock className="w-3 h-3 text-blue-400" />
                                <span>Entregue</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>Emitido (Pendente)</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {proto.status !== 'CONFIRMADO_ASSINADO' && (
                                <button
                                  onClick={() => handleConfirmarRecebimento(proto)}
                                  title="Confirmar Recebimento / Assinatura"
                                  className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleImprimirProtocoloA4(proto)}
                                title="Imprimir Termo de Protocolo A4"
                                className="p-1 rounded hover:bg-white/10 text-blue-400 transition"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleExcluirProtocolo(proto.id)}
                                title="Cancelar Protocolo"
                                className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ABA 2: FORMULÁRIO DE NOVO PROTOCOLO */
          <form onSubmit={handleSalvarProtocolo} className="max-w-4xl mx-auto bg-[#181818] p-6 rounded-xl border border-white/10 space-y-6 text-xs">
            <div className="border-b border-white/10 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wide">
                  Novo Termo de Protocolo de Documentos
                </h2>
                <p className="text-neutral-400 text-[11px]">
                  Geração de protocolo sequencial para controle interno de entrega e recebimento
                </p>
              </div>
              <span className="font-mono text-purple-400 text-xs font-bold">
                Sequencial Automático Domínio
              </span>
            </div>

            {/* Configuração Básica do Protocolo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-400 mb-1">Tipo de Movimentação:</label>
                <select
                  value={tipoMovimento}
                  onChange={(e) => setTipoMovimento(e.target.value as TipoMovimentoProtocolo)}
                  className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="SAIDA_ESCRITORIO">Saída (Entrega de Guias/Docs ao Cliente)</option>
                  <option value="ENTRADA_ESCRITORIO">Entrada (Recebimento de Documentos do Cliente)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Competência de Referência:</label>
                <input
                  type="text"
                  value={competencia}
                  onChange={(e) => setCompetencia(e.target.value)}
                  placeholder="YYYY-MM"
                  className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Responsável no Escritório:</label>
                <input
                  type="text"
                  value={usuarioResponsavel}
                  onChange={(e) => setUsuarioResponsavel(e.target.value)}
                  className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Dados do Receptor / Portador */}
            <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
              <div className="font-bold text-neutral-300 text-xs uppercase tracking-wider">
                {tipoMovimento === 'SAIDA_ESCRITORIO' ? 'Dados do Contato Receptor no Cliente' : 'Dados do Portador / Entregador'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-neutral-400 mb-1">Nome Completo do Contato *:</label>
                  <input
                    type="text"
                    required
                    value={nomeContato}
                    onChange={(e) => setNomeContato(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Mendes"
                    className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">CPF ou RG:</label>
                  <input
                    type="text"
                    value={documentoContato}
                    onChange={(e) => setDocumentoContato(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Telefone / WhatsApp:</label>
                  <input
                    type="text"
                    value={telefoneContato}
                    onChange={(e) => setTelefoneContato(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Grade Dinâmica de Documentos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-neutral-200 uppercase tracking-wider text-xs">
                  Documentos Incluídos no Protocolo ({itens.length})
                </span>
                <span className="text-[11px] text-neutral-400">
                  Total em Guias: R$ {itens.reduce((acc, it) => acc + (it.valorOriginal || 0), 0).toFixed(2)}
                </span>
              </div>

              {/* Formulário para Adicionar Item */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-[#202020] p-3 rounded-lg border border-white/5 items-end">
                <div className="md:col-span-4">
                  <label className="block text-[10px] text-neutral-400 mb-1">Descrição do Documento / Guia:</label>
                  <input
                    type="text"
                    value={novoDocDesc}
                    onChange={(e) => setNovoDocDesc(e.target.value)}
                    placeholder="Ex: Guia DAS, DCTFWeb, Holerites, Extratos"
                    className="w-full bg-[#181818] border border-white/10 rounded p-1.5 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] text-neutral-400 mb-1">Competência:</label>
                  <input
                    type="text"
                    value={novoDocComp}
                    onChange={(e) => setNovoDocComp(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded p-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] text-neutral-400 mb-1">Vencimento:</label>
                  <input
                    type="date"
                    value={novoDocVenc}
                    onChange={(e) => setNovoDocVenc(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded p-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] text-neutral-400 mb-1">Valor (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoDocValor || ''}
                    onChange={(e) => setNovoDocValor(Number(e.target.value))}
                    placeholder="0,00"
                    className="w-full bg-[#181818] border border-white/10 rounded p-1.5 text-xs text-neutral-200 font-mono"
                  />
                </div>

                <div className="md:col-span-2 flex space-x-1">
                  <button
                    type="button"
                    onClick={handleAdicionarItem}
                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium text-xs flex items-center justify-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div className="bg-[#202020] rounded-lg border border-white/5 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20 text-neutral-400 text-[10px] uppercase">
                      <th className="py-2 px-3">Documento</th>
                      <th className="py-2 px-3">Comp.</th>
                      <th className="py-2 px-3">Vencimento</th>
                      <th className="py-2 px-3 text-right">Valor</th>
                      <th className="py-2 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {itens.map((it) => (
                      <tr key={it.id} className="hover:bg-white/5">
                        <td className="py-2 px-3 font-semibold text-neutral-200">{it.descricaoDocumento}</td>
                        <td className="py-2 px-3 font-mono text-neutral-400">{it.competencia || '-'}</td>
                        <td className="py-2 px-3 font-mono text-neutral-400">{it.dataVencimento || '-'}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400">
                          {it.valorOriginal ? `R$ ${it.valorOriginal.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoverItem(it.id)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Observações Gerais do Protocolo:</label>
              <textarea
                rows={2}
                value={observacoesGerais}
                onChange={(e) => setObservacoesGerais(e.target.value)}
                placeholder="Ex: Guias impressas entregues em envelope lacrado ao setor financeiro."
                className="w-full bg-[#202020] border border-white/10 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('LISTA')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/20 transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar & Emitir Protocolo</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
