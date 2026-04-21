export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap'
  ],
  site: {
    url: 'https://kelola-app-genz.com',
    name: 'Kelola Finance Tracker'
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    cryptoApiKey: process.env.COINGECKO_API_KEY,
    stockApiKey: process.env.STOCK_API_KEY,
    stockApiBaseUrl: process.env.STOCK_API_BASE_URL,
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    authSecret: process.env.AUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    public: {
      cryptoApiBaseUrl: process.env.COINGECKO_BASE_URL,
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
    }
  },
  compatibilityDate: '2024-04-03',
  nitro: {
    storage: {
      cache: {
        driver: 'memory'
      }
    }
  },
  future: {
    compatibilityVersion: 4,
  },
})
