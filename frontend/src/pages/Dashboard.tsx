import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface FileItem {
  id: number
  originalName: string
  downloads: number
  size: number
  createdAt: string
}

interface UserStats {
  topDownloaded: FileItem[]
  totalFiles: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)

  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: 'Bearer ' + token } : {}

  
  const loadStats = async () => {
    if (!token) return
    try {
      const res = await axios.get('http://localhost:4000/api/stats/user', {
        headers,
      })
      setStats(res.data)
    } catch (err) {
      console.error('Error cargando stats', err)
    }
  }

  
  const loadFiles = async () => {
    if (!token) return
    try {
      setLoadingFiles(true)
      
      const res = await axios.get('http://localhost:4000/api/files', {
        headers,
      })
      setFiles(res.data.files)
    } catch (err) {
      console.error('Error cargando archivos', err)
    } finally {
      setLoadingFiles(false)
    }
  }

  useEffect(() => {
    loadStats()
    loadFiles()
  }, [token])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null)
  }

  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return alert('Selecciona un archivo primero')

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)

      
      await axios.post('http://localhost:4000/api/files', formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      })

      alert('Archivo subido correctamente')
      setSelectedFile(null)
      loadFiles()
      loadStats()
    } catch (err: any) {
      console.error('Error subiendo archivo', err)
      alert(err?.response?.data?.message || 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

 
  const downloadReport = async (format: 'csv' | 'json') => {
    if (!token) return alert('Debes iniciar sesión')

    const endpoint = `http://localhost:4000/api/stats/export/report/${format}`

    try {
      const res = await axios.get(endpoint, { headers, responseType: 'blob' })
      const blob = new Blob([res.data])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fileversex_informe_general.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error exportando archivo')
    }
  }

  
  const handleDownload = async (f: FileItem) => {
    if (!token) {
      alert('Debes iniciar sesión')
      return
    }

    try {
      
      const res = await axios.get(
        `http://localhost:4000/api/files/${f.id}/download`,
        {
          headers,
          responseType: 'blob',
        }
      )

      const blob = new Blob([res.data])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = f.originalName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Error descargando archivo', err)
      alert(err?.response?.data?.message || 'Error al descargar archivo')
    }
  }

  
  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm('¿Eliminar archivo?')) return
    try {
      
      await axios.delete(`http://localhost:4000/api/files/${file.id}`, {
        headers,
      })
      loadFiles()
      loadStats()
    } catch (err: any) {
      console.error('Error eliminando archivo', err)
      alert(err?.response?.data?.message || 'Error al eliminar archivo')
    }
  }

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-200">
      
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
          Subir archivo
        </h2>

        <form
          onSubmit={handleUpload}
          className="flex flex-wrap gap-3 items-center"
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="text-sm bg-white dark:bg-gray-900 p-1 rounded"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded"
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Puedes subir imágenes, documentos PDF, etc.
        </p>
      </section>

      
      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">
            Top archivos descargados
          </h3>

          {stats?.topDownloaded?.length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {stats.topDownloaded.map((f) => (
                <li key={f.id} className="text-gray-700 dark:text-gray-300">
                  {f.originalName} -{' '}
                  <span className="text-blue-500">
                    {f.downloads} descargas
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400 mt-2">Sin datos todavía.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4">
          <h3 className="font-semibold text-sm">Resumen</h3>
          <p className="text-sm mt-2">
            Total de archivos:{' '}
            <b className="text-blue-500">{stats?.totalFiles ?? 0}</b>
          </p>
        </div>
      </section>

      
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
          Exportar informe general
        </h2>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          Descarga un informe completo con tus archivos subidos, descargas,
          colecciones y likes.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadReport('csv')}
            className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 text-xs rounded"
          >
            Informe (CSV)
          </button>
          <button
            onClick={() => downloadReport('json')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs rounded"
          >
            Informe (JSON)
          </button>
        </div>
      </section>

      
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-5">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
          Mis archivos
        </h2>

        {loadingFiles ? (
          <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
            Cargando archivos...
          </p>
        ) : files.length === 0 ? (
          <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
            Aún no has subido archivos.
          </p>
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-300">
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Tamaño</th>
                  <th className="py-2">Descargas</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-2">{f.originalName}</td>
                    <td className="py-2">
                      {(f.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-2">{f.downloads}</td>

                    <td className="py-2">
                      <button
                        onClick={() => handleDownload(f)}
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                      >
                        Descargar
                      </button>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => handleDeleteFile(f)}
                        className="bg-red-600 text-white text-xs px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
