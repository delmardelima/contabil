import React, { useState, useMemo } from 'react';
import { dbService } from '../../db/sqliteService';
import { 
  RegraConciliacao, 
  ExtratoTransacao, 
  ContaContabil, 
  HistoricoPadrao 
} from '../../types/contabil';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Layers, 
  ArrowRight, 
  Plus, 
  Trash2, 
  RefreshCw,
  Search,
  Filter,
  Check,
  Sparkles,
  Building2,
  Landmark,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface ImportacaoConciliacaoModuleProps {
  empresaId: number;
  contas: ContaContabil[];
  historicos: HistoricoPadrao[];
  onLoteGerado?: () => void;
}

interface BancoDetectado {
  codigo: string;
  nome: string;
  sigla: string;
  badgeClass: string;
}

export const ImportacaoConciliacaoModule: React.FC<ImportacaoConciliacaoModuleProps> = ({
  empresaId,
  contas,
  historicos,
  onLoteGerado
}) => {
  const [extrato, setExtrato] = useState<ExtratoTransacao[]>([]);
  const [regras, setRegras] = useState<RegraConciliacao[]>(() => dbService.getRegrasConciliacao(empresaId));
  const [contaBancariaPadraoId, setContaBancariaPadraoId] = useState<number>(() => {
    const b = contas.find(c => c.nome.toLowerCase().includes('banco') && c.tipo === 'A');
    return b ? b.id : contas[0]?.id || 1;
  });
  
  const [arquivosProcessados, setArquivosProcessados] = useState<string[]>([]);
  const [bancoSelecionadoFiltro, setBancoSelecionadoFiltro] = useState<string>('TODOS');
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [showNovaRegraModal, setShowNovaRegraModal] = useState<boolean>(false);

  // Form de nova regra De-Para
  const [novaPalavraChave, setNovaPalavraChave] = useState<string>('');
  const [novaContaDebito, setNovaContaDebito] = useState<number>(0);
  const [novaContaCredito, setNovaContaCredito] = useState<number>(0);
  const [novoHistoricoId, setNovoHistoricoId] = useState<number>(0);
  const [novoComplemento, setNovoComplemento] = useState<string>('');

  const contasAnaliticas = useMemo(() => contas.filter(c => c.tipo === 'A'), [contas]);

  // Detector Inteligente de Instituição Financeira Emissora
  const detectarBanco = (nomeArquivo: string, conteudo: string): BancoDetectado => {
    const nomeLower = nomeArquivo.toLowerCase();
    const contLower = conteudo.toLowerCase();

    // 1. Extração por tags OFX oficiais (<BANKID>, <FID>, <ORG>)
    const orgMatch = /<ORG>([^<\r\n]+)/i.exec(conteudo)?.[1]?.trim() || '';
    const fidMatch = /<FID>([^<\r\n]+)/i.exec(conteudo)?.[1]?.trim() || '';
    const bankIdMatch = /<BANKID>([^<\r\n]+)/i.exec(conteudo)?.[1]?.trim() || '';

    const tagRef = `${orgMatch} ${fidMatch} ${bankIdMatch} ${nomeLower} ${contLower.substring(0, 500)}`;

    if (tagRef.includes('341') || tagRef.includes('itau') || tagRef.includes('itaú')) {
      return { codigo: '341', nome: 'Banco Itaú S.A.', sigla: 'ITAÚ', badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };
    }
    if (tagRef.includes('001') || tagRef.includes('banco do brasil') || tagRef.includes('bb ')) {
      return { codigo: '001', nome: 'Banco do Brasil S.A.', sigla: 'BB', badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' };
    }
    if (tagRef.includes('237') || tagRef.includes('bradesco')) {
      return { codigo: '237', nome: 'Banco Bradesco S.A.', sigla: 'BRADESCO', badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
    }
    if (tagRef.includes('033') || tagRef.includes('santander')) {
      return { codigo: '033', nome: 'Banco Santander Brasil', sigla: 'SANTANDER', badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40' };
    }
    if (tagRef.includes('104') || tagRef.includes('caixa') || tagRef.includes('cef')) {
      return { codigo: '104', nome: 'Caixa Econômica Federal', sigla: 'CAIXA', badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
    }
    if (tagRef.includes('077') || tagRef.includes('inter')) {
      return { codigo: '077', nome: 'Banco Inter S.A.', sigla: 'INTER', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
    if (tagRef.includes('260') || tagRef.includes('nubank') || tagRef.includes('nu ')) {
      return { codigo: '260', nome: 'Nu Pagamentos (Nubank)', sigla: 'NUBANK', badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
    }
    if (tagRef.includes('403') || tagRef.includes('cora')) {
      return { codigo: '403', nome: 'Cora SCD S.A.', sigla: 'CORA', badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' };
    }
    if (tagRef.includes('336') || tagRef.includes('c6')) {
      return { codigo: '336', nome: 'C6 Bank S.A.', sigla: 'C6 BANK', badgeClass: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40' };
    }

    return { codigo: '000', nome: 'Banco Comercial (Extrato)', sigla: 'BANCO', badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
  };

  // Encontra a Conta Contábil de Ativo ideal para o Banco
  const vincularContaContabilBanco = (banco: BancoDetectado): number => {
    const nomeNorm = banco.nome.toLowerCase();
    const siglaNorm = banco.sigla.toLowerCase();

    const matchConta = contasAnaliticas.find(c => {
      const cNome = c.nome.toLowerCase();
      return (cNome.includes(siglaNorm) || cNome.includes(nomeNorm) || cNome.includes(banco.codigo)) && c.classificacao.startsWith('1.01.01.02');
    });

    if (matchConta) return matchConta.id;
    return contaBancariaPadraoId;
  };

  // Parser OFX
  const parseOFX = (content: string, fileName: string, banco: BancoDetectado, startIndex: number): ExtratoTransacao[] => {
    const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;
    let index = startIndex;
    const transacoes: ExtratoTransacao[] = [];
    const contaBancoId = vincularContaContabilBanco(banco);

    while ((match = trnRegex.exec(content)) !== null) {
      const block = match[1];
      const trntype = /<TRNTYPE>([^<\r\n]+)/i.exec(block)?.[1]?.trim() || 'OTHER';
      const dtposted = /<DTPOSTED>([0-9]{8})/i.exec(block)?.[1]?.trim() || '';
      const trnamt = /<TRNAMT>([^<\r\n]+)/i.exec(block)?.[1]?.trim() || '0';
      const memo = /<MEMO>([^<\r\n]+)/i.exec(block)?.[1]?.trim() || 
                   /<NAME>([^<\r\n]+)/i.exec(block)?.[1]?.trim() || 'Transação Bancária';
      const fitid = /<FITID>([^<\r\n]+)/i.exec(block)?.[1]?.trim() || `TRN-${index}`;

      let dataFormatada = new Date().toISOString().split('T')[0];
      if (dtposted.length >= 8) {
        dataFormatada = `${dtposted.substring(0, 4)}-${dtposted.substring(4, 6)}-${dtposted.substring(6, 8)}`;
      }

      const valorNum = parseFloat(trnamt.replace(',', '.'));
      const isDebito = valorNum < 0 || trntype.toUpperCase() === 'DEBIT';

      transacoes.push({
        id: `ofx-${Date.now()}-${index++}`,
        data: dataFormatada,
        tipo: isDebito ? 'D' : 'C',
        valor: Math.abs(valorNum),
        documento: fitid,
        historicoOriginal: memo,
        classificado: false,
        bancoNome: banco.nome,
        bancoCodigo: banco.codigo,
        contaBancariaId: contaBancoId,
        nomeArquivoOrigem: fileName
      });
    }

    return transacoes;
  };

  // Parser CSV / TXT
  const parseCSV = (content: string, fileName: string, banco: BancoDetectado, startIndex: number): ExtratoTransacao[] => {
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    let index = startIndex;
    const transacoes: ExtratoTransacao[] = [];
    const contaBancoId = vincularContaContabilBanco(banco);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && (line.toLowerCase().includes('data') || line.toLowerCase().includes('historico') || line.toLowerCase().includes('valor'))) {
        continue;
      }

      const cols = line.split(/[;,]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 3) {
        let dataStr = cols[0];
        let histStr = cols[1];
        let valStr = cols[2];

        if (cols.length >= 4 && isNaN(parseFloat(cols[2].replace(',', '.')))) {
          histStr = cols[2];
          valStr = cols[3];
        }

        if (dataStr.includes('/')) {
          const parts = dataStr.split('/');
          if (parts.length === 3) {
            dataStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }

        const cleanVal = valStr.replace(/\./g, '').replace(',', '.');
        const valorNum = parseFloat(cleanVal);
        if (!isNaN(valorNum)) {
          transacoes.push({
            id: `csv-${Date.now()}-${index++}`,
            data: dataStr,
            tipo: valorNum < 0 ? 'D' : 'C',
            valor: Math.abs(valorNum),
            documento: `DOC-${index}`,
            historicoOriginal: histStr || 'Lançamento de Extrato',
            classificado: false,
            bancoNome: banco.nome,
            bancoCodigo: banco.codigo,
            contaBancariaId: contaBancoId,
            nomeArquivoOrigem: fileName
          });
        }
      }
    }

    return transacoes;
  };

  // Upload em Lote Multi-Arquivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setMensagemSucesso('');
    let todasTransacoes: ExtratoTransacao[] = [];
    let arquivosNomes: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      arquivosNomes.push(file.name);

      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target?.result as string || '');
        reader.readAsText(file, 'ISO-8859-1');
      });

      if (!content) continue;

      const bancoDetectado = detectarBanco(file.name, content);
      let itensArquivo: ExtratoTransacao[] = [];

      if (file.name.toLowerCase().endsWith('.ofx')) {
        itensArquivo = parseOFX(content, file.name, bancoDetectado, todasTransacoes.length + 1);
      } else {
        itensArquivo = parseCSV(content, file.name, bancoDetectado, todasTransacoes.length + 1);
      }

      todasTransacoes = [...todasTransacoes, ...itensArquivo];
    }

    // Auto-classifica usando o motor de regras
    const classificados = dbService.autoClassificarExtrato(todasTransacoes, empresaId, contaBancariaPadraoId);
    setExtrato(classificados);
    setArquivosProcessados(arquivosNomes);
    setMensagemSucesso(`✅ Importação concluída com sucesso! ${files.length} arquivo(s) processado(s), totalizando ${classificados.length} transações.`);
  };

  // Carregar Exemplo Multi-Bancos (Itaú, Banco do Brasil e Inter)
  const handleCarregarExemploMultiBancos = () => {
    const amostras: ExtratoTransacao[] = [
      // Itaú (Conta Movimento Principal)
      { id: 'itau-1', data: '2026-10-02', tipo: 'C', valor: 28500.00, documento: 'PIX-9941', historicoOriginal: 'PIX RECEBIDO CLIENTE TECH SOLUTIONS', classificado: false, bancoNome: 'Banco Itaú S.A.', bancoCodigo: '341', nomeArquivoOrigem: 'itau_outubro_2026.ofx', contaBancariaId: 3 },
      { id: 'itau-2', data: '2026-10-05', tipo: 'D', valor: 245.00, documento: 'TAR-001', historicoOriginal: 'TARIFA BANCARIA PACOTE EMPRESARIAL', classificado: false, bancoNome: 'Banco Itaú S.A.', bancoCodigo: '341', nomeArquivoOrigem: 'itau_outubro_2026.ofx', contaBancariaId: 3 },
      { id: 'itau-3', data: '2026-10-10', tipo: 'D', valor: 3400.00, documento: 'TED-881', historicoOriginal: 'PAGTO FORNECEDOR PAPELARIA CENTRAL', classificado: false, bancoNome: 'Banco Itaú S.A.', bancoCodigo: '341', nomeArquivoOrigem: 'itau_outubro_2026.ofx', contaBancariaId: 3 },
      
      // Banco do Brasil (Conta Cobrança / Folha)
      { id: 'bb-1', data: '2026-10-06', tipo: 'C', valor: 19400.00, documento: 'LIQ-041', historicoOriginal: 'LIQUIDACAO DE BOLETOS DE COBRANCA', classificado: false, bancoNome: 'Banco do Brasil S.A.', bancoCodigo: '001', nomeArquivoOrigem: 'bb_cobranca_out2026.ofx', contaBancariaId: 3 },
      { id: 'bb-2', data: '2026-10-15', tipo: 'D', valor: 14200.00, documento: 'FOL-920', historicoOriginal: 'PAGAMENTO FOLHA LIQUIDA SALARIOS', classificado: false, bancoNome: 'Banco do Brasil S.A.', bancoCodigo: '001', nomeArquivoOrigem: 'bb_cobranca_out2026.ofx', contaBancariaId: 3 },
      { id: 'bb-3', data: '2026-10-16', tipo: 'D', valor: 185.00, documento: 'DEB-02', historicoOriginal: 'TARIFA EMISSAO DE BOLETO BANCARIO', classificado: false, bancoNome: 'Banco do Brasil S.A.', bancoCodigo: '001', nomeArquivoOrigem: 'bb_cobranca_out2026.ofx', contaBancariaId: 3 },

      // Banco Inter (Conta PJ Digital / Serviços Cloud)
      { id: 'inter-1', data: '2026-10-08', tipo: 'D', valor: 850.00, documento: 'INT-331', historicoOriginal: 'AWS CLOUD SERVICES HOSPEDAGEM', classificado: false, bancoNome: 'Banco Inter S.A.', bancoCodigo: '077', nomeArquivoOrigem: 'inter_pj_out2026.csv', contaBancariaId: 3 },
      { id: 'inter-2', data: '2026-10-12', tipo: 'D', valor: 1250.00, documento: 'INT-442', historicoOriginal: 'ENEL ENERGIA ELETRICA SEDE', classificado: false, bancoNome: 'Banco Inter S.A.', bancoCodigo: '077', nomeArquivoOrigem: 'inter_pj_out2026.csv', contaBancariaId: 3 },
      { id: 'inter-3', data: '2026-10-22', tipo: 'C', valor: 12300.00, documento: 'PIX-8812', historicoOriginal: 'PIX RECEBIDO CLIENTE ALPHA COMERCIO', classificado: false, bancoNome: 'Banco Inter S.A.', bancoCodigo: '077', nomeArquivoOrigem: 'inter_pj_out2026.csv', contaBancariaId: 3 }
    ];

    const classificados = dbService.autoClassificarExtrato(amostras, empresaId, contaBancariaPadraoId);
    setExtrato(classificados);
    setArquivosProcessados(['itau_outubro_2026.ofx', 'bb_cobranca_out2026.ofx', 'inter_pj_out2026.csv']);
    setMensagemSucesso('Carregado pacote demonstrativo de 3 bancos simultâneos (Itaú, Banco do Brasil e Inter) com 9 transações.');
  };

  // Salvar Nova Regra De-Para
  const handleSalvarRegra = () => {
    if (!novaPalavraChave.trim() || !novaContaDebito || !novaContaCredito) {
      alert('Preencha a palavra-chave e selecione as contas de Débito e Crédito.');
      return;
    }

    const nova: RegraConciliacao = {
      id: Date.now(),
      empresaId,
      palavraChave: novaPalavraChave.trim(),
      contaDebitoId: novaContaDebito,
      contaCreditoId: novaContaCredito,
      historicoId: novoHistoricoId || historicos[0]?.id || 1,
      complementoPadrao: novoComplemento
    };

    dbService.saveRegraConciliacao(nova);
    const atualizadas = dbService.getRegrasConciliacao(empresaId);
    setRegras(atualizadas);

    if (extrato.length > 0) {
      setExtrato(dbService.autoClassificarExtrato(extrato, empresaId, contaBancariaPadraoId));
    }

    setShowNovaRegraModal(false);
    setNovaPalavraChave('');
    setNovoComplemento('');
  };

  // Excluir Regra
  const handleExcluirRegra = (id: number) => {
    dbService.deleteRegraConciliacao(id);
    setRegras(dbService.getRegrasConciliacao(empresaId));
  };

  // Memorizar Regra com 1 Clique (Auto-Learning)
  const handleMemorizarRegraDaLinha = (item: ExtratoTransacao) => {
    if (!item.contaDebitoId || !item.contaCreditoId) {
      alert('Selecione as contas de Débito e Crédito antes de memorizar a regra.');
      return;
    }

    const tokens = item.historicoOriginal.trim().split(/\s+/).filter(w => w.length > 2 && !w.match(/^[0-9]+$/));
    const keyword = tokens.slice(0, 2).join(' ') || item.historicoOriginal.trim();

    dbService.memorizarRegraConciliacao(
      empresaId,
      keyword,
      item.contaDebitoId,
      item.contaCreditoId,
      item.historicoId || 1,
      item.historicoOriginal
    );

    const atualizadas = dbService.getRegrasConciliacao(empresaId);
    setRegras(atualizadas);

    const reclassificados = dbService.autoClassificarExtrato(extrato, empresaId, contaBancariaPadraoId);
    setExtrato(reclassificados);

    setMensagemSucesso(`✨ Regra memorizada com sucesso para "${keyword}"! Transações semelhantes foram classificadas.`);
    setTimeout(() => setMensagemSucesso(''), 6000);
  };

  // Gerar Lote Contábil do Extrato Classificado
  const handleGerarLote = () => {
    const itensClassificados = extratoFiltrado.filter(t => t.classificado && t.contaDebitoId && t.contaCreditoId);
    if (itensClassificados.length === 0) {
      alert('Nenhuma transação classificada para geração de lote contábil no filtro atual.');
      return;
    }

    const labelLote = bancoSelecionadoFiltro === 'TODOS' 
      ? `Conciliação Multi-Bancos (${itensClassificados.length} itens)` 
      : `Conciliação ${bancoSelecionadoFiltro} (${itensClassificados.length} itens)`;

    const { lote, count, totalValor } = dbService.gerarLoteDoExtrato(
      itensClassificados,
      empresaId,
      labelLote
    );

    setMensagemSucesso(`✅ Lote Contábil #${lote.numeroLote} gerado com sucesso! ${count} partidas dobradas criadas (Total: R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`);
    
    // Remove os integrados do estado
    const idsIntegrados = new Set(itensClassificados.map(t => t.id));
    setExtrato(prev => prev.filter(t => !idsIntegrados.has(t.id)));

    if (onLoteGerado) onLoteGerado();
  };

  // Métricas e Totalizadores
  const bancosPresentes = useMemo(() => {
    const map = new Map<string, { nome: string; count: number }>();
    for (const t of extrato) {
      const bNome = t.bancoNome || 'Banco Comercial';
      const existing = map.get(bNome) || { nome: bNome, count: 0 };
      existing.count++;
      map.set(bNome, existing);
    }
    return Array.from(map.values());
  }, [extrato]);

  const extratoFiltrado = useMemo(() => {
    return extrato.filter(t => {
      if (bancoSelecionadoFiltro !== 'TODOS' && t.bancoNome !== bancoSelecionadoFiltro) {
        return false;
      }
      if (!filtroTexto) return true;
      const txt = filtroTexto.toLowerCase();
      return t.historicoOriginal.toLowerCase().includes(txt) ||
             t.documento.toLowerCase().includes(txt) ||
             t.valor.toString().includes(txt);
    });
  }, [extrato, bancoSelecionadoFiltro, filtroTexto]);

  const totalClassificado = extratoFiltrado.filter(t => t.classificado).length;
  const taxaClassificacao = extratoFiltrado.length > 0 ? Math.round((totalClassificado / extratoFiltrado.length) * 100) : 0;
  const totalCreditos = extratoFiltrado.filter(t => t.tipo === 'C').reduce((acc, t) => acc + t.valor, 0);
  const totalDebitos = extratoFiltrado.filter(t => t.tipo === 'D').reduce((acc, t) => acc + t.valor, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Top Banner de Status & Ferramentas Multi-Banco */}
      <div className="px-5 py-3 bg-[#181818] border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Central de Importação Multi-Bancos & Conciliação Inteligente</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-medium">Auto-Detection Multi-OFX</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Importe múltiplos extratos simultaneamente de bancos diferentes (Itaú, Bradesco, Santander, BB, Caixa, Inter, Nubank) com auto-reconhecimento.
            </p>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCarregarExemploMultiBancos}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Amostra Multi-Bancos (3 Extratos)</span>
          </button>

          <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Extratos em Lote (.OFX / .CSV)</span>
            <input 
              type="file" 
              multiple 
              accept=".ofx,.csv,.txt" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Banner Informativo / Mensagem de Sucesso */}
      {mensagemSucesso && (
        <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso('')} className="text-emerald-500 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* KPI Cards de Movimentação do Extrato */}
      <div className="px-5 py-2.5 bg-[#161616] border-b border-white/5 grid grid-cols-4 gap-3 flex-shrink-0 text-xs">
        <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 block">Total de Transações</span>
            <span className="text-sm font-bold text-neutral-100 font-mono">{extratoFiltrado.length} Movimentações</span>
          </div>
          <Landmark className="w-4 h-4 text-neutral-500" />
        </div>

        <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 block">Auto-Classificação De-Para</span>
            <div className="flex items-center space-x-1.5">
              <span className={`text-sm font-bold font-mono ${
                taxaClassificacao >= 70 ? 'text-emerald-400' : 'text-amber-400'
              }`}>{taxaClassificacao}%</span>
              <span className="text-[10px] text-neutral-500 font-mono">({totalClassificado}/{extratoFiltrado.length})</span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-blue-400" />
        </div>

        <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 block">Total Entradas (Créditos)</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              + R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 block">Total Saídas (Débitos)</span>
            <span className="text-sm font-bold text-rose-400 font-mono">
              - R$ {totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-rose-500" />
        </div>
      </div>

      {/* Grid Principal: Extrato Bancário à Esquerda + Painel De-Para à Direita */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel Esquerdo: Grade de Lançamentos do Extrato */}
        <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden">
          {/* Barra de Filtro por Banco e Busca */}
          <div className="px-4 py-2 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between text-xs flex-shrink-0">
            {/* Seletor de Bancos Importados (Pills) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar max-w-[65%]">
              <button
                onClick={() => setBancoSelecionadoFiltro('TODOS')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition whitespace-nowrap ${
                  bancoSelecionadoFiltro === 'TODOS'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Todos os Bancos ({extrato.length})
              </button>

              {bancosPresentes.map(b => (
                <button
                  key={b.nome}
                  onClick={() => setBancoSelecionadoFiltro(b.nome)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition whitespace-nowrap border ${
                    bancoSelecionadoFiltro === b.nome
                      ? 'bg-neutral-800 text-neutral-100 border-blue-500 font-semibold'
                      : 'bg-neutral-900/60 text-neutral-400 border-white/5 hover:text-neutral-200'
                  }`}
                >
                  <span>{b.nome}</span>
                  <span className="ml-1 text-[10px] opacity-75 font-mono font-bold">({b.count})</span>
                </button>
              ))}
            </div>

            {/* Input de Busca Rápida */}
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filtrar por histórico..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded pl-8 pr-2.5 py-1 text-xs text-neutral-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Listagem do Extrato */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {extratoFiltrado.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-neutral-800/80 flex items-center justify-center text-neutral-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-neutral-300 font-medium text-sm">Nenhum extrato importado no momento</p>
                  <p className="text-xs text-neutral-500 max-w-md mt-1">
                    Faça o upload de um ou mais arquivos .OFX/.CSV bancários ou utilize o botão "Amostra Multi-Bancos" para testar o auto-mapping contábil.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px] z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">St</th>
                    <th className="py-2.5 px-3 w-32">Instituição / Banco</th>
                    <th className="py-2.5 px-3 w-24">Data</th>
                    <th className="py-2.5 px-3 w-28">Doc/FITID</th>
                    <th className="py-2.5 px-3">Histórico Original do Extrato</th>
                    <th className="py-2.5 px-3 w-28 text-right">Valor (R$)</th>
                    <th className="py-2.5 px-3 w-40">Conta Débito</th>
                    <th className="py-2.5 px-3 w-40">Conta Crédito</th>
                    <th className="py-2.5 px-3 w-28 text-center">Auto-Aprender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                  {extratoFiltrado.map((item) => {
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-white/5 transition-colors ${
                          item.classificado ? 'bg-emerald-500/5' : 'bg-amber-500/5'
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          {item.classificado ? (
                            <span title="Classificado Automaticamente" className="text-emerald-400 font-bold">●</span>
                          ) : (
                            <span title="Pendente de Regra De-Para" className="text-amber-400 font-bold">○</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-white/5 block truncate max-w-[120px]">
                            {item.bancoNome || 'Banco Comercial'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-neutral-300">{item.data}</td>
                        <td className="py-2 px-3 text-neutral-400 truncate max-w-[100px]">{item.documento}</td>
                        <td className="py-2 px-3 text-neutral-200 font-sans">
                          <div>{item.historicoOriginal}</div>
                          {item.regraAplicada && (
                            <div className="text-[10px] text-blue-400 font-mono flex items-center space-x-1 mt-0.5">
                              <span>Match Regra: "{item.regraAplicada}"</span>
                            </div>
                          )}
                        </td>
                        <td className={`py-2 px-3 text-right font-semibold ${
                          item.tipo === 'C' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {item.tipo === 'C' ? '+' : '-'} {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <select
                            value={item.contaDebitoId || ''}
                            onChange={(e) => {
                              const newDeb = Number(e.target.value);
                              const updated = extrato.map(t => t.id === item.id ? { 
                                ...t, 
                                contaDebitoId: newDeb, 
                                classificado: Boolean(newDeb && t.contaCreditoId) 
                              } : t);
                              setExtrato(updated);
                            }}
                            className="bg-[#101010] border border-white/10 rounded px-1.5 py-0.5 text-xs text-neutral-300 w-full truncate outline-none font-mono"
                          >
                            <option value="">Selecione Débito...</option>
                            {contasAnaliticas.map(c => (
                              <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <select
                            value={item.contaCreditoId || ''}
                            onChange={(e) => {
                              const newCred = Number(e.target.value);
                              const updated = extrato.map(t => t.id === item.id ? { 
                                ...t, 
                                contaCreditoId: newCred, 
                                classificado: Boolean(t.contaDebitoId && newCred) 
                              } : t);
                              setExtrato(updated);
                            }}
                            className="bg-[#101010] border border-white/10 rounded px-1.5 py-0.5 text-xs text-neutral-300 w-full truncate outline-none font-mono"
                          >
                            <option value="">Selecione Crédito...</option>
                            {contasAnaliticas.map(c => (
                              <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-center font-sans">
                          {item.contaDebitoId && item.contaCreditoId ? (
                            <button
                              onClick={() => handleMemorizarRegraDaLinha(item)}
                              title="Memorizar regra De-Para com 1 clique para transações semelhantes"
                              className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-[11px] font-medium flex items-center space-x-1 mx-auto transition"
                            >
                              <Sparkles className="w-3 h-3 text-blue-400" />
                              <span>Memorizar</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer de Ação: Gerar Lote */}
          {extratoFiltrado.length > 0 && (
            <div className="p-3 bg-[#181818] border-t border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-neutral-400">
                Lançamentos aptos para integração: <strong className="text-emerald-400 font-mono">{totalClassificado}</strong> de {extratoFiltrado.length}
              </div>

              <button
                onClick={handleGerarLote}
                disabled={totalClassificado === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-900/30"
              >
                <Layers className="w-4 h-4" />
                <span>Gerar Lote Contábil ({totalClassificado} Partidas)</span>
              </button>
            </div>
          )}
        </div>

        {/* Painel Direito: Motor de Regras De-Para (Auto-Mapping) */}
        <div className="w-80 bg-[#181818] flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200">Regras De-Para Inteligentes</h3>
              <p className="text-[10px] text-neutral-400">Classificação automática por palavra-chave</p>
            </div>
            <button
              onClick={() => setShowNovaRegraModal(true)}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition"
              title="Adicionar Nova Regra De-Para"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar text-xs">
            {regras.map((r) => {
              const deb = contas.find(c => c.id === r.contaDebitoId)?.nome || `Cód. ${r.contaDebitoId}`;
              const cred = contas.find(c => c.id === r.contaCreditoId)?.nome || `Cód. ${r.contaCreditoId}`;

              return (
                <div key={r.id} className="p-2.5 bg-neutral-900/90 rounded border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded text-[11px]">
                      "{r.palavraChave}"
                    </span>
                    <button
                      onClick={() => handleExcluirRegra(r.id)}
                      className="text-neutral-500 hover:text-rose-400 transition"
                      title="Excluir regra"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-[11px] text-neutral-300 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Débito:</span>
                      <span className="truncate max-w-[170px] text-neutral-200">{deb}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Crédito:</span>
                      <span className="truncate max-w-[170px] text-neutral-200">{cred}</span>
                    </div>
                    {r.complementoPadrao && (
                      <div className="text-[10px] text-neutral-400 italic">
                        Compl: {r.complementoPadrao}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Criação de Regra De-Para */}
      {showNovaRegraModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Nova Regra de Auto-Mapping (De-Para)</span>
              </h3>
              <button onClick={() => setShowNovaRegraModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Palavra-Chave no Extrato (ex: TARIFA, PIX, ENEL, AWS):</label>
                <input
                  type="text"
                  placeholder="Ex: TARIFA BANCARIA"
                  value={novaPalavraChave}
                  onChange={(e) => setNovaPalavraChave(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-100 uppercase font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Conta de Débito:</label>
                <select
                  value={novaContaDebito}
                  onChange={(e) => setNovaContaDebito(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-200 outline-none focus:border-blue-500 font-mono"
                >
                  <option value={0}>Selecione Conta Débito...</option>
                  {contasAnaliticas.map(c => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Conta de Crédito:</label>
                <select
                  value={novaContaCredito}
                  onChange={(e) => setNovaContaCredito(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-200 outline-none focus:border-blue-500 font-mono"
                >
                  <option value={0}>Selecione Conta Crédito...</option>
                  {contasAnaliticas.map(c => (
                    <option key={c.id} value={c.id}>{c.codigoReduzido} - {c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Complemento Padrão (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: Ref. tarifas bancárias s/ movimentação"
                  value={novoComplemento}
                  onChange={(e) => setNovoComplemento(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowNovaRegraModal(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarRegra}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
              >
                Salvar Regra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
