<template>
  <div class="max-w-xl mx-auto space-y-8 animate-fade-in pb-20 md:pb-0 relative z-10 w-full">
    <div class="flex items-center gap-4 mb-4">
      <NuxtLink to="/transactions" class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-kelola-teal shadow-md hover:scale-105 transition-transform">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </NuxtLink>
      <h1 class="text-3xl font-extrabold text-kelola-teal tracking-tighter">Tambah Transaksi</h1>
    </div>

    <!-- OCR Banner for Premium -->
    <div v-if="session?.user?.is_premium" @click="handleOCR" class="bg-kelola-yellow/20 border-2 border-kelola-yellow p-4 rounded-2xl flex items-center justify-between shadow-sm group cursor-pointer hover:bg-kelola-yellow/40 transition">
      <div>
        <h3 class="font-bold text-kelola-teal text-sm mb-1 uppercase tracking-wider">🌟 Auto Scan Struk</h3>
        <p class="text-xs text-kelola-teal/80 font-medium">Foto struk dan biarkan AI kami yang mengisinya!</p>
      </div>
      <div class="w-12 h-12 bg-kelola-yellow text-kelola-teal rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
        📸
      </div>
    </div>

    <form @submit.prevent="submitTransaction" class="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-white/40 space-y-6">
      
      <!-- Type Toggle -->
      <div class="flex bg-kelola-beige p-1.5 rounded-2xl shadow-inner border border-gray-100/50">
        <button type="button" @click="form.type = 'EXPENSE'" class="flex-1 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition" :class="form.type === 'EXPENSE' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'">Pengeluaran</button>
        <button type="button" @click="form.type = 'INCOME'" class="flex-1 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition" :class="form.type === 'INCOME' ? 'bg-kelola-lightgreen text-kelola-teal shadow-md' : 'text-gray-400 hover:text-gray-600'">Pemasukan</button>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Jumlah</label>
        <div class="relative">
          <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-kelola-teal select-none">Rp</span>
          <input v-model="form.amount" type="number" required placeholder="0" class="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl py-6 pl-16 pr-6 text-4xl font-black text-kelola-teal focus:outline-none focus:border-kelola-yellow focus:bg-white transition-all shadow-inner" />
        </div>
      </div>

      <!-- Category -->
      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Kategori</label>
        <div class="grid grid-cols-4 sm:grid-cols-5 gap-3">
          <div v-for="cat in availableCategories" :key="cat.id" 
               @click="form.categoryId = cat.id"
               class="flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all border-2 group"
               :class="form.categoryId === cat.id ? 'border-kelola-teal bg-kelola-teal shadow-md shadow-kelola-teal/20 scale-105' : 'border-gray-100 bg-gray-50 hover:border-kelola-sea/30 hover:bg-white'">
            <span class="text-2xl mb-1 group-hover:scale-110 transition-transform" :class="form.categoryId === cat.id ? 'opacity-100' : 'opacity-80'">{{ cat.icon || '📌' }}</span>
            <span class="text-[9px] font-bold text-center leading-tight truncate w-full" :class="form.categoryId === cat.id ? 'text-kelola-yellow' : 'text-gray-500'">{{ cat.name }}</span>
          </div>
        </div>
      </div>

      <!-- Priority -->
      <div v-if="form.type === 'EXPENSE'">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Prioritas</label>
        <div class="flex gap-2">
          <button type="button" v-for="p in ['WAJIB', 'PENTING', 'TIDAK PENTING']" :key="p" @click="form.priority = p"
            class="flex-1 py-3 rounded-2xl border-2 font-black text-[10px] md:text-xs uppercase tracking-wider transition"
            :class="form.priority === p ? 'border-kelola-teal bg-kelola-teal text-kelola-yellow shadow-md' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-kelola-sea/30 hover:bg-white'">
            {{ p }}
          </button>
        </div>
      </div>

      <!-- Date & Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100/60 pt-6">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tanggal</label>
          <input v-model="form.date" type="date" required class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 font-bold text-kelola-teal focus:outline-none focus:border-kelola-sea focus:bg-white transition-all shadow-inner" />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Catatan</label>
          <input v-model="form.description" type="text" placeholder="Detail transaksi..." class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 font-bold text-gray-700 focus:outline-none focus:border-kelola-sea focus:bg-white transition-all placeholder:font-medium placeholder:text-gray-400 shadow-inner" />
        </div>
      </div>

      <button type="submit" :disabled="loading" class="w-full mt-4 bg-kelola-teal text-white py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_10px_40px_rgba(0,84,95,0.3)] hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50 border-b-4 border-kelola-teal/50 hover:border-kelola-teal">
        {{ loading ? 'MENYIMPAN...' : 'SIMPAN' }}
      </button>
    </form>
  </div>
</template>

<script setup>
const { session } = useCustomAuth()
const router = useRouter()
useSeoMeta({ title: 'Tambah Transaksi - Kelola' })

const { data: categories } = useFetch('/api/categories')

const form = ref({
  type: 'EXPENSE',
  amount: '',
  categoryId: '',
  priority: 'PENTING',
  date: new Date().toISOString().split('T')[0],
  description: '',
})

const loading = ref(false)

const availableCategories = computed(() => {
  return categories.value?.filter(c => c.type === form.value.type) || []
})

watch(() => form.value.type, (newType) => {
  const cats = categories.value?.filter(c => c.type === newType) || []
  if (cats.length > 0) form.value.categoryId = cats[0].id
})

watch(categories, (cats) => {
  if (cats && cats.length > 0 && !form.value.categoryId) {
    const defaultCats = cats.filter(c => c.type === form.value.type)
    if (defaultCats.length > 0) form.value.categoryId = defaultCats[0].id
  }
})

const handleOCR = () => {
  alert('Fitur OCR (Scan Foto Struk) akan mengarahkan ke kamera/gallery dan memanggil /api/ai/ocr!')
}

const submitTransaction = async () => {
  if (!form.value.amount || !form.value.categoryId) return
  
  loading.value = true
  try {
    await $fetch('/api/transactions', {
      method: 'POST',
      body: {
        ...form.value,
        amount: Number(form.value.amount)
      }
    })
    router.push('/transactions')
  } catch(e) {
    if (e.data?.statusMessage) {
      alert(e.data.statusMessage)
    } else {
      alert('Gagal menyimpan transaksi.')
    }
  } finally {
    loading.value = false
  }
}
</script>
