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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novo: Reagendamento = {
      id: Date.now().toString(),
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
    };

    onAdd(novo);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Novo Reagendamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número da OS *</label>
              <input
                type="text"
                name="os"
                value={formData.os}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 701424523"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
              <select
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um SKU</option>
                {produtos.map((produto) => (
                  <option key={produto} value={produto}>
                    {produto}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Produto</label>
              <input
                type="text"
                name="produto"
                value={formData.produto}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome do produto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Técnico *</label>
              <select
                name="tecnico"
                value={formData.tecnico}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo *</label>
              <select
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Código da Peça</label>
              <input
                type="text"
                name="codigoPeca"
                value={formData.codigoPeca}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: W10798744"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="FUNCIONAL">Funcional</option>
                <option value="ESTETICA">Estética</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Peça</label>
              <input
                type="text"
                name="nomePeca"
                value={formData.nomePeca}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Compressor"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Salvar Reagendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
