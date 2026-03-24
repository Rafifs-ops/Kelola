import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  // @ts-ignore
  const userId = session.user.id

  const transactions = await prisma.transaction.findMany({ where: { userId }})
  const fiatBalance = transactions.reduce((acc, tx) => {
    return tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount
  }, 0)

  const portfolios = await prisma.portfolio.findMany({ where: { userId }})
  
  // For charts and summary, we want the current month's data
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const recentTransactions = await prisma.transaction.findMany({
    where: { 
      userId,
      date: {
        gte: startOfMonth,
        lt: endOfMonth
      }
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: { category: true }
  })

  return {
    fiatBalance,
    portfolios,
    recentTransactions
  }
})
