import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../store/authStore'

const schema = z.object({
  email: z.string().min(1, 'Поле обязательно').email('Некорректный email'),
  password: z.string().min(1, 'Поле обязательно'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  onSwitchToRegister: () => void
}

export default function LoginDropdown({ onClose, onSwitchToRegister }: Props) {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      const user = await login(data)
      onClose()
      if (user.role === 'site_admin') {
        navigate('/admin')
      } else if (user.role === 'restaurant_admin') {
        navigate('/owner')
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 401) {
        setApiError('Неверный email или пароль')
      } else if (status === 403) {
        setApiError('Аккаунт заблокирован')
      } else {
        setApiError('Ошибка сервера. Попробуйте позже')
      }
    }
  }

  const inputClass =
    'w-full h-10 px-5 bg-[#F0F0F0] rounded-[14px] text-sm text-black placeholder-black/50 focus:outline-none'

  return (
    <div
      className="absolute right-0 top-14 w-[280px] bg-white rounded-[30px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-5 z-50"
      style={{ fontFamily: "'Balsamiq Sans', cursive" }}
    >
      <h3 className="text-lg font-bold text-black text-center mb-4">ВХОД</h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Эл. почта"
            className={inputClass}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1 ml-4">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Пароль"
            className={inputClass}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1 ml-4">{errors.password.message}</p>
          )}
        </div>

        {apiError && (
          <p className="text-xs text-red-500 text-center">{apiError}</p>
        )}

        <p className="text-xs text-black text-center font-bold">
          Нет аккаунта?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="underline font-bold"
          >
            Зарегистрироваться
          </button>
        </p>

        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 px-6 bg-[#FF7700] hover:bg-[#E56A00] disabled:opacity-60 text-black text-sm font-bold rounded-[14px] transition-colors"
          >
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>
        </div>
      </form>
    </div>
  )
}
