import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  DollarSign,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Printer,
  ShieldCheck,
  AlertCircle,
  FileCode,
  Calendar,
  Barcode,
  Layers,
  Receipt,
  Scale
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  DeclaracaoIssqnDief,
  RegistroServicoIssqn,
  Empresa
} from '../../types/contabil';

interface IssqnDiefModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const IssqnDiefModule: React.FC<IssqnDiefModuleProps> = ({
  empresaAtiva,
  onOpenReportPreview
}) => {
  const [competencia, setCompetencia] = useState<string>('2026-08');
  const [activeTab, setActiveTab] = useState<'apuracao' | 'prestados' | 'tomados' | 'diefTxt'>('apuracao');
  const [declaracao, setDeclaracao] = useState<DeclaracaoIssqnDief | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais de Cadastro de Serviços
  const [modalServicoAberto, setModalServicoAberto] = useState(false);
  const [editandoServico, setEditandoServico] = useState<RegistroServicoIssqn | null>(null);
  const [formTipoOp, setFormTipoOp] = useState<'PRESTADO' | 'TOMADO'>('PRESTADO');
  const [formNumDoc, setFormNumDoc] = useState('NFS-e 2026/101');
  const [formDataEmissao, setFormDataEmissao] = useState('2026-08-15');
  const [formParticipanteCnpj, setFormParticipanteCnpj] = useState('11.222.333/0001-44');
  const [formParticipanteNome, setFormParticipanteNome] = useState('Cliente Exemplo S.A.');
  const [formMunicipioTomador, setFormMunicipioTomador] = useState(empresaAtiva.cidade || 'São Paulo');
  const [formMunicipioPrestador, setFormMunicipioPrestador] = useState(empresaAtiva.cidade || 'São Paulo');
  const [formItemLc116, setFormItemLc116] = useState('01.07');
  const [formDescricao, setFormDescricao] = useState('Suporte técnico em informática e desenvolvimento web');
  const [formValor, setFormValor] = useState<number>(10000);
  const [formDeducoes, setFormDeducoes] = useState<number>(0);
  const [formAliquota, setFormAliquota] = useState<number>(5.0);
  const [formIssRetido, setFormIssRetido] = useState(false);

  const carregarDados = () => {
    const dec = dbService.getDeclaracaoIssqnDief(empresaAtiva.id, competencia);
    setDeclaracao(dec);
  };

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, competencia]);

  const handleCopiarTxt = () => {
    if (!declaracao?.arquivoDiefTxt) return;
    navigator.clipboard.writeText(declaracao.arquivoDiefTxt);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2500);
  };

  const handleDownloadTxt = () => {
    if (!declaracao?.arquivoDiefTxt) return;
    const blob = new Blob([declaracao.arquivoDiefTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DIEF_${empresaAtiva.cnpj.replace(/\D/g, '')}_${competencia.replace('-', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const abrirModalNovoServico = (tipo: 'PRESTADO' | 'TOMADO') => {
    setEditandoServico(null);
    setFormTipoOp(tipo);
    setFormNumDoc(`NFS-e 2026/${Math.floor(Math.random() * 800 + 100)}`);
    setFormDataEmissao(`${competencia}-15`);
    if (tipo === 'PRESTADO') {
      setFormParticipanteCnpj('11.222.333/0001-44');
      setFormParticipanteNome('Cliente Corporativo Ltda');
      setFormItemLc116('01.07');
      setFormDescricao('Suporte técnico em informática e sistemas de gestão');
      setFormValor(15000);
      setFormDeducoes(0);
      setFormAliquota(5.0);
      setFormIssRetido(false);
    } else {
      setFormParticipanteCnpj('44.555.666/0001-77');
      setFormParticipanteNome('Prestador de Serviços Terceirizados Ltda');
      setFormItemLc116('11.02');
      setFormDescricao('Serviços de vigilância e segurança privada');
      setFormValor(8000);
      setFormDeducoes(0);
      setFormAliquota(5.0);
      setFormIssRetido(true);
    }
    setModalServicoAberto(true);
  };

  const abrirModalEdicao = (s: RegistroServicoIssqn) => {
    setEditandoServico(s);
    setFormTipoOp(s.tipoOperacao);
    setFormNumDoc(s.numeroDocumento);
    setFormDataEmissao(s.dataEmissao);
    setFormParticipanteCnpj(s.participanteCnpjCpf);
    setFormParticipanteNome(s.participanteNome);
    setFormMunicipioTomador(s.municipioTomador);
    setFormMunicipioPrestador(s.municipioPrestador);
    setFormItemLc116(s.itemLc116);
    setFormDescricao(s.descricaoServico);
    setFormValor(s.valorServico);
    setFormDeducoes(s.deducoesLegais);
    setFormAliquota(s.aliquotaIss);
    setFormIssRetido(s.issRetido);
    setModalServicoAberto(true);
  };

  const handleSalvarServico = (e: React.FormEvent) => {
    e.preventDefault();
    const baseCalc = Math.max(0, formValor - formDeducoes);
    const vIss = Math.round((baseCalc * (formAliquota / 100)) * 100) / 100;

    const serv: RegistroServicoIssqn = {
      id: editandoServico ? editandoServico.id : `iss-srv-${Date.now()}`,
      empresaId: empresaAtiva.id,
      competencia,
      tipoOperacao: formTipoOp,
      numeroDocumento: formNumDoc,
      dataEmissao: formDataEmissao,
      participanteCnpjCpf: formParticipanteCnpj,
      participanteNome: formParticipanteNome,
      municipioTomador: formMunicipioTomador,
      municipioPrestador: formMunicipioPrestador,
      codigoMunicipioIbge: empresaAtiva.codigoIbge || '3550308',
      itemLc116: formItemLc116,
      descricaoServico: formDescricao,
      valorServico: formValor,
      deducoesLegais: formDeducoes,
      baseCalculoIss: baseCalc,
      aliquotaIss: formAliquota,
      valorIss: vIss,
      issRetido: formIssRetido,
      regimeTributacao: 'TRIBUTAVEL'
    };

    dbService.salvarServicoIssqn(serv);
    setModalServicoAberto(false);
    carregarDados();
    setMensagemStatus({ tipo: 'sucesso', texto: `Documento ${serv.numeroDocumento} salvo com sucesso!` });
    setTimeout(() => setMensagemStatus(null), 4000);
  };

  const handleExcluirServico = (id: string, num: string) => {
    if (confirm(`Deseja realmente excluir o documento ${num}?`)) {
      dbService.excluirServicoIssqn(id);
      carregarDados();
      setMensagemStatus({ tipo: 'sucesso', texto: 'Documento excluído com sucesso.' });
      setTimeout(() => setMensagemStatus(null), 3000);
    }
  };

  const handleIntegrarContabilidade = () => {
    const res = dbService.integrarIssqnContabil(empresaAtiva.id, competencia);
    if (res.sucesso) {
      setMensagemStatus({ tipo: 'sucesso', texto: res.mensagem });
    } else {
      setMensagemStatus({ tipo: 'erro', texto: res.mensagem });
    }
    setTimeout(() => setMensagemStatus(null), 5000);
  };

  // Impressão do Livro Registro de ISSQN A4
  const handleImprimirLivro = () => {
    if (!onOpenReportPreview || !declaracao) return;

    const content = (
      <div className="p-8 text-black bg-white max-w-5xl mx-auto font-sans leading-tight text-xs">
        {/* Cabeçalho */}
        <div className="border-b-2 border-black pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-extrabold uppercase">{empresaAtiva.razaoSocial}</h1>
              <p className="text-[11px] text-gray-700">CNPJ: {empresaAtiva.cnpj} | Inscrição Municipal: {empresaAtiva.inscricaoMunicipal || '1.234.567-8'}</p>
              <p className="text-[10px] text-gray-600">{empresaAtiva.logradouro}, {empresaAtiva.numero} - {empresaAtiva.cidade}/{empresaAtiva.uf} (IBGE: {empresaAtiva.codigoIbge || '3550308'})</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 border border-black font-bold text-[10px] bg-gray-100 uppercase">
                LC 116/2003 • DIEF / DMS
              </span>
              <p className="text-[10px] text-gray-500 mt-1">Competência: {competencia}</p>
            </div>
          </div>
          <div className="text-center mt-3 pt-2 border-t border-gray-300">
            <h2 className="text-sm font-bold tracking-wider uppercase">
              Livro Registro de Apuração do ISSQN (Imposto Sobre Serviços de Qualquer Natureza)
            </h2>
            <p className="text-[11px] text-gray-600 font-semibold">
              Serviços Prestados (Próprio) e Serviços Tomados com Retenção na Fonte (Substituição Tributária)
            </p>
          </div>
        </div>

        {/* Quadro 1: Serviços Prestados */}
        <div className="border border-black mb-4">
          <div className="bg-gray-200 px-3 py-1 font-bold text-xs border-b border-black flex justify-between">
            <span>1. SERVIÇOS PRESTADOS (ISSQN PRÓPRIO)</span>
            <span>Total: R$ {declaracao.totalServicosPrestados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-semibold">
                <th className="py-1 px-2 border-r border-gray-300">NFS-e</th>
                <th className="py-1 px-2 border-r border-gray-300">Data</th>
                <th className="py-1 px-2 border-r border-gray-300">Tomador</th>
                <th className="py-1 px-2 border-r border-gray-300">Item LC 116</th>
                <th className="py-1 px-2 border-r border-gray-300 text-right">Valor Serviço</th>
                <th className="py-1 px-2 border-r border-gray-300 text-right">Base Cálculo</th>
                <th className="py-1 px-2 border-r border-gray-300 text-center">Aliq %</th>
                <th className="py-1 px-2 text-right">ISS Próprio</th>
              </tr>
            </thead>
            <tbody>
              {declaracao.servicos.filter(s => s.tipoOperacao === 'PRESTADO').map(s => (
                <tr key={s.id} className="border-b border-gray-200">
                  <td className="py-1 px-2 font-mono font-bold border-r border-gray-200">{s.numeroDocumento}</td>
                  <td className="py-1 px-2 border-r border-gray-200">{new Date(s.dataEmissao + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="py-1 px-2 border-r border-gray-200 font-medium">{s.participanteNome}</td>
                  <td className="py-1 px-2 border-r border-gray-200 font-mono text-[10px]">{s.itemLc116}</td>
                  <td className="py-1 px-2 text-right font-mono border-r border-gray-200">R$ {s.valorServico.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right font-mono border-r border-gray-200">R$ {s.baseCalculoIss.toFixed(2)}</td>
                  <td className="py-1 px-2 text-center font-mono border-r border-gray-200">{s.aliquotaIss.toFixed(1)}%</td>
                  <td className="py-1 px-2 text-right font-mono font-bold">R$ {s.valorIss.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quadro 2: Serviços Tomados */}
        <div className="border border-black mb-4">
          <div className="bg-gray-200 px-3 py-1 font-bold text-xs border-b border-black flex justify-between">
            <span>2. SERVIÇOS TOMADOS COM RETENÇÃO (SUBSTITUIÇÃO TRIBUTÁRIA)</span>
            <span>Total Tomados: R$ {declaracao.totalServicosTomados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-semibold">
                <th className="py-1 px-2 border-r border-gray-300">Doc / NFS-e</th>
                <th className="py-1 px-2 border-r border-gray-300">Data</th>
                <th className="py-1 px-2 border-r border-gray-300">Prestador</th>
                <th className="py-1 px-2 border-r border-gray-300">Item LC 116</th>
                <th className="py-1 px-2 border-r border-gray-300 text-right">Valor Tomado</th>
                <th className="py-1 px-2 border-r border-gray-300 text-center">Retido?</th>
                <th className="py-1 px-2 text-right">ISS Retido</th>
              </tr>
            </thead>
            <tbody>
              {declaracao.servicos.filter(s => s.tipoOperacao === 'TOMADO').map(s => (
                <tr key={s.id} className="border-b border-gray-200">
                  <td className="py-1 px-2 font-mono border-r border-gray-200">{s.numeroDocumento}</td>
                  <td className="py-1 px-2 border-r border-gray-200">{new Date(s.dataEmissao + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="py-1 px-2 border-r border-gray-200">{s.participanteNome}</td>
                  <td className="py-1 px-2 border-r border-gray-200 font-mono text-[10px]">{s.itemLc116}</td>
                  <td className="py-1 px-2 text-right font-mono border-r border-gray-200">R$ {s.valorServico.toFixed(2)}</td>
                  <td className="py-1 px-2 text-center border-r border-gray-200 font-bold">{s.issRetido ? 'SIM' : 'NÃO'}</td>
                  <td className="py-1 px-2 text-right font-mono font-bold text-blue-900">R$ {s.valorIss.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quadro 3: Apuração e Guia DAM */}
        <div className="border border-black p-3 bg-gray-50 mb-6">
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <span className="block text-gray-500 text-[10px] uppercase font-semibold">ISS Próprio Devido</span>
              <span className="font-mono font-bold text-sm">
                R$ {declaracao.issProprioDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-[10px] uppercase font-semibold">ISS Retido na Fonte</span>
              <span className="font-mono font-bold text-sm text-blue-900">
                R$ {declaracao.issRetidoDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-[10px] uppercase font-semibold">Data de Vencimento</span>
              <span className="font-bold text-sm text-red-800">
                {new Date(declaracao.dataVencimentoDam + 'T12:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-[10px] uppercase font-semibold">Total Geral a Recolher (DAM)</span>
              <span className="font-mono font-extrabold text-base text-emerald-950">
                R$ {declaracao.totalIssRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-300 font-mono text-[10px] text-gray-600 text-center">
            Linha Digitável DAM Febraban: {declaracao.codigoBarrasGuiaDam}
          </div>
        </div>

        {/* Assinaturas */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-black text-center text-xs">
          <div>
            <div className="border-t border-black pt-1">
              <p className="font-bold uppercase">{empresaAtiva.responsavelLegal || 'Carlos Eduardo da Silva'}</p>
              <p className="text-[10px] text-gray-600">Representante Legal do Contribuinte</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-1">
              <p className="font-bold uppercase">{empresaAtiva.contadorNome || 'Roberto Barbosa'}</p>
              <p className="text-[10px] text-gray-600">Contador Responsável Técnico (CRC: {empresaAtiva.contadorCRC || 'SP-123456/O-0'})</p>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `Livro Registro de ISSQN - Competência ${competencia}`,
      `DIEF Municipal • ${empresaAtiva.razaoSocial}`,
      content,
      'portrait'
    );
  };

  const prestados = declaracao?.servicos.filter(s => s.tipoOperacao === 'PRESTADO') || [];
  const tomados = declaracao?.servicos.filter(s => s.tipoOperacao === 'TOMADO') || [];

  return (
    <div className="flex flex-col h-full bg-[#141414] text-white">
      {/* Header Superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#181818] border-b border-[#2d2d2d]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-600/20 text-cyan-400 rounded-lg border border-cyan-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                DIEF & Apuração de ISSQN Centralizada
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                LC 116/2003
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Livro de Serviços Tomados e Prestados, Guia DAM Febraban e exportação magnética municipal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#333]">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={e => setCompetencia(e.target.value)}
              aria-label="Competência de apuração do ISSQN"
              className="bg-[#2a2a2a] text-white font-bold text-xs px-2 py-1 rounded border border-[#444] focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleIntegrarContabilidade}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Integrar Contábil</span>
          </button>

          <button
            onClick={handleImprimirLivro}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 border border-[#444] rounded-lg text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Emitir Livro A4</span>
          </button>
        </div>
      </div>

      {/* Banner de Mensagens */}
      {mensagemStatus && (
        <div className={`mx-4 mt-3 p-3 rounded-lg flex items-center space-x-2 text-xs font-medium border ${
          mensagemStatus.tipo === 'sucesso'
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
            : 'bg-red-950/40 text-red-300 border-red-500/30'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{mensagemStatus.texto}</span>
        </div>
      )}

      {/* KPI Cards Superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4">
        <div className="p-3 bg-[#1c1c1c] rounded-lg border border-[#2d2d2d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Serviços Prestados</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-white font-mono">
              R$ {declaracao?.totalServicosPrestados.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
            <span className="text-[11px] text-gray-400 block mt-0.5">{prestados.length} NFS-e emitidas</span>
          </div>
        </div>

        <div className="p-3 bg-[#1c1c1c] rounded-lg border border-[#2d2d2d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Base Própria</span>
            <Scale className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-white font-mono">
              R$ {declaracao?.baseCalculoProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
            <span className="text-[11px] text-blue-400 block mt-0.5">Base Tributável</span>
          </div>
        </div>

        <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-300 text-xs font-semibold">
            <span>ISS Próprio Devido</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-cyan-200 font-mono">
              R$ {declaracao?.issProprioDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
            <span className="text-[11px] text-cyan-400 block mt-0.5">Apuração Própria</span>
          </div>
        </div>

        <div className="p-3 bg-[#1c1c1c] rounded-lg border border-[#2d2d2d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Serviços Tomados</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-white font-mono">
              R$ {declaracao?.totalServicosTomados.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
            <span className="text-[11px] text-gray-400 block mt-0.5">{tomados.length} NFS-e recebidas</span>
          </div>
        </div>

        <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
            <span>ISS Retido na Fonte</span>
            <Receipt className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-purple-200 font-mono">
              R$ {declaracao?.issRetidoDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
            <span className="text-[11px] text-purple-400 block mt-0.5">Substituição Tributária</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
            <span>Total a Recolher</span>
            <Barcode className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-emerald-300 font-mono">
              R$ {declaracao?.totalIssRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Guia DAM</span>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center space-x-1 px-4 border-b border-[#2d2d2d] bg-[#161616]">
        <button
          onClick={() => setActiveTab('apuracao')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'apuracao'
              ? 'border-cyan-500 text-cyan-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>Apuração & Guia DAM</span>
        </button>

        <button
          onClick={() => setActiveTab('prestados')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'prestados'
              ? 'border-cyan-500 text-cyan-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Serviços Prestados ({prestados.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tomados')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'tomados'
              ? 'border-cyan-500 text-cyan-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Serviços Tomados / Retenções ({tomados.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('diefTxt')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'diefTxt'
              ? 'border-cyan-500 text-cyan-400 bg-[#202020]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Exportação DIEF / DMS (.txt)</span>
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ABA 1: APURAÇÃO & GUIA DAM */}
        {activeTab === 'apuracao' && declaracao && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quadro Resumo de Apuração */}
            <div className="p-4 bg-[#181818] rounded-xl border border-[#2d2d2d] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Demonstrativo Analítico de Apuração do ISSQN</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#2d2d2d] text-gray-300">
                  <span>Total de Serviços Prestados (Receita Bruta):</span>
                  <span className="font-mono font-semibold">
                    R$ {declaracao.totalServicosPrestados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2d2d2d] text-gray-400">
                  <span>(-) Deduções da Base de Cálculo (Materiais/Subempreitada):</span>
                  <span className="font-mono">
                    R$ {declaracao.totalDeducoesPrestados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2d2d2d] text-cyan-300 font-semibold">
                  <span>(=) Base de Cálculo do ISSQN Próprio:</span>
                  <span className="font-mono">
                    R$ {declaracao.baseCalculoProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2d2d2d] text-gray-300">
                  <span>Valor do ISSQN Próprio Apurado:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    R$ {declaracao.issProprioDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2d2d2d] text-gray-300">
                  <span>(+) ISSQN Retido na Fonte (Substituição Tributária):</span>
                  <span className="font-mono font-bold text-purple-400">
                    R$ {declaracao.issRetidoDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-[#333] text-emerald-400 font-extrabold text-sm">
                  <span>(=) TOTAL GERAL A RECOLHER (GUIA DAM):</span>
                  <span className="font-mono">
                    R$ {declaracao.totalIssRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleIntegrarContabilidade}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow"
                >
                  Integrar Apuração no Diário Geral em 1-Clique
                </button>
              </div>
            </div>

            {/* Espelho da Guia DAM */}
            <div className="p-4 bg-[#181818] rounded-xl border border-[#2d2d2d] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-[#2d2d2d]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Prefeitura Municipal de {declaracao.nomeMunicipio}</span>
                    <h3 className="text-sm font-bold text-white">DAM - Documento de Arrecadação Municipal</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Febraban
                  </span>
                </div>

                <div className="my-4 p-3 bg-[#121212] rounded-lg border border-[#333] space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>
                      <span className="text-gray-500 text-[10px] block">Contribuinte:</span>
                      <span className="font-bold truncate block">{empresaAtiva.razaoSocial}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">CNPJ / Inscrição Municipal:</span>
                      <span className="font-mono">{empresaAtiva.cnpj} | {declaracao.inscricaoMunicipal}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#252525]">
                    <div>
                      <span className="text-gray-500 text-[10px] block">Competência:</span>
                      <span className="font-bold text-cyan-400">{declaracao.competencia}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">Vencimento:</span>
                      <span className="font-bold text-red-400">
                        {new Date(declaracao.dataVencimentoDam + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#252525] flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">Valor Total a Pagar:</span>
                    <span className="text-base font-extrabold font-mono text-emerald-400">
                      R$ {declaracao.totalIssRecolher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded border border-[#2d2d2d] text-center">
                  <span className="text-[10px] text-gray-500 block mb-1">Linha Digitável para Pagamento Bancário</span>
                  <p className="font-mono text-xs text-white tracking-widest font-bold">
                    {declaracao.codigoBarrasGuiaDam}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex space-x-2">
                <button
                  onClick={handleImprimirLivro}
                  className="flex-1 py-2 bg-[#252525] hover:bg-[#303030] text-gray-200 border border-[#444] rounded text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Imprimir Guia DAM</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: LIVRO DE SERVIÇOS PRESTADOS */}
        {activeTab === 'prestados' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Livro Registro de Serviços Prestados (NFS-e Emitidas)</h2>
                <p className="text-xs text-gray-400">Serviços executados com incidência do ISSQN no município</p>
              </div>
              <button
                onClick={() => abrirModalNovoServico('PRESTADO')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Nova NFS-e Prestada</span>
              </button>
            </div>

            <div className="border border-[#2d2d2d] rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-gray-400 font-semibold border-b border-[#2d2d2d]">
                    <th className="py-2.5 px-3">NFS-e</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Tomador dos Serviços</th>
                    <th className="py-2.5 px-3">Item LC 116</th>
                    <th className="py-2.5 px-3 text-right">Valor Total</th>
                    <th className="py-2.5 px-3 text-right">Base Cálculo</th>
                    <th className="py-2.5 px-3 text-center">Aliq %</th>
                    <th className="py-2.5 px-3 text-right text-cyan-400 font-bold">ISS Devido</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d2d]">
                  {prestados.map(s => (
                    <tr key={s.id} className="hover:bg-[#1e1e1e] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{s.numeroDocumento}</td>
                      <td className="py-2.5 px-3 text-gray-300">{s.dataEmissao}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-white block">{s.participanteNome}</span>
                        <span className="font-mono text-[10px] text-gray-500">{s.participanteCnpjCpf}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-[11px]">
                          {s.itemLc116}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        R$ {s.valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                        R$ {s.baseCalculoIss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-gray-300">
                        {s.aliquotaIss.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-400">
                        R$ {s.valorIss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => abrirModalEdicao(s)}
                            title="Editar NFS-e"
                            aria-label="Editar NFS-e prestada"
                            className="p-1 text-cyan-400 hover:text-cyan-300 rounded hover:bg-[#252525]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirServico(s.id, s.numeroDocumento)}
                            title="Excluir NFS-e"
                            aria-label="Excluir NFS-e prestada"
                            className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-[#252525]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {prestados.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-gray-500">
                        Nenhum serviço prestado escriturado nesta competência.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: LIVRO DE SERVIÇOS TOMADOS (RETENÇÕES) */}
        {activeTab === 'tomados' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Livro Registro de Serviços Tomados (NFS-e de Terceiros)</h2>
                <p className="text-xs text-gray-400">Serviços contratados com retenção de ISSQN na fonte (Responsabilidade Tributária)</p>
              </div>
              <button
                onClick={() => abrirModalNovoServico('TOMADO')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Nova NFS-e Tomada</span>
              </button>
            </div>

            <div className="border border-[#2d2d2d] rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#202020] text-gray-400 font-semibold border-b border-[#2d2d2d]">
                    <th className="py-2.5 px-3">Documento</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Prestador dos Serviços</th>
                    <th className="py-2.5 px-3">Item LC 116</th>
                    <th className="py-2.5 px-3 text-right">Valor Tomado</th>
                    <th className="py-2.5 px-3 text-center">Retido?</th>
                    <th className="py-2.5 px-3 text-right text-purple-400 font-bold">ISS Retido</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d2d]">
                  {tomados.map(s => (
                    <tr key={s.id} className="hover:bg-[#1e1e1e] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{s.numeroDocumento}</td>
                      <td className="py-2.5 px-3 text-gray-300">{s.dataEmissao}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-white block">{s.participanteNome}</span>
                        <span className="font-mono text-[10px] text-gray-500">{s.participanteCnpjCpf}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono text-[11px]">
                          {s.itemLc116}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        R$ {s.valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.issRetido
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {s.issRetido ? 'RETIDO' : 'NÃO'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-400">
                        R$ {s.valorIss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => abrirModalEdicao(s)}
                            title="Editar NFS-e"
                            aria-label="Editar NFS-e tomada"
                            className="p-1 text-purple-400 hover:text-purple-300 rounded hover:bg-[#252525]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirServico(s.id, s.numeroDocumento)}
                            title="Excluir NFS-e"
                            aria-label="Excluir NFS-e tomada"
                            className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-[#252525]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tomados.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-500">
                        Nenhum serviço tomado escriturado nesta competência.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: EXPORTAÇÃO DIEF (.TXT) */}
        {activeTab === 'diefTxt' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Arquivo Magnético DIEF / DMS Municipal (.txt)</h2>
                <p className="text-xs text-gray-400">Estrutura posicional padronizada para transmissão via web service municipal</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopiarTxt}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 border border-[#444] rounded text-xs transition-colors"
                >
                  {copiedTxt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedTxt ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs transition-colors shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo DIEF .txt</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-black/60 border border-[#2d2d2d] rounded-lg">
              <pre className="font-mono text-xs text-cyan-400 overflow-x-auto whitespace-pre-wrap select-all max-h-[500px]">
                {declaracao?.arquivoDiefTxt || 'Nenhum dado gerado para o arquivo DIEF.'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Inclusão/Edição de Documento */}
      {modalServicoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl max-w-xl w-full shadow-2xl">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                {editandoServico ? 'Editar Escrituração de Serviço' : `Nova NFS-e (${formTipoOp === 'PRESTADO' ? 'Prestado' : 'Tomado'})`}
              </h3>
              <button
                onClick={() => setModalServicoAberto(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarServico} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Número do Documento / NFS-e</label>
                  <input
                    type="text"
                    value={formNumDoc}
                    onChange={e => setFormNumDoc(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    value={formDataEmissao}
                    onChange={e => setFormDataEmissao(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-gray-400 mb-1">CNPJ/CPF Participante</label>
                  <input
                    type="text"
                    value={formParticipanteCnpj}
                    onChange={e => setFormParticipanteCnpj(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-400 mb-1">Razão Social / Nome</label>
                  <input
                    type="text"
                    value={formParticipanteNome}
                    onChange={e => setFormParticipanteNome(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Item da LC 116/2003</label>
                  <select
                    value={formItemLc116}
                    onChange={e => {
                      setFormItemLc116(e.target.value);
                      if (e.target.value === '01.07') setFormDescricao('Suporte técnico em informática e sistemas corporativos');
                      else if (e.target.value === '17.01') setFormDescricao('Assessoria contábil e consultoria tributária');
                      else if (e.target.value === '11.02') setFormDescricao('Vigilância e segurança privada patrimonial');
                      else if (e.target.value === '07.10') setFormDescricao('Limpeza e conservação predial');
                    }}
                    className="w-full px-2 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white"
                  >
                    <option value="01.07">01.07 - Suporte técnico em informática</option>
                    <option value="17.01">17.01 - Assessoria ou consultoria</option>
                    <option value="11.02">11.02 - Vigilância e segurança</option>
                    <option value="07.10">07.10 - Limpeza e conservação predial</option>
                    <option value="07.02">07.02 - Execução de obras e engenharia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Alíquota do ISS (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAliquota}
                    onChange={e => setFormAliquota(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Discriminação dos Serviços</label>
                <input
                  type="text"
                  value={formDescricao}
                  onChange={e => setFormDescricao(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Valor Total do Serviço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValor}
                    onChange={e => setFormValor(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Deduções Legais (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDeducoes}
                    onChange={e => setFormDeducoes(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#242424] border border-[#3a3a3a] text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chkRetido"
                  checked={formIssRetido}
                  onChange={e => setFormIssRetido(e.target.checked)}
                  className="rounded bg-[#242424] border-[#3a3a3a] text-cyan-600 focus:ring-0"
                />
                <label htmlFor="chkRetido" className="text-xs text-gray-300">
                  ISS Retido na Fonte (Substituição Tributária Municipal)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#2d2d2d]">
                <button
                  type="button"
                  onClick={() => setModalServicoAberto(false)}
                  className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-300 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
