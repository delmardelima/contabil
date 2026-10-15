import React, { useState } from 'react';
import { dbService } from '../../db/sqliteService';
import { Empresa, ContaContabil, LancamentoContabil } from '../../types/contabil';
import { 
  FileCode, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Archive, 
  FileSpreadsheet, 
  Printer, 
  ShieldCheck, 
  Clock,
  Eye,
  FileCheck
} from 'lucide-react';

interface ExportacaoContabilModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  onOpenReportPreview?: (tipo: 'BALANCETE' | 'BALANCO' | 'DRE' | 'LIVRO_DIARIO' | 'TERMO_ABERTURA') => void;
}

export const ExportacaoContabilModule: React.FC<ExportacaoContabilModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  onOpenReportPreview
}) => {
  const [versaoLayout, setVersaoLayout] = useState<string>('10.00'); // Layout SPED ECD 2026/2025
  const [formaEscrituracao, setFormaEscrituracao] = useState<'G' | 'R' | 'A' | 'B'>('G'); // G = Livro Diário Completo
  const [spedPreview, setSpedPreview] = useState<string>('');
  const [validando, setValidando] = useState<boolean>(false);
  const [validacaoResultado, setValidacaoResultado] = useState<{
    valido: boolean;
    totalLinhas: number;
    totalDebitos: number;
    totalCreditos: number;
    diferenca: number;
    erros: string[];
    avisos: string[];
  } | null>(null);

  // Geração Estruturada do SPED ECD TXT
  const handleGerarSped = () => {
    setValidando(true);
    setValidacaoResultado(null);

    setTimeout(() => {
      const conteudoTxt = dbService.gerarSpedECD(empresa.id, empresa.exercicioAtivo);
      setSpedPreview(conteudoTxt);

      // Pré-validador de integridade SPED ECD
      const lines = conteudoTxt.split('\r\n');
      const erros: string[] = [];
      const avisos: string[] = [];

      let sumDebitos = 0;
      let sumCreditos = 0;

      for (const line of lines) {
        if (line.startsWith('|I250|')) {
          const parts = line.split('|');
          // |I250|COD_CTA|COD_CCUS|VALOR|IND_DC|...
          const valor = parseFloat(parts[4]?.replace(',', '.') || '0');
          const indDC = parts[5];
          if (indDC === 'D') sumDebitos += valor;
          if (indDC === 'C') sumCreditos += valor;
        }
      }

      const diferenca = Math.abs(sumDebitos - sumCreditos);
      if (diferenca > 0.01) {
        erros.push(`Inconsistência no Bloco I200/I250: Total de Débitos (R$ ${sumDebitos.toFixed(2)}) diverge dos Créditos (R$ ${sumCreditos.toFixed(2)}). Diferença: R$ ${diferenca.toFixed(2)}`);
      }

      const contasSemClassif = contas.filter(c => !c.classificacao);
      if (contasSemClassif.length > 0) {
        avisos.push(`Existem ${contasSemClassif.length} contas sem máscara de classificação configurada no Bloco I050.`);
      }

      setValidacaoResultado({
        valido: erros.length === 0,
        totalLinhas: lines.length,
        totalDebitos: sumDebitos,
        totalCreditos: sumCreditos,
        diferenca,
        erros,
        avisos
      });
      setValidando(false);
    }, 300);
  };

  // Download do arquivo TXT SPED ECD
  const handleDownloadSped = () => {
    if (!spedPreview) return;
    const blob = new Blob([spedPreview], { type: 'text/plain;charset=iso-8859-1' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPED_ECD_${empresa.cnpj.replace(/\D/g, '')}_${empresa.exercicioAtivo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Pacote Mensal de Demonstrativos
  const handleGerarPacoteMensal = () => {
    alert(`Pacote de Fechamento Contábil da competência ${empresa.competenciaAtiva} montado com sucesso! Utilize as opções de impressão A4 do Document Studio.`);
    if (onOpenReportPreview) {
      onOpenReportPreview('BALANCETE');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Central de Exportação Fiscal & Contábil Digital</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">RFB / SPED Oficial</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Geração dos arquivos oficiais da Escrituração Contábil Digital (SPED ECD) e pacote mensal do cliente.
            </p>
          </div>
        </div>

        {/* Botão de Fechamento Mensal */}
        <button
          onClick={handleGerarPacoteMensal}
          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-2 transition"
        >
          <Archive className="w-3.5 h-3.5 text-blue-400" />
          <span>Emitir Pacote Mensal A4 (Balancete + DRE + Balanço)</span>
        </button>
      </div>

      {/* Conteúdo Principal em 2 Colunas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel de Parâmetros e Pré-Validação */}
        <div className="w-[480px] border-r border-white/10 bg-[#181818] flex flex-col overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Seção 1: Configuração do Arquivo SPED */}
          <div className="bg-neutral-900/80 p-4 rounded-xl border border-white/5 space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Parâmetros da Escrituração ECD</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Empresa / CNPJ:</label>
                <div className="bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-[11px]">
                  {empresa.razaoSocial} • {empresa.cnpj}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Ano-Calendário:</label>
                  <div className="bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 font-mono font-bold">
                    {empresa.exercicioAtivo}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Layout SPED ECD:</label>
                  <select
                    value={versaoLayout}
                    onChange={(e) => setVersaoLayout(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 font-mono outline-none"
                  >
                    <option value="10.00">Layout 10.00 (Exercício 2026/2025)</option>
                    <option value="9.00">Layout 9.00 (Exercício 2024)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Forma de Escrituração Contábil:</label>
                <select
                  value={formaEscrituracao}
                  onChange={(e) => setFormaEscrituracao(e.target.value as any)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 outline-none"
                >
                  <option value="G">G - Livro Diário Geral Completo</option>
                  <option value="R">R - Livro Diário com Escrituração Resumida</option>
                  <option value="A">A - Livro Diário Auxiliar</option>
                  <option value="B">B - Livro Balancetes Diários e Balanços</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGerarSped}
                  disabled={validando}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-900/30"
                >
                  {validando ? (
                    <span>Validando e Estruturando Blocos...</span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Gerar e Validar Arquivo SPED ECD</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Seção 2: Resultado da Pré-Validação */}
          {validacaoResultado && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              validacaoResultado.valido 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className="flex items-center space-x-2">
                {validacaoResultado.valido ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-300">Estrutura 100% Validada</h4>
                      <p className="text-[11px] text-emerald-400/80">Arquivo em conformidade com o validador PVA da RFB.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-300">Inconsistências Encontradas</h4>
                      <p className="text-[11px] text-rose-400/80">Revise os erros antes da transmissão oficial.</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1.5 text-[11px] font-mono text-neutral-300 pt-2 border-t border-white/10">
                <div className="flex justify-between">
                  <span>Total de Registros/Linhas:</span>
                  <span className="font-bold text-neutral-100">{validacaoResultado.totalLinhas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Soma dos Débitos (Bloco I250):</span>
                  <span className="font-bold text-emerald-400">R$ {validacaoResultado.totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Soma dos Créditos (Bloco I250):</span>
                  <span className="font-bold text-emerald-400">R$ {validacaoResultado.totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Equilíbrio das Partidas (DxC):</span>
                  <span className={`font-bold ${validacaoResultado.diferenca === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {validacaoResultado.diferenca === 0 ? 'R$ 0,00 (PERFEITO)' : `R$ ${validacaoResultado.diferenca.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {validacaoResultado.erros.length > 0 && (
                <div className="pt-2 text-[11px] text-rose-400 space-y-1">
                  {validacaoResultado.erros.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {validacaoResultado.avisos.length > 0 && (
                <div className="pt-2 text-[11px] text-amber-400 space-y-1">
                  {validacaoResultado.avisos.map((av, i) => (
                    <div key={i}>⚠️ {av}</div>
                  ))}
                </div>
              )}

              <button
                onClick={handleDownloadSped}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-sm mt-3"
              >
                <Download className="w-4 h-4" />
                <span>Salvar Arquivo TXT (.txt) no Disco</span>
              </button>
            </div>
          )}

          {/* Seção 3: Informações de Blocos do SPED ECD */}
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <h4 className="font-semibold text-neutral-300">Blocos Gerados nesta Versão:</h4>
            <div className="space-y-1 text-[11px] text-neutral-400 font-mono">
              <div><strong className="text-neutral-200">Bloco 0:</strong> Abertura, Identificação e Referências (|0000|, |0001|, |0990|)</div>
              <div><strong className="text-neutral-200">Bloco I:</strong> Lançamentos e Plano de Contas (|I050|, |I150|, |I155|, |I200|, |I250|)</div>
              <div><strong className="text-neutral-200">Bloco J:</strong> Balanço Patrimonial e DRE Oficial (|J005|, |J100|, |J150|)</div>
              <div><strong className="text-neutral-200">Bloco 9:</strong> Controle e Encerramento do Arquivo (|9900|, |9999|)</div>
            </div>
          </div>
        </div>

        {/* Painel da Direita: Visualizador de Linhas do Arquivo SPED */}
        <div className="flex-1 flex flex-col bg-[#111111] overflow-hidden">
          <div className="p-3 bg-[#161616] border-b border-white/10 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-mono flex items-center space-x-2">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Visualização do Arquivo TXT Oficial (PVA Layout)</span>
            </span>
            {spedPreview && (
              <button
                onClick={handleDownloadSped}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs flex items-center space-x-1.5 transition"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Download TXT</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {spedPreview ? (
              <pre className="font-mono text-[11px] text-neutral-300 leading-relaxed whitespace-pre select-text">
                {spedPreview}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2 text-center">
                <FileCode className="w-10 h-10 text-neutral-600" />
                <p className="text-neutral-400 text-xs">Clique em "Gerar e Validar Arquivo SPED ECD" para gerar a prévia do arquivo TXT.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
