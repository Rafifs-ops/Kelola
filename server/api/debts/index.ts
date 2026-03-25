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

  const method = event.node.req.method
  if (method === 'GET') {
    return await prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  if (method === 'POST') {
    const { title, total_amount, dueDate } = await readBody(event)
    
    return await prisma.debt.create({
      data: {
        id: randomUUID(),
        userId,
        title,
        total_amount: Number(total_amount),
        remaining_amount: Number(total_amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'UNPAID',
        updatedAt: new Date()
      }
    })
  }
})
