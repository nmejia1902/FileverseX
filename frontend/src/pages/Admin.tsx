import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  canUpload: boolean
  canDownload: boolean
  canShare: boolean
  canViewReports: boolean
  storageQuotaMB: number | null
  usedStorageBytes: number
  usedStorageMB: number
}

interface NewUserForm {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  storageQuotaMB: number | '' // '' cuando vacío
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newUser, setNewUser] = useState<NewUserForm>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    storageQuotaMB: '',
  })

  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: 'Bearer ' + token } : {}

  // ===================== CARGAR USUARIOS =====================
  const loadUsers = async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get('http://localhost:4000/api/admin/users', {
        headers,
      })
      setUsers(res.data.users)
    } catch (err: any) {
      console.error('Error cargando usuarios admin', err)
      setError(
        err?.response?.data?.message ||
          'Error cargando usuarios. ¿Eres admin y el backend está corriendo?'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [token])

  // ===================== ACTUALIZAR USUARIO (PATCH) =====================
  const patchUser = async (
    id: number,
    data: Partial<{
      canUpload: boolean
      canDownload: boolean
      canShare: boolean
      canViewReports: boolean
      storageQuotaMB: number | null
      role: string
    }>
  ) => {
    if (!token) {
      alert('Debes iniciar sesión')
      return
    }
    try {
      setSavingId(id)
      await axios.patch(`http://localhost:4000/api/admin/users/${id}`, data, {
        headers,
      })
      // Actualizamos localmente sin recargar todo
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data } as AdminUser : u))
      )
    } catch (err: any) {
      console.error('Error actualizando usuario', err)
      alert(err?.response?.data?.message || 'Error actualizando usuario')
    } finally {
      setSavingId(null)
    }
  }

  // ===================== ELIMINAR USUARIO =====================
  const deleteUser = async (id: number) => {
    if (!token) {
      alert('Debes iniciar sesión')
      return
    }
    const ok = window.confirm('¿Seguro que deseas eliminar este usuario?')
    if (!ok) return

    try {
      await axios.delete(`http://localhost:4000/api/admin/users/${id}`, {
        headers,
      })
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err: any) {
      console.error('Error eliminando usuario', err)
      alert(err?.response?.data?.message || 'Error eliminando usuario')
    }
  }

  // ===================== CREAR USUARIO =====================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      alert('Debes iniciar sesión')
      return
    }

    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Nombre, email y contraseña son obligatorios')
      return
    }

    try {
      setCreating(true)
      const payload: any = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      }

      if (newUser.storageQuotaMB !== '') {
        payload.storageQuotaMB = Number(newUser.storageQuotaMB)
      }

      const res = await axios.post(
        'http://localhost:4000/api/admin/users',
        payload,
        { headers }
      )

      // recargamos lista
      await loadUsers()

      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        storageQuotaMB: '',
      })

      alert('Usuario creado correctamente')
    } catch (err: any) {
      console.error('Error creando usuario', err)
      alert(err?.response?.data?.message || 'Error creando usuario')
    } finally {
      setCreating(false)
    }
  }

  // ===================== TOGGLES =====================
  const toggleField = (user: AdminUser, field: keyof AdminUser) => {
    const value = !(user as any)[field]
    patchUser(user.id, { [field]: value } as any)
  }

  // ===================== RENDER =====================
  const chartData = users.map((u) => ({
    name: u.name || u.email,
    used: u.usedStorageMB,
    quota: u.storageQuotaMB ?? 0,
  }))

  const formatMB = (mb: number | null | undefined) =>
    mb == null ? 'Sin límite' : `${mb.toFixed(2)} MB`

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-200">
      <h1 className="text-2xl sm:text-3xl font-bold">Panel de administración</h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* CREAR USUARIO */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Crear usuario
        </h2>
        <form
          onSubmit={handleCreateUser}
          className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 items-end"
        >
          <div className="flex flex-col text-xs">
            <label className="mb-1 text-gray-700 dark:text-gray-300">
              Nombre
            </label>
            <input
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
              value={newUser.name}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col text-xs">
            <label className="mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
              value={newUser.email}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col text-xs">
            <label className="mb-1 text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <input
              type="password"
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
              value={newUser.password}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col text-xs">
            <label className="mb-1 text-gray-700 dark:text-gray-300">
              Rol
            </label>
            <select
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
              value={newUser.role}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, role: e.target.value as any }))
              }
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col text-xs">
            <label className="mb-1 text-gray-700 dark:text-gray-300">
              Cuota (MB) (opcional)
            </label>
            <input
              type="number"
              min={0}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
              value={newUser.storageQuotaMB}
              onChange={(e) =>
                setNewUser((prev) => ({
                  ...prev,
                  storageQuotaMB: e.target.value === '' ? '' : Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="flex text-xs mt-2 sm:mt-0">
            <button
              type="submit"
              disabled={creating}
              className="self-end bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              {creating ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </section>

      {/* GRÁFICO DE ALMACENAMIENTO */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Uso de almacenamiento por usuario
        </h2>
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay usuarios para mostrar.
          </p>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" hide={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="used" name="Usado (MB)" />
                <Bar dataKey="quota" name="Cuota (MB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* TABLA DE USUARIOS */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Usuarios registrados
          </h2>
          {loading && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Cargando...
            </span>
          )}
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay usuarios registrados.
          </p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  <th className="py-2 px-2 text-left">ID</th>
                  <th className="py-2 px-2 text-left">Nombre</th>
                  <th className="py-2 px-2 text-left">Email</th>
                  <th className="py-2 px-2 text-left">Rol</th>
                  <th className="py-2 px-2 text-center">Subir</th>
                  <th className="py-2 px-2 text-center">Descargar</th>
                  <th className="py-2 px-2 text-center">Compartir</th>
                  <th className="py-2 px-2 text-center">Reportes</th>
                  <th className="py-2 px-2 text-center">Cuota</th>
                  <th className="py-2 px-2 text-center">Usado</th>
                  <th className="py-2 px-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <td className="py-2 px-2 align-middle">{u.id}</td>
                    <td className="py-2 px-2 align-middle">{u.name}</td>
                    <td className="py-2 px-2 align-middle">{u.email}</td>
                    <td className="py-2 px-2 align-middle">
                      <select
                        className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                        value={u.role}
                        onChange={(e) =>
                          patchUser(u.id, { role: e.target.value })
                        }
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>

                    {/* TOGGLES */}
                    <td className="py-2 px-2 text-center align-middle">
                      <Toggle
                        checked={u.canUpload}
                        onChange={() => toggleField(u, 'canUpload')}
                      />
                    </td>
                    <td className="py-2 px-2 text-center align-middle">
                      <Toggle
                        checked={u.canDownload}
                        onChange={() => toggleField(u, 'canDownload')}
                      />
                    </td>
                    <td className="py-2 px-2 text-center align-middle">
                      <Toggle
                        checked={u.canShare}
                        onChange={() => toggleField(u, 'canShare')}
                      />
                    </td>
                    <td className="py-2 px-2 text-center align-middle">
                      <Toggle
                        checked={u.canViewReports}
                        onChange={() => toggleField(u, 'canViewReports')}
                      />
                    </td>

                    {/* CUOTA + USO */}
                    <td className="py-2 px-2 text-center align-middle">
                      <input
                        type="number"
                        min={0}
                        className="w-20 text-xs text-center bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                        value={u.storageQuotaMB ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          const num =
                            val === '' ? null : (parseInt(val, 10) || 0)
                          patchUser(u.id, { storageQuotaMB: num })
                        }}
                      />
                    </td>
                    <td className="py-2 px-2 text-center align-middle">
                      {formatMB(u.usedStorageMB)}
                    </td>

                    {/* ACCIONES */}
                    <td className="py-2 px-2 text-center align-middle">
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                      >
                        Eliminar
                      </button>
                      {savingId === u.id && (
                        <span className="ml-1 text-[10px] text-gray-500 dark:text-gray-400">
                          Guardando...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// =============== Toggle simple con Tailwind ===============
interface ToggleProps {
  checked: boolean
  onChange: () => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
        checked ? 'bg-green-500' : 'bg-gray-400'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
