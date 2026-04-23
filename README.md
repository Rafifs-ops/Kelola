# DOKUMENTASI WEBSITE KELOLA

Aplikasi Android dan IOS akan menggunakan `Capacitor.js` yang akan konversi Nuxt Js menjadi aplikasi android dan ios

## Alur Verifikasi Email
### User Meminta OTP:
1. Frontend mengirim email ke `server/api/send-otp.post.ts`.
2. Server menghasilkan 6 digit angka.
3. Server menyimpan email + OTP (dan waktu kedaluwarsa) ke database.
4. Server mengirim email menggunakan Nodemailer. 

### User Memverifikasi OTP:
1. User memasukkan OTP di Frontend.
2. Frontend mengirim email + OTP ke `server/api/verify-otp.post.ts`.
3. Server mencocokkan OTP dari database dan memeriksa apakah sudah kedaluwarsa.
4. Jika cocok, berhasil daftar dan buat sesi login yang udh dibuat.

## Alur Authentikasi:
1. User input credentials dan akan request ke `server/api/auth/login.post.ts`
2. Di server, akan di compare menggunakan bycrypt
3. Jika benar, maka otomatis akan dibuatkan token dengan data id user dengan kadaluwarsa 7 minggu
4. Token akan disimpan di Cookie dengan waktu kadaluwarsa yang telah ditentukan
5. Session akan mengambil token dari cookie di `server/utils/auth.ts`
6. Token tersebut akan diverify lalu didecode untuk mendapatkan id user yang telah diinput di langkah 3
7. Session akan mencari data dengan id tersebut ke database lalu data-data user akan direturn/dimasukan ke session

## Proses Scan Struk:
1. User kirim foto struk ke `server/api/ai/ocr.post.ts`
2. Gemini analisis dan scan struk lalu mereturn data hasil analisis nya sesuai format (field table transactions di db) yang telah ditentukan
3. Data hasil analisis nya akan langsung diterima di frontend untuk menunggu konfirmasi user di `transactions.vue`
4. Jika User sudah approve, maka gunakan data hasil analisis tersebut untuk diinsert ke table transactions di database 

## Alur Kerja Simpan Asset (Saham & Kripto)
### Proses Menyimpan Asset:
1. User memilih tipe asset (Stock/Crypto), memasukkan simbol, dan jumlah asset pada modal di file `app/pages/portfolios/index.vue`.
2. Frontend melakukan request POST ke endpoint `server/api/portfolios/index.ts` dengan membawa data asset tersebut.
3. Server memvalidasi sesi user menggunakan `server/utils/auth.ts` dan menyimpan data asset ke database pada table `portfolio` menggunakan Prisma.
4. Setelah berhasil disimpan, frontend akan memicu fungsi `refreshPortfolios` untuk memperbarui list asset yang ditampilkan.

## Alur Mendapatkan Harga Live
### Proses Fetching Harga:
1. Frontend di `app/pages/portfolios/index.vue` mengidentifikasi daftar simbol asset (saham & kripto) yang dimiliki user maupun daftar default.
2. Untuk Kripto: Frontend memanggil `server/api/crypto.ts` yang akan mengambil harga terbaru dari API Coingecko (Cached 10 menit).
3. Untuk Saham: Frontend memanggil `server/api/saham.ts` yang akan mengambil harga penutupan terbaru dari API Saham yang dikonfigurasi (Cached 10 menit).
4. Hasil harga live tersebut akan dikalkulasi di frontend menggunakan fungsi `getLiveTargetValue` pada file `app/pages/portfolios/index.vue`:
   - **Kripto**: `Jumlah Koin * Harga IDR`.
   - **Saham**: `Jumlah Lot * 100 * Harga Close` (karena 1 Lot = 100 lembar).
5. Nilai estimasi total portofolio ditampilkan secara real-time pada dashboard portofolio user.
