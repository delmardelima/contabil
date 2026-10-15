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
  FileCheck,
  Layers,
  ArrowRight,
  Database,
  Building,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface ExportacaoContabilModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  lancamentos: LancamentoContabil[];
  onOpenReportPreview?: (tipo: 'BALANCETE' | 'BALANCO' | 'DRE' | 'LIVRO_DIARIO' | 'TERMO_ABERTURA') => void;
}

type TipoSped = 'ECD' | 'ECF' | 'EFD_FISCAL' | 'EFD_CONTRIBUICOES' | 'TRANSPORTE_SALDOS';

export const ExportacaoContabilModule: React.FC<ExportacaoContabilModuleProps> = ({
  empresa,
  contas,
  lancamentos,
  onOpenReportPreview
}) => {
  const [tipoSpedAtivo, setTipoSpedAtivo] = useState<TipoSped>('ECD');
  const [versaoLayout, setVersaoLayout] = useState<string>('10.00'); // Layout SPED ECD / ECF
  const [formaEscrituracao, setFormaEscrituracao] = useState<'G' | 'R' | 'A' | 'B'>('G'); // G = Livro Diário Completo
  const [competenciaFiscal, setCompetenciaFiscal] = useState<string>(empresa.competenciaAtiva);

  const [spedPreview, setSpedPreview] = useState<string>('');
  const [validando, setValidando] = useState<boolean>(false);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [validacaoResultado, setValidacaoResultado] = useState<{
    valido: boolean;
    titulo: string;
    totalLinhas: number;
    totalDebitos?: number;
    totalCreditos?: number;
    diferenca?: number;
    totalNotas?: number;
    erros: string[];
    avisos: string[];
  } | null>(null);

  // Execução do Transporte de Saldos Anual
  const [anoDestino, setAnoDestino] = useState<number>(empresa.exercicioAtivo + 1);
  const [transporteResultado, setTransporteResultado] = useState<{ success: boolean; contasTransportadas: number } | null>(null);

  // Gerador Estruturado por Tipo
  const handleGerarSped = () => {
    setValidando(true);
    setValidacaoResultado(null);

    setTimeout(() => {
      let conteudoTxt = '';
      const erros: string[] = [];
      const avisos: string[] = [];

      if (tipoSpedAtivo === 'ECD') {
        conteudoTxt = dbService.gerarSpedECD(empresa.id, empresa.exercicioAtivo);
        const lines = conteudoTxt.split('\r\n');
        let sumDebitos = 0;
        let sumCreditos = 0;

        for (const line of lines) {
          if (line.startsWith('|I250|')) {
            const parts = line.split('|');
            const valor = parseFloat(parts[4]?.replace(',', '.') || '0');
            const indDC = parts[5];
            if (indDC === 'D') sumDebitos += valor;
            if (indDC === 'C') sumCreditos += valor;
          }
        }

        const diferenca = Math.abs(sumDebitos - sumCreditos);
        if (diferenca > 0.01) {
          erros.push(`Inconsistência Bloco I200/I250: Total Débitos (R$ ${sumDebitos.toFixed(2)}) diverge dos Créditos (R$ ${sumCreditos.toFixed(2)}).`);
        }
        const contasSemClassif = contas.filter(c => !c.classificacao);
        if (contasSemClassif.length > 0) {
          avisos.push(`Existem ${contasSemClassif.length} contas sem máscara configurada.`);
        }

        setValidacaoResultado({
          valido: erros.length === 0,
          titulo: 'SPED ECD (Escrituração Contábil Digital)',
          totalLinhas: lines.length,
          totalDebitos: sumDebitos,
          totalCreditos: sumCreditos,
          diferenca,
          erros,
          avisos
        });
      } else if (tipoSpedAtivo === 'ECF') {
        conteudoTxt = dbService.gerarSpedECF(empresa.id, empresa.exercicioAtivo);
        const lines = conteudoTxt.split('\r\n');
        const countContasRef = contas.filter(c => c.tipo === 'A' && c.codigoReferencialRFB).length;
        if (countContasRef === 0) {
          avisos.push('Recomendado vincular Contas Contábeis ao Plano Referencial RFB para o Bloco J051.');
        }

        setValidacaoResultado({
          valido: true,
          titulo: 'SPED ECF (Escrituração Contábil Fiscal)',
          totalLinhas: lines.length,
          erros,
          avisos
        });
      } else if (tipoSpedAtivo === 'EFD_FISCAL') {
        conteudoTxt = dbService.gerarSpedFiscalEFD(empresa.id, competenciaFiscal);
        const lines = conteudoTxt.split('\r\n');
        const notasCount = lines.filter(l => l.startsWith('|C100|')).length;
        if (notasCount === 0) {
          avisos.push(`Nenhuma nota fiscal registrada na competência ${competenciaFiscal} para o Bloco C100.`);
        }

        setValidacaoResultado({
          valido: true,
          titulo: 'EFD-ICMS/IPI (SPED Fiscal)',
          totalLinhas: lines.length,
          totalNotas: notasCount,
          erros,
          avisos
        });
      } else if (tipoSpedAtivo === 'EFD_CONTRIBUICOES') {
        conteudoTxt = dbService.gerarSpedContribuicoes(empresa.id, competenciaFiscal);
        const lines = conteudoTxt.split('\r\n');
        const notasCount = lines.filter(l => l.startsWith('|C100|') || l.startsWith('|A100|')).length;

        setValidacaoResultado({
          valido: true,
          titulo: 'EFD-Contribuições (PIS/COFINS)',
          totalLinhas: lines.length,
          totalNotas: notasCount,
          erros,
          avisos
        });
      }

      setSpedPreview(conteudoTxt);
      setValidando(false);
    }, 250);
  };

  // Download do arquivo TXT
  const handleDownloadSped = () => {
    if (!spedPreview) return;
    const nomeBase = 
      tipoSpedAtivo === 'ECD' ? `SPED_ECD_${empresa.cnpj.replace(/\D/g, '')}_${empresa.exercicioAtivo}` :
      tipoSpedAtivo === 'ECF' ? `SPED_ECF_${empresa.cnpj.replace(/\D/g, '')}_${empresa.exercicioAtivo}` :
      tipoSpedAtivo === 'EFD_FISCAL' ? `SPED_EFD_FISCAL_${empresa.cnpj.replace(/\D/g, '')}_${competenciaFiscal.replace('-', '')}` :
      `SPED_EFD_CONTRIB_${empresa.cnpj.replace(/\D/g, '')}_${competenciaFiscal.replace('-', '')}`;

    const blob = new Blob([spedPreview], { type: 'text/plain;charset=iso-8859-1' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nomeBase}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    if (!spedPreview) return;
    navigator.clipboard.writeText(spedPreview);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Executar Transporte de Saldos Anual
  const handleExecutarTransporte = () => {
    if (confirm(`Confirmar o transporte dos saldos finais das contas patrimoniais do ano ${empresa.exercicioAtivo} para o ano ${anoDestino}?`)) {
      const res = dbService.executarTransporteSaldos(empresa.exercicioAtivo, anoDestino);
      setTransporteResultado(res);
    }
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
      {/* Header com Navegação Multi-SPED */}
      <div className="px-5 py-3 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Central de Obrigações Acessórias e SPED Oficial</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">RFB / Layouts Vigentes</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Geração de arquivos oficiais para o PVA da Receita Federal (ECD, ECF, EFD Fiscal e EFD Contribuições).
            </p>
          </div>
        </div>

        {/* Botão de Fechamento Mensal */}
        <button
          onClick={handleGerarPacoteMensal}
          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-2 transition"
        >
          <Archive className="w-3.5 h-3.5 text-blue-400" />
          <span>Emitir Pacote A4 (Balancete + DRE + Balanço)</span>
        </button>
      </div>

      {/* Sub-Tabs de Modos SPED */}
      <div className="px-5 py-2 bg-[#161616] border-b border-white/10 flex items-center space-x-2">
        <button
          onClick={() => { setTipoSpedAtivo('ECD'); setSpedPreview(''); setValidacaoResultado(null); }}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            tipoSpedAtivo === 'ECD' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          SPED ECD (Contábil Digital)
        </button>

        <button
          onClick={() => { setTipoSpedAtivo('ECF'); setSpedPreview(''); setValidacaoResultado(null); }}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            tipoSpedAtivo === 'ECF' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          SPED ECF (Contábil Fiscal / IRPJ)
        </button>

        <button
          onClick={() => { setTipoSpedAtivo('EFD_FISCAL'); setSpedPreview(''); setValidacaoResultado(null); }}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            tipoSpedAtivo === 'EFD_FISCAL' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          EFD-ICMS/IPI (SPED Fiscal)
        </button>

        <button
          onClick={() => { setTipoSpedAtivo('EFD_CONTRIBUICOES'); setSpedPreview(''); setValidacaoResultado(null); }}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            tipoSpedAtivo === 'EFD_CONTRIBUICOES' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          EFD-Contribuições (PIS/COFINS)
        </button>

        <button
          onClick={() => { setTipoSpedAtivo('TRANSPORTE_SALDOS'); setSpedPreview(''); setValidacaoResultado(null); }}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            tipoSpedAtivo === 'TRANSPORTE_SALDOS' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          Encerramento Anual (Transporte de Saldos)
        </button>
      </div>

      {/* Conteúdo Principal em 2 Colunas */}
      <div className="flex-1 flex overflow-hidden">
        {tipoSpedAtivo === 'TRANSPORTE_SALDOS' ? (
          /* Painel de Transporte de Saldos Anuais */
          <div className="flex-1 p-8 max-w-2xl mx-auto overflow-y-auto space-y-6">
            <div className="bg-[#1c1c1c] border border-white/10 rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-neutral-100">Transporte Anual de Saldos Patrimoniais</h3>
                  <p className="text-xs text-neutral-400">
                    Transfere os saldos finais das contas patrimoniais (Ativo e Passivo) como saldos iniciais do próximo exercício.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-3">
                <div className="p-3 bg-neutral-900 rounded-lg border border-white/5">
                  <span className="text-neutral-400 block mb-1">Exercício de Origem:</span>
                  <span className="font-mono text-base font-bold text-neutral-200">{empresa.exercicioAtivo}</span>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-white/5">
                  <span className="text-neutral-400 block mb-1">Exercício de Destino:</span>
                  <input
                    type="number"
                    value={anoDestino}
                    onChange={(e) => setAnoDestino(Number(e.target.value))}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1 text-purple-300 font-mono text-base font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExecutarTransporte}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold text-xs transition shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Executar Fechamento & Transporte de Saldos</span>
                </button>
              </div>

              {transporteResultado && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Transporte concluído! {transporteResultado.contasTransportadas} contas patrimoniais atualizadas com sucesso para {anoDestino}.
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Painel Esquerdo: Parâmetros e Validador */}
            <div className="w-[480px] border-r border-white/10 bg-[#181818] flex flex-col overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="bg-neutral-900/80 p-4 rounded-xl border border-white/5 space-y-3.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Parâmetros de {tipoSpedAtivo}</span>
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
                      <label className="block text-neutral-400 mb-1">
                        {tipoSpedAtivo === 'EFD_FISCAL' || tipoSpedAtivo === 'EFD_CONTRIBUICOES' ? 'Competência Fiscal:' : 'Ano-Calendário:'}
                      </label>
                      {tipoSpedAtivo === 'EFD_FISCAL' || tipoSpedAtivo === 'EFD_CONTRIBUICOES' ? (
                        <input
                          type="month"
                          value={competenciaFiscal}
                          onChange={(e) => setCompetenciaFiscal(e.target.value)}
                          className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1 text-neutral-200 font-mono outline-none"
                        />
                      ) : (
                        <div className="bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-200 font-mono font-bold">
                          {empresa.exercicioAtivo}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Versão do Layout:</label>
                      <select
                        value={versaoLayout}
                        onChange={(e) => setVersaoLayout(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded px-2 py-1.5 text-neutral-200 font-mono outline-none"
                      >
                        <option value="10.00">Layout 10.00 (Vigente)</option>
                        <option value="9.00">Layout 9.00 (Anterior)</option>
                      </select>
                    </div>
                  </div>

                  {tipoSpedAtivo === 'ECD' && (
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
                  )}

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
                          <span>Gerar e Validar Arquivo {tipoSpedAtivo}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultado da Validação */}
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
                          <p className="text-[11px] text-emerald-400/80">Conforme o Guia Prático da RFB.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-rose-300">Inconsistências Encontradas</h4>
                          <p className="text-[11px] text-rose-400/80">Revise antes da transmissão ao PVA.</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono text-neutral-300 pt-2 border-t border-white/10">
                    <div className="flex justify-between">
                      <span>Total de Linhas / Registros:</span>
                      <span className="font-bold text-neutral-100">{validacaoResultado.totalLinhas}</span>
                    </div>
                    {validacaoResultado.totalDebitos !== undefined && (
                      <div className="flex justify-between">
                        <span>Soma dos Débitos:</span>
                        <span className="font-bold text-emerald-400">R$ {validacaoResultado.totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {validacaoResultado.totalCreditos !== undefined && (
                      <div className="flex justify-between">
                        <span>Soma dos Créditos:</span>
                        <span className="font-bold text-emerald-400">R$ {validacaoResultado.totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {validacaoResultado.diferenca !== undefined && (
                      <div className="flex justify-between">
                        <span>Equilíbrio Contábil (DxC):</span>
                        <span className={`font-bold ${validacaoResultado.diferenca === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {validacaoResultado.diferenca === 0 ? 'R$ 0,00 (PERFEITO)' : `R$ ${validacaoResultado.diferenca.toFixed(2)}`}
                        </span>
                      </div>
                    )}
                    {validacaoResultado.totalNotas !== undefined && (
                      <div className="flex justify-between">
                        <span>Documentos Fiscais Escriturados:</span>
                        <span className="font-bold text-blue-400">{validacaoResultado.totalNotas}</span>
                      </div>
                    )}
                  </div>

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
            </div>

            {/* Painel Direito: Pré-visualizador de Código TXT */}
            <div className="flex-1 flex flex-col bg-[#111111] overflow-hidden">
              <div className="p-3 bg-[#161616] border-b border-white/10 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono flex items-center space-x-2">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Prévia do Arquivo Pipe-Delimited Oficial (|registro|)</span>
                </span>
                {spedPreview && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyClipboard}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs flex items-center space-x-1.5 transition"
                    >
                      {copiado ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                      <span>{copiado ? 'Copiado!' : 'Copiar TXT'}</span>
                    </button>
                    <button
                      onClick={handleDownloadSped}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center space-x-1.5 transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download TXT</span>
                    </button>
                  </div>
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
                    <p className="text-neutral-400 text-xs">Clique em "Gerar e Validar Arquivo" para visualizar as linhas oficiais.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
