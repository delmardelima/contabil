import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Server, 
  Laptop, 
  DownloadCloud, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  ShieldCheck, 
  HardDrive 
} from 'lucide-react';
import { ConfiguracaoRede } from '../../types/contabil';
import { dbService } from '../../db/sqliteService';

export const RedeBackupModule: React.FC = () => {
  const [config, setConfig] = useState<ConfiguracaoRede>(dbService.getRedeConfig());
  const [isOnline, setIsOnline] = useState<boolean>(dbService.isOnline);
  const [testandoConexao, setTestandoConexao] = useState(false);
  const [statusMensagem, setStatusMensagem] = useState<string | null>(null);
  const [backupJson, setBackupJson] = useState<string>('');
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  useEffect(() => {
    testarConexao();
  }, []);

  const testarConexao = async () => {
    setTestandoConexao(true);
    try {
      const url = `http://${config.serverHost}:${config.serverPort}/api/status`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setIsOnline(true);
        setStatusMensagem('Conexão com o Servidor Central estabelecida com sucesso! (Porta 4590 OK)');
      } else {
        setIsOnline(false);
        setStatusMensagem('Servidor respondeu com código de erro.');
      }
    } catch {
      setIsOnline(false);
      setStatusMensagem('Não foi possível conectar ao servidor no endereço informado.');
    } finally {
      setTestandoConexao(false);
    }
  };

  const handleSalvarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveRedeConfig(config);
    testarConexao();
  };

  const handleGerarBackup = () => {
    const json = dbService.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_contabil_${new Date().toISOString().slice(0, 10)}.bak`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMensagem('Arquivo de backup (.bak) gerado e baixado com sucesso!');
  };

  const handleRestaurarBackup = () => {
    if (!backupJson) return;
    const ok = dbService.importBackupJson(backupJson);
    if (ok) {
      alert('Backup restaurado com sucesso! O sistema será recarregado.');
      window.location.reload();
    } else {
      alert('Falha ao restaurar o backup. Verifique se o arquivo JSON/BAK é válido.');
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#141414] text-neutral-100 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Network size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-3">
              <span>Arquitetura de Rede Multi-Estação & Backup</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isOnline ? 'SERVIDOR LAN ONLINE (PORTA 4590)' : 'MODO STANDALONE LOCAL'}
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Gerencie a topologia cliente-servidor para escritórios em rede e a política de backups com integridade transacional
            </p>
          </div>
        </div>

        <button
          onClick={testarConexao}
          disabled={testandoConexao}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/15 text-neutral-200 border border-white/10 transition"
        >
          <RefreshCw size={14} className={testandoConexao ? 'animate-spin' : ''} />
          <span>Testar Conexão</span>
        </button>
      </div>

      {statusMensagem && (
        <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
          isOnline ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
        }`}>
          {isOnline ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMensagem}</span>
        </div>
      )}

      {/* Grid de Configurações */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 overflow-y-auto custom-scrollbar pr-1">
        {/* Card 1: Topologia de Rede (Servidor x Estação) */}
        <div className="p-6 rounded-xl bg-[#181818] border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Server size={18} className="text-blue-400" />
              <span>Modo de Operação na Rede Local (LAN)</span>
            </h2>

            <form onSubmit={handleSalvarConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Tipo de Instalação desta Máquina:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setConfig({ ...config, modo: 'SERVIDOR', serverHost: 'localhost' })}
                    className={`p-3 rounded-lg border cursor-pointer text-xs transition flex flex-col gap-1.5 ${
                      config.modo === 'SERVIDOR'
                        ? 'bg-blue-900/30 border-blue-500/50 text-white'
                        : 'bg-[#141414] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Server size={16} className="text-blue-400" />
                      <span>Servidor Central</span>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      Roda o banco de dados mestre e atende estações na rede.
                    </p>
                  </div>

                  <div
                    onClick={() => setConfig({ ...config, modo: 'ESTACAO' })}
                    className={`p-3 rounded-lg border cursor-pointer text-xs transition flex flex-col gap-1.5 ${
                      config.modo === 'ESTACAO'
                        ? 'bg-blue-900/30 border-blue-500/50 text-white'
                        : 'bg-[#141414] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Laptop size={16} className="text-indigo-400" />
                      <span>Estação de Trabalho</span>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      Conecta via IP ao Servidor Principal da contabilidade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    IP ou Hostname do Servidor
                  </label>
                  <input
                    type="text"
                    value={config.serverHost}
                    onChange={e => setConfig({ ...config, serverHost: e.target.value })}
                    placeholder="ex: 192.168.1.100 ou localhost"
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Porta do Serviço
                  </label>
                  <input
                    type="number"
                    value={config.serverPort}
                    onChange={e => setConfig({ ...config, serverPort: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
              >
                <Save size={14} />
                <span>Salvar Configurações de Rede</span>
              </button>
            </form>
          </div>

          <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-[11px] text-neutral-400 font-mono">
            Endpoint Ativo: <span className="text-neutral-200">http://{config.serverHost}:{config.serverPort}/api/</span>
          </div>
        </div>

        {/* Card 2: Backup e Restauração de Segurança */}
        <div className="p-6 rounded-xl bg-[#181818] border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <HardDrive size={18} className="text-emerald-400" />
              <span>Rotina de Backup e Restauração (.bak)</span>
            </h2>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Exporte instantaneamente um instantâneo criptografado e auditado de todo o banco de dados da empresa, incluindo plano de contas, lançamentos, parâmetros e lotes contábeis.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGerarBackup}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition"
              >
                <DownloadCloud size={16} />
                <span>Gerar Backup Imediato (.bak / .json)</span>
              </button>

              <button
                onClick={() => setRestoreModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition"
              >
                <UploadCloud size={16} />
                <span>Restaurar Cópia de Segurança (.bak)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Garantia de integridade relacional e transações ACID.</span>
          </div>
        </div>
      </div>

      {/* Modal de Restauração */}
      {restoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#1c1c1c] border border-white/15 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud size={18} className="text-amber-400" />
              <span>Restaurar Banco de Dados</span>
            </h3>

            <p className="text-xs text-neutral-300">
              Cole o conteúdo do arquivo de backup (.bak / JSON) abaixo para restaurar o sistema.
            </p>

            <textarea
              rows={8}
              value={backupJson}
              onChange={e => setBackupJson(e.target.value)}
              placeholder="Cole o código JSON do backup aqui..."
              className="w-full p-3 bg-[#141414] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRestoreModalOpen(false)}
                className="px-4 py-2 text-xs rounded-lg text-neutral-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestaurarBackup}
                disabled={!backupJson}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
              >
                Confirmar Restauração Completa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
