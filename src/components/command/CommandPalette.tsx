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
  Archive,
  Lock,
  ShieldCheck,
  Factory,
  Clock,
  Boxes,
  UserMinus,
  Activity,
  Briefcase,
  Home,
  HeartPulse,
  Landmark,
  Sparkles,
  Percent,
  Mail,
  KeyRound,
  Wheat,
  HardHat,
  Globe2,
  Coins,
  Sprout,
  Fuel,
  FileCheck,
  HeartHandshake,
  Ship,
  Car,
  Leaf,
  Anchor,
  Compass,
  Award,
  RotateCcw,
  Wallet,
  Package,
  Truck,
  Stethoscope,
  Ambulance,
  GraduationCap,
  Gavel
} from 'lucide-react';

import { dbService } from '../../db/sqliteService';
import { MODULO_PERMISSOES } from '../../types/contabil';

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
    // Contabilidade Lite (Simples Nacional & MEI)
    { id: 'dashboard', label: 'Painel do Contador (Visão Geral Simples/MEI)', icon: LayoutDashboard },
    { id: 'lancamentos', label: 'Lançamentos Contábeis & Movimento de Caixa (F2)', icon: BookOpen },
    { id: 'importacaoConciliacao', label: 'Importação de Extrato OFX & Conciliação Bancária Automática', icon: Zap },
    { id: 'planoContas', label: 'Plano de Contas Simplificado (ITG 1000 / ME e EPP) (F3)', icon: FolderTree },
    { id: 'balancete', label: 'Balancete de Verificação Mensal (F4)', icon: Scale },
    { id: 'balanco', label: 'Balanço Patrimonial Simplificado (ITG 1000)', icon: Scale },
    { id: 'dre', label: 'Demonstração do Resultado do Exercício (D.R.E.)', icon: PieChart },
    { id: 'dlpa', label: 'Demonstração de Lucros ou Prejuízos Acumulados (DLPA)', icon: TrendingUp },
    { id: 'dfc', label: 'Demonstração do Fluxo de Caixa (DFC)', icon: DollarSign },
    { id: 'livros', label: 'Livro Diário, Razão Analítico & Livro Caixa (MEI / Simples)', icon: BookOpen },
    { id: 'zeramento', label: 'Encerramento do Exercício (ARE) & Distribuição de Lucros Isentos', icon: RefreshCw },
    { id: 'balancoAbertura', label: 'Balanço de Abertura (Transição do Livro Caixa para Contabilidade ITG 1000)', icon: BookOpen },
    { id: 'documentStudio', label: 'Document Studio A4 (Termos, Atas, Declaração de Faturamento)', icon: FileSpreadsheet },
    { id: 'lotes', label: 'Gestão de Lotes Contábeis (CTLOTE)', icon: Layers },
    { id: 'lancamentosPadrao', label: 'Lançamentos Padrão (Atalhos para Compras, Vendas, DAS e Folha)', icon: Repeat },
    { id: 'historicos', label: 'Históricos Padrão Contábeis', icon: FileText },
    { id: 'centrosCusto', label: 'Centros de Custo (Comércio / Serviços / Filiais)', icon: PieChart },
    { id: 'estruturaDRE', label: 'Configuração da Estrutura da D.R.E.', icon: Layers },
    { id: 'ativoImobilizado', label: 'Controle de Bens & Depreciação Mensal', icon: Archive },
    { id: 'exportacaoContabil', label: 'Exportação SPED ECD (Opcional para Simples Nacional)', icon: FileCode },
    { id: 'empresas', label: 'Cadastro de Empresas Clientes (Simples Nacional & MEI)', icon: Building2 },
    { id: 'parametros', label: 'Parâmetros Contábeis & Fechamento de Período (CTPARAMETRO)', icon: Sliders },
    { id: 'usuarios', label: 'Usuários & Permissões do Escritório', icon: Users },
    { id: 'redeBackup', label: 'Rede Local LAN & Backup em 1 Clique (.bak)', icon: Network },
    { id: 'auditoria', label: 'Conferência de Saldos Invertidos (Caixa/Bancos/Clientes)', icon: ShieldAlert },
    { id: 'transporteSaldos', label: 'Virada de Ano (Transporte de Saldos Patrimoniais)', icon: ArrowRightLeft },
    { id: 'calendarioFiscal', label: 'Agenda de Obrigações (DAS, FGTS, INSS, DEFIS, DASN-SIMEI)', icon: Clock },
    { id: 'protocolo', label: 'Protocolo de Entrega de Documentos e Guias ao Cliente', icon: FileText },

    // Escrita Fiscal Lite (Simples Nacional, MEI, Comércio e Serviços)
    { id: 'dashboardFiscal', label: 'Painel Fiscal (Faturamento, Limite Simples/MEI e DAS)', icon: Receipt },
    { id: 'notasFiscais', label: 'Importador de XML (NF-e Comércio / NFC-e Varejo)', icon: FileText },
    { id: 'nfse', label: 'Notas Fiscais de Serviços (NFS-e Prestados e Tomados)', icon: Receipt },
    { id: 'pgdas', label: 'Apuração PGDAS-D & Cálculo da Guia DAS (Anexos I a V)', icon: Calculator },
    { id: 'fatorR', label: 'Apuração do Fator R (Folha >= 28% - Economia Anexo V para III)', icon: Percent },
    { id: 'simplesRegimeCaixa', label: 'Simples Nacional pelo Regime de Caixa (Recebimentos Efetivos)', icon: Wallet },
    { id: 'defis', label: 'Declaração Anual DEFIS (Simples Nacional) & DASN-SIMEI', icon: Building2 },
    { id: 'acumuladores', label: 'Acumuladores Fiscais (Integração Automática Escrita -> Contabilidade)', icon: Layers },
    { id: 'participantes', label: 'Cadastro de Clientes & Fornecedores', icon: Users },
    { id: 'produtos', label: 'Cadastro de Mercadorias & Serviços', icon: Package },
    { id: 'cartoes', label: 'Vendas em Cartão de Crédito/Débito & PIX', icon: CreditCard },
    { id: 'retencoes', label: 'Retenções em Notas de Serviço (ISS, INSS, IRRF)', icon: Receipt },
    { id: 'difal', label: 'DIFAL Simples Nacional & DeSTDA (Compras Interestaduais)', icon: Scale },
    { id: 'inventarioEstoque', label: 'Livro Registro de Inventário de Estoque Anual', icon: Boxes },
    { id: 'ecacCaixaPostal', label: 'Caixa Postal e-CAC & Controle de Certidões (CND)', icon: Mail },

    // Folha de Pagamento Lite (Pró-Labore de Sócios & Empregados)
    { id: 'dashboardFolha', label: 'Painel da Folha & Pró-Labore', icon: Users },
    { id: 'calculoFolha', label: 'Cálculo de Pró-Labore & Folha Mensal (Holerites A4)', icon: Calculator },
    { id: 'colaboradores', label: 'Cadastro de Sócios (Pró-Labore) & Empregados CLT', icon: Users },
    { id: 'rescisao', label: 'Férias & Rescisão Contratual (TRCT)', icon: UserMinus },
    { id: 'provisoesFolha', label: 'Provisão Mensal de Férias e 13º Salário', icon: Layers },
    { id: 'esocial', label: 'Central eSocial Simplificado (Eventos S-1200 / S-1210)', icon: FileCode },
    { id: 'dctfWeb', label: 'DCTFWeb & Guia INSS / FGTS Digital', icon: FileCheck },
    { id: 'rubricas', label: 'Rubricas da Folha & Tabelas de INSS e IRRF', icon: Sliders },

    // Honorários do Pequeno Escritório
    { id: 'dashboardHonorarios', label: 'Painel Financeiro do Escritório Contábil', icon: DollarSign },
    { id: 'contratosHonorarios', label: 'Contratos & Mensalidades de Clientes', icon: FileText },
    { id: 'faturamentoHonorarios', label: 'Faturamento Mensal de Honorários em 1 Clique', icon: Receipt },
    { id: 'boletosHonorarios', label: 'Emissão de Recibos & Cobrança PIX de Honorários', icon: CreditCard }
  ];

  const filteredNav = allModules
    .filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase())
    )
    .map(item => {
      const reqPerm = MODULO_PERMISSOES[item.id];
      const hasPerm = !reqPerm || dbService.temPermissao(reqPerm);
      return { ...item, hasPerm };
    });

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
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 text-neutral-200 transition text-left group ${
                        !item.hasPerm ? 'opacity-65' : ''
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.hasPerm ? 'text-blue-400 group-hover:scale-110' : 'text-neutral-500'} transition-transform`} />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {!item.hasPerm && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          <Lock className="w-2.5 h-2.5" />
                          Restrito
                        </span>
                      )}
                      {item.hasPerm && (
                        <span className="text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">Abrir ↵</span>
                      )}
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
