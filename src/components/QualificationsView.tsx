import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type {
  AuthSession,
  QualificationMarket,
  QualificationStatus,
  TaxQualification,
} from '../types/nuam.ts';

interface QualificationsViewProps {
  items: TaxQualification[];
  permissions: AuthSession['permissions'];
  searchQuery: string;
  onOpenNew: () => void;
  onEdit: (item: TaxQualification) => void;
  onApprove: (item: TaxQualification) => void;
  onDelete: (item: TaxQualification) => void;
}

export const QualificationsView: React.FC<QualificationsViewProps> = ({
  items,
  permissions,
  searchQuery,
  onOpenNew,
  onEdit,
  onApprove,
  onDelete,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [marketFilter, setMarketFilter] = useState<'ALL' | QualificationMarket>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QualificationStatus>('ALL');

  const combinedSearch = (localSearch || searchQuery).trim().toLowerCase();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (marketFilter !== 'ALL' && item.mercado !== marketFilter) return false;
      if (statusFilter !== 'ALL' && item.estado !== statusFilter) return false;
      if (combinedSearch) {
        const matches =
          item.emisor.toLowerCase().includes(combinedSearch) ||
          item.rutEmisor.toLowerCase().includes(combinedSearch) ||
          item.tipoRenta.toLowerCase().includes(combinedSearch);
        if (!matches) return false;
      }
      return true;
    });
  }, [items, marketFilter, statusFilter, combinedSearch]);

  const exportCsv = () => {
    const header =
      'EMISOR;RUT_EMISOR;MERCADO;EJERCICIO;TIPO_RENTA;MONTO_BRUTO;FACTOR_8;FACTOR_10;FACTOR_15;ESTADO';
    const rows = filtered.map((q) =>
      [
        q.emisor,
        q.rutEmisor,
        q.mercado,
        q.ejercicio,
        q.tipoRenta,
        q.montoBruto,
        q.factor8,
        q.factor10,
        q.factor15,
        q.estado,
      ].join(';')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calificaciones_nuam_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-blue-700 dark:text-blue-400 uppercase">
            Registro Regional de Emisores
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight mt-1">
            Calificaciones Tributarias
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de factores de crédito, dividendos y retenciones en Santiago, Lima y Colombia
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {permissions.exportReports && (
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1524] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          )}
          {permissions.createQualification && (
            <button
              type="button"
              onClick={onOpenNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Calificación</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filtrar por emisor, RUT/RUC/NIT o tipo de renta..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            {(['ALL', 'CL', 'PE', 'CO'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMarketFilter(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  marketFilter === m
                    ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {m === 'ALL' ? 'Todos' : m}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | QualificationStatus)}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Todos los estados</option>
              <option value="VIGENTE">Vigente</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PRESENTADO">Presentado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-5">EMISOR</th>
                <th className="py-3 px-4">PLAZA / EJERCICIO</th>
                <th className="py-3 px-4">TIPO DE RENTA</th>
                <th className="py-3 px-4 text-right">MONTO BRUTO</th>
                <th className="py-3 px-4 text-right">FACTOR 8 / 10</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-950 dark:text-white">{q.emisor}</div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                      {q.rutEmisor}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                    {q.mercado} · {q.ejercicio}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[240px] truncate">
                    {q.tipoRenta}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-slate-950 dark:text-white whitespace-nowrap">
                    ${q.montoBruto.toLocaleString('es-CL')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {q.factor8.toFixed(4)} / {q.factor10.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        q.estado === 'VIGENTE'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : q.estado === 'PRESENTADO'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {q.estado}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {permissions.editQualification && q.estado === 'BORRADOR' && (
                        <button
                          type="button"
                          onClick={() => onApprove(q)}
                          title="Aprobar a Vigente"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {permissions.editQualification && (
                        <button
                          type="button"
                          onClick={() => onEdit(q)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {permissions.deleteQualification && (
                        <button
                          type="button"
                          onClick={() => onDelete(q)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No se encontraron calificaciones para los filtros aplicados.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
