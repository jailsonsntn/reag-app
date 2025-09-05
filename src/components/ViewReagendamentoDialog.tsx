"use client";
import * as Dialog from '@radix-ui/react-dialog';
import { Reagendamento } from '@/types/reagendamento';

interface ViewReagendamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: Reagendamento | null;
}

export default function ViewReagendamentoDialog({ isOpen, onClose, item }: ViewReagendamentoDialogProps) {
  if (!item) return null;

  const rows: Array<[string, string]> = [
    ['Data', item.data],
    ['OS', String(item.os)],
    ['SKU', String(item.sku)],
    ['Produto', item.produto || '—'],
    ['Técnico', item.tecnico || '—'],
    ['Motivo', item.motivo || '—'],
    ['Tipo', item.tipo || '—'],
    ['Nome da Peça', item.nomePeca || '—'],
    ['Código da Peça', item.codigoPeca ? String(item.codigoPeca) : '—'],
    ['Teve Reagendamento', item.teveReagendamento ? 'Sim' : 'Não'],
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-200/60 w-[95vw] max-w-2xl max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Detalhes do Reagendamento</Dialog.Title>
            <Dialog.Close className="px-4 h-9 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm">Fechar</Dialog.Close>
          </div>
          <div className="p-4 overflow-auto max-h-[70vh]">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rows.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-100 bg-white/70 p-3">
                  <dt className="text-xs text-gray-500 mb-1">{label}</dt>
                  <dd className="text-sm text-gray-900 break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
