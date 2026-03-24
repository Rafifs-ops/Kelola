<template>
  <div class="min-h-screen flex items-center justify-center bg-kelola-teal px-4 relative overflow-hidden">
    <!-- Abstract Shapes -->
    <div
      class="absolute -top-20 -left-20 w-80 h-80 bg-kelola-pink rounded-full blur-[80px] opacity-30 mix-blend-screen pointer-events-none">
    </div>
    <div
      class="absolute bottom-0 right-0 w-96 h-96 bg-kelola-lightgreen rounded-full blur-[100px] opacity-20 pointer-events-none">
    </div>

    <div
      class="max-w-md w-full bg-kelola-beige/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 relative z-10 border border-white/20">

      <div class="text-center mb-10 flex flex-col items-center">
        <img src="/assets/images/kelola-logo.png" alt="Kelola Logo" class="h-16 w-auto mb-4 drop-shadow-lg" />
        <p class="text-kelola-pink font-semibold tracking-wide text-sm uppercase">Login ke Akun Anda</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div v-if="errorMsg"
          class="bg-red-100 text-red-500 font-bold p-3 rounded-2xl text-xs text-center border border-red-200 shadow-inner">
          {{ errorMsg }}
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Alamat
            Email</label>
          <input v-model="form.email" type="email" required placeholder="email@contoh.com"
            class="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-5 text-kelola-teal font-bold focus:outline-none focus:border-kelola-sea focus:ring-4 focus:ring-kelola-sea/20 transition-all shadow-inner placeholder:font-medium placeholder:text-gray-300" />
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Kata
            Sandi</label>
          <input v-model="form.password" type="password" required placeholder="••••••••"
            class="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-5 text-kelola-teal font-extrabold focus:outline-none focus:border-kelola-sea focus:ring-4 focus:ring-kelola-sea/20 transition-all shadow-inner placeholder:font-medium placeholder:text-gray-300" />
        </div>

        <button type="submit" :disabled="loading"
          class="w-full mt-6 bg-kelola-teal text-kelola-lightgreen py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(0,84,95,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 border-white/5 border border-b-4 border-kelola-teal/80">
          {{ loading ? 'SABAR DULU...' : 'MASUK' }}
        </button>
      </form>

      <p class="mt-8 text-center text-xs text-kelola-teal/80 font-bold">
        Belum punya akun?
        <NuxtLink to="/register"
          class="text-white bg-kelola-pink px-4 py-2 rounded-xl ml-1 hover:brightness-110 transition-all shadow-md inline-block">
          Daftar</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
useSeoMeta({ title: 'Login - Kelola' })

const form = ref({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value
    })
    window.location.href = '/'
  } catch (e) {
    errorMsg.value = e.data?.message || 'Login gagal. Cek kembali kredensial Anda.'
  } finally {
    loading.value = false
  }
}
</script>
