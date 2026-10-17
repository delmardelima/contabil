import React, { useState, useMemo } from 'react';
import { 
  ContaContabil, 
  LancamentoContabil, 
  HistoricoPadrao, 
  Empresa, 
  PropostaDestinacaoResultado, 
  SocioDistribuicao 
} from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { dbService } from '../../db/sqliteService';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles,
  PieChart,
  Users,
  DollarSign,
  Calendar,
  Layers,
  ShieldCheck,
  Award,
  Landmark,
  Building2,
  Printer,
  FileText,
  FileSpreadsheet,
  Check
} from 'lucide-react';

interface ZeramentoModuleProps {
  empresaId: number;
  empresa?: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  historicos: HistoricoPadrao[];
  onExecutarZeramento: (novosLancamentos: Omit<LancamentoContabil, 'id' | 'createdAt'>[]) => void;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
}

export const ZeramentoModule: React.FC<ZeramentoModuleProps> = ({
  empresaId,
  empresa,
  contas,
  lancamentos,
  historicos,
  onExecutarZeramento,
  onOpenReportPreview
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'ZERAMENTO' | 'DESTINACAO' | 'ATA'>('ZERAMENTO');
  
  // Parâmetros do Zeramento (Aba 1 - Zeramento_Contabilidade.htm & Op__es_Contabilidade.htm)
  const [dataZeramento, setDataZeramento] = useState('2026-12-31');
  const [tipoEncerramento, setTipoEncerramento] = useState<'ANUAL' | 'TRIMESTRAL' | 'MENSAL'>('ANUAL');
  const [contaDestinoId, setContaDestinoId] = useState<number>(41); // Lucro Líquido do Exercício em Curso (ARE)
  const [historicoId, setHistoricoId] = useState<number>(8); // Zeramento de encerramento
  const [gruposParaZerar, setGruposParaZerar] = useState<string[]>(['3.', '4.']);
  const [novoGrupoPrefixo, setNovoGrupoPrefixo] = useState<string>('3.01');
  const [sucessoMsg, setSucessoMsg] = useState('');
  const [encerramentoExecutado, setEncerramentoExecutado] = useState(false);

  // Parâmetros da Destinação de Lucro Isento (Aba 2 - Art. 14 LC 123/2006 & ITG 1000)
  const [percentualDistribuicao, setPercentualDistribuicao] = useState<number>(100);
  const [constituirReservaLegal, setConstituirReservaLegal] = useState<boolean>(false); // Dispensada para ME/EPP/Ltda ITG 1000
  const [pagarDiretoCaixaBanco, setPagarDiretoCaixaBanco] = useState<boolean>(false);
  const [destinacaoIntegrada, setDestinacaoIntegrada] = useState<boolean>(false);
  const [mensagemDestinacao, setMensagemDestinacao] = useState<string>('');

  // Parâmetros da Ata / Recibos & Informe de Rendimentos Isentos (Aba 3)
  const [dataReuniao, setDataReuniao] = useState<string>('2026-12-31');
  const [localReuniao, setLocalReuniao] = useState<string>('Sede Social da Empresa');

  // Contas analíticas de PL elegíveis para destino (Guia Zeramento -> Conta destino)
  const contasDestinoPossiveis = contas.filter(c => c.tipo === 'A' && c.classificacao.startsWith('2.03'));
  const contasSinteticasResultado = contas.filter(
    c => c.tipo === 'S' && (c.classificacao.startsWith('3') || c.classificacao.startsWith('4') || c.classificacao.startsWith('5'))
  );

  const handleIncluirGrupoZeramento = () => {
    const pref = novoGrupoPrefixo.trim();
    if (!pref) return;
    const norm = pref.endsWith('.') ? pref : `${pref}.`;
    if (!gruposParaZerar.includes(norm)) {
      setGruposParaZerar([...gruposParaZerar, norm]);
    }
  };

  const handleExcluirGrupoZeramento = (pref: string) => {
    if (gruposParaZerar.length <= 1) return;
    setGruposParaZerar(gruposParaZerar.filter(g => g !== pref));
  };

  // Gera o preview dos lançamentos de zeramento conforme Guia Zeramento
  const novosLancamentos = useMemo(() => {
    return AccountingEngine.executeZeramento(
      empresaId,
      contas,
      lancamentos,
      dataZeramento,
      contaDestinoId,
      historicoId,
      gruposParaZerar
    );
  }, [empresaId, contas, lancamentos, dataZeramento, contaDestinoId, historicoId, gruposParaZerar]);

  // Cálculos de Resultado do Período
  const { totalReceitas, totalDespesas, resultadoLiquido, contasReceitasCount, contasDespesasCount } = useMemo(() => {
    const balances = AccountingEngine.calculateBalances(contas, lancamentos, true);
    let receitas = 0;
    let despesas = 0;
    let recCount = 0;
    let despCount = 0;

    for (const c of contas) {
      if (c.tipo === 'A') {
        const b = balances.get(c.id);
        const val = b ? Math.abs(b.saldoAtual) : 0;
        if (c.classificacao.startsWith('3.') || (c.natureza === 'C' && c.classificacao.startsWith('4.'))) {
          receitas += val;
          if (val > 0) recCount++;
        } else if (c.classificacao.startsWith('4.') || c.classificacao.startsWith('5.')) {
          despesas += val;
          if (val > 0) despCount++;
        }
      }
    }

    const resultado = receitas - despesas;
    return {
      totalReceitas: receitas,
      totalDespesas: despesas,
      resultadoLiquido: resultado,
      contasReceitasCount: recCount,
      contasDespesasCount: despCount
    };
  }, [contas, lancamentos]);

  const totalZerado = novosLancamentos.reduce((acc, l) => acc + l.valor, 0);

  // Comparativo de Isenção Art. 14 da LC 123/2006 (Presunção 8%/32% vs Escrituração Contábil ITG 1000)
  const comparativoIsencaoSimples = useMemo(() => {
    const baseLucro = resultadoLiquido > 0 ? resultadoLiquido : 148500.00;
    return dbService.calcularLimitesLucroIsentoSimplesMei(empresaId, baseLucro);
  }, [empresaId, resultadoLiquido]);

  // Proposta de Destinação do Resultado Calculada (Aba 2)
  const propostaCalculada: PropostaDestinacaoResultado = useMemo(() => {
    const exercicio = empresa?.exercicioAtivo || 2026;
    const baseLucro = resultadoLiquido > 0 ? resultadoLiquido : 148500.00;
    
    // 1. Reserva Legal: Opcional para ME/EPP/Simples Nacional (ITG 1000); 5% quando marcada
    const percReserva = constituirReservaLegal ? 5 : 0;
    const valorReserva = Math.round((baseLucro * (percReserva / 100)) * 100) / 100;
    const lucroAposReserva = baseLucro - valorReserva;

    // 2. Lucros Isentos a Distribuir aos Sócios / Titular MEI (Art. 14 LC 123/2006)
    const valorTotalDistr = Math.round((lucroAposReserva * (percentualDistribuicao / 100)) * 100) / 100;

    // 3. Saldo Remanescente em Lucros Acumulados (ITG 1000)
    const valorRetencao = Math.round((lucroAposReserva - valorTotalDistr) * 100) / 100;

    // Sócios do QSA
    const sociosQSA = empresa?.socios && empresa.socios.length > 0 ? empresa.socios : [
      { id: 1, nome: 'Carlos Eduardo Mendes', cpf: '123.456.789-00', percentualCapital: 60, retiraProLabore: true, dataEntrada: '2018-05-10' },
      { id: 2, nome: 'Dra. Mariana Costa Mendes', cpf: '234.567.890-11', percentualCapital: 40, retiraProLabore: false, dataEntrada: '2018-05-10' }
    ];

    const distribuicao: SocioDistribuicao[] = sociosQSA.map(s => ({
      socioId: s.id,
      socioNome: s.nome,
      cpf: s.cpf,
      percentual: s.percentualCapital,
      valorDividendo: Math.round((valorTotalDistr * (s.percentualCapital / 100)) * 100) / 100
    }));

    return {
      empresaId,
      exercicio,
      lucroLiquidoApurado: baseLucro,
      percentualReservaLegal: percReserva,
      valorReservaLegal: valorReserva,
      percentualDistribuicao,
      valorTotalDistribuir: valorTotalDistr,
      distribuicaoSocios: distribuicao,
      valorRetencaoExpansao: valorRetencao,
      dataAprovacao: dataReuniao
    };
  }, [empresa, empresaId, resultadoLiquido, percentualDistribuicao, constituirReservaLegal, dataReuniao]);

  // Ação 1: Processar Zeramento
  const handleConfirmarZeramento = () => {
    if (novosLancamentos.length === 0) return;
    onExecutarZeramento(novosLancamentos);
    setEncerramentoExecutado(true);
    setSucessoMsg(`Zeramento executado com sucesso! Foram geradas ${novosLancamentos.length} partidas com origem 'Zeramento' transferidas para a conta destino.`);
    setTimeout(() => setSucessoMsg(''), 7000);
  };

  // Ação 2: Integrar Destinação do Resultado
  const handleIntegrarDestinacao = () => {
    const res = dbService.integrarDestinacaoResultadoContabil(empresaId, propostaCalculada, pagarDiretoCaixaBanco);
    if (res.success) {
      setDestinacaoIntegrada(true);
      setMensagemDestinacao(
        `✅ Lote Contábil #${res.loteId} de Distribuição de Lucros Isentos (LC 123/2006 Art. 14) integrado com sucesso! (${res.partidas} partida(s) gerada(s) no Diário${pagarDiretoCaixaBanco ? ' e no Livro Caixa/Banco' : ''}).`
      );
      setTimeout(() => setMensagemDestinacao(''), 8000);
    }
  };

  // Ação 3: Imprimir Informe de Rendimentos Isentos & Recibo de Distribuição de Lucros (DIRPF / MEI / Simples)
  const handleImprimirInformeIsentosA4 = () => {
    if (!onOpenReportPreview) return;

    const razaoSocial = empresa?.razaoSocial || 'EMPRESA CONTÁBIL MODELO LTDA';
    const cnpj = empresa?.cnpj || '12.345.678/0001-90';
    const contador = empresa?.contadorNome || 'Bel. Roberto Silva';
    const crc = empresa?.contadorCRC || 'CRC-SP 123456/O-8';

    const conteudoInforme = (
      <div className="font-sans text-black space-y-5 text-xs">
        <div className="border-2 border-black p-3 bg-gray-100">
          <h2 className="text-sm font-bold uppercase">
            COMPROVANTE DE DISTRIBUIÇÃO DE LUCROS ISENTOS & INFORME PARA DIRPF (FICHA RENDIMENTOS ISENTOS - CÓD. 09 / 13)
          </h2>
          <p className="text-[11px] text-gray-700 mt-0.5">
            Base Legal: Art. 14, §§ 1º e 2º da Lei Complementar nº 123/2006, Art. 10 da Lei nº 9.249/1995 e Resolução CFC ITG 1000
          </p>
        </div>

        <div className="border border-black p-3 grid grid-cols-2 gap-2 text-xs">
          <div><strong>Fonte Pagadora (PJ):</strong> {razaoSocial}</div>
          <div><strong>CNPJ:</strong> <span className="font-mono">{cnpj}</span></div>
          <div><strong>Regime Tributário:</strong> {empresa?.regimeTributario.replace('_', ' ')} ({empresa?.porteEmpresa || 'ME'})</div>
          <div><strong>Ano-Calendário / Exercício:</strong> {propostaCalculada.exercicio}</div>
        </div>

        {/* Quadro Comparativo Art. 14 LC 123/2006 */}
        <div className="border border-black">
          <div className="bg-gray-100 font-bold p-2 border-b border-black uppercase text-[11px]">
            1. DEMONSTRATIVO TÉCNICO DE ISENÇÃO DO LUCRO DISTRIBUÍDO (ART. 14 DA LC 123/2006)
          </div>
          <div className="p-3 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="font-sans">Receita Bruta Acumulada Comércio (Presunção 8% = R$ {comparativoIsencaoSimples.presuncaoComercio8Porcento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}):</span>
              <span>R$ {comparativoIsencaoSimples.receitaComercio12M.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans">Receita Bruta Acumulada Serviços (Presunção 32% = R$ {comparativoIsencaoSimples.presuncaoServicos32Porcento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}):</span>
              <span>R$ {comparativoIsencaoSimples.receitaServicos12M.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-sans">Limite Isento por Presunção Legal (Sem Contabilidade — Art. 14, § 1º LC 123/06):</span>
              <span>R$ {comparativoIsencaoSimples.limiteIsentoSemEscrituracao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-black pt-1.5 text-black">
              <span className="font-sans">Limite Isento com Escrituração Contábil ITG 1000 (Art. 14, § 2º LC 123/06 — 100% do Lucro):</span>
              <span>R$ {comparativoIsencaoSimples.limiteIsentoComEscrituracaoItg1000.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Quadro de Beneficiários (Sócios / Titular MEI) */}
        <div className="border border-black">
          <div className="bg-gray-100 font-bold p-2 border-b border-black uppercase text-[11px]">
            2. RELAÇÃO DE SÓCIOS / TITULAR BENEFICIÁRIOS E VALORES ISENTOS DE IRPF
          </div>
          <table className="w-full border-collapse text-[11px] font-mono">
            <thead>
              <tr className="border-b border-black bg-gray-50">
                <th className="p-2 text-left font-sans">Nome do Sócio / Titular</th>
                <th className="p-2 text-left">CPF</th>
                <th className="p-2 text-center">% Quotas</th>
                <th className="p-2 text-right">Lucro Isento Pago/Creditado (R$)</th>
                <th className="p-2 text-right">IRRF Retido (R$)</th>
              </tr>
            </thead>
            <tbody>
              {propostaCalculada.distribuicaoSocios.map((s, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="p-2 font-sans font-bold">{s.socioNome}</td>
                  <td className="p-2">{s.cpf}</td>
                  <td className="p-2 text-center">{s.percentual.toFixed(2)}%</td>
                  <td className="p-2 text-right font-bold">R$ {s.valorDividendo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2 text-right">R$ 0,00 (ISENTO)</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black font-bold bg-gray-100">
                <td colSpan={3} className="p-2 text-right font-sans uppercase">TOTAL DE LUCROS ISENTOS DISTRIBUÍDOS:</td>
                <td className="p-2 text-right">R$ {propostaCalculada.valorTotalDistribuir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-2 text-right">R$ 0,00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="border border-black p-3 bg-gray-50 text-[11px] leading-relaxed">
          <strong>Orientação para Declaração de Ajuste Anual (DIRPF Pessoa Física):</strong> Os valores acima devem ser informados na ficha{' '}
          <em>"Rendimentos Isentos e Não Tributáveis"</em> sob o <strong>Código 09</strong> (Lucros e dividendos recebidos) ou{' '}
          <strong>Código 13</strong> (Rendimento de sócio ou titular de microempresa ou empresa de pequeno porte optante pelo Simples Nacional), tendo a empresa mantido escrituração contábil regular conforme Resolução CFC ITG 1000.
        </div>

        <div className="grid grid-cols-2 gap-8 pt-8 text-center">
          <div className="border-t border-black pt-2">
            <div className="font-bold">{empresa?.responsavelLegal || razaoSocial}</div>
            <div className="text-[10px]">Representante Legal / Sócio Administrador</div>
          </div>
          <div className="border-t border-black pt-2">
            <div className="font-bold">{contador}</div>
            <div className="text-[10px]">Contador Responsável Técnico • {crc}</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'INFORME E RECIBO DE DISTRIBUIÇÃO DE LUCROS ISENTOS (SIMPLES NACIONAL / MEI)',
      subtitulo: `Art. 14, §§ 1º e 2º da Lei Complementar nº 123/2006 • Escrituração Contábil ITG 1000`,
      conteudo: conteudoInforme
    });
  };

  // Ação 4: Imprimir Ata de Reunião A4 Oficial
  const handleImprimirAtaA4 = () => {
    if (!onOpenReportPreview) return;

    const razaoSocial = empresa?.razaoSocial || 'EMPRESA CONTÁBIL MODELO LTDA';
    const cnpj = empresa?.cnpj || '12.345.678/0001-90';
    const nire = empresa?.nire || '35.234.567.890';
    const endereco = `${empresa?.logradouro || 'Avenida Paulista, 1000'} - ${empresa?.cidade || 'São Paulo'}/${empresa?.uf || 'SP'}`;
    const capitalSocial = empresa?.capitalSocial || 500000;
    const contador = empresa?.contadorNome || 'Bel. Roberto Silva';
    const crc = empresa?.contadorCRC || 'CRC-SP 123456/O-8';

    const conteudoAta = (
      <div className="font-serif text-neutral-900 leading-relaxed space-y-6 max-w-4xl mx-auto p-4">
        {/* Cabeçalho Formal */}
        <div className="text-center border-b-2 border-neutral-900 pb-4">
          <h1 className="text-base font-bold uppercase tracking-wider">{razaoSocial}</h1>
          <p className="text-xs text-neutral-600 font-sans mt-1">
            CNPJ: {cnpj} • NIRE: {nire}
          </p>
          <p className="text-xs text-neutral-600 font-sans">
            Sede: {endereco}
          </p>
          <h2 className="text-sm font-bold uppercase tracking-wide mt-3 text-neutral-800">
            ATA DE APROVAÇÃO DE CONTAS (ITG 1000) E DISTRIBUIÇÃO DE LUCROS ISENTOS (LC 123/2006)
          </h2>
          <p className="text-xs italic text-neutral-600 font-sans">
            Aprovação das Demonstrações Contábeis Simplificadas e Destinação do Lucro Líquido Apurado
          </p>
        </div>

        {/* Corpo do Texto da Ata */}
        <div className="text-xs text-justify space-y-3 font-serif">
          <p>
            <strong>1. DATA, HORA E LOCAL:</strong> Aos 31 (trinta e um) dias do mês de dezembro de {empresa?.exercicioAtivo || 2026}, às 17h00min, reuniram-se na {localReuniao}, os sócios componentes do quadro societário da sociedade empresária <strong>{razaoSocial}</strong>, representando a totalidade de 100% (cem por cento) do capital social integralizado de R$ {capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
          </p>
          <p>
            <strong>2. CONVOCAÇÃO E PRESENÇAS:</strong> Dispensadas as formalidades convocatórias prévias tendo em vista o comparecimento unânime de todos os sócios detentores do capital social, nos termos facultados pelo Artigo 1.072, § 2º da Lei Federal nº 10.406/2002 (Código Civil).
          </p>
          <p>
            <strong>3. DELIBERAÇÕES TOMADAS POR UNANIMIDADE:</strong> Examinadas e aprovadas sem ressalvas as Demonstrações Contábeis (Balanço Patrimonial e DRE elaborados segundo a Resolução CFC ITG 1000) relativas ao exercício de {empresa?.exercicioAtivo || 2026}, que evidenciaram um <strong>Lucro Contábil Líquido de R$ {propostaCalculada.lucroLiquidoApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, deliberaram os sócios:
          </p>
          <div className="pl-4 border-l-2 border-neutral-300 space-y-2 text-xs italic font-serif">
            <p>
              <strong>a) DISTRIBUIÇÃO DE LUCROS ISENTOS DE IRRF (ART. 14, § 2º DA LC 123/2006):</strong> Tendo a sociedade mantido escrituração contábil regular no Livro Diário, fica aprovada a distribuição de <strong>R$ {propostaCalculada.valorTotalDistribuir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({propostaCalculada.percentualDistribuicao}%)</strong> a título de lucros totalmente isentos de Imposto de Renda na Fonte e na Declaração dos Sócios:
            </p>
            <ul className="list-disc pl-6 space-y-1 font-sans text-[11px] not-italic">
              {propostaCalculada.distribuicaoSocios.map((s, idx) => (
                <li key={idx}>
                  <strong>{s.socioNome}</strong> (CPF: {s.cpf}, {s.percentual}% de participação) — <strong>R$ {s.valorDividendo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                </li>
              ))}
            </ul>
            {propostaCalculada.valorRetencaoExpansao > 0 && (
              <p>
                <strong>b) SALDO EM LUCROS ACUMULADOS:</strong> O saldo remanescente de <strong>R$ {propostaCalculada.valorRetencaoExpansao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> permanecerá retido na conta de Lucros Acumulados do Patrimônio Líquido para reforço de capital de giro.
              </p>
            )}
          </div>
          <p>
            <strong>4. ENCERRAMENTO:</strong> Nada mais havendo a tratar, foi lavrada a presente ata e assinada pelos sócios e pelo contador responsável.
          </p>
        </div>

        {/* Quadro de Assinaturas Formais */}
        <div className="pt-8 space-y-6">
          <div className="text-center font-serif text-xs font-semibold text-neutral-800">
            {empresa?.cidade || 'São Paulo'} - {empresa?.uf || 'SP'}, {dataReuniao}.
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            {propostaCalculada.distribuicaoSocios.map((s, idx) => (
              <div key={idx} className="text-center border-t border-neutral-800 pt-2 font-sans">
                <div className="font-bold text-xs text-neutral-900">{s.socioNome}</div>
                <div className="text-[10px] text-neutral-600">Sócio(a) Cotista ({s.percentual}%) • CPF: {s.cpf}</div>
              </div>
            ))}
          </div>

          <div className="max-w-xs mx-auto text-center border-t border-neutral-800 pt-2 font-sans mt-4">
            <div className="font-bold text-xs text-neutral-900">{contador}</div>
            <div className="text-[10px] text-neutral-600">Contador Responsável Técnico • {crc}</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'ATA DE APROVAÇÃO DE CONTAS E DISTRIBUIÇÃO DE LUCROS ISENTOS (ITG 1000)',
      subtitulo: `Exercício Social ${empresa?.exercicioAtivo || 2026} • Art. 14 da LC 123/2006 e Resolução CFC ITG 1000`,
      conteudo: conteudoAta
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Top Banner de Navegação em Abas do Assistente */}
      <div className="px-5 py-3 bg-[#181818] border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Zeramento do Exercício & Distribuição de Lucros Isentos (Simples / MEI)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">ITG 1000 & LC 123 Art. 14</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Zeramento das contas de resultado (`Zeramento_Contabilidade.htm`), comparativo de isenção (Presunção 8%/32% vs Contabilidade) e Informe DIRPF A4.
            </p>
          </div>
        </div>

        {/* Seletor de Guias do Fechamento */}
        <div className="flex items-center space-x-1 bg-[#121212] p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setAbaAtiva('ZERAMENTO')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium transition ${
              abaAtiva === 'ZERAMENTO'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>1. Zeramento (`Utilitários\Zeramento`)</span>
          </button>

          <button
            onClick={() => setAbaAtiva('DESTINACAO')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium transition ${
              abaAtiva === 'DESTINACAO'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>2. Lucros Isentos (Art. 14 LC 123)</span>
          </button>

          <button
            onClick={() => setAbaAtiva('ATA')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium transition ${
              abaAtiva === 'ATA'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Informe DIRPF & Ata A4</span>
          </button>
        </div>
      </div>

      {/* Notificações de Sucesso */}
      {sucessoMsg && (
        <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{sucessoMsg}</span>
          </div>
          <button onClick={() => setSucessoMsg('')} className="text-emerald-500 hover:text-emerald-300">✕</button>
        </div>
      )}

      {mensagemDestinacao && (
        <div className="px-5 py-2.5 bg-blue-500/10 border-b border-blue-500/20 text-blue-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemDestinacao}</span>
          </div>
          <button onClick={() => setMensagemDestinacao('')} className="text-blue-500 hover:text-blue-300">✕</button>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL DAS ABAS */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* ============================================================== */}
        {/* ABA 1: ZERAMENTO DAS CONTAS DE RESULTADO (ARE) */}
        {/* ============================================================== */}
        {abaAtiva === 'ZERAMENTO' && (
          <div className="space-y-4">
            {/* KPI Cards de Resultado */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] text-neutral-400 font-medium block">Total Receitas Brutas (Créditos)</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  {contasReceitasCount} contas analíticas com saldo credor
                </span>
              </div>

              <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] text-neutral-400 font-medium block">Total Custos & Despesas (Débitos)</span>
                <span className="text-lg font-bold text-rose-400 font-mono mt-1 block">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  {contasDespesasCount} contas analíticas com saldo devedor
                </span>
              </div>

              <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] text-neutral-400 font-medium block">Resultado Contábil Líquido (ITG 1000)</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-lg font-bold font-mono ${
                    resultadoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    R$ {Math.abs(resultadoLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    resultadoLiquido >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {resultadoLiquido >= 0 ? 'LUCRO ISENTO' : 'PREJUÍZO'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  100% isento de IRPF c/ escrituração (Art. 14 § 2º LC 123)
                </span>
              </div>

              <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] text-neutral-400 font-medium block">Contas Envolvidas no Zeramento</span>
                <span className="text-lg font-bold text-blue-400 font-mono mt-1 block">
                  {novosLancamentos.length} Partidas
                </span>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Volume total: R$ {totalZerado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Parâmetros do Zeramento + Guia Zeramento (Op__es_Contabilidade.htm) */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-semibold text-xs text-neutral-200 uppercase tracking-wider flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Parâmetros de Zeramento (`Utilitários\Zeramento` & `Opções\Guia Zeramento`)</span>
                </h3>
                <span className="text-[11px] text-neutral-500">
                  Empresa: <strong className="text-neutral-300">{empresa?.razaoSocial}</strong> (Exercício {empresa?.exercicioAtivo || 2026})
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Data de Zeramento</label>
                  <input
                    type="date"
                    value={dataZeramento}
                    onChange={(e) => setDataZeramento(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 font-mono outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Periodicidade de Apuração</label>
                  <select
                    value={tipoEncerramento}
                    onChange={(e) => setTipoEncerramento(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="ANUAL">Anual (31/12 - Padrão ITG 1000 / Simples)</option>
                    <option value="TRIMESTRAL">Trimestral</option>
                    <option value="MENSAL">Mensal Gerencial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Conta Destino Analítica (`Opções\Guia Zeramento`)</label>
                  <select
                    value={contaDestinoId}
                    onChange={(e) => setContaDestinoId(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none focus:border-blue-500 text-xs truncate font-mono"
                  >
                    {contasDestinoPossiveis.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.codigoReduzido} - {c.nome} ({c.classificacao})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Histórico do Zeramento (`Enter` aceita padrão)</label>
                  <select
                    value={historicoId}
                    onChange={(e) => setHistoricoId(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-white/10 rounded p-2 text-neutral-100 outline-none focus:border-blue-500 text-xs truncate"
                  >
                    {historicos.map(h => (
                      <option key={h.id} value={h.id}>
                        [{h.codigo}] {h.descricao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guia Zeramento: Contas que deverão ser zeradas (Botões Incluir e Excluir de Op__es_Contabilidade.htm) */}
              <div className="p-3 bg-[#141414] border border-white/5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                  <span className="text-neutral-400 font-medium">Contas/Grupos que deverão ser zerados:</span>
                  {gruposParaZerar.map(pref => {
                    const codigoLimpo = pref.replace(/\.$/, '');
                    const contaGrupo = contas.find(c => c.classificacao === codigoLimpo);
                    return (
                      <span
                        key={pref}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-[11px]"
                      >
                        <span>
                          Grupo {codigoLimpo} ({contaGrupo ? contaGrupo.nome : codigoLimpo === '3' ? 'Receitas' : 'Custos e Despesas'})
                        </span>
                        {gruposParaZerar.length > 1 && (
                          <button
                            onClick={() => handleExcluirGrupoZeramento(pref)}
                            className="text-blue-400 hover:text-rose-400 ml-1 font-sans font-bold"
                            title="Excluir grupo do zeramento"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={novoGrupoPrefixo}
                    onChange={(e) => setNovoGrupoPrefixo(e.target.value)}
                    className="bg-[#1c1c1c] border border-white/10 rounded px-2 py-1 text-neutral-200 font-mono text-xs"
                  >
                    <option value="3">3 - RECEITAS OPERACIONAIS</option>
                    <option value="4">4 - CUSTOS E DESPESAS</option>
                    {contasSinteticasResultado.map(cs => (
                      <option key={cs.id} value={cs.classificacao}>
                        {cs.classificacao} - {cs.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleIncluirGrupoZeramento}
                    className="px-2.5 py-1 bg-[#242424] hover:bg-neutral-700 border border-white/10 rounded text-neutral-200 text-xs font-medium transition"
                  >
                    + Incluir Grupo
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="text-xs text-neutral-400 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Você ainda poderá emitir Balanço ou Balancete marcando <em>"Desconsiderar Zeramento"</em> conforme `Zeramento_Contabilidade.htm`.
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={novosLancamentos.length === 0}
                    onClick={handleConfirmarZeramento}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded font-medium text-xs transition flex items-center space-x-2 shadow-lg shadow-blue-900/30"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Executar Zeramento (`Origem: Zeramento`)</span>
                  </button>

                  <button
                    onClick={() => setAbaAtiva('DESTINACAO')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs transition flex items-center space-x-2 shadow-lg shadow-emerald-900/30"
                  >
                    <span>2. Calcular Lucro Isento dos Sócios</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabela de Pré-visualização dos Lançamentos de Zeramento */}
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span className="uppercase tracking-wider">GRADE DE PARTIDAS DOBRADAS GERADAS PARA A CONTA DESTINO</span>
                <span className="text-[11px] text-neutral-500 font-normal">
                  Todas as contas analíticas subordinadas aos grupos selecionados serão zeradas
                </span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">Partida</th>
                    <th className="py-2.5 px-3 w-24">Data</th>
                    <th className="py-2.5 px-3">Conta de Origem (Resultado)</th>
                    <th className="py-2.5 px-3">Conta de Destino (ARE / PL)</th>
                    <th className="py-2.5 px-3 w-24 text-center">Origem</th>
                    <th className="py-2.5 px-3 w-32 text-right">Valor Zerado (R$)</th>
                    <th className="py-2.5 px-3">Histórico / Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {novosLancamentos.map((l, idx) => {
                    const contaOrigem = contas.find(c => c.id === (l.contaDebitoId === contaDestinoId ? l.contaCreditoId : l.contaDebitoId));
                    const contaDestino = contas.find(c => c.id === contaDestinoId);

                    return (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-center font-mono text-neutral-500">#{l.numeroPartida}</td>
                        <td className="py-2 px-3 font-mono text-neutral-400">{l.dataLancamento}</td>
                        <td className="py-2 px-3 font-medium text-neutral-200">
                          {contaOrigem?.nome}
                          <span className="text-[10px] text-neutral-500 font-mono ml-2">({contaOrigem?.classificacao})</span>
                        </td>
                        <td className="py-2 px-3 text-emerald-400 font-medium">
                          {contaDestino?.nome}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                            Zeramento
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-blue-400">
                          {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-neutral-400">{l.complementoHistorico}</td>
                      </tr>
                    );
                  })}

                  {novosLancamentos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                        Todas as contas de resultado já se encontram zeradas ou sem movimentação pendente no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 2: ASSISTENTE GUIADO DE LUCROS ISENTOS (ART. 14 LC 123/2006) */}
        {/* ============================================================== */}
        {abaAtiva === 'DESTINACAO' && (
          <div className="space-y-4">
            {/* Painel Comparativo Art. 14 da LC 123/2006: Sem Contabilidade (8%/32%) vs Com Contabilidade ITG 1000 */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-100 uppercase tracking-wider">
                      Comparativo de Isenção de IRPF sobre Lucros Distribuídos — Art. 14, §§ 1º e 2º da LC 123/2006
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Demonstra ao cliente do escritório a economia tributária gerada pela escrituração contábil regular (ITG 1000) em relação ao limite de presunção.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleImprimirInformeIsentosA4}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Emitir Informe de Rendimentos Isentos (DIRPF) A4</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                {/* Coluna 1: Regra da Presunção (Sem Contabilidade) */}
                <div className="p-3.5 bg-[#141414] border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="font-semibold text-[11px] uppercase">1. Sem Escrituração Contábil (Art. 14 § 1º)</span>
                    <span className="text-[10px] font-mono bg-neutral-800 px-1.5 py-0.5 rounded">Presunção 8% / 32%</span>
                  </div>
                  <div className="text-base font-bold font-mono text-neutral-300">
                    R$ {comparativoIsencaoSimples.limiteIsentoSemEscrituracao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    8% Comércio (R$ {comparativoIsencaoSimples.presuncaoComercio8Porcento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) + 32% Serviços (R$ {comparativoIsencaoSimples.presuncaoServicos32Porcento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) - IRPJ DAS
                  </p>
                </div>

                {/* Coluna 2: Regra da Contabilidade ITG 1000 */}
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-300">
                    <span className="font-semibold text-[11px] uppercase">2. Com Escrituração ITG 1000 (Art. 14 § 2º)</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">100% Isento IRRF</span>
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    R$ {comparativoIsencaoSimples.limiteIsentoComEscrituracaoItg1000.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-emerald-300/80">
                    100% do Lucro Contábil apurado no Livro Diário pode ser distribuído sem IRRF.
                  </p>
                </div>

                {/* Coluna 3: Ganho de Isenção Gerado pelo Contador */}
                <div className="p-3.5 bg-[#141414] border border-amber-500/20 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-amber-300">
                    <span className="font-semibold text-[11px] uppercase">3. Ganho Extra de Isenção p/ Sócios</span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Valor Agregado</span>
                  </div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    + R$ {comparativoIsencaoSimples.ganhoIsencaoPelaContabilidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Parcela adicional de lucro protegida de tributação na Pessoa Física (até 27,5% de IRPF economizado).
                  </p>
                </div>
              </div>
            </div>

            {/* Controles Simplificados para Pequenos Escritórios */}
            <div className="p-4 bg-[#181818] border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-6 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={constituirReservaLegal}
                    onChange={(e) => setConstituirReservaLegal(e.target.checked)}
                    className="rounded bg-neutral-900 border-white/20 text-blue-500 focus:ring-0"
                  />
                  <span className="text-neutral-300">
                    Retenção de Reserva Legal 5% <span className="text-neutral-500">(Opcional para ME / EPP / Ltda)</span>
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pagarDiretoCaixaBanco}
                    onChange={(e) => setPagarDiretoCaixaBanco(e.target.checked)}
                    className="rounded bg-neutral-900 border-white/20 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-neutral-300">
                    Baixar pagamento direto no Caixa / Banco (`Saída`)
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-neutral-400">Percentual do Lucro a Distribuir:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={percentualDistribuicao}
                  onChange={(e) => setPercentualDistribuicao(Number(e.target.value))}
                  className="w-16 bg-[#121212] border border-white/10 rounded px-2 py-1 text-center font-mono text-emerald-400 font-bold text-xs outline-none"
                />
                <span className="text-xs font-mono text-neutral-300">%</span>
              </div>
            </div>

            {/* Cards de Resumo da Destinação */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] text-neutral-400 font-medium block">Lucro Contábil Apurado (ARE)</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">
                  R$ {propostaCalculada.lucroLiquidoApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Base contábil apurada na DRE
                </span>
              </div>

              <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] text-neutral-400 font-medium block">Reserva Legal ({propostaCalculada.percentualReservaLegal}%)</span>
                <span className="text-lg font-bold text-blue-400 font-mono mt-1 block">
                  R$ {propostaCalculada.valorReservaLegal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  {constituirReservaLegal ? 'Retida no Patrimônio Líquido' : 'Dispensada (100% livre p/ sócios)'}
                </span>
              </div>

              <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] text-neutral-400 font-medium block">Lucros Isentos a Distribuir ({percentualDistribuicao}%)</span>
                <span className="text-lg font-bold text-amber-400 font-mono mt-1 block">
                  R$ {propostaCalculada.valorTotalDistribuir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  100% Isento de IRRF (Art. 14 LC 123/06)
                </span>
              </div>

              <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] text-neutral-400 font-medium block">Saldo em Lucros Acumulados</span>
                <span className="text-lg font-bold text-purple-400 font-mono mt-1 block">
                  R$ {propostaCalculada.valorRetencaoExpansao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Mantido no Patrimônio Líquido (ITG 1000)
                </span>
              </div>
            </div>

            {/* Tabela de Sócios do QSA com Distribuição Individual */}
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-neutral-300">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="uppercase tracking-wider">QUADRO DE SÓCIOS / TITULAR (QSA) & DISTRIBUIÇÃO DE LUCROS ISENTOS</span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Total Isento: R$ {propostaCalculada.valorTotalDistribuir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-900/60 border-b border-white/10 text-neutral-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Sócio / Titular Beneficiário</th>
                    <th className="py-2.5 px-3 w-36">CPF</th>
                    <th className="py-2.5 px-3 w-28 text-center">% Participação</th>
                    <th className="py-2.5 px-3 w-40 text-right">Lucro Isento (R$)</th>
                    <th className="py-2.5 px-3 w-52">Contrapartida Contábil</th>
                    <th className="py-2.5 px-3 w-28 text-center">Tributação IRPF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {propostaCalculada.distribuicaoSocios.map((s, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-medium text-neutral-200">
                        {s.socioNome}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400">{s.cpf}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-blue-400">
                        {s.percentual.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        R$ {s.valorDividendo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400 text-[11px]">
                        {pagarDiretoCaixaBanco ? '102 - Bancos Conta Movimento' : '2.01.02 - Lucros a Pagar'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          ISENTO (0%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-neutral-900 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-neutral-400 flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-blue-400" />
                  <span>
                    Debita <strong>ARE / Lucros Acumulados</strong> e credita <strong>{pagarDiretoCaixaBanco ? 'Bancos / Caixa Geral' : 'Lucros e Dividendos a Pagar'}</strong>.
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleImprimirInformeIsentosA4}
                    className="px-3.5 py-2 bg-[#242424] hover:bg-neutral-700 border border-white/10 text-neutral-200 rounded font-medium text-xs transition flex items-center space-x-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Imprimir Informe DIRPF A4</span>
                  </button>

                  <button
                    onClick={handleIntegrarDestinacao}
                    disabled={destinacaoIntegrada}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium text-xs transition flex items-center space-x-2 shadow-lg shadow-emerald-900/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{destinacaoIntegrada ? 'Distribuição Já Integrada ao Diário' : 'Gravar Distribuição na Contabilidade'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 3: INFORME DE RENDIMENTOS ISENTOS (DIRPF) & ATA DE SÓCIOS A4 */}
        {/* ============================================================== */}
        {abaAtiva === 'ATA' && (
          <div className="space-y-4">
            {/* Barra Superior de Ações da Ata e Informe */}
            <div className="bg-[#181818] border border-white/10 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-neutral-200">
                    Informe de Rendimentos Isentos (DIRPF Sócios) & Ata Simplificada de Aprovação de Contas (ITG 1000)
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    Documentos oficiais prontos para entrega aos sócios/titular MEI na declaração de Imposto de Renda Pessoa Física e arquivo contábil.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-neutral-400">Data da Deliberação:</span>
                  <input
                    type="date"
                    value={dataReuniao}
                    onChange={(e) => setDataReuniao(e.target.value)}
                    className="bg-neutral-900 border border-white/10 rounded px-2 py-1 text-neutral-200 font-mono text-xs outline-none"
                  />
                </div>

                <button
                  onClick={handleImprimirInformeIsentosA4}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Informe de Lucros Isentos (DIRPF) A4</span>
                </button>

                <button
                  onClick={handleImprimirAtaA4}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Ata de Aprovação A4</span>
                </button>
              </div>
            </div>

            {/* Visualizador de Folha de Ata e Informe A4 Formal */}
            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-6 shadow-xl max-w-4xl mx-auto space-y-5 text-neutral-300 font-serif">
              <div className="text-center border-b border-white/10 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  {empresa?.razaoSocial || 'EMPRESA CONTÁBIL MODELO LTDA'}
                </h2>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  CNPJ: {empresa?.cnpj || '12.345.678/0001-90'} • Regime: {empresa?.regimeTributario.replace('_', ' ')} ({empresa?.porteEmpresa || 'ME'})
                </p>
                <h3 className="text-xs font-bold uppercase tracking-wide mt-2 text-emerald-400 font-sans">
                  CERTIFICADO DE DISTRIBUIÇÃO DE LUCROS ISENTOS (ART. 14 DA LC 123/2006) & DELIBERAÇÃO DE CONTAS
                </h3>
              </div>

              <div className="text-xs text-justify space-y-3 leading-relaxed">
                <p>
                  <strong>1. APURAÇÃO CONTÁBIL REGULAR (ITG 1000):</strong> A sociedade empresária <strong>{empresa?.razaoSocial}</strong>, mantendo escrituração contábil regular no Livro Diário conforme o § 2º do Art. 14 da Lei Complementar nº 123/2006 e a Resolução CFC ITG 1000, apurou no exercício social encerrado em {dataReuniao} o <strong>Lucro Contábil Líquido de R$ {propostaCalculada.lucroLiquidoApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                </p>
                <p>
                  <strong>2. EVIDENCIAÇÃO DA VANTAGEM PELA CONTABILIDADE:</strong> Enquanto o limite de isenção por presunção legal (8% Comércio / 32% Serviços — Art. 14, § 1º) seria de <strong>R$ {comparativoIsencaoSimples.limiteIsentoSemEscrituracao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, a manutenção da escrituração contábil assegura a isenção integral sobre <strong>R$ {comparativoIsencaoSimples.limiteIsentoComEscrituracaoItg1000.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                </p>
                <p>
                  <strong>3. DISTRIBUIÇÃO APROVADA AOS SÓCIOS / TITULAR:</strong>
                </p>
                <div className="pl-4 border-l-2 border-emerald-500/40 space-y-1.5 text-xs font-sans text-neutral-200">
                  {propostaCalculada.distribuicaoSocios.map((s, idx) => (
                    <p key={idx}>
                      • <strong>{s.socioNome}</strong> (CPF: <span className="font-mono">{s.cpf}</span> • Quotas: {s.percentual.toFixed(2)}%) — Lucro Isento Creditado/Pago:{' '}
                      <strong className="font-mono text-emerald-400">R$ {s.valorDividendo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> (Ficha DIRPF: Rendimentos Isentos e Não Tributáveis — Códigos 09 / 13).
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-6 text-center text-xs font-sans">
                {propostaCalculada.distribuicaoSocios.map((s, idx) => (
                  <div key={idx} className="border-t border-neutral-700 pt-2">
                    <div className="font-bold text-neutral-100">{s.socioNome}</div>
                    <div className="text-[10px] text-neutral-400">Sócio(a) Cotista ({s.percentual}%) • CPF: {s.cpf}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
