import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartPulse,
  FileText,
  DollarSign,
  Download,
  Copy,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Printer,
  RefreshCw,
  Users,
  ShieldCheck,
  Activity,
  Calendar,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  RegistroRopServicoMedico,
  RegistroDdmPlanoSaude,
  DeclaracaoDmed,
  Empresa
} from '../../types/contabil';

interface DmedModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const DmedModule: React.FC<DmedModuleProps> = ({ empresaAtiva, onOpenReportPreview }) => {
  const [activeTab, setActiveTab] = useState<'rop' | 'ddm' | 'arquivo'>('rop');
  const [anoCalendario, setAnoCalendario] = useState<number>(2026);
  const [declaracao, setDeclaracao] = useState<DeclaracaoDmed | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais
  const [modalRopAberto, setModalRopAberto] = useState(false);
  const [editRop, setEditRop] = useState<RegistroRopServicoMedico | null>(null);

  const [modalDdmAberto, setModalDdmAberto] = useState(false);
  const [editDdm, setEditDdm] = useState<RegistroDdmPlanoSaude | null>(null);

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, anoCalendario]);

  const carregarDados = () => {
    const dec = dbService.getDeclaracaoDmed(empresaAtiva.id, anoCalendario);
    setDeclaracao(dec);
  };

  const mostrarMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagemStatus({ tipo, texto });
    setTimeout(() => setMensagemStatus(null), 4500);
  };

  const handleSalvarRop = (servico: RegistroRopServicoMedico) => {
    dbService.salvarServicoMedicoDmed(servico);
    carregarDados();
    setModalRopAberto(false);
    mostrarMensagem('sucesso', 'Serviço Médico salvo com sucesso na DMED!');
  };

  const handleExcluirRop = (id: string) => {
    dbService.excluirServicoMedicoDmed(id);
    carregarDados();
    mostrarMensagem('sucesso', 'Serviço Médico excluído com sucesso!');
  };

  const handleSalvarDdm = (plano: RegistroDdmPlanoSaude) => {
    dbService.salvarPlanoSaudeDmed(plano);
    carregarDados();
    setModalDdmAberto(false);
    mostrarMensagem('sucesso', 'Registro de Plano de Saúde salvo com sucesso!');
  };

  const handleExcluirDdm = (id: string) => {
    dbService.excluirPlanoSaudeDmed(id);
    carregarDados();
    mostrarMensagem('sucesso', 'Registro de Plano de Saúde excluído com sucesso!');
  };

  const handleIntegrarContabil = () => {
    const res = dbService.integrarDmedContabil(empresaAtiva.id, anoCalendario);
    if (res.sucesso) {
      mostrarMensagem('sucesso', res.mensagem);
    } else {
      mostrarMensagem('erro', res.mensagem);
    }
  };

  const handleCopiarTxt = () => {
    if (!declaracao?.arquivoDmedTxt) return;
    navigator.clipboard.writeText(declaracao.arquivoDmedTxt);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2500);
  };

  const handleBaixarTxt = () => {
    if (!declaracao?.arquivoDmedTxt) return;
    const blob = new Blob([declaracao.arquivoDmedTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DMED_${empresaAtiva.cnpj.replace(/\D/g, '')}_${anoCalendario}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Impressão A4 Oficial: Recibo de Prestação de Serviços de Saúde para IRPF
  const handleImprimirReciboSaude = (servico?: RegistroRopServicoMedico) => {
    if (!declaracao || !onOpenReportPreview) return;
    const alvo = servico || declaracao.servicosPrestados[0];
    if (!alvo) {
      mostrarMensagem('erro', 'Nenhum serviço médico selecionado para emissão do recibo.');
      return;
    }

    const content = (
      <div className="font-sans text-xs text-neutral-800 leading-relaxed max-w-2xl mx-auto">
        <div className="border-b-2 border-neutral-700 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-bold text-neutral-900 uppercase">
                {empresaAtiva.razaoSocial}
              </h1>
              <p className="text-xs text-neutral-600">
                CNPJ: {empresaAtiva.cnpj} | Inscrição Municipal: {empresaAtiva.inscricaoMunicipal || 'Isento'}
              </p>
              <p className="text-xs text-neutral-600">
                Endereço: {empresaAtiva.logradouro}, {empresaAtiva.numero} - {empresaAtiva.cidade}/{empresaAtiva.uf}
              </p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 font-mono font-bold text-xs rounded">
                RECIBO MÉDICO IRPF
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">
                IN RFB nº 2.072/2022 (DMED)
              </p>
            </div>
          </div>
        </div>

        <div className="text-center my-6 py-2 border-y border-neutral-300">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            RECIBO DE PRESTAÇÃO DE SERVIÇOS MÉDICOS E ODONTOLÓGICOS
          </h2>
          <p className="text-[11px] text-neutral-600 font-mono">
            Documento nº: {alvo.numeroReciboNfse} | Emissão: {alvo.dataAtendimento}
          </p>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-300 rounded mb-4 space-y-2 text-xs">
          <p>
            Recebemos de <strong>{alvo.responsavelNome}</strong>, inscrito(a) no CPF/MF sob o nº{' '}
            <strong className="font-mono">{alvo.responsavelCpf}</strong>, a importância de{' '}
            <strong className="font-mono text-emerald-800 text-sm">
              R$ {alvo.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>, referente à prestação de serviços de saúde na modalidade{' '}
            <strong>{alvo.tipoServicoSaude.replace(/_/g, ' ')}</strong>.
          </p>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-300 rounded mb-4 text-xs space-y-2">
          <h3 className="font-bold text-neutral-900 uppercase text-[11px] border-b border-neutral-200 pb-1">
            Discriminação do Beneficiário do Tratamento:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-neutral-500 block text-[10px]">Paciente / Beneficiário:</span>
              <strong className="text-neutral-900">{alvo.beneficiarioNome}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">CPF do Paciente:</span>
              <strong className="font-mono text-neutral-900">{alvo.beneficiarioCpf || 'Menor sob dependência'}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Data de Nascimento:</span>
              <strong className="text-neutral-900 font-mono">{alvo.beneficiarioDataNascimento}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Grau de Parentesco / Relação:</span>
              <strong className="text-neutral-900">{alvo.parentescoBeneficiario.replace(/_/g, ' ')}</strong>
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-300 rounded mb-4 text-xs space-y-2">
          <h3 className="font-bold text-neutral-900 uppercase text-[11px] border-b border-neutral-200 pb-1">
            Profissional de Saúde Responsável pelo Atendimento:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-neutral-500 block text-[10px]">Nome do Profissional:</span>
              <strong className="text-neutral-900">{alvo.profissionalNome}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Registro no Conselho Regional:</span>
              <strong className="font-mono text-neutral-900">{alvo.profissionalCrmCro}</strong>
            </div>
          </div>
        </div>

        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded text-[10px] text-neutral-600 mb-8">
          <p className="font-bold mb-1">DECLARAÇÃO PARA FINS FISCAIS (DMED - RECEITA FEDERAL):</p>
          <p>
            Declaramos, sob as penas da lei (Art. 299 do Código Penal), que os serviços acima discriminados foram efetivamente prestados e os respectivos valores serão devidamente informados à Receita Federal do Brasil por meio da Declaração de Serviços Médicos e de Saúde (DMED) do ano-calendário {anoCalendario}.
          </p>
        </div>

        <div className="mt-12 pt-4 border-t border-neutral-300 flex justify-between text-center text-xs">
          <div className="w-64 border-t border-neutral-700 pt-1">
            <p className="font-bold">{alvo.profissionalNome}</p>
            <p className="text-[10px] text-neutral-500">{alvo.profissionalCrmCro}</p>
          </div>
          <div className="w-64 border-t border-neutral-700 pt-1">
            <p className="font-bold">{empresaAtiva.razaoSocial}</p>
            <p className="text-[10px] text-neutral-500">CNPJ: {empresaAtiva.cnpj}</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `Recibo Médico IRPF - Paciente ${alvo.beneficiarioNome}`,
      `Recibo nº ${alvo.numeroReciboNfse} | ${alvo.tipoServicoSaude}`,
      content,
      'portrait'
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#181818]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                DMED - Declaração de Serviços Médicos e de Saúde
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                IN RFB 2.072/2022
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Serviços Prestados por Médicos/Dentistas/Clínicas (ROP), Planos Privados (DDM) e Recibos Dedutíveis IRPF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#202020] border border-neutral-700 rounded-md">
            <span className="text-xs text-neutral-400 font-medium">Ano-Calendário:</span>
            <select
              value={anoCalendario}
              onChange={e => setAnoCalendario(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#1c1c1c]">2026</option>
              <option value={2025} className="bg-[#1c1c1c]">2025</option>
              <option value={2024} className="bg-[#1c1c1c]">2024</option>
            </select>
          </div>

          <button
            onClick={handleIntegrarContabil}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md text-xs font-medium text-emerald-400 transition-colors"
            title="Integrar receitas de serviços de saúde no Livro Diário Geral"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Integrar Contabilidade
          </button>

          <button
            onClick={() => handleImprimirReciboSaude()}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md text-xs font-medium text-blue-400 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Recibo IRPF A4
          </button>

          <button
            onClick={handleBaixarTxt}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar .txt DMED
          </button>
        </div>
      </div>

      {/* Banner de Feedback */}
      {mensagemStatus && (
        <div className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
          mensagemStatus.tipo === 'sucesso' 
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
            : 'bg-red-950/60 text-red-300 border-red-800/40'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {mensagemStatus.texto}
          </div>
          <button onClick={() => setMensagemStatus(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-[#181818]/50 border-b border-neutral-800">
        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Atendimentos Médicos (ROP)</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {declaracao?.servicosPrestados.length || 0} Pacientes
          </div>
          <span className="text-[10px] text-neutral-500">
            Consultas, cirurgias e exames
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Valor Total Pago (R$)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {(declaracao?.totalValorPagoServicos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500">
            Faturamento bruto dos serviços
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Reembolsado aos Pacientes</span>
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {(declaracao?.totalValorReembolsado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500">
            Valores reembolsados por convênios
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total Dedutível no IRPF</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {(declaracao?.totalValorDedutivel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            100% Homologado para Malha Fina
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 border-b border-neutral-800 bg-[#161616]">
        <button
          onClick={() => setActiveTab('rop')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'rop'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Serviços Médicos Prestados (ROP)
          <span className="px-1.5 py-0.2 bg-neutral-800 text-[10px] rounded-full text-neutral-300">
            {declaracao?.servicosPrestados.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ddm')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'ddm'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Planos e Operadoras de Saúde (DDM)
          <span className="px-1.5 py-0.2 bg-neutral-800 text-[10px] rounded-full text-neutral-300">
            {declaracao?.planosSaude.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('arquivo')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'arquivo'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Arquivo Oficial DMED (.txt)
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto p-6">
        {/* ABA 1: ROP */}
        {activeTab === 'rop' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Relação de Atendimentos e Serviços de Saúde (Registro ROP)
                </h3>
                <p className="text-xs text-neutral-400">
                  Cruzamento dos pagamentos efetuados por pessoas físicas e identificação dos beneficiários atendidos.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditRop({
                    id: `dmed-rop-${Date.now()}`,
                    empresaId: empresaAtiva.id,
                    anoCalendario: anoCalendario,
                    responsavelCpf: '',
                    responsavelNome: '',
                    beneficiarioCpf: '',
                    beneficiarioNome: '',
                    beneficiarioDataNascimento: '1990-01-01',
                    parentescoBeneficiario: 'TITULAR',
                    tipoServicoSaude: 'CONSULTA_MEDICA',
                    profissionalCrmCro: 'CRM-SP 123456',
                    profissionalNome: 'Dr. Médico Responsável',
                    dataAtendimento: `${anoCalendario}-05-01`,
                    numeroReciboNfse: `REC-${Date.now().toString().slice(-4)}`,
                    valorPago: 1500,
                    valorReembolsado: 0,
                    valorDedutivel: 1500
                  });
                  setModalRopAberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                Novo Atendimento Médico
              </button>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                    <th className="p-3 font-semibold">Responsável Financeiro</th>
                    <th className="p-3 font-semibold">Paciente / Beneficiário</th>
                    <th className="p-3 font-semibold">Serviço / Profissional</th>
                    <th className="p-3 font-semibold text-center">Data / Recibo</th>
                    <th className="p-3 font-semibold text-right">Valor Pago</th>
                    <th className="p-3 font-semibold text-right">Reembolsado</th>
                    <th className="p-3 font-semibold text-right">Dedutível IRPF</th>
                    <th className="p-3 font-semibold text-center w-28">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {declaracao?.servicosPrestados.map(s => (
                    <tr key={s.id} className="hover:bg-neutral-800/40">
                      <td className="p-3">
                        <div className="text-white font-medium">{s.responsavelNome}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{s.responsavelCpf}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-neutral-200">{s.beneficiarioNome}</div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                          <span className="font-mono">{s.beneficiarioDataNascimento}</span>
                          <span className="px-1.5 py-0.2 bg-neutral-800 text-[9px] rounded font-semibold text-amber-400">
                            {s.parentescoBeneficiario.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-rose-400 font-semibold">{s.tipoServicoSaude.replace(/_/g, ' ')}</div>
                        <div className="text-[10px] text-neutral-400">{s.profissionalNome} ({s.profissionalCrmCro})</div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="font-mono text-neutral-300">{s.dataAtendimento}</div>
                        <div className="text-[10px] font-mono text-amber-400">{s.numeroReciboNfse}</div>
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-200">
                        R$ {s.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-400">
                        R$ {s.valorReembolsado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        R$ {s.valorDedutivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleImprimirReciboSaude(s)}
                            className="p-1 text-neutral-400 hover:text-blue-400"
                            title="Imprimir Recibo IRPF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditRop({ ...s });
                              setModalRopAberto(true);
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirRop(s.id)}
                            className="p-1 text-neutral-400 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!declaracao?.servicosPrestados || declaracao.servicosPrestados.length === 0) && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-500">
                        Nenhum atendimento médico escriturado na DMED.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-[#202020] border-t border-neutral-700 font-bold">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-neutral-300">Totais Consolidados:</td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      R$ {(declaracao?.totalValorPagoServicos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-400">
                      R$ {(declaracao?.totalValorReembolsado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      R$ {(declaracao?.totalValorDedutivel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: DDM */}
        {activeTab === 'ddm' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Contratos com Planos e Operadoras de Saúde (Registro DDM)
                </h3>
                <p className="text-xs text-neutral-400">
                  Escrituração das anuidades pagas a operadoras de planos privados de assistência à saúde (ANS).
                </p>
              </div>
              <button
                onClick={() => {
                  setEditDdm({
                    id: `dmed-ddm-${Date.now()}`,
                    empresaId: empresaAtiva.id,
                    anoCalendario: anoCalendario,
                    registroAnsOperadora: '345891',
                    nomeOperadora: 'Bradesco Saúde S.A.',
                    responsavelCpf: '',
                    responsavelNome: '',
                    numeroContrato: 'PL-2026',
                    valorAnualPago: 12000,
                    beneficiariosQtd: 2
                  });
                  setModalDdmAberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                Novo Plano de Saúde
              </button>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                    <th className="p-3 font-semibold">Registro ANS</th>
                    <th className="p-3 font-semibold">Operadora de Saúde</th>
                    <th className="p-3 font-semibold">Responsável Financeiro</th>
                    <th className="p-3 font-semibold">Contrato Nº</th>
                    <th className="p-3 font-semibold text-center">Beneficiários</th>
                    <th className="p-3 font-semibold text-right">Valor Anual Pago</th>
                    <th className="p-3 font-semibold text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {declaracao?.planosSaude.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-800/40">
                      <td className="p-3 font-mono font-bold text-blue-400">{p.registroAnsOperadora}</td>
                      <td className="p-3 text-white font-medium">{p.nomeOperadora}</td>
                      <td className="p-3">
                        <div className="text-neutral-200">{p.responsavelNome}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{p.responsavelCpf}</div>
                      </td>
                      <td className="p-3 font-mono text-neutral-300">{p.numeroContrato}</td>
                      <td className="p-3 text-center font-bold text-amber-400">{p.beneficiariosQtd}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        R$ {p.valorAnualPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditDdm({ ...p });
                              setModalDdmAberto(true);
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluirDdm(p.id)}
                            className="p-1 text-neutral-400 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!declaracao?.planosSaude || declaracao.planosSaude.length === 0) && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500">
                        Nenhum contrato de operadora de plano de saúde registrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: ARQUIVO DMED */}
        {activeTab === 'arquivo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Arquivo Texto Oficial para o Validador DMED (RFB)
                </h3>
                <p className="text-xs text-neutral-400">
                  Estrutura pipe-delimited conforme a Instrução Normativa RFB nº 2.072/2022.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopiarTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-xs text-neutral-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedTxt ? 'Copiado!' : 'Copiar Texto'}
                </button>
                <button
                  onClick={handleBaixarTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Arquivo .txt
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#0d0d0d] border border-neutral-800 rounded-lg font-mono text-xs text-rose-300/90 whitespace-pre overflow-x-auto max-h-[500px]">
              {declaracao?.arquivoDmedTxt || 'Gerando arquivo DMED...'}
            </div>
          </div>
        )}
      </div>

      {/* Modal ROP */}
      {modalRopAberto && editRop && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-white mb-4">
              Cadastro de Atendimento de Saúde (DMED ROP)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Nome do Responsável Financeiro:</label>
                  <input
                    type="text"
                    value={editRop.responsavelNome}
                    onChange={e => setEditRop({ ...editRop, responsavelNome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                    placeholder="Titular pagador"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CPF do Responsável Financeiro:</label>
                  <input
                    type="text"
                    value={editRop.responsavelCpf}
                    onChange={e => setEditRop({ ...editRop, responsavelCpf: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-neutral-400 block mb-1">Nome do Paciente / Beneficiário:</label>
                  <input
                    type="text"
                    value={editRop.beneficiarioNome}
                    onChange={e => setEditRop({ ...editRop, beneficiarioNome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                    placeholder="Nome de quem recebeu o tratamento"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CPF do Paciente (se houver):</label>
                  <input
                    type="text"
                    value={editRop.beneficiarioCpf || ''}
                    onChange={e => setEditRop({ ...editRop, beneficiarioCpf: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Data de Nascimento do Paciente:</label>
                  <input
                    type="date"
                    value={editRop.beneficiarioDataNascimento}
                    onChange={e => setEditRop({ ...editRop, beneficiarioDataNascimento: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Parentesco / Relação:</label>
                  <select
                    value={editRop.parentescoBeneficiario}
                    onChange={e => setEditRop({ ...editRop, parentescoBeneficiario: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  >
                    <option value="TITULAR">Titular (o próprio pagador)</option>
                    <option value="FILHO_ENTEADO">Filho / Enteado</option>
                    <option value="CONJUGE_COMPANHEIRO">Cônjuge / Companheiro</option>
                    <option value="PAIS">Pais</option>
                    <option value="OUTRO">Outro Dependente Legal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo de Serviço de Saúde:</label>
                  <select
                    value={editRop.tipoServicoSaude}
                    onChange={e => setEditRop({ ...editRop, tipoServicoSaude: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  >
                    <option value="CONSULTA_MEDICA">Consulta Médica</option>
                    <option value="ODONTOLOGIA">Odontologia</option>
                    <option value="PSICOLOGIA">Psicologia</option>
                    <option value="FISIOTERAPIA">Fisioterapia</option>
                    <option value="FONOAUDIOLOGIA">Fonoaudiologia</option>
                    <option value="EXAMES_LABORATORIAIS">Exames Laboratoriais</option>
                    <option value="HOSPITALAR_CIRURGICO">Hospitalar / Cirúrgico</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Registro Conselho Profissional:</label>
                  <input
                    type="text"
                    value={editRop.profissionalCrmCro}
                    onChange={e => setEditRop({ ...editRop, profissionalCrmCro: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                    placeholder="CRM-SP 123456 ou CRO-SP 98765"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Nome do Profissional:</label>
                  <input
                    type="text"
                    value={editRop.profissionalNome}
                    onChange={e => setEditRop({ ...editRop, profissionalNome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Nº Recibo / NFS-e:</label>
                  <input
                    type="text"
                    value={editRop.numeroReciboNfse}
                    onChange={e => setEditRop({ ...editRop, numeroReciboNfse: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-neutral-400 block mb-1">Valor Total Pago (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editRop.valorPago}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setEditRop({
                        ...editRop,
                        valorPago: v,
                        valorDedutivel: v - editRop.valorReembolsado
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Valor Reembolsado (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editRop.valorReembolsado}
                    onChange={e => {
                      const r = Number(e.target.value);
                      setEditRop({
                        ...editRop,
                        valorReembolsado: r,
                        valorDedutivel: editRop.valorPago - r
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Dedutível IRPF (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    readOnly
                    value={editRop.valorDedutivel}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-neutral-800 rounded text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalRopAberto(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSalvarRop(editRop)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold"
              >
                Salvar Atendimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal DDM */}
      {modalDdmAberto && editDdm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              Cadastro de Plano Privado de Saúde (DMED DDM)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Registro ANS Operadora:</label>
                  <input
                    type="text"
                    value={editDdm.registroAnsOperadora}
                    onChange={e => setEditDdm({ ...editDdm, registroAnsOperadora: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Nº do Contrato:</label>
                  <input
                    type="text"
                    value={editDdm.numeroContrato}
                    onChange={e => setEditDdm({ ...editDdm, numeroContrato: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Nome da Operadora:</label>
                <input
                  type="text"
                  value={editDdm.nomeOperadora}
                  onChange={e => setEditDdm({ ...editDdm, nomeOperadora: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Nome do Titular/Responsável:</label>
                  <input
                    type="text"
                    value={editDdm.responsavelNome}
                    onChange={e => setEditDdm({ ...editDdm, responsavelNome: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CPF do Responsável:</label>
                  <input
                    type="text"
                    value={editDdm.responsavelCpf}
                    onChange={e => setEditDdm({ ...editDdm, responsavelCpf: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Valor Anual Pago (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editDdm.valorAnualPago}
                    onChange={e => setEditDdm({ ...editDdm, valorAnualPago: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Qtd de Beneficiários Cobertos:</label>
                  <input
                    type="number"
                    value={editDdm.beneficiariosQtd}
                    onChange={e => setEditDdm({ ...editDdm, beneficiariosQtd: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalDdmAberto(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSalvarDdm(editDdm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
              >
                Salvar Plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
