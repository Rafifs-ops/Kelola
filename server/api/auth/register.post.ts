import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody(event)
  const config = useRuntimeConfig()

  if (!email || !password || !name) {
    throw createError({ statusCode: 400, message: 'Harap isi semua kolom' })
  }

  const existing = await prisma.user.findUnique({ where: { email }})
  if (existing) {
    throw createError({ statusCode: 400, message: 'Email sudah terdaftar!' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword }
  })

  const token = jwt.sign({ id: user.id }, config.authSecret as string, { expiresIn: '7d' })
  setCookie(event, 'auth_token', token, { maxAge: 60 * 60 * 24 * 7, path: '/' })

  return { success: true, user: { name: user.name, email: user.email } }
})
