import React from 'react';
import {
  Activity,
  Download,
  Printer,
  Radio,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { AuditLog, DashboardSummary, Dj1948Batch, TaxQualification } from '../types/nuam.ts';

interface RealtimeReportsViewProps {
  summary: DashboardSummary;
  qualifications: TaxQualification[];
  batches: Dj1948Batch[];
  auditLogs: AuditLog[];
  activeUsersCount: number;
  lastSyncedAt: string;
  onTriggerSync: () => void;
}

export const RealtimeReportsView: React.FC<RealtimeReportsViewProps> = ({
  summary,
  qualifications,
  batches,
  auditLogs,
  activeUsersCount,
  lastSyncedAt,
  onTriggerSync,
}) => {
  const exportConsolidatedCsv = () => {
    const lines = [
      'SECCION;MERCADO;CALIFICACIONES;MONTO_BRUTO;EJERCICIO;ESTADO',
      ...summary.byMarket.map(
        (m) => `RESUMEN_MERCADO;${m.label};${m.count};${m.montoTotal};2024-2026;ACTIVO`
      ),
      ...qualifications.map(
        (q) =>
          `CALIFICACION;${q.mercado} - ${q.emisor};1;${q.montoBruto};${q.ejercicio};${q.estado}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_tiempo_real_nuam_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const totalAmount = summary.totalMontoBruto;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-blue-700 dark:text-blue-400 uppercase">
              Difusión Continua SSE & PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-700 dark:text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
              <span>Última sincronización {formatTime(lastSyncedAt)}</span>
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight mt-1">
            Reportes en Tiempo Real
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Consolidado ejecutivo de capitales declarados, cargas DJ1948 y bitácora regional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={onTriggerSync}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1524] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            onClick={exportConsolidatedCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1524] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-5">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            <span>VOLUMEN BRUTO CONSOLIDADO</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-950 dark:text-white mt-3 font-mono tabular-nums">
            ${totalAmount.toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Suma total en plazas CL · PE · CO
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-5">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            <span>REGISTROS PROCESADOS DJ1948</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-950 dark:text-white mt-3 font-mono tabular-nums">
            {batches.reduce((sum, b) => sum + b.successCount, 0).toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            En {batches.length} lotes ejecutados
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-5">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            <span>CUENTAS ACTIVAS CON JWT / RBAC</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-display text-2xl font-bold text-slate-950 dark:text-white mt-3 font-mono tabular-nums">
            {activeUsersCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gobernadas por Django + Supabase PostgreSQL
          </div>
        </div>
      </div>

      {/* Market Breakdown + Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
          <h2 className="font-display text-base font-bold text-slate-950 dark:text-white mb-1">
            Participación por Bolsa Regional
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Peso relativo del capital calificado por jurisdicción tributaria
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-2.5">PLAZA BURSÁTIL</th>
                  <th className="py-2.5 text-right">CALIFICACIONES</th>
                  <th className="py-2.5 text-right">MONTO DECLARADO</th>
                  <th className="py-2.5 text-right">PARTICIPACIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summary.byMarket.map((m) => {
                  const pct =
                    totalAmount > 0 ? ((m.montoTotal / totalAmount) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={m.market}>
                      <td className="py-3.5 font-semibold text-slate-950 dark:text-white">
                        {m.label}
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {m.count}
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums text-slate-950 dark:text-white">
                        ${m.montoTotal.toLocaleString('es-CL')}
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
          <h2 className="font-display text-base font-bold text-slate-950 dark:text-white mb-1">
            Bitácora en Vivo (PostgreSQL)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Últimos eventos sincronizados automáticamente
          </p>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {auditLogs.slice(0, 8).map((ev) => (
              <div
                key={ev.id}
                className="pb-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-slate-950 dark:text-white">
                    {ev.action}
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-slate-400">
                    {formatTime(ev.createdAt)}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 mt-0.5">{ev.detail}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {ev.userName} · {ev.hashCode}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
