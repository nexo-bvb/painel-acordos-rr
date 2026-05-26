import { useState, useEffect } from 'react';
import type { Acordo, UseAcordosReturn } from '../types/acordos';

// Função para parsear corretamente linhas CSV com vírgulas dentro de aspas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(field => field.replace(/^"|"$/g, ''));
};

// Função para converter data do formato MM/DD/AAAA ou MM/DD/AA para dd/mm/aaaa
const formatDate = (dateString: string): string => {
  if (!dateString || dateString === '-' || dateString.toLowerCase().includes('indeterminado')) {
    return dateString;
  }
  
  // Tenta parsear data no formato MM/DD/AAAA
  let dateMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    // Retorna no formato dd/mm/aaaa
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  
  // Tenta parsear data no formato MM/DD/AA (ano de 2 dígitos)
  dateMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    // Converte ano de 2 dígitos para 4 dígitos (assumindo anos 2000+)
    const fullYear = parseInt(year) <= 30 ? `20${year}` : `19${year}`;
    // Retorna no formato dd/mm/aaaa
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${fullYear}`;
  }
  
  return dateString;
};

export const useAcordos = (): UseAcordosReturn => {
  const [acordos, setAcordos] = useState<Acordo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadAcordos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar o arquivo CSV
      const response = await fetch('/Acordos_sem_onus_Roraima.csv');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar arquivo: ${response.status}`);
      }

      const csvText = await response.text();
      
          // Processar o CSV
          const lines = csvText.split('\n').filter(line => line.trim());
          
          if (lines.length > 0) {
            const headers = parseCSVLine(lines[0]);
            const rows = lines.slice(1);
            
            const acordosData: Acordo[] = rows.map((row, index) => {
              const acordo: Acordo = {
                id: `acordo-${index + 1}`,
              };
              
              // Dividir a linha em campos, tratando vírgulas dentro de aspas
              const fields = parseCSVLine(row);
              
              headers.forEach((header, headerIndex) => {
                if (header && fields[headerIndex] !== undefined) {
                  // Limpar nomes das colunas para serem válidos como propriedades
                  const cleanHeader = header.toString().trim()
                    .replace(/\s+/g, '_')
                    .replace(/[()]/g, '')
                    .replace(/[\/]/g, '_')
                    .toLowerCase();
                  
                  // Formatar datas se o campo contiver "data" ou "vigência"
                  const fieldValue = fields[headerIndex];
                  const headerLower = header.toLowerCase();
                  if (headerLower.includes('data') || headerLower.includes('vigência') || headerLower.includes('vigencia') || 
                      headerLower.includes('assinatura') || headerLower.includes('publicação') || headerLower.includes('publicacao')) {
                    acordo[cleanHeader] = formatDate(fieldValue);
                  } else {
                    acordo[cleanHeader] = fieldValue;
                  }
                  
                }
              });
              
              
              
              return acordo;
            });
            
            // Ordenar por ano (decrescente - de 2025 para baixo)
            acordosData.sort((a, b) => {
              const anoA = parseInt(a.ano || '0');
              const anoB = parseInt(b.ano || '0');
              return anoB - anoA; // Ordem decrescente
            });
        
        setAcordos(acordosData);
      }
      
    } catch (err) {
      console.error('Erro ao carregar acordos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await loadAcordos();
  };

  useEffect(() => {
    loadAcordos();
  }, []);

  return {
    acordos,
    loading,
    error,
    refetch,
  };
};
