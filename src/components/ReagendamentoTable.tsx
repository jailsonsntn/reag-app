'use client';

import { useState } from 'react';
import { Edit, Eye, Trash2, ArrowUpDown } from 'lucide-react';
import { Reagendamento } from '@/types/reagendamento';

interface ReagendamentoTableProps {
  data: Reagendamento[];
}

type SortKey = keyof Reagendamento;
type SortDirection = 'asc' | 'desc';

export default function ReagendamentoTable({ data }: ReagendamentoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('data');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getMotivoColor = (motivo: string) => {
    switch (motivo) {
      case 'VCP':
        return 'bg-orange-100 text-orange-800';
      case 'NTN':
        return 'bg-red-100 text-red-800';
      case 'ENL':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'FUNCIONAL' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const SortableHeader = ({ children, sortKey: key }: { children: React.ReactNode; sortKey: SortKey }) => (
    <th
      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50/60"
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      </div>
    </th>
  );

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
      <div className="px-5 py-4">
        <h3 className="text-lg leading-6 font-semibold text-gray-900">
          Reagendamentos ({data.length})
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Lista de todas as ordens de serviço com reagendamentos
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr>
              <SortableHeader sortKey="os">OS</SortableHeader>
              <SortableHeader sortKey="sku">SKU</SortableHeader>
              <SortableHeader sortKey="produto">Produto</SortableHeader>
              <SortableHeader sortKey="tecnico">Técnico</SortableHeader>
              <SortableHeader sortKey="data">Data</SortableHeader>
              <SortableHeader sortKey="motivo">Motivo</SortableHeader>
              <SortableHeader sortKey="codigoPeca">Código Peça</SortableHeader>
              <SortableHeader sortKey="tipo">Tipo</SortableHeader>
              <SortableHeader sortKey="nomePeca">Nome da Peça</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/80">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.os}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.produto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.tecnico}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.data}
                </td>
                {/* removed display of teveReagendamento as requested */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getMotivoColor(item.motivo)}`}>
                    {item.motivo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.codigoPeca || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getTipoColor(item.tipo)}`}>
                    {item.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.nomePeca || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-700">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-700">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum reagendamento encontrado.</p>
        </div>
      )}
    </div>
  );
}
