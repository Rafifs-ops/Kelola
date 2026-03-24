<template>
  <div class="space-y-6 pb-20 md:pb-0 animate-fade-in relative z-10 w-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Hutang</h1>
        <p class="text-kelola-sea mt-1 font-semibold text-sm">Kelola komitmen finansialmu.</p>
      </div>
      <button @click="showAddModal = true" class="bg-kelola-pink text-white px-6 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(193,111,176,0.3)] hover:scale-105 transition-transform uppercase tracking-widest text-xs border border-transparent">
        + Catat
      </button>
    </div>

    <!-- Stats -->
    <div class="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-8 flex items-center justify-between group hover:shadow-md transition">
      <div>
        <p class="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Total Belum Dibayar</p>
        <h2 class="text-4xl font-black text-red-500 tracking-tighter mt-2">Rp {{ formatNumber(totalUnpaid) }}</h2>
      </div>
      <div class="w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
        📉
      </div>
    </div>

    <div v-if="pending" class="text-center py-20 flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-kelola-lightgreen border-t-kelola-teal rounded-full animate-spin shadow-lg"></div>
      <p class="mt-4 font-bold text-gray-400">Memuat catatan...</p>
    </div>

    <div v-else class="space-y-5">
      <div v-if="debts?.length === 0" class="text-center py-16 bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50">
        <div class="text-5xl mb-4 drop-shadow-sm">🤝</div>
        <p class="text-gray-400 font-bold mb-3">Wah hebat! Kamu tidak punya hutang aktif.</p>
      </div>

      <div v-for="d in debts" :key="d.id" class="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 hover:shadow-md transition group relative overflow-hidden">
        <div v-if="d.remaining_amount <= 0" class="absolute top-5 right-5 bg-kelola-lightgreen text-kelola-sea text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border border-kelola-sea/20 shadow-sm">Lunas</div>
        <div class="flex items-center gap-4 mb-6">
           <div>
             <h3 class="font-black text-gray-800 text-2xl tracking-tight mb-1" :class="d.remaining_amount <= 0 ? 'line-through text-gray-400' : ''">{{ d.title }}</h3>
             <p v-if="d.dueDate" class="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wide">Tenggat: <span class="text-kelola-sea">{{ new Date(d.dueDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span></p>
           </div>
        </div>

        <div class="flex justify-between items-end bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
           <div>
             <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
             <p class="font-extrabold text-gray-400 line-through text-lg">Rp {{ formatNumber(d.total_amount) }}</p>
           </div>
           <div class="text-right">
             <p class="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1" :class="d.remaining_amount <= 0 ? 'text-gray-400' : ''">Sisa Dibayar</p>
             <p class="font-black text-3xl tracking-tighter" :class="d.remaining_amount <= 0 ? 'text-kelola-sea' : 'text-red-500'">Rp {{ formatNumber(d.remaining_amount) }}</p>
           </div>
        </div>
        
        <div v-if="d.remaining_amount > 0" class="mt-6 pt-6 border-t border-dashed border-gray-200 flex items-center justify-between">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ Math.round((d.total_amount - d.remaining_amount) / d.total_amount * 100) }}% Lunas</span>
          <NuxtLink :to="`/debts/${d.id}/pay`" class="text-xs font-black text-kelola-teal hover:underline tracking-widest uppercase bg-kelola-teal/5 px-3 py-1.5 rounded-lg hover:bg-kelola-teal/10 transition-colors">
            Bayar Cicilan
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Modal Catat Hutang -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-kelola-teal/60 backdrop-blur-md p-4 animate-fade-in">
      <div class="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative border-t border-white/40">
        <button @click="showAddModal = false" class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h2 class="text-3xl font-extrabold text-kelola-teal mb-8 tracking-tighter">Catat Hutang</h2>
        
        <form @submit.prevent="saveDebt" class="space-y-5">
           <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nama Hutang</label>
            <input v-model="form.title" type="text" required placeholder="Misal: Cicilan Motor" class="w-full bg-gray-50 rounded-2xl py-5 px-5 font-bold text-gray-700 text-lg focus:outline-none focus:ring-4 focus:ring-kelola-yellow/50 border-2 border-gray-100 shadow-inner transition-all placeholder:font-medium placeholder:text-gray-300" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Hutang (Rp)</label>
            <div class="relative">
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-kelola-teal select-none">Rp</span>
              <input v-model="form.total_amount" type="number" required placeholder="0" class="w-full bg-gray-50 rounded-2xl py-5 pl-14 pr-5 font-black text-kelola-teal text-3xl focus:outline-none focus:ring-4 focus:ring-kelola-yellow/50 border-2 border-gray-100 shadow-inner transition-all" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tanggal Jatuh Tempo (Opsional)</label>
            <input v-model="form.dueDate" type="date" class="w-full bg-gray-50 rounded-2xl py-5 px-5 font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-kelola-yellow/50 border-2 border-gray-100 shadow-inner transition-all" />
          </div>
          <button type="submit" :disabled="saving" class="w-full mt-6 bg-kelola-teal text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex justify-center shadow-[0_10px_30px_rgba(0,84,95,0.3)] disabled:opacity-50 border-b-4 border-kelola-teal/50 hover:border-kelola-teal">
            {{ saving ? 'MENYIMPAN...' : 'SIMPAN CATATAN' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({ title: 'Hutang - Kelola' })

const { data: debts, pending, refresh } = useFetch('/api/debts')

const showAddModal = ref(false)
const saving = ref(false)
const form = ref({ title: '', total_amount: '', dueDate: '' })

const totalUnpaid = computed(() => {
  if (!debts.value) return 0
  return debts.value.reduce((acc, d) => acc + d.remaining_amount, 0)
})

const saveDebt = async () => {
  if (!form.value.title || !form.value.total_amount) return
  saving.value = true
  try {
    await $fetch('/api/debts', {
      method: 'POST',
      body: {
        title: form.value.title,
        total_amount: Number(form.value.total_amount),
        dueDate: form.value.dueDate || null
      }
    })
    showAddModal.value = false
    form.value = { title: '', total_amount: '', dueDate: '' }
    await refresh()
  } catch(e) {
    alert('Gagal menyimpan catatan hutang')
  } finally {
    saving.value = false
  }
}

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)
</script>
