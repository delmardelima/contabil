import React, { useState, useEffect } from 'react';
import {
  HardHat,
  DollarSign,
  Printer,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Send,
  Database,
  Search,
  ExternalLink,
  Percent,
  X,
  CreditCard,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Users,
  FileText,
  Hammer
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  RetencaoMaoDeObraNota,
  ResumoRetencoesMaoDeObra,
  TipoContratoMaoDeObra
} from '../../types/contabil';

export const CessaoMaoDeObraRetencoesModule: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoRetencoesMaoDeObra | null>(null);
  const [selectedNota, setSelectedNota] = useState<RetencaoMaoDeObraNota | null>(null);
  const [activeTab, setActiveTab] = useState<'notas' | 'deducoes' | 'reinf_dctf' | 'contabil'>('notas');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  // Modals
  const [modalNovaNota, setModalNovaNota] = useState(false);
  const [modalFichaA4, setModalFichaA4] = useState(false);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Form State: Nova Retenção
  const [formNota, setFormNota] = useState<Partial<RetencaoMaoDeObraNota>>({
    tipoPapel: 'TOMADOR_SERVICO',
    numeroNotaFiscal: '',
    serie: '1',
    dataEmissao: new Date().toISOString().split('T')[0],
    razaoSocialContraparte: '',
    cnpjContraparte: '',
    tipoContrato: 'LIMPEZA_CONSERVACAO',
    optanteCprbDesoneracao: false,
    aliquotaInssRetencaoPercentual: 11.0,
    valorBrutoNotaBRL: 50000,
    valorDeducaoMateriaisEquipamentosBRL: 0,
    valorDeducaoSubcontratacaoBRL: 0,
    codigoReceitaDarfDctfWeb: '2631',
    statusRetencao: 'APURADO',
    observacoes: ''
  });

  const carregarDados = () => {
    try {
      const data = dbService.getRetencoesMaoDeObra();
      setResumo(data);
      if (data.notas.length > 0) {
        if (!selectedNota || !data.notas.some(n => n.id === selectedNota.id)) {
          setSelectedNota(data.notas[0]);
        } else {
          const atual = data.notas.find(n => n.id === selectedNota.id);
          if (atual) setSelectedNota(atual);
        }
      }
    } catch (e: any) {
      setMensagemErro('Erro ao carregar retenções de mão de obra: ' + e.message);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleIntegrarContabil = (id: string) => {
    const res = dbService.integrarRetencaoMaoDeObraContabil(id);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const handleSalvarNovaNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNota.numeroNotaFiscal || !formNota.razaoSocialContraparte) {
      setMensagemErro('Preencha os campos obrigatórios da nota fiscal.');
      return;
    }

    const bruto = Number(formNota.valorBrutoNotaBRL) || 0;
    const deducaoMat = Number(formNota.valorDeducaoMateriaisEquipamentosBRL) || 0;
    const deducaoSub = Number(formNota.valorDeducaoSubcontratacaoBRL) || 0;
    const base = Math.max(0, bruto - deducaoMat - deducaoSub);
    const aliq = formNota.optanteCprbDesoneracao ? 3.5 : (Number(formNota.aliquotaInssRetencaoPercentual) || 11.0);
    const valorInss = Math.round(((base * aliq) / 100) * 100) / 100;

    const nova: RetencaoMaoDeObraNota = {
      id: 'ret-mo-' + Date.now(),
      empresaId: 1,
      tipoPapel: formNota.tipoPapel || 'TOMADOR_SERVICO',
      numeroNotaFiscal: formNota.numeroNotaFiscal,
      serie: formNota.serie || '1',
      dataEmissao: formNota.dataEmissao || new Date().toISOString().split('T')[0],
      razaoSocialContraparte: formNota.razaoSocialContraparte,
      cnpjContraparte: formNota.cnpjContraparte || '00.000.000/0001-00',
      tipoContrato: (formNota.tipoContrato as any) || 'LIMPEZA_CONSERVACAO',
      optanteCprbDesoneracao: !!formNota.optanteCprbDesoneracao,
      aliquotaInssRetencaoPercentual: aliq,
      valorBrutoNotaBRL: bruto,
      valorDeducaoMateriaisEquipamentosBRL: deducaoMat,
      valorDeducaoSubcontratacaoBRL: deducaoSub,
      baseCalculoInssRetencaoBRL: base,
      valorInssRetidoCalculadoBRL: valorInss,
      codigoReceitaDarfDctfWeb: '2631',
      statusRetencao: 'APURADO',
      integradoContabil: false,
      observacoes: formNota.observacoes || 'Retenção previdenciária Art. 31 da Lei 8.212/91.'
    };

    const res = dbService.salvarRetencaoMaoDeObra(nova);
    if (res.sucesso) {
      setMensagemSucesso(res.mensagem);
      setModalNovaNota(false);
      carregarDados();
    } else {
      setMensagemErro(res.mensagem);
    }
  };

  const notasFiltradas = (resumo?.notas || []).filter(n => {
    if (filtroTipo === 'TODOS') return true;
    return n.tipoContrato === filtroTipo;
  });

  const formatBRL = (val: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f12] text-gray-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 bg-[#14161b] px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Retenção Previdenciária em Cessão de Mão de Obra
              <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800/50 px-2 py-0.5 rounded-full font-mono">
                Art. 31 Lei 8.212/91 • IN RFB 2.110/22 • Reinf R-2010
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Retenção de 11% / 3,5% (CPRB) • Dedução de Materiais até 50% • Abatimento de Subcontratação • DCTFWeb
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalFichaA4(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded border border-gray-700 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-gray-400" />
            <span>Ficha de Retenção A4</span>
          </button>
          <button
            onClick={() => setModalNovaNota(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Retenção de Nota</span>
          </button>
          <button
            onClick={carregarDados}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition"
            title="Atualizar Dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {mensagemSucesso && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-6 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {mensagemErro && (
        <div className="bg-rose-950/80 border-b border-rose-800/60 px-6 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-[#0e1015] border-b border-gray-800/80">
        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Valor Bruto Faturado</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white font-mono">
              {formatBRL(resumo?.totalValorBrutoBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">{resumo?.totalNotas || 0} notas de serviços sujeitos a cessão</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Deduções Legais da Base</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-400 font-mono">
              {formatBRL(resumo?.totalDeducoesLegaisBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Materiais, maquinários e subcontratadas</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full group-hover:bg-indigo-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Base de Cálculo Líquida</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-indigo-400 font-mono">
              {formatBRL(resumo?.totalBaseCalculoBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Base efetiva de incidência do INSS</p>
        </div>

        <div className="bg-[#14161d] p-4 rounded-xl border border-gray-800/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">INSS Retido Total (DCTFWeb)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {formatBRL(resumo?.totalInssRetidoBRL || 0)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Recolhimento centralizado na DCTFWeb</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="px-6 pt-3 bg-[#111318] border-b border-gray-800 flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('notas')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'notas'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notas com Retenção de INSS</span>
          </button>

          <button
            onClick={() => setActiveTab('deducoes')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'deducoes'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span>Regras de Dedução de Materiais & Subcontratação</span>
          </button>

          <button
            onClick={() => setActiveTab('reinf_dctf')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'reinf_dctf'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Eventos EFD-Reinf (R-2010 / R-2020)</span>
          </button>

          <button
            onClick={() => setActiveTab('contabil')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'contabil'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Mecanismo Contábil de Abatimento</span>
          </button>
        </div>

        {activeTab === 'notas' && (
          <div className="flex items-center space-x-2 pb-2">
            <span className="text-xs text-gray-400">Filtrar por Contrato:</span>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-gray-800 text-gray-200 text-xs px-2.5 py-1 rounded border border-gray-700 outline-none"
            >
              <option value="TODOS">Todos os Contratos</option>
              <option value="LIMPEZA_CONSERVACAO">Limpeza & Conservação</option>
              <option value="VIGILANCIA_SEGURANCA">Vigilância & Segurança</option>
              <option value="CONSTRUCAO_CIVIL_EMPREITADA">Construção Civil / Empreitada</option>
              <option value="MANUTENCAO_PREDIAL_INDUSTRIAL">Manutenção Predial</option>
              <option value="TRABALHO_TEMPORARIO">Trabalho Temporário</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: NOTAS COM RETENÇÃO */}
        {activeTab === 'notas' && (
          <div className="space-y-6">
            <div className="bg-[#14161f] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181b24] text-gray-400 border-b border-gray-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Nota Fiscal</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Prestador de Serviço</th>
                    <th className="py-3 px-4">Atividade Contratual</th>
                    <th className="py-3 px-4 text-center">Desoneração CPRB</th>
                    <th className="py-3 px-4 text-right">Valor Bruto</th>
                    <th className="py-3 px-4 text-right text-amber-400">Deduções Legais</th>
                    <th className="py-3 px-4 text-right text-indigo-400">Base INSS</th>
                    <th className="py-3 px-4 text-center">Alíquota</th>
                    <th className="py-3 px-4 text-right text-emerald-400">INSS Retido</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {notasFiltradas.map((nota) => (
                    <tr
                      key={nota.id}
                      onClick={() => setSelectedNota(nota)}
                      className={`hover:bg-gray-800/40 transition cursor-pointer ${
                        selectedNota?.id === nota.id ? 'bg-[#18192a]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white">{nota.numeroNotaFiscal}</td>
                      <td className="py-3 px-4 text-gray-400">{nota.dataEmissao}</td>
                      <td className="py-3 px-4 font-sans text-gray-200">
                        {nota.razaoSocialContraparte}
                        <span className="block text-[10px] text-gray-500 font-mono">{nota.cnpjContraparte}</span>
                      </td>
                      <td className="py-3 px-4 font-sans text-gray-300">
                        {nota.tipoContrato === 'LIMPEZA_CONSERVACAO'
                          ? 'Limpeza & Conservação'
                          : nota.tipoContrato === 'VIGILANCIA_SEGURANCA'
                          ? 'Vigilância & Segurança'
                          : nota.tipoContrato === 'CONSTRUCAO_CIVIL_EMPREITADA'
                          ? 'Construção Civil'
                          : nota.tipoContrato}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            nota.optanteCprbDesoneracao
                              ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {nota.optanteCprbDesoneracao ? 'CPRB 3,5%' : 'Normal 11%'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-200 font-bold">{formatBRL(nota.valorBrutoNotaBRL)}</td>
                      <td className="py-3 px-4 text-right text-amber-400 font-bold">
                        -{formatBRL(nota.valorDeducaoMateriaisEquipamentosBRL + nota.valorDeducaoSubcontratacaoBRL)}
                      </td>
                      <td className="py-3 px-4 text-right text-indigo-400 font-bold">{formatBRL(nota.baseCalculoInssRetencaoBRL)}</td>
                      <td className="py-3 px-4 text-center text-amber-400 font-bold">
                        {nota.aliquotaInssRetencaoPercentual.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                        {formatBRL(nota.valorInssRetidoCalculadoBRL)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            nota.statusRetencao === 'DECLARADO_REINF'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {nota.statusRetencao === 'DECLARADO_REINF' ? 'Declarado' : 'Apurado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5 font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNota(nota);
                              setModalFichaA4(true);
                            }}
                            className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition"
                            title="Emitir Ficha de Retenção"
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                          {!nota.integradoContabil && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIntegrarContabil(nota.id);
                              }}
                              className="px-2 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-[10px] rounded transition flex items-center gap-1"
                              title="Integrar Abatimento Contábil"
                            >
                              <Database className="w-3 h-3" />
                              <span>Integrar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Operation Detail Card */}
            {selectedNota && (
              <div className="bg-[#14161f] border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-indigo-400" />
                      Ficha da Retenção Previdenciária: {selectedNota.numeroNotaFiscal} - {selectedNota.razaoSocialContraparte}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      CNPJ: {selectedNota.cnpjContraparte} • Emissão: {selectedNota.dataEmissao} • Código DARF: {selectedNota.codigoReceitaDarfDctfWeb}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalFichaA4(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Ficha A4</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">Valor Bruto dos Serviços</span>
                    <span className="text-sm font-bold text-gray-100">{formatBRL(selectedNota.valorBrutoNotaBRL)}</span>
                    <span className="text-[10px] text-gray-500 block font-sans">Valor total faturado</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">Dedução de Materiais (Contrato)</span>
                    <span className="text-sm font-bold text-amber-400">-{formatBRL(selectedNota.valorDeducaoMateriaisEquipamentosBRL)}</span>
                    <span className="text-[10px] text-amber-500/80 block font-sans">Art. 119 da IN 2.110/22</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">Dedução de Subcontratação</span>
                    <span className="text-sm font-bold text-purple-400">-{formatBRL(selectedNota.valorDeducaoSubcontratacaoBRL)}</span>
                    <span className="text-[10px] text-purple-500/80 block font-sans">Subempreiteiros com retenção paga</span>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded border border-gray-800">
                    <span className="text-gray-400 font-sans block text-[11px]">
                      INSS Retido ({selectedNota.aliquotaInssRetencaoPercentual}%)
                    </span>
                    <span className="text-sm font-bold text-emerald-400">{formatBRL(selectedNota.valorInssRetidoCalculadoBRL)}</span>
                    <span className="text-[10px] text-emerald-500/80 block font-sans">
                      {selectedNota.optanteCprbDesoneracao ? 'Alíquota reduzida CPRB' : 'Alíquota padrão 11%'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-xs text-indigo-200/90 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-indigo-300">Fundamentação Legal da Responsabilidade Solidária:</span>
                    <p className="mt-0.5 text-gray-300 leading-relaxed font-sans">
                      A tomadora de serviços responde solidariamente pelas obrigações previdenciárias da prestadora de serviços executados mediante cessão de mão de obra ou empreitada. A realização da retenção na fonte de 11% (ou 3,5% na CPRB) e o recolhimento na DCTFWeb elidem a responsabilidade solidária da contratante (Art. 31 § 2º da Lei 8.212/1991).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REGRAS DE DEDUÇÃO LEGAL */}
        {activeTab === 'deducoes' && (
          <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Hammer className="w-4 h-4 text-amber-400" />
                Regras de Redução da Base de Cálculo (IN RFB nº 2.110/2022)
              </h2>
              <p className="text-xs text-gray-400">
                Critérios objetivos para abatimento de materiais e subcontratações na cessão de mão de obra
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-amber-400" />
                  1. Fornecimento de Materiais e Equipamentos (Art. 119)
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Os valores de materiais e a utilização de equipamentos próprios ou de terceiros fornecidos pela contratada podem ser deduzidos desde que:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                  <li>Estejam expressamente previstos no instrumento contratual firmado entre as partes;</li>
                  <li>Estejam discriminados detalhadamente na nota fiscal / fatura de prestação de serviços;</li>
                  <li>
                    O valor dos materiais não seja inferior ao valor constante nos documentos fiscais de aquisição ou superior a 50% do valor bruto nas atividades de construção civil em geral.
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl space-y-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  2. Dedução por Subcontratação de Serviços (Art. 122)
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Poderão ser deduzidos da base de cálculo da retenção da contratada principal os valores comprovadamente retidos sobre as subcontratadas:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                  <li>Os serviços subcontratados devem ter sido executados no mesmo local e objeto do contrato principal;</li>
                  <li>A contratada deve anexar cópia da nota fiscal da subcontratada e da respectiva guia quitada;</li>
                  <li>
                    A dedução impede o duplo recolhimento sobre a mesma etapa da cadeia produtiva de terceirização.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EFD-REINF & DCTFWEB */}
        {activeTab === 'reinf_dctf' && (
          <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Cruzamento dos Eventos R-2010 e R-2020 da EFD-Reinf
              </h2>
              <p className="text-xs text-gray-400">
                Integração direta entre a escrita fiscal e o fluxo previdenciário da DCTFWeb da Receita Federal
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-gray-900 rounded border border-gray-800">
                <div className="text-indigo-400 font-bold mb-1">Evento R-2010 (Serviços Tomados mediante Cessão de Mão de Obra):</div>
                <code className="text-gray-300 text-[11px] block">
                  &lt;evtServTom&gt; &lt;idePrestador cnpjPrestador="08921450000130"&gt; &lt;nfs vlrTotalBruto="85000.00" vlrBaseRet="59500.00" vlrRetencao="6545.00" /&gt;
                </code>
                <span className="text-[10px] text-gray-500 font-sans block mt-1">Gera débito previdenciário no CNPJ da tomadora na DCTFWeb</span>
              </div>

              <div className="p-3 bg-gray-900 rounded border border-gray-800">
                <div className="text-emerald-400 font-bold mb-1">Evento R-2020 (Serviços Prestados mediante Cessão de Mão de Obra):</div>
                <code className="text-gray-300 text-[11px] block">
                  &lt;evtServPrest&gt; &lt;ideTomador cnpjTomador="01234567000189"&gt; &lt;nfs vlrTotalBruto="120000.00" vlrRetSub="4200.00" indCPRB="1" /&gt;
                </code>
                <span className="text-[10px] text-gray-500 font-sans block mt-1">Gera crédito previdenciário para compensar com a folha de pagamento do prestador</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTABILIZAÇÃO */}
        {activeTab === 'contabil' && (
          <div className="bg-[#14161f] border border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Mecanismo de Contabilização das Retenções na Fonte
              </h2>
              <p className="text-xs text-gray-400">
                Regras formais de lançamento contábil por partidas dobradas no momento do aceite da nota
              </p>
            </div>

            <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-3 text-xs font-mono">
              <div className="text-white font-bold font-sans">Lançamento de Registro da Retenção (Tomador):</div>
              <div className="space-y-1.5 text-gray-300">
                <div className="flex justify-between p-2 bg-black/40 rounded">
                  <span>D - Fornecedores Nacionais a Pagar (Passivo Circulante - 2.01.01):</span>
                  <span className="text-amber-400 font-bold">R$ 6.545,00</span>
                </div>
                <div className="flex justify-between p-2 bg-black/40 rounded">
                  <span>C - INSS Retido s/ Terceiros a Recolher (Passivo Circulante - 2.01.04):</span>
                  <span className="text-emerald-400 font-bold">R$ 6.545,00</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed pt-2">
                Histórico Padrão: <em>"Vlr. retenção previdenciária de 11% ref. cessão de mão de obra NF-e 012.440 emitida por Master Clean Ltda. para recolhimento em DCTFWeb."</em>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVA NOTA */}
      {modalNovaNota && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-gray-800 rounded-xl w-full max-w-xl shadow-2xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardHat className="w-4 h-4 text-indigo-400" />
                Cadastrar Nota Fiscal com Retenção de INSS
              </h3>
              <button onClick={() => setModalNovaNota(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaNota} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Número da NF-e *</label>
                  <input
                    type="text"
                    required
                    value={formNota.numeroNotaFiscal}
                    onChange={(e) => setFormNota({ ...formNota, numeroNotaFiscal: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="NF-e 015.000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    required
                    value={formNota.dataEmissao}
                    onChange={(e) => setFormNota({ ...formNota, dataEmissao: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Prestador de Serviço *</label>
                  <input
                    type="text"
                    required
                    value={formNota.razaoSocialContraparte}
                    onChange={(e) => setFormNota({ ...formNota, razaoSocialContraparte: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                    placeholder="Nome da empresa contratada"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">CNPJ do Prestador</label>
                  <input
                    type="text"
                    value={formNota.cnpjContraparte}
                    onChange={(e) => setFormNota({ ...formNota, cnpjContraparte: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Serviço / Contrato</label>
                  <select
                    value={formNota.tipoContrato}
                    onChange={(e) => setFormNota({ ...formNota, tipoContrato: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
                  >
                    <option value="LIMPEZA_CONSERVACAO">Limpeza & Conservação</option>
                    <option value="VIGILANCIA_SEGURANCA">Vigilância & Segurança</option>
                    <option value="CONSTRUCAO_CIVIL_EMPREITADA">Construção Civil / Empreitada</option>
                    <option value="MANUTENCAO_PREDIAL_INDUSTRIAL">Manutenção Predial</option>
                    <option value="TRABALHO_TEMPORARIO">Trabalho Temporário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Enquadramento CPRB (Desoneração)</label>
                  <div className="p-2 bg-gray-900 border border-gray-700 rounded flex items-center justify-between">
                    <span className="text-gray-300">Prestador Optante CPRB (3,5%)</span>
                    <input
                      type="checkbox"
                      checked={formNota.optanteCprbDesoneracao}
                      onChange={(e) => setFormNota({ ...formNota, optanteCprbDesoneracao: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Valor Bruto da Nota Fiscal (BRL) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formNota.valorBrutoNotaBRL}
                  onChange={(e) => setFormNota({ ...formNota, valorBrutoNotaBRL: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Dedução de Materiais (BRL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formNota.valorDeducaoMateriaisEquipamentosBRL}
                    onChange={(e) => setFormNota({ ...formNota, valorDeducaoMateriaisEquipamentosBRL: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Até 50% conforme contrato</span>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Dedução Subcontratação (BRL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formNota.valorDeducaoSubcontratacaoBRL}
                    onChange={(e) => setFormNota({ ...formNota, valorDeducaoSubcontratacaoBRL: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100 font-mono"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Subempreiteiros com retenção recolhida</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalNovaNota(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded"
                >
                  Calcular e Gravar Retenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FICHA A4 DE RETENÇÃO PREVIDENCIÁRIA */}
      {modalFichaA4 && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-4xl shadow-2xl p-8 overflow-y-auto max-h-[95vh] font-serif">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-wide text-gray-900 uppercase">
                  Ficha de Retenção Previdenciária na Cessão de Mão de Obra
                </h2>
                <p className="text-xs text-gray-600 font-sans">
                  Art. 31 da Lei nº 8.212/1991 • Instrução Normativa RFB nº 2.110/2022 • Evento R-2010 da EFD-Reinf
                </p>
              </div>
              <button onClick={() => setModalFichaA4(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs text-gray-800 leading-relaxed font-sans">
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <h4 className="font-bold text-sm text-gray-900 mb-2">1. DADOS DA EMPRESA TOMADORA E DO PRESTADOR</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Tomadora do Serviço:</strong> Studio Pro Industrial & Comercial Ltda.</div>
                  <div><strong>CNPJ Tomadora:</strong> 01.234.567/0001-89</div>
                  <div><strong>Prestadora Contratada:</strong> {selectedNota?.razaoSocialContraparte || 'Master Clean Serviços Ltda.'}</div>
                  <div><strong>CNPJ Prestadora:</strong> {selectedNota?.cnpjContraparte || '08.921.450/0001-30'}</div>
                  <div><strong>Nota Fiscal / Série:</strong> {selectedNota?.numeroNotaFiscal} (Série {selectedNota?.serie})</div>
                  <div><strong>Data de Emissão:</strong> {selectedNota?.dataEmissao}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">2. DEMONSTRATIVO ANALÍTICO DA BASE E RETENÇÃO</h4>
                <table className="w-full text-xs text-left border">
                  <thead className="bg-gray-100 font-semibold border-b">
                    <tr>
                      <th className="p-2">Nota Fiscal</th>
                      <th className="p-2">Serviço</th>
                      <th className="p-2 text-right">Valor Bruto</th>
                      <th className="p-2 text-right text-amber-700">Dedução Materiais</th>
                      <th className="p-2 text-right text-purple-700">Dedução Subcontratada</th>
                      <th className="p-2 text-right">Base Líquida</th>
                      <th className="p-2 text-center">Alíquota</th>
                      <th className="p-2 text-right text-emerald-700">INSS Retido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    {(resumo?.notas || []).map((n) => (
                      <tr key={n.id}>
                        <td className="p-2 font-bold">{n.numeroNotaFiscal}</td>
                        <td className="p-2 font-sans">{n.tipoContrato}</td>
                        <td className="p-2 text-right">{formatBRL(n.valorBrutoNotaBRL)}</td>
                        <td className="p-2 text-right text-amber-700">-{formatBRL(n.valorDeducaoMateriaisEquipamentosBRL)}</td>
                        <td className="p-2 text-right text-purple-700">-{formatBRL(n.valorDeducaoSubcontratacaoBRL)}</td>
                        <td className="p-2 text-right font-bold">{formatBRL(n.baseCalculoInssRetencaoBRL)}</td>
                        <td className="p-2 text-center">{n.aliquotaInssRetencaoPercentual}%</td>
                        <td className="p-2 text-right font-bold text-emerald-700">{formatBRL(n.valorInssRetidoCalculadoBRL)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">3. DECLARAÇÃO DE RETENÇÃO E ENCAMINHAMENTO À DCTFWEB</h4>
                <p className="text-justify text-xs text-gray-700">
                  Declaramos que os valores retidos na fonte a título de contribuição previdenciária incidentes sobre os serviços prestados mediante cessão de mão de obra foram devidamente apurados em conformidade com as regras da IN RFB nº 2.110/2022, abatidos das respectivas duplicatas e informados na escrituração digital EFD-Reinf (Evento R-2010), compondo o montante confessado e quitado via DCTFWeb.
                </p>
              </div>

              <div className="pt-10 grid grid-cols-2 gap-8 text-center border-t text-xs">
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
                  <strong className="block">Marcus Vinicius Carvalho</strong>
                  <span className="text-gray-600">Contador Responsável Técnico</span>
                  <span className="text-gray-500 block font-mono">CRC 1SP298450/O-2</span>
                </div>
                <div>
                  <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
                  <strong className="block">Roberto Albuquerque Sampaio</strong>
                  <span className="text-gray-600">Representante Legal da Tomadora</span>
                  <span className="text-gray-500 block font-mono">CPF: 123.456.789-00</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-6">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ficha de Retenção A4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
