import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const replaceInFile = (filePath, search, replacement) => {
  const fullPath = path.join(__dirname, filePath)
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8')
    content = content.replace(search, replacement)
    fs.writeFileSync(fullPath, content)
  }
}

// 1. API endpoints Server imports
const apiFiles = [
  'server/api/transactions/index.ts',
  'server/api/categories/index.ts',
  'server/api/budgets/index.ts',
  'server/api/debts/index.ts',
  'server/api/dashboard/index.ts',
  'server/api/reports/index.ts',
  'server/api/ai/insights.ts',
  'server/api/payment/token.ts'
]

apiFiles.forEach(f => {
  let fullPath = path.join(__dirname, f)
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8')
    
    // Determine relative path correctly for deep nesting
    const depth = f.split('/').length - 2
    let relPath = '../'.repeat(depth) + 'utils/auth'
    
    content = content.replace(/import \{ getServerSession \} from '#auth'/g, `import { requireAuth } from '${relPath}'`)
    content = content.replace(/await getServerSession\(event\)/g, "await requireAuth(event)")
    fs.writeFileSync(fullPath, content)
  }
})

// 2. Vue Pages
const vueFiles = [
  'pages/index.vue',
  'pages/login.vue',
  'pages/transactions/index.vue',
  'pages/transactions/add.vue',
  'pages/budgets/index.vue',
  'pages/debts/index.vue',
  'pages/premium/index.vue',
]

vueFiles.forEach(f => {
  replaceInFile(f, /const \{ data: session \} = useAuth\(\)/g, "const { session } = useCustomAuth()")
  replaceInFile(f, /const \{ signIn \} = useAuth\(\)/g, "")
})

replaceInFile('layouts/default.vue', /const \{ signOut \} = useAuth\(\)/g, "const { signOut } = useCustomAuth()")

// Login page
let loginPath = path.join(__dirname, 'pages/login.vue')
if (fs.existsSync(loginPath)) {
  let content = fs.readFileSync(loginPath, 'utf-8')
  content = content.replace(/signIn\('google', \{ callbackUrl: '\/' \}\)/g, "window.location.href = '/api/auth/google'")
  content = content.replace(/definePageMeta[^\]]+\] ?\}\s*\)/g, "definePageMeta({ layout: false })")
  fs.writeFileSync(loginPath, content)
}

console.log('Auth migration complete')
