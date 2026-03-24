import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const method = event.node.req.method

  if (method === 'GET') {
    return prisma.portfolio.findMany({
      where: { userId: session.user.id }
    })
  }

  if (method === 'POST') {
    const { type, symbol, name, quantity, buy_price } = await readBody(event)
    return prisma.portfolio.create({
      data: {
        userId: session.user.id,
        type, // 'CRYPTO' | 'STOCK'
        symbol,
        amount: parseFloat(quantity),
        buyPrice: buy_price ? parseFloat(buy_price) : 0
      }
    })
  }

  if (method === 'DELETE') {
    const { id } = await readBody(event)
    return prisma.portfolio.delete({
      where: { id, userId: session.user.id }
    })
  }
})
