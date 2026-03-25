<template>
  <div class="h-screen w-full font-sans antialiased overflow-y-auto">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { fetchSession, session } = useCustomAuth()
await useAsyncData('session', () => fetchSession())

// Simple router middleware protection
const router = useRouter()
const route = useRoute()
watchEffect(() => {
  const publicPages = ['/login', '/register']
  const isPublicRoute = publicPages.includes(route.path)

  if (!isPublicRoute && !session.value) {
    if (process.client) router.push('/login')
  } else if (isPublicRoute && session.value) {
    if (process.client) router.push('/')
  }
})
</script>
