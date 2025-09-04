"use client";

import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Reagendamento } from '@/types/reagendamento';
import * as Dialog from '@radix-ui/react-dialog';
import { reagendamentos as excelData } from '@/data/excelData';

type Granularidade = 'dia' | 'mes' | 'ano';

export default function AnaliseClient() {
  const [data, setData] = useState<Reagendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gran, setGran] = useState<Granularidade>('mes');
  const [tecnico, setTecnico] = useState('');
  const [produto, setProduto] = useState('');
  const [motivo, setMotivo] = useState('');
  const [tipo, setTipo] = useState('');
  const [range, setRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalRecords, setModalRecords] = useState<Reagendamento[]>([]);
  const [chartGran, setChartGran] = useState<Granularidade>('mes');
  const [chartRange, setChartRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reagendamentos?all=1', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar dados');
        const arr = (await res.json()) as Reagendamento[];
        if (!cancelled) {
          // Mescla com Excel para garantir histórico completo
          const key = (r: any) => `${String(r.os)}|${String(r.sku)}|${String(r.data)}|${String(r.motivo)}`;
          const map = new Map<string, Reagendamento>();
          for (const r of arr) map.set(key(r), {
            ...r,
            os: String(r.os),
            sku: String(r.sku),
          });
          for (const r of (excelData as unknown as Reagendamento[])) {
            const k = key(r);
            if (!map.has(k)) map.set(k, {
              ...r,
              os: String(r.os),
              sku: String(r.sku),
            });
          }
          setData(Array.from(map.values()));
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return data.filter(r => {
      if (tecnico && r.tecnico !== tecnico) return false;
      if (produto && r.produto !== produto) return false;
      if (motivo && r.motivo !== motivo) return false;
      if (tipo && r.tipo !== tipo) return false;
      if (range.start && r.data < range.start) return false;
      if (range.end && r.data > range.end) return false;
      return true;
    });
  }, [data, tecnico, produto, motivo, tipo, range]);

  const tecnicos = useMemo(() => Array.from(new Set(data.map(d => d.tecnico).filter(Boolean))).sort(), [data]);
  const produtos = useMemo(() => Array.from(new Set(data.map(d => d.produto).filter(Boolean))).sort(), [data]);
  const motivos = useMemo(() => Array.from(new Set(data.map(d => d.motivo).filter(Boolean))).sort(), [data]);
  const tipos = useMemo(() => Array.from(new Set(data.map(d => d.tipo).filter(Boolean))).sort(), [data]);

  // Top técnicos
  const topTecnicos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered) counts.set(r.tecnico, (counts.get(r.tecnico) || 0) + 1);
    return Array.from(counts.entries())
      .map(([tecnico, quantidade]) => ({ tecnico, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [filtered]);

  // Top peças (nomePeca)
  const topPecas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered) {
      if (r.nomePeca) counts.set(r.nomePeca, (counts.get(r.nomePeca) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([peca, quantidade]) => ({ peca, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [filtered]);

  // Top SKUs
  const topSkus = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered) counts.set(String(r.sku), (counts.get(String(r.sku)) || 0) + 1);
    return Array.from(counts.entries())
      .map(([sku, quantidade]) => ({ sku, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [filtered]);

  // Top Produtos
  const topProdutos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered) counts.set(r.produto, (counts.get(r.produto) || 0) + 1);
    return Array.from(counts.entries())
      .map(([produto, quantidade]) => ({ produto, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [filtered]);

  // Top Motivos
  const topMotivos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered) {
      const m = r.motivo || '—';
      counts.set(m, (counts.get(m) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([motivo, quantidade]) => ({ motivo, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [filtered]);

  // Série temporal do gráfico inferior (dia/mês/ano) com filtros próprios de data
  const chartSeries = useMemo(() => {
    const fmt = (s: string) => {
      if (chartGran === 'ano') return s.slice(0, 4);
      if (chartGran === 'mes') return s.slice(0, 7); // YYYY-MM
      return s; // dia: YYYY-MM-DD
    };
    const rows = filtered.filter(r => (
      (!chartRange.start || r.data >= chartRange.start) &&
      (!chartRange.end || r.data <= chartRange.end)
    ));
    const counts = new Map<string, number>();
    for (const r of rows) {
      const k = fmt(r.data);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const points = Array.from(counts.entries())
      .map(([x, y]) => ({ x, y }))
      .sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : 0));
    return [ { id: 'Reagendamentos', data: points } ];
  }, [filtered, chartGran, chartRange]);

  if (loading) return <div className="text-gray-500">Carregando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  // Renderização de listas para Top Técnicos/Peças com abertura em pop-up
  const TopList = ({
    items,
    labelKey,
    valueKey,
    onOpen,
  }: {
    items: any[];
    labelKey: string;
    valueKey: string;
    onOpen: (label: string) => void;
  }) => (
  <ul className="divide-y divide-gray-100">
      {items.map((it, idx) => {
        const label = String(it[labelKey]) || '—';
        return (
          <li key={idx} className="py-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-2 text-left"
                onClick={() => onOpen(label)}
                title="Clique para ver detalhes"
              >
                <span className="text-sm text-gray-500 w-6">{idx + 1}.</span>
                <span className="text-gray-800 font-medium hover:underline">{label}</span>
              </button>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {it[valueKey]}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );

  const DetailList = ({ records }: { records: Reagendamento[] }) => (
    <div className="overflow-auto">
      {records.length === 0 ? (
        <div className="p-3 text-sm text-gray-600">Nenhum registro.</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/80 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">OS</th>
              <th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-left">Produto</th>
              <th className="px-3 py-2 text-left">Técnico</th>
              <th className="px-3 py-2 text-left">Motivo</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Peça</th>
              <th className="px-3 py-2 text-left">Código</th>
            </tr>
          </thead>
      <tbody className="divide-y divide-gray-100">
            {records.map((r, i) => (
        <tr key={`${r.os}-${r.sku}-${r.data}-${i}`} className="bg-white">
                <td className="px-3 py-2 whitespace-nowrap">{r.data}</td>
                <td className="px-3 py-2 whitespace-nowrap">{String(r.os)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{String(r.sku)}</td>
                <td className="px-3 py-2">{r.produto}</td>
                <td className="px-3 py-2">{r.tecnico}</td>
                <td className="px-3 py-2">{r.motivo}</td>
                <td className="px-3 py-2">{r.tipo}</td>
                <td className="px-3 py-2">{r.nomePeca || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.codigoPeca ? String(r.codigoPeca) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const openTecnico = (label: string) => {
    const records = filtered.filter(r => r.tecnico === label);
    setModalTitle(`Atendimentos do técnico: ${label}`);
    setModalRecords(records);
    setModalOpen(true);
  };

  const openPeca = (label: string) => {
    const records = filtered.filter(r => r.nomePeca === label);
    setModalTitle(`Atendimentos com a peça: ${label}`);
    setModalRecords(records);
    setModalOpen(true);
  };

  const openSku = (label: string) => {
    const records = filtered.filter(r => String(r.sku) === label);
    setModalTitle(`Atendimentos do SKU: ${label}`);
    setModalRecords(records);
    setModalOpen(true);
  };

  const openProduto = (label: string) => {
    const records = filtered.filter(r => r.produto === label);
    setModalTitle(`Atendimentos do produto: ${label}`);
    setModalRecords(records);
    setModalOpen(true);
  };

  const openMotivo = (label: string) => {
    const records = filtered.filter(r => (r.motivo || '—') === label);
    setModalTitle(`Atendimentos com motivo: ${label}`);
    setModalRecords(records);
    setModalOpen(true);
  };

  const LineChart = ({ points }: { points: Array<{ x: string; y: number }> }) => {
    const width = 800;
    const height = 360;
    const padding = { top: 10, right: 10, bottom: 60, left: 50 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const maxY = Math.max(1, ...points.map((p) => p.y));
    const xs = points.map((p) => p.x);
    const uniqX = Array.from(new Set(xs));
    const xStep = uniqX.length > 1 ? innerW / (uniqX.length - 1) : 0;
    const toXY = (p: { x: string; y: number }) => {
      const xi = uniqX.indexOf(p.x);
      const x = padding.left + xi * xStep;
      const y = height - padding.bottom - (p.y / maxY) * innerH;
      return { x, y };
    };
    const pathD = points
      .map((p, i) => {
        const { x, y } = toXY(p);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[360px]">
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#94a3b8" />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#94a3b8" />
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth={2} />
        {points.map((p, i) => {
          const { x, y } = toXY(p);
          return <circle key={i} cx={x} cy={y} r={3} fill="#10b981" />;
        })}
        {/* Rótulos X */}
        {uniqX.map((xv, i) => {
          const x = padding.left + i * xStep;
          const y = height - padding.bottom + 12;
          return (
            <text key={`x-${i}`} x={x} y={y} fontSize={10} textAnchor="end" transform={`rotate(-30 ${x} ${y})`} fill="#334155">
              {xv}
            </text>
          );
        })}
        {/* Ticks Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
          const y = height - padding.bottom - t * innerH;
          const v = Math.round(maxY * t);
          return (
            <g key={`ty-${idx}`}>
              <line x1={padding.left - 4} y1={y} x2={padding.left} y2={y} stroke="#94a3b8" />
              <text x={padding.left - 8} y={y + 3} fontSize={10} textAnchor="end" fill="#334155">{v}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl p-4 border border-gray-200/60 bg-white/80 backdrop-blur shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4 items-end">
        <div>
          <label className="text-sm text-gray-600">Granularidade</label>
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={gran} onChange={e => setGran(e.target.value as Granularidade)}>
            <option value="dia">Dia</option>
            <option value="mes">Mês</option>
            <option value="ano">Ano</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Técnico</label>
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={tecnico} onChange={e => setTecnico(e.target.value)}>
            <option value="">Todos</option>
            {tecnicos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Produto</label>
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={produto} onChange={e => setProduto(e.target.value)}>
            <option value="">Todos</option>
            {produtos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Motivo</label>
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={motivo} onChange={e => setMotivo(e.target.value)}>
            <option value="">Todos</option>
            {motivos.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Tipo</label>
          <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Início</label>
          <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={range.start} onChange={e => setRange(r => ({ ...r, start: e.target.value }))} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Fim</label>
          <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={range.end} onChange={e => setRange(r => ({ ...r, end: e.target.value }))} />
        </div>
          <div className="sm:col-span-2 lg:col-span-1 justify-self-end w-full">
            <label className="block text-sm text-gray-600 invisible">Ações</label>
            <button
              className="group relative inline-flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm ml-auto"
              onClick={() => {
                setGran('mes');
                setTecnico('');
                setProduto('');
                setMotivo('');
                setTipo('');
                setRange({ start: '', end: '' });
              }}
              type="button"
              aria-label="Limpar filtros"
              title="Limpar filtros"
            >
              <Trash2 className="h-5 w-5 text-gray-600" />
              <span className="pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                Limpar filtros
              </span>
            </button>
          </div>
        </div>
      </div>

      {data.length === 0 && (
        <div className="mb-4 p-4 border rounded bg-yellow-50 text-yellow-800">
          Nenhum registro no banco. Você pode semear os dados iniciais a partir do Excel.
          <button
            className="ml-3 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={async () => {
              try {
                setLoading(true);
                const res = await fetch('/api/seed', { method: 'POST' });
                if (!res.ok) throw new Error('Falha ao semear banco');
                const again = await fetch('/api/reagendamentos?all=1', { cache: 'no-store' });
                const arr = (await again.json()) as Reagendamento[];
                const key = (r: any) => `${String(r.os)}|${String(r.sku)}|${String(r.data)}|${String(r.motivo)}`;
                const map = new Map<string, Reagendamento>();
                for (const r of arr) map.set(key(r), r as Reagendamento);
                for (const r of (excelData as unknown as Reagendamento[])) {
                  const k = key(r);
                  if (!map.has(k)) map.set(k, r);
                }
                setData(Array.from(map.values()));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-200/60">
          <h2 className="font-semibold mb-3">Top Técnicos</h2>
          <TopList
            items={topTecnicos.map(t => ({ tecnico: t.tecnico, quantidade: t.quantidade }))}
            labelKey="tecnico"
            valueKey="quantidade"
            onOpen={openTecnico}
          />
        </div>
        <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-200/60">
          <h2 className="font-semibold mb-3">Top Peças</h2>
          <TopList
            items={topPecas.map(p => ({ peca: p.peca, quantidade: p.quantidade }))}
            labelKey="peca"
            valueKey="quantidade"
            onOpen={openPeca}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-200/60">
          <h2 className="font-semibold mb-3">Top SKU</h2>
          <TopList
            items={topSkus.map(s => ({ sku: s.sku, quantidade: s.quantidade }))}
            labelKey="sku"
            valueKey="quantidade"
            onOpen={openSku}
          />
        </div>
        <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-200/60">
          <h2 className="font-semibold mb-3">Top Produtos</h2>
          <TopList
            items={topProdutos.map(p => ({ produto: p.produto, quantidade: p.quantidade }))}
            labelKey="produto"
            valueKey="quantidade"
            onOpen={openProduto}
          />
        </div>
        <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-200/60">
          <h2 className="font-semibold mb-3">Top Motivos</h2>
          <TopList
            items={topMotivos.map(m => ({ motivo: m.motivo, quantidade: m.quantidade }))}
            labelKey="motivo"
            valueKey="quantidade"
            onOpen={openMotivo}
          />
        </div>
      </div>

      {/* Modal pop-up para detalhes */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-200/60 w-[95vw] max-w-5xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60">
              <Dialog.Title className="text-lg font-semibold text-gray-900">{modalTitle}</Dialog.Title>
              <Dialog.Close className="px-4 h-9 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm">Fechar</Dialog.Close>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh]">
              <DetailList records={modalRecords} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

  <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-200/60">
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <h2 className="font-semibold">Reagendamentos por {chartGran}</h2>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="text-sm text-gray-600">Granularidade do gráfico</label>
      <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={chartGran} onChange={e => setChartGran(e.target.value as Granularidade)}>
                <option value="dia">Dia</option>
                <option value="mes">Mês</option>
                <option value="ano">Ano</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Início (gráfico)</label>
      <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={chartRange.start} onChange={e => setChartRange(r => ({ ...r, start: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Fim (gráfico)</label>
      <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60" value={chartRange.end} onChange={e => setChartRange(r => ({ ...r, end: e.target.value }))} />
            </div>
            <button
      className="px-4 h-10 rounded-xl border border-gray-200 text-sm bg-white hover:bg-gray-50 shadow-sm"
              onClick={() => {
                setChartGran('mes');
                setChartRange({ start: '', end: '' });
              }}
            >
              Limpar gráfico
            </button>
          </div>
        </div>
        <LineChart points={chartSeries[0]?.data ?? []} />
      </div>

    </div>
  );
}
