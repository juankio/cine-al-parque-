export const isEmail = (v: unknown): v is string => {
    if (typeof v !== 'string') return false
    const s = v.trim()
    return /.+@.+\..+/.test(s)
}

export const minLen = (v: unknown, n = 6): v is string => {
    if (typeof v !== 'string') return false
    return v.trim().length >= n
}

export const isNonEmpty = (v: unknown): v is string => {
    return typeof v === 'string' && v.trim().length > 0
}

/** Login básico (si ya lo usas) */
export const validateLogin = (email: unknown, password: unknown): string | null => {
    if (!isEmail(email)) return 'Correo inválido'
    if (!minLen(password, 4)) return 'Contraseña demasiado corta'
    return null
}

/** Registro */
export const validateRegister = (
    name: unknown,
    email: unknown,
    password: unknown,
    confirm: unknown
): string | null => {
    if (!isNonEmpty(name)) return 'Nombre requerido'
    if (!isEmail(email)) return 'Correo inválido'
    if (!minLen(password, 6)) return 'La contraseña debe tener al menos 6 caracteres'
    if (password !== confirm) return 'Las contraseñas no coinciden'
    return null
}
