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
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#D45120] dark:text-[#E65A28] uppercase">
            <span className="w-1.5 h-1.5 bg-[#E65A28] inline-block" />
            <span>REGISTRO REGIONAL DE EMISORES</span>
          </div>
          <h1 className="font-display text-2xl sm:text-[28px] font-extrabold text-[#111317] dark:text-white tracking-tight uppercase mt-1">
            CALIFICACIONES TRIBUTARIAS
          </h1>
          <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1">
            Administración de factores de crédito, dividendos y retenciones en Santiago, Lima y
            Colombia
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {permissions.exportReports && (
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#FBF8F3] dark:bg-[#161A22] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] font-mono text-[11px] font-semibold uppercase text-[#111317] dark:text-slate-200 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          )}
          {permissions.createQualification && (
            <button
              type="button"
              onClick={onOpenNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[2px] bg-[#E65A28] hover:bg-[#D14D1E] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Calificación</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8B857C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filtrar por emisor, RUT/RUC/NIT o tipo de renta..."
            className="w-full h-10 pl-9 pr-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] font-mono text-xs text-[#111317] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E65A28]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 p-1 rounded-[2px] bg-[#EFE9DF] dark:bg-[#0D1016] border border-[#DDD6CB] dark:border-[#232833]">
            {(['ALL', 'CL', 'PE', 'CO'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMarketFilter(m)}
                className={`px-3 py-1.5 rounded-[2px] font-mono text-[11px] font-semibold uppercase cursor-pointer transition-colors whitespace-nowrap ${
                  marketFilter === m
                    ? 'bg-[#0E1B2E] dark:bg-[#E65A28] text-white'
                    : 'text-[#524E48] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white'
                }`}
              >
                {m === 'ALL' ? 'Todos' : m}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#8B857C]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | QualificationStatus)}
              className="h-9 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] font-mono text-xs text-[#111317] dark:text-slate-200"
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
      <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F0E8] dark:bg-[#0D1016] border-b border-[#E5DFD5] dark:border-[#1F242D] font-mono text-[11px] font-semibold tracking-wider uppercase text-[#6B665F] dark:text-slate-400">
                <th className="py-3 px-5">EMISOR</th>
                <th className="py-3 px-4">PLAZA / EJERCICIO</th>
                <th className="py-3 px-4">TIPO DE RENTA</th>
                <th className="py-3 px-4 text-right">MONTO BRUTO</th>
                <th className="py-3 px-4 text-right">FACTOR 8 / 10</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3D9] dark:divide-[#1B2029] text-xs">
              {filtered.map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-[#F5F0E8]/70 dark:hover:bg-[#161A22]/70 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#111317] dark:text-white">{q.emisor}</div>
                    <div className="text-[11px] font-mono tabular-nums text-[#6B665F] dark:text-slate-400 mt-0.5">
                      {q.rutEmisor}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-[#524E48] dark:text-slate-300 font-mono tabular-nums">
                    {q.mercado} · {q.ejercicio}
                  </td>
                  <td className="py-3.5 px-4 text-[#524E48] dark:text-slate-300 max-w-[240px] truncate">
                    {q.tipoRenta}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#111317] dark:text-white whitespace-nowrap">
                    ${q.montoBruto.toLocaleString('es-CL')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#524E48] dark:text-slate-300 whitespace-nowrap">
                    {q.factor8.toFixed(4)} / {q.factor10.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[2px] border font-mono text-[11px] font-semibold ${
                        q.estado === 'VIGENTE'
                          ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : q.estado === 'PRESENTADO'
                            ? 'border-sky-400/50 bg-sky-500/10 text-sky-700 dark:text-sky-400'
                            : 'border-[#E65A28]/50 bg-[#E65A28]/10 text-[#D45120] dark:text-[#F27445]'
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
                          className="p-1.5 rounded-[2px] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {permissions.editQualification && (
                        <button
                          type="button"
                          onClick={() => onEdit(q)}
                          title="Editar"
                          className="p-1.5 rounded-[2px] text-[#6B665F] hover:text-[#E65A28] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {permissions.deleteQualification && (
                        <button
                          type="button"
                          onClick={() => onDelete(q)}
                          title="Eliminar"
                          className="p-1.5 rounded-[2px] text-[#6B665F] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
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
                    <FileSpreadsheet className="w-8 h-8 text-[#8B857C] dark:text-slate-600 mx-auto mb-2" />
                    <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400">
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
