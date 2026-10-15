import React, { useState, useMemo } from 'react';
import { 
  Empresa, 
  AdministradoraCartao, 
  VendaCartaoOperadora, 
  ContaContabil 
} from '../../types/contabil';
import { dbService } from '../../db/sqliteService';
import { exportToCSV } from '../../utils/exportUtils';
import { 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Layers, 
  FileText, 
  Printer, 
  RefreshCw, 
  Filter, 
  ShieldCheck, 
  Check, 
  Building2, 
  PieChart, 
  Landmark,
  Percent,
  Calendar,
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';

interface CartoesModuleProps {
  empresa: Empresa;
  contas: ContaContabil[];
  onIntegracaoSucesso?: () => void;
  onOpenReportPreview?: (config: { titulo: string; subtitulo: string; conteudo: React.ReactNode }) => void;
}

export const CartoesModule: React.FC<CartoesModuleProps> = ({
  empresa,
  contas,
  onIntegracaoSucesso,
  onOpenReportPreview
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'VENDAS' | 'ADMINISTRADORAS' | 'RELATORIO'>('VENDAS');
  const [competencia, setCompetencia] = useState<string>(empresa.competenciaAtiva || '2026-10');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  // Estado das Administradoras
  const [administradoras, setAdministradoras] = useState<AdministradoraCartao[]>(() => {
    return dbService.getAdministradorasCartao(empresa.id);
  });

  // Estado das Vendas com Cartões
  const [vendas, setVendas] = useState<VendaCartaoOperadora[]>(() => {
    return dbService.getVendasCartao(empresa.id, competencia);
  });

  // Modal Administradora
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<AdministradoraCartao | null>(null);
  const [adminForm, setAdminForm] = useState<Partial<AdministradoraCartao>>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    taxaMDRCreditoVista: 2.20,
    taxaMDRCreditoParcelado: 3.80,
    taxaMDRDebito: 1.10,
    prazoDiasRepasseCredito: 30,
    prazoDiasRepasseDebito: 1,
    ativo: true
  });

  const contasAnaliticas = useMemo(() => contas.filter(c => c.tipo === 'A'), [contas]);

  // Totalizadores das Vendas
  const { totalVendasBruto, totalCredito, totalDebito, totalTaxasMDR, totalLiquido, totalIRRF } = useMemo(() => {
    let bruto = 0, cred = 0, deb = 0, mdr = 0, liq = 0, ir = 0;
    for (const v of vendas) {
      bruto += v.valorTotalBruto;
      cred += v.valorCredito;
      deb += v.valorDebito;
      mdr += v.taxaMDREstimada;
      liq += v.valorLiquidoReceber;
      ir += v.retencaoIRRF;
    }
    return {
      totalVendasBruto: bruto,
      totalCredito: cred,
      totalDebito: deb,
      totalTaxasMDR: mdr,
      totalLiquido: liq,
      totalIRRF: ir
    };
  }, [vendas]);

  // Salvar Administradora
  const handleSalvarAdministradora = () => {
    if (!adminForm.razaoSocial?.trim() || !adminForm.cnpj?.trim()) {
      alert('Preencha a Razão Social e o CNPJ da Administradora.');
      return;
    }

    const nova: AdministradoraCartao = {
      id: editingAdmin ? editingAdmin.id : Date.now(),
      empresaId: empresa.id,
      codigo: editingAdmin ? editingAdmin.codigo : administradoras.length + 1,
      razaoSocial: adminForm.razaoSocial.trim().toUpperCase(),
      nomeFantasia: adminForm.nomeFantasia?.trim() || adminForm.razaoSocial.trim(),
      cnpj: adminForm.cnpj.trim(),
      inscricaoEstadual: adminForm.inscricaoEstadual || 'ISENTO',
      taxaMDRCreditoVista: Number(adminForm.taxaMDRCreditoVista || 2.2),
      taxaMDRCreditoParcelado: Number(adminForm.taxaMDRCreditoParcelado || 3.8),
      taxaMDRDebito: Number(adminForm.taxaMDRDebito || 1.1),
      prazoDiasRepasseCredito: Number(adminForm.prazoDiasRepasseCredito || 30),
      prazoDiasRepasseDebito: Number(adminForm.prazoDiasRepasseDebito || 1),
      contaAtivoId: adminForm.contaAtivoId || 6,
      contaDespesaTaxaId: adminForm.contaDespesaTaxaId || 57,
      ativo: true
    };

    dbService.saveAdministradoraCartao(nova);
    setAdministradoras(dbService.getAdministradorasCartao(empresa.id));
    setShowAdminModal(false);
    setEditingAdmin(null);
    setMensagemSucesso(`Administradora "${nova.razaoSocial}" salva com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  // Excluir Administradora
  const handleExcluirAdministradora = (id: number) => {
    if (confirm('Deseja excluir esta Administradora de Cartões?')) {
      dbService.deleteAdministradoraCartao(id);
      setAdministradoras(dbService.getAdministradorasCartao(empresa.id));
    }
  };

  // Extrair Vendas das Notas Fiscais Automaticamente
  const handleRecalcularVendasNotas = () => {
    const extraidas = dbService.extrairVendasCartaoDasNotasFiscais(empresa.id, competencia);
    setVendas(extraidas);
    setMensagemSucesso(`Vendas com cartões extraídas com sucesso das notas fiscais da competência ${competencia}! (${extraidas.length} operadoras apuradas).`);
    setTimeout(() => setMensagemSucesso(''), 6000);
  };

  // Integrar Vendas com a Contabilidade
  const handleIntegrarContabil = (venda: VendaCartaoOperadora) => {
    const res = dbService.integrarVendasCartaoContabil(empresa.id, venda);
    if (res.success) {
      setVendas(dbService.getVendasCartao(empresa.id, competencia));
      setMensagemSucesso(`✅ Vendas da operadora "${venda.administradoraNome}" integradas ao Diário Contábil com sucesso (Lote nº ${res.loteId})!`);
      if (onIntegracaoSucesso) onIntegracaoSucesso();
      setTimeout(() => setMensagemSucesso(''), 7000);
    }
  };

  // Imprimir Relatório SPED Registro 1600 A4
  const handleImprimirRelatorioA4 = () => {
    if (!onOpenReportPreview) return;

    const conteudoRelatorio = (
      <div className="font-sans text-neutral-900 space-y-5 text-xs max-w-4xl mx-auto p-4">
        <div className="border-b-2 border-neutral-900 pb-3 text-center">
          <h2 className="text-base font-bold uppercase">{empresa.razaoSocial}</h2>
          <p className="text-xs text-neutral-600 font-mono">CNPJ: {empresa.cnpj} • Competência: {competencia}</p>
          <h3 className="text-xs font-bold uppercase text-neutral-800 mt-2">
            DEMONSTRATIVO DE OPERAÇÕES COM CARTÕES DE CRÉDITO E DÉBITO (SPED FISCAL REGISTRO 1600)
          </h3>
          <p className="text-[10px] text-neutral-500 italic">
            Emissão em conformidade com o Convênio ICMS 134/2016 e Art. 53 da Lei Federal nº 8.981/1995
          </p>
        </div>

        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-900 bg-neutral-100 font-bold uppercase text-[10px]">
              <th className="py-2 px-2">Operadora / Administradora</th>
              <th className="py-2 px-2">CNPJ</th>
              <th className="py-2 px-2 text-right">Cartão Crédito (R$)</th>
              <th className="py-2 px-2 text-right">Cartão Débito (R$)</th>
              <th className="py-2 px-2 text-right">Total Bruto (R$)</th>
              <th className="py-2 px-2 text-right">Taxa MDR Retida (R$)</th>
              <th className="py-2 px-2 text-right">IRRF Retido (1,5%)</th>
              <th className="py-2 px-2 text-right">Valor Líquido (R$)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {vendas.map((v, idx) => (
              <tr key={idx}>
                <td className="py-1.5 px-2 font-medium">{v.administradoraNome}</td>
                <td className="py-1.5 px-2 font-mono text-neutral-600">{v.cnpjAdministradora}</td>
                <td className="py-1.5 px-2 text-right font-mono">{v.valorCredito.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right font-mono">{v.valorDebito.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right font-mono font-bold">{v.valorTotalBruto.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right font-mono text-rose-600">{v.taxaMDREstimada.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right font-mono text-blue-600">{v.retencaoIRRF.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-700">{v.valorLiquidoReceber.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-bold border-t-2 border-neutral-900 bg-neutral-100 text-neutral-950">
              <td colSpan={2} className="py-2 px-2 text-left uppercase">TOTALIZAÇÃO GERAL DA COMPETÊNCIA</td>
              <td className="py-2 px-2 text-right font-mono">{totalCredito.toFixed(2)}</td>
              <td className="py-2 px-2 text-right font-mono">{totalDebito.toFixed(2)}</td>
              <td className="py-2 px-2 text-right font-mono">{totalVendasBruto.toFixed(2)}</td>
              <td className="py-2 px-2 text-right font-mono text-rose-600">{totalTaxasMDR.toFixed(2)}</td>
              <td className="py-2 px-2 text-right font-mono text-blue-600">{totalIRRF.toFixed(2)}</td>
              <td className="py-2 px-2 text-right font-mono text-emerald-700">{totalLiquido.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-neutral-800 pt-1">
            <div className="font-bold">{empresa.razaoSocial}</div>
            <div className="text-[10px] text-neutral-600">Contribuinte / Emitente</div>
          </div>
          <div className="border-t border-neutral-800 pt-1">
            <div className="font-bold">{empresa.contadorNome || 'Responsável Técnico'}</div>
            <div className="text-[10px] text-neutral-600">{empresa.contadorCRC || 'CRC Ativo'}</div>
          </div>
        </div>
      </div>
    );

    onOpenReportPreview({
      titulo: 'DEMONSTRATIVO DE OPERAÇÕES COM CARTÕES (SPED REGISTRO 1600)',
      subtitulo: `Competência ${competencia} • Convênio ICMS 134/2016 e Lei nº 8.981/95`,
      conteudo: conteudoRelatorio
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141414] text-neutral-200 overflow-hidden select-none">
      {/* Top Banner de Navegação */}
      <div className="px-5 py-3 bg-[#181818] border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Gestão de Administradoras & Vendas com Cartões</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-medium">SPED Registro 1600</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Controle de operadoras (Cielo, Rede, Stone, PagSeguro), cálculo automático de taxas MDR e conciliação fiscal e contábil.
            </p>
          </div>
        </div>

        {/* Abas e Filtro de Competência */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-400">Competência:</span>
            <input
              type="month"
              value={competencia}
              onChange={(e) => {
                const val = e.target.value;
                setCompetencia(val);
                setVendas(dbService.getVendasCartao(empresa.id, val));
              }}
              className="bg-transparent text-neutral-100 font-mono font-semibold outline-none cursor-pointer text-xs"
            />
          </div>

          <div className="flex items-center space-x-1 bg-[#121212] p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setAbaAtiva('VENDAS')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                abaAtiva === 'VENDAS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Vendas da Competência
            </button>

            <button
              onClick={() => setAbaAtiva('ADMINISTRADORAS')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                abaAtiva === 'ADMINISTRADORAS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Administradoras ({administradoras.length})
            </button>
          </div>
        </div>
      </div>

      {/* Banner de Mensagem de Sucesso */}
      {mensagemSucesso && (
        <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso('')} className="text-emerald-500 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 1: MOVIMENTAÇÃO DE VENDAS COM CARTÕES */}
      {/* ============================================================== */}
      {abaAtiva === 'VENDAS' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* KPI Cards de Movimentação */}
          <div className="px-5 py-3 bg-[#161616] border-b border-white/5 grid grid-cols-5 gap-3 flex-shrink-0 text-xs">
            <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
              <span className="text-[10px] text-neutral-400 block">Total Vendas Brutas</span>
              <span className="text-sm font-bold text-neutral-100 font-mono mt-0.5 block">
                R$ {totalVendasBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
              <span className="text-[10px] text-neutral-400 block">Cartão de Crédito</span>
              <span className="text-sm font-bold text-blue-400 font-mono mt-0.5 block">
                R$ {totalCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
              <span className="text-[10px] text-neutral-400 block">Cartão de Débito</span>
              <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 block">
                R$ {totalDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
              <span className="text-[10px] text-neutral-400 block">Taxas MDR Retidas</span>
              <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">
                - R$ {totalTaxasMDR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#1c1c1c] border border-white/5 rounded-lg p-2.5">
              <span className="text-[10px] text-neutral-400 block">Líquido a Receber</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Barra de Ações Rápidas */}
          <div className="px-5 py-2.5 bg-[#181818] border-b border-white/10 flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRecalcularVendasNotas}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded font-medium flex items-center space-x-1.5 transition text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Auto-Extrair das Notas Fiscais ({competencia})</span>
              </button>

              <button
                onClick={handleImprimirRelatorioA4}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded font-medium flex items-center space-x-1.5 transition text-xs"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Imprimir Demonstrativo SPED 1600 A4</span>
              </button>
            </div>

            <button
              onClick={() => {
                exportToCSV(vendas.map(v => ({
                  Operadora: v.administradoraNome,
                  CNPJ: v.cnpjAdministradora,
                  Credito: v.valorCredito,
                  Debito: v.valorDebito,
                  TotalBruto: v.valorTotalBruto,
                  TaxaMDR: v.taxaMDREstimada,
                  IRRF: v.retencaoIRRF,
                  ValorLiquido: v.valorLiquidoReceber,
                  Status: v.status
                })), `vendas_cartao_${competencia}`);
              }}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 rounded font-medium flex items-center space-x-1.5 transition text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Tabela de Vendas com Cartões */}
          <div className="flex-1 overflow-auto custom-scrollbar p-5">
            <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#202020] border-b border-white/10 text-neutral-400 font-medium uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Administradora / Operadora</th>
                    <th className="py-2.5 px-3 w-36">CNPJ</th>
                    <th className="py-2.5 px-3 w-32 text-right">Crédito (R$)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Débito (R$)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Total Bruto (R$)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Taxa MDR (R$)</th>
                    <th className="py-2.5 px-3 w-28 text-right">IRRF (1,5%)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Líquido a Receber</th>
                    <th className="py-2.5 px-3 w-28 text-center">Status</th>
                    <th className="py-2.5 px-3 w-36 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[12px]">
                  {vendas.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-neutral-200">
                        {item.administradoraNome}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">{item.cnpjAdministradora}</td>
                      <td className="py-2.5 px-3 text-right text-blue-400 font-medium">
                        {item.valorCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-cyan-400 font-medium">
                        {item.valorDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-neutral-100">
                        {item.valorTotalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-400 font-medium">
                        {item.taxaMDREstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-400 font-medium">
                        {item.retencaoIRRF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                        {item.valorLiquidoReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'INTEGRADO'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'CONCILIADO'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <button
                          disabled={item.status === 'INTEGRADO'}
                          onClick={() => handleIntegrarContabil(item)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-medium transition disabled:opacity-40"
                        >
                          {item.status === 'INTEGRADO' ? 'Integrado ✓' : 'Integrar Lote'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: CADASTRO DE ADMINISTRADORAS DE CARTÕES */}
      {/* ============================================================== */}
      {abaAtiva === 'ADMINISTRADORAS' && (
        <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200">Administradoras de Cartões de Crédito e Débito</h3>
              <p className="text-[11px] text-neutral-400">Parâmetros de taxas MDR e contas contábeis de contrapartida</p>
            </div>

            <button
              onClick={() => {
                setEditingAdmin(null);
                setAdminForm({
                  razaoSocial: '',
                  nomeFantasia: '',
                  cnpj: '',
                  taxaMDRCreditoVista: 2.20,
                  taxaMDRCreditoParcelado: 3.80,
                  taxaMDRDebito: 1.10,
                  prazoDiasRepasseCredito: 30,
                  prazoDiasRepasseDebito: 1,
                  ativo: true
                });
                setShowAdminModal(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center space-x-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Administradora</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 overflow-y-auto custom-scrollbar flex-1">
            {administradoras.map((adm) => (
              <div key={adm.id} className="bg-[#181818] border border-white/10 rounded-xl p-4 shadow space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-neutral-100">{adm.razaoSocial}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">CNPJ: {adm.cnpj} • Cód. {adm.codigo}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingAdmin(adm);
                        setAdminForm(adm);
                        setShowAdminModal(true);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-blue-400 transition"
                      title="Editar Administradora"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExcluirAdministradora(adm.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 transition"
                      title="Excluir Administradora"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-[#121212] p-2.5 rounded-lg border border-white/5 font-mono">
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Crédito à Vista</span>
                    <span className="text-emerald-400 font-bold">{adm.taxaMDRCreditoVista.toFixed(2)}% (D+{adm.prazoDiasRepasseCredito})</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Crédito Parcelado</span>
                    <span className="text-blue-400 font-bold">{adm.taxaMDRCreditoParcelado.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Débito</span>
                    <span className="text-cyan-400 font-bold">{adm.taxaMDRDebito.toFixed(2)}% (D+{adm.prazoDiasRepasseDebito})</span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Conta Ativo (A Receber):</span>
                    <span className="font-mono text-neutral-200">1.01.01.03 - Administradoras de Cartão</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Conta Despesa MDR:</span>
                    <span className="font-mono text-neutral-200">5.01.02.15 - Despesas com Taxas Cartão</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Cadastro/Edição de Administradora */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-semibold text-neutral-100 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>{editingAdmin ? 'Editar Administradora' : 'Cadastrar Nova Administradora de Cartões'}</span>
              </h3>
              <button onClick={() => setShowAdminModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Razão Social da Operadora:</label>
                  <input
                    type="text"
                    placeholder="Ex: CIELO S.A."
                    value={adminForm.razaoSocial}
                    onChange={(e) => setAdminForm({ ...adminForm, razaoSocial: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 uppercase outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Nome Fantasia / Marca:</label>
                  <input
                    type="text"
                    placeholder="Ex: Cielo"
                    value={adminForm.nomeFantasia}
                    onChange={(e) => setAdminForm({ ...adminForm, nomeFantasia: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">CNPJ da Administradora:</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={adminForm.cnpj}
                    onChange={(e) => setAdminForm({ ...adminForm, cnpj: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 font-mono outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Inscrição Estadual:</label>
                  <input
                    type="text"
                    placeholder="Isento ou nº estadual"
                    value={adminForm.inscricaoEstadual}
                    onChange={(e) => setAdminForm({ ...adminForm, inscricaoEstadual: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-neutral-100 outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#141414] rounded-lg border border-white/5 space-y-2">
                <span className="font-semibold text-neutral-300 block text-[11px] uppercase tracking-wider">
                  Taxas MDR Contratadas (% Comissão)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-0.5">Crédito à Vista (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adminForm.taxaMDRCreditoVista}
                      onChange={(e) => setAdminForm({ ...adminForm, taxaMDRCreditoVista: Number(e.target.value) })}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded px-2 py-1 text-emerald-400 font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-0.5">Crédito Parcelado (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adminForm.taxaMDRCreditoParcelado}
                      onChange={(e) => setAdminForm({ ...adminForm, taxaMDRCreditoParcelado: Number(e.target.value) })}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded px-2 py-1 text-blue-400 font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-0.5">Débito (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adminForm.taxaMDRDebito}
                      onChange={(e) => setAdminForm({ ...adminForm, taxaMDRDebito: Number(e.target.value) })}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded px-2 py-1 text-cyan-400 font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowAdminModal(false)}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarAdministradora}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
              >
                Salvar Administradora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
