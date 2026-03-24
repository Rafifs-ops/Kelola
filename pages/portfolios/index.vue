<template>
  <div class="px-6 py-8 md:p-12 pb-32 max-w-4xl mx-auto">
    
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Aset Saya</h1>
        <p class="text-kelola-sea mt-1 font-semibold text-sm">Kelola portofolio Kripto & Saham Anda dengan harga live.</p>
      </div>
      <div class="flex gap-2">
        <button @click="openModal('CRYPTO')" class="bg-kelola-pink text-white px-5 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(193,111,176,0.3)] hover:scale-105 transition-transform uppercase tracking-widest text-xs border border-transparent">
          + Kripto
        </button>
        <button @click="openModal('STOCK')" class="bg-kelola-teal text-white px-5 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform uppercase tracking-widest text-xs border border-transparent">
          + Saham
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 mb-8">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-center">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Kripto</span>
        <span class="text-2xl font-black text-kelola-teal">
          {{ pendingCrypto ? 'Memuat...' : 'Rp ' + totalCryptoValue.toLocaleString('id-ID') }}
        </span>
      </div>
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-center">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Saham</span>
        <span class="text-2xl font-black text-kelola-teal">
          {{ pendingSaham ? 'Memuat...' : 'Rp ' + totalStockValue.toLocaleString('id-ID') }}
        </span>
      </div>
    </div>

    <!-- Asset List -->
    <div v-if="pending" class="text-center py-10 opacity-50 font-bold">Memuat Aset...</div>
    <div v-else-if="portfolios.length === 0" class="text-center py-12 bg-white rounded-3xl border border-gray-100 border-dashed">
      <span class="text-4xl inline-block mb-3">📈</span>
      <h3 class="text-xl font-bold text-kelola-teal mb-1">Belum ada aset</h3>
      <p class="text-sm text-gray-400">Tambahkan saham atau kripto pertamamu.</p>
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="asset in portfolios" :key="asset.id" class="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50 hover:border-kelola-sea/20 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black tracking-tighter" :class="asset.type === 'CRYPTO' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'">
            {{ asset.symbol.substring(0, 3).toUpperCase() }}
          </div>
          <div>
            <h3 class="font-bold text-kelola-teal">{{ asset.symbol.toUpperCase() }}</h3>
            <p class="text-xs text-gray-400 font-semibold">{{ asset.amount }} {{ asset.type === 'STOCK' ? 'Lot' : 'Koin' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-[10px] font-bold text-kelola-sea uppercase tracking-widest">Estimasi Nilai (Live)</p>
            <p class="font-black text-kelola-teal">Rp {{ getLiveTargetValue(asset).toLocaleString('id-ID') }}</p>
          </div>
          <button @click="deleteAsset(asset.id)" class="bg-red-50 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-colors">
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Add Asset Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-kelola-teal/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-100 animate-fade-in-up">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black text-kelola-teal tracking-tighter">Tambah {{ form.type === 'STOCK' ? 'Saham' : 'Kripto' }}</h2>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-800 text-2xl font-light">&times;</button>
        </div>
        
        <form @submit.prevent="addAsset" class="space-y-4">

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Pilih Simbol {{ form.type === 'STOCK' ? 'Saham' : 'Kripto' }}
            </label>
            
            <!-- Searchable Dropdown (Datalist) -->
            <input v-if="form.type === 'CRYPTO'" list="crypto-list" v-model="form.symbol" placeholder="Ketik/Cari Koin (cth: bitcoin)..." required class="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3 px-4 text-kelola-teal font-bold focus:outline-none focus:border-kelola-sea transition-all uppercase" autocomplete="off" />
            <input v-else list="stock-list" v-model="form.symbol" placeholder="Ketik/Cari Saham (cth: BBCA)..." required class="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3 px-4 text-kelola-teal font-bold focus:outline-none focus:border-kelola-sea transition-all uppercase" autocomplete="off" />
            
            <datalist id="crypto-list">
              <option v-for="coin in cryptoOptions" :key="coin" :value="coin">{{ (coin || '').toUpperCase() }}</option>
            </datalist>
            <datalist id="stock-list">
              <option v-for="saham in stockOptions" :key="saham" :value="saham">{{ (saham || '').toUpperCase() }}</option>
            </datalist>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              {{ form.type === 'STOCK' ? 'Jumlah Lot (1 Lot = 100 lembar)' : 'Jumlah Koin' }}
            </label>
            <input v-model="form.quantity" type="number" step="0.0000001" required placeholder="0.0" class="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3 px-4 text-kelola-teal font-bold focus:outline-none focus:border-kelola-sea transition-all"/>
          </div>

          <button type="submit" :disabled="formLoading || !form.symbol" class="w-full mt-6 bg-kelola-teal text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50">
            {{ formLoading ? 'Menyimpan...' : 'Simpan Aset' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: portfolios, pending, refresh: refreshPortfolios } = useFetch('/api/portfolios', { headers: useRequestHeaders(['cookie']) })

// Reactive Queries ensuring owned assets are always fetched
const cryptoQuery = computed(() => {
  const base = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana', 'dogecoin', 'pepe', 'shiba-inu']
  const owned = portfolios.value?.filter(p => p.type === 'CRYPTO').map(p => p.symbol.toLowerCase()) || []
  return Array.from(new Set([...base, ...owned])).join(',')
})

const stockQuery = computed(() => {
  const base = ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'GOTO', 'TLKM', 'ASII', 'AMMN', 'BREN', 'BRPT']
  const owned = portfolios.value?.filter(p => p.type === 'STOCK').map(p => p.symbol.toUpperCase()) || []
  return Array.from(new Set([...base, ...owned])).join(',')
})

// Fetch live prices reactively using callback () => Url
const { data: cryptoPrices, pending: pendingCrypto } = useFetch(() => `/api/crypto?ids=${cryptoQuery.value}`)
const { data: sahamPrices, pending: pendingSaham } = useFetch(() => `/api/saham?symbols=${stockQuery.value}`)

// Compute dropdown options safely
const cryptoOptions = computed(() => {
  if (!cryptoPrices.value || typeof cryptoPrices.value !== 'object') return cryptoQuery.value.split(',').filter(Boolean)
  // Filter out meta keys like 'error' or 'statusCode' if it's an error object
  return Object.keys(cryptoPrices.value).filter(key => key !== 'error' && key !== 'statusCode')
})

const stockOptions = computed(() => {
  if (!sahamPrices.value?.data?.results || !Array.isArray(sahamPrices.value.data.results)) {
    return stockQuery.value.split(',').filter(Boolean)
  }
  return sahamPrices.value.data.results
    .map(s => s.symbol)
    .filter(t => typeof t === 'string' && t.length > 0)
})

const getLiveTargetValue = (asset) => {
  if (asset.type === 'CRYPTO' && cryptoPrices.value) {
    const symbolId = asset.symbol.toLowerCase()
    const priceCache = cryptoPrices.value[symbolId]
    if (priceCache && priceCache.idr) {
      return asset.amount * priceCache.idr
    }
  } else if (asset.type === 'STOCK' && sahamPrices.value?.data?.results && Array.isArray(sahamPrices.value.data.results)) {
    const symbolCode = (asset.symbol || '').toUpperCase()
    const stockData = sahamPrices.value.data.results.find(s => (s.symbol || '').toUpperCase() === symbolCode)
    if (stockData && stockData.close) {
      // 1 lot = 100 lembar
      const price = typeof stockData.close === 'number' ? stockData.close : parseInt(stockData.close.toString().replace(/[^0-9]/g, ''))
      return (asset.amount || 0) * 100 * (price || 0)
    }
  }
  // Fallback to buy price if live API fails
  return asset.amount * (asset.buyPrice || 0)
}

const totalCryptoValue = computed(() => {
  if (!portfolios.value) return 0
  return portfolios.value.filter(p => p.type === 'CRYPTO').reduce((acc, p) => acc + getLiveTargetValue(p), 0)
})

const totalStockValue = computed(() => {
  if (!portfolios.value) return 0
  return portfolios.value.filter(p => p.type === 'STOCK').reduce((acc, p) => acc + getLiveTargetValue(p), 0)
})

const showAddModal = ref(false)
const formLoading = ref(false)
const form = ref({ type: 'CRYPTO', symbol: '', name: '', quantity: null, buy_price: null })

const openModal = (type) => {
  form.value = { type, symbol: '', name: 'Asset', quantity: null, buy_price: 0 }
  showAddModal.value = true
}

const addAsset = async () => {
  formLoading.value = true
  try {
    form.value.symbol = form.value.symbol.toLowerCase()
    form.value.name = form.value.symbol.toUpperCase()
    await $fetch('/api/portfolios', { method: 'POST', body: form.value, headers: useRequestHeaders(['cookie']) })
    showAddModal.value = false
    refreshPortfolios()
  } catch (e) {
    alert('Gagal menambah aset')
  } finally {
    formLoading.value = false
  }
}

const deleteAsset = async (id) => {
  if(!confirm('Hapus aset ini?')) return
  await $fetch('/api/portfolios', { method: 'DELETE', body: { id }, headers: useRequestHeaders(['cookie']) })
  refreshPortfolios()
}

useSeoMeta({ title: 'Aset Portofolio Live - Kelola' })
</script>
