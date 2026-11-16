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
6. [Sistem Anotasi Kode dan Marker Comments](#sistem-anotasi-kode-dan-marker-comments)
7. [Cara Menjalankan Proyek](#cara-menjalankan-proyek)
8. [Panduan Kustomisasi Konten](#panduan-kustomisasi-konten)
9. [Panduan Kustomisasi Tema Visual](#panduan-kustomisasi-tema-visual)
10. [Integrasi Buku Tamu (Google Apps Script)](#integrasi-buku-tamu-google-apps-script)
11. [Dukungan Browser dan Aksesibilitas](#dukungan-browser-dan-aksesibilitas)
12. [Pengujian Sistem (UAT dan Cross-Browser Testing)](#pengujian-sistem-uat-dan-cross-browser-testing)
13. [Deployment ke Produksi](#deployment-ke-produksi)
14. [Individual Bug Fixing Log](#individual-bug-fixing-log)
15. [Konvensi Commit](#konvensi-commit)
16. [Lisensi](#lisensi)

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

## Sistem Anotasi Kode dan Marker Comments

Sejak Minggu ke-12, seluruh berkas sumber (`index.html`, `variables.css`, `style.css`, `config.js`, `script.js`) dilengkapi **komentar penanda batas (marker comments)** yang membagi kode menjadi dua zona secara eksplisit: area yang aman diubah oleh staf non-teknis, dan area inti sistem yang hanya boleh diubah oleh developer. Tujuannya adalah memungkinkan serah terima operasional ke admin UD. Rez Wan Jaya tanpa risiko regresi tata letak.

### Status Legend

| Status | Arti | Siapa yang boleh mengedit |
|---|---|---|
| `STATUS: SAFE TO EDIT` | Nilai/teks di dalam blok ini aman diubah mengikuti petunjuk yang menyertainya | Admin/staf non-teknis, lewat `config.js` atau `variables.css` |
| `STATUS: DO NOT EDIT` | Blok struktural/logika inti — mengubahnya berisiko merusak fungsionalitas atau tata letak situs | Developer saja, dengan pengawasan |

### Penerapan per Berkas

| Berkas | Status Dominan | Keterangan |
|---|---|---|
| `js/config.js` | `SAFE TO EDIT` | Satu-satunya tempat admin mengubah data pernikahan. Setiap domain data (`couple`, `events`, `gallery`, dst.) ditandai `DATA BOUNDARY: ... — STATUS: SAFE TO EDIT`. |
| `css/variables.css` | `SAFE TO EDIT` | Token warna, tipografi, radius, spasi. Ubah nilai token untuk kustomisasi tema instan. |
| `index.html` | `SAFE TO EDIT` (teks/media via `data-config-*`) dengan struktur tag berstatus `DO NOT EDIT` | Setiap section dibungkus `TEMPLATE TAGGING BOUNDARY MARKER` beserta baris `STATUS` dan `PETUNJUK`. Dua `<script>` inti di akhir `<body>` dikunci dalam blok `CORE SYSTEM`. |
| `css/style.css` | `DO NOT EDIT` | Seluruh 28 blok `BOUNDARY: ...` (reset, layout primitives, komponen, responsive) ditandai `STATUS: DO NOT EDIT`. Perubahan tema dilakukan lewat `variables.css`, bukan berkas ini. |
| `js/script.js` | `DO NOT EDIT` | Mesin injeksi (`hydrateConfig`) dan seluruh 12 modul UI (slider, lightbox, audio, guestbook, dsb.) ditandai `STATUS: DO NOT EDIT`. Logika ini terproteksi penuh agar fungsionalitas situs terjaga. |

### Contoh Penanda di `index.html`

```html
<!-- ============================================ -->
<!-- TEMPLATE TAGGING BOUNDARY MARKER: HERO SECTION -->
<!-- STATUS: SAFE TO EDIT (via js/config.js) -->
<!-- PETUNJUK: Ubah TEKS/MEDIA bagian ini HANYA lewat js/config.js. JANGAN
     menghapus/mengubah tag HTML, atribut class, id, atau data-config-* di bawah ini. -->
<!-- AREA INI MENGGUNAKAN DYNAMIC INJECTION CONFIG -->
...
<!-- ============================================ -->
<!-- END TEMPLATE TAGGING BOUNDARY MARKER: HERO SECTION -->
<!-- ============================================ -->
```

### Contoh Penanda di `style.css`

```css
/* ==============================================================================
   BOUNDARY: SECTION: HERO — STATUS: DO NOT EDIT
   ============================================================================== */
```

### Contoh Penanda di `config.js`

```js
// DATA BOUNDARY: couple — data mempelai (section #couple, #hero, curtain, closing) — STATUS: SAFE TO EDIT
couple: {
  groom: { name: 'Nama Lengkap Pria', ... },
  bride: { name: 'Nama Lengkap Wanita', ... },
},
// END DATA BOUNDARY: couple
```

### Ekstensi Editor yang Direkomendasikan

- **Prettier - Code Formatter** — merapikan indentasi secara otomatis saat berkas disimpan, menjaga konsistensi format di seluruh tim.
- **Comment Anchors / TODO Highlight** — memberi pewarnaan kontras pada penanda komentar seperti `STATUS: SAFE TO EDIT`, `STATUS: DO NOT EDIT`, `TODO`, `FIXME`, dan `NOTE`, sehingga batas zona terlihat jelas langsung dari editor.

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

## Pengujian Sistem (UAT dan Cross-Browser Testing)

Sesuai standar dokumentasi internship Minggu ke-7 dan ke-13, situs ini diuji dengan **User Acceptance Testing (UAT)** terhadap 8 skenario interaksi inti, serta **pengujian lintas peramban/perangkat** untuk memastikan tampilan dan fungsi konsisten.

### Lembar Pengujian UAT (UAT Testing Sheet)

| ID Uji | Komponen Fitur | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| UAT-01 | Tirai Pembuka (Cover Overlay) | Klik tombol "Buka Undangan" | Tirai menghilang dengan animasi fade/scale, musik latar gamelan mulai terputar mengikuti klik pengguna (user gesture), scroll halaman utama terbuka | PASS |
| UAT-02 | Template Injection Engine | Mengubah nilai teks pada `js/config.js` (mis. nama mempelai) | Seluruh elemen bersintaks `data-config-*` yang terkait memperbarui diri secara otomatis saat halaman dimuat ulang, tanpa merusak tata letak | PASS |
| UAT-03 | Navigasi Peta | Klik tautan "Buka di Google Maps" pada section Lokasi | Membuka Google Maps pada tab baru (`target="_blank"`, `rel="noopener noreferrer"`) tepat ke koordinat lokasi acara | PASS |
| UAT-04 | Simpan ke Kalender | Klik tombol "+ Simpan ke Google Calendar" | Membuka Google Calendar dengan judul, detail acara, lokasi, dan zona waktu (`Asia/Jakarta` via parameter `ctz`) terisi otomatis dan akurat | PASS |
| UAT-05 | Galeri & Lightbox | Klik salah satu foto pada galeri | Foto terbuka dalam modal layar penuh; navigasi kibor `ArrowLeft`/`ArrowRight`/`Escape` berfungsi mulus | PASS |
| UAT-06 | Buku Tamu (Guestbook) | Mengirim ucapan berisi teks biasa maupun karakter HTML (mis. `<b>test</b>`) | Ucapan tersimpan dan tampil sebagai teks polos apa adanya (ter-escape), tidak dieksekusi sebagai markup/skrip | PASS |
| UAT-07 | Amplop Digital | Klik tombol "Salin No. Rekening" | Nomor rekening tersalin ke clipboard, tombol menampilkan umpan balik visual "Tersalin!" sementara, lalu kembali ke label semula | PASS |
| UAT-08 | Audio Latar (Gending Jawa) | Memencet ikon kontrol audio mengambang setelah tirai terbuka | Audio dapat di-*pause*/*resume* manual; tidak ada error autoplay-policy di console karena pemutaran pertama selalu dipicu klik pengguna | PASS |

**Target pengujian:** 8/8 skenario berstatus **PASS**, 0 critical bug, 0 console error.

### Strategi Cross-Browser dan Cross-Device Testing

| Target | Viewport/Lingkup | Poin Verifikasi |
|---|---|---|
| iOS Safari | Mobile, 390×844px | Tinggi dinamis (`100dvh`) pada tirai pembuka agar tombol tidak tertutup bilah navigasi Safari; pemutaran audio latar terpicu mulus dari gestur pengguna; efek blur kaca (`backdrop-filter`) tampil dengan benar |
| Android Chrome | Mobile, 360×740px | Nol *horizontal overflow*; animasi scroll-reveal dan slider galeri stabil |
| Desktop Browsers | Chrome, Firefox, Edge, ≥1440px | Perataan tengah kontainer utama (`--content-max`); proporsi grid galeri; efek hover pada kartu dan tombol |

### Production Readiness Checklist

- [x] Sertifikat SSL/TLS aktif dan *Force HTTPS* berjalan di lingkungan produksi.
- [x] Nol *console error* saat seluruh interaksi UAT-01 s.d. UAT-08 dijalankan.
- [x] Nol *broken link* pada tautan sosial media, peta, dan sumber gambar/audio.
- [x] Nol pergeseran tata letak (*Cumulative Layout Shift*) berkat `aspect-ratio` pada seluruh gambar galeri, foto kisah cinta, dan video.
- [x] Konten dapat diperbarui admin melalui `config.js` tanpa menyentuh kode inti.

---

## Deployment ke Produksi

Situs ini adalah aplikasi statis (tanpa backend/build step) sehingga dapat di-*deploy* melalui salah satu opsi berikut.

### Opsi 1 — GitHub Pages (Gratis)

1. Pastikan repositori lokal sudah ter-*push* ke remote GitHub pada branch `main`.
2. Buka menu **Settings → Pages** pada repositori GitHub.
3. Pada **Build and deployment**, pilih **Source: Deploy from a branch**, lalu **Branch: main**, direktori **/ (root)**.
4. Tunggu proses **GitHub Actions** selesai (umumnya 1–2 menit) hingga tautan produksi terbit.
5. Centang opsi **Enforce HTTPS** agar seluruh lalu lintas data terenkripsi.

### Opsi 2 — Hostinger (Shared Hosting & cPanel/hPanel)

1. Masuk ke panel kontrol Hostinger (**hPanel**), buka menu **File Manager** pada domain target.
2. Arahkan ke direktori publik `public_html/`.
3. Unggah seluruh berkas proyek (`index.html`, folder `css/`, `js/`, `assets/`, dan dokumentasi `.md`).
4. Masuk ke menu **SSL**, pasang sertifikat **Let's Encrypt SSL/TLS** (gratis).
5. Aktifkan **Force HTTPS Redirect** agar privasi data tamu (ucapan buku tamu, dsb.) terlindungi.

### Catatan Keamanan Pasca-Deploy

Sertifikat SSL/TLS bukan hanya syarat teknis, tapi juga faktor kepercayaan tamu undangan saat mengisi buku ucapan atau menyalin data rekening amplop digital — koneksi HTTPS memastikan data tersebut tidak dapat disadap di jaringan publik.

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

### Bug #3 — Konsistensi Sintaks Marker Comments Lintas Berkas dan Penyelarasan Format Prettier

Kategori: Code Annotation / Developer Experience / Code Formatting

Deskripsi masalah: HTML, CSS, dan JavaScript masing-masing memiliki sintaks komentar yang berbeda (`<!-- -->`, `/* */`, `//`), sementara standar penandaan Minggu ke-12 menuntut label `STATUS: SAFE TO EDIT` / `STATUS: DO NOT EDIT` yang konsisten di ketiganya. Penulisan manual satu per satu berisiko tinggi menghasilkan label yang tidak seragam (salah ketik, posisi berbeda-beda), terutama karena `style.css` memiliki 28 blok `BOUNDARY`, `script.js` memiliki 13 blok `MODULE BOUNDARY`, dan `index.html` memiliki 17 blok `TEMPLATE TAGGING BOUNDARY MARKER`. Risiko lain adalah bentrok dengan indentasi otomatis **Prettier** yang dapat merapikan ulang baris komentar panjang menjadi tidak konsisten.

Analisis: Pendekatan edit manual pada 5 berkas sumber (hampir 5.300 baris kode gabungan) tidak andal untuk menjamin label seragam dan posisi penempatan yang konsisten tepat setelah baris boundary pembuka (bukan baris penutup `END ...`).

Solusi: Menulis skrip pencocokan pola (regex) khusus untuk tiap gaya sintaks komentar — pola `// (MODULE BOUNDARY|TEMPLATE INJECTION ENGINE BOUNDARY):` untuk `script.js`, pola `// DATA BOUNDARY:` untuk `config.js`, dan pola baris berindentasi 3 spasi `BOUNDARY:` untuk `style.css` — yang masing-masing secara eksplisit mengecualikan baris berawalan `END` agar label `STATUS` hanya disisipkan tepat setelah baris boundary pembuka. Untuk `index.html`, status dan petunjuk disisipkan sebagai baris baru persis setelah baris `TEMPLATE TAGGING BOUNDARY MARKER` menggunakan regex yang mempertahankan indentasi asli serta akhiran baris `\r\n` (CRLF) milik berkas, sehingga tidak mengganggu format yang sudah dirapikan Prettier. Setiap hasil divalidasi otomatis: `node --check` untuk sintaks JavaScript, penghitungan kurung kurawal untuk CSS, dan parser HTML (`html.parser`) untuk memastikan seluruh tag tetap seimbang setelah penyisipan komentar.

Status: Selesai — 17 marker di `index.html`, 28 marker di `style.css`, 13 marker di `script.js`, dan 17 marker di `config.js` (termasuk `site` dan `guestbookApiUrl`) berhasil diberi label `STATUS` secara seragam tanpa satu pun kesalahan sintaks.

### Bug #4 — Audit Proaktif: Verifikasi Dua Kerentanan Umum (Viewport iOS & XSS Guestbook)

Kategori: Pengujian Sistem (UAT) / Keamanan / Regresi

Deskripsi: Modul Minggu 7 dan Minggu 13 mendokumentasikan dua studi kasus bug yang umum terjadi pada undangan digital: (1) tombol pada tirai pembuka terpotong bilah navigasi dinamis iOS Safari akibat satuan `100vh`, dan (2) kerentanan XSS pada feed buku ucapan akibat `innerHTML` yang diisi data mentah tanpa sanitasi.

Analisis: Sebelum menulis perbaikan baru, dilakukan audit kode untuk memastikan kedua pola bug tersebut belum/tidak ada di basis kode saat ini, bukan mengasumsikan bug tersebut otomatis berlaku.

Temuan audit:
- `.curtain` pada `style.css` sudah dibungkus `@supports (height: 100dvh) { .curtain { height: 100dvh; bottom: auto; } }` sejak sebelumnya, sehingga tirai pembuka (termasuk tombol "Buka Undangan") sudah menyesuaikan tinggi area pandang dinamis Safari dengan benar.
- Fungsi `renderGuestbookEntries()` pada `script.js` sudah membungkus seluruh nilai dinamis (`name`, `message`, `attendance`, dll.) dengan `escapeHtml()` sebelum disuntikkan lewat `innerHTML`, sehingga tag HTML/skrip pada ucapan tamu akan tampil sebagai teks polos, bukan dieksekusi.

Status: Terverifikasi aman — kedua pola bug tersebut sudah tertangani oleh implementasi sebelumnya. Tidak ada perubahan kode yang diperlukan untuk kasus ini; dicatat di sini sebagai bukti pengujian regresi (UAT-01 dan UAT-06) agar tidak diperbaiki ulang secara keliru di kemudian hari.

### Bug #5 — `backdrop-filter` Tidak Tampil di Safari/iOS (Vendor Prefix Hilang)

Kategori: Cross-Browser Compatibility

Deskripsi masalah: Audit lintas peramban pada Minggu ke-13 menemukan 6 dari 7 penggunaan properti `backdrop-filter` (efek kaca buram pada `.guest-pill`, `.audio-controller__btn`, tombol lightbox, overlay lightbox, dan navigasi galeri) tidak memiliki pasangan properti `-webkit-backdrop-filter`. Properti standar `backdrop-filter` memerlukan prefix `-webkit-` agar dirender oleh WebKit (Safari desktop maupun iOS Safari); tanpa prefix tersebut, efek blur kaca sama sekali tidak tampil di Safari — elemen tetap berfungsi, tapi tampil tanpa efek visual yang dimaksud (regresi tampilan, bukan regresi fungsi).

Analisis: Properti `-webkit-backdrop-filter` dan `backdrop-filter` adalah dua deklarasi CSS terpisah (bukan alias), sehingga keduanya wajib dituliskan berpasangan di setiap aturan yang memakai efek blur tersebut, termasuk pada deklarasi `backdrop-filter: none;` yang menonaktifkan efek tersebut secara kondisional di breakpoint tertentu (jika hanya salah satu yang dinonaktifkan, Safari akan tetap menampilkan blur yang seharusnya sudah dimatikan).

Solusi: Menulis skrip yang memindai setiap baris `backdrop-filter:` di `style.css`, lalu menyisipkan baris `-webkit-backdrop-filter:` dengan nilai yang identik tepat sebelumnya — kecuali pada pasangan yang sudah benar agar tidak terjadi duplikasi. Hasil awal sempat menghasilkan satu duplikasi (karena satu pasangan di kode asli ditulis dengan urutan terbalik — baris tanpa prefix lebih dulu, baris berprefix setelahnya), yang kemudian dikoreksi manual sehingga setiap aturan hanya memiliki tepat satu pasang `-webkit-backdrop-filter` + `backdrop-filter`.

Status: Selesai — 7 pasangan deklarasi (termasuk 2 deklarasi `backdrop-filter: none;` pada breakpoint navigasi galeri) kini konsisten memiliki prefix `-webkit-`. Divalidasi dengan penghitungan kurung kurawal CSS sebelum/sesudah (identik, 773/773) untuk memastikan tidak ada struktur ruleset yang rusak.

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
| `test:` | Penyusunan/eksekusi skenario pengujian (UAT, cross-browser) |

Contoh:

```
refactor: sentralisasi design tokens ke variables.css
fix: perbaiki ukuran bottom-nav agar muat tanpa scroll di mobile
fix: tambahkan prefix -webkit-backdrop-filter untuk kompatibilitas Safari
docs: tambahkan panduan kustomisasi tema ke README
test: eksekusi lembar pengujian UAT-01 sampai UAT-08
```

---

## Lisensi

Proyek ini dikembangkan sebagai bagian dari program Web Development Internship bersama mitra industri UD. Rez Wan Jaya. Seluruh kode bersifat internal/proprietary dan tidak dipublikasikan untuk distribusi ulang tanpa izin tertulis dari pemilik proyek.