import client from './client'

// POST /upload (multipart/form-data). Returns public URL from MinIO.
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await client.post<{ url: string }>('/upload', form)
  return res.data.url
}
