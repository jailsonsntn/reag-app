import AnaliseClient from '@/app/analise/section/AnaliseClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AnalisePage() {
  return (
    <div className="min-h-screen">
      <div className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white border-b border-white/60 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Análise de Dados</h1>
            <Link href="/" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnaliseClient />
      </div>
    </div>
  );
}
