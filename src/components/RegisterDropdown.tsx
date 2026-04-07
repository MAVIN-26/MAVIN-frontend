import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../store/authStore'

const schema = z
  .object({
    first_name: z.string().min(1, 'Поле обязательно'),
    last_name: z.string().min(1, 'Поле обязательно'),
    email: z.string().min(1, 'Поле обязательно').email('Некорректный email'),
    phone: z
      .string()
      .min(1, 'Поле обязательно')
      .regex(/^\+7\d{10}$/, 'Некорректный формат телефона (+7XXXXXXXXXX)'),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    confirm_password: z.string().min(1, 'Поле обязательно'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function RegisterDropdown({ onClose, onSwitchToLogin }: Props) {
  const register_ = useAuthStore((s) => s.register)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      await register_({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      onClose()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 409) {
        setApiError('Email или телефон уже зарегистрированы')
      } else {
        setApiError('Ошибка сервера. Попробуйте позже')
      }
    }
  }

  const field = (
    name: keyof FormData,
    placeholder: string,
    type = 'text'
  ) => (
    <div>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
      />
      {errors[name] && (
        <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>
      )}
    </div>
  )

  return (
    <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50">
      <h3 className="text-base font-semibold text-gray-900 mb-4">РЕГИСТРАЦИЯ</h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        {field('first_name', 'Имя')}
        {field('last_name', 'Фамилия')}
        {field('email', 'Эл. почта', 'email')}
        {field('phone', 'Телефон (+7XXXXXXXXXX)', 'tel')}
        {field('password', 'Пароль', 'password')}
        {field('confirm_password', 'Подтверждение пароля', 'password')}

        {apiError && (
          <p className="text-xs text-red-500">{apiError}</p>
        )}

        <p className="text-xs text-gray-500">
          Уже есть аккаунт?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#FF5500] hover:underline font-medium"
          >
            Войти
          </button>
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#FF5500] hover:bg-[#E04A00] disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Регистрируемся...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  )
}
