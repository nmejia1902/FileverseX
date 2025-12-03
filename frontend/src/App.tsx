// src/App.tsx
import React from 'react'
import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import Profile from './pages/Profile'
import { ThemeToggleButton } from './theme'
import { useUser } from './hooks/useUser'

export default function App() {
  const { user, setUser } = useUser()
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  // URL completa del avatar (si existe)
  const avatarFullUrl =
    user && user.avatarUrl
      ? `http://localhost:4000${user.avatarUrl}`
      : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-slate-100">
      {/* NAVBAR */}
      <nav className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            to="/"
            className="font-bold text-lg sm:text-xl tracking-tight text-blue-700 dark:text-blue-400"
          >
            FileverseX
          </Link>

          {/* Links principales */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link
              to="/dashboard"
              className="px-2 py-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Dashboard
            </Link>
            <Link
              to="/collections"
              className="px-2 py-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Colecciones
            </Link>
            <Link
              to="/admin"
              className="px-2 py-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Admin
            </Link>
          </div>

          <div className="flex-1" />

          {/* Usuario / Login – Registro */}
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            {user ? (
              <>
                {/* Bloque avatar + nombre + link perfil */}
                <Link to="/profile" className="flex items-center gap-2">
                  {avatarFullUrl ? (
                    <img
                      src={avatarFullUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-base">
                      👤
                    </div>
                  )}

                  <span className="text-gray-700 dark:text-gray-200">
                    {user.name || user.email}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-2 py-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-2 py-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Registro
                </Link>
              </>
            )}

            <ThemeToggleButton />
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  )
}
