# Digital Wedding Invitation — Pawiwahan Ageng Arya & Sekar

Undangan pernikahan digital satu halaman bergaya Jawa modern.
Dibuat dengan Semantic HTML5, CSS3, dan Vanilla JavaScript (tanpa framework, tanpa build system).

> Status: **Phase 1 — struktur & konten statis.** Animasi dan fitur interaktif dikerjakan di phase berikutnya.

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Struktur

```
wedding-invitation/
├── index.html      # struktur semantik + 16 section
├── style.css       # semua styling
├── script.js       # semua perilaku
├── config.js       # data pernikahan (edit di sini)
└── assets/
    ├── images/     # foto mempelai, galeri, poster video (belum ada)
    ├── ornaments/  # aset budaya Jawa (WebP)
    ├── audio/      # musik latar (belum ada)
    └── video/      # video (belum ada)
```

`config.js` dimuat sebagai script biasa (bukan ES module) sebelum `script.js`, sehingga
website tetap berjalan lewat `file://`.

## Mengedit data

Ubah `config.js`. Nilai `""` atau `"TODO"` berarti data belum tersedia.

## Pemetaan aset (`assets/ornaments/`)

| File | Dipakai di |
|---|---|
| `wayang-left.webp` | Opening — tirai kiri |
| `wayang-right.webp` | Opening — tirai kanan |
| `gunungan.webp` | Opening — center stage |
| `cloud-back.webp` | Opening (belakang), Hero |
| `cloud-front.webp` | Opening (depan) |
| `pendopo.webp` | Hero |
| `jasmine.webp` | Pembuka (intro), Closing |
| `ornament-border.webp` | Quote |
| `decorative-frame.webp` | Closing |
| `ornament-corner.webp` | Sudut/frame section (Phase 2+) |

Semua aset dekoratif memakai `alt=""` + `aria-hidden="true"`.

## Konten yang masih TODO

- Teks section (pembuka, kutipan, pengantar hadiah, penutup) — belum ada di `design.md`.
- Foto mempelai, galeri, poster video, musik.
- Waktu acara, URL Google Maps/Waze, URL streaming, Instagram.
- Tanggal contoh di `design.md` (28 Oktober 2024) sudah lewat — ganti sebelum dipakai.
