// src/api/index.js (thêm hoặc sửa interceptor)
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const authStore = useAuthStore()
    if (error.response?.status === 401) {
      // Không văng thông báo nếu người dùng đang cố đăng nhập và nhập sai mật khẩu
      if (!error.config.url.includes('/login') && !error.config.url.includes('/register')) {
        authStore.logout()
        
        import('sweetalert2').then(({ default: Swal }) => {
          Swal.fire({
            icon: 'warning',
            title: 'Phiên đăng nhập hết hạn',
            text: 'Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.',
            confirmButtonText: 'Đăng nhập',
            allowOutsideClick: false
          }).then(() => {
            router.push('/login')
          })
        })
      }
    }
    return Promise.reject(error)
  }
)

export default api