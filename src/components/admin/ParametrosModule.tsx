import React, { useState } from 'react';
import { 
  Sliders, 
  Save, 
  Check, 
  Lock, 
  Scale, 
  FileCheck2, 
  BookOpen, 
  HelpCircle 
} from 'lucide-react';
import { Empresa, ContaContabil, ParametrosEmpresa } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

interface ParametrosModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
}

export const ParametrosModule: React.FC<ParametrosModuleProps> = ({
  empresa,
  contas
}) => {
  const [params, setParams] = useState<ParametrosEmpresa>(dbService.getParametros(empresa.id));
  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  const contasAnaliticas = contas.filter(c => c.tipo === 'A');

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveParametros(params);
    setMensagemSucesso(true);
    setTimeout(() => setMensagemSucesso(false), 3000);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Sliders size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Parâmetros Contábeis da Empresa</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                CTPARAMETRO
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Configurações de fechamento de período, contas de encerramento e validações de digitação
            </p>
          </div>
        </div>

        {mensagemSucesso && (
          <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
            <Check size={14} />
            <span>Parâmetros atualizados e gravados com sucesso!</span>
          </div>
        )}
      </div>

      {/* Formulário com Seções */}
      <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto mt-6 space-y-6 max-w-4xl custom-scrollbar pr-2">
        {/* Seção 1: Regime e Fechamento de Datas */}
        <div className="p-5 rounded-xl bg-[#181818] border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <Lock size={16} className="text-blue-400" />
            <span>Regime Contábil & Fechamento de Período</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Regime Contábil Adotado</label>
              <select
                value={params.regimeContabil}
                onChange={e => setParams({ ...params, regimeContabil: e.target.value as 'COMPETENCIA' | 'CAIXA' })}
                className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="COMPETENCIA">Regime de Competência (Recomendado CFC)</option>
                <option value="CAIXA">Regime de Caixa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Bloquear Lançamentos até a Data
              </label>
              <input
                type="date"
                value={params.bloquearLancamentosAte || ''}
                onChange={e => setParams({ ...params, bloquearLancamentosAte: e.target.value })}
                className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Impede a inserção, edição ou exclusão de partidas anteriores a esta data (período auditado).
              </p>
            </div>
          </div>
        </div>

        {/* Seção 2: Validações de Digitação */}
        <div className="p-5 rounded-xl bg-[#181818] border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <Scale size={16} className="text-indigo-400" />
            <span>Validações e Regras de Lançamento</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={params.obrigaCentroCusto}
                onChange={e => setParams({ ...params, obrigaCentroCusto: e.target.checked })}
                className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
              />
              <div>
                <p className="text-xs font-medium text-neutral-200">Exigir Centro de Custo em Contas de Resultado</p>
                <p className="text-[10px] text-neutral-400">Obriga o preenchimento de rateio de Centro de Custo nas contas dos grupos 3 e 4.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={params.permiteDiferencaDxC}
                onChange={e => setParams({ ...params, permiteDiferencaDxC: e.target.checked })}
                className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
              />
              <div>
                <p className="text-xs font-medium text-neutral-200">Permitir Gravação de Lote Provisório com Diferença DxC</p>
                <p className="text-[10px] text-neutral-400">Permite salvar partidas provisórias (Status Rascunho), mas bloqueia relatórios oficiais até o balanceamento.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={params.avancaPaginaTrocaGrupo}
                onChange={e => setParams({ ...params, avancaPaginaTrocaGrupo: e.target.checked })}
                className="w-4 h-4 rounded bg-[#141414] border-white/20 text-blue-600 focus:ring-0"
              />
              <div>
                <p className="text-xs font-medium text-neutral-200">Avançar Página ao Trocar de Grupo Contábil na Impressão</p>
                <p className="text-[10px] text-neutral-400">Insere quebra de página automática no Balancete e Razão entre Ativo, Passivo e Resultado.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Seção 3: Contas Padrão de Encerramento (ARE e PL) */}
        <div className="p-5 rounded-xl bg-[#181818] border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <FileCheck2 size={16} className="text-emerald-400" />
            <span>Contas de Apuração do Resultado (ARE) e Destinação</span>
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Conta Transitória de ARE
              </label>
              <select
                value={params.contaDestinoZeramentoId}
                onChange={e => setParams({ ...params, contaDestinoZeramentoId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {contasAnaliticas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.codigoReduzido} - {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Conta de Lucros Acumulados
              </label>
              <select
                value={params.contaLucrosAcumuladosId}
                onChange={e => setParams({ ...params, contaLucrosAcumuladosId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {contasAnaliticas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.codigoReduzido} - {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Conta de Prejuízos Acumulados
              </label>
              <select
                value={params.contaPrejuizosAcumuladosId}
                onChange={e => setParams({ ...params, contaPrejuizosAcumuladosId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {contasAnaliticas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.codigoReduzido} - {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Seção 4: Numeração de Livros e Folhas */}
        <div className="p-5 rounded-xl bg-[#181818] border border-white/10 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <BookOpen size={16} className="text-amber-400" />
            <span>Numeração Oficial de Livros Registrados</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Número do Livro Diário Geral
              </label>
              <input
                type="number"
                value={params.numeroLivroDiario}
                onChange={e => setParams({ ...params, numeroLivroDiario: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Número da Folha Inicial do Exercício
              </label>
              <input
                type="number"
                value={params.numeroFolhaInicial}
                onChange={e => setParams({ ...params, numeroFolhaInicial: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end pt-2 pb-6">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
          >
            <Save size={16} />
            <span>Salvar Parâmetros Oficiais</span>
          </button>
        </div>
      </form>
    </div>
  );
};
