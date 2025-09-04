'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, Calendar, Users, Package, Wrench, BarChart } from 'lucide-react';
import Link from 'next/link';
import { reagendamentos as initialReagendamentos, tecnicos, produtos, pecas, motivos } from '@/data/excelData';
import { Reagendamento } from '@/types/reagendamento';
import ReagendamentoTable from '@/components/ReagendamentoTable';
import FilterPanel from '@/components/FilterPanel';
import AddReagendamentoDialog from '@/components/AddReagendamentoDialog';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [selectedMotivo, setSelectedMotivo] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [reagendamentosState, setReagendamentosState] = useState<Reagendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/reagendamentos', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar dados do banco');
        const arr = (await res.json()) as Reagendamento[];
        if (!cancelled) {
          if (Array.isArray(arr)) {
            if (arr.length === 0) {
              setReagendamentosState(initialReagendamentos as unknown as Reagendamento[]);
            } else if (arr.length < 10) {
              const key = (r: any) => `${String(r.os)}|${String(r.sku)}|${String(r.data)}|${String(r.motivo)}`;
              const map = new Map<string, Reagendamento>();
              for (const r of arr) map.set(key(r), r);
              for (const r of (initialReagendamentos as unknown as Reagendamento[])) {
                const k = key(r);
                if (!map.has(k)) map.set(k, r);
              }
              setReagendamentosState(Array.from(map.values()));
            } else {
              setReagendamentosState(arr);
            }
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Erro ao carregar');
          setReagendamentosState(initialReagendamentos as unknown as Reagendamento[]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredReagendamentos = useMemo(() => {
    return reagendamentosState.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        item.os.toString().toLowerCase().includes(q) ||
        item.sku.toString().toLowerCase().includes(q) ||
        item.produto.toString().toLowerCase().includes(q) ||
        item.tecnico.toString().toLowerCase().includes(q) ||
        (item.nomePeca || '').toString().toLowerCase().includes(q);

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
    <div className="min-h-screen">
      <div className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white border-b border-white/60 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center shadow-sm">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
                Sistema de Reagendamentos
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar OS, SKU, produto, técnico..."
                  className="pl-9 pr-3 h-10 w-80 rounded-xl bg-white/70 border border-gray-200 focus-visible:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60 shadow-sm placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl border shadow-sm text-sm ${
                  showFilters
                    ? 'bg-blue-50/80 border-blue-200 text-blue-700'
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </button>

              <button
                onClick={() => setShowAddDialog(true)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm hover:from-blue-600/90 hover:to-indigo-600/90"
              >
                <Plus className="h-4 w-4" />
                <span>Novo</span>
              </button>

              <Link
                href="/analise"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                <BarChart className="h-4 w-4" />
                <span>Análise</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {loading ? (
          <div className="text-gray-500 mb-4">Carregando dados...</div>
        ) : error ? (
          <div className="text-red-600 mb-4">{error}</div>
  ) : null}

  {/* Painel de métricas removido: análise será em página dedicada */}

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

        {reagendamentosState.length === 0 && (
          <div className="mb-4 p-4 border rounded bg-yellow-50 text-yellow-800">
            Nenhum registro no banco. Você pode semear os dados iniciais a partir do Excel.
            <button
              className="ml-3 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={async () => {
                try {
                  setLoading(true);
                  const res = await fetch('/api/seed', { method: 'POST' });
                  if (!res.ok) throw new Error('Falha ao semear banco');
                  // Recarregar após seed
                  const again = await fetch('/api/reagendamentos', { cache: 'no-store' });
                  const arr = (await again.json()) as Reagendamento[];
                  setReagendamentosState(arr);
                } catch (e: any) {
                  setError(e?.message || 'Erro ao semear');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Semear agora
            </button>
          </div>
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
