import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  FileCheck2,
  FolderKanban,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  Zap,
} from 'lucide-react';
import type { AuditLog, DashboardSummary } from '../types/nuam.ts';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  auditLogs: AuditLog[];
  loading: boolean;
  onRefresh: () => void;
  searchQuery: string;
}

type DashboardTab = 'overview' | 'analytics' | 'simulation';
type AuditMode = 'table' | 'timeline';

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  auditLogs,
  loading,
  onRefresh,
  searchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [auditMode, setAuditMode] = useState<AuditMode>('table');

  const [simMarket, setSimMarket] = useState<'CL' | 'PE' | 'CO'>('CL');
  const [simMonto, setSimMonto] = useState(125000000);
  const [simFactor8, setSimFactor8] = useState(0.273972);
  const [simFactor10, setSimFactor10] = useState(0.145);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q)
    );
  }, [auditLogs, searchQuery]);

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const simCredit = Math.round(simMonto * simFactor8);
  const simWithholding = Math.round(simMonto * simFactor10);
  const simNet = simMonto - simWithholding + simCredit;

  return (
    <div className="space-y-6">
      {/* Page Header & Tab Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-blue-700 dark:text-blue-400 uppercase">
            Consolidado Regional · CL · PE · CO
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight mt-1">
            Panel de Control Tributario
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Supervisión ejecutiva de calificaciones, declaraciones juradas DJ1948 y bitácora de auditoría
          </p>
        </div>

        {/* Segmented Switcher */}
        <div
          role="tablist"
          aria-label="Vistas del panel tributario"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#0B1528] dark:bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Visión General & Auditoría</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#0B1528] dark:bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analítica & Comparativas</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'simulation'}
            onClick={() => setActiveTab('simulation')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-[#0B1528] dark:bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulación & Diagnóstico</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Overview & Audit */}
      {activeTab === 'overview' && (
        <>
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                  TOTAL CALIFICACIONES
                </span>
                <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              </div>
              <div className="mt-4">
                <div className="font-display text-3xl font-bold text-slate-950 dark:text-white tabular-nums">
                  {summary?.totalCalificaciones ?? 0}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Registradas en plataforma</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{summary?.yoyGrowthPct ?? 20}% YoY
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                  CALIFICACIONES VIGENTES
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>
              <div className="mt-4">
                <div className="font-display text-3xl font-bold text-slate-950 dark:text-white tabular-nums">
                  {summary?.vigentes ?? 0}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Aprobadas y aplicables en ejercicio
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                  EN BORRADOR
                </span>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              </div>
              <div className="mt-4">
                <div className="font-display text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {summary?.borrador ?? 0}
                </div>
                <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Pendientes de aprobación normativa
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                  CARGAS DJ1948
                </span>
                <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              </div>
              <div className="mt-4">
                <div className="font-display text-3xl font-bold text-slate-950 dark:text-white tabular-nums">
                  {summary?.cargasDj1948 ?? 0}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Lotes procesados en PostgreSQL
                </div>
              </div>
            </div>
          </div>

          {/* Trazabilidad y Auditoría Reciente */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Trazabilidad y Auditoría Reciente</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Registro inmutable de accesos JWT, modificaciones de montos y presentaciones DJ1948
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setAuditMode('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                      auditMode === 'table'
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>Tabla</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditMode('timeline')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                      auditMode === 'timeline'
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Línea de Tiempo</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {auditMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-5">ACCIÓN</th>
                      <th className="py-3 px-4">MÓDULO</th>
                      <th className="py-3 px-4">USUARIO</th>
                      <th className="py-3 px-4">FECHA / HORA</th>
                      <th className="py-3 px-5">IP / HASH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredLogs.slice(0, 10).map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-mono font-semibold text-slate-950 dark:text-white whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                          {log.module}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {log.userName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-3.5 px-5 font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          <span>{log.ipAddress}</span>
                          <span className="ml-2 text-slate-400 dark:text-slate-500">{log.hashCode}</span>
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                          No existen eventos de auditoría que coincidan con el filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {filteredLogs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-950 dark:text-white">
                        {log.action} <span className="text-slate-400">·</span> {log.module}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {log.detail}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        {log.userName} · {log.ipAddress} {log.hashCode}
                      </div>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: Analytics & Comparisons */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
            <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
              Distribución por Bolsa Regional NUAM
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Comparativa de capital bruto declarado entre Santiago, Lima y Colombia
            </p>
            <div className="space-y-4">
              {(summary?.byMarket ?? []).map((m) => {
                const maxMonto = Math.max(
                  ...(summary?.byMarket.map((x) => x.montoTotal) ?? [1]),
                  1
                );
                const pct = Math.round((m.montoTotal / maxMonto) * 100);
                return (
                  <div key={m.market} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {m.label} · {m.count} calificaciones
                      </span>
                      <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        ${m.montoTotal.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          m.market === 'CL'
                            ? 'bg-blue-600'
                            : m.market === 'PE'
                              ? 'bg-emerald-600'
                              : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
            <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
              Evolución Anual de Calificaciones (2023–2026)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Registros vigentes, en borrador y presentaciones consolidadas DJ1948
            </p>
            <div className="grid grid-cols-4 gap-3 items-end h-44 pt-4">
              {(summary?.byYear ?? []).map((yr) => {
                const total = yr.vigentes + yr.borrador + yr.presentadas;
                const barHeight = Math.min(Math.max(total * 22, 16), 130);
                return (
                  <div key={yr.year} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                      {total}
                    </span>
                    <div
                      className="w-full max-w-[44px] rounded-t-md bg-[#0B1528] dark:bg-blue-500 transition-all"
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {yr.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Simulation & Diagnostics */}
      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
                Simulador de Factores Tributarios DJ1948
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Estime créditos fiscales y retenciones por plaza bursátil antes de aprobar una calificación
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Mercado
                </label>
                <select
                  value={simMarket}
                  onChange={(e) => setSimMarket(e.target.value as 'CL' | 'PE' | 'CO')}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                >
                  <option value="CL">Santiago (CL) — Art. 14 / DJ1948</option>
                  <option value="PE">Lima (PE) — BVL Dividendos</option>
                  <option value="CO">Colombia (CO) — BVC Retención</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Monto Dividendo Bruto
                </label>
                <input
                  type="number"
                  min={0}
                  value={simMonto}
                  onChange={(e) => setSimMonto(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Factor 8 (Crédito IDPC)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  max={1}
                  value={simFactor8}
                  onChange={(e) => setSimFactor8(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Factor 10 (Retención Adicional)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  max={1}
                  value={simFactor10}
                  onChange={(e) => setSimFactor10(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Crédito Estimado</div>
                <div className="font-mono tabular-nums text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${simCredit.toLocaleString('es-CL')}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Retención Aplicada</div>
                <div className="font-mono tabular-nums text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  ${simWithholding.toLocaleString('es-CL')}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Impacto Neto ({simMarket})</div>
                <div className="font-mono tabular-nums text-lg font-bold text-slate-950 dark:text-white mt-0.5">
                  ${simNet.toLocaleString('es-CL')}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
            <h2 className="font-display text-base font-bold text-slate-950 dark:text-white mb-1">
              Diagnóstico de Integridad Tributaria
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Verificación automática sobre registros vigentes y sesiones JWT
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    Factores dentro de rango normativo SII / SUNAT / DIAN
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Todos los emisores vigentes cumplen validación 0.0000 – 1.0000.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    {summary?.borrador ?? 0} registro(s) en estado Borrador
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Requieren revisión de operador o administrador antes de presentar DJ1948.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
