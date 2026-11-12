# Website Undangan Pernikahan Digital

Template undangan pernikahan digital berbasis HTML, CSS, dan JavaScript murni (vanilla) dengan arsitektur *config-driven* — seluruh konten (nama mempelai, tanggal, lokasi, galeri, dll.) dikelola dari satu berkas data tanpa perlu menyentuh markup, dan seluruh tampilan visual dikendalikan dari satu sistem Design Tokens terpusat.

| | |
|---|---|
| Mitra Industri | UD. Rez Wan Jaya |
| Program | Web Development Internship |
| Status Proyek | Aktif dikembangkan (Minggu ke-11) |
| Bahasa Antarmuka | Bahasa Indonesia |
| Lisensi | Internal / Proprietary (lihat bagian Lisensi) |

---

## Daftar Isi

1. [Tentang Proyek](#tentang-proyek)
2. [Fitur Utama](#fitur-utama)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Struktur Proyek](#struktur-proyek)
5. [Arsitektur Design Tokens](#arsitektur-design-tokens)
6. [Cara Menjalankan Proyek](#cara-menjalankan-proyek)
7. [Panduan Kustomisasi Konten](#panduan-kustomisasi-konten)
8. [Panduan Kustomisasi Tema Visual](#panduan-kustomisasi-tema-visual)
9. [Integrasi Buku Tamu (Google Apps Script)](#integrasi-buku-tamu-google-apps-script)
10. [Dukungan Browser dan Aksesibilitas](#dukungan-browser-dan-aksesibilitas)
11. [Individual Bug Fixing Log](#individual-bug-fixing-log)
12. [Konvensi Commit](#konvensi-commit)
13. [Lisensi](#lisensi)

---

## Tentang Proyek

Proyek ini adalah boilerplate/template website undangan pernikahan digital bertema adat Jawa (nuansa sogan, emas, dan parchment) yang dirancang agar dapat dipakai ulang (reusable) untuk banyak klien tanpa perlu menulis ulang kode. Seluruh data pernikahan — nama mempelai, tanggal akad dan resepsi, lokasi, galeri foto, rekening amplop digital, hingga daftar menu navigasi — diisi melalui satu berkas konfigurasi (`config.js`), lalu secara otomatis di-*hydrate* (disuntikkan) ke dalam `index.html` oleh mesin template ringan yang ditulis di `script.js`.

Data mempelai pada berkas konfigurasi saat ini (Arya & Sekar) bersifat contoh/placeholder dan wajib diganti sesuai data klien sebelum situs dipublikasikan.

---

## Fitur Utama

- Tirai pembuka (opening curtain) bernuansa gunungan wayang, lengkap dengan nama tamu personal.
- Navigasi bawah melayang (bottom navigation) yang scrollable, dengan indikator section aktif otomatis saat scroll (via `IntersectionObserver`), dan ukuran yang sudah dioptimalkan untuk sentuhan jempol di perangkat mobile.
- Animasi scroll reveal pada setiap section saat elemen masuk ke area pandang.
- Detail acara akad dan resepsi lengkap dengan info dress code.
- Peta lokasi interaktif (Google Maps embed) beserta tata tertib tamu.
- Tombol "Tambah ke Kalender" yang menghasilkan berkas `.ics` otomatis dari data acara.
- Ajakan live streaming untuk tamu yang berhalangan hadir.
- Timeline kisah cinta mempelai yang dirender dinamis dari `config.js`.
- Galeri foto (slider) dengan navigasi tombol, keyboard, swipe, serta lightbox untuk tampilan penuh.
- Video momen pernikahan (embed YouTube responsif).
- Amplop digital (gift section) — panel rekening bank yang dapat dibuka/tutup, lengkap tombol salin nomor rekening dan alamat ke clipboard.
- Buku tamu (guestbook) — form ucapan dan konfirmasi kehadiran yang terhubung ke Google Apps Script, serta daftar ucapan tamu lain yang diambil (fetch) secara real-time.
- Pemutar audio latar (gending Jawa) dengan kontrol play/pause mengambang.
- Mendukung `prefers-reduced-motion` — animasi otomatis dinonaktifkan untuk pengguna yang sensitif terhadap gerakan.
- Desain responsif penuh dari ukuran layar ponsel terkecil hingga desktop.

---

## Teknologi yang Digunakan

| Teknologi | Keterangan |
|---|---|
| HTML5 | Markup semantik dengan atribut `data-config-*` sebagai penanda injeksi data |
| CSS3 | Vanilla CSS dengan CSS Custom Properties (Design Tokens) sebagai single source of truth |
| JavaScript (ES6+, Vanilla) | Tanpa framework/bundler — murni DOM API bawaan browser |
| Google Fonts | `Playfair Display` (judul/display) dan `Plus Jakarta Sans` (teks umum) |
| Material Symbols | Ikon antarmuka |
| Google Apps Script | Backend ringan untuk fitur buku tamu (GET/POST ucapan) |
| Google Maps Embed | Peta lokasi acara |

Tidak ada proses build (bundler, transpiler, atau package manager) yang diwajibkan — proyek dapat langsung dijalankan sebagai situs statis.

---

## Struktur Proyek

```
wedding-invitation/
├── assets/
│   ├── audio/                 # Berkas musik latar (gending Jawa)
│   ├── images/                # Foto mempelai, galeri pre-wedding, dll.
│   ├── ornaments/              # Aset ornamen visual (gunungan, wayang, awan, dsb.)
│   └── video/                 # Aset video lokal (jika ada)
├── css/
│   ├── style.css               # Seluruh styling komponen, mengonsumsi token via var()
│   └── variables.css          # Design Tokens terpusat (WAJIB dimuat sebelum style.css)
├── js/
│   ├── config.js              # Single source of truth seluruh konten/data pernikahan
│   └── script.js              # Mesin hydrateConfig() + seluruh logika interaktif UI
├── .gitignore                 # Daftar berkas/folder yang diabaikan Git
├── debug.log                  # Log debug lokal (sebaiknya masuk .gitignore, bukan untuk produksi)
├── index.html                 # Markup utama & penanda injeksi data (data-config-*)
└── README.md                  # Dokumentasi proyek (berkas ini)
```

Catatan boundary markers: setiap area penting pada `index.html`, `variables.css`, dan `style.css` dibungkus dengan komentar penanda terstruktur, contoh:

```html
<!-- ============================================ -->
<!-- TEMPLATE TAGGING BOUNDARY MARKER: NAMA SECTION -->
<!-- ============================================ -->
```

Penanda ini membantu tim operasional/tema mengenali area yang aman diubah tanpa merusak struktur inti.

---

## Arsitektur Design Tokens

Sejak Minggu ke-11, seluruh nilai visual atomik (warna, tipografi, radius, spasi, shadow, dan transisi) disentralisasi penuh ke dalam `css/variables.css` menggunakan CSS Custom Properties pada selektor `:root`. Berkas `css/style.css` tidak lagi memiliki nilai hardcoded — seluruhnya dikonsumsi melalui fungsi `var()`.

### Kategori Token

| Kategori | Contoh Token | Keterangan |
|---|---|---|
| Warna | `--sogan-deep`, `--gold-bright`, `--body-text` | Palet warna dasar |
| Varian RGB | `--gold-bright-rgb`, `--body-text-rgb` | Memungkinkan `rgba(var(--x-rgb), alpha)` tanpa nilai hardcoded |
| Status/Sistem | `--color-danger`, `--color-success` | Warna validasi form dan status "tersalin" |
| Tipografi | `--font-display`, `--fs-headline-lg` | Font family dan skala ukuran teks |
| Shape & Elevation | `--radius-md`, `--shadow-standard` | Radius sudut dan efek bayangan |
| Spasi | `--space-sm` s.d. `--space-2xl` | Sistem spasi kelipatan 8px |
| Transisi | `--transition-fast` s.d. `--transition-slow` | Standar durasi animasi elemen interaktif |

### Cara Kerja

```css
/* css/variables.css — SATU-SATUNYA tempat mengubah tema global */
:root {
  --gold-bright: #D4AF37;
  --gold-bright-rgb: 212, 175, 55;
  --radius-md: 0.75rem;
}

/* css/style.css — hanya mengonsumsi, tidak pernah hardcode nilai */
.btn--gold {
  background: var(--gold-bright);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px rgba(var(--gold-bright-rgb), 0.4);
}
```

Dengan arsitektur ini, perubahan satu nilai di `variables.css` akan langsung tercermin di seluruh komponen `style.css` tanpa perlu mencari-cari nilai di ribuan baris kode — ideal untuk membuat varian tema baru (misalnya Rustic Pastel, Elegant Gold) secara instan dan aman tanpa merusak tata letak.

Penting: `css/variables.css` wajib dimuat sebelum `css/style.css` pada `<head>` `index.html`:

```html
<link rel="stylesheet" href="css/variables.css" />
<link rel="stylesheet" href="css/style.css" />
```

---

## Cara Menjalankan Proyek

Karena proyek ini adalah situs statis tanpa proses build, cukup gunakan server lokal sederhana:

1. Unduh/clone seluruh isi repositori ini.
2. Buka folder proyek di Visual Studio Code.
3. Instal ekstensi Live Server.
4. Klik kanan pada `index.html`, lalu pilih "Open with Live Server".
5. Situs akan otomatis terbuka di `http://localhost:5500` (atau port lain sesuai konfigurasi Live Server).

Disarankan menggunakan server lokal (bukan membuka file secara langsung lewat `file://`) karena fitur `fetch()` pada integrasi buku tamu memerlukan konteks HTTP.

---

## Panduan Kustomisasi Konten

Seluruh konten diatur dari satu berkas: `js/config.js`. Jangan pernah mengedit teks langsung di `index.html` atau `script.js`.

Struktur domain data pada `config.js`:

| Domain | Mengatur |
|---|---|
| `site` | Judul halaman, deskripsi, bahasa, warna tema browser |
| `couple` | Data mempelai pria & wanita (nama, orang tua, Instagram, foto) |
| `date` | Tanggal & format kalender |
| `events` | Detail acara Akad Nikah & Resepsi |
| `location` | Peta, alamat, tata tertib tamu |
| `streaming` | Tautan live streaming |
| `story` | Timeline kisah cinta (list) |
| `gallery` | Daftar foto pre-wedding (list) |
| `video` | Tautan video YouTube |
| `gift` | Rekening bank & alamat kado fisik |
| `wishes` | Label & teks form buku tamu |
| `closing` | Teks penutup/footer |
| `nav` | Daftar item navigasi bawah (list) |

Contoh mengganti nama mempelai:

```js
couple: {
  groom: { name: 'Nama Lengkap Pria', shortName: 'Nama Panggilan', ... },
  bride: { name: 'Nama Lengkap Wanita', shortName: 'Nama Panggilan', ... },
}
```

Simpan berkas, lalu refresh browser — seluruh bagian situs yang menampilkan data tersebut (tirai pembuka, hero, kartu mempelai, footer) akan ikut diperbarui otomatis tanpa perlu mengubah HTML.

---

## Panduan Kustomisasi Tema Visual

Untuk mengganti tema warna/tipografi secara global:

1. Buka `css/variables.css`.
2. Ubah nilai token warna/tipografi yang diinginkan pada blok `:root`.
3. Simpan — seluruh komponen di `style.css` akan otomatis menyesuaikan karena semuanya mengonsumsi token yang sama.

Contoh mengubah warna emas utama situs:

```css
:root {
  --gold-bright: #C9A227;          /* ganti nilai hex sesuai tema baru */
  --gold-bright-rgb: 201, 162, 39; /* wajib disesuaikan juga agar rgba() tetap akurat */
}
```

Tips verifikasi cepat: buka Chrome DevTools, masuk ke tab Elements kemudian Styles/Computed, cari elemen dengan properti `var(--gold-bright)`, lalu ubah nilainya langsung di DevTools untuk pratinjau instan sebelum menyimpan perubahan permanen di `variables.css`.

---

## Integrasi Buku Tamu (Google Apps Script)

Fitur buku tamu (`#wishes`) terhubung ke endpoint Google Apps Script yang dikonfigurasi pada:

```js
guestbookApiUrl: 'https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec'
```

- POST — mengirim nama, status kehadiran, dan pesan ucapan tamu.
- GET — mengambil seluruh daftar ucapan untuk ditampilkan di `#wishes-container`.

Ganti nilai `guestbookApiUrl` dengan endpoint Apps Script milik klien masing-masing sebelum deploy ke produksi.

---

## Dukungan Browser dan Aksesibilitas

- Mendukung seluruh browser modern berbasis Chromium, Firefox, dan Safari (termasuk iOS Safari).
- Elemen interaktif dilengkapi atribut `aria-*`, `role`, dan status fokus (`focus-visible`) yang jelas.
- Menghormati preferensi sistem `prefers-reduced-motion` — animasi reveal dan audio dinonaktifkan otomatis untuk pengguna yang mengaktifkan opsi tersebut.
- Tata letak aman terhadap notch/safe area perangkat mobile modern (`env(safe-area-inset-*)`).

---

## Individual Bug Fixing Log

Log kendala teknis dan solusi selama pengembangan, sesuai standar dokumentasi internship Minggu ke-11.

### Bug #1 — Navigasi Bawah Mobile Memerlukan Scroll Horizontal

Kategori: Responsive Layout / Touch Target Sizing

Deskripsi masalah: Pada perangkat mobile, 7 item menu `#bottom-nav` melebihi lebar viewport (sekitar 459px dibutuhkan vs. sekitar 352px tersedia pada layar 375px), sehingga pengguna harus menggeser (scroll) navigasi secara horizontal untuk mengakses menu di sisi kanan — mengurangi kenyamanan navigasi satu tangan (thumb-friendly).

Analisis: Ukuran `min-width`, `padding`, dan `gap` antar item navigasi pada breakpoint mobile terlalu besar untuk mengakomodasi 7 item sekaligus dalam `max-width: 94vw`.

Solusi: Mengecilkan `min-width`, `min-height`, `padding`, `gap`, serta ukuran ikon/label `.bottom-nav__item` khusus pada breakpoint mobile (di bawah 640px) hingga total lebar seluruh item (sekitar 297px) muat tanpa scroll, sembari tetap mempertahankan luas area sentuh minimum yang nyaman untuk ibu jari (sekitar 39x43px). Posisi `.bottom-nav` juga dirapatkan ke tepi bawah viewport (`bottom: calc(env(safe-area-inset-bottom, 0px) + 0.2rem)`) agar tidak menyisakan jarak mengambang yang tidak perlu.

Status: Selesai dan diverifikasi pada beberapa lebar viewport (320px sampai 430px).

### Bug #2 — Nilai Warna dan Transisi Hardcoded di `style.css`

Kategori: Design Tokens Architecture / Maintainability / CSS Specificity

Deskripsi masalah: Sebelum refactor Minggu ke-11, ditemukan 166 nilai visual hardcoded (112 fungsi `rgba()` dengan nilai RGB literal, ditambah 6 nilai hex) yang tersebar di `style.css`, serta durasi transisi (200ms sampai 500ms) yang tidak terstandardisasi. Hal ini membuat perubahan tema tidak bisa dilakukan secara instan dan terpusat — setiap variasi opasitas warna emas, misalnya, harus dicari dan diubah manual satu per satu di ribuan baris kode.

Analisis: Nilai `rgba(R, G, B, alpha)` di CSS tidak otomatis mengikuti perubahan token warna solid (`var(--gold-bright)`) karena `rgba()` versi lama membutuhkan komponen R, G, B terpisah dalam bentuk angka literal, bukan nilai hex.

Solusi: Menambahkan token varian RGB (contoh: `--gold-bright-rgb: 212, 175, 55;`) di `variables.css` untuk setiap warna dasar yang memiliki varian transparansi, lalu mengganti seluruh pemanggilan `rgba(212, 175, 55, x)` menjadi `rgba(var(--gold-bright-rgb), x)` menggunakan skrip pencocokan pola (regex) yang memverifikasi kesesuaian nilai RGB sebelum dan sesudah substitusi sehingga tidak ada perubahan visual. Durasi transisi juga distandardisasi ke token `--transition-fast/base/smooth/slow` tanpa mengubah fungsi easing maupun delay aslinya.

Status: Selesai, divalidasi dengan pengecekan otomatis (nol nilai hex/`rgba()` literal tersisa, jumlah kurung kurawal CSS sebelum dan sesudah identik, seluruh `var()` memiliki definisi token yang valid).

---

## Konvensi Commit

Proyek ini menggunakan standar Conventional Commits.

| Prefix | Kegunaan |
|---|---|
| `feat:` | Penambahan fitur baru |
| `fix:` | Perbaikan bug |
| `refactor:` | Perubahan struktur kode tanpa mengubah perilaku/output |
| `style:` | Perubahan format/styling yang tidak memengaruhi logika |
| `docs:` | Perubahan dokumentasi (misalnya README.md) |
| `chore:` | Pekerjaan pemeliharaan (konfigurasi, dependensi, dll.) |

Contoh:

```
refactor: sentralisasi design tokens ke variables.css
fix: perbaiki ukuran bottom-nav agar muat tanpa scroll di mobile
docs: tambahkan panduan kustomisasi tema ke README
```

---

## Lisensi

Proyek ini dikembangkan sebagai bagian dari program Web Development Internship bersama mitra industri UD. Rez Wan Jaya. Seluruh kode bersifat internal/proprietary dan tidak dipublikasikan untuk distribusi ulang tanpa izin tertulis dari pemilik proyek.