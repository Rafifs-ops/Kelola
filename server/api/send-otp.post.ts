import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody(event)

  if (!email || !password || !name) {
    throw createError({ statusCode: 400, message: 'Harap isi semua kolom' })
  }

  const config = useRuntimeConfig()

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  const existing = await prisma.user.findUnique({ where: { email } })

  let userToUpdate;

  if (existing) {
    if (existing.email_verified_at) {
      throw createError({ statusCode: 400, message: 'Email sudah terdaftar dan terverifikasi!' })
    }
    // Update OTP for unverified existing user
    userToUpdate = await prisma.user.update({
      where: { email },
      data: {
        otp_code: otp,
        otp_expires_at: expiresAt,
        password: await bcrypt.hash(password, 10),
        name: name
      }
    })
  } else {
    const hashedPassword = await bcrypt.hash(password, 10)
    userToUpdate = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otp_code: otp,
        otp_expires_at: expiresAt,
        email_verified_at: null
      }
    })
  }

  // Send Email using Nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: process.env.SMTP_PORT,
    secure: true, // Use SSL for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  try {
    await transporter.sendMail({
      from: `"Kelola Finance" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Kode Verifikasi Kelola',
      text: `Halo ${name},\n\nKode verifikasi Anda adalah: ${otp}\n\nKode ini berlaku selama 5 menit.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Verifikasi Email Akun Kelola</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Terima kasih telah mendaftar di Kelola. Berikut adalah kode OTP Anda:</p>
          <h1 style="color: #2F9E44; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p>Kode di atas akan kedaluwarsa dalam 5 menit. Jangan bagikan kode ini kepada siapapun.</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw createError({ statusCode: 500, message: 'Gagal mengirim email verifikasi' })
  }

  return { success: true, message: 'OTP telah dikirim ke email Anda' }
})
