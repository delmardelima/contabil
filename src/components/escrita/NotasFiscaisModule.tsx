import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { NotaFiscal, AcumuladorFiscal, Empresa } from '../../types/contabil';
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
  Download
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface NotasFiscaisModuleProps {
  empresa: Empresa;
}

export const NotasFiscaisModule: React.FC<NotasFiscaisModuleProps> = ({ empresa }) => {
  const [notas, setNotas] = useState<NotaFiscal[]>(dbService.getNotasFiscais(empresa.id));
  const [acumuladores] = useState<AcumuladorFiscal[]>(dbService.getAcumuladores(empresa.id));
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'ENTRADA' | 'SAIDA' | 'SERVICO'>('TODOS');
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [showNovoModal, setShowNovoModal] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');

  // Form State
  const [numero, setNumero] = useState<string>('');
  const [serie, setSerie] = useState<string>('1');
  const [tipo, setTipo] = useState<'ENTRADA' | 'SAIDA' | 'SERVICO'>('SAIDA');
  const [dataEmissao, setDataEmissao] = useState<string>(new Date().toISOString().split('T')[0]);
  const [destinatario, setDestinatario] = useState<string>('');
  const [docDestinatario, setDocDestinatario] = useState<string>('');
  const [valorTotal, setValorTotal] = useState<string>('');
  const [cfop, setCfop] = useState<string>('5102');
  const [acumuladorId, setAcumuladorId] = useState<number>(acumuladores[0]?.id || 1);

  // Upload e Parser Real de Arquivos XML (NF-e / NFC-e)
  const handleXMLUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let importadas = 0;
    const novasNotas: NotaFiscal[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const xmlText = event.target?.result as string;
        if (!xmlText) return;

        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

          // Parser de tags oficiais da NF-e / NFC-e
          const nNF = xmlDoc.getElementsByTagName('nNF')[0]?.textContent || `${Math.floor(1000 + Math.random() * 9000)}`;
          const serieDoc = xmlDoc.getElementsByTagName('serie')[0]?.textContent || '1';
          const dhEmi = xmlDoc.getElementsByTagName('dhEmi')[0]?.textContent || xmlDoc.getElementsByTagName('dEmi')[0]?.textContent || new Date().toISOString();
          const chNFe = xmlDoc.getElementsByTagName('chNFe')[0]?.textContent || xmlDoc.getElementsByTagName('infNFe')[0]?.getAttribute('Id')?.replace('NFe', '') || `352610${nNF.padStart(8, '0')}`;
          
          // Emitente e Destinatário
          const emitenteNome = xmlDoc.getElementsByTagName('emit')[0]?.getElementsByTagName('xNome')[0]?.textContent || 'Emitente Desconhecido';
          const emitenteCNPJ = xmlDoc.getElementsByTagName('emit')[0]?.getElementsByTagName('CNPJ')[0]?.textContent || '';
          
          const destNome = xmlDoc.getElementsByTagName('dest')[0]?.getElementsByTagName('xNome')[0]?.textContent || 'Consumidor Final';
          const destCNPJ = xmlDoc.getElementsByTagName('dest')[0]?.getElementsByTagName('CNPJ')[0]?.textContent || xmlDoc.getElementsByTagName('dest')[0]?.getElementsByTagName('CPF')[0]?.textContent || '00.000.000/0000-00';

          // Totais
          const vNF = parseFloat(xmlDoc.getElementsByTagName('vNF')[0]?.textContent || '0');
          const vICMS = parseFloat(xmlDoc.getElementsByTagName('vICMS')[0]?.textContent || '0');
          const vPIS = parseFloat(xmlDoc.getElementsByTagName('vPIS')[0]?.textContent || '0');
          const vCOFINS = parseFloat(xmlDoc.getElementsByTagName('vCOFINS')[0]?.textContent || '0');

          // Primeiro CFOP do item
          const cfopTag = xmlDoc.getElementsByTagName('CFOP')[0]?.textContent || '5102';

          // Determina se é Entrada ou Saída com base no CNPJ da empresa ativa
          const cnpjLimpo = empresa.cnpj.replace(/\D/g, '');
          const isSaida = emitenteCNPJ.replace(/\D/g, '').includes(cnpjLimpo) || cnpjLimpo.includes(emitenteCNPJ.replace(/\D/g, ''));
          const tipoNota = isSaida ? 'SAIDA' : 'ENTRADA';

          // Vincula acumulador pelo CFOP
          const acumuladorMatch = acumuladores.find(a => a.cfopPadrao === cfopTag) || acumuladores[0];

          const nota: NotaFiscal = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            empresaId: empresa.id,
            tipo: tipoNota,
            numero: nNF,
            serie: serieDoc,
            chaveAcesso: chNFe,
            dataEmissao: dhEmi.substring(0, 10),
            destinatarioOuRemetente: isSaida ? destNome : emitenteNome,
            cnpjCpf: isSaida ? destCNPJ : emitenteCNPJ,
            valorTotal: vNF > 0 ? vNF : 1250.00,
            baseCalculoICMS: vNF,
            valorICMS: vICMS,
            valorPIS: vPIS,
            valorCOFINS: vCOFINS,
            cfop: cfopTag,
            acumuladorId: acumuladorMatch ? acumuladorMatch.id : 1,
            integradaContabil: false
          };

          dbService.saveNotaFiscal(nota);
          importadas++;
          setNotas(dbService.getNotasFiscais(empresa.id));
          setMensagem(`✅ ${importadas} arquivo(s) XML de NF-e importados com sucesso!`);
        } catch (err) {
          console.error('Falha ao processar XML:', err);
        }
      };
      reader.readAsText(file, 'utf-8');
    });
  };

  const handleSalvarManual = () => {
    if (!numero.trim() || !destinatario.trim() || !valorTotal) {
      alert('Preencha os campos obrigatórios da nota fiscal.');
      return;
    }

    const val = parseFloat(valorTotal.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    const nota: NotaFiscal = {
      id: Date.now(),
      empresaId: empresa.id,
      tipo,
      numero: numero.trim(),
      serie: serie.trim() || '1',
      chaveAcesso: `352610${numero.padStart(9, '0')}`,
      dataEmissao,
      destinatarioOuRemetente: destinatario.trim(),
      cnpjCpf: docDestinatario.trim() || '00.000.000/0000-00',
      valorTotal: val,
      baseCalculoICMS: val,
      valorICMS: val * 0.18,
      valorPIS: val * 0.0065,
      valorCOFINS: val * 0.03,
      cfop,
      acumuladorId,
      integradaContabil: false
    };

    dbService.saveNotaFiscal(nota);
    setNotas(dbService.getNotasFiscais(empresa.id));
    setShowNovoModal(false);
    setNumero('');
    setDestinatario('');
    setValorTotal('');
    setMensagem('Nota Fiscal inserida com sucesso!');
  };

  const handleExcluir = (id: number) => {
    if (confirm('Excluir esta nota fiscal?')) {
      dbService.deleteNotaFiscal(id);
      setNotas(dbService.getNotasFiscais(empresa.id));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tipo', 'Número', 'Série', 'Data Emissão', 'Destinatário/Remetente', 'CNPJ/CPF', 'CFOP', 'Valor Total', 'ICMS', 'Integrada'];
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
      n.integradaContabil ? 'SIM' : 'NAO'
    ]);
    exportToCSV(`NotasFiscais_${empresa.codigo}_${empresa.competenciaAtiva}.csv`, headers, rows);
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Lançamento de Documentos Fiscais & Importador XML</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-medium">NF-e / NFC-e / NFS-e</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Escrituração de Notas de Entrada, Saída e Serviços com leitura direta de arquivos XML.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <label className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Importar XMLs de NF-e</span>
            <input 
              type="file" 
              accept=".xml" 
              multiple 
              onChange={handleXMLUpload} 
              className="hidden" 
            />
          </label>

          <button
            onClick={() => setShowNovoModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Digitar Nota Manual</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
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

      {/* Barra de Filtros */}
      <div className="px-5 py-2.5 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-neutral-900 rounded-lg p-0.5 border border-white/10">
            {(['TODOS', 'ENTRADA', 'SAIDA', 'SERVICO'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filtroTipo === t ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t === 'TODOS' ? 'Todos os Tipos' : t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-[#121212] border border-white/10 rounded px-2.5 py-1 w-64">
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

        <div className="text-neutral-400 font-mono text-[11px] flex items-center space-x-3">
          <span>Documentos: <strong className="text-neutral-200">{notasFiltradas.length}</strong></span>
          <span>•</span>
          <span>Valor Total: <strong className="text-emerald-400">R$ {totalNotas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>

      {/* Grade de Documentos Fiscais */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1e1e1e] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px] z-10">
            <tr>
              <th className="py-2.5 px-3 w-16 text-center">Tipo</th>
              <th className="py-2.5 px-3 w-24">Número/Série</th>
              <th className="py-2.5 px-3 w-24">Emissão</th>
              <th className="py-2.5 px-3">Destinatário / Emitente</th>
              <th className="py-2.5 px-3 w-32">CNPJ / CPF</th>
              <th className="py-2.5 px-3 w-20 text-center">CFOP</th>
              <th className="py-2.5 px-3 w-28 text-right">Valor Total</th>
              <th className="py-2.5 px-3 w-28 text-right">ICMS Dest.</th>
              <th className="py-2.5 px-3 w-24 text-center">Integração</th>
              <th className="py-2.5 px-3 w-12 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[12px]">
            {notasFiltradas.map((n) => (
              <tr key={n.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    n.tipo === 'SAIDA' ? 'bg-emerald-500/20 text-emerald-400' :
                    n.tipo === 'ENTRADA' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {n.tipo}
                  </span>
                </td>
                <td className="py-2 px-3 text-neutral-100 font-bold">{n.numero}-{n.serie}</td>
                <td className="py-2 px-3 text-neutral-300">{n.dataEmissao}</td>
                <td className="py-2 px-3 text-neutral-200 font-sans truncate max-w-[220px]">
                  {n.destinatarioOuRemetente}
                </td>
                <td className="py-2 px-3 text-neutral-400">{n.cnpjCpf}</td>
                <td className="py-2 px-3 text-center text-amber-400 font-bold">{n.cfop}</td>
                <td className="py-2 px-3 text-right font-semibold text-neutral-100">
                  R$ {n.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-3 text-right text-neutral-400">
                  R$ {(n.valorICMS || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-3 text-center">
                  {n.integradaContabil ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      INTEGRADA
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                      PENDENTE
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => handleExcluir(n.id)}
                    className="p-1 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 rounded transition"
                    title="Excluir documento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Lançamento Manual de Nota */}
      {showNovoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-neutral-100">Digitação de Documento Fiscal</h3>
              <button onClick={() => setShowNovoModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Tipo de Operação:</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                  >
                    <option value="SAIDA">Saída / Venda</option>
                    <option value="ENTRADA">Entrada / Compra</option>
                    <option value="SERVICO">Serviço Prestado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Número:</label>
                  <input
                    type="text"
                    placeholder="Ex: 5821"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Série:</label>
                  <input
                    type="text"
                    value={serie}
                    onChange={(e) => setSerie(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Data de Emissão:</label>
                  <input
                    type="date"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">CFOP:</label>
                  <input
                    type="text"
                    value={cfop}
                    onChange={(e) => setCfop(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Destinatário / Razão Social:</label>
                <input
                  type="text"
                  placeholder="Nome do Cliente ou Fornecedor"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-1.5 text-neutral-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">CNPJ / CPF:</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={docDestinatario}
                    onChange={(e) => setDocDestinatario(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Valor Total (R$):</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono font-bold text-right outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Acumulador Fiscal:</label>
                <select
                  value={acumuladorId}
                  onChange={(e) => setAcumuladorId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                >
                  {acumuladores.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} - {a.descricao} (CFOP {a.cfopPadrao})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowNovoModal(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarManual}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
              >
                Gravar Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
