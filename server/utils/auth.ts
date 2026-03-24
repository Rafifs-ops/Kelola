import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const requireAuth = async (event: any) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })
  
  const config = useRuntimeConfig()
  try {
    const decoded = jwt.verify(token, config.authSecret as string) as any
    const user = await prisma.user.findUnique({ where: { id: decoded.id }})
    if (!user) throw new Error('User not found')
    
    return {
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
