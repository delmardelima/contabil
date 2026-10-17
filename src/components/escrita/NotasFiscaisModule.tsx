import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { 
  NotaFiscal, 
  ItemNotaFiscal, 
  ParcelaNotaFiscal, 
  AcumuladorFiscal, 
  Empresa, 
  ParticipanteFiscal, 
  ProdutoServico 
} from '../../types/contabil';
import { 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Layers, 
  FileCode,
  DollarSign,
  Download,
  ChevronDown,
  ChevronRight,
  Package,
  Calendar,
  CreditCard,
  Building2,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { formatCurrency, formatPercent, maskCNPJ, maskCPF, maskNCM } from '../../utils/formatters';

interface NotasFiscaisModuleProps {
  empresa: Empresa;
}

export const NotasFiscaisModule: React.FC<NotasFiscaisModuleProps> = ({ empresa }) => {
  const [notas, setNotas] = useState<NotaFiscal[]>(dbService.getNotasFiscais(empresa.id));
  const [acumuladores] = useState<AcumuladorFiscal[]>(dbService.getAcumuladores(empresa.id));
  const [participantes, setParticipantes] = useState<ParticipanteFiscal[]>(dbService.getParticipantes(empresa.id));
  const [produtos, setProdutos] = useState<ProdutoServico[]>(dbService.getProdutos(empresa.id));

  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'ENTRADA' | 'SAIDA' | 'SERVICO'>('TODOS');
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [notaExpandidaId, setNotaExpandidaId] = useState<number | null>(null);
  const [abaDetalhe, setAbaDetalhe] = useState<'itens' | 'parcelas' | 'impostos' | 'contabil'>('itens');

  // Parâmetros de Integração Escrita -> Contabilidade (Configurando_a_Escrita_para_fazer_os_lan_amentos_na_Contabilidade.htm)
  const [geraLancamentosContabeis, setGeraLancamentosContabeis] = useState<boolean>(true);
  const [mostrarSempreLancamento, setMostrarSempreLancamento] = useState<boolean>(true);
  const [partidaPreviewModal, setPartidaPreviewModal] = useState<{
    notaId: number;
    notaNumero: string;
    tipoNota: string;
    modalidadePagamento: 'A_VISTA' | 'A_PRAZO';
    acumuladorDescricao: string;
    dataLancamento: string;
    contaDebitoCodigo: number;
    contaDebitoNome: string;
    contaCreditoCodigo: number;
    contaCreditoNome: string;
    valor: number;
    historico: string;
    tipoOrigemCaixa: string;
  } | null>(null);
  
  const [showNovoModal, setShowNovoModal] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');

  // Form State para Digitação Manual
  const [numero, setNumero] = useState<string>('');
  const [serie, setSerie] = useState<string>('1');
  const [tipo, setTipo] = useState<'ENTRADA' | 'SAIDA' | 'SERVICO'>('SAIDA');
  const [dataEmissao, setDataEmissao] = useState<string>(new Date().toISOString().split('T')[0]);
  const [participanteId, setParticipanteId] = useState<number>(participantes[0]?.id || 0);
  const [cfop, setCfop] = useState<string>('5102');
  const [acumuladorId, setAcumuladorId] = useState<number>(acumuladores[0]?.id || 1);
  const [valorTotal, setValorTotal] = useState<string>('1000,00');
  const [formaPagamentoManual, setFormaPagamentoManual] = useState<'A_VISTA' | 'A_PRAZO'>('A_VISTA');
  
  // Itens Manuais
  const [itensManuais, setItensManuais] = useState<ItemNotaFiscal[]>([
    {
      id: 1,
      numeroItem: 1,
      codigoProduto: 'PROD-001',
      descricao: 'Mercadoria para Revenda Padrão',
      ncm: '84715010',
      cfop: '5102',
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: 1000,
      valorTotal: 1000,
      baseCalculoICMS: 1000,
      aliquotaICMS: 18,
      valorICMS: 180,
      cstICMS: '00',
      baseCalculoPIS: 1000,
      aliquotaPIS: 0.65,
      valorPIS: 6.5,
      baseCalculoCOFINS: 1000,
      aliquotaCOFINS: 3.0,
      valorCOFINS: 30
    }
  ]);

  // Parcelas Manuais
  const [parcelasManuais, setParcelasManuais] = useState<ParcelaNotaFiscal[]>([
    {
      id: 1,
      numeroParcela: 1,
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valor: 1000
    }
  ]);

  React.useEffect(() => {
    setNotas(dbService.getNotasFiscais(empresa.id));
    setParticipantes(dbService.getParticipantes(empresa.id));
    setProdutos(dbService.getProdutos(empresa.id));
  }, [empresa.id]);

  const handleContabilizarNotaIndividual = (notaId: number, exibirModalConferencia: boolean) => {
    if (exibirModalConferencia) {
      const sim = dbService.simularOuGravarContabilizacaoNotaFiscal(notaId, false);
      if (sim.sucesso && sim.partida) {
        setPartidaPreviewModal({
          notaId,
          ...sim.partida
        });
      }
    } else {
      const res = dbService.simularOuGravarContabilizacaoNotaFiscal(notaId, true);
      setNotas([...dbService.getNotasFiscais(empresa.id)]);
      setMensagem(res.mensagem);
      setTimeout(() => setMensagem(''), 4000);
    }
  };

  const handleContabilizarPendentesEmLote = () => {
    const pendentes = notasFiltradas.filter(n => !n.integradaContabil);
    if (pendentes.length === 0) {
      setMensagem('Todas as notas fiscais listadas já estão integradas na Contabilidade.');
      setTimeout(() => setMensagem(''), 3500);
      return;
    }
    let count = 0;
    for (const nf of pendentes) {
      const r = dbService.simularOuGravarContabilizacaoNotaFiscal(nf.id, true);
      if (r.sucesso) count++;
    }
    setNotas([...dbService.getNotasFiscais(empresa.id)]);
    setMensagem(`✅ ${count} nota(s) fiscal(is) contabilizada(s) automaticamente no Livro Diário e Livro Caixa!`);
    setTimeout(() => setMensagem(''), 4500);
  };

  // Upload e Parser Avançado Mestre-Detalhe de Múltiplos XMLs
  const handleXMLUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let importadas = 0;
    let novosParticipantesCount = 0;
    let novosProdutosCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const xmlText = event.target?.result as string;
        if (!xmlText) return;

        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

          // 1. Dados do Cabeçalho
          const nNF = xmlDoc.getElementsByTagName('nNF')[0]?.textContent || `${Math.floor(1000 + Math.random() * 9000)}`;
          const serieDoc = xmlDoc.getElementsByTagName('serie')[0]?.textContent || '1';
          const dhEmi = xmlDoc.getElementsByTagName('dhEmi')[0]?.textContent || xmlDoc.getElementsByTagName('dEmi')[0]?.textContent || new Date().toISOString();
          const chNFe = xmlDoc.getElementsByTagName('chNFe')[0]?.textContent || xmlDoc.getElementsByTagName('infNFe')[0]?.getAttribute('Id')?.replace('NFe', '') || `352610${nNF.padStart(8, '0')}`;
          
          // 2. Emitente e Destinatário
          const emitNode = xmlDoc.getElementsByTagName('emit')[0];
          const destNode = xmlDoc.getElementsByTagName('dest')[0];

          const emitenteNome = emitNode?.getElementsByTagName('xNome')[0]?.textContent || 'Emitente Desconhecido';
          const emitenteCNPJ = emitNode?.getElementsByTagName('CNPJ')[0]?.textContent || '';
          const emitenteIE = emitNode?.getElementsByTagName('IE')[0]?.textContent || '';
          const emitenteUF = emitNode?.getElementsByTagName('UF')[0]?.textContent || 'SP';
          const emitenteMun = emitNode?.getElementsByTagName('xMun')[0]?.textContent || 'São Paulo';
          const emitenteIBGE = emitNode?.getElementsByTagName('cMun')[0]?.textContent || '3550308';
          
          const destNome = destNode?.getElementsByTagName('xNome')[0]?.textContent || 'Consumidor Final';
          const destCNPJ = destNode?.getElementsByTagName('CNPJ')[0]?.textContent || destNode?.getElementsByTagName('CPF')[0]?.textContent || '';
          const destIE = destNode?.getElementsByTagName('IE')[0]?.textContent || '';
          const destUF = destNode?.getElementsByTagName('UF')[0]?.textContent || 'SP';
          const destMun = destNode?.getElementsByTagName('xMun')[0]?.textContent || 'São Paulo';
          const destIBGE = destNode?.getElementsByTagName('cMun')[0]?.textContent || '3550308';

          // Determina Entrada ou Saída com base no CNPJ da empresa ativa
          const cnpjLimpo = empresa.cnpj.replace(/\D/g, '');
          const isSaida = emitenteCNPJ.replace(/\D/g, '').includes(cnpjLimpo) || cnpjLimpo.includes(emitenteCNPJ.replace(/\D/g, ''));
          const tipoNota = isSaida ? 'SAIDA' : 'ENTRADA';

          // Auto-Cadastro Inteligente de Participante (SPED 0150)
          const docParticipante = isSaida ? destCNPJ : emitenteCNPJ;
          const nomeParticipante = isSaida ? destNome : emitenteNome;
          const ufParticipante = isSaida ? destUF : emitenteUF;
          const munParticipante = isSaida ? destMun : emitenteMun;
          const ibgeParticipante = isSaida ? destIBGE : emitenteIBGE;
          const ieParticipante = isSaida ? destIE : emitenteIE;

          let partFound = dbService.getParticipantes(empresa.id).find(p => p.cnpjCpf.replace(/\D/g, '') === docParticipante.replace(/\D/g, ''));
          if (!partFound && docParticipante) {
            partFound = {
              id: Date.now() + Math.floor(Math.random() * 500),
              empresaId: empresa.id,
              codigo: `PART-${Math.floor(100 + Math.random() * 900)}`,
              nomeRazaoSocial: nomeParticipante,
              tipoPessoa: docParticipante.length > 11 ? 'J' : 'F',
              cnpjCpf: docParticipante.length > 11 ? maskCNPJ(docParticipante) : maskCPF(docParticipante),
              inscricaoEstadual: ieParticipante || 'ISENTO',
              contribuinteICMS: ieParticipante && ieParticipante !== 'ISENTO' ? '1' : '9',
              uf: ufParticipante,
              municipio: munParticipante,
              codigoIbge: ibgeParticipante,
              tipoRelacao: isSaida ? 'CLIENTE' : 'FORNECEDOR',
              ativo: true
            };
            dbService.saveParticipante(partFound);
            novosParticipantesCount++;
          }

          // 3. Parser da Grade de Itens (SPED Registro 0200 / C170)
          const detNodes = xmlDoc.getElementsByTagName('det');
          const itensExtraidos: ItemNotaFiscal[] = [];
          let cfopPrincipal = '5102';

          for (let i = 0; i < detNodes.length; i++) {
            const det = detNodes[i];
            const cProd = det.getElementsByTagName('cProd')[0]?.textContent || `ITEM-${i + 1}`;
            const xProd = det.getElementsByTagName('xProd')[0]?.textContent || 'Produto sem descrição';
            const ncm = det.getElementsByTagName('NCM')[0]?.textContent || '00000000';
            const cfopItem = det.getElementsByTagName('CFOP')[0]?.textContent || '5102';
            if (i === 0) cfopPrincipal = cfopItem;

            const uCom = det.getElementsByTagName('uCom')[0]?.textContent || 'UN';
            const qCom = parseFloat(det.getElementsByTagName('qCom')[0]?.textContent || '1');
            const vUnCom = parseFloat(det.getElementsByTagName('vUnCom')[0]?.textContent || '0');
            const vProd = parseFloat(det.getElementsByTagName('vProd')[0]?.textContent || '0');

            // Impostos do Item
            const vBC_ICMS = parseFloat(det.getElementsByTagName('vBC')[0]?.textContent || '0');
            const pICMS = parseFloat(det.getElementsByTagName('pICMS')[0]?.textContent || '0');
            const vICMS = parseFloat(det.getElementsByTagName('vICMS')[0]?.textContent || '0');
            const cstICMS = det.getElementsByTagName('CST')[0]?.textContent || det.getElementsByTagName('CSOSN')[0]?.textContent || '00';

            const vBC_PIS = parseFloat(det.getElementsByTagName('PIS')[0]?.getElementsByTagName('vBC')[0]?.textContent || '0');
            const pPIS = parseFloat(det.getElementsByTagName('PIS')[0]?.getElementsByTagName('pPIS')[0]?.textContent || '0');
            const vPIS = parseFloat(det.getElementsByTagName('PIS')[0]?.getElementsByTagName('vPIS')[0]?.textContent || '0');

            const vBC_COFINS = parseFloat(det.getElementsByTagName('COFINS')[0]?.getElementsByTagName('vBC')[0]?.textContent || '0');
            const pCOFINS = parseFloat(det.getElementsByTagName('COFINS')[0]?.getElementsByTagName('pCOFINS')[0]?.textContent || '0');
            const vCOFINS = parseFloat(det.getElementsByTagName('COFINS')[0]?.getElementsByTagName('vCOFINS')[0]?.textContent || '0');

            itensExtraidos.push({
              id: Date.now() + i,
              numeroItem: i + 1,
              codigoProduto: cProd,
              descricao: xProd,
              ncm,
              cfop: cfopItem,
              unidade: uCom,
              quantidade: qCom,
              valorUnitario: vUnCom,
              valorTotal: vProd,
              baseCalculoICMS: vBC_ICMS,
              aliquotaICMS: pICMS,
              valorICMS: vICMS,
              cstICMS,
              baseCalculoPIS: vBC_PIS,
              aliquotaPIS: pPIS,
              valorPIS: vPIS,
              baseCalculoCOFINS: vBC_COFINS,
              aliquotaCOFINS: pCOFINS,
              valorCOFINS: vCOFINS
            });

            // Auto-cadastro de Produto (SPED 0200)
            const prodFound = dbService.getProdutos(empresa.id).find(p => p.codigo === cProd || p.descricao.toLowerCase() === xProd.toLowerCase());
            if (!prodFound) {
              const novoProd: ProdutoServico = {
                id: Date.now() + i + 100,
                empresaId: empresa.id,
                codigo: cProd,
                descricao: xProd,
                tipoItemSped: '00',
                ncm,
                unidadeMedida: uCom,
                aliquotaICMS: pICMS,
                aliquotaPIS: pPIS,
                aliquotaCOFINS: pCOFINS,
                precoUnitarioVenda: isSaida ? vUnCom : 0,
                precoUnitarioCusto: !isSaida ? vUnCom : 0,
                ativo: true
              };
              dbService.saveProduto(novoProd);
              novosProdutosCount++;
            }
          }

          // 4. Parser das Parcelas / Duplicatas Financeiras
          const dupNodes = xmlDoc.getElementsByTagName('dup');
          const parcelasExtraidas: ParcelaNotaFiscal[] = [];

          for (let p = 0; p < dupNodes.length; p++) {
            const dup = dupNodes[p];
            const nDup = dup.getElementsByTagName('nDup')[0]?.textContent || `${p + 1}`;
            const dVenc = dup.getElementsByTagName('dVenc')[0]?.textContent || dhEmi.substring(0, 10);
            const vDup = parseFloat(dup.getElementsByTagName('vDup')[0]?.textContent || '0');

            parcelasExtraidas.push({
              id: Date.now() + p + 200,
              numeroParcela: parseInt(nDup, 10) || (p + 1),
              dataVencimento: dVenc,
              valor: vDup
            });
          }

          // Totais Gerais
          const vNF = parseFloat(xmlDoc.getElementsByTagName('vNF')[0]?.textContent || '0');
          const vICMS = parseFloat(xmlDoc.getElementsByTagName('vICMS')[0]?.textContent || '0');
          const vPIS = parseFloat(xmlDoc.getElementsByTagName('vPIS')[0]?.textContent || '0');
          const vCOFINS = parseFloat(xmlDoc.getElementsByTagName('vCOFINS')[0]?.textContent || '0');

          // Vincula Acumulador
          const acumuladorMatch = acumuladores.find(a => a.cfopPadrao === cfopPrincipal) || acumuladores[0];

          const nota: NotaFiscal = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            empresaId: empresa.id,
            tipo: tipoNota,
            numero: nNF,
            serie: serieDoc,
            chaveAcesso: chNFe,
            dataEmissao: dhEmi.substring(0, 10),
            dataEntradaSaida: dhEmi.substring(0, 10),
            participanteId: partFound?.id,
            destinatarioOuRemetente: isSaida ? destNome : emitenteNome,
            cnpjCpf: isSaida ? destCNPJ : emitenteCNPJ,
            valorTotal: vNF > 0 ? vNF : (itensExtraidos.reduce((acc, it) => acc + it.valorTotal, 0) || 1000),
            baseCalculoICMS: vNF,
            valorICMS: vICMS,
            baseCalculoPIS: vNF,
            valorPIS: vPIS,
            baseCalculoCOFINS: vNF,
            valorCOFINS: vCOFINS,
            cfop: cfopPrincipal,
            acumuladorId: acumuladorMatch ? acumuladorMatch.id : 1,
            itens: itensExtraidos,
            parcelas: parcelasExtraidas.length > 0 ? parcelasExtraidas : undefined,
            integradaContabil: false
          };

          dbService.saveNotaFiscal(nota);
          if (geraLancamentosContabeis && !mostrarSempreLancamento) {
            dbService.simularOuGravarContabilizacaoNotaFiscal(nota.id, true);
          }
          importadas++;
          setNotas([...dbService.getNotasFiscais(empresa.id)]);
          setParticipantes(dbService.getParticipantes(empresa.id));
          setProdutos(dbService.getProdutos(empresa.id));
          setMensagem(`✅ ${importadas} XML(s) processados com itens detalhados! Cadastrados: ${novosParticipantesCount} participantes e ${novosProdutosCount} novos produtos.`);
        } catch (err) {
          console.error('Falha ao processar XML:', err);
        }
      };
      reader.readAsText(file, 'utf-8');
    });
  };

  const handleSalvarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim() || !valorTotal) {
      alert('Preencha os campos obrigatórios da nota fiscal.');
      return;
    }

    const val = parseFloat(valorTotal.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    const partSelecionado = participantes.find(p => p.id === participanteId);
    const parcelasNota: ParcelaNotaFiscal[] =
      formaPagamentoManual === 'A_VISTA'
        ? [{ id: 1, numeroParcela: 1, dataVencimento: dataEmissao, valor: val }]
        : parcelasManuais;

    const nota: NotaFiscal = {
      id: Date.now(),
      empresaId: empresa.id,
      tipo,
      numero: numero.trim(),
      serie: serie.trim() || '1',
      chaveAcesso: `352610${numero.padStart(9, '0')}`,
      dataEmissao,
      dataEntradaSaida: dataEmissao,
      participanteId: partSelecionado?.id,
      destinatarioOuRemetente: partSelecionado?.nomeRazaoSocial || 'Destinatário Geral',
      cnpjCpf: partSelecionado?.cnpjCpf || '00.000.000/0000-00',
      valorTotal: val,
      baseCalculoICMS: val,
      valorICMS: val * 0.18,
      baseCalculoPIS: val,
      valorPIS: val * 0.0065,
      baseCalculoCOFINS: val,
      valorCOFINS: val * 0.03,
      cfop,
      acumuladorId,
      itens: itensManuais,
      parcelas: parcelasNota,
      integradaContabil: false
    };

    dbService.saveNotaFiscal(nota);
    setShowNovoModal(false);
    setNumero('');
    setValorTotal('');

    if (geraLancamentosContabeis) {
      if (mostrarSempreLancamento) {
        const sim = dbService.simularOuGravarContabilizacaoNotaFiscal(nota.id, false);
        if (sim.sucesso && sim.partida) {
          setPartidaPreviewModal({
            notaId: nota.id,
            ...sim.partida
          });
        }
      } else {
        dbService.simularOuGravarContabilizacaoNotaFiscal(nota.id, true);
      }
    }

    setNotas([...dbService.getNotasFiscais(empresa.id)]);
    setMensagem(
      geraLancamentosContabeis && !mostrarSempreLancamento
        ? 'Nota Fiscal gravada e contabilizada automaticamente no Livro Diário / Caixa!'
        : 'Nota Fiscal salva com sucesso!'
    );
    setTimeout(() => setMensagem(''), 3500);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Excluir este documento fiscal e todos os seus itens?')) {
      dbService.deleteNotaFiscal(id);
      setNotas(dbService.getNotasFiscais(empresa.id));
      if (notaExpandidaId === id) setNotaExpandidaId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tipo', 'Número', 'Série', 'Data Emissão', 'Destinatário/Remetente', 'CNPJ/CPF', 'CFOP', 'Valor Total', 'ICMS', 'PIS', 'COFINS', 'Qtd Itens', 'Integrada'];
    const rows = notasFiltradas.map(n => [
      n.tipo,
      String(n.numero),
      n.serie || '',
      n.dataEmissao,
      n.destinatarioOuRemetente || n.clienteFornecedorNome || '',
      n.cnpjCpf || n.clienteFornecedorCnpj || '',
      n.cfop || '',
      n.valorTotal.toFixed(2),
      (n.valorICMS || 0).toFixed(2),
      (n.valorPIS || 0).toFixed(2),
      (n.valorCOFINS || 0).toFixed(2),
      (n.itens || []).length,
      n.integradaContabil ? 'SIM' : 'NAO'
    ]);
    exportToCSV(`NotasFiscais_MestreDetalhe_${empresa.codigo}_${empresa.competenciaAtiva}`, rows, headers);
  };

  const notasFiltradas = notas.filter(n => {
    if (filtroTipo !== 'TODOS' && n.tipo !== filtroTipo) return false;
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return String(n.numero).includes(txt) ||
           (n.destinatarioOuRemetente || n.clienteFornecedorNome || '').toLowerCase().includes(txt) ||
           (n.cnpjCpf || n.clienteFornecedorCnpj || '').includes(txt) ||
           (n.cfop || '').includes(txt);
  });

  const totalNotas = notasFiltradas.reduce((acc, n) => acc + n.valorTotal, 0);
  const totalICMS = notasFiltradas.reduce((acc, n) => acc + (n.valorICMS || 0), 0);
  const totalPIS = notasFiltradas.reduce((acc, n) => acc + (n.valorPIS || 0), 0);
  const totalCOFINS = notasFiltradas.reduce((acc, n) => acc + (n.valorCOFINS || 0), 0);

  const notaExpandida = notas.find(n => n.id === notaExpandidaId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Movimentação de Notas Fiscais & Integração Contábil (EFNOTA)</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-medium">NF-e 55 / NFC-e 65 / NFS-e</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Importação de XMLs, classificação por Acumuladores (À Vista / A Prazo) e geração automática no Livro Diário e Caixa
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleContabilizarPendentesEmLote}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
            title="Contabilizar todas as notas pendentes conforme Acumulador Fiscal"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Contabilizar Notas Pendentes</span>
          </button>

          <label className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-white/10 text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition shadow">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Importar XMLs em Lote</span>
            <input 
              type="file" 
              accept=".xml" 
              multiple 
              onChange={handleXMLUpload} 
              className="hidden" 
            />
          </label>

          <button
            onClick={() => {
              setValorTotal('1000,00');
              setNumero(String(notas.length + 101));
              setShowNovoModal(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/25 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Digitar Nota Manual (F2)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
            title="Exportar Planilha de Documentos"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <span>{mensagem}</span>
          <button onClick={() => setMensagem('')} className="text-emerald-500 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* Cards de Métricas Fiscais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-5 pt-3 flex-shrink-0">
        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Total Faturado</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{formatCurrency(totalNotas)}</span>
          </div>
          <DollarSign size={18} className="text-emerald-400" />
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">ICMS Destacado</span>
            <span className="text-lg font-bold font-mono text-blue-400">{formatCurrency(totalICMS)}</span>
          </div>
          <FileCode size={18} className="text-blue-400" />
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">PIS / COFINS</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{formatCurrency(totalPIS + totalCOFINS)}</span>
          </div>
          <Layers size={18} className="text-cyan-400" />
        </div>

        <div className="p-3 bg-[#181818] border border-white/5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Documentos</span>
            <span className="text-lg font-bold font-mono text-white">{notasFiltradas.length} notas</span>
          </div>
          <FileText size={18} className="text-neutral-400" />
        </div>
      </div>

      {/* Barra de Filtros & Parâmetros de Integração Contábil (Configurando_a_Escrita_para_fazer_os_lan_amentos_na_Contabilidade.htm) */}
      <div className="px-5 py-2.5 bg-[#181818] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs mt-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-neutral-900 rounded-lg p-0.5 border border-white/10">
            {(['TODOS', 'ENTRADA', 'SAIDA', 'SERVICO'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filtroTipo === t ? 'bg-blue-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t === 'TODOS' ? 'Todos os Tipos' : t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-[#141414] border border-white/10 rounded-lg px-2.5 py-1 w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por número, destinatário ou CFOP..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="bg-transparent text-neutral-200 outline-none w-full text-xs"
            />
          </div>
        </div>

        {/* Parâmetros da Escrita Fiscal -> Contabilidade */}
        <div className="flex items-center space-x-4 bg-neutral-900/90 border border-blue-500/20 px-3 py-1.5 rounded-lg text-[11px]">
          <span className="text-blue-400 font-semibold">Parâmetros Contábeis:</span>
          <label className="flex items-center space-x-1.5 cursor-pointer text-neutral-200">
            <input
              type="checkbox"
              checked={geraLancamentosContabeis}
              onChange={(e) => setGeraLancamentosContabeis(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-950 text-blue-500"
            />
            <span>Gera Lançamentos Contábeis</span>
          </label>
          {geraLancamentosContabeis && (
            <label className="flex items-center space-x-1.5 cursor-pointer text-emerald-300">
              <input
                type="checkbox"
                checked={mostrarSempreLancamento}
                onChange={(e) => setMostrarSempreLancamento(e.target.checked)}
                className="rounded border-neutral-700 bg-neutral-950 text-emerald-500"
              />
              <span>Mostrar sempre (Conferir partida antes de gravar)</span>
            </label>
          )}
        </div>
      </div>

      {/* Grade de Documentos Fiscais (Mestre-Detalhe) */}
      <div className="flex-1 overflow-auto custom-scrollbar p-5 space-y-3">
        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1c1c1c] border-b border-white/10 text-neutral-400 font-mono uppercase tracking-wider text-[11px] z-10">
              <tr>
                <th className="py-2.5 px-3 w-8 text-center"></th>
                <th className="py-2.5 px-3 w-20 text-center">Tipo</th>
                <th className="py-2.5 px-3 w-28">Número/Série</th>
                <th className="py-2.5 px-3 w-24">Emissão</th>
                <th className="py-2.5 px-4">Destinatário / Emitente</th>
                <th className="py-2.5 px-3 w-32 font-mono">CNPJ / CPF</th>
                <th className="py-2.5 px-2 text-center w-16">CFOP</th>
                <th className="py-2.5 px-2 text-center w-16">Itens</th>
                <th className="py-2.5 px-3 w-28 text-right">Valor Total</th>
                <th className="py-2.5 px-3 w-24 text-right">ICMS</th>
                <th className="py-2.5 px-3 w-28 text-center">Contabilidade</th>
                <th className="py-2.5 px-3 w-20 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {notasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-neutral-500 italic">
                    Nenhuma nota fiscal encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                notasFiltradas.map((n) => {
                  const isExpandida = notaExpandidaId === n.id;
                  const totalItens = (n.itens || []).length;
                  const totalParcelas = (n.parcelas || []).length;

                  return (
                    <React.Fragment key={n.id}>
                      <tr 
                        onClick={() => setNotaExpandidaId(isExpandida ? null : n.id)}
                        className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                          isExpandida ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2 text-center">
                          {isExpandida ? (
                            <ChevronDown size={14} className="text-blue-400" />
                          ) : (
                            <ChevronRight size={14} className="text-neutral-500" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            n.tipo === 'SAIDA' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            n.tipo === 'ENTRADA' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                            'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          }`}>
                            {n.tipo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-100 font-mono font-bold">
                          {n.numero}-{n.serie}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-300 font-mono">{n.dataEmissao}</td>
                        <td className="py-2.5 px-4 font-semibold text-white truncate max-w-[240px]">
                          {n.destinatarioOuRemetente || n.clienteFornecedorNome}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-400 font-mono text-[11px]">{n.cnpjCpf}</td>
                        <td className="py-2.5 px-2 text-center text-amber-400 font-mono font-bold">{n.cfop}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono text-[11px]">
                            {totalItens > 0 ? totalItens : 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                          {formatCurrency(n.valorTotal)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-300">
                          {formatCurrency(n.valorICMS || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                          {n.integradaContabil ? (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                              CONTABILIZADA
                            </span>
                          ) : (
                            <button
                              onClick={() => handleContabilizarNotaIndividual(n.id, mostrarSempreLancamento)}
                              className="text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold transition"
                              title="Gerar ou conferir lançamento contábil desta nota"
                            >
                              Contabilizar →
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleExcluir(n.id)}
                            className="p-1 hover:text-rose-400 text-neutral-500 transition"
                            title="Excluir documento"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>

                      {/* PAINEL EXPANSÍVEL MESTRE-DETALHE */}
                      {isExpandida && (
                        <tr>
                          <td colSpan={12} className="p-0 bg-[#141414] border-y border-blue-500/30">
                            <div className="p-4 space-y-3">
                              {/* Barra de Sub-Abas do Detalhe */}
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setAbaDetalhe('itens')}
                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition font-medium ${
                                      abaDetalhe === 'itens' ? 'bg-blue-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                                    }`}
                                  >
                                    <Package size={13} />
                                    <span>Grade de Itens / Produtos ({totalItens > 0 ? totalItens : 1})</span>
                                  </button>

                                  <button
                                    onClick={() => setAbaDetalhe('parcelas')}
                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition font-medium ${
                                      abaDetalhe === 'parcelas' ? 'bg-blue-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                                    }`}
                                  >
                                    <CreditCard size={13} />
                                    <span>Duplicatas / Parcelas Financeiras ({totalParcelas})</span>
                                  </button>

                                  <button
                                    onClick={() => setAbaDetalhe('impostos')}
                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition font-medium ${
                                      abaDetalhe === 'impostos' ? 'bg-blue-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                                    }`}
                                  >
                                    <FileCode size={13} />
                                    <span>Apuração de Tributos Detalhada</span>
                                  </button>

                                  <button
                                    onClick={() => setAbaDetalhe('contabil')}
                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition font-medium ${
                                      abaDetalhe === 'contabil' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                                    }`}
                                  >
                                    <Layers size={13} />
                                    <span>Espelho Contábil (À Vista / A Prazo)</span>
                                  </button>
                                </div>

                                <div className="text-[11px] font-mono text-neutral-400">
                                  Chave: <span className="text-neutral-200">{n.chaveAcesso || 'Sem chave'}</span>
                                </div>
                              </div>

                              {/* SUB-ABA 1: GRADE DE ITENS */}
                              {abaDetalhe === 'itens' && (
                                <div className="border border-white/10 rounded-lg overflow-hidden bg-[#181818]">
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-[#1c1c1c] text-neutral-400 font-mono text-[10px]">
                                      <tr>
                                        <th className="py-2 px-2 text-center w-10">Item</th>
                                        <th className="py-2 px-3">Código</th>
                                        <th className="py-2 px-4">Descrição do Produto / Mercadoria</th>
                                        <th className="py-2 px-3 font-mono">NCM</th>
                                        <th className="py-2 px-2 text-center">CFOP</th>
                                        <th className="py-2 px-2 text-center">Un.</th>
                                        <th className="py-2 px-3 text-right">Qtd</th>
                                        <th className="py-2 px-3 text-right">Valor Unit.</th>
                                        <th className="py-2 px-3 text-right">Total Item</th>
                                        <th className="py-2 px-3 text-right">Base ICMS</th>
                                        <th className="py-2 px-2 text-right">Alíq %</th>
                                        <th className="py-2 px-3 text-right">Valor ICMS</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-sans">
                                      {(!n.itens || n.itens.length === 0) ? (
                                        <tr>
                                          <td className="py-2 px-2 text-center font-mono">1</td>
                                          <td className="py-2 px-3 font-mono text-neutral-400">PROD-001</td>
                                          <td className="py-2 px-4 font-semibold text-white">Mercadorias da Nota Fiscal #{n.numero}</td>
                                          <td className="py-2 px-3 font-mono text-neutral-300">84715010</td>
                                          <td className="py-2 px-2 text-center font-mono text-amber-400">{n.cfop}</td>
                                          <td className="py-2 px-2 text-center font-mono">UN</td>
                                          <td className="py-2 px-3 text-right font-mono">1</td>
                                          <td className="py-2 px-3 text-right font-mono">{formatCurrency(n.valorTotal)}</td>
                                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(n.valorTotal)}</td>
                                          <td className="py-2 px-3 text-right font-mono">{formatCurrency(n.baseCalculoICMS || n.valorTotal)}</td>
                                          <td className="py-2 px-2 text-right font-mono">18,00%</td>
                                          <td className="py-2 px-3 text-right font-mono text-blue-400">{formatCurrency(n.valorICMS || 0)}</td>
                                        </tr>
                                      ) : (
                                        n.itens.map(it => (
                                          <tr key={it.id} className="hover:bg-white/[0.02]">
                                            <td className="py-2 px-2 text-center font-mono text-neutral-400">{it.numeroItem}</td>
                                            <td className="py-2 px-3 font-mono text-neutral-300">{it.codigoProduto}</td>
                                            <td className="py-2 px-4 font-semibold text-white">{it.descricao}</td>
                                            <td className="py-2 px-3 font-mono text-neutral-300">{it.ncm}</td>
                                            <td className="py-2 px-2 text-center font-mono text-amber-400">{it.cfop}</td>
                                            <td className="py-2 px-2 text-center font-mono">{it.unidade}</td>
                                            <td className="py-2 px-3 text-right font-mono">{it.quantidade}</td>
                                            <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.valorUnitario)}</td>
                                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(it.valorTotal)}</td>
                                            <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.baseCalculoICMS || it.valorTotal)}</td>
                                            <td className="py-2 px-2 text-right font-mono">{formatPercent(it.aliquotaICMS || 18)}</td>
                                            <td className="py-2 px-3 text-right font-mono text-blue-400">{formatCurrency(it.valorICMS || 0)}</td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* SUB-ABA 2: PARCELAS FINANCEIRAS / DUPLICATAS */}
                              {abaDetalhe === 'parcelas' && (
                                <div className="border border-white/10 rounded-lg overflow-hidden bg-[#181818]">
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-[#1c1c1c] text-neutral-400 font-mono text-[10px]">
                                      <tr>
                                        <th className="py-2 px-4 w-24">Nº Parcela</th>
                                        <th className="py-2 px-4 w-32">Vencimento</th>
                                        <th className="py-2 px-4 text-right">Valor da Parcela (R$)</th>
                                        <th className="py-2 px-4">Integração Financeira / Duplicata</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-mono">
                                      {(!n.parcelas || n.parcelas.length === 0) ? (
                                        <tr>
                                          <td className="py-2.5 px-4 font-bold text-white">01 / 01</td>
                                          <td className="py-2.5 px-4 text-neutral-300">{n.dataEmissao}</td>
                                          <td className="py-2.5 px-4 text-right font-bold text-emerald-400">{formatCurrency(n.valorTotal)}</td>
                                          <td className="py-2.5 px-4 text-neutral-400 font-sans">À Vista / Caixa e Bancos</td>
                                        </tr>
                                      ) : (
                                        n.parcelas.map(parc => (
                                          <tr key={parc.id} className="hover:bg-white/[0.02]">
                                            <td className="py-2.5 px-4 font-bold text-white">Parcela #{parc.numeroParcela}</td>
                                            <td className="py-2.5 px-4 text-neutral-300">{parc.dataVencimento}</td>
                                            <td className="py-2.5 px-4 text-right font-bold text-emerald-400">{formatCurrency(parc.valor)}</td>
                                            <td className="py-2.5 px-4 text-neutral-400 font-sans">
                                              {n.tipo === 'SAIDA' ? 'Duplicatas a Receber (Clientes)' : 'Títulos a Pagar (Fornecedores)'}
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* SUB-ABA 3: RESUMO DE TRIBUTOS */}
                              {abaDetalhe === 'impostos' && (
                                <div className="grid grid-cols-4 gap-3">
                                  <div className="p-3 bg-[#181818] border border-white/5 rounded-lg">
                                    <span className="text-[10px] text-neutral-400 block">Base de Cálculo ICMS</span>
                                    <span className="text-sm font-bold font-mono text-white">{formatCurrency(n.baseCalculoICMS || n.valorTotal)}</span>
                                  </div>
                                  <div className="p-3 bg-[#181818] border border-white/5 rounded-lg">
                                    <span className="text-[10px] text-neutral-400 block">Valor ICMS Destacado</span>
                                    <span className="text-sm font-bold font-mono text-blue-400">{formatCurrency(n.valorICMS || 0)}</span>
                                  </div>
                                  <div className="p-3 bg-[#181818] border border-white/5 rounded-lg">
                                    <span className="text-[10px] text-neutral-400 block">PIS (0,65%)</span>
                                    <span className="text-sm font-bold font-mono text-cyan-400">{formatCurrency(n.valorPIS || 0)}</span>
                                  </div>
                                  <div className="p-3 bg-[#181818] border border-white/5 rounded-lg">
                                    <span className="text-[10px] text-neutral-400 block">COFINS (3,00%)</span>
                                    <span className="text-sm font-bold font-mono text-indigo-400">{formatCurrency(n.valorCOFINS || 0)}</span>
                                  </div>
                                </div>
                              )}

                              {/* SUB-ABA 4: ESPELHO CONTÁBIL (À VISTA / A PRAZO - Configurando_a_Escrita_para_fazer_os_lan_amentos_na_Contabilidade.htm) */}
                              {abaDetalhe === 'contabil' && (() => {
                                const sim = dbService.simularOuGravarContabilizacaoNotaFiscal(n.id, false);
                                const p = sim.partida;
                                if (!p) return null;
                                return (
                                  <div className="p-4 bg-[#181818] border border-emerald-500/20 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold text-emerald-400">
                                          INTEGRAÇÃO AUTOMÁTICA ESCRITA FISCAL → CONTABILIDADE
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-mono">
                                          {p.modalidadePagamento === 'A_VISTA' ? 'OPERAÇÃO À VISTA (CAIXA / BANCO)' : 'OPERAÇÃO A PRAZO (CONTA CLIENTE / FORNECEDOR)'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-mono">
                                          Origem: {p.tipoOrigemCaixa}
                                        </span>
                                      </div>
                                      {!n.integradaContabil && (
                                        <button
                                          onClick={() => handleContabilizarNotaIndividual(n.id, false)}
                                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition"
                                        >
                                          Gravar Lançamento no Diário / Caixa
                                        </button>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                      <div className="p-2.5 bg-[#141414] border border-white/5 rounded-lg">
                                        <span className="text-[10px] text-neutral-500 uppercase block font-mono">Conta Débito (D)</span>
                                        <span className="font-semibold text-blue-400">
                                          {p.contaDebitoCodigo} - {p.contaDebitoNome}
                                        </span>
                                      </div>
                                      <div className="p-2.5 bg-[#141414] border border-white/5 rounded-lg">
                                        <span className="text-[10px] text-neutral-500 uppercase block font-mono">Conta Crédito (C)</span>
                                        <span className="font-semibold text-indigo-400">
                                          {p.contaCreditoCodigo} - {p.contaCreditoNome}
                                        </span>
                                      </div>
                                      <div className="p-2.5 bg-[#141414] border border-white/5 rounded-lg">
                                        <span className="text-[10px] text-neutral-500 uppercase block font-mono">Acumulador Utilizado</span>
                                        <span className="font-medium text-neutral-200">{p.acumuladorDescricao}</span>
                                      </div>
                                    </div>

                                    <div className="text-xs text-neutral-400 font-mono bg-[#141414] px-3 py-2 rounded border border-white/5 flex items-center justify-between">
                                      <span>Histórico: {p.historico}</span>
                                      <span className="font-bold text-emerald-400">Valor: {formatCurrency(p.valor)}</span>
                                    </div>
                                  </div>
                                );
                              })()}

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVA NOTA MANUAL COMPLETA COM ITENS */}
      {showNovoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/15 rounded-xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                <span>Digitação Manual de Documento Fiscal (Mestre-Detalhe)</span>
              </h3>
              <button onClick={() => setShowNovoModal(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvarManual} className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo de Operação *</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SAIDA">Saída / Venda</option>
                    <option value="ENTRADA">Entrada / Compra</option>
                    <option value="SERVICO">NFS-e Prestação de Serviços</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Número da Nota *</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={e => setNumero(e.target.value)}
                    placeholder="Ex: 1052"
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Série</label>
                  <input
                    type="text"
                    value={serie}
                    onChange={e => setSerie(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Data Emissão *</label>
                  <input
                    type="date"
                    value={dataEmissao}
                    onChange={e => setDataEmissao(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {tipo === 'SAIDA' || tipo === 'SERVICO' ? 'Cliente (Destinatário) *' : 'Fornecedor (Emitente) *'}
                  </label>
                  <select
                    value={participanteId}
                    onChange={e => setParticipanteId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {participantes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.nomeRazaoSocial} ({p.cnpjCpf})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Valor Total (R$) *</label>
                  <input
                    type="text"
                    value={valorTotal}
                    onChange={e => setValorTotal(e.target.value)}
                    placeholder="1.000,00"
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Condição de Pagamento *</label>
                  <select
                    value={formaPagamentoManual}
                    onChange={e => setFormaPagamentoManual(e.target.value as 'A_VISTA' | 'A_PRAZO')}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-emerald-300 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="A_VISTA">À Vista (Caixa / Banco)</option>
                    <option value="A_PRAZO">A Prazo (Conta Cliente / Fornecedor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">CFOP da Operação *</label>
                  <input
                    type="text"
                    value={cfop}
                    onChange={e => setCfop(e.target.value)}
                    placeholder="5102, 1102, 5933..."
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Acumulador Fiscal (EFACUMULADOR) *</label>
                  <select
                    value={acumuladorId}
                    onChange={e => setAcumuladorId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {acumuladores.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.codigo} - {a.descricao} (CFOP {a.cfopPadrao})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNovoModal(false)}
                  className="px-4 py-2 text-xs rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition active:scale-95"
                >
                  Gravar Nota Fiscal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFERÊNCIA DE LANÇAMENTO CONTÁBIL DA NOTA ("Mostrar sempre" de Configurando_a_Escrita_para_fazer_os_lan_amentos_na_Contabilidade.htm) */}
      {partidaPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-emerald-500/30 rounded-xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Conferência de Lançamento Contábil Automático ("Mostrar sempre")</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Documento Fiscal nº {partidaPreviewModal.notaNumero} • Origem: {partidaPreviewModal.tipoOrigemCaixa}
                </p>
              </div>
              <button onClick={() => setPartidaPreviewModal(null)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#141414] border border-white/10 rounded-lg flex items-center justify-between">
                <span className="text-neutral-400">Regra do Acumulador Aplicada:</span>
                <span className="font-semibold text-neutral-200">{partidaPreviewModal.acumuladorDescricao}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-blue-300 uppercase block">Conta a Debitar (D)</span>
                  <div className="font-bold text-blue-400">
                    {partidaPreviewModal.contaDebitoCodigo} - {partidaPreviewModal.contaDebitoNome}
                  </div>
                </div>
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-indigo-300 uppercase block">Conta a Creditar (C)</span>
                  <div className="font-bold text-indigo-400">
                    {partidaPreviewModal.contaCreditoCodigo} - {partidaPreviewModal.contaCreditoNome}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#141414] border border-white/10 rounded-lg space-y-1 font-mono">
                <div className="flex justify-between text-neutral-300">
                  <span>Data do Lançamento:</span>
                  <span>{partidaPreviewModal.dataLancamento.split('-').reverse().join('/')}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold text-sm">
                  <span>Valor da Partida Dobrada:</span>
                  <span>{formatCurrency(partidaPreviewModal.valor)}</span>
                </div>
                <div className="pt-1 text-[11px] text-neutral-400 font-sans">
                  Histórico: {partidaPreviewModal.historico}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPartidaPreviewModal(null)}
                className="px-4 py-2 text-xs rounded-lg text-neutral-400 hover:text-white"
              >
                Apenas Fechar (Não Gravar)
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = partidaPreviewModal.notaId;
                  setPartidaPreviewModal(null);
                  handleContabilizarNotaIndividual(id, false);
                }}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
              >
                Confirmar e Gravar na Contabilidade
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
