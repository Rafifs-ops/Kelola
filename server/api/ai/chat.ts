import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const config = useRuntimeConfig()
  const userId = session.user.id

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (!user.is_premium && user.aiChatCount >= 1) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Maaf, batas penggunaan AI Chat gratis (1x) sudah habis. Yuk, upgrade ke Premium buat chat lebih banyak! 🚀'
    })
  }

  try {
    const { prompt, history } = await readBody(event)

    if (!user.is_premium) {
      await prisma.user.update({
        where: { id: userId },
        data: { aiChatCount: { increment: 1 } }
      })
    }

    if (!config.geminiApiKey) {
      throw createError({ statusCode: 500, statusMessage: 'Server configuration error' })
    }

    const genAI = new GoogleGenerativeAI(config.geminiApiKey as string)

    // Scrape user context to make AI hyper-personalized
    const txs = await prisma.transaction.findMany({ where: { userId } })
    const income = txs.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0)
    const exp = txs.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0)

    const ports = await prisma.portfolio.findMany({ where: { userId } })
    const cryptos = ports.filter(p => p.type === 'CRYPTO').map(p => `${p.amount} ${p.symbol}`).join(', ')
    const stocks = ports.filter(p => p.type === 'STOCK').map(p => `${p.amount} Lot ${p.symbol}`).join(', ')

    const debts = await prisma.debt.findMany({ where: { userId } })
    const debtList = debts.map(d => `${d.title}: Sisa Rp${d.remaining_amount}`).join(', ')

    const budgets = await prisma.budget.findMany({ where: { userId }, include: { category: true } })
    const budgetList = budgets.map(b => `${b.category?.name || 'Kategori'}: Limit Rp${b.monthlyLimit}`).join(', ')

    const systemInstruction = `Kamu adalah 'Kelola AI', konsultan keuangan pribadi Gen-Z yang santai, suportif, dan cerdas. Gunakan gaya bahasa anak muda masa kini dan emoji sewajarnya.
PENTING: Gunakan data finansial rahasia milik user ini sebagai dasar seluruh jawabanmu dan analisamu:
- Saldo Uang Tunai/Kas saat ini: Rp ${income - exp}
- Aset Kripto: ${cryptos || 'Belum punya aset kripto'}
- Aset Saham: ${stocks || 'Belum punya saham'}
- Tanggungan Hutang: ${debtList || 'Bebas hutang! Bagus!'}
- Limit Anggaran Bulan Ini: ${budgetList || 'Belum diset'}

Instruksi tambahan:
- Jangan pernah melampirkan daftar informasi di atas secara blak-blakan kecuali ditanya spesifik "Berapa kekayaanku?" atau sejenisnya.
- Gunakan data tersebut secara natural. Misal jika dia bertanya "Boleh gak aku beli sepatu 2 juta?", cek apakah Saldo uang tunainya mencukupi, lalu periksa apakah dia punya hutang yang belum dibayar. Jika berhutang, sarankan untuk melunasi hutang dulu.
- Berikan saran yang logis dan membangun secara mental.`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction
    })

    if (!history || history.length === 0) {
      const result = await model.generateContentStream(prompt)

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                controller.enqueue(encoder.encode(text))
              }
            }
          } catch (err) {
            console.error('Streaming error:', err)
          } finally {
            controller.close()
          }
        }
      })
      return stream

    } else {
      // Start Chat
      const chat = model.startChat({
        history: history.map((h: any) => ({
          role: h.role,
          parts: [{ text: h.text }]
        }))
      })
      const result = await chat.sendMessageStream(prompt)

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                controller.enqueue(encoder.encode(text))
              }
            }
          } catch (err) {
            console.error('Streaming error:', err)
          } finally {
            controller.close()
          }
        }
      })
      return stream
    }
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    const statusCode = error.statusCode || 500
    const statusMessage = error.message.includes('429')
      ? 'Maaf, kuota harian Kelola AI sudah habis. Coba lagi besok ya! 🙏'
      : 'Ups, server AI lagi error. Coba sebentar lagi ya!'

    throw createError({
      statusCode,
      statusMessage
    })
  }
})
