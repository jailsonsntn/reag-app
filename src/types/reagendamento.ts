export interface Reagendamento {
  id: string;
  os: string | number;
  sku: string;
  produto: string;
  tecnico: string;
  data: string;
  teveReagendamento: boolean;
  motivo: string;
  codigoPeca: string | number;
  tipo: string;
  nomePeca: string;
}

export interface Tecnico {
  id: string;
  nome: string;
  especialidade?: string;
  ativo: boolean;
}

export interface Produto {
  sku: string;
  nome: string;
  categoria: string;
  descricao?: string;
}

export interface Peca {
  codigo: string;
  nome: string;
  tipo: 'FUNCIONAL' | 'ESTETICA';
  disponivel: boolean;
}

export type MotivoReagendamento = {
  codigo: 'VCP' | 'NTN' | 'ENL';
  descricao: string;
};

export interface DashboardStats {
  totalOS: number;
  reagendamentos: number;
  pendentes: number;
  concluidas: number;
  motivosMaisComuns: Array<{
    motivo: string;
    quantidade: number;
  }>;
  tecnicosMaisAtivos: Array<{
    tecnico: string;
    quantidade: number;
  }>;
}
