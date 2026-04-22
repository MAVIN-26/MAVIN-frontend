import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
})

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Endpoints where 401 is a legitimate domain error (not an expired session),
// so we must not treat it as "logged out".
const AUTH_401_EXEMPT = ['/profile/password', '/auth/login', '/auth/register']

client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? ''
      const exempt = AUTH_401_EXEMPT.some((p) => url.endsWith(p))
      if (!exempt) {
        localStorage.removeItem('token')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default client
