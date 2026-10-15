import React, { useState } from 'react';
import { Empresa, DLPAItem } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { 
  Scale, 
  Printer, 
  Download, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface DLPAModuleProps {
  empresa: Empresa;
  onOpenReportPreview?: (config: {
    tipo: 'DLPA';
    titulo: string;
    subtitulo: string;
    linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[];
  }) => void;
}

export const DLPAModule: React.FC<DLPAModuleProps> = ({
  empresa,
  onOpenReportPreview
}) => {
  const [itens, setItens] = useState<DLPAItem[]>(dbService.getDLPA(empresa.id, empresa.exercicioAtivo));
  const [showNovoItemModal, setShowNovoItemModal] = useState<boolean>(false);
  const [novaDescricao, setNovaDescricao] = useState<string>('');
  const [novoValor, setNovoValor] = useState<string>('');
  const [novoTipo, setNovoTipo] = useState<'AUMENTO' | 'DIMINUICAO' | 'SALDO'>('AUMENTO');

  // Cálculo do Saldo Final
  let saldoCalculado = 0;
  for (const item of itens) {
    if (item.tipo === 'SALDO') {
      saldoCalculado = item.valor;
    } else if (item.tipo === 'AUMENTO') {
      saldoCalculado += item.valor;
    } else if (item.tipo === 'DIMINUICAO') {
      saldoCalculado -= Math.abs(item.valor);
    }
  }

  const handleExportCSV = () => {
    const headers = ['Descrição do Evento', 'Tipo', 'Valor (R$)'];
    const rows = itens.map(i => [
      i.descricao,
      i.tipo || '',
      i.valor.toFixed(2)
    ]);
    rows.push(['(=) SALDO FINAL DE LUCROS/PREJUÍZOS ACUMULADOS', 'TOTAL', saldoCalculado.toFixed(2)]);
    exportToCSV(`DLPA_${empresa.codigo}_${empresa.exercicioAtivo}.csv`, headers, rows);
  };

  const handleImprimirA4 = () => {
    if (onOpenReportPreview) {
      const linhas: { descricao: string; valor: number; isTotal?: boolean; isHeader?: boolean }[] = itens.map(i => ({
        descricao: i.descricao,
        valor: i.tipo === 'DIMINUICAO' ? -Math.abs(i.valor) : i.valor,
        isHeader: i.tipo === 'SALDO' && i.id === 1
      }));
      linhas.push({
        descricao: '(=) SALDO NO FIM DO EXERCÍCIO SOCIAL',
        valor: saldoCalculado,
        isTotal: true
      });

      onOpenReportPreview({
        tipo: 'DLPA',
        titulo: 'DEMONSTRAÇÃO DE LUCROS OU PREJUÍZOS ACUMULADOS (D.L.P.A.)',
        subtitulo: `Exercício Findo em 31/12/${empresa.exercicioAtivo} • Em conformidade com a Lei 6.404/76 e NBC TG 26`,
        linhas
      });
    }
  };

  const handleAdicionarItem = () => {
    if (!novaDescricao.trim() || !novoValor) return;
    const num = parseFloat(novoValor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(num)) return;

    const novo: DLPAItem = {
      id: Date.now(),
      empresaId: empresa.id,
      exercicio: empresa.exercicioAtivo,
      descricao: novaDescricao.trim(),
      valor: novoTipo === 'DIMINUICAO' ? -Math.abs(num) : Math.abs(num),
      tipo: novoTipo
    };

    const atualizados = [...itens, novo];
    setItens(atualizados);
    dbService.saveDLPA(empresa.id, empresa.exercicioAtivo, atualizados);

    setShowNovoItemModal(false);
    setNovaDescricao('');
    setNovoValor('');
  };

  const handleExcluirItem = (id: number) => {
    const atualizados = itens.filter(i => i.id !== id);
    setItens(atualizados);
    dbService.saveDLPA(empresa.id, empresa.exercicioAtivo, atualizados);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#181818] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Demonstração de Lucros ou Prejuízos Acumulados (DLPA)</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-medium">Lei 6.404/76</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Evolução patrimonial do resultado e destinação dos lucros da empresa no exercício social.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNovoItemModal(true)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Adicionar Mutação</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleImprimirA4}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Folha A4 Oficial</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Tabela */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar flex justify-center">
        <div className="w-full max-w-4xl bg-[#181818] rounded-xl border border-white/10 p-6 space-y-4 shadow-xl">
          {/* Cabeçalho Formal */}
          <div className="text-center pb-4 border-b border-white/10">
            <h3 className="text-base font-bold text-neutral-100">{empresa.razaoSocial}</h3>
            <p className="text-xs text-neutral-400 font-mono">CNPJ: {empresa.cnpj}</p>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mt-2">
              Demonstração de Lucros ou Prejuízos Acumulados - D.L.P.A.
            </h4>
            <p className="text-[11px] text-neutral-500">Exercício Social Findo em 31 de Dezembro de {empresa.exercicioAtivo} (Em Reais - R$)</p>
          </div>

          {/* Grade de Itens da DLPA */}
          <div className="divide-y divide-white/5 text-xs font-mono">
            {itens.map((item) => (
              <div key={item.id} className="py-2.5 px-3 flex items-center justify-between hover:bg-white/5 transition-colors rounded">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    item.tipo === 'SALDO' ? 'bg-blue-400' : item.tipo === 'AUMENTO' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`} />
                  <span className="font-sans text-neutral-200">{item.descricao}</span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`font-semibold ${
                    item.tipo === 'DIMINUICAO' || item.valor < 0 ? 'text-rose-400' : 'text-neutral-100'
                  }`}>
                    {item.tipo === 'DIMINUICAO' && item.valor > 0 ? `(${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>

                  {item.id > 2 && (
                    <button
                      onClick={() => handleExcluirItem(item.id)}
                      className="text-neutral-600 hover:text-rose-400 transition"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Linha de Fechamento: Saldo Final */}
            <div className="py-3 px-3 flex items-center justify-between bg-neutral-900/90 rounded border border-indigo-500/20 mt-2 font-bold text-sm">
              <span className="text-indigo-300 font-sans">(=) SALDO FINAL DE LUCROS/PREJUÍZOS ACUMULADOS</span>
              <span className="text-emerald-400 font-mono text-base">
                R$ {saldoCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Mutação */}
      {showNovoItemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-neutral-100">Adicionar Mutação de Patrimônio Líquido</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Descrição do Evento:</label>
                <input
                  type="text"
                  placeholder="Ex: Dividendos Distribuídos aos Sócios"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1">Efeito na Conta:</label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-2 text-neutral-200 outline-none"
                  >
                    <option value="AUMENTO">(+) Aumento / Adição</option>
                    <option value="DIMINUICAO">(-) Redução / Destinação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Valor (R$):</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded px-3 py-2 text-neutral-100 font-mono text-right outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowNovoItemModal(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarItem}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
              >
                Salvar Mutação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
