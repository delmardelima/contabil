import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Empresa, ContaContabil, LancamentoContabil, DocumentoStudio } from '../../types/contabil';
import { AccountingEngine } from '../../engine/accountingEngine';
import { exportToDOCX } from '../../utils/exportUtils';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  Table, 
  Save, 
  Check,
  Download
} from 'lucide-react';

interface DocumentStudioModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  documentos: DocumentoStudio[];
  onSaveDocumento: (doc: DocumentoStudio) => void;
}

const MODELOS_NORMATIVOS_PADRAO: DocumentoStudio[] = [
  {
    id: 1,
    empresaId: 1,
    titulo: 'Notas Explicativas às Demonstrações Contábeis (NBC TG 1000)',
    tipo: 'NOTAS_EXPLICATIVAS',
    ultimaModificacao: new Date().toISOString().slice(0, 10),
    conteudoHtml: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.6;">
        <h2 style="text-align: center; text-transform: uppercase; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 16px;">
          NOTAS EXPLICATIVAS ÀS DEMONSTRAÇÕES CONTÁBEIS — EXERCÍCIO {{exercicio_ano}}
        </h2>
        <p><strong>Entidade:</strong> {{empresa_razao_social}} &nbsp;|&nbsp; <strong>CNPJ:</strong> {{empresa_cnpj}}</p>
        <h4>Nota 1. Contexto Operacional</h4>
        <p>As demonstrações contábeis foram elaboradas em conformidade com as Normas Brasileiras de Contabilidade (NBC TG 1000 / ITG 1000) emitidas pelo Conselho Federal de Contabilidade (CFC).</p>
        <h4>Nota 2. Resumo das Principais Práticas Contábeis</h4>
        <p>O regime contábil adotado para o registro das mutações patrimoniais e apuração do resultado é o Regime de Competência. As disponibilidades em Caixa e Equivalentes de Caixa encerraram o período com saldo de <strong>{{saldo_caixa_total}}</strong>.</p>
        <h4>Nota 3. Síntese Patrimonial e Resultado do Exercício</h4>
        {{tabela_balanco_sintetico}}
        <p>A Receita Operacional Líquida acumulada no período perfez <strong>{{receita_liquida}}</strong>, resultando em Resultado Líquido do Exercício de <strong>{{lucro_liquido_exercicio}}</strong>.</p>
        <p style="margin-top: 32px; text-align: right;">{{data_extenso_atual}}</p>
        <p style="margin-top: 24px; text-align: center;"><strong>{{contador_nome}}</strong><br/>Contabilista Responsável — {{contador_crc}}</p>
      </div>
    `
  },
  {
    id: 2,
    empresaId: 1,
    titulo: 'Carta de Responsabilidade da Administração (CFC ITG 1000)',
    tipo: 'CARTA_RESPONSABILIDADE',
    ultimaModificacao: new Date().toISOString().slice(0, 10),
    conteudoHtml: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.6;">
        <h2 style="text-align: center; text-transform: uppercase; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 16px;">
          CARTA DE RESPONSABILIDADE DA ADMINISTRAÇÃO — EXERCÍCIO {{exercicio_ano}}
        </h2>
        <p>À Contabilidade Responsável (<strong>{{contador_nome}} — {{contador_crc}}</strong>),</p>
        <p>Declaramos, na qualidade de administradores legais da empresa <strong>{{empresa_razao_social}}</strong>, inscrita no CNPJ sob o nº <strong>{{empresa_cnpj}}</strong>, que as informações e os documentos hábeis fornecidos para a escrituração contábil do exercício de {{exercicio_ano}} são fidedignos e refletem integralmente as operações realizadas.</p>
        <p>Declaramos ainda que não temos conhecimento de quaisquer fatos ou passivos contingentes não revelados que possam afetar significativamente a posição patrimonial de Ativo Total (<strong>{{total_ativo}}</strong>) e Passivo (<strong>{{total_passivo}}</strong>).</p>
        <p style="margin-top: 40px; text-align: right;">{{data_extenso_atual}}</p>
      </div>
    `
  },
  {
    id: 3,
    empresaId: 1,
    titulo: 'Termo de Abertura e Encerramento do Livro Diário',
    tipo: 'TERMO_ABERTURA_ENCERRAMENTO',
    ultimaModificacao: new Date().toISOString().slice(0, 10),
    conteudoHtml: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.6;">
        <h2 style="text-align: center; text-transform: uppercase; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 16px;">
          TERMO DE ABERTURA E ENCERRAMENTO — LIVRO DIÁRIO GERAL ({{exercicio_ano}})
        </h2>
        <p>Contém o presente Livro Diário Geral da empresa <strong>{{empresa_razao_social}}</strong>, inscrita no CNPJ sob o nº <strong>{{empresa_cnpj}}</strong>, os lançamentos contábeis escriturados em partidas dobradas referentes ao exercício social de <strong>{{exercicio_ano}}</strong>.</p>
        <p style="margin-top: 40px; text-align: right;">{{data_extenso_atual}}</p>
        <p style="margin-top: 28px; text-align: center;"><strong>{{contador_nome}}</strong><br/>Contabilista Responsável — {{contador_crc}}</p>
      </div>
    `
  }
];

export const DocumentStudioModule: React.FC<DocumentStudioModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  documentos,
  onSaveDocumento
}) => {
  const listaDocs = documentos.length > 0 ? documentos : MODELOS_NORMATIVOS_PADRAO.map(m => ({ ...m, empresaId: empresa.id }));
  const [selectedDocId, setSelectedDocId] = useState<number>(listaDocs[0]?.id || 1);
  const activeDoc = listaDocs.find(d => d.id === selectedDocId) || listaDocs[0];

  const [conteudo, setConteudo] = useState<string>(activeDoc?.conteudoHtml || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'VISUAL' | 'RAW'>('VISUAL');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  useEffect(() => {
    if (activeDoc) {
      setConteudo(activeDoc.conteudoHtml);
    }
  }, [selectedDocId, empresa.id]);

  // Cálculos contábeis para interpolação dinâmica
  const balances = AccountingEngine.calculateBalances(contas, lancamentos, false);
  const { totalAtivo, totalPassivo, totalPL } = AccountingEngine.generateBalanceSheet(contas, lancamentos);
  const { lucroLiquido, receitaLiquida } = AccountingEngine.generateIncomeStatement(contas, lancamentos);

  // Calcula caixa total (1.01.01)
  const contaCaixaSintetica = contas.find(c => c.classificacao === '1.01.01');
  const saldoCaixaTotal = contaCaixaSintetica ? (balances.get(contaCaixaSintetica.id)?.saldoAtual || 0) : 0;

  // Gerador de tabela HTML sintética do Balanço
  const tabelaBalancoHTML = `
    <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin: 12pt 0; font-family: 'Segoe UI', Arial, sans-serif;">
      <thead>
        <tr style="background: #f0f0f0; border-bottom: 2px solid #333;">
          <th style="padding: 6pt; text-align: left;">Grupo Patrimonial</th>
          <th style="padding: 6pt; text-align: right;">Exercício ${empresa.exercicioAtivo} (R$)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5pt; font-weight: bold;">1. ATIVO TOTAL</td>
          <td style="padding: 5pt; text-align: right; font-weight: bold;">R$ ${totalAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 4pt 15pt;">1.01. Ativo Circulante (Disponibilidades e Créditos)</td>
          <td style="padding: 4pt; text-align: right;">R$ ${(balances.get(contas.find(c => c.classificacao === '1.01')?.id || 0)?.saldoAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5pt; font-weight: bold;">2. PASSIVO E PATRIMÔNIO LÍQUIDO</td>
          <td style="padding: 5pt; text-align: right; font-weight: bold;">R$ ${(totalPassivo + totalPL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 4pt 15pt;">2.01. Passivo Circulante (Obrigações e Fornecedores)</td>
          <td style="padding: 4pt; text-align: right;">R$ ${totalPassivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 4pt 15pt;">2.03. Patrimônio Líquido</td>
          <td style="padding: 4pt; text-align: right; font-weight: bold; color: #107c41;">R$ ${totalPL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
  `;

  // Interpolação das tags dinâmicas
  const interpolarTags = (texto: string) => {
    return texto
      .replace(/{{empresa_razao_social}}/g, empresa.razaoSocial || 'RAZÃO SOCIAL NÃO INFORMADA')
      .replace(/{{empresa_cnpj}}/g, empresa.cnpj || '—')
      .replace(/{{exercicio_ano}}/g, empresa.exercicioAtivo.toString())
      .replace(/{{saldo_caixa_total}}/g, `R$ ${saldoCaixaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      .replace(/{{lucro_liquido_exercicio}}/g, `R$ ${lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      .replace(/{{total_ativo}}/g, `R$ ${totalAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      .replace(/{{total_passivo}}/g, `R$ ${totalPassivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      .replace(/{{receita_liquida}}/g, `R$ ${receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      .replace(/{{contador_nome}}/g, empresa.contadorNome || empresa.contadorResponsavel || '')
      .replace(/{{contador_crc}}/g, empresa.contadorCRC || empresa.crcContador || '')
      .replace(/{{data_extenso_atual}}/g, new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }))
      .replace(/{{tabela_balanco_sintetico}}/g, tabelaBalancoHTML);
  };

  const conteudoRenderizado = interpolarTags(conteudo);

  const handleSalvar = () => {
    if (activeDoc) {
      onSaveDocumento({
        ...activeDoc,
        empresaId: empresa.id,
        ultimaModificacao: new Date().toISOString().slice(0, 10),
        conteudoHtml: conteudo
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleInsertTag = (tag: string) => {
    setConteudo(prev => prev + ` ${tag} `);
  };

  const handleExportWord = () => {
    const filename = `${activeDoc?.titulo || 'Documento_Contabil'}_${empresa.exercicioAtivo}`;
    exportToDOCX(filename, conteudoRenderizado);
  };

  const handlePrintA4 = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181818] text-neutral-200 overflow-hidden select-none">
      {/* Portal dedicado de impressão A4 isolada */}
      {isPrinting && typeof document !== 'undefined' && createPortal(
        <div className="print-modal-root">
          <div
            className="a4-page"
            dangerouslySetInnerHTML={{ __html: conteudoRenderizado }}
          />
        </div>,
        document.body
      )}

      {/* Barra de Ferramentas Superior do Document Studio (Estilo Word 365) */}
      <div className="px-4 py-2.5 bg-[#202020] border-b border-white/10 flex items-center justify-between text-xs no-print" data-no-print="true">
        {/* Lado Esquerdo: Seletor de Documento e Ações de Estilo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <select
              value={selectedDocId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedDocId(id);
                const doc = listaDocs.find(d => d.id === id);
                if (doc) setConteudo(doc.conteudoHtml);
              }}
              className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1 text-neutral-100 font-medium outline-none"
            >
              {listaDocs.map(d => (
                <option key={d.id} value={d.id}>{d.titulo}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Tags Contábeis Dinâmicas (Injetor de Dados Contábeis) */}
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-neutral-400">Variáveis Contábeis:</span>
            <button
              onClick={() => handleInsertTag('{{saldo_caixa_total}}')}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-mono border border-white/10 text-neutral-300"
              title="Injeta saldo de caixa atualizado"
            >
              + Saldo Caixa
            </button>
            <button
              onClick={() => handleInsertTag('{{lucro_liquido_exercicio}}')}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-mono border border-white/10 text-neutral-300"
              title="Injeta lucro líquido apurado"
            >
              + Lucro Líquido
            </button>
            <button
              onClick={() => handleInsertTag('{{tabela_balanco_sintetico}}')}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-mono border border-white/10 text-blue-300 flex items-center space-x-1"
              title="Injeta tabela sintetizada do Balanço Patrimonial"
            >
              <Table className="w-3 h-3" />
              <span>+ Tabela Balanço</span>
            </button>
          </div>
        </div>

        {/* Lado Direito: Modo Visual vs Código, Exportar Word, Salvar e Imprimir */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-neutral-900 rounded p-0.5 border border-white/10">
            <button
              onClick={() => setViewMode('VISUAL')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'VISUAL' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Visual WYSIWYG
            </button>
            <button
              onClick={() => setViewMode('RAW')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'RAW' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Editor HTML/Tags
            </button>
          </div>

          <button
            onClick={handleExportWord}
            className="flex items-center space-x-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-medium transition-colors border border-white/10 shadow-sm"
            title="Exportar documento para Microsoft Word (.doc)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Exportar Word (.doc)</span>
          </button>

          <button
            onClick={handleSalvar}
            className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors shadow-sm"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Salvo!' : 'Salvar'}</span>
          </button>

          <button
            onClick={handlePrintA4}
            className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors shadow-sm"
            title="Imprimir folha A4 oficial ou gerar PDF vetorial"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF A4</span>
          </button>
        </div>
      </div>

      {/* Área Central: Visualizador em Folha A4 Real com Margens */}
      <div className="print-scroll-container flex-1 bg-[#282828] overflow-y-auto p-6 flex justify-center">
        {viewMode === 'VISUAL' ? (
          <div 
            className="a4-page rounded-sm outline-none focus:ring-2 focus:ring-blue-500/50 select-text"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setConteudo(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: conteudoRenderizado }}
          />
        ) : (
          <div className="w-full max-w-4xl bg-[#1e1e1e] border border-white/10 rounded-xl p-4 flex flex-col h-[700px] no-print">
            <label className="text-xs font-semibold text-neutral-400 mb-2">
              Edição Direta do Modelo de Documento com Placeholders
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              className="flex-1 bg-[#121212] border border-white/10 rounded p-4 font-mono text-xs text-neutral-200 outline-none leading-relaxed resize-none focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
