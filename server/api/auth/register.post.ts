import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody(event) // Mendapatkan data dari request

  const config = useRuntimeConfig() // Mendapatkan variable .env

  if (!email || !password || !name) { // Validasi email, password, dan nama
    throw createError({ statusCode: 400, message: 'Harap isi semua kolom' })
  }

  const existing = await prisma.user.findUnique({ where: { email } }) // Mencari user berdasarkan email

  if (existing) { // Validasi user apakah sudah ada / tidak
    throw createError({ statusCode: 400, message: 'Email sudah terdaftar!' })
  }

  const hashedPassword = await bcrypt.hash(password, 10) // Hash password

  const user = await prisma.user.create({ // Membuat user dan simpan ke database
    data: { name, email, password: hashedPassword }
  })

  // Membuat token dan simpan ke cookie
  const token = jwt.sign({ id: user.id }, config.authSecret as string, { expiresIn: '7d' })
  setCookie(event, 'auth_token', token, { maxAge: 60 * 60 * 24 * 7, path: '/' })

  return { success: true, user: { name: user.name, email: user.email } } // Mengirim response
})
