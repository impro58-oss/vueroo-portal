import bcrypt from 'bcryptjs'

export async function verifyPassword(password: string): Promise<boolean> {
  const hashedPassword = process.env.AUTH_PASSWORD_HASH
  
  if (!hashedPassword) {
    throw new Error('AUTH_PASSWORD_HASH not set')
  }
  
  return bcrypt.compare(password, hashedPassword)
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}
