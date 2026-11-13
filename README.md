# WALA VS MERON — Cartoon Arena

Game arena ayam kartun untuk deployment di Vercel. Lima pilihan ayam hanya berbeda warna; seluruhnya memiliki nilai POWER yang sama. Game ini hanya simulasi kartun dan tidak memiliki fitur taruhan.

## Fitur

- Arena WALA vs MERON dengan karakter ayam bergaya komik yang garang, dua fase serangan, efek benturan, debu, bulu beterbangan, dan pose pemenang.
- Tata letak responsif untuk desktop, tablet, dan ponsel.
- Lima pilihan warna: Ruby (merah), Sapphire (biru), Emerald (hijau), Sun (kuning), dan Violet (ungu).
- Hasil ditentukan di server, bukan dari JavaScript browser.
- Kontrol admin melalui bot: `/wala`, `/meron`, `/random`, `/status`, dan `/help`.
- Perintah bot dibatasi ke satu `TELEGRAM_ADMIN_CHAT_ID`.
- Mode tersimpan di GitHub Gist agar nilainya konsisten di semua serverless function Vercel.

## 1. Siapkan GitHub Gist

1. Masuk ke GitHub dan buka https://gist.github.com.
2. Buat Gist baru dengan nama file `wala-meron-state.json`.
3. Isi awal file dengan JSON berikut:

   ```json
   {
     "mode": "random",
     "updatedAt": null,
     "updatedBy": "default"
   }
   ```

4. Pilih **Create secret gist**. Secret Gist tidak ditampilkan di daftar publik, tetapi siapa pun yang memiliki tautannya tetap dapat melihatnya. Jangan simpan token atau rahasia di dalam file ini.
5. Salin ID Gist dari URL. Contoh URL `https://gist.github.com/username/0123456789abcdef0123456789abcdef`; ID Gist adalah bagian setelah nama pengguna.

**Agar tidak mengganggu project lain:** kamu boleh membuat Gist khusus untuk game. Kalau memakai Gist lama yang sudah berisi `site-state.json`, biarkan file itu tetap ada dan gunakan nama file terpisah `wala-meron-state.json` untuk game ini. Jangan arahkan `GITHUB_GIST_FILENAME` ke file milik project lain.

## 2. Buat token GitHub

1. Buka https://github.com/settings/personal-access-tokens.
2. Buat personal access token yang mendukung akses Gist.
3. Untuk fine-grained token, berikan **Account permissions → Gists → Read and write**. Token classic dapat memakai scope `gist`.
4. Simpan token dengan aman. Jangan masukkan token ke HTML, JavaScript frontend, atau repository.

Referensi resmi: https://docs.github.com/en/rest/gists/gists dan https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens.

## 3. Buat bot Telegram

1. Buka Telegram dan chat dengan `@BotFather`.
2. Jalankan `/newbot`, ikuti instruksi, lalu simpan token bot.
3. Kirim `/start` ke bot yang baru dibuat.
4. Dapatkan Chat ID admin dengan membuka `https://api.telegram.org/bot<TOKEN_BOT>/getUpdates`. Ambil nilai `message.chat.id` dari pesan pribadi admin.
5. Buat `TELEGRAM_WEBHOOK_SECRET` sepanjang 32–64 karakter. Gunakan hanya huruf, angka, `_`, atau `-`.

## 4. Environment Variables Vercel

Buka **Project → Settings → Environment Variables** lalu tambahkan:

| Variable | Isi |
|---|---|
| `GITHUB_TOKEN` | Personal access token GitHub yang memiliki izin Gists read/write |
| `GITHUB_GIST_ID` | ID Gist tempat file status game disimpan |
| `GITHUB_GIST_FILENAME` | `wala-meron-state.json` (opsional; ini nilai default) |
| `TELEGRAM_BOT_TOKEN` | Token dari BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | Chat ID admin |
| `TELEGRAM_WEBHOOK_SECRET` | Secret acak untuk mengamankan webhook |

Pilih environment **Production** (tambahkan Preview juga jika ingin menguji deployment preview). Jangan masukkan token ke file `.env` yang di-commit ke GitHub. Setelah menambah atau mengubah Environment Variables, lakukan redeploy.

## 5. Deploy ke Vercel

1. Upload seluruh isi folder ini ke repository GitHub.
2. Import repository tersebut di Vercel.
3. Framework Preset: **Other**.
4. Build Command: kosongkan / None.
5. Output Directory: `.` (root project).
6. Tambahkan Environment Variables sesuai bagian sebelumnya.
7. Deploy project.

## 6. Pasang Telegram webhook

Setelah deployment berhasil, jalankan perintah berikut di PowerShell. Ganti tiga nilai contoh dengan milikmu:

```powershell
$BOT_TOKEN = "TOKEN_BOT_TELEGRAM"
$APP_URL = "https://NAMA-PROJECT.vercel.app"
$WEBHOOK_SECRET = "SECRET_WEBHOOK_YANG_SAMA_DENGAN_VERCEL"

$body = @{
  url = "$APP_URL/api/telegram"
  secret_token = $WEBHOOK_SECRET
  allowed_updates = '["message"]'
}

Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" -Body $body
```

Respons sukses Telegram menampilkan `ok: true`. Jika memakai custom domain, isi `$APP_URL` dengan domain tersebut.

## 7. Gunakan perintah admin

- `/wala` — WALA menjadi pemenang setiap ronde.
- `/meron` — MERON menjadi pemenang setiap ronde.
- `/random` — pemenang diacak untuk setiap ronde.
- `/status` — melihat mode yang sedang aktif.
- `/help` — melihat daftar perintah.

Website membaca mode melalui API status secara berkala. Setiap ronde mengambil keputusan pemenang dari API server saat ronde dimulai. Endpoint publik `/api/state` hanya menampilkan mode dan metadata perubahan, bukan token rahasia.

## Menjalankan secara lokal

Pasang Vercel CLI dan jalankan:

```bash
npm install -g vercel
vercel dev
```

Isi environment variable melalui dashboard Vercel atau file `.env.local` lokal. File `.env.local` tidak boleh diunggah ke GitHub.

## Struktur file

```text
api/
  _lib/store.js     # Penyimpanan mode di GitHub Gist
  state.js          # API status mode
  fight.js          # Penentuan pemenang pertandingan
  telegram.js       # Webhook perintah admin
app.js              # Interaksi game dan animasi
index.html          # Halaman utama
style.css           # Tampilan responsif
```
