import bcrypt from 'bcryptjs'

export async function hashPassword(plain: string) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(plain, salt)
}

export function verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash)
}
