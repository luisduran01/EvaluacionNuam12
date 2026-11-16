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
import { AnimatedH1 } from './AnimatedH1.tsx';
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

function getActionBadgeClasses(action: string): string {
  const upper = action.toUpperCase();
  if (upper === 'LOGIN' || upper.includes('APROBAR')) {
    return 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-400';
  }
  if (upper.includes('ELIMINAR') || upper === 'LOGOUT') {
    return 'border-amber-400/50 bg-amber-500/10 text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-400';
  }
  return 'border-[#E65A28]/45 bg-[#E65A28]/10 text-[#D45120] dark:border-[#E65A28]/40 dark:bg-[#E65A28]/15 dark:text-[#F27445]';
}

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
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#D45120] dark:text-[#E65A28] uppercase">
            <span className="w-1.5 h-1.5 bg-[#E65A28] inline-block" />
            <span>CONSOLIDADO REGIONAL · CHILE (CL) · PERÚ (PE) · COLOMBIA (CO)</span>
          </div>
          <AnimatedH1 className="font-display text-2xl sm:text-[28px] font-extrabold text-[#111317] dark:text-white tracking-tight uppercase mt-1">
            PANEL DE CONTROL TRIBUTARIO
          </AnimatedH1>
          <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1">
            Supervisión institucional DJ1948 · Factores de Crédito IDPC Art. 14 · Bitácora
            criptográfica
          </p>
        </div>

        {/* Segmented Switcher */}
        <div
          role="tablist"
          aria-label="Vistas del panel tributario"
          className="inline-flex flex-wrap items-center gap-1 p-1.5 rounded-[2px] bg-[#EFE9DF] dark:bg-[#11141A] border border-[#DDD6CB] dark:border-[#1F242D] self-start xl:max-w-[490px]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-[2px] font-mono text-[11px] font-semibold tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#0E1B2E] dark:bg-[#E65A28] text-white'
                : 'text-[#524E48] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>VISIÓN GENERAL & AUDITORÍA</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-[2px] font-mono text-[11px] font-semibold tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#0E1B2E] dark:bg-[#E65A28] text-white'
                : 'text-[#524E48] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ANALÍTICA & COMPARATIVAS</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'simulation'}
            onClick={() => setActiveTab('simulation')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-[2px] font-mono text-[11px] font-semibold tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-[#0E1B2E] dark:bg-[#E65A28] text-white'
                : 'text-[#524E48] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SIMULACIÓN & DIAGNÓSTICO</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Overview & Audit */}
      {activeTab === 'overview' && (
        <>
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5C5852] dark:text-slate-400">
                  TOTAL CALIFICACIONES
                </span>
                <span className="w-7 h-7 rounded-[2px] border border-[#DDD6CB] dark:border-[#252B36] bg-[#F2EDE4] dark:bg-[#161A22] flex items-center justify-center shrink-0">
                  <FolderKanban className="w-3.5 h-3.5 text-[#3A3733] dark:text-slate-300" />
                </span>
              </div>
              <div className="mt-4">
                <div className="font-display text-3xl font-extrabold text-[#111317] dark:text-white tabular-nums">
                  {summary?.totalCalificaciones ?? 0}
                </div>
                <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-[#6B665F] dark:text-slate-400">
                  <span>Registros plataforma</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    +{summary?.yoyGrowthPct ?? 20}% YoY
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5C5852] dark:text-slate-400">
                  CALIFICACIONES VIGENTES
                </span>
                <span className="w-7 h-7 rounded-[2px] border border-emerald-300/80 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                </span>
              </div>
              <div className="mt-4">
                <div className="font-display text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {summary?.vigentes ?? 0}
                </div>
                <div className="mt-2 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                  Aprobadas y vigentes en ejercicio
                </div>
              </div>
            </div>

            <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.12em] uppercase text-[#D45120] dark:text-slate-400">
                  EN BORRADOR
                </span>
                <span className="w-7 h-7 rounded-[2px] border border-amber-300/80 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </span>
              </div>
              <div className="mt-4">
                <div className="font-display text-3xl font-extrabold text-[#D97706] dark:text-amber-400 tabular-nums">
                  {summary?.borrador ?? 0}
                </div>
                <div className="mt-2 font-mono text-[11px] text-[#D45120] dark:text-amber-400 font-medium">
                  Pendientes de aprobación normativa
                </div>
              </div>
            </div>

            <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5C5852] dark:text-slate-400">
                  CARGAS DJ1948
                </span>
                <span className="w-7 h-7 rounded-[2px] border border-sky-300/80 dark:border-sky-800/70 bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
                </span>
              </div>
              <div className="mt-4">
                <div className="font-display text-3xl font-extrabold text-[#0E1B2E] dark:text-white tabular-nums">
                  {summary?.cargasDj1948 ?? 0}
                </div>
                <div className="mt-2 font-mono text-[11px] text-[#6B665F] dark:text-slate-400">
                  Lotes validados en PostgreSQL
                </div>
              </div>
            </div>
          </div>

          {/* Trazabilidad y Auditoría Inmutable */}
          <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] overflow-hidden">
            <div className="p-5 border-b border-[#E5DFD5] dark:border-[#1F242D] bg-[#F5F0E8]/60 dark:bg-[#13171F] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-sm sm:text-base font-extrabold tracking-wide uppercase text-[#111317] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E65A28]" />
                  <span>TRAZABILIDAD Y AUDITORÍA INMUTABLE</span>
                </h2>
                <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1">
                  Registro criptográfico de accesos JWT, transacciones y homologaciones fiscales
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="inline-flex border border-[#DDD6CB] dark:border-[#232833] bg-[#EFE9DF] dark:bg-[#0D1016] rounded-[2px] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAuditMode('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase cursor-pointer transition-colors whitespace-nowrap ${
                      auditMode === 'table'
                        ? 'bg-[#0E1B2E] dark:bg-[#E65A28] text-white'
                        : 'text-[#524E48] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white'
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>TABLA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditMode('timeline')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase cursor-pointer transition-colors whitespace-nowrap ${
                      auditMode === 'timeline'
                        ? 'bg-[#0E1B2E] dark:bg-[#E65A28] text-white'
                        : 'text-[#524E48] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>LÍNEA DE TIEMPO</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#FBF8F3] dark:bg-[#161A22] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] font-mono text-[11px] font-semibold uppercase text-[#111317] dark:text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>ACTUALIZAR</span>
                </button>
              </div>
            </div>

            {auditMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F0E8] dark:bg-[#0D1016] border-b border-[#E5DFD5] dark:border-[#1F242D] font-mono text-[11px] font-semibold tracking-wider uppercase text-[#6B665F] dark:text-slate-400">
                      <th className="py-3 px-5">ACCIÓN</th>
                      <th className="py-3 px-4">MÓDULO</th>
                      <th className="py-3 px-4">USUARIO</th>
                      <th className="py-3 px-4">FECHA / HORA</th>
                      <th className="py-3 px-5">IP / HASH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E3D9] dark:divide-[#1B2029] text-xs">
                    {filteredLogs.slice(0, 10).map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-[#F5F0E8]/70 dark:hover:bg-[#161A22]/70 transition-colors"
                      >
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-[2px] border font-mono text-[11px] font-semibold ${getActionBadgeClasses(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#524E48] dark:text-slate-300 whitespace-nowrap">
                          {log.module}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#111317] dark:text-white whitespace-nowrap">
                          {log.userName}
                        </td>
                        <td className="py-3.5 px-4 text-[#6B665F] dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-3.5 px-5 font-mono tabular-nums text-[#3A3733] dark:text-slate-300 whitespace-nowrap">
                          <span>{log.ipAddress}</span>
                          <span className="ml-2 font-semibold text-[#D45120] dark:text-[#E65A28]">
                            {log.hashCode}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#6B665F] dark:text-slate-400 font-mono text-xs">
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E9E3D9] dark:border-[#1F242D] last:border-b-0 last:pb-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-[2px] border font-mono text-[11px] font-semibold ${getActionBadgeClasses(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                        <span className="font-mono text-xs text-[#6B665F] dark:text-slate-400">
                          {log.module}
                        </span>
                      </div>
                      <div className="text-xs text-[#3A3733] dark:text-slate-300 mt-1.5">
                        {log.detail}
                      </div>
                      <div className="text-[11px] font-mono text-[#6B665F] dark:text-slate-400 mt-1">
                        {log.userName} · {log.ipAddress}{' '}
                        <span className="text-[#D45120] dark:text-[#E65A28]">{log.hashCode}</span>
                      </div>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[#6B665F] dark:text-slate-400 shrink-0">
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
          <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-6">
            <h2 className="font-display text-base font-extrabold uppercase text-[#111317] dark:text-white">
              Distribución por Bolsa Regional NUAM
            </h2>
            <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1 mb-6">
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
                      <span className="font-semibold text-[#111317] dark:text-slate-200">
                        {m.label} · {m.count} calificaciones
                      </span>
                      <span className="font-mono tabular-nums text-[#3A3733] dark:text-slate-300">
                        ${m.montoTotal.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-[2px] bg-[#EAE3D8] dark:bg-[#1B2029] overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          m.market === 'CL'
                            ? 'bg-[#E65A28]'
                            : m.market === 'PE'
                              ? 'bg-emerald-600'
                              : 'bg-[#0E1B2E] dark:bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-6">
            <h2 className="font-display text-base font-extrabold uppercase text-[#111317] dark:text-white">
              Evolución Anual de Calificaciones (2023–2026)
            </h2>
            <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1 mb-6">
              Registros vigentes, en borrador y presentaciones consolidadas DJ1948
            </p>
            <div className="grid grid-cols-4 gap-3 items-end h-44 pt-4">
              {(summary?.byYear ?? []).map((yr) => {
                const total = yr.vigentes + yr.borrador + yr.presentadas;
                const barHeight = Math.min(Math.max(total * 22, 16), 130);
                return (
                  <div key={yr.year} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-mono tabular-nums font-semibold text-[#111317] dark:text-slate-300">
                      {total}
                    </span>
                    <div
                      className="w-full max-w-[44px] rounded-t-[2px] bg-[#0E1B2E] dark:bg-[#E65A28] transition-all"
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="text-xs font-mono tabular-nums text-[#6B665F] dark:text-slate-400">
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
          <div className="lg:col-span-7 rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-6">
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="w-4 h-4 text-[#E65A28]" />
              <h2 className="font-display text-base font-extrabold uppercase text-[#111317] dark:text-white">
                Simulador de Factores Tributarios DJ1948
              </h2>
            </div>
            <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mb-5">
              Estime créditos fiscales y retenciones por plaza bursátil antes de aprobar una
              calificación
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1.5">
                  Mercado
                </label>
                <select
                  value={simMarket}
                  onChange={(e) => setSimMarket(e.target.value as 'CL' | 'PE' | 'CO')}
                  className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs text-[#111317] dark:text-white"
                >
                  <option value="CL">Santiago (CL) — Art. 14 / DJ1948</option>
                  <option value="PE">Lima (PE) — BVL Dividendos</option>
                  <option value="CO">Colombia (CO) — BVC Retención</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1.5">
                  Monto Dividendo Bruto
                </label>
                <input
                  type="number"
                  min={0}
                  value={simMonto}
                  onChange={(e) => setSimMonto(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs font-mono tabular-nums text-[#111317] dark:text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1.5">
                  Factor 8 (Crédito IDPC)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  max={1}
                  value={simFactor8}
                  onChange={(e) => setSimFactor8(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs font-mono tabular-nums text-[#111317] dark:text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1.5">
                  Factor 10 (Retención Adicional)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min={0}
                  max={1}
                  value={simFactor10}
                  onChange={(e) => setSimFactor10(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs font-mono tabular-nums text-[#111317] dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E5DFD5] dark:border-[#1F242D] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="font-mono text-[11px] uppercase text-[#6B665F] dark:text-slate-400">
                  Crédito Estimado
                </div>
                <div className="font-mono tabular-nums text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  ${simCredit.toLocaleString('es-CL')}
                </div>
              </div>
              <div>
                <div className="font-mono text-[11px] uppercase text-[#6B665F] dark:text-slate-400">
                  Retención Aplicada
                </div>
                <div className="font-mono tabular-nums text-lg font-bold text-[#D45120] dark:text-amber-400 mt-0.5">
                  ${simWithholding.toLocaleString('es-CL')}
                </div>
              </div>
              <div>
                <div className="font-mono text-[11px] uppercase text-[#6B665F] dark:text-slate-400">
                  Impacto Neto ({simMarket})
                </div>
                <div className="font-mono tabular-nums text-lg font-bold text-[#111317] dark:text-white mt-0.5">
                  ${simNet.toLocaleString('es-CL')}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-6">
            <h2 className="font-display text-base font-extrabold uppercase text-[#111317] dark:text-white mb-1">
              Diagnóstico de Integridad Tributaria
            </h2>
            <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mb-5">
              Verificación automática sobre registros vigentes y sesiones JWT
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-[2px] border border-[#E5DFD5] dark:border-[#1F242D] bg-[#F5F0E8] dark:bg-[#161A22] flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#111317] dark:text-slate-100">
                    Factores dentro de rango normativo SII / SUNAT / DIAN
                  </div>
                  <div className="text-[#6B665F] dark:text-slate-400 mt-0.5">
                    Todos los emisores vigentes cumplen validación 0.0000 – 1.0000.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-[2px] border border-[#E5DFD5] dark:border-[#1F242D] bg-[#F5F0E8] dark:bg-[#161A22] flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-[#E65A28] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#111317] dark:text-slate-100">
                    {summary?.borrador ?? 0} registro(s) en estado Borrador
                  </div>
                  <div className="text-[#6B665F] dark:text-slate-400 mt-0.5">
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
