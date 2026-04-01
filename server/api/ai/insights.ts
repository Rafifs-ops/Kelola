import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  const genAI = new GoogleGenerativeAI(config.geminiApiKey as string)

  // @ts-ignore
  const userId = session.user.id as string

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (!user.is_premium && user.aiInsightCount >= 2) {
    return {
      insight: 'Maaf, batas penggunaan AI Insight gratis (2x) sudah habis. Yuk, upgrade ke Premium untuk insight sepuasnya! ✨',
      isLimitReached: true
    }
  }

  const recentTx = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 10,
    include: { category: true }
  })

  const txData = recentTx.map(t => `${t.date.toISOString().split('T')[0]} - ${t.type} - ${t.category?.name || 'Lainnya'} - Rp${t.amount}`).join('\n')

  const prompt = `You are a financial advisor for Gen Z. Based on the following recent transactions, give a 2-sentence highly personalized, engaging daily insight or tip in Indonesian. Example: "Kamu sudah menghabiskan banyak anggaran makan minggu ini, kurangi jajan ya!". Transactions:\n${txData || 'Belum ada transaksi.'}`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    
    if (!user.is_premium) {
      await prisma.user.update({
        where: { id: userId },
        data: { aiInsightCount: { increment: 1 } }
      })
    }

    return { insight: result.response.text(), isLimitReached: false }
  } catch (err) {
    console.error('Gemini Error:', err)
    return { insight: 'Yuk, catat transaksi pertamamu untuk mendapatkan insight personal dari AI!' }
  }
})
