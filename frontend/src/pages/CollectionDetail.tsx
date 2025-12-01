import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

interface FileItem {
  id: number
  originalName: string
  mimeType?: string
  size: number
  url: string
  downloads: number
}

interface CollectionDetail {
  id: number
  title: string
  description?: string
  likes: number
  isPublic: boolean
  files: FileItem[]
}

export default function CollectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<CollectionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: 'Bearer ' + token } : {}

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const res = await axios.get(
          `http://localhost:4000/api/collections/${id}`,
          { headers }
        )
        setCollection(res.data.collection)
      } catch (err: any) {
        console.error(err)
        alert(
          err?.response?.data?.message ||
            'No se pudo cargar la colección'
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDownload = async (file: FileItem) => {
    if (!token) {
      alert('Debes iniciar sesión')
      return
    }

    try {
      const res = await axios.get(
        `http://localhost:4000/api/files/download/${file.id}`,
        {
          headers,
          responseType: 'blob',
        }
      )

      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.originalName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('No se pudo descargar el archivo')
    }
  }

  const isImage = (mime?: string) =>
    mime ? mime.startsWith('image/') : false

  const isPdf = (mime?: string) =>
    mime ? mime.includes('pdf') : false

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando...</p>
  }

  if (!collection) {
    return <p className="text-sm text-red-500">Colección no encontrada.</p>
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-blue-600 underline mb-2"
      >
        ← Volver
      </button>

      <h1 className="text-2xl font-bold">{collection.title}</h1>
      {collection.description && (
        <p className="text-sm text-gray-600">{collection.description}</p>
      )}
      <p className="text-xs text-gray-500">
        Likes: {collection.likes} · {collection.isPublic ? 'Pública' : 'Privada'}
      </p>

      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="font-semibold text-lg">Archivos en esta colección</h2>

        {collection.files.length === 0 ? (
          <p className="text-sm text-gray-500">
            Esta colección aún no tiene archivos.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {collection.files.map((file) => (
              <div
                key={file.id}
                className="border rounded-lg p-3 text-sm space-y-2"
              >
                <div className="font-semibold">{file.originalName}</div>
                <div className="text-xs text-gray-500">
                  {file.mimeType} · {(file.size / 1024).toFixed(1)} KB ·{' '}
                  {file.downloads} descargas
                </div>

                {/* PREVIEW */}
                {isImage(file.mimeType) && (
                  <img
                    src={`http://localhost:4000${file.url}`}
                    alt={file.originalName}
                    className="max-h-40 object-contain border rounded"
                  />
                )}

                {isPdf(file.mimeType) && (
                  <a
                    href={`http://localhost:4000${file.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    Ver PDF en otra pestaña
                  </a>
                )}

                {/* ACCIONES */}
                <button
                  onClick={() => handleDownload(file)}
                  className="bg-gray-800 text-white text-xs px-3 py-1 rounded"
                >
                  Descargar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
