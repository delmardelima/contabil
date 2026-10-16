import React, { useEffect } from 'react';
import { Empresa, ModuloSistema, SessaoUsuario } from '../../types/contabil';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Moon, 
  Sun, 
  Minus, 
  Square, 
  X,
  Command,
  BookOpen,
  Receipt,
  Users,
  CreditCard,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface TitleBarProps {
  empresa: Empresa;
  empresas: Empresa[];
  onSelectEmpresa: (id: number) => void;
  diferencaDxC: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  moduloAtivo: ModuloSistema;
  onSelectModulo: (mod: ModuloSistema) => void;
  sessao?: SessaoUsuario | null;
  onLogout?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  empresa,
  empresas,
  onSelectEmpresa,
  diferencaDxC,
  isDark,
  onToggleTheme,
  onOpenCommandPalette,
  moduloAtivo,
  onSelectModulo,
  sessao,
  onLogout
}) => {
  // Atalhos Globais Alt+1 a Alt+4 para troca rápida de módulo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          onSelectModulo('contabilidade');
        } else if (e.key === '2') {
          e.preventDefault();
          onSelectModulo('escrita');
        } else if (e.key === '3') {
          e.preventDefault();
          onSelectModulo('folha');
        } else if (e.key === '4') {
          e.preventDefault();
          onSelectModulo('honorarios');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectModulo]);

  const modulos = [
    { id: 'contabilidade' as ModuloSistema, label: 'Contabilidade', shortcut: 'Alt+1', icon: BookOpen, color: 'from-blue-600 to-indigo-600', activeBg: 'bg-blue-600 text-white shadow-blue-900/40' },
    { id: 'escrita' as ModuloSistema, label: 'Escrita Fiscal', shortcut: 'Alt+2', icon: Receipt, color: 'from-amber-600 to-orange-600', activeBg: 'bg-amber-600 text-white shadow-amber-900/40' },
    { id: 'folha' as ModuloSistema, label: 'Folha / DP', shortcut: 'Alt+3', icon: Users, color: 'from-emerald-600 to-teal-600', activeBg: 'bg-emerald-600 text-white shadow-emerald-900/40' },
    { id: 'honorarios' as ModuloSistema, label: 'Honorários', shortcut: 'Alt+4', icon: CreditCard, color: 'from-purple-600 to-pink-600', activeBg: 'bg-purple-600 text-white shadow-purple-900/40' }
  ];

  return (
    <header className="no-print h-10 bg-[#181818] border-b border-white/10 flex items-center justify-between px-3 select-none text-xs text-neutral-300 z-50" data-no-print="true">
      {/* Esquerda: Logo + Seletor de Módulos Oficiais */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
            C
          </div>
          <span className="font-semibold text-neutral-100 tracking-wide">Contábil Studio</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded font-mono font-medium">ERP Pro</span>
        </div>

        {/* Separador */}
        <div className="h-4 w-px bg-white/10" />

        {/* 4 Módulos Oficiais da Suíte Contábil */}
        <div className="flex items-center bg-neutral-900/90 rounded-lg p-0.5 border border-white/10 space-x-0.5">
          {modulos.map(m => {
            const Icon = m.icon;
            const isActive = moduloAtivo === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectModulo(m.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isActive ? `${m.activeBg} shadow-sm font-semibold` : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                }`}
                title={`Alternar para ${m.label} (${m.shortcut})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isActive ? 'bg-black/20 text-white/90' : 'text-neutral-500'}`}>
                  {m.shortcut}
                </span>
              </button>
            );
          })}
        </div>

        {/* Separador */}
        <div className="h-4 w-px bg-white/10" />

        {/* Seletor Rápido de Empresa Ativa */}
        <div className="flex items-center space-x-1.5 bg-neutral-900/80 px-2 py-1 rounded border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <select
            value={empresa.id}
            onChange={(e) => onSelectEmpresa(Number(e.target.value))}
            className="bg-transparent text-neutral-200 outline-none cursor-pointer max-w-[200px] truncate text-xs font-medium"
          >
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id} className="bg-neutral-800 text-neutral-200">
                {emp.codigo.toString().padStart(3, '0')} - {emp.razaoSocial}
              </option>
            ))}
          </select>
        </div>

        {/* Competência / Exercício */}
        <div className="hidden xl:flex items-center space-x-1.5 bg-neutral-900/60 px-2 py-1 rounded border border-white/5 text-neutral-400 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>Comp: <strong className="text-neutral-200 font-mono">{empresa.competenciaAtiva}</strong></span>
        </div>
      </div>

      {/* Centro: Command Palette shortcut button */}
      <div className="flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 px-3 py-1 bg-neutral-900/90 hover:bg-neutral-800 rounded-md border border-white/10 text-neutral-400 hover:text-neutral-200 transition-all text-xs"
          title="Abrir Command Palette (Ctrl+K)"
        >
          <Command className="w-3 h-3 text-blue-400" />
          <span>Buscar comandos ou rotinas...</span>
          <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10 text-neutral-300">Ctrl+K</kbd>
        </button>
      </div>

      {/* Direita: Monitor DxC + Usuário Autenticado + Logout + Theme + Window Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Monitor DxC em Tempo Real */}
        <div 
          className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium transition-colors ${
            diferencaDxC === 0 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
          }`}
          title="Diferença Débito x Crédito (Controle de Partidas Dobradas)"
        >
          {diferencaDxC === 0 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>DxC: R$ 0,00</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>DxC: R$ {diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </>
          )}
        </div>

        {/* Badge do Usuário Autenticado e Botão de Logout */}
        {sessao && (
          <div className="hidden lg:flex items-center space-x-1.5 bg-neutral-900/80 px-2 py-0.5 rounded border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-medium text-neutral-200 max-w-[120px] truncate">
              {sessao.usuarioNome}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
              {sessao.perfil}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-1 p-0.5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded transition"
                title="Encerrar Sessão (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Botão Dark/Light */}
        <button
          onClick={onToggleTheme}
          className="p-1 hover:bg-white/10 rounded transition-colors text-neutral-400 hover:text-white"
          title={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Window Controls */}
        <div className="flex items-center space-x-1 ml-1">
          <button className="w-7 h-6 hover:bg-white/10 flex items-center justify-center rounded transition-colors text-neutral-400 hover:text-white">
            <Minus className="w-3 h-3" />
          </button>
          <button className="w-7 h-6 hover:bg-white/10 flex items-center justify-center rounded transition-colors text-neutral-400 hover:text-white">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button className="w-7 h-6 hover:bg-red-600 flex items-center justify-center rounded transition-colors text-neutral-400 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
