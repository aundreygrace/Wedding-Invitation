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
     12. HADIAH DIGITAL       -> tombol salin rekening/alamat
     13. RSVP                 -> form konfirmasi kehadiran
     14. UCAPAN               -> kartu buku tamu
     15. INISIALISASI         -> init() dan entry point

   POLA PENULISAN:
     - initXxx()          : dipanggil sekali di init() untuk memasang listener.
     - Guard `if (!dom.xxx) return;` di awal fungsi membuat fitur aman
       dinonaktifkan: jika section HTML di-comment, fungsinya tidak error.

   MENGAKTIFKAN SECTION YANG DI-COMMENT DI index.html
   (Quote, Streaming, Gift, RSVP, Wishes):
     1. Hapus komentar HTML pada section terkait di index.html.
     2. script.js tidak perlu diubah; initXxx() sudah terdaftar di init().
     3. Khusus Gift/Streaming: uncomment juga data `streaming`/`gift`
        di bagian 1.

   CATATAN REVISI (Minggu 6 — Galeri Foto Interaktif & Sematan Video):
     - Section #gallery & #video SEKARANG AKTIF (sebelumnya nonaktif/di-comment).
     - Atas revisi pembimbing: galeri TIDAK ditampilkan sebagai grid yang
       menampilkan semua foto sekaligus, melainkan sebagai SLIDER/KARUSEL
       (satu foto tampil penuh per waktu, geser via tombol/swipe/keyboard).
       Lihat Bagian 9 -> initGallerySlider().
     - Lightbox (modal pembesar foto) tetap dipertahankan sesuai modul
       (TP-2): dibuka dari slide yang sedang aktif, lalu bisa navigasi
       Next/Prev/Close ke SEMUA foto galeri, didukung tombol & keyboard
       (Escape, ArrowLeft, ArrowRight). Lihat Bagian 9 -> initLightbox().
     - Video (TP-3) memakai <iframe> YouTube yang responsif (rasio 16:9),
       jadi TIDAK butuh logika JS play/pause custom lagi -> initVideoTeaser()
       dihapus dari init() (lihat catatan di Bagian 10).
   ========================================================================== */

(function () {
  'use strict';

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

    // Lokasi (dipakai initAddToCalendar, bagian 7)
    location: {
      name: 'The Sunan Hotel Solo',
      address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Sunan%20Hotel%20Solo%2C%20Jl.%20A.%20Yani%20No.40%2C%20Kerten%2C%20Laweyan%2C%20Surakarta%2C%20Jawa%20Tengah',
    },

    // NONAKTIF: uncomment bersamaan dengan section #streaming / #gift di HTML.
    // Di luar cakupan modul Minggu 6 (Galeri & Video), jadi tetap nonaktif.
    // gift.banks[].account harus sama dengan data-copy-value di tombol salin.
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

    // RSVP & ucapan (bagian 13-14)
    rsvpForm: document.getElementById('rsvp-form'),
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

  /** Salin teks ke clipboard (API modern, fallback ke fallbackCopy). */
  function copyToClipboard(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast(message))
        .catch(() => fallbackCopy(text, message));
    } else {
      fallbackCopy(text, message);
    }
  }

  /** Fallback salin untuk browser lama: textarea tersembunyi + execCommand. */
  function fallbackCopy(text, message) {
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
   *   1200 ms : sampul disembunyikan, scroll dibuka, scroll-reveal & audio dimulai
   */
  function initOpeningCurtain() {
    if (!dom.btnOpen || !dom.curtain) return;

    dom.btnOpen.addEventListener('click', () => {
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
        attemptAutoplayAudio(); // klik tombol dihitung sebagai interaksi pengguna
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

  /** Buat tombol-tombol dot (satu per foto) di dalam #gallery-dots. */
  function buildGalleryDots() {
    if (!dom.galleryDots) return;
    dom.galleryDots.innerHTML = '';

    galleryImages.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-slider__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Lihat foto ${index + 1} dari ${gallerySlideCount}`);
      dot.addEventListener('click', () => goToSlide(index));
      dom.galleryDots.appendChild(dot);
    });

    updateGalleryDots();
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
      dom.galleryStatus.textContent = `Foto ${currentSlideIndex + 1} dari ${gallerySlideCount}`;
    }
  }

  /**
   * Geser track ke slide ke-`index` (dibatasi 0..gallerySlideCount-1).
   * Dipakai tombol Prev/Next, dot, dan keyboard panah.
   */
  function goToSlide(index) {
    if (!dom.gallerySliderTrack || gallerySlideCount === 0) return;
    const clamped = Math.max(0, Math.min(index, gallerySlideCount - 1));
    const slide = dom.gallerySliderTrack.children[clamped];
    if (!slide) return;

    dom.gallerySliderTrack.scrollTo({
      left: slide.offsetLeft,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
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
      if (!dom.gallerySliderTrack) return;
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

      currentSlideIndex = closestIndex;
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
      }
    });
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

    // Swipe/sentuh TIDAK butuh JS tambahan: track memakai CSS
    // `overflow-x: auto; scroll-snap-type: x mandatory;` (lihat style.css
    // § Gallery Slider) sehingga browser menangani gesture sentuh secara
    // native di semua perangkat (Android, iOS, desktop trackpad, dst).
    dom.gallerySliderTrack.addEventListener('scroll', handleSliderScroll, { passive: true });

    initGalleryKeyboardNav();
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
  // 11. AUDIO
  // --------------------------------------------------------------------------
  // Musik gamelan latar. Tag <audio id="gamelan-audio"> saat ini di-comment
  // di HTML; butuh file assets/audio/KeboGiro.mp3 agar aktif.
  // ==========================================================================

  let isAudioPlaying = false; // status pemutaran audio

  /** Coba putar otomatis setelah "Buka Undangan" diklik. Jika diblokir, tamu putar manual. */
  function attemptAutoplayAudio() {
    if (!dom.audioEl) return;
    dom.audioEl
      .play()
      .then(() => {
        isAudioPlaying = true;
        updateAudioButtonState();
      })
      .catch(() => {
        isAudioPlaying = false;
        updateAudioButtonState();
      });
  }

  /** Sinkronkan aria-pressed tombol (juga dipakai CSS untuk animasi piringan). */
  function updateAudioButtonState() {
    if (!dom.audioBtn) return;
    dom.audioBtn.setAttribute('aria-pressed', String(isAudioPlaying));
  }

  /** Tombol audio: toggle play/pause. */
  function initAudioController() {
    if (!dom.audioBtn || !dom.audioEl) return;

    dom.audioBtn.addEventListener('click', () => {
      if (isAudioPlaying) {
        dom.audioEl.pause();
        isAudioPlaying = false;
      } else {
        dom.audioEl.play().catch(() => {
          /* File audio belum tersedia di assets/audio/KeboGiro.mp3 */
        });
        isAudioPlaying = true;
      }
      updateAudioButtonState();
    });
  }

  // ==========================================================================
  // 12. HADIAH DIGITAL
  // --------------------------------------------------------------------------
  // Section #gift (saat ini di-comment, di luar cakupan modul Minggu 6).
  // Berlaku untuk tombol apa pun dengan atribut data-copy-value="TEKS" dan
  // opsional data-copy-message="PESAN_TOAST".
  // ==========================================================================

  /** Pasang listener salin pada semua elemen [data-copy-value]. */
  function initCopyButtons() {
    const buttons = document.querySelectorAll('[data-copy-value]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-copy-value');
        const message = btn.getAttribute('data-copy-message') || 'Berhasil disalin!';
        copyToClipboard(value, message);
      });
    });
  }

  // ==========================================================================
  // 13. RSVP
  // --------------------------------------------------------------------------
  // Section #rsvp (saat ini di-comment, di luar cakupan modul Minggu 6).
  // PENTING: data TIDAK dikirim ke server; ucapan hilang saat halaman
  // di-refresh. Untuk penyimpanan permanen, kirim data ke backend (mis.
  // fetch ke Google Apps Script/Firebase) di handleRsvpSubmit().
  // ==========================================================================

  /**
   * Proses submit form RSVP: validasi nama, ambil ucapan & kehadiran,
   * tambah kartu ucapan, tampilkan toast, lalu reset form.
   */
  function handleRsvpSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById('rsvp-name');
    const wishesInput = document.getElementById('rsvp-wishes');
    const attendanceChoice = document.querySelector('input[name="attendance"]:checked');

    // Nama wajib diisi
    if (!nameInput || !nameInput.value.trim()) {
      nameInput && nameInput.focus();
      return;
    }

    const name = nameInput.value.trim();
    const wishes = wishesInput && wishesInput.value.trim()
      ? wishesInput.value.trim()
      : 'Mugi tansah pinaringan berkah lan karahayon.'; // ucapan default
    const attendance = attendanceChoice ? attendanceChoice.value : 'Hadir';

    addWishCard({ name, wishes, attendance });
    showToast('Matur nuwun! Konfirmasi kehadiran Panjenengan sampun katampi.');
    event.target.reset();
  }

  /** Pasang handler submit pada form RSVP. */
  function initRsvpForm() {
    if (!dom.rsvpForm) return;
    dom.rsvpForm.addEventListener('submit', handleRsvpSubmit);
  }

  // ==========================================================================
  // 14. UCAPAN (Buku Tamu)
  // --------------------------------------------------------------------------
  // Section #wishes (saat ini di-comment, di luar cakupan modul Minggu 6).
  // Kartu awal di HTML bersifat statis; fungsi di sini hanya menambah
  // kartu baru.
  // ==========================================================================

  /**
   * Buat kartu ucapan baru dan sisipkan di paling atas daftar.
   * Animasi masuk: mulai dari opacity 0 lalu diubah di frame berikutnya
   * (requestAnimationFrame) agar transisi terlihat.
   * Input pengguna di-escape lewat escapeHtml() untuk mencegah XSS.
   * @param {{name: string, wishes: string, attendance: string}} entry
   */
  function addWishCard({ name, wishes, attendance }) {
    if (!dom.wishesContainer) return;

    const card = document.createElement('article');
    card.className = 'wish-card';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    card.style.transition = 'opacity 500ms, transform 500ms';

    const initials = getInitials(name);

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

    dom.wishesContainer.prepend(card);

    window.requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
    });
  }

  /** Escape karakter HTML pada teks input pengguna (mis. "<b>" -> "&lt;b&gt;"). */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // 15. INISIALISASI
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
    initCopyButtons();     // bagian 12
    initRsvpForm();        // bagian 13

    // Jika halaman sudah `is-unlocked` saat dimuat (mis. testing tanpa sampul),
    // jalankan scroll-reveal langsung.
    if (dom.body.classList.contains('is-unlocked')) {
      initScrollReveal();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
