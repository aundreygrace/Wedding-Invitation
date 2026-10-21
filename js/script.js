
/* ==========================================================================
   PANDUAN 
   ==========================================================================
   File ini dibungkus dalam SATU IIFE (Immediately Invoked Function
   Expression) `(function () { 'use strict'; ... })();` di baris paling
   bawah. Tujuannya: semua variabel & fungsi di dalam file ini bersifat
   PRIVATE terhadap global scope (window) — mencegah polusi/konflik nama
   dengan script pihak ketiga (Google Maps embed, dsb). Jika Anda perlu
   mengakses sesuatu dari file ini di luar (misalnya dari console browser
   untuk debugging), Anda harus sengaja meng-expose-nya, mis.
   `window.weddingData = weddingData;` di dalam IIFE.

   STRUKTUR FILE (urutan top-to-bottom, lihat juga penanda "===" di bawah):
     1. WEDDING DATA        -> satu objek `weddingData` = SUMBER KEBENARAN
                                TUNGGAL untuk semua teks/tanggal dinamis
                                (nama mempelai, jadwal, pesan doa, dsb).
                                UBAH DI SINI, bukan hardcode di HTML, setiap
                                kali memakai ulang template ini untuk
                                pasangan lain.
     2. DOM REFERENCES      -> objek `dom` = cache semua elemen HTML yang
                                dibutuhkan, diambil SEKALI di awal (hindari
                                document.getElementById berulang-ulang).
     3. UTILITIES           -> fungsi generik dipakai ulang lintas fitur
                                (pad2, showToast, copyToClipboard, dst.)
     4. OPENING INVITATION  -> logika sampul pembuka (curtain) + nama tamu
     5. SCROLL REVEAL       -> IntersectionObserver untuk animasi scroll
     6. COUNTDOWN           -> hitung mundur real-time 3 fase (before/doa/thanks)
     7. EVENT & CALENDAR    -> tombol "Simpan ke Kalender" (Google Calendar)
     8. MAPS                -> (tidak ada JS aktif — peta murni <iframe> statis)
     9. GALLERY & LIGHTBOX  -> modal foto galeri
     10. VIDEO & STREAMING  -> player teaser custom
     11. AUDIO              -> kontrol musik gamelan latar
     12. DIGITAL GIFT       -> tombol salin nomor rekening/alamat
     13. RSVP               -> submit form konfirmasi kehadiran
     14. WISHES             -> render kartu ucapan/buku tamu
     15. INITIALIZATION     -> fungsi init() yang memanggil semua initXxx(),
                                dijalankan saat event 'DOMContentLoaded'

   POLA PENAMAAN FUNGSI YANG DIPAKAI KONSISTEN DI FILE INI:
     - `initXxx()`  : fungsi "pemasang" yang dipanggil SEKALI saat halaman
                      dimuat untuk mendaftarkan event listener terkait fitur
                      Xxx (pola "wire up"). Dipanggil dari init() di bagian 15.
     - `showXxx()` / `updateXxx()` : fungsi yang BOLEH dipanggil berkali-kali
                      untuk mengubah tampilan/DOM sesuai state terbaru.
     - Semua akses ke elemen DOM SELALU dicek `if (!dom.xxx) return;` di awal
       fungsi — ini membuat setiap fitur FAIL-SAFE: jika sebuah section di
       index.html sedang di-comment/dinonaktifkan (seperti Gallery, Video,
       Gift, RSVP, Wishes saat ini), fungsi initGallery()/initVideoTeaser()
       dkk akan diam-diam tidak melakukan apa-apa alih-alih melempar error,
       sehingga TIDAK merusak fitur lain yang masih aktif. Pola ini WAJIB
       dipertahankan setiap kali menambah fitur baru.

   CARA MENGAKTIFKAN KEMBALI SECTION YANG DI-COMMENT DI index.html:
     1. Hapus tag komentar HTML <!-- ... --> yang membungkus section terkait
        (Quote, Streaming, Gallery, Video, Gift, RSVP, Wishes) di index.html.
     2. Tidak perlu mengubah script.js — fungsi initXxx() terkait SUDAH
        dipanggil di init() dan akan otomatis bekerja begitu elemen DOM-nya
        tersedia saat halaman dimuat ulang.
     3. Untuk Gift/Streaming: uncomment juga data `streaming`/`gift` yang
        saat ini di-comment di dalam objek `weddingData` di bagian 1 file ini.
   ========================================================================== */


   (function () {
    'use strict';
  
    // ==========================================================================
    // 1. WEDDING DATA
    // --------------------------------------------------------------------------
    // Objek data terpusat (single source of truth). Semua fungsi lain di
    // file ini (countdown, kalender, dsb.) MEMBACA dari objek ini, bukan
    // dari teks statis di HTML, supaya tanggal/nama hanya perlu diubah di
    // SATU tempat saat template ini dipakai ulang untuk pasangan lain.
    // CATATAN: field `weddingData.events`, `weddingData.location`, dsb. di
    // bawah ini MASIH TERSEDIA tapi belum semuanya dikonsumsi oleh fungsi JS
    // (sebagian hanya sebagai referensi/duplikat dari teks di HTML) —
    // kecuali `weddingData.location` yang DIPAKAI oleh initAddToCalendar()
    // untuk membangun deskripsi & link peta event Google Calendar.
    // ==========================================================================
    const weddingData = {
      // couple.groom/bride: data referensi nama & akun Instagram mempelai.
      // CATATAN: field ini SAAT INI TIDAK dibaca otomatis oleh fungsi JS
      // manapun — teks nama di curtain/#couple section di-hardcode
      // langsung di index.html. Objek ini disediakan sebagai referensi
      // terpusat untuk pengembangan lanjutan (mis. jika nanti ingin
      // merender nama secara dinamis dari sini).
      couple: {
        groom: { name: 'Arya Wicaksana', instagram: '@aryawicaksana' }, // mempelai pria
        bride: { name: 'Sekar Arum', instagram: '@sekararum' },         // mempelai wanita
      },
      date: {
        // targetISO = waktu MULAI Ijab Qabul/Akad (fase countdown "before"
        // berakhir di sini). Format ISO 8601 DENGAN offset zona waktu
        // eksplisit (+07:00 = WIB) — ini PENTING: dengan offset eksplisit,
        // Date.parse()/`new Date(...)` akan menghasilkan timestamp epoch
        // yang BENAR secara absolut, sehingga perbandingan waktu di
        // updateCountdown() tetap akurat untuk tamu yang membuka undangan
        // dari zona waktu manapun di dunia (bukan hanya WIB).
        targetISO: '2026-12-24T08:00:00+07:00',
        // thankYouISO = waktu acara resepsi dianggap SELESAI. Antara
        // targetISO dan thankYouISO, countdown menampilkan pesan doa
        // pernikahan (messages.doa) alih-alih angka hitung mundur. Setelah
        // thankYouISO, tampil pesan terima kasih (messages.thanks) secara
        // PERMANEN (lihat initCountdown() — interval dihentikan di fase ini).
        thankYouISO: '2026-12-24T14:00:00+07:00',
        // displayLabel = teks tanggal yang ditampilkan statis di beberapa
        // tempat di HTML (saat ini TIDAK dibaca otomatis oleh JS — jika
        // Anda mengubah targetISO, ingat untuk juga mengubah teks tanggal
        // yang di-hardcode di index.html, mis. pada .date-pill dan
        // .event-card__meta-row, agar konsisten).
        displayLabel: 'Kamis, 24 Desember 2026',
      },
      // messages.doa  -> ditampilkan oleh showCountdownMessage() pada fase
      //                  "doa" (antara targetISO & thankYouISO).
      // messages.thanks -> ditampilkan pada fase "thanks" (>= thankYouISO),
      //                  bersifat permanen untuk sisa sesi halaman.
      messages: {
        doa: 'Bismillahirrahmanirrahim. Semoga Allah SWT melimpahkan keberkahan dalam ikatan suci Arya dan Sekar, menjadikan rumah tangga yang sakinah, mawaddah, warahmah, serta senantiasa dipenuhi cinta, kesabaran, dan kebahagiaan.',
        thanks: 'Terima kasih atas doa, restu, dan kebahagiaan yang telah Anda bagikan kepada Arya dan Sekar. Semoga kebaikan senantiasa menyertai kita semua.',
      },
      // events.akad/resepsi: REFERENSI jadwal dua acara. Field ini TIDAK
      // dikonsumsi langsung oleh initAddToCalendar() (fungsi itu memakai
      // variabel `start`/`end`/`detailsText` yang DI-HARDCODE TERPISAH di
      // dalam dirinya sendiri — lihat bagian 7 EVENT & CALENDAR). Objek
      // ini sebaiknya dijadikan SATU-SATUNYA sumber jika Anda ingin
      // merefactor initAddToCalendar() agar tidak duplikasi data.
      events: {
        akad: {
          time: '08.00 - 10.00 WIB',
          date: 'Kamis, 24 Desember 2026',
          venue: 'The Sunan Hotel Solo',
          address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
        },
        resepsi: {
          time: '11.00 - 14.00 WIB',
          date: 'Kamis, 24 Desember 2026',
          venue: 'The Sunan Hotel Solo',
          address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
        },
      },
      // location: SATU-SATUNYA bagian weddingData yang BENAR-BENAR dibaca
      // langsung oleh fungsi aktif (initAddToCalendar() -> location & mapUrl
      // event Google Calendar). Ubah name/address di sini jika venue berubah.
      location: {
        name: 'The Sunan Hotel Solo',
        address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Sunan%20Hotel%20Solo%2C%20Jl.%20A.%20Yani%20No.40%2C%20Kerten%2C%20Laweyan%2C%20Surakarta%2C%20Jawa%20Tengah', // dipakai jika ingin link "cari di Maps" terpisah dari link embed <iframe>
      },
      // streaming & gift DI-COMMENT (non-aktif) karena section HTML terkait
      // (Streaming, Gift) juga sedang dinonaktifkan di index.html.
      // UNTUK MENGAKTIFKAN: hapus /* */ di bawah ini BERSAMAAN dengan
      // membuka komentar section #streaming / #gift di index.html, lalu:
      //  - streaming.url  -> isi href tombol "Tonton Siaran" secara manual
      //    di HTML (atau tambahkan kode JS untuk mengisinya otomatis).
      //  - gift.banks[]   -> tiap entry berkorespondensi 1 <article
      //    class="bank-card"> di HTML; field `account` (tanpa spasi) harus
      //    cocok dengan atribut data-copy-value tombol salin terkait.
      /*streaming: {
        url: 'https://youtube.com',
      },
      gift: {
        banks: [
          { bank: 'BANK BCA', account: '8830529144', display: '8830 5291 44', holder: 'Arya Wicaksana' },
          { bank: 'BANK MANDIRI', account: '1380094827110', display: '138 00 9482711 0', holder: 'Sekar Arum' },
        ],
        address: 'Kediaman Arya & Sekar, Jl. Slamet Riyadi No. 240, Laweyan, Surakarta, Jawa Tengah (57141)',
      },*/
    };
  
    // ==========================================================================
    // 2. DOM REFERENCES
    // --------------------------------------------------------------------------
    // Cache SEMUA elemen DOM yang dibutuhkan skrip, diambil SATU KALI saat
    // IIFE dieksekusi (yaitu sesaat sebelum DOMContentLoaded — <script> ada
    // di akhir <body> sehingga seluruh markup sudah ter-parse). Pola ini:
    //   (a) menghindari pemanggilan document.getElementById berulang-ulang
    //       di setiap fungsi (lebih cepat & lebih mudah dibaca),
    //   (b) membuat JELAS ketergantungan skrip ini terhadap ID-ID tertentu
    //       di index.html — jika Anda mengubah/menghapus sebuah id="..." di
    //       HTML, cari ID yang sama di objek `dom` berikut untuk tahu fitur
    //       JS mana yang akan terdampak.
    // CATATAN: banyak dari properti ini akan bernilai `null` jika section
    // terkait sedang di-comment di index.html (mis. dom.rsvpForm,
    // dom.wishesContainer, dom.videoPlayer saat ini). Ini DISENGAJA dan
    // ditangani oleh guard clause `if (!dom.xxx) return;` di setiap fungsi
    // initXxx() terkait — lihat catatan pola di header file.
    // ==========================================================================
    const dom = {
      body: document.body, // dipakai initOpeningCurtain() -> tambah class 'is-unlocked'; init() -> cek class saat load

      // --- grup: Opening Curtain (lihat bagian 4) ---
      curtain: document.getElementById('theatrical-curtain'),             // container overlay utuh
      btnOpen: document.getElementById('btn-open-invitation'),            // tombol "Buka Undangan"
      wayangLeft: document.getElementById('curtain-wayang-left'),         // figur wayang kiri (dianimasikan keluar layar)
      wayangRight: document.getElementById('curtain-wayang-right'),       // figur wayang kanan (dianimasikan keluar layar)
      curtainContent: document.getElementById('curtain-center-content'),  // blok judul+tombol di tengah curtain
      guestNameEl: document.getElementById('invitation-guest-name'),      // diisi initGuestName() dari parameter URL

      // --- grup: Audio Controller (lihat bagian 11) ---
      audioBtn: document.getElementById('audio-controller-btn'),  // tombol toggle play/pause
      audioEl: document.getElementById('gamelan-audio'),          // elemen <audio> asli (null jika tag masih di-comment di HTML)

      // --- grup: Toast Notification (lihat bagian 3 showToast) ---
      toast: document.getElementById('toast-notification'),   // container toast (class is-visible di-toggle)
      toastMessage: document.getElementById('toast-message'), // <span> isi pesan toast

      // --- grup: Countdown (lihat bagian 6) ---
      countdownTimer: document.getElementById('countdown-timer'),     // grid 4 kotak angka (role="timer")
      countdownMessage: document.getElementById('countdown-message'),  // <p> pesan doa/terima kasih (fase doa/thanks)
      timerDays: document.getElementById('timer-days'),       // angka "Hari"
      timerHours: document.getElementById('timer-hours'),     // angka "Jam"
      timerMinutes: document.getElementById('timer-minutes'), // angka "Menit"
      timerSeconds: document.getElementById('timer-seconds'), // angka "Detik"
      btnAddCalendar: document.getElementById('btn-add-calendar'), // tombol "Simpan ke Kalender" (lihat bagian 7)

      // --- grup: Gallery & Lightbox (lihat bagian 9; null jika section Gallery di-comment) ---
      lightbox: document.getElementById('gallery-lightbox'),    // modal overlay foto penuh
      lightboxImg: document.getElementById('lightbox-img'),     // <img> di dalam modal, src diisi dinamis
      lightboxClose: document.getElementById('lightbox-close'), // tombol tutup modal

      // --- grup: Video Teaser (lihat bagian 10; null jika section Video di-comment) ---
      videoPlayer: document.getElementById('video-player'),    // container poster+video
      btnPlayVideo: document.getElementById('btn-play-video'), // tombol play overlay poster
      teaserVideo: document.getElementById('teaser-video'),    // elemen <video> asli, awalnya hidden

      // --- grup: RSVP & Wishes (lihat bagian 13-14; null jika section RSVP/Wishes di-comment) ---
      rsvpForm: document.getElementById('rsvp-form'),               // <form> konfirmasi kehadiran
      wishesContainer: document.getElementById('wishes-container'), // tempat kartu ucapan baru di-prepend
    };
  
    // ==========================================================================
    // 3. UTILITIES
    // --------------------------------------------------------------------------
    // Kumpulan fungsi generik tanpa ketergantungan pada fitur tertentu,
    // dipakai ulang oleh beberapa modul fitur di bawahnya.
    // ==========================================================================
  
    /**
     * Meratakan angka menjadi 2 digit dengan nol di depan.
     * Contoh: pad2(7) -> "07", pad2(42) -> "42".
     * Dipakai oleh modul COUNTDOWN (bagian 6) untuk menampilkan
     * Hari/Jam/Menit/Detik selalu dalam format 2 digit yang konsisten
     * (lihat PDF: "Eksekusi Interval & Zero-Padding").
     * @param {number} value - angka yang akan diformat.
     * @returns {string} string 2 digit, mis. "07".
     */
    function pad2(value) {
      // String(value) -> pastikan tipe string (jika value sudah number,
      // konversi eksplisit agar padStart tersedia). padStart(2,'0') ->
      // tambahkan '0' di depan HINGGA panjang total 2 karakter; jika input
      // sudah >=2 digit (mis. 15), tidak ada perubahan.
      return String(value).padStart(2, '0');
    }
  
    /**
     * Menampilkan notifikasi toast singkat (lihat .toast di style.css)
     * dengan pesan yang diberikan, lalu menyembunyikannya otomatis setelah
     * 3 detik. Dipanggil dari copyToClipboard() dan handleRsvpSubmit().
     *
     * CATATAN IMPLEMENTASI: `showToast._timeoutId` menyimpan ID timeout
     * sebagai PROPERTI pada fungsi itu sendiri (bukan variabel module-level
     * terpisah) — teknik ini memastikan jika showToast() dipanggil lagi
     * SEBELUM toast sebelumnya selesai menghilang, timer lama dibatalkan
     * (clearTimeout) dan diganti timer baru, mencegah toast menghilang
     * terlalu cepat akibat timer yang saling tumpang tindih.
     *
     * @param {string} message - teks yang ditampilkan di dalam toast.
     * @returns {void}
     */
    function showToast(message) {
      if (!dom.toast || !dom.toastMessage) return; // guard: fail-safe jika elemen toast tidak ada di DOM
      dom.toastMessage.textContent = message;       // set teks pesan (textContent aman dari XSS, bukan innerHTML)
      dom.toast.classList.add('is-visible');         // tampilkan toast (lihat style.css .toast.is-visible { display:flex })
      window.clearTimeout(showToast._timeoutId);      // batalkan timer sembunyikan sebelumnya jika ada (cegah toast "berkedip")
      showToast._timeoutId = window.setTimeout(() => {
        dom.toast.classList.remove('is-visible');    // sembunyikan toast lagi setelah jeda
      }, 3000); // 3000ms = 3 detik durasi tampil toast
    }
  
    /**
     * Menyalin teks ke clipboard, lalu menampilkan toast konfirmasi.
     * Mengutamakan Clipboard API modern (navigator.clipboard.writeText,
     * asinkron & butuh HTTPS/localhost); jika API tsb tidak tersedia
     * (browser lama atau konteks non-secure), otomatis jatuh ke
     * fallbackCopy() yang memakai trik <textarea> + document.execCommand.
     * Dipakai oleh tombol [data-copy-value] pada section Gift (nomor
     * rekening/alamat) — lihat initCopyButtons().
     * @param {string} text - teks yang akan disalin ke clipboard.
     * @param {string} message - pesan toast yang ditampilkan setelah sukses.
     * @returns {void}
     */
    function copyToClipboard(text, message) {
      // Cek dukungan Clipboard API modern (asinkron, butuh konteks aman
      // HTTPS/localhost). navigator.clipboard bisa undefined di browser
      // lama ATAU saat halaman dibuka lewat http:// biasa.
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)                          // coba salin via API modern (mengembalikan Promise)
          .then(() => showToast(message))            // sukses -> tampilkan toast konfirmasi
          .catch(() => fallbackCopy(text, message));  // gagal (mis. izin ditolak) -> jatuh ke metode lama
      } else {
        fallbackCopy(text, message); // API tidak tersedia sama sekali -> langsung pakai metode lama
      }
    }
  
    /**
     * Fallback penyalinan clipboard untuk browser yang tidak mendukung
     * Clipboard API modern: membuat <textarea> tersembunyi di luar layar,
     * mengisinya dengan teks, menyeleksi isinya, lalu memanggil
     * document.execCommand('copy') (API lama tapi didukung luas), dan
     * langsung membuang elemen tsb dari DOM setelah selesai.
     * @param {string} text - teks yang akan disalin.
     * @param {string} message - pesan toast yang ditampilkan.
     * @returns {void}
     */
    function fallbackCopy(text, message) {
      const el = document.createElement('textarea'); // elemen sementara, tidak pernah tampil ke pengguna
      el.value = text;               // isi textarea dengan teks yang akan disalin
      el.setAttribute('readonly', ''); // mencegah keyboard virtual muncul di perangkat sentuh saat elemen di-focus/select
      el.style.position = 'absolute'; // keluarkan dari alur layout normal
      el.style.left = '-9999px';      // geser jauh ke luar layar agar tidak terlihat sama sekali
      document.body.appendChild(el);  // WAJIB ditambahkan ke DOM dulu sebelum bisa di-select()/execCommand()
      el.select();                    // seleksi seluruh teks di dalam textarea (prasyarat execCommand('copy'))
      try {
        document.execCommand('copy'); // API browser lama (deprecated tapi didukung luas) untuk menyalin seleksi aktif ke clipboard
      } catch (err) {
        /* Clipboard not available — silently ignore */ // beberapa browser/iframe bisa melempar error; diamkan saja
      }
      document.body.removeChild(el); // bersihkan elemen sementara dari DOM, tidak dibutuhkan lagi
      showToast(message);            // tampilkan konfirmasi ke pengguna terlepas dari berhasil/tidaknya execCommand
    }
  
    /**
     * Membangun inisial (maksimal 2 huruf kapital) dari nama lengkap untuk
     * ditampilkan sebagai avatar bulat pada kartu ucapan (.wish-card__avatar).
     * Contoh: getInitials("Bambang Pranoto") -> "BP".
     *         getInitials("Anindya") -> "A".
     * @param {string} name - nama lengkap tamu.
     * @returns {string} inisial 1-2 karakter, huruf besar.
     */
    function getInitials(name) {
      return name
        .split(' ')             // pecah nama jadi array kata berdasarkan spasi, mis. "Bambang Pranoto" -> ["Bambang","Pranoto"]
        .filter(Boolean)        // buang string kosong (mis. akibat spasi ganda "Bambang  Pranoto")
        .map((part) => part[0]) // ambil huruf PERTAMA dari tiap kata -> ["B","P"]
        .slice(0, 2)            // batasi maksimal 2 inisial meski nama terdiri dari banyak kata
        .join('')               // gabungkan jadi satu string "BP"
        .toUpperCase();         // pastikan huruf besar semua (jaga-jaga jika input huruf kecil)
    }
  
    // ==========================================================================
    // 4. OPENING INVITATION (Theatrical Curtain)
    // --------------------------------------------------------------------------
    // Lihat PDF: "Arsitektur Komponen Opening Envelope", "Aksesibilitas
    // Semantik pada Cover Overlay", "Optimalisasi Performa GPU", dan
    // "Manajemen State JavaScript Cover" (5 langkah: kunci scroll -> event
    // listener -> animasi CSS -> buka scroll -> hapus DOM). Implementasi di
    // bawah mengikuti kelima langkah tsb MESKIPUN tidak literal menghapus
    // elemen dari DOM (memakai display:none sebagai gantinya — lebih
    // sederhana & cukup untuk kasus ini karena curtain tidak pernah muncul
    // lagi setelah dibuka sekali per sesi halaman).
    // ==========================================================================
  
    /**
     * Mempersonalisasi nama tamu pada curtain pembuka berdasarkan parameter
     * URL `?to=` atau `?u=` (alias pendek), contoh:
     *   undangan.html?to=Bapak+Danang -> menampilkan "Bapak Danang".
     * Tanda `+` pada query string (representasi spasi versi lama) secara
     * eksplisit dikonversi kembali menjadi spasi SEBELUM didecode, karena
     * decodeURIComponent() TIDAK menangani `+` sebagai spasi (hanya %20).
     * Jika parameter tidak ada, nama default "Tamu Undangan" dari HTML
     * tetap dipakai (elemen tidak diubah).
     * @returns {void}
     */
    function initGuestName() {
      // window.location.search = bagian query string URL (mis. "?to=Bapak+Danang").
      const params = new URLSearchParams(window.location.search);
      // Dukung 2 nama parameter: "to" (deskriptif) atau "u" (alias pendek/
      // lebih ringkas untuk dibagikan via WhatsApp dsb). Jika "to" ada,
      // "u" diabaikan (operator || mengambil operand pertama yang truthy).
      const guestParam = params.get('to') || params.get('u');
      if (guestParam && dom.guestNameEl) {
        // replace(/\+/g, ' ')    -> ganti SEMUA tanda "+" literal jadi spasi
        //                           (standar encoding query string lama;
        //                           decodeURIComponent TIDAK menanganinya).
        // decodeURIComponent(...) -> decode sisa karakter ter-encode
        //                           (mis. %20, %2B, huruf non-ASCII).
        dom.guestNameEl.textContent = decodeURIComponent(guestParam.replace(/\+/g, ' '));
      }
      // Jika guestParam kosong/tidak ada: tidak melakukan apa-apa, nama
      // default "Tamu Undangan" yang sudah ada di markup HTML tetap tampil.
    }
  
    /**
     * Memasang event listener klik pada tombol "Buka Undangan"
     * (#btn-open-invitation). Saat diklik, menjalankan URUTAN ANIMASI
     * bertahap (koordinasikan dengan transisi CSS di style.css Bagian 5):
     *
     *   t=0ms    : Karakter wayang kiri/kanan digeser keluar layar +
     *              memudar (inline style transform/opacity, memicu
     *              transisi CSS 1600ms yang didefinisikan di .curtain__wayang).
     *              Konten tengah (judul, tombol) ikut memudar & mengecil.
     *   t=500ms  : Seluruh elemen .curtain mulai fade-out (opacity:0) dan
     *              pointer-events dimatikan (agar tidak bisa diklik lagi
     *              selama proses fade).
     *   t=1200ms : .curtain disembunyikan total (display:none), kelas
     *              `.is-unlocked` ditambahkan ke <body> (membuka kembali
     *              overflow-y: auto — lihat style.css Bagian 2), lalu
     *              initScrollReveal() DIPANGGIL DI SINI (bukan di init())
     *              supaya animasi scroll-reveal section lain baru mulai
     *              diamati SETELAH tamu benar-benar membuka undangan, dan
     *              attemptAutoplayAudio() dipanggil untuk mencoba memutar
     *              musik gamelan (lihat bagian 11 AUDIO — autoplay dengan
     *              suara sering diblokir browser sampai ada interaksi
     *              pengguna; klik tombol "Buka Undangan" inilah yang
     *              menjadi "interaksi pengguna" yang mengizinkan autoplay).
     *
     * CATATAN: jika Anda mengubah durasi transisi CSS terkait (mis.
     * `.curtain { transition: opacity 1000ms }` atau transisi wayang
     * 1600ms), SESUAIKAN juga angka 500 dan 1200 di dua setTimeout di
     * bawah agar tahapan animasi tetap sinkron dan tidak "patah".
     * @returns {void}
     */
    function initOpeningCurtain() {
      if (!dom.btnOpen || !dom.curtain) return; // guard: tanpa tombol/overlay, fitur ini tidak relevan
  
      dom.btnOpen.addEventListener('click', () => {
        // --- TAHAP 1 (t=0ms, langsung saat diklik): figur wayang & konten tengah mulai bergerak ---
        if (dom.wayangLeft) {
          dom.wayangLeft.style.transform = 'translateX(-120%) rotate(-5deg)'; // geser keluar ke KIRI melewati tepi layar + sedikit rotasi untuk kesan organik
          dom.wayangLeft.style.opacity = '0.2';                                 // memudar (tidak sampai 0 — transisi lebih halus saat curtain fade-out berikutnya)
        }
        if (dom.wayangRight) {
          dom.wayangRight.style.transform = 'translateX(120%) rotate(5deg)'; // geser keluar ke KANAN, rotasi arah berlawanan (simetris)
          dom.wayangRight.style.opacity = '0.2';
        }
        if (dom.curtainContent) {
          dom.curtainContent.style.opacity = '0';           // konten tengah (judul, tombol) memudar
          dom.curtainContent.style.transform = 'scale(0.95)'; // sedikit mengecil, memberi kesan "tertarik ke dalam"
        }
  
        // --- TAHAP 2 (t=500ms): seluruh overlay mulai fade-out ---
        window.setTimeout(() => {
          dom.curtain.style.opacity = '0';          // memicu transisi CSS 1000ms pada .curtain (lihat style.css Bagian 5)
          dom.curtain.style.pointerEvents = 'none';  // matikan interaksi klik SELAMA proses fade (mencegah klik ganda/tembus ke konten di belakangnya)
        }, 500);
  
        // --- TAHAP 3 (t=1200ms): overlay benar-benar disembunyikan & halaman "dibuka" ---
        window.setTimeout(() => {
          dom.curtain.style.display = 'none';       // keluarkan dari render tree sepenuhnya (bukan sekadar opacity:0) agar tidak menghalangi interaksi/scroll sama sekali
          dom.body.classList.add('is-unlocked');     // buka kembali overflow-y (lihat style.css body.is-unlocked)
          initScrollReveal();                        // MULAI AKTIFKAN animasi scroll-reveal untuk seluruh konten di baliknya (lihat bagian 5)
          attemptAutoplayAudio();                     // coba putar musik gamelan — klik tombol ini dihitung sebagai "interaksi pengguna" oleh browser
        }, 1200);
      });
    }
  
    // ==========================================================================
    // 5. SCROLL REVEAL
    // --------------------------------------------------------------------------
    // Lihat juga penjelasan lengkap mekanisme di style.css Bagian 10
    // (ANIMATIONS -> "Global Scroll-Reveal System"). Ringkasnya: fungsi ini
    // yang bertanggung jawab MENDETEKSI kapan sebuah elemen `.reveal-item`
    // masuk viewport, sementara CSS yang bertanggung jawab atas TAMPILAN
    // animasinya (opacity/transform/transition).
    // ==========================================================================
  
    /**
     * Mengamati SEMUA elemen `.reveal-item` di halaman menggunakan
     * IntersectionObserver, dan menambahkan kelas `.is-revealed` begitu
     * sebuah elemen memasuki viewport sejauh ambang (threshold) 15% dari
     * tingginya, dengan rootMargin negatif di bagian bawah (-40px) supaya
     * animasi terpicu sedikit SEBELUM elemen benar-benar terlihat penuh
     * (terasa lebih responsif).
     *
     * Setiap elemen HANYA diamati sampai ia pertama kali terlihat
     * (obs.unobserve setelah is-revealed ditambahkan) — animasi reveal ini
     * BERSIFAT SATU KALI per elemen per muat halaman, tidak berulang saat
     * discroll naik-turun.
     *
     * FALLBACK: jika browser tidak mendukung IntersectionObserver sama
     * sekali (sangat jarang di 2026, tapi tetap dijaga), semua elemen
     * langsung diberi `.is-revealed` tanpa animasi — konten tetap terlihat.
     *
     * Dipanggil SEKALI dari initOpeningCurtain() setelah curtain selesai
     * dibuka (lihat bagian 4), ATAU langsung dari init() jika halaman
     * dimuat dalam kondisi `body.is-unlocked` sudah aktif (mis. saat
     * development/testing dengan curtain dilewati manual).
     * @returns {void}
     */
    function initScrollReveal() {
      const reveals = document.querySelectorAll('.reveal-item'); // ambil SEMUA elemen bertanda animasi di halaman (NodeList statis)
  
      if (!('IntersectionObserver' in window)) {
        // Browser sangat lama tanpa dukungan API ini: langsung tandai semua
        // elemen revealed supaya konten tidak "hilang" selamanya (fail-safe).
        reveals.forEach((el) => el.classList.add('is-revealed'));
        return; // keluar lebih awal, tidak perlu membuat observer
      }
  
      const observer = new IntersectionObserver(
        (entries, obs) => {
          // `entries` = daftar perubahan status intersection sejak callback
          // terakhir (bisa berisi beberapa elemen sekaligus saat scroll cepat).
          entries.forEach((entry) => {
            if (entry.isIntersecting) { // true jika elemen sudah memenuhi ambang threshold di viewport
              entry.target.classList.add('is-revealed'); // picu transisi CSS (opacity/transform) di style.css
              obs.unobserve(entry.target);                // hentikan pengamatan elemen ini — animasi reveal hanya sekali
            }
          });
        },
        {
          threshold: 0.15,                 // trigger saat 15% TINGGI elemen sudah terlihat di viewport
          rootMargin: '0px 0px -40px 0px',  // perkecil "batas bawah" area deteksi sebesar 40px (elemen baru dianggap intersecting saat sudah 40px lebih masuk dari tepi bawah layar) -> animasi terasa lebih "tepat waktu"
        }
      );
  
      reveals.forEach((el) => observer.observe(el)); // daftarkan SETIAP elemen .reveal-item ke observer yang sama (satu observer, banyak target — lebih efisien daripada satu observer per elemen)
    }
  
    // ==========================================================================
    // 6. COUNTDOWN
    // --------------------------------------------------------------------------
    // Lihat PDF slide: "Kalkulasi Waktu", "Konversi Milidetik ke Unit
    // Diskrit", "Aksesibilitas DOM pada Countdown Timer", "Stabilitas
    // Antarmuka Timer (Zero CLS)", "Eksekusi Interval & Zero-Padding".
    //
    // MESIN KEADAAN (STATE MACHINE) 3 FASE berdasarkan waktu sekarang (now)
    // dibandingkan dua ambang batas weddingData.date.targetISO &
    // .thankYouISO:
    //
    //   fase "before"  (now < targetISO)      -> tampilkan grid angka
    //                                             Hari:Jam:Menit:Detik yang
    //                                             berjalan mundur real-time.
    //   fase "doa"     (targetISO <= now < thankYouISO)
    //                                          -> sembunyikan grid angka,
    //                                             tampilkan pesan doa
    //                                             pernikahan (messages.doa).
    //   fase "thanks"  (now >= thankYouISO)    -> tampilkan pesan terima
    //                                             kasih (messages.thanks).
    //                                             Fase ini PERMANEN — begitu
    //                                             tercapai, interval
    //                                             dihentikan (lihat
    //                                             initCountdown) karena
    //                                             tidak akan pernah berubah
    //                                             lagi ke fase lain.
    // ==========================================================================
  
    let countdownIntervalId = null; // menyimpan ID dari setInterval() aktif,
                                     // supaya bisa di-clear saat perlu
                                     // (mencegah interval ganda berjalan
                                     // bersamaan jika initCountdown
                                     // terpanggil lebih dari sekali).
  
    /** Shows the numeric timer grid and hides the status message. */
    function showCountdownTimer() {
      if (dom.countdownTimer) dom.countdownTimer.style.display = '';    // '' = kembalikan ke nilai default stylesheet (flex/grid, BUKAN 'block') -> lebih aman daripada hardcode 'flex' di JS
      if (dom.countdownMessage) dom.countdownMessage.style.display = 'none'; // sembunyikan pesan doa/terima kasih selama fase "before"
    }
  
    /** Hides the numeric timer grid and shows the given status message. */
    function showCountdownMessage(text) {
      if (dom.countdownTimer) dom.countdownTimer.style.display = 'none'; // sembunyikan grid angka Hari:Jam:Menit:Detik
      if (dom.countdownMessage) {
        dom.countdownMessage.textContent = text; // isi dengan pesan doa (fase "doa") atau terima kasih (fase "thanks")
        dom.countdownMessage.style.display = '';  // tampilkan kembali (reset ke default CSS)
      }
    }
  
    /**
     * Updates the countdown area based on the current time relative to the
     * wedding schedule (all thresholds are defined in WIB / UTC+7 via the
     * ISO offsets in weddingData, so the comparison is correct regardless of
     * the viewer's local timezone).
     *
     * Returns the active phase: 'before' | 'doa' | 'thanks'.
     *
     * @param {number} [nowOverride] - optional epoch ms, used for testing.
     */
    function updateCountdown(nowOverride) {
      // nowOverride opsional: memudahkan UNIT TESTING (bisa memaksa waktu
      // tertentu tanpa perlu memanipulasi jam sistem). Dalam penggunaan
      // normal (dipanggil dari initCountdown), parameter ini selalu undefined.
      const now = typeof nowOverride === 'number' ? nowOverride : Date.now(); // epoch ms saat ini (UTC, tapi perbandingan tetap benar krn akadStart/thankYouStart juga epoch absolut)
      const akadStart = new Date(weddingData.date.targetISO).getTime();      // parse ISO string -> epoch ms mulai akad
      const thankYouStart = new Date(weddingData.date.thankYouISO).getTime(); // parse ISO string -> epoch ms mulai fase "thanks"
  
      // Kondisi 1 — sebelum pukul 08.00 WIB: tampilkan countdown menuju acara.
      if (now < akadStart) {
        showCountdownTimer(); // pastikan grid angka terlihat (bukan pesan teks)
  
        const distance = Math.max(akadStart - now, 0); // selisih waktu dlm ms; Math.max(...,0) mencegah angka negatif akibat jeda eksekusi/clock drift sepersekian detik
        // --- Konversi milidetik -> satuan diskrit (lihat PDF "Konversi Milidetik ke Unit Diskrit") ---
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));                         // total hari penuh (1000ms*60*60*24 = ms dalam 1 hari)
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));     // sisa setelah dikurangi hari, dibagi ms-per-jam
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));             // sisa setelah jam, dibagi ms-per-menit
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);                          // sisa setelah menit, dibagi 1000ms = 1 detik
        // Math.floor() di setiap langkah MEMBULATKAN KE BAWAH (bukan round) agar hasil selalu bilangan bulat diskrit, sesuai catatan "Catatan Pembulatan" di PDF.
  
        if (dom.timerDays) dom.timerDays.textContent = pad2(days);       // render dengan zero-padding 2 digit (lihat fungsi pad2 di Bagian 3)
        if (dom.timerHours) dom.timerHours.textContent = pad2(hours);
        if (dom.timerMinutes) dom.timerMinutes.textContent = pad2(minutes);
        if (dom.timerSeconds) dom.timerSeconds.textContent = pad2(seconds);
  
        return 'before'; // laporkan fase saat ini ke pemanggil (dipakai initCountdown untuk keputusan clearInterval)
      }
  
      // Kondisi 2 — pukul 08.00 s.d. sebelum 14.00 WIB: tampilkan doa pernikahan.
      if (now < thankYouStart) {
        showCountdownMessage(weddingData.messages.doa); // ganti tampilan grid angka -> teks doa
        return 'doa';
      }
  
      // Kondisi 3 — mulai pukul 14.00 WIB dan seterusnya: tampilkan ucapan terima kasih.
      // (tidak ada pengecekan upper-bound lagi -> fase ini berlaku SELAMANYA setelah thankYouStart)
      showCountdownMessage(weddingData.messages.thanks);
      return 'thanks';
    }
  
    /**
     * Memulai loop countdown real-time: memanggil updateCountdown() segera
     * (agar angka langsung tampil tanpa menunggu 1 detik pertama), lalu
     * mendaftarkan setInterval 1000ms yang memanggil updateCountdown()
     * berulang. Jika fase saat ini sudah "thanks" sejak awal (artinya
     * halaman dibuka setelah resepsi selesai), interval TIDAK PERNAH
     * dijalankan sama sekali (optimasi — tidak ada gunanya mengecek waktu
     * tiap detik untuk pesan yang sudah permanen). Selama interval
     * berjalan, setiap tick memeriksa apakah fase sudah berubah menjadi
     * "thanks"; jika ya, interval dihentikan via clearInterval dan
     * countdownIntervalId direset ke null.
     *
     * Guard di awal fungsi (clearInterval jika countdownIntervalId sudah
     * terisi) mencegah KEBOCORAN INTERVAL (interval leak) apabila fungsi
     * ini dipanggil lebih dari satu kali dalam satu sesi halaman.
     * @returns {void}
     */
    function initCountdown() {
      // Pastikan tidak ada interval ganda jika initCountdown terpanggil lebih dari sekali.
      if (countdownIntervalId !== null) {
        window.clearInterval(countdownIntervalId); // hentikan interval LAMA yang mungkin masih berjalan
        countdownIntervalId = null;                  // reset penanda supaya state bersih
      }
  
      const phase = updateCountdown(); // panggilan PERTAMA tanpa menunggu interval -> angka langsung tampil akurat saat halaman dimuat, tidak nunggu 1 detik
  
      // Fase 'thanks' bersifat permanen (tidak akan berubah lagi), jadi interval
      // tidak perlu dijalankan terus-menerus.
      if (phase === 'thanks') return; // optimasi: hemat resource, tidak ada gunanya mengecek waktu tiap detik untuk pesan yang sudah final
  
      countdownIntervalId = window.setInterval(() => {
        const currentPhase = updateCountdown(); // dipanggil ULANG setiap 1000ms -> ini "mesin" dari countdown real-time
        if (currentPhase === 'thanks' && countdownIntervalId !== null) {
          // fase baru saja TRANSISI menjadi "thanks" di tick ini -> hentikan interval, tidak perlu lagi dari sini seterusnya
          window.clearInterval(countdownIntervalId);
          countdownIntervalId = null;
        }
      }, 1000); // 1000ms = update setiap 1 detik (selaras dengan satuan terkecil yang ditampilkan: detik)
    }
  
    // ==========================================================================
    // 7. EVENT & CALENDAR
    // ==========================================================================
  
    /**
     * Memasang event listener pada tombol "Simpan ke Kalender"
     * (#btn-add-calendar). Saat diklik, fungsi ini MEMBANGUN URL Google
     * Calendar "Quick Add Event" (endpoint calendar.google.com/calendar/
     * render?action=TEMPLATE&...) secara terprogram menggunakan
     * URLSearchParams, berisi:
     *   - text     : judul event
     *   - dates    : rentang waktu mulai/selesai, format Google Calendar
     *                "YYYYMMDDTHHMMSS" (TANPA pemisah tanda baca) — PERHATIKAN
     *                bahwa `start`/`end` di bawah ini DI-HARDCODE terpisah
     *                dari weddingData.date.targetISO/thankYouISO; jika
     *                tanggal pernikahan berubah, UBAH KEDUANYA (variabel
     *                start/end di sini DAN weddingData.date) agar konsisten.
     *   - details  : deskripsi lengkap multi-baris (rangkaian acara,
     *                dresscode, lokasi, link peta) dibangun dari array
     *                string yang di-join dengan newline.
     *   - location : nama + alamat venue dari weddingData.location.
     *   - ctz      : zona waktu "Asia/Jakarta" agar Google Calendar
     *                menafsirkan jam dengan benar.
     * Hasil akhir dibuka di tab baru (window.open ... '_blank') dengan
     * rel sepadan 'noopener,noreferrer' untuk keamanan (mencegah tab baru
     * mengakses window.opener).
     * @returns {void}
     */
    function initAddToCalendar() {
      if (!dom.btnAddCalendar) return; // guard: tombol mungkin tidak ada jika markup berubah

      dom.btnAddCalendar.addEventListener('click', () => {
        // --- Variabel waktu Google Calendar, format "YYYYMMDDTHHMMSS" tanpa pemisah ---
        const start = '20261224T080000'; // 24 Des 2026, 08:00 -> SELARAS dengan weddingData.date.targetISO, tapi DITULIS ULANG manual di sini (lihat catatan JSDoc di atas fungsi ini)
        const end = '20261224T140000';   // 24 Des 2026, 14:00 -> selaras dengan weddingData.date.thankYouISO
        const title = 'Upacara Pernikahan - Arya & Sekar'; // judul event yang akan muncul di Google Calendar pengguna
        const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' +
          encodeURIComponent(`${weddingData.location.name}, ${weddingData.location.address}`); // encodeURIComponent agar spasi & karakter khusus pada nama/alamat venue aman dimasukkan ke query string URL
        const detailsText = [
          'UNDANGAN PERNIKAHAN — ARYA WICAKSANA & SEKAR ARUM',
          '',
          'Kamis, 24 Desember 2026',
          '',
          'RANGKAIAN ACARA',
          '• Ijab Qabul & Upacara Panggih: 08.00–10.00 WIB',
          '  Ijab Qabul dilanjutkan dengan Upacara Panggih, tradisi pertemuan kedua pengantin dalam adat Jawa gaya Surakarta Hadiningrat.',
          '• Resepsi Pernikahan: 11.00–14.00 WIB',
          '  Resepsi diiringi musik gamelan Jawa untuk menghadirkan suasana tradisional yang hangat. Kehadiran Anda akan menjadi kebahagiaan bagi kedua keluarga.',
          '',
          'DRESSCODE',
          '• Akad / Upacara Panggih: Beskap Jawi Jangkep atau Kebaya Tradisional Sogan. Palet warna: cokelat sogan, hitam, dan emas antik.',
          '• Resepsi: Batik Formal Klasik atau Kebaya Modern Nuansa Emas. Palet warna: sogan gelap, emas hangat, dan krem.',
          '',
          'LOKASI',
          `${weddingData.location.name}`,
          `${weddingData.location.address}`,
          '',
          'PETA & PETUNJUK ARAH',
          mapUrl,
          '',
          'Terima kasih. Kami menantikan kehadiran Anda untuk berbagi kebahagiaan bersama.'
        ].join('\n');
  
        const params = new URLSearchParams({
          action: 'TEMPLATE',                 // parameter wajib Google Calendar untuk mode "buat event baru dari link"
          text: title,                         // judul event
          dates: `${start}/${end}`,            // rentang waktu, dipisah "/" sesuai spesifikasi Google Calendar
          details: detailsText,                // deskripsi lengkap (dibangun di atas lewat array.join('\n'))
          location: `${weddingData.location.name}, ${weddingData.location.address}`, // field lokasi terpisah dari details
          ctz: 'Asia/Jakarta'                  // zona waktu eksplisit agar jam 08:00/14:00 ditafsirkan sebagai WIB, bukan UTC/zona pengguna
        });
        // URLSearchParams.toString() otomatis melakukan URL-encoding pada
        // SEMUA value di atas (termasuk newline \n di dalam detailsText),
        // jadi tidak perlu encodeURIComponent manual lagi di sini.
        const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
        window.open(url, '_blank', 'noopener,noreferrer'); // buka di TAB BARU; 'noopener,noreferrer' mencegah tab baru mendapat akses ke `window.opener` (praktik keamanan standar untuk link eksternal)
      });
    }
  
    // ==========================================================================
    // 8. MAPS
    // --------------------------------------------------------------------------
    // Tidak ada logika JS khusus untuk peta — section #location di
    // index.html memakai <iframe> Google Maps Embed statis (src sudah
    // berisi koordinat/place-id venue). Link "Buka Rute di Google Maps"
    // juga <a href> statis. Deskripsi event di initAddToCalendar() (bagian
    // 7 di atas) turut menyertakan link pencarian Maps yang dibangun dari
    // weddingData.location.
    // ==========================================================================
  
    // ==========================================================================
    // 9. GALLERY & LIGHTBOX
    // --------------------------------------------------------------------------
    // Section #gallery (saat ini di-comment di index.html). Setiap tombol
    // foto di grid galeri memiliki atribut data-lightbox-src="<url-full>".
    // initGallery() mendaftarkan klik pada seluruh elemen tsb untuk
    // membuka modal lightbox berisi gambar ukuran penuh.
    // ==========================================================================
  
    /**
     * Membuka modal lightbox (#gallery-lightbox) dan mengisi gambar
     * ukuran penuh sesuai `src` yang diberikan, lalu menambahkan kelas
     * `.is-open` untuk memicu transisi tampil (lihat style.css -> --- Lightbox ---).
     * @param {string} src - URL gambar resolusi penuh yang akan ditampilkan.
     * @returns {void}
     */
    function openLightbox(src) {
      if (!dom.lightbox || !dom.lightboxImg) return; // guard: modal/elemen img tidak ada (mis. section Gallery nonaktif)
      dom.lightboxImg.src = src;                       // ganti sumber gambar modal sesuai foto yang diklik
      dom.lightbox.classList.add('is-open');           // tampilkan modal (lihat style.css --- Lightbox ---)
    }
  
    /** Menutup modal lightbox dengan menghapus kelas `.is-open`. */
    function closeLightbox() {
      if (!dom.lightbox) return;
      dom.lightbox.classList.remove('is-open'); // sembunyikan modal kembali
    }
  
    /**
     * Mendaftarkan SEMUA interaksi terkait galeri & lightbox:
     *  - klik pada setiap elemen [data-lightbox-src] -> openLightbox(src)
     *  - klik tombol close (#lightbox-close) -> closeLightbox()
     *  - klik PADA BACKDROP lightbox itu sendiri (bukan pada gambar di
     *    dalamnya) -> closeLightbox(). Dicek dengan
     *    `event.target === dom.lightbox` sehingga klik pada <img> di
     *    dalamnya (yang bukan backdrop) TIDAK menutup modal.
     *  - tombol keyboard Escape (listener global di `document`) ->
     *    closeLightbox(), untuk aksesibilitas keyboard.
     * @returns {void}
     */
    function initGallery() {
      const items = document.querySelectorAll('[data-lightbox-src]'); // semua tombol foto galeri (selector atribut, BUKAN class — cocok dengan elemen manapun yang memiliki atribut ini)
      items.forEach((item) => {
        item.addEventListener('click', () => {
          openLightbox(item.getAttribute('data-lightbox-src')); // baca URL foto full dari atribut data-* elemen yang diklik
        });
      });
  
      if (dom.lightboxClose) {
        dom.lightboxClose.addEventListener('click', closeLightbox); // tombol "X" di pojok modal
      }
      if (dom.lightbox) {
        dom.lightbox.addEventListener('click', (event) => {
          // event.target = elemen PERSIS yang diklik (bisa backdrop ATAU
          // <img> di dalamnya, karena event click BUBBLING dari child ke
          // parent). Hanya tutup modal jika yang diklik adalah backdrop
          // itu sendiri (dom.lightbox), BUKAN gambar di dalamnya.
          if (event.target === dom.lightbox) closeLightbox();
        });
      }
      document.addEventListener('keydown', (event) => {
        // Listener GLOBAL (bukan hanya di dalam modal) -> Escape bekerja
        // dari mana saja selama modal terbuka; closeLightbox() sendiri
        // aman dipanggil meski modal sedang tertutup (hanya classList.remove).
        if (event.key === 'Escape') closeLightbox();
      });
    }
  
    // ==========================================================================
    // 10. VIDEO & STREAMING
    // --------------------------------------------------------------------------
    // Section #video (saat ini di-comment di index.html).
    // ==========================================================================
  
    /**
     * Memasang event listener pada tombol play (#btn-play-video). Saat
     * diklik: menambahkan kelas `.is-playing` pada container
     * (#video-player, memicu transisi CSS poster->video), menampilkan
     * elemen <video> asli (#teaser-video, sebelumnya `hidden`), lalu
     * memanggil .play() secara terprogram. Promise dari .play() ditangkap
     * dengan .catch() kosong karena beberapa browser bisa menolak autoplay
     * video dengan suara — namun di sini video baru diputar SETELAH klik
     * eksplisit pengguna, jadi penolakan semacam itu jarang terjadi; catch
     * kosong sekadar mencegah "Unhandled Promise Rejection" di console.
     * @returns {void}
     */
    function initVideoTeaser() {
      if (!dom.btnPlayVideo || !dom.videoPlayer || !dom.teaserVideo) return; // guard: section Video nonaktif -> salah satu elemen ini null

      dom.btnPlayVideo.addEventListener('click', () => {
        dom.videoPlayer.classList.add('is-playing'); // trigger transisi CSS poster->video (lihat style.css --- Video ---)
        dom.teaserVideo.hidden = false;                // tampilkan elemen <video> asli (sebelumnya disembunyikan via atribut HTML `hidden`)
        dom.teaserVideo.play().catch(() => {
          /* Autoplay with sound may be blocked by the browser — user can press play manually */
          // catch kosong HANYA untuk mencegah "Unhandled Promise Rejection"
          // di console; video SUDAH ditampilkan (hidden=false) jadi tamu
          // tetap bisa menekan tombol play BAWAAN <video controls> secara manual.
        });
      });
    }
    // Tombol "Tonton Siaran" pada live streaming memakai <a href> statis
    // yang nilainya idealnya diambil dari weddingData.streaming.url (field
    // ini saat ini DI-COMMENT di bagian 1 WEDDING DATA — uncomment jika
    // section Streaming diaktifkan kembali, lalu set href-nya di HTML
    // secara manual atau tambahkan kode JS untuk mengisinya otomatis).
  
    // ==========================================================================
    // 11. AUDIO
    // --------------------------------------------------------------------------
    // Kontrol pemutaran musik gamelan latar (elemen <audio id="gamelan-audio">
    // saat ini DI-COMMENT di index.html — perlu file assets/audio/Kebo
    // Giro.mp3 & meng-uncomment tag tsb agar fitur ini aktif).
    // ==========================================================================
  
    let isAudioPlaying = false; // state lokal module-level yang melacak
                                 // apakah audio sedang diputar, dipakai
                                 // untuk toggle play/pause & update ikon.
  
    /**
     * Mencoba memutar audio secara OTOMATIS (dipanggil dari
     * initOpeningCurtain() setelah tamu menekan "Buka Undangan" — klik ini
     * dihitung browser sebagai "interaksi pengguna" yang melonggarkan
     * kebijakan autoplay). Jika browser tetap memblokir autoplay (mis.
     * karena kebijakan media engagement yang lebih ketat), promise
     * .play() akan reject dan ditangkap oleh .catch() — tamu tetap bisa
     * memutar musik secara manual lewat tombol audio-controller.
     * @returns {void}
     */
    function attemptAutoplayAudio() {
      if (!dom.audioEl) return; // guard: tag <audio> masih di-comment di HTML -> tidak ada yang bisa diputar
      dom.audioEl
        .play()                 // HTMLMediaElement.play() mengembalikan Promise
        .then(() => {
          isAudioPlaying = true;        // browser MENGIZINKAN autoplay -> sinkronkan state
          updateAudioButtonState();     // perbarui aria-pressed + animasi disk (lihat style.css)
        })
        .catch(() => {
          // Autoplay blocked — guest can start the gending manually.
          isAudioPlaying = false;       // browser MENOLAK autoplay -> state tetap "tidak diputar"
          updateAudioButtonState();     // tombol tetap tersedia untuk diklik manual oleh tamu
        });
    }
  
    /**
     * Menyinkronkan atribut `aria-pressed` tombol audio dengan state
     * `isAudioPlaying` saat ini. Atribut ARIA ini dipakai GANDA:
     *  (1) untuk aksesibilitas pembaca layar (mengumumkan status tombol
     *      toggle "ditekan/tidak"), dan
     *  (2) sebagai SELECTOR CSS di style.css
     *      (`.audio-controller__btn[aria-pressed="false"] .audio-controller__disc`)
     *      untuk menjeda animasi putar piringan (@keyframes spin-slow)
     *      saat audio tidak sedang diputar. Jadi mengubah nilai atribut
     *      ini juga berdampak visual, bukan hanya aksesibilitas.
     * @returns {void}
     */
    function updateAudioButtonState() {
      if (!dom.audioBtn) return;
      dom.audioBtn.setAttribute('aria-pressed', String(isAudioPlaying)); // String(boolean) -> "true"/"false" (atribut HTML selalu string)
    }
  
    /**
     * Mendaftarkan klik pada tombol kontrol audio mengambang untuk
     * toggle play/pause musik gamelan, lalu memanggil
     * updateAudioButtonState() agar ikon & animasi disk ikut diperbarui.
     * @returns {void}
     */
    function initAudioController() {
      if (!dom.audioBtn || !dom.audioEl) return; // guard: butuh KEDUA elemen (tombol DAN elemen <audio>)

      dom.audioBtn.addEventListener('click', () => {
        if (isAudioPlaying) {
          dom.audioEl.pause();     // sedang diputar -> hentikan
          isAudioPlaying = false;
        } else {
          dom.audioEl.play().catch(() => {
            /* Playback requires a local audio file at assets/audio/KeboGiro.mp3 */
            // catch kosong: jika file audio belum tersedia di server,
            // play() akan reject — diamkan agar tidak melempar error ke console.
          });
          isAudioPlaying = true; // optimistic update: state diset true meski play() bisa jadi gagal (reject ditangani di atas)
        }
        updateAudioButtonState(); // selalu sinkronkan tampilan tombol & animasi disk setelah toggle
      });
    }
  
    // ==========================================================================
    // 12. DIGITAL GIFT
    // --------------------------------------------------------------------------
    // Section #gift (saat ini di-comment di index.html). Pola [data-copy-value]
    // ini bersifat GENERIK — bisa dipakai pada tombol salin APA SAJA di
    // halaman (nomor rekening, alamat, dsb.) tanpa perlu menulis event
    // listener baru per tombol; cukup tambahkan atribut
    // data-copy-value="TEKS_YANG_DISALIN" dan opsional
    // data-copy-message="PESAN_TOAST_KUSTOM" pada elemen <button> di HTML.
    // ==========================================================================
  
    /**
     * Mencari SEMUA elemen dengan atribut [data-copy-value] di halaman dan
     * memasang listener klik yang memanggil copyToClipboard() dengan nilai
     * & pesan dari atribut data-* masing-masing tombol. Jika
     * data-copy-message tidak diisi, dipakai pesan default 'Berhasil disalin!'.
     * @returns {void}
     */
    function initCopyButtons() {
      const buttons = document.querySelectorAll('[data-copy-value]'); // semua tombol salin di halaman (rekening, alamat, dsb.)
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-copy-value');   // teks MENTAH yang akan disalin (mis. nomor rekening tanpa spasi)
          const message = btn.getAttribute('data-copy-message') || 'Berhasil disalin!'; // pesan toast kustom per-tombol, atau fallback default
          copyToClipboard(value, message); // lihat implementasi di Bagian 3 UTILITIES
        });
      });
    }
  
    // ==========================================================================
    // 13. RSVP
    // --------------------------------------------------------------------------
    // Section #rsvp (saat ini di-comment di index.html). PENTING: form ini
    // TIDAK mengirim data ke server/database manapun — seluruh proses
    // murni di sisi klien (browser). Entri yang "disimpan" via addWishCard()
    // hanya hidup selama halaman belum di-refresh/ditutup. Untuk
    // persistensi data sungguhan (RSVP tersimpan permanen & terlihat oleh
    // semua tamu), fungsi handleRsvpSubmit() perlu diubah untuk mengirim
    // data ke backend (mis. fetch() ke Google Apps Script/Firebase/REST
    // API kustom) sebelum atau alih-alih memanggil addWishCard().
    // ==========================================================================
  
    /**
     * Handler submit untuk form RSVP (#rsvp-form). Langkah-langkah:
     *  1. event.preventDefault() — mencegah reload halaman bawaan <form>.
     *  2. Validasi sederhana: field nama WAJIB diisi (tidak boleh kosong
     *     setelah di-trim); jika kosong, fokus kembali ke input nama dan
     *     hentikan proses (tanpa pesan error visual — pertimbangkan
     *     menambah indikator error UI jika diperlukan ke depannya).
     *  3. Ambil nilai ucapan (wishes) — jika kosong, dipakai teks default
     *     dalam bahasa Jawa krama sebagai fallback sopan.
     *  4. Ambil pilihan kehadiran dari radio button yang tercentang
     *     (default "Hadir" jika entah bagaimana tidak ada yang tercentang).
     *  5. Panggil addWishCard() untuk menyisipkan entri baru ke buku tamu.
     *  6. Tampilkan toast konfirmasi.
     *  7. Reset form (event.target.reset()) agar siap diisi tamu berikutnya
     *     (berguna jika beberapa tamu berbagi satu perangkat, mis. di meja
     *     resepsi).
     * @param {SubmitEvent} event - event submit dari form.
     * @returns {void}
     */
    function handleRsvpSubmit(event) {
      event.preventDefault(); // WAJIB: cegah <form> melakukan submit/reload halaman bawaan browser

      const nameInput = document.getElementById('rsvp-name');       // input teks nama tamu
      const wishesInput = document.getElementById('rsvp-wishes');   // textarea ucapan/doa (opsional)
      const attendanceChoice = document.querySelector('input[name="attendance"]:checked'); // radio button yang SEDANG tercentang dari grup "attendance"

      if (!nameInput || !nameInput.value.trim()) {
        // Validasi: elemen tidak ada ATAU nilainya kosong setelah di-trim
        // (mis. pengguna hanya mengisi spasi).
        nameInput && nameInput.focus(); // jika elemen ADA tapi kosong, kembalikan fokus keyboard ke sana agar user langsung bisa mengetik
        return; // hentikan proses submit, tidak ada entri yang ditambahkan
      }

      const name = nameInput.value.trim(); // ambil nilai final, buang spasi di awal/akhir
      const wishes = wishesInput && wishesInput.value.trim()
        ? wishesInput.value.trim()                                  // jika tamu mengisi ucapan, pakai itu
        : 'Mugi tansah pinaringan berkah lan karahayon.';            // jika kosong, pakai doa default bahasa Jawa krama sebagai fallback sopan
      const attendance = attendanceChoice ? attendanceChoice.value : 'Hadir'; // fallback "Hadir" jika entah bagaimana tidak ada radio yang tercentang (seharusnya tidak terjadi karena ada `checked` default di HTML)

      addWishCard({ name, wishes, attendance }); // bangun & sisipkan kartu baru ke buku tamu (lihat Bagian 14)
      showToast('Matur nuwun! Konfirmasi kehadiran Panjenengan sampun katampi.'); // notifikasi sukses ke pengirim
      event.target.reset(); // kosongkan kembali SEMUA field form (event.target = elemen <form> itu sendiri)
    }
  
    /** Mendaftarkan handleRsvpSubmit() pada event 'submit' form RSVP. */
    function initRsvpForm() {
      if (!dom.rsvpForm) return; // guard: section RSVP nonaktif -> form tidak ada
      dom.rsvpForm.addEventListener('submit', handleRsvpSubmit); // event 'submit' terpicu saat tombol type="submit" diklik ATAU Enter ditekan di dalam form
    }
  
    // ==========================================================================
    // 14. WISHES (Guestbook)
    // --------------------------------------------------------------------------
    // Section #wishes (saat ini di-comment di index.html). Berisi logika
    // untuk MEMBANGUN & MENYISIPKAN kartu ucapan baru secara dinamis ke
    // DOM (bukan untuk menampilkan ucapan yang sudah ada dari server —
    // kartu-kartu awal di HTML bersifat statis/contoh).
    // ==========================================================================
  
    /**
     * Membuat elemen <article class="wish-card"> baru dari data
     * {name, wishes, attendance}, lalu menyisipkannya di PALING ATAS
     * (prepend) daftar buku tamu (#wishes-container) — supaya ucapan
     * terbaru selalu muncul pertama.
     *
     * ANIMASI MASUK: elemen baru awalnya diberi inline style opacity:0 +
     * transform: scale(0.95) + transition, LALU di-reset ke opacity:1 +
     * scale(1) di dalam requestAnimationFrame() pada frame BERIKUTNYA.
     * Teknik double-rAF/rAF-delay ini diperlukan agar browser sempat
     * me-render state awal (opacity:0) sebelum nilai baru diterapkan —
     * jika langsung diset ke nilai akhir pada frame yang sama, browser
     * akan menggabungkan (batch) kedua perubahan style sehingga TIDAK ADA
     * transisi yang terlihat sama sekali.
     *
     * KEAMANAN: nama & ucapan tamu (input pengguna) di-escape lewat
     * escapeHtml() sebelum disisipkan ke innerHTML, untuk mencegah
     * HTML/Script Injection (XSS) jika tamu memasukkan teks berisi tag
     * HTML di kolom nama/ucapan.
     * @param {{name: string, wishes: string, attendance: string}} entry
     * @returns {void}
     */
    function addWishCard({ name, wishes, attendance }) {
      // Parameter berupa object destructuring: pemanggil WAJIB memberi
      // {name, wishes, attendance} (lihat pemanggilan di handleRsvpSubmit()).
      if (!dom.wishesContainer) return; // guard: section Wishes nonaktif -> tidak ada tempat menyisipkan kartu

      const card = document.createElement('article'); // buat elemen <article> baru, kosong, belum ada di DOM
      card.className = 'wish-card';                     // samakan class dengan kartu statis lain agar styling konsisten
      // --- state AWAL animasi (sebelum masuk DOM): tak terlihat & sedikit mengecil ---
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      card.style.transition = 'opacity 500ms, transform 500ms'; // definisikan transisi SEBELUM elemen ditambahkan ke DOM, agar browser "tahu" harus menganimasikan perubahan berikutnya

      const initials = getInitials(name); // hitung inisial 1-2 huruf untuk avatar (lihat Bagian 3)

      card.innerHTML = `
        <div class="wish-card__head">
          <div class="wish-card__who">
            <span class="wish-card__avatar">${initials}</span>
            <h4 class="label-md">${escapeHtml(name)}</h4>
          </div>
          <span class="attendance-badge">${escapeHtml(attendance)}</span>
        </div>
        <p class="body-sm">${escapeHtml(wishes)}</p>
        <span class="wish-card__time label-caps">Baru saja</span>
      `;
      // CATATAN KEAMANAN: `name`, `attendance`, `wishes` SEMUANYA dibungkus
      // escapeHtml() sebelum disisipkan ke dalam template string HTML di
      // atas — mencegah XSS jika tamu memasukkan karakter "<", ">", dsb.
      // `initials` TIDAK di-escape karena nilainya sudah dijamin aman
      // (hasil .toUpperCase() dari huruf, bukan input mentah langsung).

      dom.wishesContainer.prepend(card); // sisipkan di PALING ATAS daftar (kartu terbaru muncul pertama)

      window.requestAnimationFrame(() => {
        // Dijalankan pada FRAME RENDER BERIKUTNYA (setelah browser sempat
        // "melukis" state awal opacity:0/scale:0.95 di atas) — baru di sini
        // nilai akhir diterapkan, sehingga transisi CSS benar-benar terlihat
        // berjalan dari 0->1 / 0.95->1, bukan langsung "melompat" ke nilai akhir.
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      });
    }
  
    /**
     * Melakukan escaping HTML minimal namun AMAN terhadap teks bebas yang
     * dimasukkan pengguna (nama & ucapan RSVP), dengan memanfaatkan trik
     * DOM: menaruh teks sebagai `textContent` sebuah <div> sementara (yang
     * otomatis melakukan escaping karakter spesial oleh browser), lalu
     * membaca kembali `innerHTML` div tsb yang sudah ter-escape dengan
     * benar (mis. "<script>" menjadi "&lt;script&gt;"). Ini mencegah
     * serangan XSS melalui input form RSVP yang dirender ke buku tamu.
     * @param {string} str - teks mentah dari input pengguna.
     * @returns {string} teks yang sudah di-escape, aman disisipkan ke innerHTML.
     */
    function escapeHtml(str) {
      const div = document.createElement('div'); // elemen sementara, TIDAK PERNAH ditambahkan ke DOM (hanya dipakai sebagai "alat" konversi di memori)
      div.textContent = str;                        // browser otomatis meng-escape karakter spesial (<, >, &, ", ') saat textContent dibaca kembali sebagai innerHTML
      return div.innerHTML;                          // baca kembali versi HTML-escaped-nya, mis. "<b>" -> "&lt;b&gt;"
    }
  
    // ==========================================================================
    // 15. INITIALIZATION
    // --------------------------------------------------------------------------
    // Titik masuk (entry point) tunggal file ini. SEMUA fungsi `initXxx()`
    // dari modul-modul di atas dipanggil di sini, SEKALI, saat event
    // 'DOMContentLoaded' terpicu (lihat baris paling bawah file). Urutan
    // pemanggilan TIDAK terlalu kritikal karena setiap initXxx() independen
    // satu sama lain (masing-masing hanya mendaftarkan event listener),
    // KECUALI initScrollReveal() yang SENGAJA TIDAK dipanggil di sini
    // secara langsung — ia dipicu belakangan dari initOpeningCurtain()
    // (lihat bagian 4) setelah curtain selesai dibuka, supaya animasi
    // scroll-reveal section-section di baliknya baru "aktif" setelah tamu
    // benar-benar masuk ke konten utama.
    //
    // UNTUK MENAMBAH FITUR BARU: tulis fungsi initFiturBaru() mengikuti pola
    // yang sudah ada (guard clause null-check di awal, daftarkan event
    // listener), lalu panggil `initFiturBaru();` di dalam init() berikut.
    // ==========================================================================
  
    function init() {
      initGuestName();       // bagian 4: personalisasi nama tamu dari URL
      initOpeningCurtain();  // bagian 4: pasang listener tombol "Buka Undangan"
      initCountdown();       // bagian 6: mulai loop hitung mundur real-time
      initAddToCalendar();   // bagian 7: pasang listener tombol "Simpan ke Kalender"
      initGallery();         // bagian 9: pasang listener galeri & lightbox (no-op jika nonaktif)
      initVideoTeaser();     // bagian 10: pasang listener tombol play video (no-op jika nonaktif)
      initAudioController(); // bagian 11: pasang listener tombol musik gamelan
      initCopyButtons();     // bagian 12: pasang listener semua tombol salin (no-op jika nonaktif)
      initRsvpForm();        // bagian 13: pasang listener submit form RSVP (no-op jika nonaktif)
      // CATATAN: initScrollReveal() SENGAJA TIDAK dipanggil di sini secara
      // langsung — lihat blok if di bawah & penjelasan lengkap di bagian 4/5.
  
      // Jika halaman dimuat dalam kondisi SUDAH ter-unlock (mis. untuk
      // keperluan testing/development, kelas 'is-unlocked' ditambahkan
      // manual ke <body> lewat DevTools, atau versi HTML yang di-modif
      // tanpa curtain), langsung jalankan scroll-reveal tanpa menunggu
      // klik tombol "Buka Undangan" (yang dalam kondisi ini mungkin tidak
      // pernah diklik sama sekali).
      if (dom.body.classList.contains('is-unlocked')) {
        initScrollReveal();
      }
    }
  
    // Entry point: tunggu DOM sepenuhnya ter-parse sebelum mengakses
    // elemen-elemen di objek `dom` (meskipun <script> ini dimuat di akhir
    // <body> sehingga DOM praktis sudah siap, DOMContentLoaded tetap
    // dipakai sebagai jaminan tambahan yang eksplisit & mudah dibaca).
    document.addEventListener('DOMContentLoaded', init);
  })();
  