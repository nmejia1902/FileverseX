import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

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
    <form onSubmit={handleSubmit} className="max-w-md bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Registro</h2>
      <div>
        <label className="block text-sm mb-1">Nombre</label>
        <input
          className="border rounded w-full p-2 text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          className="border rounded w-full p-2 text-sm"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Contraseña</label>
        <input
          type="password"
          className="border rounded w-full p-2 text-sm"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <button className="bg-green-600 text-white rounded px-4 py-2 text-sm">
        Registrarse
      </button>
    </form>
  )
}
