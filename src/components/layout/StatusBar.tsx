import React from 'react';
import { Empresa } from '../../types/contabil';
import { Database, ShieldCheck, Scale, Cpu } from 'lucide-react';

interface StatusBarProps {
  empresa: Empresa;
  totalLancamentos: number;
  totalDebitos: number;
  totalCreditos: number;
  diferencaDxC: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  empresa,
  totalLancamentos,
  totalDebitos,
  totalCreditos,
  diferencaDxC
}) => {
  return (
    <footer className="h-6 bg-[#161616] border-t border-white/10 flex items-center justify-between px-3 text-[11px] text-neutral-400 select-none z-50">
      {/* Esquerda: Empresa + Banco Local */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 text-neutral-300">
          <Database className="w-3 h-3 text-blue-400" />
          <span>SQLite Local WAL • 100% Offline</span>
        </div>
        <span className="text-neutral-600">|</span>
        <div className="flex items-center space-x-1">
          <span>Cliente: <strong className="text-neutral-200">{empresa.nomeFantasia || empresa.razaoSocial}</strong></span>
        </div>
        <span className="text-neutral-600">|</span>
        <div className="flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Contador: {empresa.contadorCRC}</span>
        </div>
      </div>

      {/* Centro: Dicas de Teclado Zero-Mouse */}
      <div className="hidden md:flex items-center space-x-2 text-[10px] text-neutral-500">
        <span>Enter: Avançar</span>
        <span>•</span>
        <span>F11: Contas Recentes</span>
        <span>•</span>
        <span>Ctrl+K: Comandos</span>
        <span>•</span>
        <span>Esc: Cancelar</span>
      </div>

      {/* Direita: Total de Lançamentos e Equilíbrio DxC */}
      <div className="flex items-center space-x-3 font-mono">
        <div>
          <span>Partidas: <strong className="text-neutral-200">{totalLancamentos}</strong></span>
        </div>
        <span className="text-neutral-600">|</span>
        <div>
          <span>Débitos: <strong className="text-blue-400">R$ {totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
        </div>
        <span className="text-neutral-600">|</span>
        <div>
          <span>Créditos: <strong className="text-indigo-400">R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
        </div>
        <span className="text-neutral-600">|</span>
        <div className={`flex items-center space-x-1 font-semibold ${diferencaDxC === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          <Scale className="w-3 h-3" />
          <span>DxC: {diferencaDxC === 0 ? '0,00' : diferencaDxC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </footer>
  );
};
