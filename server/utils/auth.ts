import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const requireAuth = async (event: any) => {
  const token = getCookie(event, 'auth_token') // Mengambil data token dari cookie

  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' }) // Validasi token

  const config = useRuntimeConfig() // Mengambil variable .env

  try {
    const decoded = jwt.verify(token, config.authSecret as string) as any // Decode token
    const user = await prisma.user.findUnique({ where: { id: decoded.id } }) // Mencari user berdasarkan id
    if (!user) throw new Error('User not found') // Validasi user

    return { // Mengembalikan data user
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        is_premium: user.is_premium
      }
    }
  } catch (e) {
    throw createError({ statusCode: 401, message: 'Invalid session' })
  }
}
