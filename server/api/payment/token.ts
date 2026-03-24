import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session || !session.user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  
  const config = useRuntimeConfig()
  // @ts-ignore
  const userId = session.user.id
  const shortId = userId.substring(0, 8)
  const orderId = `PRM-${shortId}-${Date.now()}`
  
  // Base64 encode Midtrans Server Key
  const authString = Buffer.from(`${config.midtransServerKey}:`).toString('base64')
  
  try {
    const response = await $fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: {
        transaction_details: {
          order_id: orderId,
          gross_amount: 49000
        },
        customer_details: {
          first_name: session.user.name,
          email: session.user.email
        }
      }
    })
    return response // Contains token
  } catch (error: any) {
    console.error('Midtrans API Error:', error.data || error.message)
    throw createError({ statusCode: 500, message: 'Failed to create payment token' })
  }
})
