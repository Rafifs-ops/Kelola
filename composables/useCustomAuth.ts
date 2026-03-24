export const useCustomAuth = () => {
  const session = useState('auth_session', () => null)
  
  const fetchSession = async () => {
    try {
      const data = await $fetch('/api/auth/session', { headers: useRequestHeaders(['cookie']) })
      session.value = data
    } catch(e) {
      session.value = null
    }
  }
  
  const signOut = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    session.value = null
    window.location.href = '/login'
  }
  
  return { session, fetchSession, signOut }
}
