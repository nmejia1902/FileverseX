// src/pages/Login.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      // forzamos recarga para que useUser vuelva a llamar /auth/me
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Error login", err);
      alert(err?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 👉 Fondo degradado en toda la pantalla
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#071b9a] via-[#0a2fb3] to-[#1a0f75]">
      {/* CONTENEDOR PRINCIPAL (panel con las formas y la tarjeta) */}
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-transparent px-4 sm:px-8 py-8 sm:py-12">

        {/* FIGURAS DECORATIVAS SOBRE EL FONDO */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 bg-[#ffb300] opacity-40 rounded-3xl rotate-12" />
        <div className="pointer-events-none absolute -right-40 top-16 h-72 w-72 bg-[#4a00e0] opacity-40 rounded-3xl -rotate-12" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-72 w-[90%] bg-[#1a237e] opacity-40 rounded-[3rem]" />

        {/* CAPA SUPERIOR CON CONTENIDO */}
        <div className="relative flex flex-col gap-6 sm:gap-8 text-white">
          {/* LOGO + BOTÓN REGISTRO */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              {/* Logo USB simple */}
              <div className="h-[70px] w-[70px] sm:h-[90px] sm:w-[90px] rounded-3xl bg-white flex items-center justify-center shadow-xl overflow-hidden border-4 border-white">
              <img
                src="/logo.png"
                alt="FileVerseX"
                className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg sm:text-2xl font-bold tracking-tight drop-shadow">
                  FileVerseX
                </span>
              </div>
            </div>

            <Link
              to="/register"
              className="uppercase tracking-wide text-xs sm:text-sm font-semibold bg-transparent border border-white/70 hover:bg-white hover:text-[#0a237a] px-3 py-1 rounded-full transition"
            >
              Registro
            </Link>
          </div>

     
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-sm bg-[#39a4ff] rounded-[2rem] border-4 border-[#6d4aff] shadow-[0_0_30px_rgba(0,0,0,0.4)] px-6 sm:px-10 py-8 sm:py-10 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-[#ffeb3b]">
                Inicia sesión:
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
               
                <div className="space-y-1">
                  <label className="text-xs text-white/90">
                    Correo
                  </label>
                  <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-inner">
                    <span className="mr-2 text-[#ff9800] text-sm">👤</span>
                    <input
                      type="email"
                      className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder-gray-400"
                      placeholder="Usuario o correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                
                <div className="space-y-1">
                  <label className="text-xs text-white/90">Contraseña</label>
                  <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-inner">
                    <span className="mr-2 text-[#ff9800] text-sm">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder-gray-400"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ff9800] hover:bg-[#ffa726] text-white font-semibold text-sm py-2.5 rounded-full shadow-md transition"
                  >
                    {loading ? "Ingresando..." : "Log in"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
