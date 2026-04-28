// Привести номер к формату бэка: +7XXXXXXXXXX (E.164 для РФ).
// Принимает любые варианты ввода: "8 900 ...", "+7 (900) ...", "7900...".
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (!digits) return ''
  let core = digits
  if (core.startsWith('8')) core = '7' + core.slice(1)
  if (!core.startsWith('7')) core = '7' + core
  core = core.slice(0, 11)
  return '+' + core
}

// Маска для отображения в инпуте: "+7 (900) 123-45-67".
// Используется только для UI; на бэк отправляется normalizePhone().
export function formatPhoneInput(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (!digits) return ''
  let core = digits
  if (core.startsWith('8')) core = '7' + core.slice(1)
  if (!core.startsWith('7')) core = '7' + core
  core = core.slice(0, 11)

  const a = core.slice(1, 4)
  const b = core.slice(4, 7)
  const c = core.slice(7, 9)
  const d = core.slice(9, 11)

  let out = '+7'
  if (a) out += ' (' + a + (a.length === 3 ? ')' : '')
  if (b) out += ' ' + b
  if (c) out += '-' + c
  if (d) out += '-' + d
  return out
}

// Хелпер для onChange: учитывает удаление символа маски (скобки/пробела/дефиса).
// Если пользователь стёр символ маски, цифры не изменились — снимаем последнюю цифру,
// иначе форматтер тут же возвращает удалённый символ обратно и удаление "застревает".
export function handlePhoneChange(newValue: string, prevValue: string): string {
  const newDigits = newValue.replace(/\D/g, '')
  const prevDigits = prevValue.replace(/\D/g, '')
  let digits = newDigits
  if (
    newValue.length < prevValue.length &&
    newDigits.length === prevDigits.length &&
    digits.length > 0
  ) {
    digits = digits.slice(0, -1)
  }
  return formatPhoneInput(digits)
}
