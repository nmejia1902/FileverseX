// src/pages/Profile.tsx
import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../hooks/useUser";

export default function Profile() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: "Bearer " + token } : {};

  const avatarFullUrl =
    user && user.avatarUrl ? `http://localhost:4000${user.avatarUrl}` : null;

  const handleUpload = async () => {
    if (!file) return alert("Selecciona una imagen");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      await axios.post(
        "http://localhost:4000/api/users/me/avatar",
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Avatar actualizado");
      // Recargamos para que el navbar muestre la nueva imagen
      window.location.reload();
    } catch (err: any) {
      console.error("Error subiendo avatar", err);
      alert(err?.response?.data?.message || "Error subiendo avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Mi perfil
      </h1>

      <div className="flex items-center gap-4">
        {avatarFullUrl ? (
          <img
            src={avatarFullUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
            👤
          </div>
        )}

        <div className="text-sm text-gray-700 dark:text-gray-300">
          <div className="font-semibold">{user?.name}</div>
          <div className="text-xs">{user?.email}</div>
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-xs"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded"
        >
          {uploading ? "Subiendo..." : "Subir nueva foto"}
        </button>
      </div>
    </div>
  );
}
