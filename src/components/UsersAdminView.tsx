import React, { useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  Lock,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import type {
  AuthSession,
  MarketCode,
  NuamUser,
  RoleDefinition,
  UserRole,
} from '../types/nuam.ts';

interface UsersAdminViewProps {
  users: NuamUser[];
  roles: RoleDefinition[];
  currentUserId: string;
  permissions: AuthSession['permissions'];
  searchQuery: string;
  onCreateUser: (payload: {
    email: string;
    fullName: string;
    role: UserRole;
    market: MarketCode;
    password?: string;
  }) => Promise<void>;
  onUpdateUser: (
    id: string,
    payload: Partial<{
      fullName: string;
      role: UserRole;
      market: MarketCode;
      active: boolean;
      password?: string;
    }>
  ) => Promise<void>;
  onDeleteUser: (user: NuamUser) => Promise<void>;
}

export const UsersAdminView: React.FC<UsersAdminViewProps> = ({
  users,
  roles,
  currentUserId,
  permissions,
  searchQuery,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<NuamUser | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('operador');
  const [market, setMarket] = useState<MarketCode>('CL');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const combinedSearch = (localSearch || searchQuery).trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (combinedSearch) {
        return (
          u.fullName.toLowerCase().includes(combinedSearch) ||
          u.email.toLowerCase().includes(combinedSearch) ||
          u.market.toLowerCase().includes(combinedSearch)
        );
      }
      return true;
    });
  }, [users, roleFilter, combinedSearch]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setPassword('nuam2026!');
    setRole('operador');
    setMarket('CL');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (u: NuamUser) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setMarket(u.market);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingUser) {
        await onUpdateUser(editingUser.id, {
          fullName,
          role,
          market,
          ...(password.trim() ? { password: password.trim() } : {}),
        });
      } else {
        await onCreateUser({
          email,
          fullName,
          role,
          market,
          password: password.trim() || 'nuam2026!',
        });
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrador',
    operador: 'Operador',
    consultor: 'Consultor',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#D45120] dark:text-[#E65A28] uppercase">
            <span className="w-1.5 h-1.5 bg-[#E65A28] inline-block" />
            <span>SEGURIDAD & GOBIERNO CORPORATIVO</span>
          </div>
          <h1 className="font-display text-2xl sm:text-[28px] font-extrabold text-[#111317] dark:text-white tracking-tight uppercase mt-1">
            ADMINISTRACIÓN DE USUARIOS Y ROLES
          </h1>
          <p className="font-mono text-xs text-[#6B665F] dark:text-slate-400 mt-1">
            Control de acceso basado en roles (RBAC) en Django + Supabase PostgreSQL con tokens JWT
          </p>
        </div>

        {permissions.manageUsers ? (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[2px] bg-[#E65A28] hover:bg-[#D14D1E] text-white text-xs font-semibold cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Usuario</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] font-mono text-xs text-[#6B665F] dark:text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Solo administradores pueden modificar roles y usuarios</span>
          </div>
        )}
      </div>

      {/* Role Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((r) => {
          const count = users.filter((u) => u.role === r.role).length;
          return (
            <div
              key={r.role}
              className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield
                    className={`w-4 h-4 ${
                      r.role === 'admin'
                        ? 'text-[#E65A28]'
                        : r.role === 'operador'
                          ? 'text-[#0E1B2E] dark:text-sky-400'
                          : 'text-emerald-600'
                    }`}
                  />
                  <h2 className="font-display text-sm font-extrabold uppercase text-[#111317] dark:text-white">
                    {r.label}
                  </h2>
                </div>
                <span className="font-mono tabular-nums text-xs font-semibold text-[#6B665F] dark:text-slate-400">
                  {count} cuentas
                </span>
              </div>
              <p className="text-xs text-[#5C5852] dark:text-slate-400 mt-2 leading-relaxed">
                {r.description}
              </p>
              <div className="mt-4 pt-3 border-t border-[#E5DFD5] dark:border-[#1F242D] grid grid-cols-2 gap-y-1.5 font-mono text-[11px]">
                <span className="flex items-center gap-1.5 text-[#3A3733] dark:text-slate-300">
                  {r.permissions.createQualification ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#8B857C]" />
                  )}
                  Calificaciones
                </span>
                <span className="flex items-center gap-1.5 text-[#3A3733] dark:text-slate-300">
                  {r.permissions.uploadDj1948 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#8B857C]" />
                  )}
                  Carga DJ1948
                </span>
                <span className="flex items-center gap-1.5 text-[#3A3733] dark:text-slate-300">
                  {r.permissions.exportReports ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#8B857C]" />
                  )}
                  Reportes
                </span>
                <span className="flex items-center gap-1.5 text-[#3A3733] dark:text-slate-300">
                  {r.permissions.manageUsers ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[#8B857C]" />
                  )}
                  Admin Usuarios
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8B857C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar usuario por nombre, correo o plaza..."
            className="w-full h-10 pl-9 pr-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] font-mono text-xs text-[#111317] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E65A28]"
          />
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-[2px] bg-[#EFE9DF] dark:bg-[#0D1016] border border-[#DDD6CB] dark:border-[#232833] self-start sm:self-auto">
          {(['ALL', 'admin', 'operador', 'consultor'] as const).map((rf) => (
            <button
              key={rf}
              type="button"
              onClick={() => setRoleFilter(rf)}
              className={`px-3 py-1.5 rounded-[2px] font-mono text-[11px] font-semibold uppercase cursor-pointer transition-colors whitespace-nowrap ${
                roleFilter === rf
                  ? 'bg-[#0E1B2E] dark:bg-[#E65A28] text-white'
                  : 'text-[#524E48] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white'
              }`}
            >
              {rf === 'ALL' ? 'Todos' : roleLabels[rf]}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-[2px] border border-[#DFD8CD] dark:border-[#1F242D] bg-[#FBF8F3] dark:bg-[#11141A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F0E8] dark:bg-[#0D1016] border-b border-[#E5DFD5] dark:border-[#1F242D] font-mono text-[11px] font-semibold tracking-wider uppercase text-[#6B665F] dark:text-slate-400">
                <th className="py-3 px-5">USUARIO</th>
                <th className="py-3 px-4">ROL ASIGNADO</th>
                <th className="py-3 px-4">PLAZA</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-4">ÚLTIMO ACCESO</th>
                <th className="py-3 px-5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3D9] dark:divide-[#1B2029] text-xs">
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-[#F5F0E8]/70 dark:hover:bg-[#161A22]/70 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#111317] dark:text-white">{u.fullName}</div>
                    <div className="font-mono text-[11px] text-[#6B665F] dark:text-slate-400 mt-0.5">
                      {u.email}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#3A3733] dark:text-slate-200">
                    {roleLabels[u.role]}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#524E48] dark:text-slate-300">
                    {u.market}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[2px] border font-mono text-[11px] font-semibold ${
                        u.active
                          ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'border-slate-400/40 bg-slate-500/10 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {u.active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-[#6B665F] dark:text-slate-400 whitespace-nowrap">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('es-CL') : 'Sin ingresos'}
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    {permissions.manageUsers ? (
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          title="Editar usuario y rol"
                          className="p-1.5 rounded-[2px] text-[#6B665F] hover:text-[#E65A28] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {u.id !== currentUserId && (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateUser(u.id, { active: !u.active })}
                              title={u.active ? 'Desactivar cuenta' : 'Activar cuenta'}
                              className="p-1.5 rounded-[2px] text-[#6B665F] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                            >
                              {u.active ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteUser(u)}
                              title="Eliminar usuario"
                              className="p-1.5 rounded-[2px] text-[#6B665F] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#8B857C]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-[2px] bg-[#FBF8F3] dark:bg-[#11141A] border border-[#DFD8CD] dark:border-[#232833] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-extrabold uppercase text-base text-[#111317] dark:text-white">
                {editingUser ? 'Editar Usuario y Rol' : 'Registrar Nuevo Usuario Corporativo'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-[2px] text-[#6B665F] hover:bg-[#EFE9DF] dark:hover:bg-[#1E232E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-[2px] bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs text-[#111317] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1">
                  Correo Institucional
                </label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingUser)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs text-[#111317] dark:text-white disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1">
                  {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña Inicial'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
                  className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs text-[#111317] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1">
                    Rol RBAC
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs text-[#111317] dark:text-white"
                  >
                    <option value="admin">Administrador</option>
                    <option value="operador">Operador</option>
                    <option value="consultor">Consultor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[#3A3733] dark:text-slate-300 mb-1">
                    Plaza Regional
                  </label>
                  <select
                    value={market}
                    onChange={(e) => setMarket(e.target.value as MarketCode)}
                    className="w-full h-10 px-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F2EDE4] dark:bg-[#151921] text-xs text-[#111317] dark:text-white"
                  >
                    <option value="REGIONAL">REGIONAL</option>
                    <option value="CL">CL (Santiago)</option>
                    <option value="PE">PE (Lima)</option>
                    <option value="CO">CO (Colombia)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] text-xs font-medium text-[#3A3733] dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-[2px] bg-[#0E1B2E] dark:bg-[#E65A28] hover:bg-[#162742] dark:hover:bg-[#D14D1E] text-white text-xs font-semibold cursor-pointer"
                >
                  {submitting ? 'Guardando...' : editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
