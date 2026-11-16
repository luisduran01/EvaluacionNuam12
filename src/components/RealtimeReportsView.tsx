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
import { AnimatedH1 } from './AnimatedH1.tsx';
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
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#D45120] dark:text-[#E65A28] uppercase">
              <span className="w-1.5 h-1.5 bg-[#E65A28] inline-block" />
              <span>DIFUSIÓN CONTINUA SSE & POSTGRESQL</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-700 dark:text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
              <span>Última sincronización {formatTime(lastSyncedAt)}</span>
            </span>
          </div>
          <AnimatedH1 className="font-display text-2xl sm:text-[28px] font-extrabold text-[#111317] dark:text-white tracking-tight uppercase mt-1">
            REPORTES EN TIEMPO REAL
          </AnimatedH1>
          <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1">
            Consolidado ejecutivo de capitales declarados, cargas DJ1948 y bitácora regional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={onTriggerSync}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#FBF8F3] dark:bg-[#161A22] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] font-mono text-[11px] font-semibold uppercase text-[#111317] dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            onClick={exportConsolidatedCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#FBF8F3] dark:bg-[#161A22] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] font-mono text-[11px] font-semibold uppercase text-[#111317] dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[2px] bg-[#0E1B2E] dark:bg-[#E65A28] hover:bg-[#162742] dark:hover:bg-[#D14D1E] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-5">
          <div className="flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider text-[#5C5852] dark:text-slate-400">
            <span>VOLUMEN BRUTO CONSOLIDADO</span>
            <TrendingUp className="w-4 h-4 text-[#E65A28]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#111317] dark:text-white mt-3 tabular-nums">
            ${totalAmount.toLocaleString('es-CL')}
          </div>
          <div className="font-mono text-[11px] text-[#6B665F] dark:text-slate-400 mt-1">
            Suma total en plazas CL · PE · CO
          </div>
        </div>

        <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-5">
          <div className="flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider text-[#5C5852] dark:text-slate-400">
            <span>REGISTROS PROCESADOS DJ1948</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-3 tabular-nums">
            {batches.reduce((sum, b) => sum + b.successCount, 0).toLocaleString('es-CL')}
          </div>
          <div className="font-mono text-[11px] text-[#6B665F] dark:text-slate-400 mt-1">
            En {batches.length} lotes ejecutados
          </div>
        </div>

        <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-5">
          <div className="flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider text-[#5C5852] dark:text-slate-400">
            <span>CUENTAS ACTIVAS CON JWT / RBAC</span>
            <Users className="w-4 h-4 text-[#0E1B2E] dark:text-[#E65A28]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#111317] dark:text-white mt-3 tabular-nums">
            {activeUsersCount}
          </div>
          <div className="font-mono text-[11px] text-[#6B665F] dark:text-slate-400 mt-1">
            Gobernadas por Django + Supabase PostgreSQL
          </div>
        </div>
      </div>

      {/* Market Breakdown + Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-6">
          <h2 className="font-display text-base font-extrabold uppercase text-[#111317] dark:text-white mb-1">
            Participación por Bolsa Regional
          </h2>
          <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mb-5">
            Peso relativo del capital calificado por jurisdicción tributaria
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5DFD5] dark:border-[#1F242D] font-mono text-[11px] font-semibold uppercase text-[#6B665F] dark:text-slate-400">
                  <th className="py-2.5">PLAZA BURSÁTIL</th>
                  <th className="py-2.5 text-right">CALIFICACIONES</th>
                  <th className="py-2.5 text-right">MONTO DECLARADO</th>
                  <th className="py-2.5 text-right">PARTICIPACIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3D9] dark:divide-[#1B2029]">
                {summary.byMarket.map((m) => {
                  const pct =
                    totalAmount > 0 ? ((m.montoTotal / totalAmount) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={m.market}>
                      <td className="py-3.5 font-semibold text-[#111317] dark:text-white">
                        {m.label}
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums text-[#524E48] dark:text-slate-300">
                        {m.count}
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums text-[#111317] dark:text-white">
                        ${m.montoTotal.toLocaleString('es-CL')}
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums font-semibold text-[#D45120] dark:text-[#E65A28]">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-6">
          <h2 className="font-display text-base font-extrabold uppercase text-[#111317] dark:text-white mb-1">
            Bitácora en Vivo (PostgreSQL)
          </h2>
          <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mb-4">
            Últimos eventos sincronizados automáticamente
          </p>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {auditLogs.slice(0, 8).map((ev) => (
              <div
                key={ev.id}
                className="pb-3 border-b border-[#E9E3D9] dark:border-[#1B2029] last:border-b-0 last:pb-0 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[#111317] dark:text-white">
                    {ev.action}
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-[#6B665F] dark:text-slate-400">
                    {formatTime(ev.createdAt)}
                  </span>
                </div>
                <div className="text-[#524E48] dark:text-slate-300 mt-0.5">{ev.detail}</div>
                <div className="text-[11px] font-mono text-[#6B665F] dark:text-slate-400 mt-0.5">
                  {ev.userName} ·{' '}
                  <span className="text-[#D45120] dark:text-[#E65A28]">{ev.hashCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
