import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../store/authStore'
import { handlePhoneChange, normalizePhone } from '../utils/phone'

const schema = z
  .object({
    first_name: z.string().min(1, 'Поле обязательно'),
    last_name: z.string().min(1, 'Поле обязательно'),
    email: z.string().min(1, 'Поле обязательно').email('Некорректный email'),
    phone: z
      .string()
      .min(1, 'Поле обязательно')
      .refine((v) => /^\+7\d{10}$/.test(normalizePhone(v)), {
        message: 'Некорректный формат телефона',
      }),
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { phone: '' } })

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      await register_({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: normalizePhone(data.phone),
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
    >
      <h3 className="text-lg font-bold text-black text-center mb-4">РЕГИСТРАЦИЯ</h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        {field('first_name', 'Имя')}
        {field('last_name', 'Фамилия')}
        {field('email', 'Эл. почта', 'email')}
        <div>
          <Controller
            name="phone"
            control={control}
            render={({ field: f }) => (
              <input
                type="tel"
                inputMode="tel"
                placeholder="+7 (___) ___-__-__"
                className={inputClass}
                value={f.value}
                onChange={(e) => f.onChange(handlePhoneChange(e.target.value, f.value))}
                onBlur={f.onBlur}
              />
            )}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1 ml-4">{errors.phone.message}</p>
          )}
        </div>
        {field('password', 'Пароль', 'password')}
        {field('confirm_password', 'Подтверждение пароля', 'password')}

        {apiError && (
          <p className="text-xs text-red-500 text-center">{apiError}</p>
        )}

        <p className="text-xs text-black text-center font-bold">
          Уже зарегистрированы?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="underline font-bold"
          >
            Войти
          </button>
        </p>

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
