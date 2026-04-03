import { requireAuth } from '../../utils/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Force update user premium status for Sandbox instant bypassing
  // Because Midtrans Webhooks can be delayed up to 2-3 minutes
  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      is_premium: true,
      premium_expiry: new Date(new Date().setMonth(new Date().getMonth() + 1))
    }
  })

  return { success: true }
})
