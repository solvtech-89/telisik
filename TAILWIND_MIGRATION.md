Ringkasan migrasi ke TailwindCSS

1. Instalasi dependensi

Jalankan (direkomendasikan `npm` karena project menggunakan `package-lock.json`):

```bash
npm install
# atau hanya dev deps jika sudah ada node_modules: npm install tailwindcss postcss autoprefixer -D
```

2. Perintah development & build

```bash
npm run dev    # jalankan Vite dev server
npm run build  # buat bundle production (dist/)
npm run preview # preview build
```

3. File yang dibuat/diubah

- `tailwind.config.cjs` — konfigurasi content + dark mode (mengikuti `data-bs-theme="dark"`).
- `postcss.config.cjs` — PostCSS + Tailwind.
- `src/index.css` — sudah berisi `@tailwind base/components/utilities`.
- `src/components/Navbar.jsx` — contoh konversi komponen ke kelas Tailwind (Bootstrap classes dihilangkan).
- `src/App.css` — sekarang menggunakan `@layer components` untuk kelas legacy seperti `.card` dan `.logo`.

4. Panduan migrasi komponen

- Ganti kelas Bootstrap (`container`, `row`, `col-*`, `d-none`, `d-md-block`, `me-2`, dsb.) menjadi utilitas Tailwind (`container mx-auto px-4`, `flex`, `hidden md:block`, `mr-2`/`ml-2`, dsb.).
- Untuk komponen yang memiliki banyak CSS khusus, pertimbangkan membuat komponen Tailwind menggunakan `@layer components` dan `@apply` untuk menyatukan utilitas.
- Jika ada CSS bertema (light/dark) yang bergantung pada atribut `data-bs-theme`, Tailwind dark mode sudah dikonfigurasi untuk membaca `[data-bs-theme="dark"]`.
- Untuk tombol dan varian warna yang dipakai di banyak tempat, definisikan utilitas atau komponen di `src/App.css` (atau file global lain) menggunakan `@apply`.

5. Perhatian & langkah selanjutnya

- Hapus dependensi CSS framework lain (jika ada) setelah migrasi selesai.
- Jalankan aplikasi dan periksa tampilan setiap halaman; perbedaan spacing/warna mungkin perlu penyesuaian.
- Pertimbangkan menambahkan `eslint-plugin-tailwindcss` untuk membantu konsistensi kelas Tailwind.

Jika mau, saya bisa:

- Melanjutkan mengonversi komponen lain (mis. `LeftNav`, `RightSidebar`, `ProfilePhotoModal`) satu-per-satu.
- Buat PR yang memperbarui `Dockerfile` menjadi multi-stage production build.

Tuliskan komponen mana yang mau saya refactor berikutnya.
