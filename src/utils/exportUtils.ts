/**
 * Utilitários de Exportação Editorial: CSV (compatível com Excel PT-BR), HTML e Texto
 */

export function exportToCSV(
  filename: string,
  arg1: string[] | (string | number)[][],
  arg2: string[] | (string | number)[][]
) {
  // Adiciona BOM UTF-8 (\uFEFF) para que o Microsoft Excel no Windows reconheça acentuação correta
  const BOM = '\uFEFF';

  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  // Suporte flexível para (filename, headers, rows) ou (filename, rows, headers)
  if (Array.isArray(arg1) && arg1.length > 0 && typeof arg1[0] === 'string' && !Array.isArray(arg1[0])) {
    headers = arg1 as string[];
    rows = (arg2 || []) as (string | number)[][];
  } else {
    rows = (arg1 || []) as (string | number)[][];
    headers = (arg2 || []) as string[];
  }
  
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(';'),
    ...rows.map(row => 
      row.map(cell => {
        if (typeof cell === 'number') {
          return cell.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return `"${String(cell ?? '').replace(/"/g, '""')}"`;
      }).join(';')
    )
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const finalFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToDOCX(filename: string, htmlContent: string) {
  // Exporta documento formatado para o Microsoft Word (.doc)
  const header = `<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${filename}</title><style>body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; padding: 20mm; }</style></head><body>`;
  const footer = `</body></html>`;
  const source = header + htmlContent + footer;

  const blob = new Blob([source], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const finalFilename = filename.toLowerCase().endsWith('.doc') ? filename : `${filename}.doc`;
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
