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
  // @ts-ignore
  const isPremium = session.user.is_premium

  // Demo limit check: if not premium, check if they've used this feature in the last 30 days
  // Just allowing it for simplicity in the demo, but logging limitation logic here

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: 'asc' }
  })

  // For Excel in some locales (like Indonesia), semicolon is the default delimiter
  let csv = 'Tanggal;Tipe;Kategori;Prioritas;Nominal (Rp);Catatan\n'
  transactions.forEach(t => {
    // Quote descriptions to prevent breaking
    const safeDesc = `"${(t.description || '').replace(/"/g, '""')}"`
    const safeCat = `"${(t.category?.name || '-').replace(/"/g, '""')}"`
    csv += `"${new Date(t.date).toISOString().split('T')[0]}";"${t.type}";${safeCat};"${t.priority || '-'}";${t.amount};${safeDesc}\n`
  })

  setResponseHeader(event, 'Content-Type', 'text/csv')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="Laporan_Keuangan_Kelola_${session.user.name}_${new Date().toISOString().split('T')[0]}.csv"`)

  return csv
})
