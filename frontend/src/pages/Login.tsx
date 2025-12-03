// src/pages/Login.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert("Completa todos los campos");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });

      const { token } = res.data;

      localStorage.setItem("token", token);

      // Truco simple: recargamos para que useUser vuelva a llamar /auth/me
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Error login", err);
      alert(err?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-6 mt-6">
      <h1 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Iniciar sesión
      </h1>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded mt-2"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
