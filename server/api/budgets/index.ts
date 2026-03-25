import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'
import { randomUUID } from 'node:crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  // @ts-ignore
  const userId = session.user.id as string
  // @ts-ignore
  const isPremium = session.user.is_premium

  const method = event.node.req.method
  if (method === 'GET') {
    const currentMonth = new Date().toISOString().substring(0, 7) // 'YYYY-MM'

    // Get budgets for this month
    const budgets = await prisma.budget.findMany({
      where: { userId, monthYear: currentMonth },
      include: { category: true }
    })

    // For each budget, calculate total spent
    const mapped = await Promise.all(budgets.map(async b => {
      // Find exact bounds of the month
      const start = new Date(`${currentMonth}-01T00:00:00.000Z`)
      const end = new Date(new Date(start).setMonth(start.getMonth() + 1))

      const spent = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          categoryId: b.categoryId,
          type: 'EXPENSE',
          date: { gte: start, lt: end }
        }
      })
      return { ...b, spent: spent._sum.amount || 0 }
    }))
    return mapped
  }

  if (method === 'POST') {
    const { categoryId, monthlyLimit } = await readBody(event)
    const currentMonth = new Date().toISOString().substring(0, 7)

    const existingCount = await prisma.budget.count({ where: { userId, monthYear: currentMonth } })

    const existingThisCat = await prisma.budget.findFirst({
      where: { userId, categoryId, monthYear: currentMonth }
    })

    if (!isPremium && existingCount >= 3 && !existingThisCat) {
      throw createError({ statusCode: 403, message: 'Limit pengguna gratis (3 anggaran) tercapai. Harap upgrade ke Premium.' })
    }

    const b = await prisma.budget.upsert({
      where: {
        userId_categoryId_monthYear: { userId, categoryId, monthYear: currentMonth }
      },
      update: { 
        monthlyLimit: Number(monthlyLimit),
        updatedAt: new Date()
      },
      create: {
        id: randomUUID(),
        userId, 
        categoryId, 
        monthYear: currentMonth, 
        monthlyLimit: Number(monthlyLimit),
        updatedAt: new Date()
      }
    })
    return b
  }

  if (method === 'DELETE') {
    const { id } = await readBody(event)
    const b = await prisma.budget.delete({
      where: { id, userId }
    })
    return b
  }
})
