'use client';

import { X } from 'lucide-react';
import { Tecnico, MotivoReagendamento } from '@/types/reagendamento';

interface FilterPanelProps {
  tecnicos: string[];
  motivosReagendamento: string[];
  selectedTecnico: string;
  setSelectedTecnico: (value: string) => void;
  selectedMotivo: string;
  setSelectedMotivo: (value: string) => void;
  selectedTipo: string;
  setSelectedTipo: (value: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (value: { start: string; end: string }) => void;
  onClear: () => void;
}

export default function FilterPanel({
  tecnicos,
  motivosReagendamento,
  selectedTecnico,
  setSelectedTecnico,
  selectedMotivo,
  setSelectedMotivo,
  selectedTipo,
  setSelectedTipo,
  dateRange,
  setDateRange,
  onClear
}: FilterPanelProps) {
  return (
    <div className="rounded-2xl p-6 mb-6 border border-gray-200/60 bg-white/80 backdrop-blur shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <X className="h-4 w-4" />
          <span>Limpar filtros</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Técnico
          </label>
          <select
            value={selectedTecnico}
            onChange={(e) => setSelectedTecnico(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
          >
            <option value="">Todos os técnicos</option>
            {tecnicos.map((tecnico) => (
              <option key={tecnico} value={tecnico}>
                {tecnico}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo
          </label>
          <select
            value={selectedMotivo}
            onChange={(e) => setSelectedMotivo(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
          >
            <option value="">Todos os motivos</option>
            {motivosReagendamento.map((motivo) => (
              <option key={motivo} value={motivo}>
                {motivo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
          >
            <option value="">Todos os tipos</option>
            <option value="FUNCIONAL">Funcional</option>
            <option value="ESTETICA">Estética</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Início
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Fim
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
          />
        </div>
      </div>
    </div>
  );
}
