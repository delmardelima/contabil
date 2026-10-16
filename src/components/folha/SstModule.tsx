import React, { useState, useEffect } from 'react';
import { 
  Empresa, 
  AfastamentoColaborador, 
  AtestadoSaudeOcupacional, 
  FatorRiscoAmbiental, 
  CatAcidenteTrabalho,
  Colaborador,
  MotivoAfastamentoEsocial,
  TipoExameOcupacional
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  ShieldCheck, 
  Activity, 
  HeartPulse, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Building2, 
  Download, 
  Send, 
  Stethoscope,
  Info,
  BadgeAlert,
  Search,
  ExternalLink,
  ClipboardList
} from 'lucide-react';

interface SstModuleProps {
  empresa: Empresa;
  onOpenReportPreview: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const SstModule: React.FC<SstModuleProps> = ({ empresa, onOpenReportPreview }) => {
  const [activeTab, setActiveTab] = useState<'AFASTAMENTOS' | 'ASO' | 'RISCOS_PPP' | 'CAT' | 'ESOCIAL'>('AFASTAMENTOS');
  
  const [afastamentos, setAfastamentos] = useState<AfastamentoColaborador[]>([]);
  const [asos, setAsos] = useState<AtestadoSaudeOcupacional[]>([]);
  const [fatoresRisco, setFatoresRisco] = useState<FatorRiscoAmbiental[]>([]);
  const [cats, setCats] = useState<CatAcidenteTrabalho[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  
  const [busca, setBusca] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);

  // Modais de Inclusão
  const [modalAfastamento, setModalAfastamento] = useState(false);
  const [modalAso, setModalAso] = useState(false);
  const [modalRisco, setModalRisco] = useState(false);
  const [modalCat, setModalCat] = useState(false);
  const [xmlModal, setXmlModal] = useState<{ titulo: string; conteudo: string } | null>(null);

  // Form Afastamento
  const [colabIdAfast, setColabIdAfast] = useState<number>(1);
  const [motivoAfast, setMotivoAfast] = useState<MotivoAfastamentoEsocial>('03_DOENCA_NAO_OCUPACIONAL_INSS');
  const [dtIniAfast, setDtIniAfast] = useState('2026-10-01');
  const [dtFimPrevAfast, setDtFimPrevAfast] = useState('2026-10-15');
  const [cid10Afast, setCid10Afast] = useState('M54.5');
  const [medicoAfast, setMedicoAfast] = useState('Dr. Roberto Arruda Neves');
  const [crmAfast, setCrmAfast] = useState('124580');
  const [ufCrmAfast, setUfCrmAfast] = useState('SP');
  const [obsAfast, setObsAfast] = useState('');

  // Form ASO
  const [colabIdAso, setColabIdAso] = useState<number>(1);
  const [tipoAso, setTipoAso] = useState<TipoExameOcupacional>('PERIODICO');
  const [dtExameAso, setDtExameAso] = useState('2026-10-10');
  const [examinadorAso, setExaminadorAso] = useState('Dr. Otávio Ramos Alencar');
  const [crmExaminadorAso, setCrmExaminadorAso] = useState('154870');
  const [coordenadorAso, setCoordenadorAso] = useState('Dra. Beatriz Toledo Barros');
  const [crmCoordenadorAso, setCrmCoordenadorAso] = useState('112440');
  const [aptidaoAso, setAptidaoAso] = useState<'APTO' | 'INAPTO'>('APTO');
  const [exameCompAso, setExameCompAso] = useState('Audiometria Tonal e Vocal; Hemograma Completo');

  // Form Risco
  const [colabIdRisco, setColabIdRisco] = useState<number>(1);
  const [tipoRisco, setTipoRisco] = useState<'FISICO' | 'QUIMICO' | 'BIOLOGICO' | 'ERGONOMICO' | 'MECANICO_ACIDENTE' | 'AUSENCIA_RISCO'>('FISICO');
  const [codTabela24, setCodTabela24] = useState('01.01.001');
  const [descRisco, setDescRisco] = useState('Ruído contínuo ou intermitente superior a 80 dB(A)');
  const [intensidade, setIntensidade] = useState('83.5 dB(A)');
  const [tecnica, setTecnica] = useState('Dosimetria de Ruído conforme NHO-01 Fundacentro');
  const [epcEficaz, setEpcEficaz] = useState(true);
  const [epiEficaz, setEpiEficaz] = useState(true);
  const [caEpi, setCaEpi] = useState('15485');

  // Form CAT
  const [colabIdCat, setColabIdCat] = useState<number>(1);
  const [tipoCat, setTipoCat] = useState<'TIPICO' | 'TRAJETO' | 'DOENCA_PROFISSIONAL'>('TIPICO');
  const [dtHoraCat, setDtHoraCat] = useState('2026-10-16T09:30:00');
  const [localCat, setLocalCat] = useState('Área de Usinagem / Linha 2');
  const [parteCorpo, setParteCorpo] = useState('Mão Direita (Polegar)');
  const [agenteCausador, setAgenteCausador] = useState('Torno Mecânico');
  const [cid10Cat, setCid10Cat] = useState('S61.0');
  const [hospitalCat, setHospitalCat] = useState('Hospital São Luiz');

  const carregarDados = () => {
    setAfastamentos(dbService.getAfastamentos(empresa.id));
    setAsos(dbService.getAtestadosSaudeOcupacional(empresa.id));
    setFatoresRisco(dbService.getFatoresRiscoAmbiental(empresa.id));
    setCats(dbService.getCats(empresa.id));
    const colabs = dbService.getColaboradores(empresa.id);
    setColaboradores(colabs);
    if (colabs.length > 0) {
      setColabIdAfast(colabs[0].id);
      setColabIdAso(colabs[0].id);
      setColabIdRisco(colabs[0].id);
      setColabIdCat(colabs[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresa.id]);

  const handleSalvarAfastamento = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dbService.salvarAfastamento({
        empresaId: empresa.id,
        colaboradorId: colabIdAfast,
        motivo: motivoAfast,
        dataInicio: dtIniAfast,
        dataRetornoPrevista: dtFimPrevAfast,
        cid10: cid10Afast,
        nomeMedico: medicoAfast,
        crmMedico: crmAfast,
        ufCrm: ufCrmAfast,
        observacoes: obsAfast
      });
      setFeedback({ tipo: 'success', texto: 'Afastamento temporário registrado e transmitido ao eSocial (S-2230).' });
      setModalAfastamento(false);
      carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: 'Erro ao salvar afastamento: ' + err.message });
    }
  };

  const handleSalvarAso = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const examesArr = exameCompAso.split(';').map(nome => ({
        nomeExame: nome.trim(),
        dataRealizacao: dtExameAso,
        resultado: 'NORMAL' as const
      }));

      dbService.salvarAtestadoSaude({
        empresaId: empresa.id,
        colaboradorId: colabIdAso,
        tipoExame: tipoAso,
        dataExame: dtExameAso,
        medicoExaminador: examinadorAso,
        crmExaminador: crmExaminadorAso,
        medicoCoordenadorPcmso: coordenadorAso,
        crmCoordenador: crmCoordenadorAso,
        resultadoAptidao: aptidaoAso,
        examesComplementares: examesArr
      });
      setFeedback({ tipo: 'success', texto: 'Atestado de Saúde Ocupacional (ASO) registrado e evento S-2220 gerado.' });
      setModalAso(false);
      carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: 'Erro ao salvar ASO: ' + err.message });
    }
  };

  const handleSalvarRisco = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dbService.salvarFatorRisco({
        empresaId: empresa.id,
        colaboradorId: colabIdRisco,
        tipoRisco,
        codigoTabela24: codTabela24,
        descricaoAgenteNocivo: descRisco,
        intensidadeConcentracao: intensidade,
        tecnicaUtilizada: tecnica,
        epcEficaz,
        epiEficaz,
        caEpi: epiEficaz ? caEpi : undefined
      });
      setFeedback({ tipo: 'success', texto: 'Condição ambiental de trabalho registrada e evento S-2240 preparado.' });
      setModalRisco(false);
      carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: 'Erro ao registrar fator de risco: ' + err.message });
    }
  };

  const handleSalvarCat = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dbService.salvarCat({
        empresaId: empresa.id,
        colaboradorId: colabIdCat,
        tipoAcidente: tipoCat,
        dataHoraAcidente: dtHoraCat,
        localAcidente: localCat,
        parteCorpoAtingida: parteCorpo,
        agenteCausador: agenteCausador,
        atendimentoMedico: {
          dataAtendimento: dtHoraCat.slice(0, 10),
          nomeHospital: hospitalCat,
          cid10: cid10Cat,
          crmMedico: '145220',
          nomeMedico: 'Dr. Médico Socorrista'
        }
      });
      setFeedback({ tipo: 'success', texto: 'Comunicação de Acidente de Trabalho (CAT) registrada com sucesso (S-2210).' });
      setModalCat(false);
      carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'error', texto: 'Erro ao registrar CAT: ' + err.message });
    }
  };

  // Impressão Oficial do PPP Eletrônico A4 (Perfil Profissiográfico Previdenciário)
  const handleImprimirPpp = (colab: Colaborador) => {
    const riscosColab = fatoresRisco.filter(f => f.colaboradorId === colab.id);
    const asosColab = asos.filter(a => a.colaboradorId === colab.id);
    const catsColab = cats.filter(c => c.colaboradorId === colab.id);

    const relatorioA4 = (
      <div className="p-6 bg-white text-neutral-900 font-sans text-xs space-y-4 min-h-[850px]">
        {/* Cabeçalho */}
        <div className="border-b-2 border-neutral-900 pb-3 flex justify-between items-start">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider">{empresa.razaoSocial}</h1>
            <p className="text-[10px] text-neutral-600 font-mono">CNPJ: {empresa.cnpj} | CNAE: {empresa.cnaePrincipal || '7020-4/00'}</p>
            <p className="text-[10px] text-neutral-600">{empresa.logradouro || ''}, {empresa.numero || 'S/N'} - {empresa.cidade || ''}/{empresa.uf || ''}</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black uppercase text-neutral-900">Perfil Profissiográfico Previdenciário (PPP)</h2>
            <p className="text-[10px] text-neutral-600">Conforme Instrução Normativa PRES/INSS nº 128/2022 & eSocial S-2240</p>
            <p className="text-[9px] font-mono text-emerald-800 font-bold">Emitido eletronicamente via Contábil Studio Pro</p>
          </div>
        </div>

        {/* Seção 1: Dados Administrativos */}
        <div>
          <div className="bg-neutral-800 text-white px-2 py-1 font-bold text-[10px] uppercase tracking-wide">
            Seção I - Dados Administrativos do Trabalhador
          </div>
          <div className="grid grid-cols-4 gap-2 p-2 border border-neutral-300 text-[10px] mt-1 bg-neutral-50">
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Nome do Trabalhador</span>
              <span className="font-bold">{colab.nome}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">CPF / PIS-PASEP</span>
              <span className="font-mono">{colab.cpf} / {colab.pisPasep || '-'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Cargo / Função</span>
              <span className="font-semibold">{colab.cargo}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[8px] uppercase">Data de Admissão</span>
              <span className="font-mono">{colab.dataAdmissao}</span>
            </div>
          </div>
        </div>

        {/* Seção 2: Registros Ambientais e Fatores de Risco */}
        <div>
          <div className="bg-neutral-800 text-white px-2 py-1 font-bold text-[10px] uppercase tracking-wide">
            Seção II - Registros Ambientais / Fatores de Risco (eSocial Tabela 24)
          </div>
          <table className="w-full text-[10px] border border-neutral-300 mt-1">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 font-bold border-b border-neutral-300">
                <th className="py-1 px-2 text-left">Período</th>
                <th className="py-1 px-2 text-left">Tipo</th>
                <th className="py-1 px-2 text-left">Fator de Risco / Descrição</th>
                <th className="py-1 px-2 text-left">Intensidade</th>
                <th className="py-1 px-2 text-left">Técnica Utilizada</th>
                <th className="py-1 px-1 text-center">EPC</th>
                <th className="py-1 px-1 text-center">EPI</th>
                <th className="py-1 px-2 text-left">CA do EPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {riscosColab.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-2 px-2 text-center text-neutral-500 italic">
                    Ausência de agentes nocivos físicos, químicos ou biológicos prejudiciais à saúde.
                  </td>
                </tr>
              ) : (
                riscosColab.map(r => (
                  <tr key={r.id}>
                    <td className="py-1 px-2 font-mono">{r.dataInicio} a {r.dataFim || 'Atual'}</td>
                    <td className="py-1 px-2 font-semibold">{r.tipoRisco}</td>
                    <td className="py-1 px-2">{r.codigoTabela24} - {r.descricaoAgenteNocivo}</td>
                    <td className="py-1 px-2 font-mono">{r.intensidadeConcentracao}</td>
                    <td className="py-1 px-2">{r.tecnicaUtilizada}</td>
                    <td className="py-1 px-1 text-center">{r.epcEficaz ? 'Sim' : 'Não'}</td>
                    <td className="py-1 px-1 text-center">{r.epiEficaz ? 'Sim' : 'Não'}</td>
                    <td className="py-1 px-2 font-mono">{r.caEpi || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Seção 3: Monitoramento Biológico e ASOs */}
        <div>
          <div className="bg-neutral-800 text-white px-2 py-1 font-bold text-[10px] uppercase tracking-wide">
            Seção III - Resultados de Monitoramento Biológico (ASO / PCMSO NR-07)
          </div>
          <table className="w-full text-[10px] border border-neutral-300 mt-1">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 font-bold border-b border-neutral-300">
                <th className="py-1 px-2 text-left">Data Exame</th>
                <th className="py-1 px-2 text-left">Tipo do Exame</th>
                <th className="py-1 px-2 text-left">Aptidão</th>
                <th className="py-1 px-2 text-left">Médico Coordenador</th>
                <th className="py-1 px-2 text-left">CRM/UF</th>
                <th className="py-1 px-2 text-left">Exames Complementares Realizados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {asosColab.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-2 px-2 text-center text-neutral-500 italic">Nenhum ASO registrado.</td>
                </tr>
              ) : (
                asosColab.map(a => (
                  <tr key={a.id}>
                    <td className="py-1 px-2 font-mono">{a.dataExame}</td>
                    <td className="py-1 px-2 font-semibold">{a.tipoExame}</td>
                    <td className="py-1 px-2 font-bold text-emerald-800">{a.resultadoAptidao}</td>
                    <td className="py-1 px-2">{a.medicoCoordenadorPcmso}</td>
                    <td className="py-1 px-2 font-mono">{a.crmCoordenador}/{a.ufCoordenador}</td>
                    <td className="py-1 px-2">{a.examesComplementares.map(e => e.nomeExame).join('; ')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Seção 4: Comunicações de Acidentes de Trabalho (CAT) */}
        <div>
          <div className="bg-neutral-800 text-white px-2 py-1 font-bold text-[10px] uppercase tracking-wide">
            Seção IV - Comunicações de Acidente de Trabalho Registradas (CAT)
          </div>
          <table className="w-full text-[10px] border border-neutral-300 mt-1">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 font-bold border-b border-neutral-300">
                <th className="py-1 px-2 text-left">Número CAT</th>
                <th className="py-1 px-2 text-left">Data/Hora</th>
                <th className="py-1 px-2 text-left">Tipo</th>
                <th className="py-1 px-2 text-left">Parte do Corpo</th>
                <th className="py-1 px-2 text-left">Agente Causador</th>
                <th className="py-1 px-2 text-left">Atendimento Médico / CID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {catsColab.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-2 px-2 text-center text-neutral-500 italic">Sem registro de acidentes de trabalho no período.</td>
                </tr>
              ) : (
                catsColab.map(c => (
                  <tr key={c.id}>
                    <td className="py-1 px-2 font-mono font-bold">{c.numeroCat}</td>
                    <td className="py-1 px-2 font-mono">{c.dataHoraAcidente.replace('T', ' ')}</td>
                    <td className="py-1 px-2">{c.tipoAcidente}</td>
                    <td className="py-1 px-2">{c.parteCorpoAtingida}</td>
                    <td className="py-1 px-2">{c.agenteCausador}</td>
                    <td className="py-1 px-2 font-mono">{c.atendimentoMedico.nomeHospital} (CID: {c.atendimentoMedico.cid10})</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Termo de Responsabilidade e Assinaturas */}
        <div className="pt-6 border-t border-neutral-300 mt-4 text-[9px] text-neutral-600">
          <p className="leading-tight mb-8">
            Declaramos, sob as penas da lei, que as informações constantes deste documento foram extraídas dos Laudos Técnicos de Condições Ambientais do Trabalho (LTCAT), Programa de Gerenciamento de Riscos (PGR) e Programa de Controle Médico de Saúde Ocupacional (PCMSO), estando em estrita consonância com a legislação previdenciária e trabalhista vigente.
          </p>
          <div className="grid grid-cols-2 gap-12 text-center">
            <div className="border-t border-neutral-800 pt-1">
              <span className="font-bold text-neutral-900 block text-[10px]">{empresa.responsavelLegal || 'Representante Legal da Empresa'}</span>
              <span className="text-[8px] text-neutral-500 uppercase">Empregador / Responsável Administrativo</span>
            </div>
            <div className="border-t border-neutral-800 pt-1">
              <span className="font-bold text-neutral-900 block text-[10px]">Eng. Guilherme Fontes Braga (CREA-SP 5069874120)</span>
              <span className="text-[8px] text-neutral-500 uppercase">Responsável pelos Registros Ambientais (SST)</span>
            </div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `PERFIL PROFISSIOGRÁFICO PREVIDENCIÁRIO (PPP) - ${colab.nome}`,
      `Conforme Instrução Normativa PRES/INSS nº 128/2022 e Evento eSocial S-2240`,
      relatorioA4,
      'portrait'
    );
  };

  const getColabNome = (id: number) => {
    const c = colaboradores.find(x => x.id === id);
    return c ? c.nome : `Colaborador #${id}`;
  };

  return (
    <div className="h-full flex flex-col bg-[#141414] text-neutral-100 overflow-hidden">
      {/* Top Banner de Navegação SST Fluent */}
      <div className="p-4 bg-[#181818] border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-neutral-100">Saúde e Segurança do Trabalho (SST) & eSocial</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Portaria MTP 671 / NRs
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Controle de Afastamentos (S-2230), Exames Ocupacionais ASO (S-2220), Riscos Ambientais/PPP (S-2240) e CAT (S-2210)
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center space-x-1 bg-neutral-900/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('AFASTAMENTOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'AFASTAMENTOS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Afastamentos (S-2230)
          </button>
          <button
            onClick={() => setActiveTab('ASO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ASO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Exames / ASO (S-2220)
          </button>
          <button
            onClick={() => setActiveTab('RISCOS_PPP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'RISCOS_PPP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Riscos Ambientais & PPP (S-2240)
          </button>
          <button
            onClick={() => setActiveTab('CAT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'CAT' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Acidentes / CAT (S-2210)
          </button>
          <button
            onClick={() => setActiveTab('ESOCIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ESOCIAL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Painel eSocial SST
          </button>
        </div>
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div className={`mx-4 mt-3 px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
          feedback.tipo === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          feedback.tipo === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
          'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-neutral-200">✕</button>
        </div>
      )}

      {/* Conteúdo Dinâmico por Aba */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* ABA 1: AFASTAMENTOS TEMPORÁRIOS */}
        {activeTab === 'AFASTAMENTOS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="text"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Buscar colaborador ou motivo..."
                    className="pl-9 pr-3 py-1.5 bg-[#181818] border border-white/10 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 w-64"
                  />
                </div>
                <span className="text-xs text-neutral-400">
                  Total de Afastamentos: <strong className="text-neutral-200">{afastamentos.length}</strong>
                </span>
              </div>
              <button
                onClick={() => setModalAfastamento(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow"
              >
                <Plus size={14} />
                <span>Registrar Afastamento (S-2230)</span>
              </button>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/60 text-neutral-400 uppercase text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-3">Colaborador</th>
                    <th className="py-2.5 px-3">Motivo Legal</th>
                    <th className="py-2.5 px-3">Período</th>
                    <th className="py-2.5 px-2 text-center">Dias Totais</th>
                    <th className="py-2.5 px-2 text-center">Dias Empresa</th>
                    <th className="py-2.5 px-2 text-center">Dias INSS</th>
                    <th className="py-2.5 px-3">Médico / CRM</th>
                    <th className="py-2.5 px-2 text-center">CID-10</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {afastamentos
                    .filter(a => a.colaboradorNome.toLowerCase().includes(busca.toLowerCase()) || a.descricaoMotivo.toLowerCase().includes(busca.toLowerCase()))
                    .map(a => (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-2 px-3 font-sans font-medium text-neutral-200">
                          {a.colaboradorNome}
                          <span className="block text-[9px] text-neutral-500 font-mono">Matrícula: {a.matriculaEsocial}</span>
                        </td>
                        <td className="py-2 px-3 font-sans text-neutral-300">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono mr-1">
                            {a.codigoMotivoEsocial}
                          </span>
                          {a.descricaoMotivo}
                        </td>
                        <td className="py-2 px-3 text-neutral-300">
                          {a.dataInicio} {a.dataRetornoPrevista ? `a ${a.dataRetornoPrevista}` : '(Indeterminado)'}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-neutral-200">{a.diasAfastamentoTotal}d</td>
                        <td className="py-2 px-2 text-center font-bold text-emerald-400">{a.diasPagoEmpregador}d</td>
                        <td className="py-2 px-2 text-center font-bold text-amber-400">{a.diasBeneficioInss}d</td>
                        <td className="py-2 px-3 font-sans text-neutral-400 text-[10px]">
                          {a.nomeMedico || '-'} ({a.crmMedico || '-'}/{a.ufCrm || '-'})
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-rose-400">{a.cid10 || '-'}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            a.status === 'RETORNADO' ? 'bg-neutral-800 text-neutral-400 border border-white/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right space-x-1">
                          <button
                            onClick={() => {
                              const xml = dbService.gerarXmlEsocialSst('S-2230', a.id);
                              setXmlModal({ titulo: `eSocial S-2230 - Afastamento ${a.colaboradorNome}`, conteudo: xml });
                            }}
                            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-sans px-1.5 border border-white/10"
                            title="Ver XML S-2230"
                          >
                            XML
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Deseja excluir este registro de afastamento?')) {
                                dbService.excluirAfastamento(a.id);
                                carregarDados();
                              }
                            }}
                            className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                            title="Excluir"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: EXAMES MÉDICOS / ASO (S-2220) */}
        {activeTab === 'ASO' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Atestados de Saúde Ocupacional Registrados: <strong className="text-neutral-200">{asos.length}</strong>
              </span>
              <button
                onClick={() => setModalAso(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow"
              >
                <Plus size={14} />
                <span>Novo ASO (S-2220)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {asos.map(aso => (
                <div key={aso.id} className="p-4 bg-[#181818] border border-white/5 rounded-xl shadow space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-100">{aso.colaboradorNome}</h4>
                        <span className="text-[10px] text-neutral-500 font-mono">Realizado em: {aso.dataExame}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      aso.resultadoAptidao === 'APTO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {aso.resultadoAptidao}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-900/40 p-2.5 rounded-lg border border-white/5">
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase">Tipo de Exame</span>
                      <span className="font-semibold text-neutral-300">{aso.tipoExame}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase">Validade do ASO</span>
                      <span className="font-mono text-neutral-300">{aso.dataValidade || '-'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase">Médico Examinador</span>
                      <span className="text-neutral-300 text-[11px]">{aso.medicoExaminador} (CRM: {aso.crmExaminador})</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase">Médico Coordenador</span>
                      <span className="text-neutral-300 text-[11px]">{aso.medicoCoordenadorPcmso}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">
                      Exames Complementares:
                    </span>
                    <div className="space-y-1">
                      {aso.examesComplementares.map((e, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] px-2 py-1 bg-white/[0.02] rounded border border-white/5">
                          <span className="text-neutral-300">{e.nomeExame}</span>
                          <span className="font-mono text-emerald-400 font-bold">{e.resultado}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500 font-mono">Recibo eSocial: {aso.reciboEsocial}</span>
                    <button
                      onClick={() => {
                        const xml = dbService.gerarXmlEsocialSst('S-2220', aso.id);
                        setXmlModal({ titulo: `eSocial S-2220 - ASO ${aso.colaboradorNome}`, conteudo: xml });
                      }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[10px] border border-white/10"
                    >
                      Ver XML
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: RISCOS AMBIENTAIS & PPP (S-2240) */}
        {activeTab === 'RISCOS_PPP' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Fatores de Risco Ocupacional Mapeados: <strong className="text-neutral-200">{fatoresRisco.length}</strong>
              </span>
              <button
                onClick={() => setModalRisco(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow"
              >
                <Plus size={14} />
                <span>Adicionar Fator de Risco (S-2240)</span>
              </button>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-900/60 text-neutral-400 uppercase text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-3">Colaborador / Setor</th>
                    <th className="py-2.5 px-3">Código Tabela 24</th>
                    <th className="py-2.5 px-3">Agente Nocivo</th>
                    <th className="py-2.5 px-2 text-center">Intensidade</th>
                    <th className="py-2.5 px-3">Técnica de Medição</th>
                    <th className="py-2.5 px-2 text-center">EPI Eficaz</th>
                    <th className="py-2.5 px-2 text-center">CA do EPI</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {fatoresRisco.map(f => (
                    <tr key={f.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2 px-3 font-sans">
                        <span className="font-semibold text-neutral-200 block">{f.colaboradorNome}</span>
                        <span className="text-[10px] text-neutral-500">{f.cargo} - {f.setor}</span>
                      </td>
                      <td className="py-2 px-3 font-bold text-amber-400">{f.codigoTabela24}</td>
                      <td className="py-2 px-3 font-sans text-neutral-300">{f.descricaoAgenteNocivo}</td>
                      <td className="py-2 px-2 text-center font-bold text-neutral-200">{f.intensidadeConcentracao}</td>
                      <td className="py-2 px-3 font-sans text-neutral-400 text-[10px]">{f.tecnicaUtilizada}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          f.epiEficaz ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {f.epiEficaz ? 'SIM' : 'NÃO'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-neutral-200">{f.caEpi || '-'}</td>
                      <td className="py-2 px-3 text-right space-x-1 font-sans">
                        <button
                          onClick={() => {
                            const c = colaboradores.find(x => x.id === f.colaboradorId);
                            if (c) handleImprimirPpp(c);
                          }}
                          className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded text-[10px] font-semibold border border-emerald-500/30"
                          title="Imprimir PPP Eletrônico Oficial A4"
                        >
                          Emitir PPP A4
                        </button>
                        <button
                          onClick={() => {
                            const xml = dbService.gerarXmlEsocialSst('S-2240', f.id);
                            setXmlModal({ titulo: `eSocial S-2240 - Condições Ambientais ${f.colaboradorNome}`, conteudo: xml });
                          }}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] border border-white/10"
                        >
                          XML
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: COMUNICAÇÃO DE ACIDENTE DE TRABALHO - CAT (S-2210) */}
        {activeTab === 'CAT' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Comunicações de Acidente de Trabalho: <strong className="text-neutral-200">{cats.length}</strong>
              </span>
              <button
                onClick={() => setModalCat(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow"
              >
                <Plus size={14} />
                <span>Registrar CAT (S-2210)</span>
              </button>
            </div>

            <div className="space-y-3">
              {cats.map(cat => (
                <div key={cat.id} className="p-4 bg-[#181818] border border-rose-500/20 rounded-xl shadow space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {cat.numeroCat}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-100">{cat.colaboradorNome}</h4>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Data/Hora: {cat.dataHoraAcidente.replace('T', ' ')} | Tipo: <strong className="text-neutral-200">{cat.tipoAcidente}</strong>
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      S-2210 Transmitido
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-neutral-900/40 p-2.5 rounded-lg border border-white/5 font-sans">
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase">Local do Acidente</span>
                      <span className="text-neutral-300">{cat.localAcidente}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase">Parte do Corpo Atingida</span>
                      <span className="text-neutral-300">{cat.parteCorpoAtingida}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase">Agente Causador</span>
                      <span className="text-neutral-300">{cat.agenteCausador}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-neutral-400 bg-neutral-900/60 p-2 rounded-lg border border-white/5">
                    <span>
                      Atendimento Hospitalar: <strong className="text-neutral-200">{cat.atendimentoMedico.nomeHospital}</strong> (CID-10: <strong className="text-rose-400">{cat.atendimentoMedico.cid10}</strong>)
                    </span>
                    <button
                      onClick={() => {
                        const xml = dbService.gerarXmlEsocialSst('S-2210', cat.id);
                        setXmlModal({ titulo: `eSocial S-2210 - CAT ${cat.numeroCat}`, conteudo: xml });
                      }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[10px] border border-white/10"
                    >
                      Ver XML S-2210
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 5: PAINEL ESOCIAL SST */}
        {activeTab === 'ESOCIAL' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#181818] border border-white/5 rounded-xl shadow">
              <h3 className="text-sm font-bold text-neutral-100 mb-2 flex items-center space-x-2">
                <Send size={16} className="text-emerald-400" />
                <span>Central de Transmissão & Conformidade eSocial SST</span>
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Todos os eventos de Saúde e Segurança do Trabalho são estruturados em XML conforme o Manual de Orientação do eSocial (MOS v. S-1.2), prontos para assinatura digital A1/A3 e envio imediato ao ambiente do Governo Federal.
              </p>

              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">S-2210 (CAT)</span>
                  <span className="text-lg font-black text-rose-400">{cats.length}</span>
                  <span className="text-[10px] text-neutral-400 block mt-1">Acidentes de Trabalho</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">S-2220 (ASO)</span>
                  <span className="text-lg font-black text-emerald-400">{asos.length}</span>
                  <span className="text-[10px] text-neutral-400 block mt-1">Monitoramento da Saúde</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">S-2240 (Condições)</span>
                  <span className="text-lg font-black text-amber-400">{fatoresRisco.length}</span>
                  <span className="text-[10px] text-neutral-400 block mt-1">Fatores de Risco Ambientais</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">S-2230 (Afastamentos)</span>
                  <span className="text-lg font-black text-blue-400">{afastamentos.length}</span>
                  <span className="text-[10px] text-neutral-400 block mt-1">Afastamentos Temporários</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Registrar Afastamento */}
      {modalAfastamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-neutral-100 mb-3 flex items-center space-x-2">
              <Calendar size={18} className="text-emerald-400" />
              <span>Registrar Afastamento Temporário (S-2230)</span>
            </h3>
            <form onSubmit={handleSalvarAfastamento} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Colaborador:</label>
                <select
                  value={colabIdAfast}
                  onChange={e => setColabIdAfast(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} (CPF: {c.cpf})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Motivo do Afastamento:</label>
                  <select
                    value={motivoAfast}
                    onChange={e => setMotivoAfast(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="01_ACIDENTE_TRABALHO_INSS">01 - Acidente do Trabalho</option>
                    <option value="03_DOENCA_NAO_OCUPACIONAL_INSS">03 - Doença Não Ocupacional</option>
                    <option value="17_LICENCA_MATERNIDADE_120D">17 - Licença Maternidade (120 dias)</option>
                    <option value="21_FERIAS_REGULAMENTARES">21 - Férias Regulamentares</option>
                    <option value="99_OUTROS_AFASTAMENTOS">99 - Outros Afastamentos</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Código CID-10:</label>
                  <input
                    type="text"
                    value={cid10Afast}
                    onChange={e => setCid10Afast(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    placeholder="Ex: M54.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Data Início:</label>
                  <input
                    type="date"
                    value={dtIniAfast}
                    onChange={e => setDtIniAfast(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Previsão de Retorno:</label>
                  <input
                    type="date"
                    value={dtFimPrevAfast}
                    onChange={e => setDtFimPrevAfast(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-neutral-400 block mb-1">Médico Emitente do Atestado:</label>
                  <input
                    type="text"
                    value={medicoAfast}
                    onChange={e => setMedicoAfast(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                    placeholder="Nome completo do médico"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CRM / UF:</label>
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={crmAfast}
                      onChange={e => setCrmAfast(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    />
                    <input
                      type="text"
                      value={ufCrmAfast}
                      onChange={e => setUfCrmAfast(e.target.value)}
                      className="w-12 bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 uppercase font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalAfastamento(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow"
                >
                  Gravar & Transmitir S-2230
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo ASO */}
      {modalAso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-neutral-100 mb-3 flex items-center space-x-2">
              <Stethoscope size={18} className="text-emerald-400" />
              <span>Registrar Atestado de Saúde Ocupacional (S-2220)</span>
            </h3>
            <form onSubmit={handleSalvarAso} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Colaborador:</label>
                <select
                  value={colabIdAso}
                  onChange={e => setColabIdAso(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} - {c.cargo}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo de Exame:</label>
                  <select
                    value={tipoAso}
                    onChange={e => setTipoAso(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="ADMISSIONAL">Admissional</option>
                    <option value="PERIODICO">Periódico</option>
                    <option value="RETORNO_TRABALHO">Retorno ao Trabalho</option>
                    <option value="MUDANCA_RISCO">Mudança de Risco</option>
                    <option value="DEMISSIONAL">Demissional</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Data do Exame:</label>
                  <input
                    type="date"
                    value={dtExameAso}
                    onChange={e => setDtExameAso(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Resultado:</label>
                  <select
                    value={aptidaoAso}
                    onChange={e => setAptidaoAso(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-bold"
                  >
                    <option value="APTO">APTO</option>
                    <option value="INAPTO">INAPTO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Médico Examinador:</label>
                  <input
                    type="text"
                    value={examinadorAso}
                    onChange={e => setExaminadorAso(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CRM Examinador:</label>
                  <input
                    type="text"
                    value={crmExaminadorAso}
                    onChange={e => setCrmExaminadorAso(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Exames Complementares (separados por ponto-e-vírgula):</label>
                <input
                  type="text"
                  value={exameCompAso}
                  onChange={e => setExameCompAso(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalAso(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow"
                >
                  Salvar ASO & Gerar S-2220
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fator de Risco / PPP */}
      {modalRisco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-neutral-100 mb-3 flex items-center space-x-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>Adicionar Fator de Risco Ocupacional (S-2240)</span>
            </h3>
            <form onSubmit={handleSalvarRisco} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Colaborador:</label>
                <select
                  value={colabIdRisco}
                  onChange={e => setColabIdRisco(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} - {c.cargo}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo de Risco:</label>
                  <select
                    value={tipoRisco}
                    onChange={e => setTipoRisco(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="FISICO">Físico (Ruído, Calor, Vibração)</option>
                    <option value="QUIMICO">Químico (Poeiras, Solventes, Gases)</option>
                    <option value="BIOLOGICO">Biológico (Vírus, Bactérias)</option>
                    <option value="ERGONOMICO">Ergonômico</option>
                    <option value="AUSENCIA_RISCO">Ausência de Agentes Nocivos</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Código Tabela 24 eSocial:</label>
                  <input
                    type="text"
                    value={codTabela24}
                    onChange={e => setCodTabela24(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    placeholder="Ex: 01.01.001"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descrição do Agente Nocivo:</label>
                <input
                  type="text"
                  value={descRisco}
                  onChange={e => setDescRisco(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Intensidade / Concentração:</label>
                  <input
                    type="text"
                    value={intensidade}
                    onChange={e => setIntensidade(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    placeholder="Ex: 85 dB(A)"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Técnica Utilizada:</label>
                  <input
                    type="text"
                    value={tecnica}
                    onChange={e => setTecnica(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">EPC Eficaz:</label>
                  <select
                    value={epcEficaz ? 'S' : 'N'}
                    onChange={e => setEpcEficaz(e.target.value === 'S')}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="S">Sim</option>
                    <option value="N">Não</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">EPI Eficaz:</label>
                  <select
                    value={epiEficaz ? 'S' : 'N'}
                    onChange={e => setEpiEficaz(e.target.value === 'S')}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="S">Sim</option>
                    <option value="N">Não</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CA do EPI:</label>
                  <input
                    type="text"
                    value={caEpi}
                    onChange={e => setCaEpi(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                    placeholder="Ex: 15485"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalRisco(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow"
                >
                  Salvar Fator de Risco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal CAT */}
      {modalCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-rose-500/30 rounded-xl shadow-2xl max-w-lg w-full p-5 text-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-neutral-100 mb-3 flex items-center space-x-2">
              <BadgeAlert size={18} className="text-rose-400" />
              <span>Registrar Comunicação de Acidente de Trabalho (S-2210)</span>
            </h3>
            <form onSubmit={handleSalvarCat} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Colaborador Acidentado:</label>
                <select
                  value={colabIdCat}
                  onChange={e => setColabIdCat(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} - {c.cargo}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Tipo de Acidente:</label>
                  <select
                    value={tipoCat}
                    onChange={e => setTipoCat(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="TIPICO">Típico (No local de trabalho)</option>
                    <option value="TRAJETO">Trajeto (Residência - Trabalho)</option>
                    <option value="DOENCA_PROFISSIONAL">Doença Profissional</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Data e Hora do Acidente:</label>
                  <input
                    type="datetime-local"
                    value={dtHoraCat}
                    onChange={e => setDtHoraCat(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Local Exato do Acidente:</label>
                <input
                  type="text"
                  value={localCat}
                  onChange={e => setLocalCat(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Parte do Corpo Atingida:</label>
                  <input
                    type="text"
                    value={parteCorpo}
                    onChange={e => setParteCorpo(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Agente Causador:</label>
                  <input
                    type="text"
                    value={agenteCausador}
                    onChange={e => setAgenteCausador(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Hospital / Unidade de Saúde:</label>
                  <input
                    type="text"
                    value={hospitalCat}
                    onChange={e => setHospitalCat(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CID-10 do Atendimento:</label>
                  <input
                    type="text"
                    value={cid10Cat}
                    onChange={e => setCid10Cat(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalCat(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold shadow"
                >
                  Transmitir CAT ao eSocial (S-2210)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizador XML */}
      {xmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full p-5 text-neutral-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-neutral-100">{xmlModal.titulo}</h3>
              <button onClick={() => setXmlModal(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <pre className="flex-1 overflow-auto bg-neutral-950 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-emerald-400 my-3 select-all">
              {xmlModal.conteudo}
            </pre>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(xmlModal.conteudo);
                  alert('XML copiado para a área de transferência.');
                }}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs"
              >
                Copiar XML
              </button>
              <button
                onClick={() => setXmlModal(null)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
