import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:4000/api/auth/register', { name, email, password })
      alert('Registro correcto, ahora inicia sesión')
      navigate('/login')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#071b9a] via-[#0a2fb3] to-[#1a0f75]">

      {/* Fondo decorativo igual al login */}
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-transparent px-4 sm:px-8 py-10 sm:py-16">

        {/* Figuras decorativas */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 bg-[#ffb300] opacity-40 rounded-3xl rotate-12" />
        <div className="pointer-events-none absolute -right-40 top-16 h-72 w-72 bg-[#4a00e0] opacity-40 rounded-3xl -rotate-12" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-72 w-[90%] bg-[#1a237e] opacity-40 rounded-[3rem]" />

        {/* Contenido */}
        <div className="relative flex flex-col gap-6 text-white">

          {/* encabezado */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <img
                src="/logo.png"
                alt="FileVerseX"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-lg"
              />
              <span className="text-lg sm:text-2xl font-bold tracking-tight drop-shadow">
                FileVerseX
              </span>
            </div>

            <Link
              to="/login"
              className="uppercase tracking-wide text-xs sm:text-sm font-semibold bg-transparent border border-white/70 hover:bg-white hover:text-[#0a237a] px-3 py-1 rounded-full transition"
            >
              Ya tengo cuenta
            </Link>
          </div>

          {/* TARJETA DE FORMULARIO */}
          <div className="w-full flex items-center justify-center">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm bg-[#39a4ff] rounded-[2rem] border-4 border-[#6d4aff] shadow-[0_0_30px_rgba(0,0,0,0.4)] px-6 sm:px-10 py-8 sm:py-10 space-y-4"
            >

              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-[#ffeb3b]">
                Registro
              </h2>

              <div>
                <label className="text-xs text-white/90">Nombre</label>
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-inner">
                  <span className="mr-2 text-[#ff9800] text-sm">👤</span>
                  <input
                    className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/90">Email</label>
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-inner">
                  <span className="mr-2 text-[#ff9800] text-sm">📧</span>
                  <input
                    type="email"
                    className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/90">Contraseña</label>
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-inner">
                  <span className="mr-2 text-[#ff9800] text-sm">🔒</span>
                  <input
                    type="password"
                    className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Contraseña"
                  />
                </div>
              </div>

              <button className="w-full bg-[#ff9800] hover:bg-[#ffa726] text-white font-semibold text-sm py-2.5 rounded-full shadow-md transition">
                Registrarse
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
