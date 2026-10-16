# Contábil Studio Pro 🚀

> ERP Contábil, Escrita Fiscal, Departamento Pessoal (Folha) e Gestão de Honorários com interface de alta densidade inspirada no padrão Windows Fluent/MDI e conformidade com as Normas Brasileiras de Contabilidade (CFC / NBC TG) e SPED / eSocial.

---

## 📌 Visão Geral

O **Contábil Studio Pro** é uma solução completa desenvolvida em **React 18**, **TypeScript**, **Tailwind CSS** e motor contábil em tempo real. Projetado para escritórios de contabilidade e departamentos fiscais que exigem agilidade de teclado (*zero-mouse*), rastreabilidade de partidas dobradas e atendimento a exigências fiscais federais, estaduais e municipais.

---

## 🏛️ Módulos do Sistema

### 1. 📊 Contabilidade Geral (CT)
- **Partidas Dobradas:** Lançamentos em partidas simples (1D:1C) e compostas/múltiplas (1:N, N:M), estorno automático em 1 clique e gestão de lotes (`CTLOTE`).
- **Demonstrações Oficiais:** Balancete de Verificação (até 5 graus), Balanço Patrimonial estruturado, D.R.E. dedutiva com análise vertical/horizontal, D.L.P.A. e D.F.C.
- **Encerramento de Exercício:** Apuração do Resultado do Exercício (`ARE`), constituição de Reserva Legal obrigatória (5%), destinação de lucros/dividendos e emissão de atas em formato A4.
- **Pronunciamentos Técnicos Avançados:** 
  - Ajuste a Valor Presente (`CPC 12`)
  - Ativo Imobilizado e Depreciação (`CPC 27`)
  - Teste de Recuperabilidade / *Impairment* (`CPC 01`)
  - Ativos Intangíveis (`CPC 04`)
  - Arrendamento Mercantil / *Leasing* (`CPC 06 R2`)
  - Ativos Biológicos (`CPC 29`) e Contratos de Construção / PoC (`CPC 47`)
  - Consolidação e Equivalência Patrimonial (`CPC 18 / CPC 36`)
  - *Hedge Accounting* e Instrumentos Financeiros (`CPC 48`)
- **Exportações SPED:** Geração e validação de leiaute do **SPED ECD** e **SPED ECF** (Blocos J, L, M, N, P, V, X e Y).

### 2. 🧾 Escrita Fiscal (EF)
- **Importação de Documentos:** Importador em lote de XML de NF-e (Modelo 55), NFC-e (Modelo 65), CT-e (Modelo 57), MDF-e (Modelo 58) e emissão de NFS-e Nacional / DPS.
- **Livros Fiscais Oficiais:** Registro de Entradas (Mod. 1), Registro de Saídas (Mod. 2) e Livro Registro de Apuração do ICMS/IPI (Mod. 9).
- **Tributação e Regimes:**
  - Simples Nacional: Apuração PGDAS-D, cálculo do Fator R e opção pelo Regime de Caixa.
  - Lucro Presumido e Lucro Real: IRPJ, CSLL, PIS e COFINS (Cumulativo e Não-Cumulativo).
  - ICMS-ST, MVA Ajustada, DIFAL Consumidor Final (EC 87/15 & LC 190/22) e CIAP (Bloco G 1/48 avos).
  - Controle de Crédito Presumido do Agronegócio e IPI Exportação.
- **Obrigações Acessórias:** EFD-Contribuições, EFD-Reinf (Série R-1000, R-2000 e R-4000), DCTF Mensal tradicional e PER/DCOMP Web.

### 3. 👥 Departamento Pessoal & Folha (DP / FO)
- **Cálculo da Folha:** Folha de pagamento mensal, pró-labore, horas extras (50%/100%), adicional noturno, insalubridade, periculosidade e cálculo progressivo de INSS/IRRF.
- **Ciclo Laboral:**
  - Férias individuais e coletivas com 1/3 constitucional e abono pecuniário.
  - 13º Salário (1ª e 2ª parcelas) com deduções e encargos.
  - Rescisão Contratual com emissão do Termo Homologatório TRCT (Portaria MTE nº 1.057/2012).
- **eSocial & SST:**
  - Eventos Periódicos: S-1200 (Remuneração) e S-1210 (Pagamentos).
  - Trabalhador Sem Vínculo (TSVE): S-2300 e S-2399.
  - Saúde e Segurança do Trabalho: S-2210 (CAT), S-2220 (Monitoramento Biológico / ASO) e S-2240 (Condições Ambientais / PPP Eletrônico).
  - Fechamento S-1299 e geração de guias unificadas da DCTFWeb.

### 4. 💼 Gestão de Honorários (HO)
- **Gestão de Contratos (MRR):** Parametrização de mensalidades, cobrança de 13º honorário e reajuste automático por índices (IPCA, IGP-M, Salário Mínimo).
- **Faturamento e Franquias:** Cobrança por volume excedente de colaboradores apurados ou notas fiscais escrituradas.
- **Cobrança Integrada:** Emissão de boletos bancários com linha digitável Febraban, QR Code PIX dinâmico e conciliação bancária automática com integração ao Diário Geral.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com classes utilitárias para interfaces acrílicas (*Fluent Design*)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Armazenamento e Estado:** Camada de persistência local simulando banco relacional ACID (SQLite/Storage WAL) com suporte a exportação e importação de snapshots completos em JSON/CSV.
- **Visualização para Impressão:** Engine de diagramação de folhas A4 físicas (Retrato e Paisagem) pronta para impressoras e exportação para PDF e Word (.doc).

---

## ⌨️ Atalhos de Teclado (Zero-Mouse)

| Atalho | Ação |
| :--- | :--- |
| `Ctrl + K` | Abrir Command Palette de rotinas e contas |
| `Alt + 1` | Alternar para o módulo **Contabilidade** |
| `Alt + 2` | Alternar para o módulo **Escrita Fiscal** |
| `Alt + 3` | Alternar para o módulo **Folha de Pagamento** |
| `Alt + 4` | Alternar para o módulo **Honorários** |
| `F2` | Abrir Lançamentos Contábeis / Busca rápida de contas |
| `F3` | Abrir Plano de Contas |
| `F4` | Abrir Balancete de Verificação |
| `Ctrl + W` | Fechar aba MDI ativa |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes `npm`, `yarn` ou `pnpm`

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/contabil-studio-pro.git

# Acesse a pasta do projeto
cd contabil-studio-pro

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra no navegador em `http://localhost:5173` (ou a porta informada pelo terminal).

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte `LICENSE` para mais informações.