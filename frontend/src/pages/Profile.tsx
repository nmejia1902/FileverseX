// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../hooks/useUser";

export default function Profile() {
  const { user, setUser } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: "Bearer " + token } : {};

  // si quieres forzar que cargue avatar desde /api/profile/me
  useEffect(() => {
    if (!token || user?.avatarUrl) return;

    (async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/profile/me", {
          headers,
        });
        if (res.data?.user && setUser) {
          setUser({ ...user, ...res.data.user });
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const currentAvatarUrl = user?.avatarUrl
    ? user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : `http://localhost:4000${user.avatarUrl}`
    : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Debes iniciar sesión");
      return;
    }
    if (!selectedFile) {
      alert("Selecciona una imagen");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await axios.post(
        "http://localhost:4000/api/profile/me/avatar",
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newUrl = res.data?.avatarUrl;
      if (newUrl && setUser && user) {
        setUser({
          ...user,
          avatarUrl: newUrl,
        });
      }

      alert("Avatar actualizado");
      setPreview(null);
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Error actualizando avatar", err);
      alert(err?.response?.data?.message || "No se pudo actualizar el avatar");
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center mt-10 text-gray-700 dark:text-gray-200">
        Debes iniciar sesión para ver tu perfil.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 text-gray-900 dark:text-gray-200">
      <h1 className="text-2xl sm:text-3xl font-bold">Perfil de usuario</h1>

      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold">Foto de perfil</h2>

        <div className="flex items-center gap-4">
          {/* Avatar actual */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt={user?.name || user?.email}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>👤</span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Actual
            </span>
          </div>

          {/* Preview nueva */}
          {preview && (
            <div className="flex flex-col items-center gap-1">
              <div className="h-20 w-20 rounded-full overflow-hidden border border-blue-400 bg-gray-100 dark:bg-gray-700">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Nueva
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleUpload} className="space-y-3">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-xs"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Formatos: JPG, PNG. Máx. 3 MB.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || !selectedFile}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm px-4 py-2 rounded"
          >
            {saving ? "Guardando..." : "Guardar avatar"}
          </button>
        </form>
      </section>
    </div>
  );
}
