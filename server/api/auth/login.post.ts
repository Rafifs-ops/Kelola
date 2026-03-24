import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const config = useRuntimeConfig()

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password required' })
  }

  const user = await prisma.user.findUnique({ where: { email }})
  if (!user || !user.password) {
    throw createError({ statusCode: 400, message: 'Kredensial tidak valid atau akun login via Google sebelumnya.' })
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    throw createError({ statusCode: 400, message: 'Password salah.' })
  }

  const token = jwt.sign({ id: user.id }, config.authSecret as string, { expiresIn: '7d' })
  setCookie(event, 'auth_token', token, { maxAge: 60 * 60 * 24 * 7, path: '/' })

  return { success: true, user: { name: user.name, email: user.email } }
})
