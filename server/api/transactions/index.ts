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

  const method = event.node.req.method
  if (method === 'GET') {
    const query = getQuery(event)
    const month = query.month ? parseInt(query.month as string) : null
    const year = query.year ? parseInt(query.year as string) : null

    let where: any = { userId }
    if (month !== null && year !== null) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 1)
      where.date = {
        gte: startDate,
        lt: endDate
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, debt: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    })
    return transactions
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    if (body.type === 'EXPENSE' && body.debtId) {
      const debt = await prisma.debt.findUnique({ where: { id: body.debtId } })
      if (!debt) throw createError({ statusCode: 404, message: 'Debt not found' })
      if (debt.remaining_amount < body.amount) {
        throw createError({ statusCode: 400, message: 'Payment exceeds remaining debt' })
      }
      
      await prisma.debt.update({
        where: { id: debt.id },
        data: { remaining_amount: debt.remaining_amount - body.amount }
      })
    }

    // Budget Limit Validation
    if (body.type === 'EXPENSE' && body.categoryId) {
      const monthYear = new Date(body.date).toISOString().substring(0, 7)
      const budget = await prisma.budget.findFirst({
        where: { userId, categoryId: body.categoryId, monthYear }
      })
      
      if (budget) {
        const minDate = new Date(`${monthYear}-01T00:00:00.000Z`)
        const nextMonth = new Date(minDate)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        
        const currentSum = await prisma.transaction.aggregate({
          where: { userId, categoryId: body.categoryId, type: 'EXPENSE', date: { gte: minDate, lt: nextMonth } },
          _sum: { amount: true }
        })
        const used = currentSum._sum.amount || 0
        if (used + Number(body.amount) > budget.monthlyLimit) {
          throw createError({ 
            statusCode: 400, 
            statusMessage: `Limit anggaran kategori ini sisa Rp ${budget.monthlyLimit - used}. Transaksi ditolak.` 
          })
        }
      }
    }

    const tx = await prisma.transaction.create({
      data: {
        userId,
        categoryId: body.categoryId,
        amount: Number(body.amount),
        type: body.type,
        date: new Date(body.date),
        description: body.description,
        priority: body.priority,
        debtId: body.debtId || null,
        receiptUrl: body.receiptUrl || null
      }
    })
    return tx
  }
})
