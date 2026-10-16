import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Copy,
  CheckCircle,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  Printer,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { dbService } from '../../db/sqliteService';
import {
  EcfBlocoYDados,
  RegistroY540,
  RegistroY570,
  RegistroY600,
  RegistroY672,
  Empresa
} from '../../types/contabil';

interface EcfBlocoYModuleProps {
  empresaAtiva: Empresa;
  onOpenReportPreview?: (title: string, subtitle: string, content: React.ReactNode, orientation?: 'portrait' | 'landscape') => void;
}

export const EcfBlocoYModule: React.FC<EcfBlocoYModuleProps> = ({ empresaAtiva, onOpenReportPreview }) => {
  const [activeTab, setActiveTab] = useState<'y540' | 'y570' | 'y600' | 'y672' | 'gerador'>('y540');
  const [anoExercicio, setAnoExercicio] = useState<number>(2026);
  const [dadosBlocoY, setDadosBlocoY] = useState<EcfBlocoYDados | null>(null);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modais de Cadastro/Edição
  const [modalY540Aberto, setModalY540Aberto] = useState(false);
  const [editY540, setEditY540] = useState<RegistroY540 | null>(null);

  const [modalY570Aberto, setModalY570Aberto] = useState(false);
  const [editY570, setEditY570] = useState<RegistroY570 | null>(null);

  const [modalY600Aberto, setModalY600Aberto] = useState(false);
  const [editY600, setEditY600] = useState<RegistroY600 | null>(null);

  useEffect(() => {
    carregarDados();
  }, [empresaAtiva.id, anoExercicio]);

  const carregarDados = () => {
    const dados = dbService.getEcfBlocoY(empresaAtiva.id, anoExercicio);
    setDadosBlocoY(dados);
  };

  const handleSalvarBlocoY = (novosDados: EcfBlocoYDados) => {
    dbService.salvarEcfBlocoY(novosDados);
    setDadosBlocoY({ ...novosDados });
    mostrarMensagem('sucesso', 'Informações do Bloco Y salvas com sucesso!');
  };

  const handleAutoPreencher = () => {
    const atualizados = dbService.autoPreencherEcfBlocoY(empresaAtiva.id, anoExercicio);
    setDadosBlocoY({ ...atualizados });
    mostrarMensagem('sucesso', 'Bloco Y sincronizado com sucesso com as Notas Fiscais e o Quadro Societário!');
  };

  const mostrarMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagemStatus({ tipo, texto });
    setTimeout(() => setMensagemStatus(null), 4000);
  };

  // Cálculos consolidados
  const totaisY540 = useMemo(() => {
    if (!dadosBlocoY?.registrosY540) return { vendaBens: 0, prestacaoServ: 0, total: 0 };
    return dadosBlocoY.registrosY540.reduce(
      (acc, curr) => ({
        vendaBens: acc.vendaBens + curr.receitaVendaBensRevenda + curr.receitaVendaBensProprios,
        prestacaoServ: acc.prestacaoServ + curr.receitaPrestacaoServicos,
        total: acc.total + curr.totalReceitaAtividade
      }),
      { vendaBens: 0, prestacaoServ: 0, total: 0 }
    );
  }, [dadosBlocoY?.registrosY540]);

  const totaisY570 = useMemo(() => {
    if (!dadosBlocoY?.registrosY570) return { rendimentoBruto: 0, irrf: 0, csll: 0 };
    return dadosBlocoY.registrosY570.reduce(
      (acc, curr) => ({
        rendimentoBruto: acc.rendimentoBruto + curr.rendimentoBruto,
        irrf: acc.irrf + curr.irrfRetido,
        csll: acc.csll + curr.csllRetida
      }),
      { rendimentoBruto: 0, irrf: 0, csll: 0 }
    );
  }, [dadosBlocoY?.registrosY570]);

  const totaisY600 = useMemo(() => {
    if (!dadosBlocoY?.registrosY600) return { proLabore: 0, lucros: 0, jcp: 0, irrf: 0, percTotal: 0 };
    return dadosBlocoY.registrosY600.reduce(
      (acc, curr) => ({
        proLabore: acc.proLabore + curr.rendimentoBrutoProlabore,
        lucros: acc.lucros + curr.lucrosDividendosPagos,
        jcp: acc.jcp + curr.jurosSobreCapitalProprio,
        irrf: acc.irrf + curr.irrfRetidoSocio,
        percTotal: acc.percTotal + curr.percentualCapitalTotal
      }),
      { proLabore: 0, lucros: 0, jcp: 0, irrf: 0, percTotal: 0 }
    );
  }, [dadosBlocoY?.registrosY600]);

  const txtSped = useMemo(() => {
    if (!dadosBlocoY) return '';
    return dbService.gerarArquivoSpedEcfBlocoYTxt(dadosBlocoY);
  }, [dadosBlocoY]);

  const handleCopiarTxt = () => {
    navigator.clipboard.writeText(txtSped);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2500);
  };

  const handleBaixarTxt = () => {
    const blob = new Blob([txtSped], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPED_ECF_BLOCO_Y_${empresaAtiva.cnpj.replace(/\D/g, '')}_${anoExercicio}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Impressão A4 Oficial
  const handleImprimirRelatorio = () => {
    if (!dadosBlocoY || !onOpenReportPreview) return;

    const content = (
      <div className="font-sans text-xs text-neutral-800 leading-relaxed">
        <div className="border-b-2 border-neutral-700 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-bold text-neutral-900 uppercase">
                {empresaAtiva.razaoSocial}
              </h1>
              <p className="text-xs text-neutral-600">
                CNPJ: {empresaAtiva.cnpj} | NIRE: {empresaAtiva.nire || 'Não informado'} | Exercício: {anoExercicio}
              </p>
              <p className="text-xs text-neutral-600">
                Endereço: {empresaAtiva.logradouro}, {empresaAtiva.numero} - {empresaAtiva.cidade}/{empresaAtiva.uf}
              </p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 font-mono font-bold text-xs rounded">
                SPED ECF - BLOCO Y
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">
                IN RFB nº 2.004/2021
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-bold text-neutral-800 uppercase bg-neutral-100 p-1.5 border-l-4 border-amber-500 mb-2">
            1. Registro Y540 - Discriminação da Receita por Atividade (CNAE)
          </h2>
          <table className="w-full border-collapse text-left border border-neutral-300">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 text-[10px]">
                <th className="p-1 border border-neutral-300">CNAE</th>
                <th className="p-1 border border-neutral-300">Descrição da Atividade</th>
                <th className="p-1 border border-neutral-300 text-right">Revenda de Bens</th>
                <th className="p-1 border border-neutral-300 text-right">Serviços</th>
                <th className="p-1 border border-neutral-300 text-right">Total Atividade</th>
              </tr>
            </thead>
            <tbody>
              {dadosBlocoY.registrosY540.map(y => (
                <tr key={y.id} className="border-b border-neutral-200">
                  <td className="p-1 font-mono border border-neutral-300">{y.codigoCnae}</td>
                  <td className="p-1 border border-neutral-300">{y.descricaoCnae}</td>
                  <td className="p-1 border border-neutral-300 text-right font-mono">
                    {y.receitaVendaBensRevenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono">
                    {y.receitaPrestacaoServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono font-bold">
                    {y.totalReceitaAtividade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold">
                <td colSpan={2} className="p-1 border border-neutral-300 text-right">TOTAIS CONSOLIDADOS (R$):</td>
                <td className="p-1 border border-neutral-300 text-right font-mono">
                  {totaisY540.vendaBens.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1 border border-neutral-300 text-right font-mono">
                  {totaisY540.prestacaoServ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1 border border-neutral-300 text-right font-mono text-amber-700">
                  {totaisY540.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-bold text-neutral-800 uppercase bg-neutral-100 p-1.5 border-l-4 border-blue-500 mb-2">
            2. Registro Y570 - Retenções na Fonte de IRRF e CSLL
          </h2>
          <table className="w-full border-collapse text-left border border-neutral-300">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 text-[10px]">
                <th className="p-1 border border-neutral-300">CNPJ Pagador</th>
                <th className="p-1 border border-neutral-300">Razão Social Fonte Pagadora</th>
                <th className="p-1 border border-neutral-300 text-center">Órgão Pub.</th>
                <th className="p-1 border border-neutral-300 text-center">Código</th>
                <th className="p-1 border border-neutral-300 text-right">Rend. Bruto</th>
                <th className="p-1 border border-neutral-300 text-right">IRRF Retido</th>
                <th className="p-1 border border-neutral-300 text-right">CSLL Retida</th>
              </tr>
            </thead>
            <tbody>
              {dadosBlocoY.registrosY570.map(y => (
                <tr key={y.id} className="border-b border-neutral-200">
                  <td className="p-1 font-mono border border-neutral-300">{y.cnpjFontePagadora}</td>
                  <td className="p-1 border border-neutral-300">{y.nomeFontePagadora}</td>
                  <td className="p-1 border border-neutral-300 text-center">{y.orgaoPublico ? 'Sim' : 'Não'}</td>
                  <td className="p-1 border border-neutral-300 text-center font-mono">{y.codigoReceita}</td>
                  <td className="p-1 border border-neutral-300 text-right font-mono">
                    {y.rendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono font-bold text-red-600">
                    {y.irrfRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono font-bold text-blue-600">
                    {y.csllRetida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold">
                <td colSpan={4} className="p-1 border border-neutral-300 text-right">TOTAIS RETIDOS (R$):</td>
                <td className="p-1 border border-neutral-300 text-right font-mono">
                  {totaisY570.rendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1 border border-neutral-300 text-right font-mono text-red-700">
                  {totaisY570.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1 border border-neutral-300 text-right font-mono text-blue-700">
                  {totaisY570.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-bold text-neutral-800 uppercase bg-neutral-100 p-1.5 border-l-4 border-emerald-500 mb-2">
            3. Registro Y600 - Quadro Societário e Rendimentos de Dirigentes
          </h2>
          <table className="w-full border-collapse text-left border border-neutral-300">
            <thead>
              <tr className="bg-neutral-200 text-neutral-800 text-[10px]">
                <th className="p-1 border border-neutral-300">CPF/CNPJ</th>
                <th className="p-1 border border-neutral-300">Nome do Sócio/Dirigente</th>
                <th className="p-1 border border-neutral-300 text-center">Qualif.</th>
                <th className="p-1 border border-neutral-300 text-right">% Cap.</th>
                <th className="p-1 border border-neutral-300 text-right">Pró-Labore</th>
                <th className="p-1 border border-neutral-300 text-right">Lucros Isentos</th>
                <th className="p-1 border border-neutral-300 text-right">JCP</th>
                <th className="p-1 border border-neutral-300 text-right">IRRF Sócio</th>
              </tr>
            </thead>
            <tbody>
              {dadosBlocoY.registrosY600.map(y => (
                <tr key={y.id} className="border-b border-neutral-200">
                  <td className="p-1 font-mono border border-neutral-300">{y.cpfCnpj}</td>
                  <td className="p-1 border border-neutral-300">{y.nomeSocioDirigente}</td>
                  <td className="p-1 border border-neutral-300 text-center font-mono">{y.qualificacaoSocio}</td>
                  <td className="p-1 border border-neutral-300 text-right font-mono">{y.percentualCapitalTotal.toFixed(2)}%</td>
                  <td className="p-1 border border-neutral-300 text-right font-mono">
                    {y.rendimentoBrutoProlabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono font-bold text-emerald-600">
                    {y.lucrosDividendosPagos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono">
                    {y.jurosSobreCapitalProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 border border-neutral-300 text-right font-mono text-red-600">
                    {y.irrfRetidoSocio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold">
                <td colSpan={3} className="p-1 border border-neutral-300 text-right">TOTAIS PAGOS (R$):</td>
                <td className="p-1 border border-neutral-300 text-right font-mono">{totaisY600.percTotal.toFixed(2)}%</td>
                <td className="p-1 border border-neutral-300 text-right font-mono">
                  {totaisY600.proLabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1 border border-neutral-300 text-right font-mono text-emerald-700">
                  {totaisY600.lucros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1 border border-neutral-300 text-right font-mono">
                  {totaisY600.jcp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1 border border-neutral-300 text-right font-mono text-red-700">
                  {totaisY600.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold text-neutral-800 uppercase bg-neutral-100 p-1.5 border-l-4 border-purple-500 mb-2">
            4. Registro Y672 - Outras Informações (Lucro Presumido)
          </h2>
          <div className="grid grid-cols-3 gap-2 border border-neutral-300 p-2 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">Capital Social Integralizado:</span>
              <strong className="font-mono">R$ {dadosBlocoY.registroY672.capitalSocialIntegralizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Compras de Mercadorias (Revenda):</span>
              <strong className="font-mono">R$ {dadosBlocoY.registroY672.comprasMercadoriasRevenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Compras de Matérias-Primas:</span>
              <strong className="font-mono">R$ {dadosBlocoY.registroY672.comprasMateriasPrimas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Folha Salarial Bruta do Ano:</span>
              <strong className="font-mono">R$ {dadosBlocoY.registroY672.folhaSalariosBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Ativo Total no Encerramento:</span>
              <strong className="font-mono">R$ {dadosBlocoY.registroY672.ativoTotalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Saldo Disponível Caixa e Bancos:</span>
              <strong className="font-mono">R$ {dadosBlocoY.registroY672.saldoFinalCaixaBancos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-neutral-300 flex justify-between text-center text-xs">
          <div className="w-64 border-t border-neutral-700 pt-1">
            <p className="font-bold">{empresaAtiva.responsavelLegal || 'Representante Legal'}</p>
            <p className="text-[10px] text-neutral-500">CPF: {empresaAtiva.cpfResponsavel}</p>
          </div>
          <div className="w-64 border-t border-neutral-700 pt-1">
            <p className="font-bold">{empresaAtiva.contadorNome || 'Contador Responsável Técnico'}</p>
            <p className="text-[10px] text-neutral-500">CRC: {empresaAtiva.contadorCRC || 'CRC/SP Ativo'}</p>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview(
      `Demonstrativo Econômico SPED ECF Bloco Y - Exercício ${anoExercicio}`,
      `${empresaAtiva.razaoSocial} | CNPJ: ${empresaAtiva.cnpj}`,
      content,
      'landscape'
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-neutral-200">
      {/* Header com ações e seleção de exercício */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#181818]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                SPED ECF Bloco Y - Informações Gerais e Econômicas
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                IN RFB 2.004/2021
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Discriminação da Receita (Y540), Retenções na Fonte (Y570), Quadro Societário (Y600) e Indicadores (Y672)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#202020] border border-neutral-700 rounded-md">
            <span className="text-xs text-neutral-400 font-medium">Exercício:</span>
            <select
              value={anoExercicio}
              onChange={e => setAnoExercicio(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
            >
              <option value={2026} className="bg-[#1c1c1c]">2026</option>
              <option value={2025} className="bg-[#1c1c1c]">2025</option>
              <option value={2024} className="bg-[#1c1c1c]">2024</option>
            </select>
          </div>

          <button
            onClick={handleAutoPreencher}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md text-xs font-medium text-neutral-200 transition-colors"
            title="Sincronizar com Notas de Saída e QSA da Empresa"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Auto-Preencher
          </button>

          <button
            onClick={handleImprimirRelatorio}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md text-xs font-medium text-neutral-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Imprimir A4
          </button>

          <button
            onClick={handleBaixarTxt}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar .txt ECF
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
            <span>Receita Total Escriturada (Y540)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {totaisY540.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500">
            {dadosBlocoY?.registrosY540.length || 0} CNAEs cadastrados
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Retenções Sofridas (Y570)</span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {(totaisY570.irrf + totaisY570.csll).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500">
            IRRF: R$ {totaisY570.irrf.toLocaleString('pt-BR')} | CSLL: R$ {totaisY570.csll.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Lucros Distribuídos (Y600)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {totaisY600.lucros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500">
            Isentos de IR conforme Lei nº 9.249/95
          </span>
        </div>

        <div className="p-3 bg-[#1c1c1c] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Capital Social (Y672)</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            R$ {(dadosBlocoY?.registroY672.capitalSocialIntegralizado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            {totaisY600.percTotal.toFixed(1)}% Integralizado no QSA
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 border-b border-neutral-800 bg-[#161616]">
        <button
          onClick={() => setActiveTab('y540')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'y540'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Y540 - Receita por Atividade (CNAE)
          <span className="px-1.5 py-0.2 bg-neutral-800 text-[10px] rounded-full text-neutral-300">
            {dadosBlocoY?.registrosY540.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('y570')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'y570'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Y570 - Retenções na Fonte (IRRF/CSLL)
          <span className="px-1.5 py-0.2 bg-neutral-800 text-[10px] rounded-full text-neutral-300">
            {dadosBlocoY?.registrosY570.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('y600')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'y600'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Y600 - Quadro Societário (QSA)
          <span className="px-1.5 py-0.2 bg-neutral-800 text-[10px] rounded-full text-neutral-300">
            {dadosBlocoY?.registrosY600.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('y672')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'y672'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Y672 - Outras Informações (Presumido)
        </button>

        <button
          onClick={() => setActiveTab('gerador')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'gerador'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Visualizador SPED ECF (.txt)
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 overflow-auto p-6">
        {/* TAB 1: Y540 */}
        {activeTab === 'y540' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Discriminação da Receita de Vendas e Serviços por Estabelecimento (Registro Y540)
                </h3>
                <p className="text-xs text-neutral-400">
                  Totalização das receitas do exercício segregadas por código de atividade econômica CNAE.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditY540({
                    id: `y540-${Date.now()}`,
                    cnpjEstabelecimento: empresaAtiva.cnpj,
                    codigoCnae: '',
                    descricaoCnae: '',
                    receitaVendaBensProprios: 0,
                    receitaVendaBensRevenda: 0,
                    receitaPrestacaoServicos: 0,
                    receitaExportacao: 0,
                    outrasReceitasOperacionais: 0,
                    totalReceitaAtividade: 0
                  });
                  setModalY540Aberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar CNAE
              </button>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                    <th className="p-3 font-semibold">CNAE</th>
                    <th className="p-3 font-semibold">Descrição da Atividade</th>
                    <th className="p-3 font-semibold text-right">Revenda de Bens</th>
                    <th className="p-3 font-semibold text-right">Serviços</th>
                    <th className="p-3 font-semibold text-right">Outras Receitas</th>
                    <th className="p-3 font-semibold text-right">Receita Total</th>
                    <th className="p-3 font-semibold text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {dadosBlocoY?.registrosY540.map(y => (
                    <tr key={y.id} className="hover:bg-neutral-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400">{y.codigoCnae}</td>
                      <td className="p-3 text-neutral-200">{y.descricaoCnae}</td>
                      <td className="p-3 text-right font-mono text-neutral-300">
                        R$ {y.receitaVendaBensRevenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-300">
                        R$ {y.receitaPrestacaoServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-400">
                        R$ {y.outrasReceitasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        R$ {y.totalReceitaAtividade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditY540({ ...y });
                              setModalY540Aberto(true);
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (dadosBlocoY) {
                                const filtrados = dadosBlocoY.registrosY540.filter(item => item.id !== y.id);
                                handleSalvarBlocoY({ ...dadosBlocoY, registrosY540: filtrados });
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!dadosBlocoY?.registrosY540 || dadosBlocoY.registrosY540.length === 0) && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500">
                        Nenhum registro Y540 cadastrado. Clique em "Auto-Preencher" para sincronizar com as notas fiscais.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-[#202020] border-t border-neutral-700 font-bold">
                  <tr>
                    <td colSpan={2} className="p-3 text-right text-neutral-300">Totais Consolidados:</td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      R$ {totaisY540.vendaBens.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      R$ {totaisY540.prestacaoServ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-400">-</td>
                    <td className="p-3 text-right font-mono text-amber-400">
                      R$ {totaisY540.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Y570 */}
        {activeTab === 'y570' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Demonstrativo do Imposto de Renda e CSLL Retidos na Fonte (Registro Y570)
                </h3>
                <p className="text-xs text-neutral-400">
                  Relação de fontes pagadoras PJ que efetuaram retenção de IRRF e CSRF/CSLL sobre serviços prestados.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditY570({
                    id: `y570-${Date.now()}`,
                    cnpjFontePagadora: '',
                    nomeFontePagadora: '',
                    orgaoPublico: false,
                    codigoReceita: '1708',
                    rendimentoBruto: 0,
                    irrfRetido: 0,
                    csllRetida: 0
                  });
                  setModalY570Aberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Retenção
              </button>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                    <th className="p-3 font-semibold">CNPJ Fonte Pagadora</th>
                    <th className="p-3 font-semibold">Razão Social Fonte Pagadora</th>
                    <th className="p-3 font-semibold text-center">Órgão Público</th>
                    <th className="p-3 font-semibold text-center">Cód. Receita</th>
                    <th className="p-3 font-semibold text-right">Rendimento Bruto</th>
                    <th className="p-3 font-semibold text-right">IRRF Retido</th>
                    <th className="p-3 font-semibold text-right">CSLL Retida</th>
                    <th className="p-3 font-semibold text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {dadosBlocoY?.registrosY570.map(y => (
                    <tr key={y.id} className="hover:bg-neutral-800/40">
                      <td className="p-3 font-mono text-neutral-300">{y.cnpjFontePagadora}</td>
                      <td className="p-3 text-neutral-200 font-medium">{y.nomeFontePagadora}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-semibold ${
                          y.orgaoPublico ? 'bg-purple-500/20 text-purple-300' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {y.orgaoPublico ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-amber-400 font-bold">{y.codigoReceita}</td>
                      <td className="p-3 text-right font-mono text-neutral-300">
                        R$ {y.rendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-red-400">
                        R$ {y.irrfRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-blue-400">
                        R$ {y.csllRetida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditY570({ ...y });
                              setModalY570Aberto(true);
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (dadosBlocoY) {
                                const filtrados = dadosBlocoY.registrosY570.filter(item => item.id !== y.id);
                                handleSalvarBlocoY({ ...dadosBlocoY, registrosY570: filtrados });
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!dadosBlocoY?.registrosY570 || dadosBlocoY.registrosY570.length === 0) && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-500">
                        Nenhum registro Y570 cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-[#202020] border-t border-neutral-700 font-bold">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-neutral-300">Totais Retidos:</td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      R$ {totaisY570.rendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-red-400">
                      R$ {totaisY570.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-blue-400">
                      R$ {totaisY570.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Y600 */}
        {activeTab === 'y600' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Identificação de Sócios e Rendimentos de Dirigentes (Registro Y600)
                </h3>
                <p className="text-xs text-neutral-400">
                  Participação societária, pró-labore apurado, lucros e dividendos isentos e JCP distribuídos no exercício.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditY600({
                    id: `y600-${Date.now()}`,
                    paisResidencia: '105',
                    indicadorPfPj: 'PF',
                    cpfCnpj: '',
                    nomeSocioDirigente: '',
                    qualificacaoSocio: '49',
                    percentualCapitalTotal: 0,
                    percentualCapitalVotante: 0,
                    rendimentoBrutoProlabore: 0,
                    lucrosDividendosPagos: 0,
                    jurosSobreCapitalProprio: 0,
                    demaisRendimentos: 0,
                    irrfRetidoSocio: 0
                  });
                  setModalY600Aberto(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Sócio
              </button>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#181818]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202020] text-neutral-400 border-b border-neutral-800">
                    <th className="p-3 font-semibold">CPF / CNPJ</th>
                    <th className="p-3 font-semibold">Nome do Sócio / Titular</th>
                    <th className="p-3 font-semibold text-center">Qualif.</th>
                    <th className="p-3 font-semibold text-right">% Capital</th>
                    <th className="p-3 font-semibold text-right">Pró-Labore Anual</th>
                    <th className="p-3 font-semibold text-right">Lucros Isentos Pagos</th>
                    <th className="p-3 font-semibold text-right">J.C.P.</th>
                    <th className="p-3 font-semibold text-right">IRRF Retido</th>
                    <th className="p-3 font-semibold text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {dadosBlocoY?.registrosY600.map(y => (
                    <tr key={y.id} className="hover:bg-neutral-800/40">
                      <td className="p-3 font-mono text-neutral-300">{y.cpfCnpj}</td>
                      <td className="p-3 text-white font-medium">{y.nomeSocioDirigente}</td>
                      <td className="p-3 text-center font-mono text-neutral-400">{y.qualificacaoSocio}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-400">
                        {y.percentualCapitalTotal.toFixed(2)}%
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-300">
                        R$ {y.rendimentoBrutoProlabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        R$ {y.lucrosDividendosPagos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-300">
                        R$ {y.jurosSobreCapitalProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-red-400">
                        R$ {y.irrfRetidoSocio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditY600({ ...y });
                              setModalY600Aberto(true);
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (dadosBlocoY) {
                                const filtrados = dadosBlocoY.registrosY600.filter(item => item.id !== y.id);
                                handleSalvarBlocoY({ ...dadosBlocoY, registrosY600: filtrados });
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!dadosBlocoY?.registrosY600 || dadosBlocoY.registrosY600.length === 0) && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-neutral-500">
                        Nenhum sócio informado no Y600.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-[#202020] border-t border-neutral-700 font-bold">
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-neutral-300">Totais Consolidados:</td>
                    <td className="p-3 text-right font-mono text-amber-400">{totaisY600.percTotal.toFixed(2)}%</td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      R$ {totaisY600.proLabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      R$ {totaisY600.lucros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-200">
                      R$ {totaisY600.jcp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-red-400">
                      R$ {totaisY600.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Y672 */}
        {activeTab === 'y672' && dadosBlocoY && (
          <div className="space-y-4 max-w-4xl">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Outras Informações das Pessoas Jurídicas Tributadas pelo Lucro Presumido (Registro Y672)
              </h3>
              <p className="text-xs text-neutral-400">
                Informações patrimoniais, fluxo de caixa e compras para cruzamento pela Receita Federal.
              </p>
            </div>

            <div className="p-6 bg-[#181818] border border-neutral-800 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">
                    Capital Social Integralizado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosBlocoY.registroY672.capitalSocialIntegralizado}
                    onChange={e => {
                      const novo = { ...dadosBlocoY.registroY672, capitalSocialIntegralizado: Number(e.target.value) };
                      setDadosBlocoY({ ...dadosBlocoY, registroY672: novo });
                    }}
                    className="w-full px-3 py-2 bg-[#202020] border border-neutral-700 rounded text-sm text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">
                    Compras de Mercadorias para Revenda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosBlocoY.registroY672.comprasMercadoriasRevenda}
                    onChange={e => {
                      const novo = { ...dadosBlocoY.registroY672, comprasMercadoriasRevenda: Number(e.target.value) };
                      setDadosBlocoY({ ...dadosBlocoY, registroY672: novo });
                    }}
                    className="w-full px-3 py-2 bg-[#202020] border border-neutral-700 rounded text-sm text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">
                    Compras de Matérias-Primas e Insumos (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosBlocoY.registroY672.comprasMateriasPrimas}
                    onChange={e => {
                      const novo = { ...dadosBlocoY.registroY672, comprasMateriasPrimas: Number(e.target.value) };
                      setDadosBlocoY({ ...dadosBlocoY, registroY672: novo });
                    }}
                    className="w-full px-3 py-2 bg-[#202020] border border-neutral-700 rounded text-sm text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">
                    Folha Salarial Bruta Anual (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosBlocoY.registroY672.folhaSalariosBruta}
                    onChange={e => {
                      const novo = { ...dadosBlocoY.registroY672, folhaSalariosBruta: Number(e.target.value) };
                      setDadosBlocoY({ ...dadosBlocoY, registroY672: novo });
                    }}
                    className="w-full px-3 py-2 bg-[#202020] border border-neutral-700 rounded text-sm text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">
                    Ativo Total no Encerramento do Exercício (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosBlocoY.registroY672.ativoTotalFinal}
                    onChange={e => {
                      const novo = { ...dadosBlocoY.registroY672, ativoTotalFinal: Number(e.target.value) };
                      setDadosBlocoY({ ...dadosBlocoY, registroY672: novo });
                    }}
                    className="w-full px-3 py-2 bg-[#202020] border border-neutral-700 rounded text-sm text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">
                    Saldo Final Disponível em Caixa e Bancos (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosBlocoY.registroY672.saldoFinalCaixaBancos}
                    onChange={e => {
                      const novo = { ...dadosBlocoY.registroY672, saldoFinalCaixaBancos: Number(e.target.value) };
                      setDadosBlocoY({ ...dadosBlocoY, registroY672: novo });
                    }}
                    className="w-full px-3 py-2 bg-[#202020] border border-neutral-700 rounded text-sm text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end">
                <button
                  onClick={() => handleSalvarBlocoY(dadosBlocoY)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold"
                >
                  Salvar Indicadores Y672
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GERADOR SPED */}
        {activeTab === 'gerador' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Estrutura Textual do Bloco Y (Layout Oficial SPED ECF)
                </h3>
                <p className="text-xs text-neutral-400">
                  Arquivo pipe-delimited pronto para importação e validação no Programa Validador e Assinador (PVA) da ECF.
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Arquivo
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#0d0d0d] border border-neutral-800 rounded-lg font-mono text-xs text-amber-300/90 whitespace-pre overflow-x-auto max-h-[500px]">
              {txtSped}
            </div>
          </div>
        )}
      </div>

      {/* Modal Y540 */}
      {modalY540Aberto && editY540 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              Cadastro de Atividade / CNAE (Registro Y540)
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Código CNAE:</label>
                <input
                  type="text"
                  placeholder="Ex: 25.11-0/00"
                  value={editY540.codigoCnae}
                  onChange={e => setEditY540({ ...editY540, codigoCnae: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Descrição da Atividade:</label>
                <input
                  type="text"
                  placeholder="Descrição da atividade econômica"
                  value={editY540.descricaoCnae}
                  onChange={e => setEditY540({ ...editY540, descricaoCnae: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Receita Revenda Bens (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY540.receitaVendaBensRevenda}
                    onChange={e => {
                      const v = Number(e.target.value);
                      const tot = v + editY540.receitaPrestacaoServicos + editY540.outrasReceitasOperacionais;
                      setEditY540({ ...editY540, receitaVendaBensRevenda: v, totalReceitaAtividade: tot });
                    }}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Receita Serviços (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY540.receitaPrestacaoServicos}
                    onChange={e => {
                      const v = Number(e.target.value);
                      const tot = editY540.receitaVendaBensRevenda + v + editY540.outrasReceitasOperacionais;
                      setEditY540({ ...editY540, receitaPrestacaoServicos: v, totalReceitaAtividade: tot });
                    }}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalY540Aberto(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (dadosBlocoY) {
                    const idx = dadosBlocoY.registrosY540.findIndex(i => i.id === editY540.id);
                    const list = [...dadosBlocoY.registrosY540];
                    if (idx >= 0) list[idx] = editY540;
                    else list.push(editY540);
                    handleSalvarBlocoY({ ...dadosBlocoY, registrosY540: list });
                  }
                  setModalY540Aberto(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold"
              >
                Salvar CNAE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Y570 */}
      {modalY570Aberto && editY570 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              Cadastro de Retenção na Fonte (Registro Y570)
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">CNPJ da Fonte Pagadora:</label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={editY570.cnpjFontePagadora}
                  onChange={e => setEditY570({ ...editY570, cnpjFontePagadora: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Razão Social da Fonte Pagadora:</label>
                <input
                  type="text"
                  placeholder="Nome do cliente PJ tomador"
                  value={editY570.nomeFontePagadora}
                  onChange={e => setEditY570({ ...editY570, nomeFontePagadora: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Código da Receita:</label>
                  <select
                    value={editY570.codigoReceita}
                    onChange={e => setEditY570({ ...editY570, codigoReceita: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none"
                  >
                    <option value="1708">1708 - IRRF PJ</option>
                    <option value="5952">5952 - CSRF 4,65%</option>
                    <option value="8045">8045 - IRRF Distribuição</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chkOrgPub"
                    checked={editY570.orgaoPublico}
                    onChange={e => setEditY570({ ...editY570, orgaoPublico: e.target.checked })}
                    className="rounded bg-[#252525] border-neutral-700"
                  />
                  <label htmlFor="chkOrgPub" className="text-neutral-300">Fonte é Órgão Público</label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Rendimento Bruto (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY570.rendimentoBruto}
                    onChange={e => setEditY570({ ...editY570, rendimentoBruto: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">IRRF Retido (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY570.irrfRetido}
                    onChange={e => setEditY570({ ...editY570, irrfRetido: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">CSLL Retida (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY570.csllRetida}
                    onChange={e => setEditY570({ ...editY570, csllRetida: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalY570Aberto(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (dadosBlocoY) {
                    const idx = dadosBlocoY.registrosY570.findIndex(i => i.id === editY570.id);
                    const list = [...dadosBlocoY.registrosY570];
                    if (idx >= 0) list[idx] = editY570;
                    else list.push(editY570);
                    handleSalvarBlocoY({ ...dadosBlocoY, registrosY570: list });
                  }
                  setModalY570Aberto(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
              >
                Salvar Retenção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Y600 */}
      {modalY600Aberto && editY600 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              Cadastro de Sócio / Dirigente (Registro Y600)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">CPF do Sócio:</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={editY600.cpfCnpj}
                    onChange={e => setEditY600({ ...editY600, cpfCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Qualificação RFB:</label>
                  <select
                    value={editY600.qualificacaoSocio}
                    onChange={e => setEditY600({ ...editY600, qualificacaoSocio: e.target.value })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none"
                  >
                    <option value="49">49 - Sócio-Administrador</option>
                    <option value="22">22 - Sócio</option>
                    <option value="05">05 - Administrador</option>
                    <option value="65">65 - Titular EIRELI / SLU</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Nome Completo:</label>
                <input
                  type="text"
                  placeholder="Nome do sócio"
                  value={editY600.nomeSocioDirigente}
                  onChange={e => setEditY600({ ...editY600, nomeSocioDirigente: e.target.value })}
                  className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">% Capital Total:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY600.percentualCapitalTotal}
                    onChange={e => setEditY600({
                      ...editY600,
                      percentualCapitalTotal: Number(e.target.value),
                      percentualCapitalVotante: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Pró-Labore Anual (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY600.rendimentoBrutoProlabore}
                    onChange={e => setEditY600({ ...editY600, rendimentoBrutoProlabore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Lucros Isentos Pagos (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY600.lucrosDividendosPagos}
                    onChange={e => setEditY600({ ...editY600, lucrosDividendosPagos: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Juros sobre Capital Próprio (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editY600.jurosSobreCapitalProprio}
                    onChange={e => setEditY600({ ...editY600, jurosSobreCapitalProprio: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#252525] border border-neutral-700 rounded text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalY600Aberto(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (dadosBlocoY) {
                    const idx = dadosBlocoY.registrosY600.findIndex(i => i.id === editY600.id);
                    const list = [...dadosBlocoY.registrosY600];
                    if (idx >= 0) list[idx] = editY600;
                    else list.push(editY600);
                    handleSalvarBlocoY({ ...dadosBlocoY, registrosY600: list });
                  }
                  setModalY600Aberto(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
              >
                Salvar Sócio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
