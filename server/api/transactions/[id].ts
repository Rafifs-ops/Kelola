import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const transactionId = event.context.params?.id

  if (!transactionId) {
    throw createError({ statusCode: 400, message: 'ID required' })
  }

  const transaction = await prisma.transaction.findUnique({
    where: { 
      id: transactionId,
      userId: session.user.id 
    },
    include: {
      category: true,
      debt: true
    }
  })

  if (!transaction) {
    throw createError({ statusCode: 404, message: 'Transaction not found' })
  }

  return transaction
})
