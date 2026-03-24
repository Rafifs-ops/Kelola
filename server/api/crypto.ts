export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const ids = query.ids || 'bitcoin,ethereum,binancecoin,solana,ripple'

  try {
    const response = await $fetch(`${config.public.cryptoApiBaseUrl}/simple/price`, {
      query: {
        ids: ids,
        vs_currencies: 'idr',
        x_cg_demo_api_key: config.cryptoApiKey
      }
    })
    return response
  } catch (error: any) {
    console.error('Crypto API Error:', error.message)
    return { error: 'Failed to fetch crypto data' }
  }
}, {
  maxAge: 600, // 10 minutes cache
  name: 'crypto-stats',
  getKey: (event) => {
    const query = getQuery(event)
    return `crypto-prices-${query.ids || 'default'}`
  }
})
