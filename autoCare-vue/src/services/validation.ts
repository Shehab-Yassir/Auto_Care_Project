export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0
}

export function isValidPassword(password: string): boolean {
  return password.length >= 4
}
