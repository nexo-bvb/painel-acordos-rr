export interface Acordo {
  id?: string;
  [key: string]: any; // Para acomodar diferentes colunas do Excel
}

export interface UseAcordosReturn {
  acordos: Acordo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
