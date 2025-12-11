
import api from './api';

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append('file', file);

  const res = await api.post('/files', form);
  return res.data;
}
