import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  FolderUp,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { downloadDj1948TemplateCsv } from '../lib/api.ts';
import type { AuthSession, Dj1948Batch } from '../types/nuam.ts';

interface Dj1948ViewProps {
  batches: Dj1948Batch[];
  permissions: AuthSession['permissions'];
  onRefresh: () => void;
  onUpload: (payload: {
    fileName: string;
    ejercicio: number;
    processType: string;
    content: string;
  }) => Promise<void>;
  onDeleteBatch: (batch: Dj1948Batch) => Promise<void>;
}

const SAMPLE_CSV = [
  'EMISOR;RUT_EMISOR;MERCADO;EJERCICIO;TIPO_RENTA;MONTO_BRUTO;FACTOR_8;FACTOR_10;FACTOR_15;ESTADO',
  'Cencosud S.A.;93.834.000-5;CL;2024;Dividendos Ordinarios DJ1948;84500000;0.273972;0.145;0.05;VIGENTE',
  'Ferreycorp S.A.A.;20100028698;PE;2024;Dividendos Acciones Comunes;51200000;0.05;0.295;0.0;VIGENTE',
  'Grupo Energía Bogotá S.A.;899.999.082-3;CO;2024;Distribución Utilidades Gravadas;76800000;0.1;0.35;0.075;BORRADOR',
].join('\n');

export const Dj1948View: React.FC<Dj1948ViewProps> = ({
  batches,
  permissions,
  onRefresh,
  onUpload,
  onDeleteBatch,
}) => {
  const [ejercicio, setEjercicio] = useState(2024);
  const [processType, setProcessType] = useState(
    'Declaración Jurada 1948 (Retiros y Dividendos Distribuidos)'
  );
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    content: string;
    rows: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const readFile = (file: File) => {
    setFeedback(null);
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const lineCount = content.split(/\r?\n/).filter((l) => l.trim().length > 0).length;
      setSelectedFile({
        name: file.name,
        content,
        rows: Math.max(lineCount - 1, 0),
      });
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const handleLoadSample = () => {
    setFeedback(null);
    setSelectedFile({
      name: `DJ1948_${ejercicio}_LOTE_EJEMPLO.csv`,
      content: SAMPLE_CSV,
      rows: 3,
    });
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setFeedback({
        type: 'error',
        message: 'Seleccione o arrastre un archivo DJ1948 (.csv o .txt) antes de procesar.',
      });
      return;
    }
    setUploading(true);
    setFeedback(null);
    try {
      await onUpload({
        fileName: selectedFile.name,
        ejercicio,
        processType,
        content: selectedFile.content,
      });
      setFeedback({
        type: 'success',
        message: `Archivo ${selectedFile.name} procesado en PostgreSQL (Supabase/Django) e incorporado al historial.`,
      });
      setSelectedFile(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al procesar archivo DJ1948.',
      });
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#D45120] dark:text-[#E65A28] uppercase">
          <span className="w-1.5 h-1.5 bg-[#E65A28] inline-block" />
          <span>PROCESAMIENTO NORMATIVO SII / BVL / BVC</span>
        </div>
        <h1 className="font-display text-2xl sm:text-[28px] font-extrabold text-[#111317] dark:text-white tracking-tight uppercase mt-1">
          MÓDULO DE CARGA MASIVA (DJ1948)
        </h1>
      </div>

      {/* Main Upload Card */}
      <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-base sm:text-lg font-extrabold uppercase text-[#111317] dark:text-white">
              Cargar Declaración Jurada DJ1948
            </h2>
            <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1 max-w-2xl">
              Seleccione el archivo plano (.csv o .txt) correspondiente al Formulario DJ1948 para la
              incorporación automática de registros y factores de calificación tributaria.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadDj1948TemplateCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F5F0E8] dark:bg-[#161A22] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] font-mono text-[11px] font-semibold uppercase text-[#111317] dark:text-slate-200 cursor-pointer whitespace-nowrap shrink-0 self-start"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Plantilla CSV</span>
          </button>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5">
          <div className="md:col-span-3">
            <label
              htmlFor="dj-year"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#3A3733] dark:text-slate-300 mb-1.5"
            >
              Año Tributario
            </label>
            <select
              id="dj-year"
              value={ejercicio}
              onChange={(e) => setEjercicio(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs font-mono font-medium text-[#111317] dark:text-white"
            >
              <option value={2026}>2026 (Vigente)</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024 (Vigente)</option>
              <option value={2023}>2023</option>
            </select>
          </div>

          <div className="md:col-span-9">
            <label
              htmlFor="dj-process"
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#3A3733] dark:text-slate-300 mb-1.5"
            >
              Tipo de Proceso
            </label>
            <select
              id="dj-process"
              value={processType}
              onChange={(e) => setProcessType(e.target.value)}
              className="w-full h-11 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs font-medium text-[#111317] dark:text-white"
            >
              <option value="Declaración Jurada 1948 (Retiros y Dividendos Distribuidos)">
                Declaración Jurada 1948 (Retiros y Dividendos Distribuidos)
              </option>
              <option value="Declaración Jurada 1922 (Fondos Mutuos y de Inversión)">
                Declaración Jurada 1922 (Fondos Mutuos y de Inversión)
              </option>
              <option value="Calificación de Factores Bursátiles NUAM">
                Calificación de Factores Bursátiles NUAM
              </option>
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => permissions.uploadDj1948 && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (permissions.uploadDj1948) fileInputRef.current?.click();
            }
          }}
          className={`rounded-[2px] border border-dashed p-10 text-center transition-colors ${
            permissions.uploadDj1948 ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
          } ${
            dragActive
              ? 'border-[#E65A28] bg-[#E65A28]/10'
              : 'border-[#C9C1B4] dark:border-[#2C3340] bg-[#F2EDE4]/60 dark:bg-[#151921]/70 hover:border-[#E65A28]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
            }}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <FileText className="w-9 h-9 text-[#E65A28] mb-3" />
              <p className="text-sm font-semibold text-[#111317] dark:text-white">
                {selectedFile.name}
              </p>
              <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1 tabular-nums">
                {selectedFile.rows} filas detectadas listas para validación
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FolderUp className="w-9 h-9 text-[#E65A28] mb-3" />
              <p className="text-sm font-semibold text-[#111317] dark:text-white">
                Haga clic o arrastre el archivo DJ1948 aquí
              </p>
              <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1">
                Soporta formatos CSV y TXT delimitados por punto y coma (;) o comas (,)
              </p>
            </div>
          )}
        </div>

        {feedback && (
          <div
            className={`mt-4 p-3 rounded-[2px] border text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {permissions.uploadDj1948 ? (
            <button
              type="button"
              onClick={handleLoadSample}
              className="font-mono text-xs font-semibold text-[#D45120] dark:text-[#E65A28] hover:underline cursor-pointer"
            >
              Cargar lote de ejemplo corporativo
            </button>
          ) : (
            <span className="font-mono text-xs text-[#6B665F]">
              Modo Consultor: acceso de solo lectura al historial de cargas.
            </span>
          )}

          {permissions.uploadDj1948 && (
            <button
              type="button"
              onClick={handleProcess}
              disabled={uploading}
              className="px-5 py-2.5 rounded-[2px] bg-[#0E1B2E] dark:bg-[#E65A28] hover:bg-[#162742] dark:hover:bg-[#D14D1E] disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {uploading ? 'Procesando en Supabase...' : 'Procesar Carga Masiva'}
            </button>
          )}
        </div>
      </div>

      {/* Historial de Procesamiento de Cargas */}
      <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] overflow-hidden">
        <div className="p-5 border-b border-[#E5DFD5] dark:border-[#1F242D] bg-[#F5F0E8]/60 dark:bg-[#13171F] flex items-center justify-between gap-4">
          <h2 className="font-display text-sm sm:text-base font-extrabold uppercase text-[#111317] dark:text-white">
            Historial de Procesamiento de Cargas
          </h2>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#FBF8F3] dark:bg-[#161A22] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] font-mono text-[11px] font-semibold uppercase text-[#111317] dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refrescar Historial</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F0E8] dark:bg-[#0D1016] border-b border-[#E5DFD5] dark:border-[#1F242D] font-mono text-[11px] font-semibold tracking-wider uppercase text-[#6B665F] dark:text-slate-400">
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-4">NOMBRE DE ARCHIVO</th>
                <th className="py-3 px-4">EJERCICIO</th>
                <th className="py-3 px-4">PROCESADOS</th>
                <th className="py-3 px-4">EXITOSOS / ERRORES</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-4">FECHA DE EJECUCIÓN</th>
                <th className="py-3 px-5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3D9] dark:divide-[#1B2029] text-xs">
              {batches.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-[#F5F0E8]/70 dark:hover:bg-[#161A22]/70 transition-colors"
                >
                  <td className="py-3.5 px-5 font-mono tabular-nums text-[#524E48] dark:text-slate-300">
                    #{b.displayId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#111317] dark:text-white whitespace-nowrap">
                    {b.fileName}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-[#524E48] dark:text-slate-300">
                    {b.ejercicio}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-[#111317] dark:text-slate-200">
                    {b.processedCount}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {b.successCount}
                    </span>
                    <span className="mx-1 text-[#8B857C]">/</span>
                    <span className="font-semibold text-[#D45120] dark:text-red-400">
                      {b.errorCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[2px] border font-mono text-[11px] font-semibold ${
                        b.estado === 'EXITOSO'
                          ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'border-[#E65A28]/50 bg-[#E65A28]/10 text-[#D45120] dark:text-[#F27445]'
                      }`}
                    >
                      {b.estado}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-[#6B665F] dark:text-slate-400 whitespace-nowrap">
                    {formatDate(b.createdAt)}
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    {permissions.deleteQualification ? (
                      <button
                        type="button"
                        onClick={() => onDeleteBatch(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] border border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-mono text-[11px] font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                    ) : (
                      <span className="text-[#8B857C]">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center font-mono text-[#6B665F] text-xs">
                    No hay cargas masivas registradas aún.
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
