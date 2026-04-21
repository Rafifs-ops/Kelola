import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event) // Mengambil data session auth
  const config = useRuntimeConfig() // Mengambil data config di nuxt.config.ts
  const userId = session.user.id // Mengambil data user id di session

  const user = await prisma.user.findUnique({ where: { id: userId } }) // Mencari user berdasarkan id

  // Jika user tidak ditemukan
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Jika user bukan premium
  if (!user.is_premium) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Fitur Scan Struk (OCR) hanya tersedia untuk member Premium. Yuk, upgrade! 🚀'
    })
  }

  try {
    const formData = await readMultipartFormData(event) // Mengambil data form data

    // Jika tidak ada form data
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Tidak ada file statis yang diunggah.' })
    }

    const file = formData.find((f: any) => f.name === 'image') // Mencari file gambar

    // Jika tidak ada file gambar
    if (!file) {
      throw createError({ statusCode: 400, statusMessage: 'Gambar struk tidak terdeteksi.' })
    }

    // Jika tidak ada geminiApiKey
    if (!config.geminiApiKey) {
      throw createError({ statusCode: 500, statusMessage: 'Server configuration error (Gemini API Key missing)' })
    }

    // Mengambil data kategori untuk dijadikan referensi bagi AI
    const categories = await prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] }
    })
    const categoryStr = categories.map(c => `ID: ${c.id}, Nama: "${c.name}", Tipe: ${c.type}`).join('\n')

    const genAI = new GoogleGenerativeAI(config.geminiApiKey as string)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `Kamu adalah spesialis ekstraksi data keuangan. Kamu harus mengekstrak data dari gambar nota/struk, dan menempatkannya dalam bentuk JSON yang sempurna. Patuhi aturan ini dengan ketat: Pilih ID kategori HANYA dari referensi kategori yang disediakan. Jika tidak sesuai satupun, cari yang paling mendekati. Jika gambar yang dikirim bukan struk/nota, kembalikan error dalam struktur JSON tanpa formatting markdown (no \`\`\`json). Contoh: {"error": "Gambar bukan struk/nota"}`
    })

    const prompt = `Analisis gambar struk/nota ini dan kembalikan struktur JSON tanpa formatting markdown (no \`\`\`json). Harus berupa Object murni berikut:
{
  "amount": (angka murni, tanpa titik, tanpa koma, tanpa simbol mata uang),
  "type": "EXPENSE" atau "INCOME",
  "categoryId": (ID kategori dari teks referensi di bawah yang paling cocok),
  "date": "YYYY-MM-DD" (tanggal struk, atau pakai tanggal hari ini jika tak ada),
  "description": (string pendek, misalnya nama toko "Indomaret" atau "Makan Siang XYZ"),
  "priority": (Pilih salah satu: "WAJIB", "PENTING", atau "TIDAK PENTING". Contoh: Kebutuhan pokok = WAJIB, Hiburan = PENTING)
}

DAFTAR REFERENSI KATEGORI:
${categoryStr}`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: file.data.toString('base64'),
          // Biasanya content type ada di file.type
          mimeType: file.type || 'image/jpeg'
        }
      }
    ])

    const responseText = result.response.text() // Mengambil data dari model gemini
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim() // Membersihkan data dari model gemini
    const parsedData = JSON.parse(cleanJson) // Meng-parse data dari model gemini

    // Jika gambar yang dikirim bukan struk/nota, lempar error
    if (parsedData.error) {
      throw createError({ statusCode: 400, statusMessage: parsedData.error })
    }

    return parsedData

  } catch (error: any) {
    const statusCode = error.statusCode || 500
    throw createError({
      statusCode,
      statusMessage: error.message || 'Gagal memproses gambar struk. Pastikan gambar jelas.'
    })
  }
})
