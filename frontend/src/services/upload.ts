// frontend/src/services/upload.ts
import api from './api';

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append('file', file); // 'file' debe coincidir con upload.single('file') en backend

  const res = await api.post('/files', form); // baseURL + '/files' => /api/files
  return res.data;
}
