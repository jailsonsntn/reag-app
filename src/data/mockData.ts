// Arquivo de mocks mínimo e válido para desenvolvimento local
import { Reagendamento } from '@/types/reagendamento';

export const tecnicos: string[] = ['ADILSON', 'ADRIANO', 'ANDERSON', 'BRUNO'];

export const produtos: string[] = ['REFRIGERADOR', 'SECADORA DE ROUPAS', 'MICROONDAS'];

export const pecas: string[] = ['Compressor', 'Roldana', 'Placa interface'];

export const reagendamentos: Reagendamento[] = [
  {
    id: '1',
    os: '7014245223',
    sku: 'CRD37EBANA',
    produto: 'REFRIGERADOR',
    tecnico: 'ADILSON',
    data: '2025-01-02',
    teveReagendamento: true,
    motivo: 'VCP',
    codigoPeca: 'W10798744',
    tipo: 'FUNCIONAL',
    nomePeca: 'Compressor',
  },
  {
    id: '2',
    os: '7014246154',
    sku: 'BRM44HKANA',
    produto: 'REFRIGERADOR',
    tecnico: 'ADRIANO',
    data: '2025-01-02',
    teveReagendamento: false,
    motivo: '',
    codigoPeca: '',
    tipo: '',
    nomePeca: '',
  },
];
