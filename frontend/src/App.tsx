import React from "react";
import {
  Link,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Profile from "./pages/Profile"; // 👈 NUEVO
import { ThemeToggleButton } from "./theme";
import { useUser } from "./hooks/useUser";

export default function App() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-slate-100">
      {/* NAVBAR (oculto en login / registro) */}
      {!isAuthPage && (
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
                  {/* Bloque usuario: avatar + nombre -> va a /profile */}
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg transition cursor-pointer"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={
                          user.avatarUrl.startsWith("http")
                            ? user.avatarUrl
                            : `http://localhost:4000${user.avatarUrl}`
                        }
                        alt={user.name || user.email}
                        className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        👤
                      </div>
                    )}
                    <span className="text-gray-700 dark:text-gray-200">
                      {user.name || user.email}
                    </span>
                  </button>

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
      )}

      {/* CONTENIDO */}
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} /> {/* 👈 NUEVO */}
        </Routes>
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:id" element={<CollectionDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} /> {/* 👈 NUEVO */}
          </Routes>
        </main>
      )}
    </div>
  );
}
