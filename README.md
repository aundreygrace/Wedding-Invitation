# Undangan Pernikahan Digital — Arya & Sekar

Undangan pernikahan digital bertema **Royal Javanese Elegance**, hasil refactor dari prototype Google Stitch (`code.html`) ke dalam struktur project standar (HTML/CSS/JS terpisah) untuk kebutuhan internship.

> Desain visual, layout, animasi, dan interaksi **dipertahankan sepenuhnya** dari hasil prototype Stitch. Refactor ini hanya mengubah struktur file/project, bukan desain.

## Struktur Project

```
wedding-invitation/
├── index.html              # Satu halaman, single-page continuous scrolling
├── css/
│   └── style.css           # Satu file CSS utama (design tokens, semua section)
├── js/
│   └── script.js           # Satu file JS utama (semua logic, vanilla ES6+)
├── assets/
│   ├── images/             # Foto pasangan, galeri, peta (lihat catatan di bawah)
│   ├── ornaments/          # 10 aset ornamen Jawa (wayang, gunungan, pendopo, dll)
│   ├── audio/               # File musik gamelan (belum disertakan)
│   └── video/                # File video teaser (belum disertakan)
├── README.md
└── .gitignore
```

## Cara Menjalankan

Project ini murni statis (tanpa build step, tanpa framework). Cukup buka `index.html` langsung di browser, atau jalankan local server sederhana, misalnya:

```bash
# Python
python3 -m http.server 8080

# atau Node
npx serve .
```

Lalu buka `http://localhost:8080`.

### Parameter Nama Tamu

Nama tamu di layar pembuka dapat dipersonalisasi lewat query string:

```
index.html?to=Bapak+Danang+Wisesa
```

## Catatan Asset

- **10 aset ornamen** (`assets/ornaments/`) — wayang kiri/kanan, gunungan, pendopo, awan, ornamen sudut, ornamen border, melati, dan frame dekoratif — sudah terpasang lokal dan dipakai di seluruh section.
- **Foto pasangan, galeri prewedding, peta lokasi, poster video** — pada prototype Stitch masih berupa URL eksternal (`lh3.googleusercontent.com`, hasil AI generatif Stitch). File-file ini **belum tersedia secara lokal** dan perlu diganti dengan foto asli sebelum production. Lihat daftar lengkap di bagian "Asset yang masih membutuhkan file lokal" pada ringkasan refactor.
- **Audio gending** (`assets/audio/ladrang-wilujeng.mp3`) dan **video teaser** (`assets/video/wedding-teaser.mp4`) direferensikan di kode tapi filenya belum disertakan — tinggal taruh file dengan nama yang sama di folder terkait agar otomatis terpakai.

## Fitur yang Dipertahankan

- Opening curtain theatrical dengan animasi wayang & gunungan
- Scroll reveal (IntersectionObserver) di seluruh section
- Live countdown menuju tanggal pernikahan
- Form RSVP dengan validasi dasar + guestbook real-time (client-side only)
- Lightbox galeri foto
- Copy-to-clipboard nomor rekening & alamat kado dengan toast notification
- Floating audio controller (gamelan)
- Video teaser player
- Fully responsive: mobile, tablet, desktop (tanpa zoom hack, tanpa horizontal scroll)

## Teknologi

- HTML5 semantic
- CSS3 murni (custom properties / design tokens, flexbox, grid) — tanpa Tailwind/framework
- Vanilla JavaScript ES6+ — tanpa framework/library
- Google Fonts: Playfair Display, Plus Jakarta Sans, Material Symbols Outlined
