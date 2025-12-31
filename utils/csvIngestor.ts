export interface CleanClientData {
  id: string;
  name: string;
  currentRate: number;
  ltv: number;
  notes: string;
  lastContact: string;
}

const identifyColumn = (headers: string[], possibleNames: string[]): number => {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  return lowerHeaders.findIndex(h => possibleNames.some(name => h.includes(name)));
};

export const parseCSV = (csvText: string): CleanClientData[] => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/["\r]/g, ''));
  
  const nameIdx = identifyColumn(headers, ['name', 'client', 'borrower', 'customer']);
  const rateIdx = identifyColumn(headers, ['rate', 'int', 'interest']);
  const ltvIdx = identifyColumn(headers, ['ltv', 'loan to value', 'equity']);
  const noteIdx = identifyColumn(headers, ['note', 'comment', 'description', 'status']);
  const dateIdx = identifyColumn(headers, ['date', 'contact', 'last']);

  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.replace(/["\r]/g, '').trim());
    
    if (values.length < headers.length) return null;

    const parseNumber = (val: string) => parseFloat(val?.replace(/[^0-9.]/g, '') || '0');

    return {
      id: `imported-${index}`,
      name: values[nameIdx] || `Client ${index + 1}`,
      currentRate: rateIdx !== -1 ? parseNumber(values[rateIdx]) : 4.5,
      ltv: ltvIdx !== -1 ? parseNumber(values[ltvIdx]) : 80,
      notes: noteIdx !== -1 ? values[noteIdx] : "No notes detected.",
      lastContact: dateIdx !== -1 ? values[dateIdx] : "Unknown"
    };
  }).filter((item): item is CleanClientData => item !== null);
};
