import React, { useState, useEffect, useRef } from 'react';
import { ContaContabil, Empresa } from '../../types/contabil';
import { 
  Command, 
  Search, 
  FileSpreadsheet, 
  Scale, 
  BookOpen, 
  PieChart, 
  FileText, 
  FolderTree, 
  RefreshCw, 
  Building2,
  Sliders,
  Users,
  Network,
  Repeat,
  Layers,
  ShieldAlert,
  ArrowRightLeft,
  LayoutDashboard,
  X,
  LucideIcon,
  Zap,
  FileCode,
  TrendingUp,
  DollarSign,
  Receipt,
  Calculator,
  CreditCard,
  Archive
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (moduleId: string, title?: string, icon?: LucideIcon) => void;
  contas: ContaContabil[];
  empresas: Empresa[];
  onSelectEmpresa: (id: number) => void;
  onNewLancamento: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  contas,
  empresas,
  onSelectEmpresa,
  onNewLancamento
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allModules = [
    // Contabilidade
    { id: 'dashboard', label: 'Dashboard Executivo Contábil', icon: LayoutDashboard },
    { id: 'lancamentos', label: 'Lançamentos Contábeis (F2)', icon: BookOpen },
    { id: 'importacaoConciliacao', label: 'Importação OFX & Conciliação Bancária', icon: Zap },
    { id: 'exportacaoContabil', label: 'Exportação SPED ECD Oficial (RFB)', icon: FileCode },
    { id: 'balancete', label: 'Balancete de Verificação (F4)', icon: Scale },
    { id: 'balanco', label: 'Balanço Patrimonial (Quadro Oficial)', icon: Scale },
    { id: 'dre', label: 'Demonstração de Resultado (D.R.E.)', icon: PieChart },
    { id: 'dlpa', label: 'Demonstração de Lucros Acumulados (DLPA)', icon: TrendingUp },
    { id: 'dfc', label: 'Demonstração do Fluxo de Caixa (DFC)', icon: DollarSign },
    { id: 'livros', label: 'Livro Diário Geral & Razão Analítico', icon: BookOpen },
    { id: 'planoContas', label: 'Plano de Contas da Empresa', icon: FolderTree },
    { id: 'documentStudio', label: 'Document Studio (Termos A4)', icon: FileSpreadsheet },
    { id: 'zeramento', label: 'Zeramento de Exercício / ARE', icon: RefreshCw },
    { id: 'lotes', label: 'Gestão de Lotes Contábeis (CTLOTE)', icon: Layers },
    { id: 'estruturaDRE', label: 'Construtor de Estrutura da DRE', icon: Layers },
    { id: 'lancamentosPadrao', label: 'Lançamentos Padrão / Automáticos', icon: Repeat },
    { id: 'centrosCusto', label: 'Centros de Custo & Departamentos', icon: PieChart },
    { id: 'historicos', label: 'Históricos Padrão', icon: FileText },
    { id: 'empresas', label: 'Cadastro de Empresas & Clientes', icon: Building2 },
    { id: 'parametros', label: 'Parâmetros Contábeis (CTPARAMETRO)', icon: Sliders },
    { id: 'usuarios', label: 'Usuários, Perfis & Trilha de Auditoria', icon: Users },
    { id: 'redeBackup', label: 'Rede Local LAN & Backup (.bak)', icon: Network },
    { id: 'auditoria', label: 'Auditoria de Saldos Invertidos & Furos', icon: ShieldAlert },
    { id: 'transporteSaldos', label: 'Transporte de Saldos Patrimoniais Anual', icon: ArrowRightLeft },
    { id: 'ativoImobilizado', label: 'Ativo Imobilizado & Depreciação Mensal (CPC 27)', icon: Archive },

    // Escrita Fiscal
    { id: 'dashboardFiscal', label: 'Dashboard Fiscal & Faturamento', icon: Receipt },
    { id: 'notasFiscais', label: 'Importador XML & Notas Fiscais', icon: FileText },
    { id: 'acumuladores', label: 'Acumuladores Fiscais (EFACUMULADOR)', icon: Layers },
    { id: 'apuracaoFiscal', label: 'Apuração Fiscal (DAS / ICMS / PIS / COFINS)', icon: Calculator },

    // Folha de Pagamento
    { id: 'dashboardFolha', label: 'Dashboard do Departamento Pessoal', icon: Users },
    { id: 'calculoFolha', label: 'Cálculo da Folha Mensal & Holerites A4', icon: Calculator },
    { id: 'colaboradores', label: 'Cadastro de Colaboradores & Sócios', icon: Users },
    { id: 'rubricas', label: 'Tabela de Rubricas & Alíquotas INSS/IRRF', icon: Sliders },

    // Honorários
    { id: 'dashboardHonorarios', label: 'Dashboard Financeiro de Honorários', icon: DollarSign },
    { id: 'faturamentoHonorarios', label: 'Faturamento em Lote & Baixas de Honorários', icon: Receipt },
    { id: 'contratosHonorarios', label: 'Contratos Mensais de Clientes (MRR)', icon: FileText }
  ];

  const filteredNav = allModules.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.id.toLowerCase().includes(query.toLowerCase())
  );

  const filteredContas = contas
    .filter(c => 
      c.nome.toLowerCase().includes(query.toLowerCase()) || 
      c.classificacao.includes(query) ||
      c.codigoReduzido.toString().includes(query)
    )
    .slice(0, 6);

  const filteredEmpresas = empresas
    .filter(e => e.razaoSocial.toLowerCase().includes(query.toLowerCase()) || e.cnpj.includes(query))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 select-none animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Pesquisa */}
        <div className="p-3 border-b border-white/10 flex items-center space-x-3 bg-[#222222]">
          <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar rotinas, módulos, contas contábeis ou empresas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-500 text-sm outline-none"
          />
          <kbd className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">Esc</kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4 custom-scrollbar">
          {/* Módulos e Rotinas */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Rotinas & Módulos da Suíte ({filteredNav.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectModule(item.id, item.label, Icon);
                        onClose();
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 text-neutral-200 transition text-left group"
                    >
                      <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="flex-1 font-medium">{item.label}</span>
                      <span className="text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">Abrir ↵</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contas Contábeis */}
          {filteredContas.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Plano de Contas
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredContas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectModule('planoContas', 'Plano de Contas', FolderTree);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-neutral-200 transition text-left"
                  >
                    <div>
                      <div className="font-medium text-neutral-200">{c.codigoReduzido} - {c.nome}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{c.classificacao} • {c.natureza === 'D' ? 'Devedora' : 'Credora'}</div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Ver no Plano</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empresas */}
          {filteredEmpresas.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Empresas & Filiais
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredEmpresas.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      onSelectEmpresa(e.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-neutral-200 transition text-left"
                  >
                    <div>
                      <div className="font-medium text-neutral-200">{e.codigo} - {e.razaoSocial}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{e.cnpj}</div>
                    </div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono">Ativar Empresa</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredContas.length === 0 && filteredEmpresas.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              Nenhum resultado encontrado para "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#171717] border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center space-x-3">
            <span>Navegue com as setas ou clique</span>
            <span>•</span>
            <span>Pressione <kbd className="bg-neutral-800 px-1 rounded font-mono">Esc</kbd> para fechar</span>
          </div>
          <button
            onClick={() => {
              onNewLancamento();
              onClose();
            }}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            + Nova Partida (F2)
          </button>
        </div>
      </div>
    </div>
  );
};
