import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  FileSpreadsheet
} from 'lucide-react';
import { Empresa } from '../../types/contabil';
import { exportToDOCX } from '../../utils/exportUtils';

interface ReportPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa;
  tituloRelatorio: string;
  subtitulo?: string;
  periodo?: string;
  orientacaoPadrao?: 'portrait' | 'landscape';
  numeroLivro?: number;
  folhaInicial?: number;
  onExportCsv?: () => void;
  children: React.ReactNode;
}

export const ReportPrintPreviewModal: React.FC<ReportPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  empresa,
  tituloRelatorio,
  subtitulo,
  periodo = '01/01/2026 a 31/12/2026',
  orientacaoPadrao = 'portrait',
  numeroLivro = 1,
  folhaInicial = 1,
  onExportCsv,
  children
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [orientacao, setOrientacao] = useState<'portrait' | 'landscape'>(orientacaoPadrao);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    const element = document.getElementById('print-preview-content');
    if (element) {
      exportToDOCX(`${tituloRelatorio.replace(/\s+/g, '_')}_${(empresa.razaoSocial || 'Empresa').slice(0, 15)}`, element.innerHTML);
    }
  };

  const dataAtualFormatada = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaAtualFormatada = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const modalContent = (
    <div className="print-modal-root fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md text-neutral-100 select-none animate-fadeIn">
      <style>{`
        @media print {
          @page {
            size: A4 ${orientacao};
            margin: 10mm;
          }
        }
      `}</style>

      {/* 1. Barra de Ferramentas Superior (Document Studio Toolbar) */}
      <header className="no-print h-14 px-6 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between shadow-2xl flex-shrink-0" data-no-print="true">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide flex items-center gap-2">
              <span>{tituloRelatorio}</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                Visualização A4 Oficial
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              {empresa.razaoSocial || 'Empresa não configurada'} • CNPJ: {empresa.cnpj || '—'}
            </p>
          </div>
        </div>

        {/* Controles de Visualização */}
        <div className="flex items-center gap-2 bg-[#222222] px-3 py-1.5 rounded-lg border border-white/10">
          <button
            onClick={() => setZoom(prev => Math.max(50, prev - 15))}
            className="p-1 hover:bg-white/10 rounded text-neutral-300 hover:text-white transition"
            title="Diminuir Zoom"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono w-12 text-center text-neutral-200">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(175, prev + 15))}
            className="p-1 hover:bg-white/10 rounded text-neutral-300 hover:text-white transition"
            title="Aumentar Zoom"
          >
            <ZoomIn size={16} />
          </button>

          <div className="w-px h-4 bg-white/20 mx-1" />

          <button
            onClick={() => setOrientacao(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition ${
              orientacao === 'landscape' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-white/10 text-neutral-300'
            }`}
            title="Alternar Orientação Retrato / Paisagem"
          >
            <RotateCw size={14} />
            <span>{orientacao === 'portrait' ? 'Retrato (A4)' : 'Paisagem (A4)'}</span>
          </button>
        </div>

        {/* Ações de Saída: Imprimir, Word, CSV, Fechar */}
        <div className="flex items-center gap-2">
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-emerald-700/20 hover:bg-emerald-700/40 text-emerald-300 border border-emerald-600/30 font-medium transition"
              title="Exportar Planilha Excel / CSV"
            >
              <FileSpreadsheet size={15} />
              <span>Exportar CSV</span>
            </button>
          )}

          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-blue-700/20 hover:bg-blue-700/40 text-blue-300 border border-blue-600/30 font-medium transition"
            title="Exportar Documento Word (.doc)"
          >
            <Download size={15} />
            <span>Exportar Word</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition"
          >
            <Printer size={15} />
            <span>Imprimir / PDF A4</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 ml-2 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-lg transition"
            title="Fechar Visualização (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* 2. Área de Rolagem do Documento com Folha A4 Centralizada */}
      <div className="print-scroll-container flex-1 overflow-auto p-8 flex justify-center bg-[#0d0d0d]">
        <div 
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
          className="print-zoom-wrapper transition-all"
        >
          {/* Folha A4 Física */}
          <div 
            id="print-preview-content"
            className={`a4-page bg-white text-neutral-900 shadow-2xl rounded-sm p-10 flex flex-col justify-between select-text ${
              orientacao === 'portrait' 
                ? 'w-[210mm] min-h-[297mm]' 
                : 'w-[297mm] min-h-[210mm]'
            }`}
            style={{ boxSizing: 'border-box' }}
          >
            {/* CABEÇALHO PADRÃO CONTÁBIL BRASILEIRO (CFC / Junta Comercial) */}
            <div className="border-b-2 border-neutral-900 pb-3 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-base font-bold uppercase tracking-wider text-neutral-950 font-sans">
                    {empresa.razaoSocial || 'RAZÃO SOCIAL NÃO INFORMADA'}
                  </h1>
                  <p className="text-[11px] text-neutral-700 font-mono mt-0.5">
                    CNPJ: {empresa.cnpj || '—'} {empresa.inscricaoEstadual ? `• IE: ${empresa.inscricaoEstadual}` : ''} {empresa.nire ? `• NIRE: ${empresa.nire}` : ''}
                  </p>
                  <p className="text-[10px] text-neutral-600 font-sans">
                    {[empresa.logradouro, empresa.numero, empresa.complemento, empresa.bairro].filter(Boolean).join(', ')} {empresa.cidade ? `• ${empresa.cidade}/${empresa.uf}` : ''} {empresa.cep ? `- CEP: ${empresa.cep}` : ''}
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-neutral-600 pl-4">
                  <p className="font-semibold text-neutral-800">LIVRO Nº: {String(numeroLivro).padStart(3, '0')}</p>
                  <p>FOLHA: {String(folhaInicial).padStart(4, '0')}</p>
                  <p>EMISSÃO: {dataAtualFormatada} {horaAtualFormatada}</p>
                </div>
              </div>

              {/* Título do Demonstrativo */}
              <div className="mt-3 pt-2 border-t border-neutral-300 flex justify-between items-end">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-neutral-900">
                    {tituloRelatorio}
                  </h2>
                  {subtitulo && (
                    <p className="text-[11px] font-medium text-neutral-600">{subtitulo}</p>
                  )}
                </div>
                <div className="text-right text-[11px] font-mono font-medium text-neutral-700">
                  Período: <span className="font-bold">{periodo}</span>
                </div>
              </div>
            </div>

            {/* CORPO DO DOCUMENTO (TABELAS / NOTAS / RELATÓRIO) */}
            <div className="flex-1 text-[11px] leading-relaxed">
              {children}
            </div>

            {/* RODAPÉ OFICIAL DE FECHAMENTO COM TERMO E ASSINATURAS */}
            <div className="mt-8 pt-4 border-t border-neutral-400 break-inside-avoid">
              <p className="text-[10px] text-center text-neutral-600 italic mb-8 font-serif">
                Reconhecemos a exatidão do presente demonstrativo contábil, levantado em estrita consonância com a legislação societária e as Normas Brasileiras de Contabilidade (CFC / NBC TG).
              </p>

              <div className="text-[11px] text-right font-serif text-neutral-800 mb-8 mr-4">
                {empresa.cidade || 'Local'}, {dataAtualFormatada}.
              </div>

              {/* Linhas de Assinatura Duplas: Responsável Legal e Contador com CRC */}
              <div className="grid grid-cols-2 gap-12 px-6">
                <div className="text-center">
                  <div className="border-t border-neutral-800 pt-1.5">
                    <p className="font-bold text-neutral-950 uppercase text-[11px]">
                      {empresa.responsavelLegal || empresa.razaoSocial || 'Representante Legal'}
                    </p>
                    <p className="text-[10px] text-neutral-700 font-mono">
                      CPF: {empresa.cpfResponsavel || '—'}
                    </p>
                    <p className="text-[10px] text-neutral-600 font-sans">
                      Representante Legal / Administrador
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="border-t border-neutral-800 pt-1.5">
                    <p className="font-bold text-neutral-950 uppercase text-[11px]">
                      {empresa.contadorNome || empresa.contadorResponsavel || 'Contabilista Responsável'}
                    </p>
                    <p className="text-[10px] text-neutral-700 font-mono">
                      {empresa.contadorCRC || empresa.crcContador || 'CRC'} {empresa.contadorCPF ? `• CPF: ${empresa.contadorCPF}` : ''}
                    </p>
                    <p className="text-[10px] text-neutral-600 font-sans">
                      Contabilista Responsável
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
