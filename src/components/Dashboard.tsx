'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, Calendar, Users, Package, Wrench, BarChart } from 'lucide-react';
import Link from 'next/link';
import { reagendamentos as initialReagendamentos, tecnicos, produtos, pecas, motivos } from '@/data/excelData';
import { Reagendamento } from '@/types/reagendamento';
import ReagendamentoTable from '@/components/ReagendamentoTable';
import FilterPanel from '@/components/FilterPanel';
import AddReagendamentoDialog from '@/components/AddReagendamentoDialog';
import EditReagendamentoDialog from '@/components/EditReagendamentoDialog';
import ViewReagendamentoDialog from '@/components/ViewReagendamentoDialog';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [selectedMotivo, setSelectedMotivo] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<Reagendamento | null>(null);
  const [viewItem, setViewItem] = useState<Reagendamento | null>(null);
  const [reagendamentosState, setReagendamentosState] = useState<Reagendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 100;
  const excelTotal = Array.isArray(initialReagendamentos) ? (initialReagendamentos as unknown as Reagendamento[]).length : 0;
  const [synced, setSynced] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/reagendamentos?take=${pageSize}&page=${page}&meta=1`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar dados do banco');
        const payload = await res.json();
        const arr = (Array.isArray(payload) ? payload : payload.items) as Reagendamento[];
        if (!cancelled) {
          setReagendamentosState(arr);
          if (!Array.isArray(payload)) setTotal(payload.total ?? arr.length);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Erro ao carregar');
          setReagendamentosState([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page]);

  // Valida sincronização completa: compara chaves únicas (os|sku|data|motivo) entre Excel e Banco
  useEffect(() => {
    let cancelled = false;
    async function validateSyncIfNeeded() {
      if (synced) return; // já sincronizado
      if (total === 0 || excelTotal === 0) return;
      if (total >= excelTotal) { setSynced(true); return; }
      try {
        setValidating(true);
        const res = await fetch('/api/reagendamentos?all=1', { cache: 'no-store' });
        if (!res.ok) return;
        const db = (await res.json()) as Reagendamento[];
        const key = (r: Reagendamento) => `${String(r.os)}|${String(r.sku)}|${String(r.data)}|${String(r.motivo)}`;
        const dbSet = new Set(db.map(key));
        const excelArr = (initialReagendamentos as unknown as Reagendamento[]);
        const missing = excelArr.filter(r => !dbSet.has(key(r)));
        if (!cancelled) setSynced(missing.length === 0);
        if (!cancelled) setTotal(db.length);
      } finally {
        if (!cancelled) setValidating(false);
      }
    }
    validateSyncIfNeeded();
    return () => { cancelled = true; };
  }, [total, excelTotal, synced]);

  const filteredReagendamentos = useMemo(() => {
  const base = reagendamentosState.filter((item) => {
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
    // Ordena por data desc (mais recentes primeiro)
    return base.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
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
        {total > 0 && excelTotal > total && !synced && (
          <div className="mb-4 p-4 rounded-xl border border-blue-200/60 bg-blue-50 text-blue-900 flex items-center justify-between gap-4">
            <div>
              Detectamos {total} registros no banco, mas o Excel possui {excelTotal}. Deseja importar os faltantes?
            </div>
            <button
              className="px-3 h-9 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={async () => {
                try {
                  setLoading(true);
                  const res = await fetch('/api/seed', { method: 'POST' });
                  if (!res.ok) throw new Error('Falha ao importar do Excel');
                  // Recarrega e valida sincronização
                  const again = await fetch(`/api/reagendamentos?take=${pageSize}&page=0&meta=1`, { cache: 'no-store' });
                  const payload = await again.json();
                  setPage(0);
                  setReagendamentosState(payload.items ?? []);
                  setTotal(payload.total ?? 0);
                  // Validação final
                  const resAll = await fetch('/api/reagendamentos?all=1', { cache: 'no-store' });
                  if (resAll.ok) {
                    const db = (await resAll.json()) as Reagendamento[];
                    const key = (r: Reagendamento) => `${String(r.os)}|${String(r.sku)}|${String(r.data)}|${String(r.motivo)}`;
                    const dbSet = new Set(db.map(key));
                    const excelArr = (initialReagendamentos as unknown as Reagendamento[]);
                    const missing = excelArr.filter(r => !dbSet.has(key(r)));
                    setSynced(missing.length === 0);
                  }
                } catch (e: any) {
                  setError(e?.message || 'Erro ao importar');
                } finally {
                  setLoading(false);
                }
              }}
            >
              {validating ? 'Validando...' : 'Importar do Excel'}
            </button>
          </div>
        )}

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
      const again = await fetch(`/api/reagendamentos?take=${pageSize}&page=${page}&meta=1`, { cache: 'no-store' });
      const payload = await again.json();
      setReagendamentosState(payload.items ?? []);
      setTotal(payload.total ?? 0);
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

  <ReagendamentoTable
    data={filteredReagendamentos}
  totalCount={total}
    onEdit={(item) => setEditItem(item)}
    onDelete={async (item) => {
      const ok = window.confirm('Tem certeza que deseja excluir este registro?');
      if (!ok) return;
      try {
        const res = await fetch(`/api/reagendamentos/${item.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha ao excluir');
        setReagendamentosState(prev => prev.filter(r => r.id !== item.id));
      } catch (e) {
        console.error(e);
        alert('Não foi possível excluir.');
      }
    }}
  onView={(item) => setViewItem(item)}
  />
  {/* Observação de total da página atual */}
  <div className="mt-2 text-xs text-gray-500">Exibindo {filteredReagendamentos.length} registros nesta página</div>
  {total > pageSize && (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-sm text-gray-600">Página {page + 1} de {Math.max(1, Math.ceil(total / pageSize))}</span>
      <div className="flex gap-2">
        <button
          className="px-3 h-9 rounded border border-gray-200 bg-white disabled:opacity-50"
          onClick={() => setPage(0)}
          disabled={page === 0}
        >Primeira</button>
        <button
          className="px-3 h-9 rounded border border-gray-200 bg-white disabled:opacity-50"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >Anterior</button>
        <button
          className="px-3 h-9 rounded border border-gray-200 bg-white disabled:opacity-50"
          onClick={() => setPage(p => (p + 1 < Math.ceil(total / pageSize) ? p + 1 : p))}
          disabled={page + 1 >= Math.ceil(total / pageSize)}
        >Próxima</button>
        <button
          className="px-3 h-9 rounded border border-gray-200 bg-white disabled:opacity-50"
          onClick={() => setPage(Math.max(0, Math.ceil(total / pageSize) - 1))}
          disabled={page + 1 >= Math.ceil(total / pageSize)}
        >Última</button>
      </div>
    </div>
  )}
      </div>

      {showAddDialog && (
        <AddReagendamentoDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={(novo: Reagendamento) => {
            // Garante inserção no topo e volta para a primeira página
            setReagendamentosState(prev => [novo, ...prev]);
            setPage(0);
          }}
          tecnicos={tecnicos}
          produtos={produtos}
          pecas={pecas}
          motivosReagendamento={motivos}
        />
      )}
      {editItem && (
        <EditReagendamentoDialog
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          item={editItem}
          onUpdated={(upd) => {
            setReagendamentosState(prev => prev.map(r => r.id === upd.id ? upd : r));
          }}
          tecnicos={tecnicos}
          produtos={produtos}
          pecas={pecas}
          motivosReagendamento={motivos}
        />
      )}
      {viewItem && (
        <ViewReagendamentoDialog
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          item={viewItem}
        />
      )}
  </div>
  );
}
