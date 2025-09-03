'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Calendar, Users, Package, Wrench } from 'lucide-react';
import { reagendamentos as initialReagendamentos, tecnicos, produtos, pecas, motivos } from '@/data/excelData';
import { Reagendamento } from '@/types/reagendamento';
import ReagendamentoTable from './ReagendamentoTable';
import StatsCards from './StatsCards';
import FilterPanel from './FilterPanel';
import AddReagendamentoDialog from './AddReagendamentoDialog';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [selectedMotivo, setSelectedMotivo] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [reagendamentosState, setReagendamentosState] = useState<Reagendamento[]>(
    initialReagendamentos as unknown as Reagendamento[]
  );

  const filteredReagendamentos = useMemo(() => {
    return reagendamentosState.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        item.os.toString().toLowerCase().includes(q) ||
        item.sku.toString().toLowerCase().includes(q) ||
        item.produto.toString().toLowerCase().includes(q) ||
        item.tecnico.toString().toLowerCase().includes(q) ||
        item.nomePeca.toString().toLowerCase().includes(q);

      const matchesTecnico = !selectedTecnico || item.tecnico === selectedTecnico;
      const matchesMotivo = !selectedMotivo || item.motivo === selectedMotivo;
      const matchesTipo = !selectedTipo || item.tipo === selectedTipo;

      const matchesDateRange = (!dateRange.start || item.data >= dateRange.start) && 
                              (!dateRange.end || item.data <= dateRange.end);

      return matchesSearch && matchesTecnico && matchesMotivo && matchesTipo && matchesDateRange;
    });
  }, [searchTerm, selectedTecnico, selectedMotivo, selectedTipo, dateRange, reagendamentosState]);

  const stats = useMemo(() => {
  const totalOS = reagendamentosState.length;
  const reagendamentosAtivos = reagendamentosState.filter(r => r.teveReagendamento).length;
  const pendentes = reagendamentosState.filter(r => r.motivo === 'NTN').length;
    const concluidas = totalOS - pendentes;

    const motivosCounts = reagendamentosState.reduce((acc: Record<string, number>, item) => {
      acc[item.motivo] = (acc[item.motivo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const motivosMaisComuns = Object.entries(motivosCounts)
      .map(([motivo, quantidade]) => ({
        motivo,
        quantidade
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

  const tecnicosCounts = reagendamentosState.reduce((acc, item) => {
      acc[item.tecnico] = (acc[item.tecnico] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tecnicosMaisAtivos = Object.entries(tecnicosCounts)
      .map(([tecnico, quantidade]) => ({ tecnico, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    return {
      totalOS,
      reagendamentos: reagendamentosAtivos,
      pendentes,
      concluidas,
      motivosMaisComuns,
      tecnicosMaisAtivos
    };
  }, [reagendamentosState]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Wrench className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Reagendamentos
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar OS, SKU, produto, técnico..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </button>
              
              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Reagendamento</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards stats={stats} />

        {showFilters && (
          <FilterPanel
            tecnicos={tecnicos}
            motivosReagendamento={motivos}
            selectedTecnico={selectedTecnico}
            setSelectedTecnico={setSelectedTecnico}
            selectedMotivo={selectedMotivo}
            setSelectedMotivo={setSelectedMotivo}
            selectedTipo={selectedTipo}
            setSelectedTipo={setSelectedTipo}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onClear={() => {
              setSelectedTecnico('');
              setSelectedMotivo('');
              setSelectedTipo('');
              setDateRange({ start: '', end: '' });
            }}
          />
        )}

        <ReagendamentoTable data={filteredReagendamentos} />
      </div>

      {showAddDialog && (
        <AddReagendamentoDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={(novo: Reagendamento) => setReagendamentosState(prev => [novo, ...prev])}
          tecnicos={tecnicos}
          produtos={produtos}
          pecas={pecas}
          motivosReagendamento={motivos}
        />
      )}
    </div>
  );
}
