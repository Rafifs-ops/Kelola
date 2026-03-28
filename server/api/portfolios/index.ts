import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'
import { randomUUID } from 'node:crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event) // Mendapatkan data auth di server
  const method = event.node.req.method // Mendapatkan method GET/POST

  if (method === 'GET') {
    return prisma.portfolio.findMany({
      where: { userId: session.user.id }
    })
  }

  if (method === 'POST') {
    const { type, symbol, name, quantity, buy_price } = await readBody(event)
    return prisma.portfolio.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        type, // 'CRYPTO' | 'STOCK'
        symbol,
        amount: parseFloat(quantity),
        buyPrice: buy_price ? parseFloat(buy_price) : 0,
        updatedAt: new Date()
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
