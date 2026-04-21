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
}

export default function RegisterDropdown({ onClose }: Props) {
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

  const inputClass =
    'w-full h-10 px-5 bg-[#F0F0F0] rounded-[14px] text-sm text-black placeholder-black/50 focus:outline-none'

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
        className={inputClass}
      />
      {errors[name] && (
        <p className="text-xs text-red-500 mt-1 ml-4">{errors[name]?.message}</p>
      )}
    </div>
  )

  return (
    <div
      className="absolute right-0 top-14 w-[280px] bg-white rounded-[30px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-5 z-50"
      style={{ fontFamily: "'Balsamiq Sans', cursive" }}
    >
      <h3 className="text-lg font-bold text-black text-center mb-4">РЕГИСТРАЦИЯ</h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        {field('first_name', 'Имя')}
        {field('last_name', 'Фамилия')}
        {field('email', 'Эл. почта', 'email')}
        {field('phone', 'Телефон', 'tel')}
        {field('password', 'Пароль', 'password')}
        {field('confirm_password', 'Подтверждение пароля', 'password')}

        {apiError && (
          <p className="text-xs text-red-500 text-center">{apiError}</p>
        )}

        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 px-6 bg-[#FF7700] hover:bg-[#E56A00] disabled:opacity-60 text-black text-sm font-bold rounded-[14px] transition-colors"
          >
            {isSubmitting ? 'Регистрируемся...' : 'Зарегистрироваться'}
          </button>
        </div>
      </form>
    </div>
  )
}
