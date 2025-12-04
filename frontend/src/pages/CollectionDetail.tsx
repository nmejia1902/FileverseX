import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface FileItem {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  downloads: number;
  filename?: string; // nuevo backend
  path?: string;     // por si viniera del backend viejo
}

interface CollectionDetailData {
  id: number;
  title: string;
  description?: string;
  likes: number;
  isPublic: boolean;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  files: FileItem[];
}

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<CollectionDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: "Bearer " + token } : {};

  // ================== CARGAR DETALLE ==================
  const loadCollection = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:4000/api/collections/${id}`,
        { headers }
      );
      // asumimos que el backend devuelve { collection, files }
      const data = res.data;
      const col: CollectionDetailData = {
        ...data.collection,
        files: data.files || data.collection?.files || [],
      };
      setCollection(col);
    } catch (err) {
      console.error("Error cargando colección", err);
      alert("No se pudo cargar la colección");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // ================== URL PREVIEW ==================
  const getPreviewUrl = (file: FileItem): string | null => {
    // 1) si tenemos filename (nuevo backend)
    if (file.filename) {
      return `http://localhost:4000/uploads/${file.filename}`;
    }
    // 2) si viene path, intentamos extraer a partir de /uploads/
    if (file.path) {
      // normalizamos las barras y recortamos hasta 'uploads/...'
      const norm = file.path.replace(/\\/g, "/");
      const idx = norm.lastIndexOf("/uploads/");
      if (idx !== -1) {
        const rel = norm.substring(idx + 1); // quitar la barra inicial
        return `http://localhost:4000/${rel}`;
      }
    }
    return null;
  };

  // ================== DESCARGAR ARCHIVO ==================
  const handleDownload = async (file: FileItem) => {
    if (!token) {
      alert("Debes iniciar sesión");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:4000/api/files/${file.id}/download`,
        {
          headers,
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error descargando archivo", err);
      alert(
        err?.response?.data?.message || "No se pudo descargar el archivo"
      );
    }
  };

  if (!id) {
    return (
      <div className="text-sm text-gray-700 dark:text-gray-200">
        ID de colección inválido
      </div>
    );
  }

  if (loading && !collection) {
    return (
      <div className="text-sm text-gray-700 dark:text-gray-200">
        Cargando colección...
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="space-y-3 text-gray-800 dark:text-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Volver
        </button>
        <p>No se encontró la colección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-gray-900 dark:text-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-blue-600 hover:underline"
      >
        ← Volver
      </button>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{collection.title}</h1>
        {collection.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {collection.description}
          </p>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Likes: <b className="text-pink-500">{collection.likes}</b> ·{" "}
          {collection.isPublic ? "Pública" : "Privada"}
        </div>
      </div>

      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 space-y-3">
        <h2 className="text-lg font-semibold">Archivos en esta colección</h2>

        {collection.files.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta colección aún no tiene archivos.
          </p>
        ) : (
          <div className="space-y-3">
            {collection.files.map((f) => {
              const previewUrl = getPreviewUrl(f);
              const isImage = f.mimeType?.startsWith("image/");

              return (
                <div
                  key={f.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col gap-2 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="text-sm font-medium">{f.originalName}</div>
                    <button
                      onClick={() => handleDownload(f)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                    >
                      Descargar
                    </button>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {f.mimeType} · {(f.size / 1024).toFixed(1)} KB ·{" "}
                    {f.downloads} descargas
                  </div>

                  {isImage && previewUrl && (
                    <div className="mt-1">
                      <img
                        src={previewUrl}
                        alt={f.originalName}
                        className="max-h-56 rounded border border-gray-200 dark:border-gray-700 object-contain bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
