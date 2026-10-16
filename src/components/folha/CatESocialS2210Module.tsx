import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Ambulance,
  FileText,
  Printer,
  PlusCircle,
  FileCode,
  CheckCircle2,
  Send,
  Building2,
  Calendar,
  Search,
  ClipboardList,
  Eye,
  ShieldCheck,
  Stethoscope,
  Copy,
  Download,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  EventoCatS2210,
  ResumoCatESocial,
  TipoAcidenteTrabalho,
  TipoCatESocial,
  IniciativaCat,
  TipoLocalAcidente,
  LateralidadeParteAtingida
} from '../../types/contabil';

interface CatModuleProps {
  empresaId?: number;
}

export const CatESocialS2210Module: React.FC<CatModuleProps> = ({ empresaId = 1 }) => {
  const [competencia, setCompetencia] = useState<string>('2026-03');
  const [activeTab, setActiveTab] = useState<'LISTA' | 'GUIA_A4' | 'NOVA_CAT' | 'XML_PREVIEW'>('LISTA');
  const [resumo, setResumo] = useState<ResumoCatESocial | null>(null);
  const [selectedCat, setSelectedCat] = useState<EventoCatS2210 | null>(null);
  const [xmlVisualizacao, setXmlVisualizacao] = useState<string>('');
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);

  // Form de nova CAT
  const [novaCatForm, setNovaCatForm] = useState<Partial<EventoCatS2210>>({
    tipoAcidente: '1_TIPICO',
    tipoCat: '1_INICIAL',
    iniciativa: '1_EMPREGADOR',
    dataAcidente: new Date().toISOString().slice(0, 10),
    horaAcidente: '09:30',
    horasTrabalhadasAntesAcidente: '01:30',
    houveObito: false,
    comunicouPolicia: false,
    codigoSituacaoGeradora: '302010100',
    descricaoSituacaoGeradora: 'Queda de mesmo nível com escorregamento em piso operacional molhado',
    trabalhadorNome: 'Marcos Vinicius de Souza',
    trabalhadorCpf: '321.654.987-11',
    matricula: '000108',
    cargoDescricao: 'Operador de Logística Interna',
    localAcidente: {
      tipoLocal: '1_ESTABELECIMENTO_EMPREGADOR',
      nomeLocal: 'Galpão Logístico Alpha - Setor de Armazenamento A',
      logradouro: 'Avenida das Indústrias',
      numero: '1500',
      bairro: 'Distrito Industrial',
      cep: '06455-000',
      municipio: 'Barueri',
      uf: 'SP'
    },
    parteAtingida: {
      codigo: '702010000',
      descricao: 'Punho e Articulação Rádio-Cárpica',
      lateralidade: '2_DIREITA'
    },
    agenteCausador: {
      codigo: '301010100',
      descricao: 'Piso ou superfície escorregadia com resíduo líquido'
    },
    atestadoMedico: {
      dataAtendimento: new Date().toISOString().slice(0, 10),
      horaAtendimento: '10:15',
      houveInternacao: false,
      diasAfastamentoProvaveis: 14,
      houveAfastamento: true,
      naturezaLesao: 'Entorse e Distensão de Ligamentos do Punho',
      codigoCid10: 'S63.5',
      descricaoDiagnostico: 'Trauma ortopédico fechado com edema moderado e limitação de mobilidade',
      medico: {
        nome: 'Dra. Camila Prado Albuquerque',
        crm: '184920',
        ufCrm: 'SP'
      }
    }
  });

  const carregarDados = () => {
    const dados = dbService.getCatESocial(empresaId, competencia);
    setResumo(dados);
    if (dados.cats.length > 0 && !selectedCat) {
      setSelectedCat(dados.cats[0]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId, competencia]);

  const handleGerarXml = (catId: string) => {
    const res = dbService.gerarXmlS2210(catId);
    if (res.sucesso) {
      setXmlVisualizacao(res.xml);
      setActiveTab('XML_PREVIEW');
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      carregarDados();
    }
  };

  const handleSalvarNovaCat = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `cat-auto-${Date.now()}`;
    const novoEvento: EventoCatS2210 = {
      ...(novaCatForm as EventoCatS2210),
      id,
      empresaId,
      statusEnvio: 'PENDENTE'
    };

    const res = dbService.salvarCatS2210(novoEvento);
    if (res.sucesso) {
      setFeedback({ tipo: 'sucesso', texto: res.mensagem });
      setSelectedCat(novoEvento);
      setActiveTab('LISTA');
      carregarDados();
    }
  };

  const getTipoAcidenteDescricao = (tipo: TipoAcidenteTrabalho) => {
    switch (tipo) {
      case '1_TIPICO': return 'Típico (No local de trabalho)';
      case '2_DOENCA': return 'Doença Ocupacional / Profissional';
      case '3_TRAJETO': return 'Acidente de Trajeto';
      default: return tipo;
    }
  };

  const getTipoCatDescricao = (tipo: TipoCatESocial) => {
    switch (tipo) {
      case '1_INICIAL': return 'Inicial';
      case '2_REABERTURA': return 'Reabertura';
      case '3_OBITO': return 'Comunicação de Óbito';
      default: return tipo;
    }
  };

  const catsFiltradas = resumo?.cats.filter(c =>
    c.trabalhadorNome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    c.trabalhadorCpf.includes(filtroTexto) ||
    c.matricula.includes(filtroTexto) ||
    c.atestadoMedico.codigoCid10.toLowerCase().includes(filtroTexto.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#262626] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                eSocial S-2210: CAT - Comunicação de Acidente de Trabalho
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono">
                  Portaria SEPRT 4.334/2021
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Registro de acidentes típicos, de trajeto e doenças profissionais com emissão da CAT oficial em 4 vias e envio W3C ao eSocial
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#262626] px-2.5 py-1.5 rounded">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="bg-transparent text-xs text-white border-0 focus:outline-none font-medium cursor-pointer"
            />
          </div>

          <button
            onClick={() => setActiveTab('NOVA_CAT')}
            className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Nova CAT
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 px-4 py-2.5 rounded text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white font-mono text-xs ml-4">
            ×
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Total de CATs</div>
            <div className="text-xl font-bold text-white mt-0.5">{resumo?.totalCats || 0}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Ano / Competência</div>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Acidentes Típicos</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{resumo?.totalAcidentesTipicos || 0}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Ambiente Laboral</div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Acidente de Trajeto</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">{resumo?.totalAcidentesTrajeto || 0}</div>
            <div className="text-[10px] text-sky-400/80 mt-0.5">Itinere (Art. 21 IV d)</div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <Ambulance className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Doenças Ocupacionais</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{resumo?.totalDoencasTrabalho || 0}</div>
            <div className="text-[10px] text-purple-400/80 mt-0.5">LER/DORT/Biotecn.</div>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#262626] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Com Afastamento</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{resumo?.totalComAfastamento || 0}</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">Benefício B91 / INSS</div>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ABAS DE VISUALIZAÇÃO */}
      <div className="flex border-b border-[#262626] gap-2">
        <button
          onClick={() => setActiveTab('LISTA')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'LISTA'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Relação de CATs Cadastradas
        </button>

        <button
          onClick={() => {
            if (!selectedCat && resumo?.cats.length) setSelectedCat(resumo.cats[0]);
            setActiveTab('GUIA_A4');
          }}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'GUIA_A4'
              ? 'border-rose-500 text-rose-400 bg-rose-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          Guia Oficial da CAT (A4 em 4 Vias)
        </button>

        {activeTab === 'XML_PREVIEW' && (
          <button
            onClick={() => setActiveTab('XML_PREVIEW')}
            className="px-4 py-2 text-xs font-medium border-b-2 border-emerald-500 text-emerald-400 bg-emerald-500/10 flex items-center gap-2"
          >
            <FileCode className="w-3.5 h-3.5" />
            XML eSocial S-2210
          </button>
        )}

        {activeTab === 'NOVA_CAT' && (
          <button
            onClick={() => setActiveTab('NOVA_CAT')}
            className="px-4 py-2 text-xs font-medium border-b-2 border-rose-500 text-rose-400 bg-rose-500/10 flex items-center gap-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Emissão de Nova CAT
          </button>
        )}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {activeTab === 'LISTA' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar por colaborador, CPF, matrícula ou CID-10..."
                className="w-full bg-[#181818] border border-[#262626] rounded pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="text-xs text-gray-400">
              Mostrando {catsFiltradas.length} de {resumo?.cats.length || 0} registros
            </div>
          </div>

          <div className="bg-[#181818] border border-[#262626] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#202020] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#262626]">
                <tr>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Colaborador / Matrícula</th>
                  <th className="py-2.5 px-3">Tipo Acidente / CAT</th>
                  <th className="py-2.5 px-3">Parte do Corpo / CID-10</th>
                  <th className="py-2.5 px-3">Afastamento</th>
                  <th className="py-2.5 px-3">Status eSocial</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {catsFiltradas.map((cat) => (
                  <tr
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className={`hover:bg-[#202020] cursor-pointer transition-colors ${
                      selectedCat?.id === cat.id ? 'bg-[#222222]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono">
                      <div className="text-white font-medium">{cat.dataAcidente}</div>
                      <div className="text-[10px] text-gray-400">{cat.horaAcidente} hrs</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-white font-medium">{cat.trabalhadorNome}</div>
                      <div className="text-[10px] text-gray-400">CPF: {cat.trabalhadorCpf} | Matrícula: {cat.matricula}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-300 font-medium">{getTipoAcidenteDescricao(cat.tipoAcidente)}</div>
                      <div className="text-[10px] text-gray-400">CAT: {getTipoCatDescricao(cat.tipoCat)}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-300">{cat.parteAtingida.descricao}</div>
                      <div className="text-[10px] text-rose-400 font-mono">CID: {cat.atestadoMedico.codigoCid10} ({cat.atestadoMedico.naturezaLesao})</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {cat.atestadoMedico.houveAfastamento ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {cat.atestadoMedico.diasAfastamentoProvaveis} dias
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Sem Afastamento
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {cat.statusEnvio === 'TRANSMITIDO' ? (
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Transmitido
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono block mt-0.5">Recibo: {cat.numeroReciboESocial?.slice(-10)}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedCat(cat);
                            setActiveTab('GUIA_A4');
                          }}
                          title="Imprimir Guia da CAT em 4 Vias"
                          className="p-1.5 hover:bg-[#2b2b2b] text-gray-300 hover:text-white rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                        <button
                          onClick={() => handleGerarXml(cat.id)}
                          title="Gerar / Transmitir XML S-2210"
                          className="p-1.5 hover:bg-[#2b2b2b] text-gray-300 hover:text-white rounded transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA: FORMULÁRIO DE NOVA CAT */}
      {activeTab === 'NOVA_CAT' && (
        <form onSubmit={handleSalvarNovaCat} className="bg-[#181818] border border-[#262626] rounded p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Ambulance className="w-4 h-4 text-rose-400" />
              Cadastro e Transmissão de CAT - S-2210
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('LISTA')}
                className="px-3 py-1 bg-[#222] hover:bg-[#2a2a2a] text-gray-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded text-xs flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvar CAT
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Nome do Trabalhador Acidentado</label>
              <input
                type="text"
                value={novaCatForm.trabalhadorNome || ''}
                onChange={(e) => setNovaCatForm({ ...novaCatForm, trabalhadorNome: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">CPF</label>
              <input
                type="text"
                value={novaCatForm.trabalhadorCpf || ''}
                onChange={(e) => setNovaCatForm({ ...novaCatForm, trabalhadorCpf: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Matrícula no eSocial</label>
              <input
                type="text"
                value={novaCatForm.matricula || ''}
                onChange={(e) => setNovaCatForm({ ...novaCatForm, matricula: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Data do Acidente</label>
              <input
                type="date"
                value={novaCatForm.dataAcidente || ''}
                onChange={(e) => setNovaCatForm({ ...novaCatForm, dataAcidente: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Hora do Acidente (HH:MM)</label>
              <input
                type="text"
                value={novaCatForm.horaAcidente || ''}
                onChange={(e) => setNovaCatForm({ ...novaCatForm, horaAcidente: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Horas Trabalhadas Antes</label>
              <input
                type="text"
                value={novaCatForm.horasTrabalhadasAntesAcidente || ''}
                onChange={(e) => setNovaCatForm({ ...novaCatForm, horasTrabalhadasAntesAcidente: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Tipo de Acidente</label>
              <select
                value={novaCatForm.tipoAcidente}
                onChange={(e) => setNovaCatForm({ ...novaCatForm, tipoAcidente: e.target.value as TipoAcidenteTrabalho })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
              >
                <option value="1_TIPICO">1 - Típico</option>
                <option value="2_DOENCA">2 - Doença Ocupacional</option>
                <option value="3_TRAJETO">3 - Acidente de Trajeto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Parte do Corpo Atingida (Tabela 13)</label>
              <input
                type="text"
                value={novaCatForm.parteAtingida?.descricao || ''}
                onChange={(e) => setNovaCatForm({
                  ...novaCatForm,
                  parteAtingida: {
                    codigo: novaCatForm.parteAtingida?.codigo || '702010000',
                    lateralidade: novaCatForm.parteAtingida?.lateralidade || '2_DIREITA',
                    descricao: e.target.value
                  }
                })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                placeholder="Ex: Punho, Perna, Olhos..."
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Lateralidade</label>
              <select
                value={novaCatForm.parteAtingida?.lateralidade}
                onChange={(e) => setNovaCatForm({
                  ...novaCatForm,
                  parteAtingida: {
                    ...novaCatForm.parteAtingida!,
                    lateralidade: e.target.value as LateralidadeParteAtingida
                  }
                })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
              >
                <option value="0_NAO_APLICAVEL">Não Aplicável</option>
                <option value="1_ESQUERDA">Esquerda</option>
                <option value="2_DIREITA">Direita</option>
                <option value="3_AMBAS">Ambas</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Agente Causador (Tabela 14/15)</label>
              <input
                type="text"
                value={novaCatForm.agenteCausador?.descricao || ''}
                onChange={(e) => setNovaCatForm({
                  ...novaCatForm,
                  agenteCausador: {
                    codigo: novaCatForm.agenteCausador?.codigo || '301010100',
                    descricao: e.target.value
                  }
                })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                placeholder="Ex: Escada, Máquina, Piso molhado..."
              />
            </div>
          </div>

          <div className="p-3 bg-[#141414] border border-[#2b2b2b] rounded space-y-3">
            <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              Informações do Atestado Médico Ocupacional (CID-10 e CRM)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Código CID-10</label>
                <input
                  type="text"
                  value={novaCatForm.atestadoMedico?.codigoCid10 || ''}
                  onChange={(e) => setNovaCatForm({
                    ...novaCatForm,
                    atestadoMedico: { ...novaCatForm.atestadoMedico!, codigoCid10: e.target.value }
                  })}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white font-mono"
                  placeholder="Ex: S63.5"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Dias Afastamento Prováveis</label>
                <input
                  type="number"
                  value={novaCatForm.atestadoMedico?.diasAfastamentoProvaveis || 0}
                  onChange={(e) => setNovaCatForm({
                    ...novaCatForm,
                    atestadoMedico: { ...novaCatForm.atestadoMedico!, diasAfastamentoProvaveis: parseInt(e.target.value, 10) || 0, houveAfastamento: (parseInt(e.target.value, 10) > 0) }
                  })}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Nome do Médico</label>
                <input
                  type="text"
                  value={novaCatForm.atestadoMedico?.medico.nome || ''}
                  onChange={(e) => setNovaCatForm({
                    ...novaCatForm,
                    atestadoMedico: {
                      ...novaCatForm.atestadoMedico!,
                      medico: { ...novaCatForm.atestadoMedico!.medico, nome: e.target.value }
                    }
                  })}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">CRM e UF</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={novaCatForm.atestadoMedico?.medico.crm || ''}
                    onChange={(e) => setNovaCatForm({
                      ...novaCatForm,
                      atestadoMedico: {
                        ...novaCatForm.atestadoMedico!,
                        medico: { ...novaCatForm.atestadoMedico!.medico, crm: e.target.value }
                      }
                    })}
                    placeholder="CRM"
                    className="w-2/3 bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={novaCatForm.atestadoMedico?.medico.ufCrm || ''}
                    onChange={(e) => setNovaCatForm({
                      ...novaCatForm,
                      atestadoMedico: {
                        ...novaCatForm.atestadoMedico!,
                        medico: { ...novaCatForm.atestadoMedico!.medico, ufCrm: e.target.value.toUpperCase() }
                      }
                    })}
                    placeholder="UF"
                    className="w-1/3 bg-[#1e1e1e] border border-[#333] rounded px-3 py-1.5 text-xs text-white text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ABA: GUIA OFICIAL DA CAT (A4 EM 4 VIAS) */}
      {activeTab === 'GUIA_A4' && selectedCat && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div>
              <span className="text-xs text-gray-400">Guia Oficial da CAT - Colaborador: </span>
              <span className="text-xs font-bold text-white">{selectedCat.trabalhadorNome}</span>
              <span className="text-xs text-gray-400 ml-2">(Acidente em {selectedCat.dataAcidente})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGerarXml(selectedCat.id)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Transmitir S-2210
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir 4 Vias (A4)
              </button>
            </div>
          </div>

          {/* DOCUMENTO A4 EM 4 VIAS */}
          <div className="bg-white text-black p-6 rounded shadow-2xl max-w-4xl mx-auto space-y-6 print:m-0 print:p-0">
            {['1ª VIA - EMPREGADOR', '2ª VIA - SEGURADO (ACIDENTADO)', '3ª VIA - SINDICATO DA CATEGORIA', '4ª VIA - INSS / PREVIDÊNCIA SOCIAL'].map((viaNome, idx) => (
              <div key={idx} className="border-2 border-black p-4 text-[11px] leading-tight space-y-3 font-sans">
                {/* CABEÇALHO DA VIA */}
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-black" />
                    <div>
                      <div className="font-extrabold text-sm uppercase">MINISTÉRIO DO TRABALHO E PREVIDÊNCIA</div>
                      <div className="font-bold text-xs uppercase">INSTITUTO NACIONAL DO SEGURO SOCIAL - INSS</div>
                      <div className="text-[10px]">COMUNICAÇÃO DE ACIDENTE DE TRABALHO - CAT (LEI Nº 8.213/1991, ART. 22)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xs bg-black text-white px-2 py-0.5 inline-block">{viaNome}</div>
                    <div className="font-mono text-[10px] mt-1 font-bold">Protocolo eSocial: {selectedCat.numeroReciboESocial || 'EM PROCESSAMENTO'}</div>
                  </div>
                </div>

                {/* QUADRO I: EMITENTE E ACIDENTADO */}
                <div className="grid grid-cols-4 border border-black divide-x divide-black text-[10px]">
                  <div className="p-1.5 col-span-2">
                    <span className="font-bold block text-[9px] text-gray-700">1. RAZÃO SOCIAL / EMPREGADOR:</span>
                    <span className="font-semibold uppercase">CONTABIL STUDIO PRO BRASIL LTDA</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">2. CNPJ / CAEPF:</span>
                    <span className="font-mono font-semibold">00.123.456/0001-91</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">3. CNAE PREP.:</span>
                    <span className="font-mono font-semibold">6920-6/01</span>
                  </div>
                </div>

                {/* QUADRO II: DADOS DO ACIDENTADO */}
                <div className="grid grid-cols-4 border border-black divide-x divide-black text-[10px]">
                  <div className="p-1.5 col-span-2">
                    <span className="font-bold block text-[9px] text-gray-700">4. NOME DO ACIDENTADO:</span>
                    <span className="font-semibold uppercase">{selectedCat.trabalhadorNome}</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">5. CPF:</span>
                    <span className="font-mono font-semibold">{selectedCat.trabalhadorCpf}</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">6. MATRÍCULA:</span>
                    <span className="font-mono font-semibold">{selectedCat.matricula}</span>
                  </div>
                </div>

                {/* QUADRO III: O ACIDENTE */}
                <div className="grid grid-cols-4 border border-black divide-x divide-black text-[10px]">
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">7. DATA DO ACIDENTE:</span>
                    <span className="font-mono font-semibold">{selectedCat.dataAcidente}</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">8. HORA:</span>
                    <span className="font-mono font-semibold">{selectedCat.horaAcidente} hrs</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">9. TIPO DE CAT:</span>
                    <span className="font-semibold">{getTipoCatDescricao(selectedCat.tipoCat)}</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">10. TIPO ACIDENTE:</span>
                    <span className="font-semibold">{getTipoAcidenteDescricao(selectedCat.tipoAcidente)}</span>
                  </div>
                </div>

                <div className="border border-black p-1.5 text-[10px]">
                  <span className="font-bold block text-[9px] text-gray-700">11. LOCAL DO ACIDENTE E DESCRIÇÃO DO FATO:</span>
                  <span>{selectedCat.localAcidente.nomeLocal} - {selectedCat.localAcidente.logradouro}, nº {selectedCat.localAcidente.numero}, {selectedCat.localAcidente.bairro}, {selectedCat.localAcidente.municipio}/{selectedCat.localAcidente.uf}. Situação: {selectedCat.descricaoSituacaoGeradora}.</span>
                </div>

                <div className="grid grid-cols-2 border border-black divide-x divide-black text-[10px]">
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">12. PARTE DO CORPO ATINGIDA (TAB. 13):</span>
                    <span className="font-semibold">{selectedCat.parteAtingida.descricao} (Lateralidade: {selectedCat.parteAtingida.lateralidade})</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold block text-[9px] text-gray-700">13. AGENTE CAUSADOR:</span>
                    <span className="font-semibold">{selectedCat.agenteCausador.descricao} (Cód: {selectedCat.agenteCausador.codigo})</span>
                  </div>
                </div>

                {/* QUADRO IV: LAUDO MÉDICO */}
                <div className="border border-black p-2 bg-gray-50 text-[10px] space-y-1">
                  <div className="font-bold uppercase text-[9px] text-gray-800 border-b border-gray-300 pb-0.5">14. LAUDO MÉDICO / ATESTADO OCUPACIONAL</div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-gray-600 font-bold block text-[8px]">CID-10:</span>
                      <span className="font-mono font-bold text-rose-700">{selectedCat.atestadoMedico.codigoCid10}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-bold block text-[8px]">DIAS DE AFASTAMENTO:</span>
                      <span className="font-bold">{selectedCat.atestadoMedico.diasAfastamentoProvaveis} dias</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-bold block text-[8px]">MÉDICO ASSISTENTE:</span>
                      <span>{selectedCat.atestadoMedico.medico.nome}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-bold block text-[8px]">CRM / UF:</span>
                      <span className="font-mono font-bold">{selectedCat.atestadoMedico.medico.crm} / {selectedCat.atestadoMedico.medico.ufCrm}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-700 pt-1">
                    Diagnóstico: {selectedCat.atestadoMedico.descricaoDiagnostico} - Natureza da Lesão: {selectedCat.atestadoMedico.naturezaLesao}.
                  </div>
                </div>

                {/* ASSINATURAS */}
                <div className="grid grid-cols-2 gap-8 pt-4 text-center text-[9px]">
                  <div>
                    <div className="border-t border-black pt-1">CONTABIL STUDIO PRO BRASIL LTDA (EMPREGADOR)</div>
                  </div>
                  <div>
                    <div className="border-t border-black pt-1">DR(A). {selectedCat.atestadoMedico.medico.nome.toUpperCase()} - CRM {selectedCat.atestadoMedico.medico.crm}/{selectedCat.atestadoMedico.medico.ufCrm}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA: XML ESOCIAL S-2210 PREVIEW */}
      {activeTab === 'XML_PREVIEW' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#181818] p-3 rounded border border-[#262626]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">XML eSocial S-2210 - v_S_01_03_00 (evtCAT)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(xmlVisualizacao);
                  setFeedback({ tipo: 'sucesso', texto: 'XML copiado para a área de transferência!' });
                }}
                className="px-2.5 py-1 bg-[#222] hover:bg-[#2a2a2a] text-gray-300 rounded text-xs flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([xmlVisualizacao], { type: 'application/xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `S2210_${selectedCat?.matricula || 'CAT'}_${new Date().toISOString().slice(0, 10)}.xml`;
                  a.click();
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar XML
              </button>
            </div>
          </div>

          <pre className="p-4 bg-[#0d0d0d] border border-[#262626] rounded text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[500px]">
            {xmlVisualizacao}
          </pre>
        </div>
      )}
    </div>
  );
};
