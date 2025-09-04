"use client";

import { X } from 'lucide-react';
import { Reagendamento } from '@/types/reagendamento';

interface ViewReagendamentoDialogProps {
  isOpen: boolean;
  item: Reagendamento | null;
  onClose: () => void;
}

export default function ViewReagendamentoDialog({ isOpen, item, onClose }: ViewReagendamentoDialogProps) {
  if (!isOpen || !item) return null;

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value ?? '—'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white/95 text-gray-900 backdrop-blur rounded-2xl border border-gray-200/60 shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <h2 className="text-xl font-semibold">Detalhes do Reagendamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Row label="OS" value={String(item.os)} />
            <Row label="SKU" value={String(item.sku)} />
            <Row label="Produto" value={item.produto} />
            <Row label="Técnico" value={item.tecnico} />
            <Row label="Data" value={item.data} />
            <Row label="Motivo" value={item.motivo} />
            <Row label="Tipo" value={item.tipo} />
            <Row label="Código da Peça" value={item.codigoPeca ? String(item.codigoPeca) : '—'} />
            <Row label="Nome da Peça" value={item.nomePeca || '—'} />
            <Row label="Teve Reagendamento" value={item.teveReagendamento ? 'Sim' : 'Não'} />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-200/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
