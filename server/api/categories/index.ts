import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  // @ts-ignore
  const userId = session.user.id as string

  // Seed default categories if none exist for user or generic
  // In a real app we would run a seed script, but for now we'll dynamically ensure defaults exist.
  const existing = await prisma.category.findMany()
  if (existing.length === 0) {
    const defaults = [
      { name: 'Makanan', type: 'EXPENSE', icon: '🍔' },
      { name: 'Transport', type: 'EXPENSE', icon: '🚗' },
      { name: 'Belanja', type: 'EXPENSE', icon: '🛍️' },
      { name: 'Hiburan', type: 'EXPENSE', icon: '🎮' },
      { name: 'Tagihan', type: 'EXPENSE', icon: '🧾' },
      { name: 'Gaji', type: 'INCOME', icon: '💸' },
      { name: 'Bonus', type: 'INCOME', icon: '🎉' },
    ]
    for (const d of defaults) {
      await prisma.category.create({ data: d })
    }
  }

  // Return all categories
  return await prisma.category.findMany({
    where: {
      OR: [
        { userId },
        { userId: null }
      ]
    }
  })
})
