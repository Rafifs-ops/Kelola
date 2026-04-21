import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event) // Mendapatkan data dari request
  const config = useRuntimeConfig() // Mendapatkan variable .env

  if (!email || !password) { // Validasi email dan password
    throw createError({ statusCode: 400, message: 'Email and password required' })
  }

  const user = await prisma.user.findUnique({ where: { email } }) // Mencari user berdasarkan email

  if (!user || !user.password) { // Validasi user
    throw createError({ statusCode: 400, message: 'Kredensial tidak valid atau akun login via Google sebelumnya.' })
  }

  const isValid = await bcrypt.compare(password, user.password) // Validasi password

  if (!isValid) { // Validasi password
    throw createError({ statusCode: 400, message: 'Password salah.' })
  }

  if (!user.email_verified_at) {
    throw createError({ statusCode: 403, message: 'Email belum diverifikasi! Silakan daftar ulang atau cek email Anda untuk OTP.' })
  }

  const token = jwt.sign({ id: user.id }, config.authSecret as string, { expiresIn: '7d' }) // Membuat token
  setCookie(event, 'auth_token', token, { maxAge: 60 * 60 * 24 * 7, path: '/' }) // Set cookie untuk simpan token 

  return { success: true, user: { name: user.name, email: user.email } } // Mengirim response
})
