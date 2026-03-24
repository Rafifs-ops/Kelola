export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const symbols = query.symbols || 'BBCA,BBRI,BMRI,TLKM,GOTO'

  try {
    const response = await $fetch(`${config.stockApiBaseUrl}/prices`, {
      query: { symbols },
      headers: {
        'X-API-KEY': config.stockApiKey || '',
        'Accept': 'application/json'
      }
    })
    return response
  } catch (error: any) {
    console.error('Stock API Error:', error.message)
    return { error: 'Failed to fetch stock data' }
  }
}, {
  maxAge: 600, // 10 minutes cache
  name: 'stock-prices',
  getKey: (event) => {
    const query = getQuery(event)
    return `saham-${query.symbols || 'default'}`
  }
})
