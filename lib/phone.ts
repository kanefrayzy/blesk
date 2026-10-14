/** Российский номер: 11 цифр с 7 или 8 в начале либо 10 цифр без кода страны. */
export function phoneError(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (!/^[0-9+()\-\s]+$/.test(trimmed)) return 'В номере могут быть только цифры, пробелы, скобки, «+» и «-».'

  const digits = trimmed.replace(/\D/g, '')
  const valid = digits.length === 11 ? /^[78]/.test(digits) : digits.length === 10
  return valid ? '' : 'Введите номер полностью, например +7 (916) 123-45-67.'
}

export function checkPhone(input: HTMLInputElement) {
  input.setCustomValidity(phoneError(input.value))
}
