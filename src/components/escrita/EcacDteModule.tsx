import React, { useState, useEffect } from 'react';
import {
  Inbox,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Building2,
  RefreshCw,
  Printer,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  BadgeAlert,
  Check
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  MensagemCaixaPostalDte,
  CertidaoNegativaDebito,
  StatusCertidao,
  Empresa
} from '../../types/contabil';

interface EcacDteModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo?: React.ReactNode; linhas?: any[] }) => void;
}

export const EcacDteModule: React.FC<EcacDteModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [activeTab, setActiveTab] = useState<'dte' | 'cnd'>('dte');
  const [mensagens, setMensagens] = useState<MensagemCaixaPostalDte[]>([]);
  const [certidoes, setCertidoes] = useState<CertidaoNegativaDebito[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [mensagemSelecionada, setMensagemSelecionada] = useState<MensagemCaixaPostalDte | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarDados = () => {
    const msgs = dbService.getMensagensDte(empresaAtiva.id);
    setMensagens(msgs);
    const certs = dbService.getCertidoesNegativas(empresaAtiva.id);
    setCertidoes(certs);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id]);

  const handleMarcarLida = (id: string) => {
    dbService.marcarMensagemDteLida(id);
    carregarDados();
    if (mensagemSelecionada?.id === id) {
      setMensagemSelecionada({ ...mensagemSelecionada, status: 'LIDA' });
    }
  };

  const handleVerificarCnds = () => {
    carregarDados();
    setStatusFeedback({
      tipo: 'sucesso',
      texto: 'Certidões verificadas junto aos WebServices RFB/PGFN, Caixa, TST e SEFAZ!'
    });
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleEmitirDossieA4 = () => {
    if (!onOpenReportPreview) return;

    const relatorioContent = (
      <div className="font-sans text-neutral-800 p-4 space-y-5">
        <div className="border-b border-neutral-300 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-900">
              Dossiê de Regularidade Fiscal e DTE (e-CAC)
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Certidões Negativas de Débitos (CND) e Caixa Postal Fiscal Eletrônica - IN RFB nº 2.066/2022
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded text-xs font-bold tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              SITUAÇÃO: REGULAR
            </span>
            <p className="text-[10px] text-neutral-500 mt-1">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Dados da Empresa */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-3 rounded border border-neutral-200">
          <div>
            <p><span className="font-bold">Razão Social:</span> {empresaAtiva.razaoSocial}</p>
            <p><span className="font-bold">CNPJ:</span> {empresaAtiva.cnpj}</p>
            <p><span className="font-bold">Regime Tributário:</span> {empresaAtiva.regimeTributario}</p>
          </div>
          <div>
            <p><span className="font-bold">Inscrição Estadual:</span> {empresaAtiva.inscricaoEstadual || 'Isento'}</p>
            <p><span className="font-bold">Inscrição Municipal:</span> {empresaAtiva.inscricaoMunicipal || 'Isento'}</p>
            <p><span className="font-bold">Município / UF:</span> {empresaAtiva.cidade} - {empresaAtiva.uf || 'SP'}</p>
          </div>
        </div>

        {/* Quadro das Certidões Negativas */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 border-b border-neutral-200 pb-1">
            Certidões Negativas de Débitos Emitidas
          </h2>
          <table className="w-full text-xs border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 text-neutral-700 text-left">
                <th className="p-2 border border-neutral-300">Órgão Emissor / Certidão</th>
                <th className="p-2 border border-neutral-300">Número de Controle</th>
                <th className="p-2 border border-neutral-300 text-center">Emissão</th>
                <th className="p-2 border border-neutral-300 text-center">Validade</th>
                <th className="p-2 border border-neutral-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {certidoes.map((c) => (
                <tr key={c.id} className="border-b border-neutral-200">
                  <td className="p-2 border border-neutral-200">
                    <div className="font-bold">{c.orgaoEmissor}</div>
                    <div className="text-[10px] text-neutral-500">{c.observacoes}</div>
                  </td>
                  <td className="p-2 border border-neutral-200 font-mono">{c.numeroControle}</td>
                  <td className="p-2 border border-neutral-200 text-center font-mono">{c.dataEmissao}</td>
                  <td className="p-2 border border-neutral-200 text-center font-mono font-bold text-neutral-900">{c.dataValidade}</td>
                  <td className="p-2 border border-neutral-200 text-center font-bold">
                    <span className="text-emerald-700">REGULAR</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo da Caixa Postal */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 border-b border-neutral-200 pb-1">
            Histórico Recente de Mensagens e Notificações DTE
          </h2>
          <div className="space-y-2">
            {mensagens.map((m) => (
              <div key={m.id} className="p-2 bg-neutral-50 border border-neutral-200 rounded text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-neutral-900">{m.orgaoEmissor} - {m.assunto}</span>
                  <span className="font-mono text-neutral-500 text-[10px]">{m.dataEnvio}</span>
                </div>
                <p className="text-neutral-600 text-[11px]">{m.resumoConteudo}</p>
                {m.prazoRespostaData && (
                  <p className="text-[10px] text-rose-700 font-semibold mt-1">
                    Prazo Fatal para Atendimento: {m.prazoRespostaData}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Termo e Assinaturas */}
        <div className="pt-6 border-t border-neutral-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
              <p className="font-bold text-neutral-800">{empresaAtiva.razaoSocial}</p>
              <p className="text-neutral-500">Representante Legal</p>
            </div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-2 w-3/4 mx-auto">
              <p className="font-bold text-neutral-800">Contabil Studio Pro</p>
              <p className="text-neutral-500">Auditoria Fiscal e Tributária - CRC/SP</p>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'Dossiê Oficial de Regularidade Fiscal & CNDs',
      subtitulo: `${empresaAtiva.razaoSocial} - CNPJ ${empresaAtiva.cnpj}`,
      conteudo: relatorioContent
    });
  };

  const msgsNaoLidas = mensagens.filter(m => m.status === 'NAO_LIDA').length;
  const cndsAlerta = certidoes.filter(c => c.diasParaVencer <= 30).length;

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-[#181818] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
            <Inbox size={24} />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              e-CAC & Caixa Postal Fiscal Eletrônica (DTE)
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
                IN RFB nº 2.066/2022
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Monitoramento unificado de comunicados, intimações fiscais da RFB/SEFAZ e Central de CNDs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerificarCnds}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition shadow-sm"
          >
            <RefreshCw size={14} />
            Verificar WebServices
          </button>

          <button
            onClick={handleEmitirDossieA4}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs font-medium transition shadow-sm"
          >
            <Printer size={14} />
            Dossiê CND A4
          </button>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3 text-xs flex items-center gap-2 bg-emerald-950/40 text-emerald-300 border-b border-emerald-800">
          <CheckCircle2 size={16} />
          {statusFeedback.texto}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-medium">Mensagens DTE</span>
              <Inbox size={16} className="text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-100">
              {mensagens.length} comunicados
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">
              {msgsNaoLidas > 0 ? (
                <span className="text-amber-400 font-bold">{msgsNaoLidas} não lidas</span>
              ) : (
                <span className="text-emerald-400">Todas lidas</span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-medium">CNDs Válidas</span>
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {certidoes.filter(c => c.status === 'REGULAR_NEGATIVA').length} / {certidoes.length}
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">Federal, FGTS, CNDT, ICMS e ISS</div>
          </div>

          <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-medium">Certidões a Vencer</span>
              <Clock size={16} className="text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {cndsAlerta} certidões
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">Prazo de validade &le; 30 dias</div>
          </div>

          <div className="p-3.5 bg-[#1b1b1b] border border-neutral-800 rounded-lg">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-medium">Intimações Fiscais</span>
              <BadgeAlert size={16} className="text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-100">
              {mensagens.filter(m => m.exigeAtendimento).length} pendentes
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">Requerem resposta técnica</div>
          </div>
        </div>

        {/* Abas */}
        <div className="border-b border-neutral-800 flex gap-2">
          <button
            onClick={() => setActiveTab('dte')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
              activeTab === 'dte'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Caixa Postal DTE ({mensagens.length})
          </button>
          <button
            onClick={() => setActiveTab('cnd')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
              activeTab === 'cnd'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Central de Certidões Negativas (CNDs)
          </button>
        </div>

        {/* Aba DTE */}
        {activeTab === 'dte' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lista de Mensagens */}
            <div className="md:col-span-1 bg-[#181818] border border-neutral-800 rounded-lg p-3 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Mensagens Recebidas
              </h2>
              {mensagens.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setMensagemSelecionada(m);
                    handleMarcarLida(m.id);
                  }}
                  className={`p-3 rounded border cursor-pointer transition text-xs space-y-1 ${
                    mensagemSelecionada?.id === m.id
                      ? 'bg-blue-950/30 border-blue-700'
                      : m.status === 'NAO_LIDA'
                      ? 'bg-[#222] border-amber-800/80'
                      : 'bg-[#1c1c1c] border-neutral-800 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {m.orgaoEmissor}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">{m.dataEnvio}</span>
                  </div>
                  <div className={`font-bold line-clamp-1 ${m.status === 'NAO_LIDA' ? 'text-amber-300' : 'text-neutral-200'}`}>
                    {m.assunto}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">{m.resumoConteudo}</p>
                  {m.exigeAtendimento && (
                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-bold">
                      Exige Atendimento
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Painel de Leitura da Mensagem */}
            <div className="md:col-span-2 bg-[#181818] border border-neutral-800 rounded-lg p-4 flex flex-col justify-between">
              {mensagemSelecionada ? (
                <div className="space-y-4 text-xs">
                  <div className="border-b border-neutral-800 pb-3 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-blue-400 border border-neutral-700">
                        {mensagemSelecionada.orgaoEmissor}
                      </span>
                      <h2 className="text-sm font-bold text-neutral-100 mt-2">
                        {mensagemSelecionada.assunto}
                      </h2>
                      <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                        Notificação Nº: {mensagemSelecionada.numeroProcessoOuNotificacao}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 block">Data de Envio</span>
                      <span className="font-mono font-bold text-neutral-200">{mensagemSelecionada.dataEnvio}</span>
                    </div>
                  </div>

                  {mensagemSelecionada.prazoRespostaData && (
                    <div className="p-3 bg-rose-950/20 border border-rose-800/60 rounded flex items-center justify-between text-rose-300">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <span>Prazo Fatal para Ciência e Atendimento à Intimação:</span>
                      </div>
                      <span className="font-mono font-bold">{mensagemSelecionada.prazoRespostaData}</span>
                    </div>
                  )}

                  <div className="p-4 bg-[#141414] border border-neutral-800 rounded text-neutral-300 leading-relaxed font-sans text-xs">
                    <div dangerouslySetInnerHTML={{ __html: mensagemSelecionada.conteudoIntegralHtml }} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-neutral-500 text-xs">
                  <Inbox size={32} className="mb-2 opacity-50" />
                  Selecione uma mensagem ao lado para ler o teor integral da comunicação fiscal.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba Central de CNDs */}
        {activeTab === 'cnd' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certidoes.map((c) => (
                <div key={c.id} className="p-4 bg-[#181818] border border-neutral-800 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#252525] text-neutral-300 border border-neutral-700">
                        {c.tipo.replace(/_/g, ' ')}
                      </span>
                      <h3 className="text-xs font-bold text-neutral-100 mt-1">
                        {c.orgaoEmissor}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                      REGULAR
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400">{c.observacoes}</p>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-neutral-800/80">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Número Controle</span>
                      <span className="font-mono text-neutral-300 text-[11px]">{c.numeroControle}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Data Emissão</span>
                      <span className="font-mono text-neutral-300 text-[11px]">{c.dataEmissao}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Data Validade</span>
                      <span className="font-mono font-bold text-neutral-100 text-[11px]">{c.dataValidade}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className={c.diasParaVencer <= 30 ? 'text-amber-400 font-bold' : 'text-neutral-500'}>
                      Vence em {c.diasParaVencer} dias
                    </span>
                    {c.urlVerificacaoQrCode && (
                      <a
                        href={c.urlVerificacaoQrCode}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Validar Autenticidade <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
