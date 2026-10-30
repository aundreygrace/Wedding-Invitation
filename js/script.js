/* ==========================================================================
   SCRIPT UNDANGAN PERNIKAHAN
   ==========================================================================
   Seluruh kode dibungkus satu IIFE agar variabel tidak bocor ke global.

   DAFTAR ISI (cari dengan nomor/judul bagian):
     1.  DATA PERNIKAHAN      -> weddingData (nama, jadwal, pesan, lokasi)
     2.  REFERENSI DOM        -> objek `dom` (cache elemen HTML)
     3.  UTILITAS             -> pad2, showToast, copyToClipboard, getInitials
     4.  SAMPUL PEMBUKA       -> nama tamu & animasi tombol "Buka Undangan"
     5.  SCROLL REVEAL        -> animasi elemen saat di-scroll
     6.  COUNTDOWN            -> hitung mundur 3 fase (before / doa / thanks)
     7.  KALENDER             -> tombol "Simpan ke Kalender"
     8.  PETA                 -> tanpa JS (iframe statis di HTML)
     9.  GALERI (SLIDER) & LIGHTBOX  -> carousel foto + modal lightbox + navigasi
     10. VIDEO                -> iframe YouTube tersemat (responsif, tanpa JS khusus)
     11. AUDIO                -> musik gamelan latar
     12. HADIAH DIGITAL       -> buka/tutup amplop digital + tombol salin rekening/alamat
     13. BUKU TAMU (GUESTBOOK)-> form Hadir/Tidak Hadir + ucapan, terhubung
                                 Google Sheets via Google Apps Script (REST)
     14. INISIALISASI         -> init() dan entry point

   POLA PENULISAN:
     - initXxx()          : dipanggil sekali di init() untuk memasang listener.
     - Guard `if (!dom.xxx) return;` di awal fungsi membuat fitur aman
       dinonaktifkan: jika section HTML di-comment, fungsinya tidak error.

   MENGAKTIFKAN SECTION YANG DI-COMMENT DI index.html (Quote, Streaming):
     1. Hapus komentar HTML pada section terkait di index.html.
     2. script.js tidak perlu diubah; initXxx() sudah terdaftar di init().
     3. Khusus Streaming: uncomment juga data `streaming` di bagian 1.
     (Gift & Wishes/Guestbook sudah AKTIF — tidak di-comment lagi. Section
     RSVP terpisah SUDAH DIHAPUS atas permintaan pembimbing: konfirmasi
     kehadiran sekarang jadi satu dengan form Guestbook di bagian 13.)

   KONFIGURASI WAJIB — GUESTBOOK_API_URL (lihat tepat di bawah 'use strict'):
     Isi dengan URL Web App hasil deploy Google Apps Script (lihat panduan
     deployment yang diberikan terpisah). TANPA url ini, form Guestbook akan
     menampilkan pesan error saat disubmit dan tidak bisa mengambil ucapan.
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // KONFIGURASI GUESTBOOK — Google Apps Script Web App
  // --------------------------------------------------------------------------
  // WAJIB diisi manual setelah Panjenengan deploy Code.gs sebagai Web App
  // (lihat panduan deployment terpisah). Tempel URL-nya di antara tanda
  // kutip di bawah, contoh:
  //   const GUESTBOOK_API_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
  // SENGAJA dikosongkan di sini — JANGAN mengarang/menebak URL. Selama masih
  // kosong, form Guestbook tetap tampil tapi submit/ambil data akan gagal
  // dengan pesan error yang jelas (lihat handleGuestbookSubmit() &
  // fetchGuestbookEntries() di Bagian 13).
  // ==========================================================================
  const GUESTBOOK_API_URL = 'https://script.google.com/macros/s/AKfycbyAu49rv8f2iRYlBb2OASWzKrGfiTKgY4kpkFPOJCI-o03Qbu2pAeYYkTQbjkCPv76M/exec';

  // ==========================================================================
  // 1. DATA PERNIKAHAN
  // --------------------------------------------------------------------------
  // Sumber data utama. Ubah di sini saat template dipakai untuk pasangan lain.
  // Yang benar-benar dibaca JS: date, messages, location.
  // Lainnya (couple, events) hanya referensi; teksnya masih di index.html.
  // ==========================================================================
  const weddingData = {
    // Referensi nama mempelai (belum dibaca JS, nama di HTML ditulis manual)
    couple: {
      groom: { name: 'Arya Wicaksana', instagram: '@aryawicaksana' },
      bride: { name: 'Sekar Arum', instagram: '@sekararum' },
    },

    // Jadwal (dipakai countdown, bagian 6). Gunakan offset zona waktu (+07:00)
    // agar akurat untuk tamu di zona waktu mana pun.
    date: {
      targetISO: '2026-12-24T08:00:00+07:00',    // awal akad (akhir fase "before")
      thankYouISO: '2026-12-24T14:00:00+07:00',  // acara selesai (awal fase "thanks")
      displayLabel: 'Kamis, 24 Desember 2026',   // referensi; teks di HTML manual
    },

    // Pesan countdown (bagian 6): fase "doa" dan fase "thanks"
    messages: {
      doa: 'Bismillahirrahmanirrahim. Semoga Allah SWT melimpahkan keberkahan dalam ikatan suci Arya dan Sekar, menjadikan rumah tangga yang sakinah, mawaddah, warahmah, serta senantiasa dipenuhi cinta, kesabaran, dan kebahagiaan.',
      thanks: 'Terima kasih atas doa, restu, dan kebahagiaan yang telah Anda bagikan kepada Arya dan Sekar. Semoga kebaikan senantiasa menyertai kita semua.',
    },

    // Referensi jadwal acara (belum dibaca JS; initAddToCalendar punya data sendiri)
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

    // Lokasi (dipakai initAddToCalendar)
    location: {
      name: 'The Sunan Hotel Solo',
      address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Sunan%20Hotel%20Solo%2C%20Jl.%20A.%20Yani%20No.40%2C%20Kerten%2C%20Laweyan%2C%20Surakarta%2C%20Jawa%20Tengah',
    },

    streaming: {
      url: 'https://youtube.com',
    }
  };

  // ==========================================================================
  // 2. REFERENSI DOM
  // --------------------------------------------------------------------------
  // Elemen diambil sekali di sini. Nilai bisa `null` jika section di HTML
  // sedang di-comment (sudah ditangani guard di tiap fungsi).
  // ==========================================================================
  const dom = {
    body: document.body,

    // Sampul pembuka (bagian 4)
    curtain: document.getElementById('theatrical-curtain'),
    btnOpen: document.getElementById('btn-open-invitation'),
    wayangLeft: document.getElementById('curtain-wayang-left'),
    wayangRight: document.getElementById('curtain-wayang-right'),
    curtainContent: document.getElementById('curtain-center-content'),
    guestNameEl: document.getElementById('invitation-guest-name'),

    // Audio (bagian 11)
    audioBtn: document.getElementById('audio-controller-btn'),
    audioEl: document.getElementById('gamelan-audio'),

    // Toast (bagian 3)
    toast: document.getElementById('toast-notification'),
    toastMessage: document.getElementById('toast-message'),

    // Countdown & kalender (bagian 6-7)
    countdownTimer: document.getElementById('countdown-timer'),
    countdownMessage: document.getElementById('countdown-message'),
    timerDays: document.getElementById('timer-days'),
    timerHours: document.getElementById('timer-hours'),
    timerMinutes: document.getElementById('timer-minutes'),
    timerSeconds: document.getElementById('timer-seconds'),
    btnAddCalendar: document.getElementById('btn-add-calendar'),

    // Galeri — Slider/Karusel (bagian 9). TP-1 modul: grid diganti slider
    // atas revisi pembimbing, tapi tetap 1 kartu "track" yang berisi semua
    // slide, agar swipe/scroll-snap bekerja native di semua browser & device.
    gallerySlider: document.getElementById('gallery-slider'),
    gallerySliderTrack: document.getElementById('gallery-slider-track'),
    galleryPrevBtn: document.getElementById('gallery-prev'),
    galleryNextBtn: document.getElementById('gallery-next'),
    galleryDots: document.getElementById('gallery-dots'),
    galleryStatus: document.getElementById('gallery-slider-status'),

    // Lightbox (bagian 9). TP-2 modul: modal + navigasi Next/Prev/Close.
    lightbox: document.getElementById('gallery-lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxCaption: document.getElementById('lightbox-caption'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxPrev: document.getElementById('lightbox-prev'),
    lightboxNext: document.getElementById('lightbox-next'),

    // Amplop digital (bagian 12): panel buka/tutup
    giftPanel: document.getElementById('gift-panel'),
    giftToggle: document.getElementById('gift-toggle'),

    // Buku Tamu / Guestbook (bagian 13) — form + status + feed ucapan
    guestbookForm: document.getElementById('guestbook-form'),
    guestbookStatus: document.getElementById('guestbook-status'),
    guestbookSubmitBtn: document.getElementById('guestbook-submit'),
    wishesContainer: document.getElementById('wishes-container'),
  };

  // ==========================================================================
  // 3. UTILITAS
  // ==========================================================================

  /** Format angka jadi 2 digit. Contoh: 7 -> "07". */
  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  /** Tampilkan toast selama 3 detik. Pemanggilan baru membatalkan timer lama. */
  function showToast(message) {
    if (!dom.toast || !dom.toastMessage) return;
    dom.toastMessage.textContent = message;
    dom.toast.classList.add('is-visible');
    window.clearTimeout(showToast._timeoutId);
    showToast._timeoutId = window.setTimeout(() => {
      dom.toast.classList.remove('is-visible');
    }, 3000);
  }

  /**
   * Salin teks ke clipboard (API modern, fallback ke fallbackCopy).
   * `onSuccess` (opsional) dipanggil setelah berhasil — dipakai tombol Salin
   * untuk menampilkan umpan balik "Tersalin!".
   */
  function copyToClipboard(text, message, onSuccess) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast(message);
          if (onSuccess) onSuccess();
        })
        .catch(() => fallbackCopy(text, message, onSuccess));
    } else {
      fallbackCopy(text, message, onSuccess);
    }
  }

  /** Fallback salin untuk browser lama: textarea tersembunyi + execCommand. */
  function fallbackCopy(text, message, onSuccess) {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      /* Clipboard tidak tersedia, abaikan */
    }
    document.body.removeChild(el);
    showToast(message);
    if (onSuccess) onSuccess();
  }

  /** Ambil maksimal 2 inisial huruf kapital. Contoh: "Bambang Pranoto" -> "BP". */
  function getInitials(name) {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /** Deteksi preferensi "Reduce Motion" OS, dipakai agar scroll slide tidak
   *  dipaksa animasi smooth bagi pengguna yang mematikan animasi. */
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ==========================================================================
  // 4. SAMPUL PEMBUKA (Theatrical Curtain)
  // ==========================================================================

  /**
   * Isi nama tamu dari parameter URL `?to=` atau `?u=`.
   * Contoh: ?to=Bapak+Danang -> "Bapak Danang".
   * Jika tidak ada parameter, nama default dari HTML dipakai.
   */
  function initGuestName() {
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('to') || params.get('u');
    if (guestParam && dom.guestNameEl) {
      dom.guestNameEl.textContent = decodeURIComponent(guestParam.replace(/\+/g, ' '));
    }
  }

  /**
   * Animasi tombol "Buka Undangan". Urutan waktu (sinkron dengan transisi
   * CSS di style.css Bagian 5; ubah keduanya bersamaan):
   *   0 ms    : wayang & konten tengah bergerak keluar/memudar
   *   500 ms  : seluruh sampul fade-out
   *   1200 ms : sampul disembunyikan, scroll dibuka, scroll-reveal dimulai
   * Audio dimulai LANGSUNG saat klik (0 ms), bukan di timeout (lihat Bagian 11).
   */
  function initOpeningCurtain() {
    if (!dom.btnOpen || !dom.curtain) return;

    dom.btnOpen.addEventListener('click', () => {
      // Autoplay bypass (Modul Minggu 7, TP-3): play() HARUS dipanggil
      // langsung di dalam handler klik (bukan di setTimeout) agar dihitung
      // sebagai gestur pengguna — terutama di iOS Safari.
      attemptAutoplayAudio();

      // Tahap 1 (0 ms)
      if (dom.wayangLeft) {
        dom.wayangLeft.style.transform = 'translateX(-120%) rotate(-5deg)';
        dom.wayangLeft.style.opacity = '0.2';
      }
      if (dom.wayangRight) {
        dom.wayangRight.style.transform = 'translateX(120%) rotate(5deg)';
        dom.wayangRight.style.opacity = '0.2';
      }
      if (dom.curtainContent) {
        dom.curtainContent.style.opacity = '0';
        dom.curtainContent.style.transform = 'scale(0.95)';
      }

      // Tahap 2 (500 ms)
      window.setTimeout(() => {
        dom.curtain.style.opacity = '0';
        dom.curtain.style.pointerEvents = 'none';
      }, 500);

      // Tahap 3 (1200 ms)
      window.setTimeout(() => {
        dom.curtain.style.display = 'none';
        dom.body.classList.add('is-unlocked'); // buka kembali scroll (lihat style.css)
        initScrollReveal();
      }, 1200);
    });
  }

  // ==========================================================================
  // 5. SCROLL REVEAL
  // --------------------------------------------------------------------------
  // JS mendeteksi elemen `.reveal-item` masuk viewport; tampilan animasinya
  // diatur CSS (style.css Bagian 10).
  // ==========================================================================

  /**
   * Tambahkan `.is-revealed` saat elemen `.reveal-item` terlihat 15%.
   * Animasi hanya sekali per elemen. Tanpa IntersectionObserver, semua
   * elemen langsung ditampilkan.
   * Dipanggil dari initOpeningCurtain() atau init() jika body sudah `is-unlocked`.
   */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-item');

    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // ==========================================================================
  // 6. COUNTDOWN
  // --------------------------------------------------------------------------
  // Tiga fase berdasarkan weddingData.date:
  //   "before" : now < targetISO               -> angka hitung mundur
  //   "doa"    : targetISO <= now < thankYouISO -> pesan doa
  //   "thanks" : now >= thankYouISO             -> pesan terima kasih (permanen)
  // ==========================================================================

  let countdownIntervalId = null; // ID setInterval aktif

  /** Tampilkan grid angka, sembunyikan pesan. */
  function showCountdownTimer() {
    if (dom.countdownTimer) dom.countdownTimer.style.display = '';
    if (dom.countdownMessage) dom.countdownMessage.style.display = 'none';
  }

  /** Sembunyikan grid angka, tampilkan pesan teks. */
  function showCountdownMessage(text) {
    if (dom.countdownTimer) dom.countdownTimer.style.display = 'none';
    if (dom.countdownMessage) {
      dom.countdownMessage.textContent = text;
      dom.countdownMessage.style.display = '';
    }
  }

  /**
   * Perbarui tampilan countdown sesuai waktu sekarang.
   * @param {number} [nowOverride] - epoch ms, untuk testing.
   * @returns {'before'|'doa'|'thanks'} fase aktif.
   */
  function updateCountdown(nowOverride) {
    const now = typeof nowOverride === 'number' ? nowOverride : Date.now();
    const akadStart = new Date(weddingData.date.targetISO).getTime();
    const thankYouStart = new Date(weddingData.date.thankYouISO).getTime();

    // Fase "before": hitung mundur
    if (now < akadStart) {
      showCountdownTimer();

      const distance = Math.max(akadStart - now, 0);
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (dom.timerDays) dom.timerDays.textContent = pad2(days);
      if (dom.timerHours) dom.timerHours.textContent = pad2(hours);
      if (dom.timerMinutes) dom.timerMinutes.textContent = pad2(minutes);
      if (dom.timerSeconds) dom.timerSeconds.textContent = pad2(seconds);

      return 'before';
    }

    // Fase "doa"
    if (now < thankYouStart) {
      showCountdownMessage(weddingData.messages.doa);
      return 'doa';
    }

    // Fase "thanks"
    showCountdownMessage(weddingData.messages.thanks);
    return 'thanks';
  }

  /**
   * Jalankan countdown tiap 1 detik. Jika sudah fase "thanks" sejak awal,
   * interval tidak dibuat; jika fase berubah ke "thanks", interval dihentikan.
   */
  function initCountdown() {
    if (countdownIntervalId !== null) {
      window.clearInterval(countdownIntervalId);
      countdownIntervalId = null;
    }

    const phase = updateCountdown(); // tampil langsung tanpa menunggu 1 detik
    if (phase === 'thanks') return;

    countdownIntervalId = window.setInterval(() => {
      const currentPhase = updateCountdown();
      if (currentPhase === 'thanks' && countdownIntervalId !== null) {
        window.clearInterval(countdownIntervalId);
        countdownIntervalId = null;
      }
    }, 1000);
  }

  // ==========================================================================
  // 7. KALENDER
  // ==========================================================================

  /**
   * Tombol "Simpan ke Kalender": buka Google Calendar di tab baru dengan
   * data event terisi.
   * CATATAN: `start`/`end` di bawah ditulis manual (format YYYYMMDDTHHMMSS).
   * Jika tanggal berubah, ubah juga weddingData.date di bagian 1.
   */
  function initAddToCalendar() {
    if (!dom.btnAddCalendar) return;

    dom.btnAddCalendar.addEventListener('click', () => {
      const start = '20261224T080000';
      const end = '20261224T140000';
      const title = 'Upacara Pernikahan - Arya & Sekar';
      const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(`${weddingData.location.name}, ${weddingData.location.address}`);
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
        action: 'TEMPLATE',
        text: title,
        dates: `${start}/${end}`,
        details: detailsText,
        location: `${weddingData.location.name}, ${weddingData.location.address}`,
        ctz: 'Asia/Jakarta'
      });
      const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // 8. PETA
  // --------------------------------------------------------------------------
  // Tidak ada JS: peta memakai <iframe> statis di section #location (HTML).
  // Link peta untuk kalender dibuat di initAddToCalendar() (bagian 7).
  // ==========================================================================

  // ==========================================================================
  // 9. GALERI (SLIDER) & LIGHTBOX
  // --------------------------------------------------------------------------
  // Modul Minggu 6 — TP-1 (layout responsif + lazy loading) & TP-2 (modal
  // lightbox interaktif dengan navigasi Next/Prev/Close + keyboard).
  //
  // Struktur HTML (lihat index.html § GALERI):
  //   #gallery-slider > #gallery-slider-track > beberapa .gallery-slider__slide
  //   Tiap slide berisi <button data-lightbox-src="FOTO_PENUH" data-caption="...">
  //
  // DUA KOMPONEN TERPISAH, SALING MELENGKAPI:
  //   A) initGallerySlider() — karusel INLINE di halaman. Satu foto penuh
  //      tampil per waktu (BUKAN grid semua foto sekaligus, sesuai revisi
  //      pembimbing). Geser dengan tombol ‹ › , titik indikator (dots),
  //      SWIPE/sentuh (native lewat CSS scroll-snap, otomatis jalan di HP),
  //      atau panah keyboard saat fokus di slider.
  //   B) initLightbox() — modal pembesar foto. Dibuka dengan klik foto yang
  //      sedang aktif di slider, lalu bisa menjelajah SEMUA foto galeri
  //      (bukan cuma yang sedang tampil di slider) via tombol Prev/Next,
  //      tombol Close, klik backdrop, atau keyboard (Escape/←/→).
  //
  // Kedua komponen berbagi satu sumber data: array `galleryImages`, dibangun
  // otomatis dari DOM saat initGallerySlider() dijalankan — jadi menambah
  // foto baru di HTML otomatis dikenali keduanya tanpa ubah JS.
  // ==========================================================================

  let galleryImages = [];       // [{ src, caption }], dibangun dari DOM
  let gallerySlideCount = 0;    // jumlah slide (sinkron dgn galleryImages.length)
  let currentSlideIndex = 0;    // slide yang sedang terlihat di karusel
  let currentLightboxIndex = 0; // foto yang sedang tampil di modal lightbox
  let scrollEndTimeoutId = null; // debounce untuk event 'scroll' pada track

  /* ------------------------------ 9A. SLIDER ------------------------------ */

  /**
   * Bangun array galleryImages dari atribut data-lightbox-src/data-caption
   * tiap slide, lalu generate titik indikator (dots) sejumlah slide.
   * Dipanggil sekali di awal initGallerySlider().
   */
  function collectGalleryImages() {
    const slideButtons = document.querySelectorAll('.gallery-slider__slide [data-lightbox-src]');
    galleryImages = Array.prototype.map.call(slideButtons, (btn) => ({
      src: btn.getAttribute('data-lightbox-src'),
      caption: btn.getAttribute('data-caption') || '',
    }));
    gallerySlideCount = galleryImages.length;
  }

  /**
   * Jumlah foto yang tampil sekaligus di slider.
   * Mobile/tablet (< 1024px): 1 foto (perilaku lama, TIDAK berubah).
   * Desktop (>= 1024px): 3 foto. Breakpoint HARUS sama dengan media query
   * "Gallery Slider — Desktop" di style.css (paling bawah file).
   */
  const GALLERY_DESKTOP_QUERY = '(min-width: 1024px)';
  const GALLERY_DESKTOP_VISIBLE = 3;

  function getVisibleSlides() {
    const isDesktop = window.matchMedia && window.matchMedia(GALLERY_DESKTOP_QUERY).matches;
    return isDesktop ? Math.min(GALLERY_DESKTOP_VISIBLE, gallerySlideCount) : 1;
  }

  /** Indeks slide pertama terbesar yang masih menampilkan jendela penuh. */
  function getMaxSlideIndex() {
    return Math.max(0, gallerySlideCount - getVisibleSlides());
  }

  /**
   * Buat tombol-tombol dot di dalam #gallery-dots.
   * Mobile: satu dot per foto (sama seperti sebelumnya).
   * Desktop: satu dot per "posisi" slider (jumlah foto - 3 + 1).
   */
  function buildGalleryDots() {
    if (!dom.galleryDots) return;
    dom.galleryDots.innerHTML = '';

    const visible = getVisibleSlides();
    const positions = getMaxSlideIndex() + 1;

    for (let index = 0; index < positions; index += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-slider__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute(
        'aria-label',
        visible > 1
          ? `Lihat foto ${index + 1} sampai ${index + visible} dari ${gallerySlideCount}`
          : `Lihat foto ${index + 1} dari ${gallerySlideCount}`
      );
      dot.addEventListener('click', () => goToSlide(index));
      dom.galleryDots.appendChild(dot);
    }

    updateGalleryDots();
  }

  /**
   * Status tombol Prev/Next. Hanya di desktop (3 foto) tombol dinonaktifkan
   * di ujung slider; di mobile tombol tidak pernah dinonaktifkan (perilaku lama).
   */
  function updateGalleryNavState() {
    const limitEnds = getVisibleSlides() > 1;
    if (dom.galleryPrevBtn) dom.galleryPrevBtn.disabled = limitEnds && currentSlideIndex <= 0;
    if (dom.galleryNextBtn) dom.galleryNextBtn.disabled = limitEnds && currentSlideIndex >= getMaxSlideIndex();
  }

  /** Tandai dot yang aktif (sesuai currentSlideIndex) dan update status teks a11y. */
  function updateGalleryDots() {
    if (dom.galleryDots) {
      const dots = dom.galleryDots.querySelectorAll('.gallery-slider__dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentSlideIndex);
        dot.setAttribute('aria-selected', String(index === currentSlideIndex));
      });
    }
    if (dom.galleryStatus) {
      const visible = getVisibleSlides();
      dom.galleryStatus.textContent = visible > 1
        ? `Foto ${currentSlideIndex + 1}–${currentSlideIndex + visible} dari ${gallerySlideCount}`
        : `Foto ${currentSlideIndex + 1} dari ${gallerySlideCount}`;
    }
    updateGalleryNavState();
  }

  /**
   * Animasi geser DESKTOP. scrollTo({behavior:'smooth'}) + scroll-snap sering
   * terasa patah-patah (browser menganimasi lalu "menyentak" ke titik snap).
   * Di sini snap dimatikan sementara (class .is-animating), posisi digerakkan
   * per frame dengan easing, lalu snap dinyalakan lagi di posisi yang sudah
   * pas sehingga tidak ada lompatan. Interaksi pengguna (wheel/sentuh/drag)
   * membatalkan animasi agar tidak melawan gerakan tangan.
   */
  let trackAnimId = null;

  function cancelTrackAnimation() {
    if (trackAnimId !== null) {
      window.cancelAnimationFrame(trackAnimId);
      trackAnimId = null;
    }
    if (dom.gallerySliderTrack) dom.gallerySliderTrack.classList.remove('is-animating');
  }

  function animateTrackTo(target) {
    const track = dom.gallerySliderTrack;
    cancelTrackAnimation();
    const start = track.scrollLeft;
    const delta = target - start;
    if (Math.abs(delta) < 1) return;

    const duration = 520;
    const t0 = window.performance.now();
    track.classList.add('is-animating');

    const step = (now) => {
      const t = Math.min((now - t0) / duration, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
      track.scrollLeft = start + delta * eased;
      if (t < 1) {
        trackAnimId = window.requestAnimationFrame(step);
      } else {
        trackAnimId = null;
        track.scrollLeft = target;
        track.classList.remove('is-animating');
      }
    };
    trackAnimId = window.requestAnimationFrame(step);
  }

  /**
   * Geser track ke slide ke-`index` (dibatasi 0..getMaxSlideIndex()).
   * Mobile: batas = jumlah foto - 1 (sama seperti sebelumnya).
   * Desktop: batas = jumlah foto - 3, agar jendela 3 foto selalu penuh.
   * Dipakai tombol Prev/Next, dot, dan keyboard panah.
   */
  function goToSlide(index, instant) {
    if (!dom.gallerySliderTrack || gallerySlideCount === 0) return;
    const clamped = Math.max(0, Math.min(index, getMaxSlideIndex()));
    const slide = dom.gallerySliderTrack.children[clamped];
    if (!slide) return;

    if (getVisibleSlides() > 1 && !instant && !prefersReducedMotion()) {
      // Desktop (3 foto): animasi rAF sendiri agar mulus & tidak bentrok
      // dengan scroll-snap (lihat animateTrackTo).
      animateTrackTo(slide.offsetLeft);
    } else {
      cancelTrackAnimation();
      dom.gallerySliderTrack.scrollTo({
        left: slide.offsetLeft,
        behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
    // currentSlideIndex & dots akan ikut diperbarui oleh listener 'scroll'
    // (lihat handleSliderScroll), tapi diset langsung juga agar klik dot
    // beruntun terasa responsif tanpa menunggu event scroll selesai.
    currentSlideIndex = clamped;
    updateGalleryDots();
  }

  /**
   * Dipanggil tiap event 'scroll' pada track (mis. saat pengguna swipe
   * manual). Di-debounce 120ms supaya tidak menghitung ulang di tiap frame
   * scroll — baru dihitung saat gerakan scroll mereda (mendekati "scrollend").
   */
  function handleSliderScroll() {
    window.clearTimeout(scrollEndTimeoutId);
    scrollEndTimeoutId = window.setTimeout(() => {
      if (!dom.gallerySliderTrack || trackAnimId !== null) return;
      const trackLeft = dom.gallerySliderTrack.scrollLeft;
      let closestIndex = 0;
      let closestDistance = Infinity;

      Array.prototype.forEach.call(dom.gallerySliderTrack.children, (slide, index) => {
        const distance = Math.abs(slide.offsetLeft - trackLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      currentSlideIndex = Math.min(closestIndex, getMaxSlideIndex());
      updateGalleryDots();
    }, 120);
  }

  /** Pasang listener keyboard (←/→) saat slider sedang difokus. */
  function initGalleryKeyboardNav() {
    if (!dom.gallerySlider) return;
    dom.gallerySlider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToSlide(currentSlideIndex + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToSlide(currentSlideIndex - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        goToSlide(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goToSlide(getMaxSlideIndex());
      }
    });
  }

  /**
   * Saat viewport melintasi breakpoint desktop (mis. resize/rotate), jumlah
   * foto per tampilan berubah: bangun ulang dot, rapikan indeks aktif, lalu
   * sejajarkan track tanpa animasi. Tidak berjalan selama ukuran tetap.
   */
  function initGalleryBreakpointWatch() {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(GALLERY_DESKTOP_QUERY);
    const onChange = () => {
      buildGalleryDots();
      goToSlide(currentSlideIndex, true);
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
    } else if (mql.addListener) {
      mql.addListener(onChange); // Safari lama
    }
  }

  /**
   * Desktop saja: foto digeser cepat, jadi muat semua lebih awal (bukan
   * lazy) dan decode di luar main thread — mencegah macet saat foto baru
   * masuk layar. Mobile tidak disentuh (tetap loading="lazy").
   */
  function prepareGalleryImages() {
    const imgs = dom.gallerySliderTrack.querySelectorAll('.gallery-slider__img');
    const apply = () => {
      if (getVisibleSlides() <= 1) return;
      imgs.forEach((img) => {
        img.loading = 'eager';
        img.decoding = 'async';
      });
    };
    apply();
    if (window.matchMedia) {
      const mql = window.matchMedia(GALLERY_DESKTOP_QUERY);
      if (mql.addEventListener) mql.addEventListener('change', apply);
    }
  }

  /**
   * Inisialisasi karusel galeri. Guard di awal membuat section #gallery
   * aman dinonaktifkan (di-comment di HTML) tanpa memicu error di sini
   * maupun di initLightbox().
   */
  function initGallerySlider() {
    if (!dom.gallerySlider || !dom.gallerySliderTrack) return;

    collectGalleryImages();
    if (gallerySlideCount === 0) return;

    buildGalleryDots();

    if (dom.galleryPrevBtn) {
      dom.galleryPrevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
    }
    if (dom.galleryNextBtn) {
      dom.galleryNextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));
    }

    // Swipe/sentuh/trackpad TIDAK butuh JS tambahan: track memakai CSS
    // `overflow-x: auto; scroll-snap-type: x mandatory;` (lihat style.css
    // § Gallery Slider) sehingga browser menangani gesture secara native.
    dom.gallerySliderTrack.addEventListener('scroll', handleSliderScroll, { passive: true });

    // Gerakan tangan pengguna membatalkan animasi tombol yang sedang berjalan.
    ['wheel', 'touchstart', 'pointerdown'].forEach((evt) => {
      dom.gallerySliderTrack.addEventListener(evt, cancelTrackAnimation, { passive: true });
    });

    prepareGalleryImages();
    initGalleryKeyboardNav();
    initGalleryBreakpointWatch();
    initLightbox();
  }

  /* ----------------------------- 9B. LIGHTBOX ----------------------------- */

  /** Tampilkan foto ke-`index` di modal lightbox (dibatasi & dibungkus/wrap-around). */
  function renderLightboxImage(index) {
    if (!dom.lightbox || !dom.lightboxImg || gallerySlideCount === 0) return;

    // Wrap-around: dari foto terakhir -> Next kembali ke foto pertama, dst.
    currentLightboxIndex = (index + gallerySlideCount) % gallerySlideCount;
    const image = galleryImages[currentLightboxIndex];

    dom.lightboxImg.src = image.src;
    dom.lightboxImg.alt = image.caption || `Foto galeri ${currentLightboxIndex + 1}`;
    if (dom.lightboxCaption) {
      dom.lightboxCaption.textContent = image.caption || '';
    }
  }

  /** Buka lightbox mulai dari foto ke-`index` & kunci scroll halaman. */
  function openLightbox(index) {
    if (!dom.lightbox || !dom.lightboxImg) return;
    renderLightboxImage(index);
    dom.lightbox.classList.add('is-open');
    dom.body.classList.add('lightbox-open'); // style.css: overflow:hidden selama modal terbuka
  }

  /** Tutup lightbox & buka kembali scroll halaman. */
  function closeLightbox() {
    if (!dom.lightbox) return;
    dom.lightbox.classList.remove('is-open');
    dom.body.classList.remove('lightbox-open');
  }

  /** Navigasi ke foto berikutnya/sebelumnya di DALAM lightbox (bukan slider utama). */
  function showNextLightboxImage() {
    renderLightboxImage(currentLightboxIndex + 1);
  }
  function showPrevLightboxImage() {
    renderLightboxImage(currentLightboxIndex - 1);
  }

  /**
   * Pasang semua listener lightbox: klik slide (buka), tombol close/prev/next,
   * klik backdrop (tutup), dan keyboard Escape/ArrowLeft/ArrowRight — tapi
   * keyboard HANYA aktif saat lightbox sedang terbuka, agar tidak bentrok
   * dengan keyboard nav slider (Bagian 9A) saat lightbox tertutup.
   * Dipanggil dari initGallerySlider() setelah galleryImages terisi.
   */
  function initLightbox() {
    // Klik salah satu slide yang sedang aktif -> buka lightbox di foto itu
    const slideButtons = document.querySelectorAll('.gallery-slider__slide [data-lightbox-src]');
    slideButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => openLightbox(index));
    });

    if (dom.lightboxClose) {
      dom.lightboxClose.addEventListener('click', closeLightbox);
    }
    if (dom.lightboxPrev) {
      dom.lightboxPrev.addEventListener('click', showPrevLightboxImage);
    }
    if (dom.lightboxNext) {
      dom.lightboxNext.addEventListener('click', showNextLightboxImage);
    }
    if (dom.lightbox) {
      dom.lightbox.addEventListener('click', (event) => {
        // Tutup hanya jika yang diklik backdrop, bukan gambar/tombol navigasi
        if (event.target === dom.lightbox) closeLightbox();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (!dom.lightbox || !dom.lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') showNextLightboxImage();
      if (event.key === 'ArrowLeft') showPrevLightboxImage();
    });
  }

  // ==========================================================================
  // 10. VIDEO
  // --------------------------------------------------------------------------
  // Modul TP-3: video disematkan via <iframe> YouTube yang responsif
  // (wrapper rasio 16:9, lihat style.css § .video-wrapper) dengan
  // `loading="lazy"` di HTML. Karena kontrol play/pause/fullscreen sudah
  // ditangani bawaan oleh player YouTube di dalam iframe, TIDAK ADA LAGI
  // logika JS kustom di sini (initVideoTeaser() versi lama — poster gambar
  // + tombol play + elemen <video> lokal — sudah tidak dipakai & tidak
  // dipanggil dari init(), lihat Bagian 15).
  // ==========================================================================

  // ==========================================================================
  // 11. AUDIO  (Modul Minggu 7 — TP-2 & TP-3)
  // --------------------------------------------------------------------------
  // Musik gamelan latar + widget melayang (#audio-widget, lihat index.html [02]).
  //
  // ALUR:
  //   1. Tamu klik "Buka Undangan" -> initOpeningCurtain() memanggil
  //      attemptAutoplayAudio() LANGSUNG di handler klik (bypass kebijakan
  //      autoplay browser, termasuk iOS Safari).
  //   2. playAudio() memutar dengan volume 0 lalu fade-in perlahan.
  //      Promise play() ditangani: jika diblokir/gagal, state tetap "paused"
  //      dan tamu bisa menekan tombol widget secara manual.
  //   3. Tombol widget = toggle play/pause. State dikelola variabel
  //      isAudioPlaying dan disinkronkan ke tombol lewat class
  //      "playing"/"paused", aria-pressed, dan aria-label dinamis.
  //      State "paused" menampilkan ikon musik DICORET (lihat style.css).
  //
  // File audio: assets/audio/Kebo Giro.mp3 (atau KeboGiro.mp3), MP3 < 1MB.
  // ==========================================================================

  let isAudioPlaying = false;      // status pemutaran (sumber kebenaran UI)
  let audioFadeId = null;          // ID requestAnimationFrame fade aktif
  let hasAudioEverPlayed = false;  // sudah pernah mulai diputar sekali? (lihat playAudio())
  const AUDIO_TARGET_VOLUME = 0.7;  // volume akhir musik latar (0..1)
  const AUDIO_FADE_IN_MS = 100;    // lama fade-in HANYA saat PERTAMA KALI diputar (buka undangan)
  const AUDIO_RESUME_FADE_MS = 700; // lama fade singkat saat musik DILANJUTKAN setelah dijeda manual
  const AUDIO_FADE_OUT_MS = 600;    // lama fade-out saat dijeda

  /**
   * Ubah volume audio bertahap ke `target` selama `duration` ms.
   * Pemanggilan baru membatalkan fade sebelumnya (termasuk onDone-nya).
   * Catatan: iOS Safari mengabaikan audio.volume (selalu 1), jadi di sana
   * fade tidak terdengar tetapi tidak menimbulkan error.
   */
  function fadeAudioTo(target, duration, onDone) {
    if (!dom.audioEl) return;
    if (audioFadeId !== null) {
      window.cancelAnimationFrame(audioFadeId);
      audioFadeId = null;
    }
    const from = dom.audioEl.volume;
    const t0 = window.performance.now();

    const step = (now) => {
      const t = Math.min((now - t0) / duration, 1);
      dom.audioEl.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t < 1) {
        audioFadeId = window.requestAnimationFrame(step);
      } else {
        audioFadeId = null;
        if (onDone) onDone();
      }
    };
    audioFadeId = window.requestAnimationFrame(step);
  }

  /**
   * Putar musik. Aman dari penolakan autoplay (Promise ditangani).
   *
   * BUGFIX (revisi pembimbing — "lagu kayak mundur beberapa detik saat
   * di-pause lalu diputar lagi"): audio.pause()/.play() TIDAK pernah
   * mengubah currentTime (lagu selalu lanjut dari posisi terakhir — itu
   * bawaan HTMLMediaElement), tapi kode lama men-set volume = 0 lalu
   * fade-in PELAN (2 detik) SETIAP KALI playAudio() dipanggil — termasuk
   * saat tombol widget ditekan lagi setelah dijeda manual. Dua detik nyaris
   * tanpa suara itu membuat pendengar merasa lagu "meloncat mundur" karena
   * bagian lagu yang terdengar begitu suara kembali normal terasa asing.
   * FIX: fade-in PELAN dari senyap HANYA pada pemutaran PERTAMA KALI (saat
   * tombol "Buka Undangan" di curtain memicu attemptAutoplayAudio()).
   * Resume berikutnya (tombol widget musik) pakai fade SINGKAT dari volume
   * saat ini ke volume target — currentTime tetap melanjutkan, tanpa jeda
   * senyap yang terasa seperti "restart".
   */
  function playAudio() {
    if (!dom.audioEl) return;
    const isFirstPlay = !hasAudioEverPlayed;
    if (isFirstPlay && dom.audioEl.paused) {
      dom.audioEl.volume = 0; // hanya pemutaran pertama: mulai senyap lalu naik perlahan
    }

    const onStarted = () => {
      isAudioPlaying = true;
      hasAudioEverPlayed = true;
      updateAudioButtonState();
      if (isFirstPlay) {
        fadeAudioTo(AUDIO_TARGET_VOLUME, AUDIO_FADE_IN_MS);
      } else {
        fadeAudioTo(AUDIO_TARGET_VOLUME, AUDIO_RESUME_FADE_MS);
      }
    };

    let result;
    try {
      result = dom.audioEl.play();
    } catch (err) {
      result = Promise.reject(err);
    }

    if (result && typeof result.then === 'function') {
      result.then(onStarted).catch((err) => {
        // Autoplay diblokir browser atau file audio belum tersedia.
        console.warn('Audio tidak dapat diputar:', err);
        isAudioPlaying = false;
        dom.audioEl.volume = AUDIO_TARGET_VOLUME;
        updateAudioButtonState();
      });
    } else {
      onStarted(); // browser lama: play() tidak mengembalikan Promise
    }
  }

  /** Jeda musik dengan fade-out singkat. UI langsung berubah ke state "paused". */
  function pauseAudio() {
    if (!dom.audioEl) return;
    isAudioPlaying = false;
    updateAudioButtonState();
    fadeAudioTo(0, AUDIO_FADE_OUT_MS, () => {
      dom.audioEl.pause();
    });
  }

  /** Dipanggil saat tombol "Buka Undangan" diklik (lihat initOpeningCurtain). */
  function attemptAutoplayAudio() {
    playAudio();
  }

  /**
   * Sinkronkan tombol dengan state: class playing/paused, aria-pressed
   * (dibaca CSS), dan aria-label dinamis untuk pembaca layar.
   */
  function updateAudioButtonState() {
    if (!dom.audioBtn) return;
    dom.audioBtn.classList.toggle('playing', isAudioPlaying);
    dom.audioBtn.classList.toggle('paused', !isAudioPlaying);
    dom.audioBtn.setAttribute('aria-pressed', String(isAudioPlaying));
    dom.audioBtn.setAttribute('aria-label', isAudioPlaying ? 'Jeda Musik Latar' : 'Putar Musik Latar');
  }

  /** Tombol audio: toggle play/pause + sinkron dengan kontrol sistem (media key, dll). */
  function initAudioController() {
    if (!dom.audioBtn || !dom.audioEl) return;

    updateAudioButtonState();

    dom.audioBtn.addEventListener('click', () => {
      if (isAudioPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });

    // Jika audio dijeda/diputar dari luar widget (tombol media, headset),
    // ikon ikut menyesuaikan.
    dom.audioEl.addEventListener('pause', () => {
      if (isAudioPlaying) {
        isAudioPlaying = false;
        updateAudioButtonState();
      }
    });
    dom.audioEl.addEventListener('play', () => {
      if (!isAudioPlaying) {
        isAudioPlaying = true;
        updateAudioButtonState();
      }
    });
    dom.audioEl.addEventListener('error', () => {
      console.warn('File audio tidak ditemukan di assets/audio/ (Kebo Giro.mp3 / KeboGiro.mp3).');
    }, true);
  }

  // ==========================================================================
  // 12. HADIAH DIGITAL / AMPLOP DIGITAL  (Modul Minggu 5 + revisi pembimbing)
  // --------------------------------------------------------------------------
  // Section #gift (index.html). Dua fitur:
  //   A) initGiftToggle()  — isi amplop (rekening + alamat) TERTUTUP di awal;
  //      tombol #gift-toggle membuka/menutupnya. Animasi tinggi diatur CSS
  //      (class .is-open pada #gift-panel); JS hanya mengatur state & ARIA.
  //   B) initCopyButtons() — tombol apa pun dengan data-copy-value="TEKS"
  //      (opsional data-copy-message="PESAN_TOAST") menyalin lewat Clipboard
  //      API. Tombol memberi umpan balik "Tersalin!" selama 2 detik.
  // ==========================================================================

  const COPY_FEEDBACK_MS = 2000; // lama teks "Tersalin!" tampil di tombol

  /** Buka/tutup panel amplop dan sinkronkan aria-expanded + label tombol. */
  function setGiftOpen(isOpen) {
    if (!dom.giftPanel || !dom.giftToggle) return;
    dom.giftPanel.classList.toggle('is-open', isOpen);
    dom.giftToggle.setAttribute('aria-expanded', String(isOpen));
    const label = dom.giftToggle.querySelector('.gift__toggle-label');
    if (label) label.textContent = isOpen ? 'Tutup Amplop Digital' : 'Buka Amplop Digital';
  }

  /** Pasang listener tombol buka/tutup amplop (state awal: tertutup). */
  function initGiftToggle() {
    if (!dom.giftPanel || !dom.giftToggle) return;
    setGiftOpen(false);
    dom.giftToggle.addEventListener('click', () => {
      setGiftOpen(!dom.giftPanel.classList.contains('is-open'));
    });
  }

  /**
   * Umpan balik tombol Salin: teks -> "Tersalin!", ikon -> centang, warna
   * hijau (class .is-copied) lalu kembali normal setelah COPY_FEEDBACK_MS.
   * Klik beruntun tidak menumpuk timer.
   */
  function showCopyFeedback(btn) {
    const label = btn.querySelector('.btn__label');
    const icon = btn.querySelector('.material-symbols-outlined');
    if (label && btn._origLabel === undefined) btn._origLabel = label.textContent;
    if (icon && btn._origIcon === undefined) btn._origIcon = icon.textContent;

    window.clearTimeout(btn._copyTimer);
    btn.classList.add('is-copied');
    if (label) label.textContent = 'Tersalin!';
    if (icon) icon.textContent = 'check';

    btn._copyTimer = window.setTimeout(() => {
      btn.classList.remove('is-copied');
      if (label) label.textContent = btn._origLabel;
      if (icon) icon.textContent = btn._origIcon;
    }, COPY_FEEDBACK_MS);
  }

  /** Pasang listener salin pada semua elemen [data-copy-value]. */
  function initCopyButtons() {
    const buttons = document.querySelectorAll('[data-copy-value]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-copy-value');
        const message = btn.getAttribute('data-copy-message') || 'Berhasil disalin!';
        copyToClipboard(value, message, () => showCopyFeedback(btn));
      });
    });
  }

  // ==========================================================================
  // 13. BUKU TAMU (GUESTBOOK) — integrasi Google Sheets via Google Apps Script
  // --------------------------------------------------------------------------
  // Section #wishes: form #guestbook-form (nama, kehadiran Hadir/Tidak
  // Hadir, pesan) + feed #wishes-container. Google Sheets adalah SATU-
  // SATUNYA sumber data (tidak ada localStorage/data dummy).
  //
  // Alur:
  //   initGuestbookForm()      -> pasang listener submit, lalu panggil
  //                                fetchGuestbookEntries() sekali saat load
  //                                (guard: butuh GUESTBOOK_API_URL terisi)
  //   handleGuestbookSubmit()  -> validasi (checkValidity), kirim POST
  //                                (FormData, TANPA reload) ke Apps Script,
  //                                tombol -> mode loading, lalu sukses/gagal
  //   fetchGuestbookEntries()  -> GET daftar terbaru, render skeleton dulu
  //   renderGuestbookEntries() -> bangun kartu ucapan dari respons JSON,
  //                                escapeHtml() di tiap field (anti-XSS)
  //
  // PENTING: nama field FormData ("nama", "kehadiran", "pesan") HARUS sama
  // persis dengan e.parameter yang dibaca Code.gs (doPost) di Apps Script —
  // dan HARUS sama dengan urutan kolom Google Sheets: TIMESTAMP | NAMA |
  // KEHADIRAN | PESAN (TIMESTAMP diisi otomatis oleh Apps Script, bukan JS).
  // ==========================================================================

  /**
   * Tampilkan/kosongkan pesan status (sukses/gagal) di bawah form Guestbook.
   * @param {string} message - kosongkan ('') untuk menyembunyikan lagi.
   * @param {'success'|'error'|null} type
   */
  function setGuestbookStatus(message, type) {
    if (!dom.guestbookStatus) return;
    dom.guestbookStatus.textContent = message;
    dom.guestbookStatus.classList.remove('guestbook-status--success', 'guestbook-status--error');
    if (type === 'success' || type === 'error') {
      dom.guestbookStatus.classList.add('guestbook-status--' + type);
    }
    dom.guestbookStatus.classList.toggle('is-visible', Boolean(message));
  }

  /** Alihkan tombol submit ke mode loading ("Mengirimkan...") atau normal. */
  function setGuestbookLoading(isLoading) {
    if (!dom.guestbookSubmitBtn) return;
    dom.guestbookSubmitBtn.disabled = isLoading;
    dom.guestbookSubmitBtn.classList.toggle('is-loading', isLoading);
    const label = dom.guestbookSubmitBtn.querySelector('.guestbook-form__submit-label');
    if (label) label.textContent = isLoading ? 'Sedang mengirim...' : 'Kirim Ucapan';
  }

  let isGuestbookSubmitting = false;

  /**
   * Proses submit form Guestbook: intersepsi reload (e.preventDefault()),
   * validasi HTML5 native, kirim POST ke Apps Script via FormData (TANPA
   * header Content-Type manual — supaya tetap "simple request" & lolos CORS
   * default Apps Script tanpa perlu preflight OPTIONS), lalu tangani
   * sukses/gagal dan segarkan daftar ucapan.
   */
  function handleGuestbookSubmit(event) {
    event.preventDefault();
    if (!dom.guestbookForm) return;

    // Guard anti-duplikat: abaikan event 'submit' kedua selama proses
    // pengiriman pertama belum selesai (lihat catatan `isGuestbookSubmitting`).
    if (isGuestbookSubmitting) return;

    if (!GUESTBOOK_API_URL) {
      setGuestbookStatus(
        'Guestbook belum terhubung ke server. Tempel URL Web App Google Apps Script pada GUESTBOOK_API_URL di script.js.',
        'error'
      );
      return;
    }

    // Validasi bawaan HTML5 (required, dsb.) — fokuskan & tampilkan pesan
    // native browser pada field pertama yang belum valid.
    if (!dom.guestbookForm.checkValidity()) {
      dom.guestbookForm.reportValidity();
      return;
    }

    const formData = new FormData(dom.guestbookForm);
    isGuestbookSubmitting = true;
    setGuestbookLoading(true);
    setGuestbookStatus('', null);

    fetch(GUESTBOOK_API_URL, { method: 'POST', body: formData })
      .then((response) => response.json())
      .then((result) => {
        if (result && result.result === 'success') {
          setGuestbookStatus('Terima kasih! Ucapan dan doa Anda telah berhasil kami terima.', 'success');
          dom.guestbookForm.reset();
          fetchGuestbookEntries();
        } else {
          setGuestbookStatus((result && result.message) || 'Gagal mengirim ucapan. Silakan coba kembali.', 'error');
        }
      })
      .catch(() => {
        setGuestbookStatus('Gagal terhubung ke server. Silakan periksa koneksi internet Anda.', 'error');
      })
      .finally(() => {
        isGuestbookSubmitting = false;
        setGuestbookLoading(false);
      });
  }

  /** Tampilkan beberapa kartu skeleton selagi menunggu respons GET pertama. */
  function renderGuestbookSkeleton() {
    if (!dom.wishesContainer) return;
    dom.wishesContainer.innerHTML =
      '<div class="wish-skeleton" aria-hidden="true"></div>' +
      '<div class="wish-skeleton" aria-hidden="true"></div>' +
      '<div class="wish-skeleton" aria-hidden="true"></div>';
  }

  /** Format ISO timestamp dari Apps Script jadi label tanggal berbahasa Indonesia. */
  function formatWishTimestamp(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (err) {
      return '';
    }
  }

  /**
   * Render ulang seluruh daftar ucapan dari data Google Sheets (array hasil
   * doGet). Server (Code.gs) sudah mengurutkan dari terbaru -> terlama lewat
   * unshift(), jadi di sini TIDAK disortir ulang — urutan respons dipakai
   * apa adanya. Semua teks dari pengguna (nama/pesan) di-escape lewat
   * escapeHtml() sebelum masuk innerHTML untuk mencegah XSS.
   * @param {Array<{timestamp:string,nama:string,kehadiran:string,pesan:string}>} entries
   */
  function renderGuestbookEntries(entries) {
    if (!dom.wishesContainer) return;
    dom.wishesContainer.innerHTML = '';

    if (!entries || entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'wishes__empty';
      empty.id = 'wishes-empty';
      empty.textContent = 'Belum ada ucapan. Jadilah yang pertama menyampaikan doa dan ucapan!';
      dom.wishesContainer.appendChild(empty);
      return;
    }

    entries.forEach((entry) => {
      const name = (entry && entry.nama) || 'Tamu Undangan';
      const attendance = (entry && entry.kehadiran) || 'Hadir';
      const message = (entry && entry.pesan) || '';
      const timeLabel = formatWishTimestamp(entry && entry.timestamp);
      const initials = getInitials(name);
      const badgeModifier = attendance === 'Tidak Hadir' ? ' attendance-badge--tidak-hadir' : '';

      const card = document.createElement('article');
      card.className = 'wish-card';
      card.innerHTML =
        '<div class="wish-card__head">' +
          '<div class="wish-card__who">' +
            '<span class="wish-card__avatar">' + escapeHtml(initials) + '</span>' +
            '<h4 class="label-md">' + escapeHtml(name) + '</h4>' +
          '</div>' +
          '<span class="attendance-badge' + badgeModifier + '">' + escapeHtml(attendance) + '</span>' +
        '</div>' +
        '<p class="body-sm">' + escapeHtml(message) + '</p>' +
        (timeLabel ? '<span class="wish-card__time label-caps">' + escapeHtml(timeLabel) + '</span>' : '');

      dom.wishesContainer.appendChild(card);
    });
  }

  // Menyimpan permintaan GET #wishes-container yang sedang berjalan, supaya
  // kalau fetchGuestbookEntries() dipanggil lagi sebelum yang sebelumnya
  // selesai (mis. GET awal saat halaman dimuat masih lambat/cold-start Apps
  // Script, lalu user langsung kirim ucapan sehingga GET kedua menyusul),
  // permintaan LAMA dibatalkan via AbortController. Dengan begitu hanya
  // SATU respons yang pernah dipakai me-render ulang daftar — mencegah
  // respons "basi" yang datang belakangan menimpa/membuat daftar terasa
  // tidak konsisten (render ganda/berkedip) saat dua permintaan tumpang
  // tindih.
  let guestbookFetchController = null;

  /**
   * Ambil daftar ucapan terbaru dari Apps Script (HTTP GET) lalu render ke
   * #wishes-container. Dipanggil saat halaman dimuat & setiap kali submit
   * Guestbook berhasil, supaya feed selalu seketika/real-time tanpa reload.
   */
  function fetchGuestbookEntries() {
    if (!dom.wishesContainer || !GUESTBOOK_API_URL) return;

    if (guestbookFetchController) {
      guestbookFetchController.abort();
    }
    const controller = new AbortController();
    guestbookFetchController = controller;

    renderGuestbookSkeleton();

    fetch(GUESTBOOK_API_URL, { method: 'GET', signal: controller.signal })
      .then((response) => response.json())
      .then((result) => {
        if (controller.signal.aborted) return; // sudah digantikan permintaan lebih baru
        if (result && result.result === 'success') {
          renderGuestbookEntries(result.data || []);
        } else {
          renderGuestbookEntries([]);
        }
      })
      .catch((err) => {
        if (err && err.name === 'AbortError') return; // dibatalkan sengaja, bukan error sungguhan
        if (!dom.wishesContainer) return;
        dom.wishesContainer.innerHTML =
          '<p class="wishes__empty">Gagal mengambil ucapan dari server. Silakan muat ulang halaman ini.</p>';
      });
  }

  /** Pasang listener submit & ambil daftar ucapan pertama kali. */
  function initGuestbookForm() {
    if (!dom.guestbookForm) return;
    dom.guestbookForm.addEventListener('submit', handleGuestbookSubmit);

    if (!GUESTBOOK_API_URL) {
      // Tanpa URL API: tampilkan state kosong statis, jangan fetch apa pun.
      renderGuestbookEntries([]);
      return;
    }
    fetchGuestbookEntries();
  }

  /** Escape karakter HTML pada teks input pengguna (mis. "<b>" -> "&lt;b&gt;"). */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  // ==========================================================================
  // 14. INISIALISASI
  // --------------------------------------------------------------------------
  // Titik masuk tunggal. Untuk fitur baru: buat initFiturBaru() dengan
  // guard `if (!dom.xxx) return;`, lalu panggil di init() di bawah.
  // initScrollReveal() sengaja tidak dipanggil di sini; ia dipicu setelah
  // sampul dibuka (bagian 4).
  //
  // initVideoTeaser() TIDAK dipanggil lagi: video sekarang iframe YouTube
  // tanpa kontrol JS kustom (lihat catatan Bagian 10).
  // ==========================================================================

  function init() {
    initGuestName();       // bagian 4
    initOpeningCurtain();  // bagian 4
    initCountdown();       // bagian 6
    initAddToCalendar();   // bagian 7
    initGallerySlider();   // bagian 9 (juga memanggil initLightbox() di dalamnya)
    initAudioController(); // bagian 11
    initGiftToggle();      // bagian 12 (buka/tutup amplop digital)
    initCopyButtons();     // bagian 12
    initGuestbookForm();   // bagian 13 (form Guestbook + feed Google Sheets)

    // Jika halaman sudah `is-unlocked` saat dimuat (mis. testing tanpa sampul),
    // jalankan scroll-reveal langsung.
    if (dom.body.classList.contains('is-unlocked')) {
      initScrollReveal();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();