import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)
    return session
  } catch(e) {
    return null
  }
})
