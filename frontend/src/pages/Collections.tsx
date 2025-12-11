import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface MyCollection {
  id: number;
  title: string;
  description?: string;
  likes: number;
  isPublic: boolean;
  filesCount: number;
  createdAt: string;
}

interface PublicCollection {
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
}

interface FileItem {
  id: number;
  originalName: string;
}

export default function CollectionsPage() {
  const [myCollections, setMyCollections] = useState<MyCollection[]>([]);
  const [publicCollections, setPublicCollections] = useState<PublicCollection[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: "Bearer " + token } : {};
  const navigate = useNavigate();

  
  useEffect(() => {
    if (!token) return;

    const loadMine = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/collections/mine", { headers });
        setMyCollections(res.data.collections);
      } catch (err) {
        console.error("Error cargando mis colecciones", err);
      }
    };

    const loadFiles = async () => {
      try {
      
        const res = await axios.get("http://localhost:4000/api/files", { headers });
        setFiles(res.data.files);
      } catch (err) {
        console.error("Error cargando archivos", err);
      }
    };

    const loadPublic = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/collections/public", { headers });
        setPublicCollections(res.data.collections);
      } catch (err) {
        console.error("Error cargando colecciones públicas", err);
      }
    };

    loadMine();
    loadFiles();
    loadPublic();
  }, [token]);

  
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return alert("El título es obligatorio");
    if (!token) return alert("Debes iniciar sesión");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/collections",
        { title: newTitle, description: newDescription, isPublic: newIsPublic },
        { headers }
      );

      setMyCollections((prev) => [res.data.collection, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setNewIsPublic(true);
      alert("Colección creada");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al crear colección");
    }
  };


  const handleAddFile = async (collectionId: number) => {
    if (!selectedFileId) return alert("Selecciona un archivo");

    try {
      await axios.post(
        `http://localhost:4000/api/collections/${collectionId}/add`,
        { fileId: selectedFileId },
        { headers }
      );
      alert("Archivo agregado 👍");
    } catch (err: any) {
      alert(err?.response?.data?.message || "No se pudo agregar");
    }
  };

 
  const handleLike = async (id: number) => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/collections/${id}/like`,
        {},
        { headers }
      );

      setPublicCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes: res.data.likes } : c))
      );
    } catch {
      alert("No se pudo dar Like");
    }
  };

  
  const deleteCollection = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta colección?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/collections/${id}`, { headers });
      setMyCollections((prev) => prev.filter((c) => c.id !== id));
      alert("Colección eliminada");
    } catch (err) {
      alert("Error al eliminar la colección");
    }
  };

  return (
    <div className="space-y-7 text-gray-900 dark:text-gray-200">
      <h1 className="text-2xl sm:text-3xl font-bold">📁 Colecciones</h1>

      
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5 space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
          Crear colección
        </h2>
        <form onSubmit={handleCreateCollection} className="space-y-3 max-w-md">
          <input
            className="border border-gray-300 dark:border-gray-600 rounded w-full p-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Nombre de la colección"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <textarea
            className="border border-gray-300 dark:border-gray-600 rounded w-full p-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Descripción opcional"
            rows={2}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />

          <label className="flex gap-2 items-center text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={newIsPublic}
              onChange={(e) => setNewIsPublic(e.target.checked)}
            />
            Pública (otros pueden verla y darle like)
          </label>

          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded px-4 py-2">
            Crear
          </button>
        </form>
      </section>

      
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Mis colecciones
        </h2>

        {myCollections.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aún no has creado colecciones.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {myCollections.map((c) => (
            <div
              key={c.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 bg-gray-50 dark:bg-gray-900"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {c.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Archivos: <b>{c.filesCount}</b> · Likes:{" "}
                <b className="text-pink-500">{c.likes}</b> ·{" "}
                {c.isPublic ? "Pública" : "Privada"}
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  className="bg-gray-800 text-white text-xs px-3 py-1 rounded"
                  onClick={() => navigate(`/collections/${c.id}`)}
                >
                  Ver detalles
                </button>

                <button
                  className="bg-red-600 text-white text-xs px-3 py-1 rounded"
                  onClick={() => deleteCollection(c.id)}
                >
                  Eliminar colección
                </button>
              </div>

              
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Agregar archivo:
                </div>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-xs w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  onChange={(e) =>
                    setSelectedFileId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">Selecciona un archivo</option>
                  {files.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.originalName}
                    </option>
                  ))}
                </select>

                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded w-full"
                  onClick={() => handleAddFile(c.id)}
                >
                  Agregar archivo
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Explorar colecciones públicas
        </h2>

        {publicCollections.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nadie ha compartido colecciones aún.
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {publicCollections.map((c) => (
            <div
              key={c.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 bg-gray-50 dark:bg-gray-900"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {c.title}
              </div>
              {c.owner && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Por: {c.owner.name}
                </div>
              )}
              {c.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {c.description}
                </div>
              )}
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Likes: <b className="text-pink-400">{c.likes}</b>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <button
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs px-3 py-1 rounded"
                  onClick={() => handleLike(c.id)}
                >
                  ❤️ Like
                </button>

                <button
                  className="bg-gray-800 text-white text-xs px-3 py-1 rounded"
                  onClick={() => navigate(`/collections/${c.id}`)}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
