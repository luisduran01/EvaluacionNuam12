import React, { useEffect, useState } from 'react';
import { CheckCircle2, Send, X } from 'lucide-react';
import type {
  QualificationMarket,
  QualificationStatus,
  TaxQualification,
} from '../types/nuam.ts';

interface QualificationModalProps {
  open: boolean;
  editing: TaxQualification | null;
  onClose: () => void;
  onSave: (payload: Partial<TaxQualification>) => Promise<void>;
}

export const QualificationModal: React.FC<QualificationModalProps> = ({
  open,
  editing,
  onClose,
  onSave,
}) => {
  const [emisor, setEmisor] = useState('');
  const [rutEmisor, setRutEmisor] = useState('');
  const [mercado, setMercado] = useState<QualificationMarket>('CL');
  const [ejercicio, setEjercicio] = useState(2024);
  const [tipoRenta, setTipoRenta] = useState('Dividendos Ordinarios DJ1948');
  const [montoBruto, setMontoBruto] = useState(75000000);
  const [factor8, setFactor8] = useState(0.273972);
  const [factor10, setFactor10] = useState(0.145);
  const [factor15, setFactor15] = useState(0.05);
  const [estado, setEstado] = useState<QualificationStatus>('VIGENTE');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setEmisor(editing.emisor);
      setRutEmisor(editing.rutEmisor);
      setMercado(editing.mercado);
      setEjercicio(editing.ejercicio);
      setTipoRenta(editing.tipoRenta);
      setMontoBruto(editing.montoBruto);
      setFactor8(editing.factor8);
      setFactor10(editing.factor10);
      setFactor15(editing.factor15);
      setEstado(editing.estado);
    } else {
      setEmisor('');
      setRutEmisor('');
      setMercado('CL');
      setEjercicio(2024);
      setTipoRenta('Dividendos Ordinarios DJ1948');
      setMontoBruto(75000000);
      setFactor8(0.273972);
      setFactor10(0.145);
      setFactor15(0.05);
      setEstado('VIGENTE');
    }
  }, [editing, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        emisor,
        rutEmisor,
        mercado,
        ejercicio,
        tipoRenta,
        montoBruto,
        factor8,
        factor10,
        factor15,
        estado,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base text-slate-950 dark:text-white">
            {editing ? 'Editar Calificación Tributaria' : 'Nueva Calificación Tributaria'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Razón Social Emisor
              </label>
              <input
                type="text"
                required
                value={emisor}
                onChange={(e) => setEmisor(e.target.value)}
                placeholder="Ej. Latam Airlines Group S.A."
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                RUT / RUC / NIT Emisor
              </label>
              <input
                type="text"
                required
                value={rutEmisor}
                onChange={(e) => setRutEmisor(e.target.value)}
                placeholder="89.862.200-2"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mercado
              </label>
              <select
                value={mercado}
                onChange={(e) => setMercado(e.target.value as QualificationMarket)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              >
                <option value="CL">CL (Santiago)</option>
                <option value="PE">PE (Lima)</option>
                <option value="CO">CO (Colombia)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Ejercicio
              </label>
              <select
                value={ejercicio}
                onChange={(e) => setEjercicio(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as QualificationStatus)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              >
                <option value="VIGENTE">Vigente</option>
                <option value="BORRADOR">Borrador</option>
                <option value="PRESENTADO">Presentado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Renta
              </label>
              <input
                type="text"
                required
                value={tipoRenta}
                onChange={(e) => setTipoRenta(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Monto Bruto
              </label>
              <input
                type="number"
                required
                min={0}
                value={montoBruto}
                onChange={(e) => setMontoBruto(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Factor 8
              </label>
              <input
                type="number"
                step="0.000001"
                value={factor8}
                onChange={(e) => setFactor8(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Factor 10
              </label>
              <input
                type="number"
                step="0.000001"
                value={factor10}
                onChange={(e) => setFactor10(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Factor 15
              </label>
              <input
                type="number"
                step="0.000001"
                value={factor15}
                onChange={(e) => setFactor15(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Guardar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PresentModalProps {
  open: boolean;
  onClose: () => void;
  onPresent: (year: number) => Promise<{ presentedCount: number; folio: string }>;
}

export const PresentDj1948Modal: React.FC<PresentModalProps> = ({ open, onClose, onPresent }) => {
  const [year, setYear] = useState(2024);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ presentedCount: number; folio: string } | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await onPresent(year);
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base text-slate-950 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            <span>Presentar Declaración Jurada DJ1948</span>
          </h3>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Presentación Emitida Exitosamente</span>
              </div>
              <p>
                Folio de envío: <span className="font-mono font-bold">{result.folio}</span>
              </p>
              <p className="mt-1">
                Calificaciones marcadas como PRESENTADO: {result.presentedCount}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 text-white text-xs font-semibold cursor-pointer"
              >
                Finalizar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Se consolidarán todas las calificaciones vigentes del ejercicio seleccionado y se
              generará el folio oficial de presentación regional NUAM.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Año Tributario a Presentar
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                {submitting ? 'Enviando...' : 'Confirmar Presentación'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
