<template>
  <div class="space-y-6 pb-20 md:pb-0 animate-fade-in relative z-10 w-full max-w-2xl mx-auto">
    <div class="text-center mb-10 pt-8">
      <div class="inline-block bg-kelola-pink text-white px-5 py-2 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-md mb-6 rotate-2 border border-white/10 hover:rotate-0 transition-transform cursor-default">
        Tingkatkan Levelmu
      </div>
      <h1 class="text-6xl sm:text-7xl font-extrabold text-kelola-teal tracking-tighter drop-shadow-sm mb-4">Kelola <span class="text-kelola-pink">Pro</span>.</h1>
      <p class="text-gray-500 font-semibold tracking-wide">Buka semua fitur canggih dan asisten AI tanpa batas.</p>
    </div>

    <!-- Active Premium State -->
    <div v-if="session?.user?.is_premium" class="bg-kelola-pink p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/20 text-center animate-fade-in">
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-kelola-lightgreen blur-[80px] opacity-30 rounded-full pointer-events-none"></div>
      <div class="text-7xl mb-6 drop-shadow-lg">👑</div>
      <h2 class="text-4xl font-extrabold mb-3 tracking-tighter text-white">Sultan Kelola!</h2>
      <p class="text-white/80 font-semibold tracking-wide text-lg">Kamu kini memiliki akses penuh tanpa limit.</p>
    </div>

    <!-- Upgrade Offer -->
    <div v-else class="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden group">
      <!-- Decor -->
      <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-kelola-yellow blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full pointer-events-none"></div>
      
      <div class="mb-10">
        <h2 class="text-4xl sm:text-5xl font-extrabold text-kelola-teal tracking-tighter mb-4">Akses Sultan</h2>
        <div class="flex items-end gap-2 text-kelola-pink select-none">
          <span class="text-3xl font-bold pb-2">Rp</span>
          <span class="text-7xl font-black tracking-tighter leading-none">49</span>
          <span class="text-2xl font-bold pb-1">.000</span>
          <span class="text-gray-400 text-sm font-bold mb-2 uppercase tracking-widest ml-1">/bulan</span>
        </div>
      </div>

      <ul class="space-y-6 mb-12">
        <li class="flex items-center gap-5">
          <div class="w-10 h-10 rounded-full bg-kelola-lightgreen flex items-center justify-center text-kelola-teal shadow-inner text-lg font-black shrink-0">✓</div>
          <span class="font-extrabold text-gray-700 text-lg">Auto Scan Struk (AI OCR)</span>
        </li>
        <li class="flex items-center gap-5">
          <div class="w-10 h-10 rounded-full bg-kelola-lightgreen flex items-center justify-center text-kelola-teal shadow-inner text-lg font-black shrink-0">✓</div>
          <span class="font-extrabold text-gray-700 text-lg">Buat Anggaran Tanpa Batas</span>
        </li>
        <li class="flex items-center gap-5">
          <div class="w-10 h-10 rounded-full bg-kelola-lightgreen flex items-center justify-center text-kelola-teal shadow-inner text-lg font-black shrink-0">✓</div>
          <span class="font-extrabold text-gray-700 text-lg">Laporan PDF/Excel Unlimited</span>
        </li>
      </ul>

      <button @click="payWithMidtrans" :disabled="loading" class="w-full bg-kelola-teal text-kelola-lightgreen py-6 rounded-3xl font-black text-xl sm:text-2xl uppercase tracking-widest shadow-[0_20px_40px_rgba(0,84,95,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 border-b-[6px] border-kelola-teal/60 hover:border-kelola-teal relative z-10">
        {{ loading ? 'SABAR DULU...' : 'UPGRADE SEKARANG' }}
      </button>
      <div class="mt-6 flex flex-col items-center justify-center gap-2 relative z-10">
        <p class="text-[10px] text-gray-400 uppercase tracking-widest font-black flex items-center gap-2">
          <span>🔒</span> Pembayaran aman di Sandbox
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { session, fetchSession } = useCustomAuth()
const config = useRuntimeConfig()
useSeoMeta({ title: 'Premium - Kelola', description: 'Upgrade ke Premium dan nikmati fitur AI tak terbatas di Kelola.' })

const loading = ref(false)

const payWithMidtrans = async () => {
  loading.value = true
  try {
     const res = await $fetch('/api/payment/token', { method: 'POST' })
     if (res && res.token) {
       window.snap.pay(res.token, {
          onSuccess: async function(result){ 
             try { await $fetch('/api/payment/success', { method: 'POST', headers: useRequestHeaders(['cookie']) }) } catch(e) {}
             if (session.value?.user) session.value.user.is_premium = true;
             await fetchSession();
             alert("Pembayaran sukses! Selamat menikmati fitur Sultan Kelola.");
             useRouter().push('/');
          },
          onPending: function(result){ alert("Menunggu pembayaran!"); },
          onError: function(result){ alert("Pembayaran gagal!"); },
          onClose: function(){ console.log('Ditutup'); }
       })
     }
  } catch(e) {
    alert("Gagal memanggil Midtrans. Pastikan Server SDK terkonfigurasi dengan benar.")
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (process.client) {
    const script = document.createElement("script")
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    script.setAttribute("data-client-key", config.public.midtransClientKey || 'Mid-client-4iD3maqGpK4A3O3d')
    document.head.appendChild(script)
  }
})
</script>
