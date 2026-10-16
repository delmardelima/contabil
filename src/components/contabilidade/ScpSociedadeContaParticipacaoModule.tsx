import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  Coins,
  ShieldCheck,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Building2,
  Landmark,
  FileCheck2,
  ArrowRightLeft,
  Calendar,
  Layers,
  FileText,
  UserCheck
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  ResumoSociedadeContaParticipacao,
  ContratoScp,
  DistribuicaoResultadoScp,
  SocioScp,
  PapelSocioScp,
  TipoFormaEscrituracaoScp
} from '../../types/contabil';

export const ScpSociedadeContaParticipacaoModule: React.FC = () => {
  const [empresaId] = useState<number>(1);
  const [resumo, setResumo] = useState<ResumoSociedadeContaParticipacao | null>(null);
  const [activeTab, setActiveTab] = useState<'contratos' | 'distribuicoes' | 'laudoA4'>('contratos');
  const [scpSelecionadaId, setScpSelecionadaId] = useState<string>('scp-01');
  const [busca, setBusca] = useState<string>('');

  // Modal Novo Contrato SCP
  const [modalNovoContrato, setModalNovoContrato] = useState<boolean>(false);
  const [formCodigoScp, setFormCodigoScp] = useState<string>('');
  const [formNomeScp, setFormNomeScp] = useState<string>('');
  const [formCnpjScp, setFormCnpjScp] = useState<string>('');
  const [formDataInicio, setFormDataInicio] = useState<string>('2026-01-01');
  const [formFormaEscrituracao, setFormFormaEscrituracao] = useState<TipoFormaEscrituracaoScp>('SUBCONTAS_LIVROS_OSTENSIVO');
  const [formObjeto, setFormObjeto] = useState<string>('');
  const [formCentroCusto, setFormCentroCusto] = useState<string>('CC-SCP-01');

  // Sócios no modal de contrato
  const [sociosForm, setSociosForm] = useState<SocioScp[]>([
    {
      id: 'soc-ost',
      nomeOuRazaoSocial: 'Construtora & Incorporadora Modelo Ltda (Sócio Ostensivo)',
      cpfCnpj: '12.345.678/0001-90',
      papel: 'SOCIO_OSTENSIVO',
      percentualParticipacao: 60,
      capitalSubscritoBRL: 600000,
      capitalIntegralizadoBRL: 600000,
      contaContabilCapital: '2.04.01.01.001',
      contaContabilDistribuicao: '2.01.05.01.001'
    },
    {
      id: 'soc-part-1',
      nomeOuRazaoSocial: 'Investidor Participante Aportador',
      cpfCnpj: '98.765.432/0001-10',
      papel: 'SOCIO_PARTICIPANTE',
      percentualParticipacao: 40,
      capitalSubscritoBRL: 400000,
      capitalIntegralizadoBRL: 400000,
      contaContabilCapital: '2.04.01.02.001',
      contaContabilDistribuicao: '2.01.05.02.001'
    }
  ]);

  // Modal Nova Distribuição de Resultado
  const [modalNovaDist, setModalNovaDist] = useState<boolean>(false);
  const [formDistScpId, setFormDistScpId] = useState<string>('scp-01');
  const [formDistCompetencia, setFormDistCompetencia] = useState<string>('2026-03');
  const [formDistResultado, setFormDistResultado] = useState<number>(100000);
  const [formDistDataApuracao, setFormDistDataApuracao] = useState<string>('2026-03-31');
  const [formDistDataPagamento, setFormDistDataPagamento] = useState<string>('2026-04-10');
  const [formDistObservacoes, setFormDistObservacoes] = useState<string>('');

  // Notificações
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarDados = () => {
    const dados = dbService.getScpSociedade(empresaId);
    setResumo(dados);
    if (dados.contratos.length > 0 && !dados.contratos.find(c => c.id === scpSelecionadaId)) {
      setScpSelecionadaId(dados.contratos[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const exibirNotificacao = (tipo: 'sucesso' | 'erro', texto: string) => {
    setNotificacao({ tipo, texto });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSalvarContrato = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomeScp) {
      exibirNotificacao('erro', 'O nome do empreendimento SCP é obrigatório.');
      return;
    }

    const totalPerc = sociosForm.reduce((acc, s) => acc + s.percentualParticipacao, 0);
    if (Math.abs(totalPerc - 100) > 0.01) {
      exibirNotificacao('erro', `A soma da participação dos sócios deve ser exatamente 100% (atual: ${totalPerc}%).`);
      return;
    }

    const capTotal = sociosForm.reduce((acc, s) => acc + s.capitalIntegralizadoBRL, 0);

    const res = dbService.salvarContratoScp({
      empresaId,
      codigoScp: formCodigoScp || `SCP-${String((resumo?.contratos.length || 0) + 1).padStart(3, '0')}`,
      nomeScp: formNomeScp,
      cnpjScp: formCnpjScp,
      dataInicio: formDataInicio,
      formaEscrituracao: formFormaEscrituracao,
      objetoEmpreendimento: formObjeto,
      centroCustoResultadoId: formCentroCusto,
      capitalTotalBRL: capTotal,
      saldoDisponivelDistribuicaoBRL: 0,
      socios: sociosForm,
      status: 'ATIVO'
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovoContrato(false);
      setFormNomeScp('');
      setFormCnpjScp('');
      setFormObjeto('');
      carregarDados();
    }
  };

  const handleSalvarDistribuicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (formDistResultado <= 0) {
      exibirNotificacao('erro', 'O resultado líquido apurado deve ser superior a zero.');
      return;
    }

    const contrato = resumo?.contratos.find(c => c.id === formDistScpId);
    if (!contrato) {
      exibirNotificacao('erro', 'Contrato SCP não localizado.');
      return;
    }

    // Calcula rateio entre os sócios conforme % de participação
    const itensRateio = contrato.socios.map(s => {
      const valorDist = (formDistResultado * s.percentualParticipacao) / 100;
      return {
        socioId: s.id,
        nomeSocio: s.nomeOuRazaoSocial,
        cpfCnpj: s.cpfCnpj,
        papel: s.papel,
        percentual: s.percentualParticipacao,
        valorDistribuidoBRL: valorDist,
        retencaoIrrfBRL: 0.00, // ISENTO Art. 10 Lei 9.249/95
        valorLiquidoPagoBRL: valorDist,
        contaDebito: '2.04.02.01.001',
        contaCredito: s.contaContabilDistribuicao || '2.01.05.01.001'
      };
    });

    const res = dbService.salvarDistribuicaoResultadoScp({
      contratoScpId: formDistScpId,
      empresaId,
      competencia: formDistCompetencia,
      resultadoLiquidoApuradoBRL: formDistResultado,
      dataApuracao: formDistDataApuracao,
      dataDistribuicao: formDistDataPagamento,
      itensRateio,
      observacoes: formDistObservacoes || 'Distribuição de lucros proporcional ao capital social (isento de IRRF).'
    });

    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      setModalNovaDist(false);
      carregarDados();
    }
  };

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarDistribuicaoScpContabil(id);
    if (res.sucesso) {
      exibirNotificacao('sucesso', res.mensagem);
      carregarDados();
    } else {
      exibirNotificacao('erro', res.mensagem);
    }
  };

  const empresa = dbService.getEmpresa(empresaId);
  const scpAtiva = resumo?.contratos.find(c => c.id === scpSelecionadaId) || resumo?.contratos[0];
  const distribuicoesScpAtiva = (resumo?.distribuicoes || []).filter(d => d.contratoScpId === scpAtiva?.id);

  const contratosFiltrados = (resumo?.contratos || []).filter(
    c =>
      c.nomeScp.toLowerCase().includes(busca.toLowerCase()) ||
      c.codigoScp.toLowerCase().includes(busca.toLowerCase()) ||
      (c.cnpjScp && c.cnpjScp.includes(busca))
  );

  return (
    <div className="flex flex-col h-full bg-[#121212] text-zinc-100 overflow-y-auto">
      {/* Top Header */}
      <div className="p-6 border-b border-zinc-800 bg-[#181818] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  SCP - Sociedade em Conta de Participação
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 font-semibold">
                  Módulo Domínio scpcad01.pbd
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                  IN RFB nº 2.179/2024
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Segregação contábil, rateio de aportes entre Sócio Ostensivo e Participantes (Investidores) e distribuição isenta de lucros (Art. 10 Lei 9.249/95).
              </p>
            </div>
          </div>
        </div>

        {/* Controles e Ações */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setModalNovoContrato(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova SCP
          </button>

          <button
            onClick={() => setModalNovaDist(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <Coins className="w-4 h-4" />
            Distribuir Lucro
          </button>

          <button
            onClick={() => setActiveTab('laudoA4')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            Prestação de Contas A4
          </button>
        </div>
      </div>

      {/* Alerta de Notificação */}
      {notificacao && (
        <div
          className={`mx-6 mt-4 p-3 rounded-lg border text-sm flex items-center justify-between ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificacao.tipo === 'sucesso' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notificacao.texto}</span>
          </div>
          <button onClick={() => setNotificacao(null)} className="text-xs hover:underline">Fechar</button>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>SCPs ATIVAS</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {resumo?.totalScpsAtivas || 0}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Empreendimentos sob gestão ostensiva</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>CAPITAL INVESTIDO TOTAL</span>
            <Coins className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-blue-400">
            R$ {(resumo?.capitalTotalInvestidoBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Sócio Ostensivo + Participantes</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>LUCROS APURADOS (SCP)</span>
            <Landmark className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400">
            R$ {(resumo?.totalResultadosApuradosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Resultado líquido dos empreendimentos</div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>LUCROS DISTRIBUÍDOS ISENTOS</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-400">
            R$ {(resumo?.totalLucrosDistribuidosIsentosBRL || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">0% IRRF (Art. 10 Lei 9.249/95)</div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="px-6 border-b border-zinc-800 flex gap-4">
        <button
          onClick={() => setActiveTab('contratos')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'contratos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Empreendimentos & Quadro Societário ({resumo?.contratos?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('distribuicoes')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'distribuicoes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Distribuição e Rateio de Lucros ({resumo?.distribuicoes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('laudoA4')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'laudoA4' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Prestação de Contas SCP A4
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-6 flex-1">
        {/* ABA 1: CONTRATOS E QUADRO SOCIETÁRIO */}
        {activeTab === 'contratos' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar SCP por código ou nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-[#181818] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="text-xs text-zinc-400">
                Forma de Escrituração: Subcontas nos livros da Ostensiva (IN RFB 2.179/2024) ou CNPJ próprio.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contratosFiltrados.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setScpSelecionadaId(c.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    scpSelecionadaId === c.id
                      ? 'bg-[#1c1c1c] border-emerald-500/80 shadow-lg ring-1 ring-emerald-500/30'
                      : 'bg-[#181818] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                          {c.codigoScp}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                          {c.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1.5">{c.nomeScp}</h3>
                      {c.cnpjScp && (
                        <span className="text-xs text-zinc-400 font-mono">CNPJ SCP: {c.cnpjScp}</span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Capital Total</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        R$ {c.capitalTotalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                    {c.objetoEmpreendimento}
                  </p>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
                    <div>
                      Início: <strong className="text-zinc-200">{c.dataInicio}</strong>
                    </div>
                    <div>
                      Centro de Custo: <strong className="text-zinc-200">{c.centroCustoResultadoId}</strong>
                    </div>
                    <div>
                      Sócios: <strong className="text-emerald-400">{c.socios.length}</strong>
                    </div>
                  </div>

                  {/* Detalhe dos sócios */}
                  <div className="mt-4 space-y-2 bg-[#141414] p-3 rounded-lg border border-zinc-800/80">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                      Quadro Societário (Ostensivo x Participantes)
                    </span>
                    {c.socios.map((s) => (
                      <div key={s.id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full ${s.papel === 'SOCIO_OSTENSIVO' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                          <span className="text-zinc-200 truncate">{s.nomeOuRazaoSocial}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({s.papel === 'SOCIO_OSTENSIVO' ? 'Ostensivo' : 'Investidor'})</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono">
                          <span className="text-zinc-400">{s.percentualParticipacao}%</span>
                          <span className="font-semibold text-white">
                            R$ {s.capitalIntegralizadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 2: DISTRIBUIÇÃO E RATEIO DE LUCROS */}
        {activeTab === 'distribuicoes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#181818] p-4 rounded-xl border border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Distribuições de Resultados Realizadas ({resumo?.distribuicoes?.length || 0})
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Rateio proporcional às quotas com isenção total de IRRF nos termos do Art. 10 da Lei nº 9.249/95.
                </p>
              </div>

              <button
                onClick={() => setModalNovaDist(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                Lançar Nova Distribuição
              </button>
            </div>

            <div className="space-y-4">
              {(resumo?.distribuicoes || []).map((dist) => {
                const c = resumo?.contratos.find(ct => ct.id === dist.contratoScpId);
                return (
                  <div key={dist.id} className="bg-[#181818] border border-zinc-800 rounded-xl p-5 shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-zinc-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                            {c?.codigoScp || 'SCP'}
                          </span>
                          <span className="font-bold text-white text-sm">{c?.nomeScp}</span>
                          <span className="text-xs text-zinc-400 font-mono">Competência: {dist.competencia}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{dist.observacoes}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Resultado Apurado</span>
                          <span className="text-base font-bold font-mono text-emerald-400">
                            R$ {dist.resultadoLiquidoApuradoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {!dist.integradoContabil ? (
                          <button
                            onClick={() => handleIntegrarContabil(dist.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Integrar Contábil
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                            Integrado Lote {dist.loteContabilId}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tabela de rateio aos sócios */}
                    <div className="mt-4">
                      <table className="w-full text-left text-xs">
                        <thead className="text-zinc-500 border-b border-zinc-800 pb-2">
                          <tr>
                            <th className="py-2">Sócio Beneficiário</th>
                            <th className="py-2">Papel</th>
                            <th className="py-2">CPF / CNPJ</th>
                            <th className="py-2 text-right">Participação</th>
                            <th className="py-2 text-right">Valor Distribuído</th>
                            <th className="py-2 text-right">IRRF Retido</th>
                            <th className="py-2 text-right">Líquido Pago</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40 font-mono">
                          {dist.itensRateio.map((item) => (
                            <tr key={item.socioId}>
                              <td className="py-2.5 font-sans font-semibold text-zinc-200">{item.nomeSocio}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.papel === 'SOCIO_OSTENSIVO' ? 'bg-emerald-950 text-emerald-300' : 'bg-blue-950 text-blue-300'
                                }`}>
                                  {item.papel === 'SOCIO_OSTENSIVO' ? 'OSTENSIVO' : 'PARTICIPANTE'}
                                </span>
                              </td>
                              <td className="py-2.5 text-zinc-400">{item.cpfCnpj}</td>
                              <td className="py-2.5 text-right text-zinc-300">{item.percentual.toFixed(1)}%</td>
                              <td className="py-2.5 text-right font-bold text-white">
                                R$ {item.valorDistribuidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2.5 text-right text-emerald-400 font-semibold">
                                R$ 0,00 (ISENTO)
                              </td>
                              <td className="py-2.5 text-right font-bold text-emerald-400">
                                R$ {item.valorLiquidoPagoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 3: LAUDO OFICIAL PRESTAÇÃO DE CONTAS SCP A4 */}
        {activeTab === 'laudoA4' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Selecione o Empreendimento SCP:</span>
                <select
                  value={scpSelecionadaId}
                  onChange={(e) => setScpSelecionadaId(e.target.value)}
                  className="bg-[#181818] border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
                >
                  {(resumo?.contratos || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.codigoScp} - {c.nomeScp}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir Prestação de Contas A4
              </button>
            </div>

            <div className="bg-white text-black p-8 rounded-xl shadow-2xl max-w-4xl mx-auto font-sans border border-zinc-300 print:m-0 print:border-none print:shadow-none">
              {/* Header do Laudo */}
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div>
                  <div className="text-xl font-black uppercase tracking-wider text-black">
                    RELATÓRIO DE PRESTAÇÃO DE CONTAS & RESULTADOS - SCP
                  </div>
                  <div className="text-xs font-semibold text-zinc-700 mt-1">
                    SOCIEDADE EM CONTA DE PARTICIPAÇÃO - CÓDIGO CIVIL ARTS. 991 A 996
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    Isenção Tributária de Distribuição de Lucros: Lei Federal nº 9.249/95 (Art. 10)
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="font-bold text-sm text-black">{empresa?.razaoSocial}</div>
                  <div className="text-zinc-600">Sócio Ostensivo CNPJ: {empresa?.cnpj}</div>
                  <div className="text-zinc-600 font-mono">Empreendimento: {scpAtiva?.codigoScp}</div>
                  <div className="text-zinc-500 text-[10px]">Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {/* Informações da SCP */}
              <div className="my-6 p-4 bg-zinc-50 rounded border border-zinc-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Denominação do Empreendimento</span>
                    <span className="font-bold text-sm text-black">{scpAtiva?.nomeScp}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 font-semibold text-[10px] uppercase">CNPJ Próprio / Subconta</span>
                    <span className="font-bold font-mono text-black">{scpAtiva?.cnpjScp || 'Escrituração em Subcontas do Ostensivo'}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-zinc-500 font-semibold text-[10px] uppercase">Objeto Social do Contrato</span>
                  <span className="text-zinc-800">{scpAtiva?.objetoEmpreendimento}</span>
                </div>
              </div>

              {/* Tabela do Quadro Societário e Aportes */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2 border-b border-zinc-400 pb-1">
                  1. Quadro Societário e Participação no Capital Subscrito / Integralizado
                </h4>
                <table className="w-full text-left text-[11px] border border-zinc-300">
                  <thead className="bg-zinc-100 text-black font-bold border-b border-zinc-300">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-zinc-300">Sócio / Razão Social</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300">Papel Societário</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300">CPF / CNPJ</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Quota (%)</th>
                      <th className="py-1.5 px-2 text-right">Capital Integralizado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {(scpAtiva?.socios || []).map((s) => (
                      <tr key={s.id}>
                        <td className="py-1.5 px-2 font-bold border-r border-zinc-300">{s.nomeOuRazaoSocial}</td>
                        <td className="py-1.5 px-2 border-r border-zinc-300">
                          {s.papel === 'SOCIO_OSTENSIVO' ? 'SÓCIO OSTENSIVO' : 'SÓCIO PARTICIPANTE'}
                        </td>
                        <td className="py-1.5 px-2 font-mono border-r border-zinc-300">{s.cpfCnpj}</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-zinc-300">{s.percentualParticipacao}%</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold">
                          R$ {s.capitalIntegralizadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Histórico de Resultados Distribuídos */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2 border-b border-zinc-400 pb-1">
                  2. Demonstrativo de Rateio de Lucros e Rendimentos Isentos
                </h4>
                <table className="w-full text-left text-[11px] border border-zinc-300">
                  <thead className="bg-zinc-100 text-black font-bold border-b border-zinc-300">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-zinc-300">Competência</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300">Sócio Beneficiário</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Quota</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Rendimento Bruto</th>
                      <th className="py-1.5 px-2 border-r border-zinc-300 text-right">Retenção IRRF</th>
                      <th className="py-1.5 px-2 text-right">Líquido Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-mono">
                    {distribuicoesScpAtiva.flatMap(d =>
                      d.itensRateio.map(r => (
                        <tr key={`${d.id}-${r.socioId}`}>
                          <td className="py-1.5 px-2 border-r border-zinc-300">{d.competencia}</td>
                          <td className="py-1.5 px-2 font-sans border-r border-zinc-300">{r.nomeSocio}</td>
                          <td className="py-1.5 px-2 text-right border-r border-zinc-300">{r.percentual}%</td>
                          <td className="py-1.5 px-2 text-right border-r border-zinc-300">
                            R$ {r.valorDistribuidoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-1.5 px-2 text-right border-r border-zinc-300 text-zinc-600">
                            R$ 0,00 (ISENTO)
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-black">
                            R$ {r.valorLiquidoPagoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Declaração de Regularidade Legal */}
              <div className="mt-8 p-4 bg-zinc-50 border border-zinc-300 rounded text-xs text-zinc-700 leading-relaxed text-justify">
                <strong>Cláusula de Quitação e Prestação de Contas:</strong> O Sócio Ostensivo presta as presentes contas relativas aos resultados
                econômicos e financeiros do empreendimento, atestando que todas as obrigações tributárias principais e acessórias do negócio foram
                regularmente adimplidas em nome da sociedade. Os rendimentos distribuídos aos sócios participantes e ostensivo são isentos do imposto
                sobre a renda na fonte e na declaração de ajuste anual, em estrita observância ao <strong>Artigo 10 da Lei Federal nº 9.249/1995</strong>,
                devendo ser informados na Ficha de Rendimentos Isentos e Não Tributáveis.
              </div>

              {/* Assinaturas */}
              <div className="mt-12 pt-6 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-black w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-black">{empresa?.razaoSocial}</div>
                  <div className="text-zinc-600 text-[10px]">Sócio Ostensivo / Administrador do Contrato</div>
                </div>
                <div>
                  <div className="border-b border-black w-4/5 mx-auto mb-1"></div>
                  <div className="font-bold text-black">Responsável Técnico Contábil</div>
                  <div className="text-zinc-600 text-[10px]">CRC/UF Ativo | Termo de Escrituração Segregada</div>
                </div>
              </div>

              <div className="mt-8 text-center text-[9px] text-zinc-500 font-mono">
                Autenticação de Registro Contábil: SCP-CC991-{scpAtiva?.codigoScp}-A9024B1889C7701
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Contrato SCP */}
      {modalNovoContrato && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-zinc-700 rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Cadastrar Nova Sociedade em Conta de Participação (SCP)</h3>
            <form onSubmit={handleSalvarContrato} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Código Identificador</label>
                  <input
                    type="text"
                    placeholder="Ex: SCP-003"
                    value={formCodigoScp}
                    onChange={(e) => setFormCodigoScp(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">CNPJ Específico SCP (opcional)</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formCnpjScp}
                    onChange={(e) => setFormCnpjScp(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Denominação do Empreendimento</label>
                <input
                  type="text"
                  placeholder="Ex: SCP Loteamento Parque dos Pinheiros"
                  value={formNomeScp}
                  onChange={(e) => setFormNomeScp(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Forma de Escrituração</label>
                  <select
                    value={formFormaEscrituracao}
                    onChange={(e) => setFormFormaEscrituracao(e.target.value as any)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SUBCONTAS_LIVROS_OSTENSIVO">Subcontas nos Livros da Ostensiva</option>
                    <option value="LIVROS_PROPRIOS_CNPJ_SCP">Livros Próprios da SCP (CNPJ Específico)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Centro de Custo / Resultado</label>
                  <input
                    type="text"
                    value={formCentroCusto}
                    onChange={(e) => setFormCentroCusto(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Objeto do Empreendimento</label>
                <textarea
                  rows={2}
                  placeholder="Descrição das atividades desenvolvidas pela SCP..."
                  value={formObjeto}
                  onChange={(e) => setFormObjeto(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalNovoContrato(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                >
                  Salvar SCP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Distribuição de Resultado */}
      {modalNovaDist && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Lançar Distribuição de Resultados da SCP</h3>
            <form onSubmit={handleSalvarDistribuicao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Empreendimento SCP</label>
                <select
                  value={formDistScpId}
                  onChange={(e) => setFormDistScpId(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {(resumo?.contratos || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.codigoScp} - {c.nomeScp}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Competência</label>
                  <input
                    type="month"
                    value={formDistCompetencia}
                    onChange={(e) => setFormDistCompetencia(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Lucro Apurado a Ratear (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formDistResultado || ''}
                    onChange={(e) => setFormDistResultado(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Data da Apuração</label>
                  <input
                    type="date"
                    value={formDistDataApuracao}
                    onChange={(e) => setFormDistDataApuracao(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Data de Pagamento</label>
                  <input
                    type="date"
                    value={formDistDataPagamento}
                    onChange={(e) => setFormDistDataPagamento(e.target.value)}
                    className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Observações do Rateio</label>
                <input
                  type="text"
                  placeholder="Ex: Rateio proporcional das unidades comercializadas no 1º trimestre..."
                  value={formDistObservacoes}
                  onChange={(e) => setFormDistObservacoes(e.target.value)}
                  className="w-full bg-[#202020] border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalNovaDist(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
                >
                  Efetivar Distribuição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
