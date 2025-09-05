"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { Reagendamento } from '@/types/reagendamento';

interface AddReagendamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (r: Reagendamento) => void;
  tecnicos: string[];
  produtos: string[];
  pecas: string[];
  motivosReagendamento: string[];
}

export default function AddReagendamentoDialog({
  isOpen,
  onClose,
  onAdd,
  tecnicos,
  produtos,
  pecas,
  motivosReagendamento
}: AddReagendamentoDialogProps) {
  const [formData, setFormData] = useState({
    os: '',
    sku: '',
    produto: '',
    tecnico: '',
    data: '',
    teveReagendamento: false,
    motivo: '',
    codigoPeca: '',
    tipo: 'FUNCIONAL' as const,
    nomePeca: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      os: formData.os,
      sku: formData.sku,
      produto: formData.produto,
      tecnico: formData.tecnico,
      data: formData.data,
      teveReagendamento: formData.teveReagendamento,
      motivo: formData.motivo,
      codigoPeca: formData.codigoPeca,
      tipo: formData.tipo,
      nomePeca: formData.nomePeca,
    } as Omit<Reagendamento, 'id'>;

    const res = await fetch('/api/reagendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('Falha ao salvar');
      return;
    }
    const saved = await res.json();
    onAdd(saved as Reagendamento);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white/95 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 backdrop-blur rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Novo Reagendamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Número da OS *</label>
              <input
                type="text"
                name="os"
                value={formData.os}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
                placeholder="Ex: 701424523"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">PRODUTO *</label>
              <select
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
              >
                <option value="">Selecione um PRODUTO</option>
                {produtos.map((produto) => (
                  <option key={produto} value={produto}>
                    {produto}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">SKU</label>
              <input
                type="text"
                name="produto"
                value={formData.produto}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
                placeholder="Informe o SKU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Técnico *</label>
              <select
                name="tecnico"
                value={formData.tecnico}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
              >
                <option value="">Selecione um técnico</option>
                {tecnicos.map((tecnico) => (
                  <option key={tecnico} value={tecnico}>
                    {tecnico}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Data *</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Motivo *</label>
              <select
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
              >
                <option value="">Selecione um motivo</option>
                {motivosReagendamento.map((motivo) => (
                  <option key={motivo} value={motivo}>
                    {motivo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Código da Peça</label>
              <input
                type="text"
                name="codigoPeca"
                value={formData.codigoPeca}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
                placeholder="Ex: W10798744"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Tipo *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
              >
                <option value="FUNCIONAL">Funcional</option>
                <option value="ESTETICA">Estética</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Nome da Peça</label>
              <input
                type="text"
                name="nomePeca"
                value={formData.nomePeca}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/60"
                placeholder="Ex: Compressor"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200/60 dark:border-gray-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-600/90 hover:to-indigo-600/90 shadow-sm"
            >
              Salvar Reagendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
