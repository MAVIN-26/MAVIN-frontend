import { useState } from 'react'
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
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      await login(data)
      onClose()
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

  return (
    <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50">
      <h3 className="text-base font-semibold text-gray-900 mb-4">ВХОД</h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Почта"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Пароль"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {apiError && (
          <p className="text-xs text-red-500">{apiError}</p>
        )}

        <p className="text-xs text-gray-500">
          Нет аккаунта?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#FF5500] hover:underline font-medium"
          >
            Зарегистрироваться
          </button>
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#FF5500] hover:bg-[#E04A00] disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
