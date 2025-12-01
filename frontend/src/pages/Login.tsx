import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      alert('Login correcto')
      navigate('/dashboard')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al iniciar sesión')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Iniciar sesión</h2>
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
      <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">
        Entrar
      </button>
    </form>
  )
}
