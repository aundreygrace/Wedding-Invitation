// ================================================================
// WEDDING_CONFIG — SINGLE SOURCE OF TRUTH
// Seluruh teks, URL, dan daftar yang tampil di index.html diambil dari
// objek ini oleh mesin injeksi (hydrateConfig) di js/script.js. Ubah
// data pernikahan HANYA di sini — jangan edit index.html/script.js.
//
// Peta domain data (urutan sesuai kemunculan di bawah):
//   site            -> metadata halaman (title, description, lang, theme)
//   guestbookApiUrl -> endpoint Apps Script untuk fitur buku tamu
//   couple          -> data mempelai pria & wanita
//   date            -> tanggal & waktu acara (termasuk format ICS/Calendar)
//   assets          -> font, audio, ornamen gambar
//   messages        -> teks UI umum (tirai pembuka, toast, dsb)
//   intro           -> kutipan ayat pembuka
//   events          -> detail acara akad & resepsi
//   location        -> peta, alamat, tata tertib
//   story           -> timeline kisah cinta (list)
//   gallery         -> foto pre-wedding (list)
//   gift            -> amplop digital (rekening bank, alamat fisik)
//   wishes          -> teks form & status buku tamu
//   closing         -> teks penutup/footer
//   nav             -> item navigasi bawah (list)
// ================================================================
(function () {
  window.WEDDING_CONFIG = {

    // --------------------------------------------------------------
    // SUB-BOUNDARY: site — metadata <head> (title, description, lang, theme-color)
    // --------------------------------------------------------------
    site: {
      title: 'Undangan Pernikahan - Arya & Sekar',
      description: 'Undangan Pernikahan Adat Jawa - Arya Wicaksana & Sekar Arum, Kamis 24 Desember 2026',
      language: 'id',
      locale: 'id-ID',
      themeColor: '#1a0f07',
    },
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: site
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: guestbookApiUrl — endpoint Google Apps Script (GET/POST ucapan)
    // --------------------------------------------------------------
    guestbookApiUrl: 'https://script.google.com/macros/s/AKfycbyAu49rv8f2iRYlBb2OASWzKrGfiTKgY4kpkFPOJCI-o03Qbu2pAeYYkTQbjkCPv76M/exec',
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: guestbookApiUrl
    // --------------------------------------------------------------

    // ================================================================
    // DATA BOUNDARY: couple — data mempelai (section #couple, #hero, curtain, closing)
    // ================================================================
    couple: {
      sectionEyebrow: 'Pinanganten Sarimbit',
      sectionTitle: 'Sang Mempelai',

      // ------------------------------------------------------------
      // SUB-BOUNDARY: couple.groom — mempelai pria
      // ------------------------------------------------------------
      groom: {
        shortName: 'Arya',
        name: 'Arya Wicaksana',
        instagram: '@aryawicaksana',
        instagramUrl: 'https://instagram.com/aryawicaksana',
        photo: 'assets/images/Pria.png',
        father: 'Bpk. Surya Hadiningrat',
        mother: 'Ibu Endang Puspitasari',
        parentRole: 'Putra pertama dari pasangan',
        role: 'Mempelai Pria',
      },
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: couple.groom
      // ------------------------------------------------------------

      // ------------------------------------------------------------
      // SUB-BOUNDARY: couple.bride — mempelai wanita
      // ------------------------------------------------------------
      bride: {
        shortName: 'Sekar',
        name: 'Sekar Arum',
        instagram: '@sekararum',
        instagramUrl: 'https://instagram.com/sekararum',
        photo: 'assets/images/Wanita.png',
        father: 'Bpk. Bambang Pranoto',
        mother: 'Ibu Sri Wardhani',
        parentRole: 'Putri kedua dari pasangan',
        role: 'Mempelai Wanita',
      },
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: couple.bride
      // ------------------------------------------------------------

      connector: '&',
    },
    // ================================================================
    // END DATA BOUNDARY: couple
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: date — tanggal & waktu acara (hero, events, kalender)
    // ================================================================
    date: {
      displayLabel: 'Kamis, 24 Desember 2026',
      targetISO: '2026-12-24T08:00:00+07:00',
      thankYouISO: '2026-12-24T14:00:00+07:00',
      calendarStart: '20261224T080000',
      calendarEnd: '20261224T140000',
      year: '2026',
      locationLabel: 'Kota Surakarta, Jawa Tengah',
    },
    // ================================================================
    // END DATA BOUNDARY: date
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: assets — font, audio, ornamen gambar
    // ================================================================
    assets: {

      // ------------------------------------------------------------
      // SUB-BOUNDARY: assets.fonts — stylesheet Google Fonts
      // ------------------------------------------------------------
      fonts: {
        google: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
        material: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
      },
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: assets.fonts
      // ------------------------------------------------------------

      // ------------------------------------------------------------
      // SUB-BOUNDARY: assets.audio — musik latar gamelan (audio widget)
      // ------------------------------------------------------------
      audio: {
        src: 'assets/audio/Kebo Giro.mp3',
        title: 'Kebo Giro',
      },
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: assets.audio
      // ------------------------------------------------------------

      // ------------------------------------------------------------
      // SUB-BOUNDARY: assets.ornaments — ilustrasi dekoratif (wayang, gunungan, dll)
      // ------------------------------------------------------------
      ornaments: {
        wayangLeft: 'assets/ornaments/01_wayang-left.png',
        wayangRight: 'assets/ornaments/02_wayang-right.png',
        gunungan: 'assets/ornaments/03_gunungan.png',
        pendopo: 'assets/ornaments/04_pendopo.png',
        cloudBack: 'assets/ornaments/05_cloud-back.png',
        cloudFront: 'assets/ornaments/06_cloud-front.png',
        corner: 'assets/ornaments/07_ornament-corner.png',
        decorativeFrame: 'assets/ornaments/10_decorative-frame.png',
      },
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: assets.ornaments
      // ------------------------------------------------------------

    },
    // ================================================================
    // END DATA BOUNDARY: assets
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: messages — teks UI umum (curtain, audio widget, toast, nav)
    // ================================================================
    messages: {
      invitationEyebrow: 'Undangan Pernikahan',
      guestLabel: 'Kepada Yth. Bapak/Ibu/Saudara/i:',
      guestDefault: 'Tamu Undangan',
      guestNote: 'Dengan hormat, kami memohon doa dan restu untuk pernikahan kami.',
      openButton: 'Buka Undangan',
      audioWidgetAria: 'Pemutar Musik Gamelan',
      audioPlayAria: 'Putar Musik Latar',
      audioPauseAria: 'Jeda Musik Latar',
      gendingLabel: 'Gending',
      doa: 'Bismillahirrahmanirrahim. Semoga Allah SWT melimpahkan keberkahan dalam ikatan suci Arya dan Sekar, menjadikan rumah tangga yang sakinah, mawaddah, warahmah, serta senantiasa dipenuhi cinta, kesabaran, dan kebahagiaan.',
      thanks: 'Terima kasih atas doa, restu, dan kebahagiaan yang telah Anda bagikan kepada Arya dan Sekar. Semoga kebaikan senantiasa menyertai kita semua.',
      fallbackToast: 'Nomor rekening berhasil disalin!',
      navAria: 'Navigasi Undangan',
      copyFallback: 'Berhasil disalin!',
      audioError: 'File audio tidak dapat diputar.',
    },
    // ================================================================
    // END DATA BOUNDARY: messages
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: intro — kutipan ayat pembuka (section #intro-doa)
    // ================================================================
    intro: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      reference: 'QS. Ar-Rum : 21',
      quote: '"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir."',
    },
    // ================================================================
    // END DATA BOUNDARY: intro
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: events — detail acara akad & resepsi (section #events)
    // ================================================================
    events: {
      eyebrow: 'Rangkaian Pernikahan',
      title: 'Susunan Acara',

      // ------------------------------------------------------------
      // SUB-BOUNDARY: events.akad — Ijab Qabul & Upacara Panggih
      // ------------------------------------------------------------
      akad: {
        tag: 'Akad Nikah',
        title: 'Ijab Qabul & Upacara Panggih',
        description: 'Prosesi Ijab Qabul dilanjutkan dengan Upacara Panggih, yaitu tradisi pertemuan kedua pengantin dalam adat Jawa gaya Surakarta Hadiningrat.',
        time: '08.00 - 10.00 WIB',
        date: 'Kamis, 24 Desember 2026',
        venue: 'The Sunan Hotel Solo',
        address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
      },
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: events.akad
      // ------------------------------------------------------------

      // ------------------------------------------------------------
      // SUB-BOUNDARY: events.resepsi — Resepsi Pernikahan
      // ------------------------------------------------------------
      resepsi: {
        tag: 'Resepsi Pernikahan',
        title: 'Resepsi Pernikahan',
        description: 'Acara resepsi akan diiringi musik gamelan Jawa untuk menghadirkan suasana tradisional yang hangat. Kehadiran Anda akan menjadi kebahagiaan bagi kedua keluarga.',
        time: '11.00 - 14.00 WIB',
        date: 'Kamis, 24 Desember 2026',
        venue: 'The Sunan Hotel Solo',
        address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
      },
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: events.resepsi
      // ------------------------------------------------------------

      saveCalendar: 'Simpan ke Kalender',
      calendarTitle: 'Upacara Pernikahan - Arya & Sekar',
      dresscodeLabel: 'Panduan Busana / Dresscode:',
      akadDresscode: 'Beskap Jawi Jangkep / Kebaya Tradisional Sogan',
      resepsiDresscode: 'Batik Formal Klasik / Kebaya Modern Nuansa Emas',

      // ------------------------------------------------------------
      // SUB-BOUNDARY: events.calendar — teks untuk tombol "Simpan ke Kalender"
      // (dikonsumsi oleh initAddToCalendar() di js/script.js, bukan
      //  di-render langsung ke DOM index.html)
      // ------------------------------------------------------------
      calendar: {
        timezone: 'Asia/Jakarta',
        heading: 'UNDANGAN PERNIKAHAN',
        scheduleHeading: 'RANGKAIAN ACARA',
        dresscodeHeading: 'DRESSCODE',
        akadDresscodeLabel: 'Akad / Upacara Panggih',
        resepsiDresscodeLabel: 'Resepsi',
        locationHeading: 'LOKASI',
        mapHeading: 'PETA & PETUNJUK ARAH',
        closing: 'Terima kasih. Kami menantikan kehadiran Anda untuk berbagi kebahagiaan bersama.',
      },
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: events.calendar
      // ------------------------------------------------------------

    },
    // ================================================================
    // END DATA BOUNDARY: events
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: location — peta, alamat, tata tertib (section #location)
    // ================================================================
    location: {
      eyebrow: 'Papan Palenggahan',
      title: 'Peta Lokasi & Panduan Rawuh',
      name: 'The Sunan Hotel Solo',
      address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
      footerAddress: 'The Sunan Hotel Solo · Jl. A. Yani No.40, Kerten, Laweyan, Surakarta',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.1616372038525!2d110.7918014737216!3d-7.5573482746236555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a15ef245206f7%3A0x64364a80ce0f7e2a!2sThe%20Sunan%20Hotel%20Solo!5e0!3m2!1sid!2sid!4v1791874077925!5m2!1sid!2sid',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Sunan%20Hotel%20Solo%2C%20Jl.%20A.%20Yani%20No.40%2C%20Kerten%2C%20Laweyan%2C%20Surakarta%2C%20Jawa%20Tengah',
      directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=The%20Sunan%20Hotel%20Solo%2C%20Jl.%20A.%20Yani%20No.40%2C%20Kerten%2C%20Kec.%20Laweyan%2C%20Kota%20Surakarta%2C%20Jawa%20Tengah&travelmode=driving',
      directionsLabel: 'Buka Rute di Google Maps ↗',
      mapTitle: 'Rute Google Maps menuju The Sunan Hotel Solo',
      rulesTitle: 'Tata Tertib Tamu',

      // ------------------------------------------------------------
      // SUB-BOUNDARY: location.rules — JS-RENDERED LIST
      // Target: ul[data-config-list="location.rules"] di index.html,
      // di-render oleh hydrateConfig() di js/script.js
      // ------------------------------------------------------------
      rules: [
        'Hadir 15 menit sebelum acara dimulai demi kekhidmatan prosesi kirab penganten.',
        'Mengenakan busana yang rapi sesuai tata krama adat dan panduan nuansa busana.',
        'Menjaga ketenangan dan kekhusyukan saat prosesi sakral berlangsung.',
      ],
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: location.rules
      // ------------------------------------------------------------

      contactLabel: 'Narahubung Acara:',
      contact: 'Danang Wisesa (+62 812-3456-7890)',
    },
    // ================================================================
    // END DATA BOUNDARY: location
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: story — timeline kisah cinta (section #story)
    // JS-RENDERED LIST — di-render oleh hydrateConfig() dari story.items[]
    // ke ol[data-config-story] di index.html
    // ================================================================
    story: {
      eyebrow: 'Lelampahan Tresna',
      title: 'Kisah Cinta Arya & Sekar',
      timelineAria: 'Lini masa perjalanan kisah cinta Arya dan Sekar secara kronologis',
      photoPlaceholderIcon: 'add_a_photo',

      // ------------------------------------------------------------
      // SUB-BOUNDARY: story.items — urutan kronologis, index genap tampil
      // di sisi kanan timeline (lihat logic isRight di hydrateConfig())
      // ------------------------------------------------------------
      items: [
        { icon: 'favorite', dateTime: '2020-05', date: 'Mei 2020', title: 'Pertemuan Pertama', description: 'Kisah kami dimulai saat bekerja bersama dalam pementasan Sendratari Ramayana di Prambanan. Dari pertemuan sederhana itu, tumbuh rasa yang membawa kami semakin dekat.', image: 'assets/images/story-pertemuan-1.png', alt: 'Dokumentasi momen pertemuan pertama Arya dan Sekar' },
        { icon: 'handshake', dateTime: '2025-05', date: 'Mei 2025', title: 'Menjalin Komitmen', description: 'Setelah berdiskusi bersama, kami memohon doa dan restu orang tua untuk melangkah ke tahap hubungan yang lebih serius dan membangun kehidupan bersama.', image: 'assets/images/story-pertemuan-2.png', alt: 'Dokumentasi momen menjalin komitmen Arya dan Sekar bersama restu keluarga' },
        { icon: 'ring_volume', dateTime: '2026-10', date: 'Oktober 2026', title: 'Lamaran (The Engagement)', description: 'Kami melangsungkan prosesi lamaran dengan tradisi Jawa. Penyerahan tanda pengikat menjadi simbol kesungguhan dan komitmen kedua keluarga untuk menyatukan kami.', image: 'assets/images/story-pertemuan-3.png', alt: 'Dokumentasi prosesi lamaran adat Jawa Arya dan Sekar' },
        { icon: 'church', dateTime: '2026-12', date: 'Desember 2026', title: 'Hari Pernikahan', description: 'Hari yang kami nantikan: mengikat janji sebagai pasangan hidup di hadapan Tuhan dan keluarga, dengan harapan membangun rumah tangga yang penuh kasih dan keberkahan.', image: 'assets/images/story-pertemuan-4.png', alt: 'Dokumentasi hari pernikahan Arya dan Sekar' },
      ],
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: story.items
      // ------------------------------------------------------------

    },
    // ================================================================
    // END DATA BOUNDARY: story
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: gallery — foto pre-wedding (section #gallery + lightbox)
    // JS-RENDERED LIST — di-render oleh hydrateConfig() dari gallery.images[]
    // ke [data-config-gallery] di index.html
    // ================================================================
    gallery: {
      eyebrow: 'Memori & Potret',
      title: 'Galeri Kenangan',
      ariaLabel: 'Galeri foto pre-wedding — geser atau gunakan tombol panah untuk melihat foto lain',
      caption: 'Pre Wedding Arya - Sekar',
      alt: 'Potret Arya-Sekar',
      prevAria: 'Foto sebelumnya',
      nextAria: 'Foto berikutnya',
      dotsAria: 'Pilih foto galeri',
      lightboxAria: 'Pratinjau foto galeri',
      closeAria: 'Tutup Lightbox',
      previewAlt: 'Pratinjau foto galeri',
      zoomAriaPrefix: 'Perbesar foto:',
      statusMultiple: 'Foto',
      statusOf: 'dari',
      statusRangePrefix: 'Lihat foto',
      statusRangeMiddle: 'sampai',

      // ------------------------------------------------------------
      // SUB-BOUNDARY: gallery.images — path foto, urutan sesuai tampil di slider
      // ------------------------------------------------------------
      images: [
        'assets/images/gallery-01.png',
        'assets/images/gallery-02.png',
        'assets/images/gallery-03.png',
        'assets/images/gallery-04.png',
        'assets/images/gallery-05.png',
      ],
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: gallery.images
      // ------------------------------------------------------------

    },
    // ================================================================
    // END DATA BOUNDARY: gallery
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: gift — amplop digital (section #gift)
    // ================================================================
    gift: {
      eyebrow: 'Kado & Tanda Kasih',
      title: 'Amplop Digital',
      lead: 'Doa dan restu Anda merupakan kebahagiaan yang sangat berarti bagi kami. Namun, apabila Anda berkenan memberikan tanda kasih, dapat disampaikan melalui rekening atau alamat berikut.',
      openButton: 'Buka Amplop Digital',
      closeButton: 'Tutup Amplop Digital',
      copyLabel: 'Salin Nomor Rekening',
      copyAddressLabel: 'Salin Alamat',
      copiedLabel: 'Tersalin!',
      accountLabel: 'Nomor Rekening',
      accountPrefix: 'a.n.',
      bankAriaPrefix: 'Salin nomor rekening',

      // ------------------------------------------------------------
      // SUB-BOUNDARY: gift.banks — JS-RENDERED LIST
      // Target: [data-config-banks] di index.html, di-render oleh
      // hydrateConfig() di js/script.js
      // ------------------------------------------------------------
      banks: [
        { bank: 'BANK BCA', formattedNumber: '8830 5291 44', value: '8830529144', owner: 'Arya Wicaksana', successMessage: 'Nomor rekening BCA berhasil disalin!' },
        { bank: 'BANK MANDIRI', formattedNumber: '138 00 9482711 0', value: '1380094827110', owner: 'Sekar Arum', successMessage: 'Nomor rekening Mandiri berhasil disalin!' },
      ],
      // ------------------------------------------------------------
      // END SUB-BOUNDARY: gift.banks
      // ------------------------------------------------------------

      physicalLabel: 'Pengiriman Kado Fisik',
      addressTitle: 'Kediaman Arya & Sekar',
      address: 'Jl. Slamet Riyadi No. 240, Laweyan, Surakarta, Jawa Tengah (57141)',
      addressCopyValue: 'Kediaman Arya & Sekar, Jl. Slamet Riyadi No. 240, Laweyan, Surakarta, Jawa Tengah (57141)',
      addressCopyMessage: 'Alamat pengiriman kado berhasil disalin!',
      addressAria: 'Salin alamat pengiriman kado',
    },
    // ================================================================
    // END DATA BOUNDARY: gift
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: wishes — teks form & status buku tamu (section #wishes)
    // CATATAN: isi daftar ucapan sendiri BUKAN dari sini — itu data
    // eksternal hasil fetch() ke guestbookApiUrl (lihat renderGuestbookEntries
    // di js/script.js). Blok ini hanya label/teks statis form & pesan status.
    // ================================================================
    wishes: {
      eyebrow: 'Untaian Doa Restu',
      title: 'Buku Tamu & Doa',
      lead: 'Dengan penuh rasa hormat dan bahagia, kami mengundang Anda untuk menyampaikan doa, ucapan selamat, serta konfirmasi kehadiran melalui formulir di bawah ini.',
      nameLabel: 'Nama Lengkap',
      namePlaceholder: 'Contoh: Bagus Santoso',
      attendanceLabel: 'Konfirmasi Kehadiran',
      attending: 'Hadir',
      notAttending: 'Tidak Hadir',
      messageLabel: 'Doa & Ucapan Selamat',
      messagePlaceholder: 'Tuliskan untaian doa dan ucapan selamat untuk kedua mempelai...',
      submit: 'Kirim Ucapan',
      loading: 'Sedang mengirim...',
      empty: 'Belum ada ucapan. Jadilah yang pertama menyampaikan doa dan ucapan!',
      success: 'Terima kasih! Ucapan dan doa Anda telah berhasil kami terima.',
      loadError: 'Gagal mengambil ucapan dari server. Silakan muat ulang halaman ini.',
      connectionError: 'Gagal terhubung ke server. Silakan periksa koneksi internet Anda.',
      submitError: 'Gagal mengirim ucapan. Silakan coba kembali.',
      serverNotConfigured: 'Guestbook belum terhubung ke server. Konfigurasi guestbookApiUrl di js/config.js.',
      defaultGuest: 'Tamu Undangan',
      defaultAttendance: 'Hadir',
      listAria: 'Daftar ucapan tamu',
    },
    // ================================================================
    // END DATA BOUNDARY: wishes
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: closing — teks penutup / footer (section #closing)
    // ================================================================
    closing: {
      title: 'Terima Kasih',
      lead: 'Terima kasih atas perhatian, doa, dan ucapan yang telah Anda berikan. Kehadiran dan doa restu Anda menjadi kebahagiaan serta kenangan berharga bagi kami.',
      salam: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
      dua: 'Semoga Kebahagiaan Menyertai Kita Semua',
      groomFamilyLabel: 'Keluarga Mempelai Pria:',
      brideFamilyLabel: 'Keluarga Mempelai Wanita:',
    },
    // ================================================================
    // END DATA BOUNDARY: closing
    // ================================================================

    // ================================================================
    // DATA BOUNDARY: nav — item navigasi bawah (komponen Bottom Navigation)
    // JS-RENDERED LIST — di-render oleh hydrateConfig() dari nav[]
    // ke [data-config-nav] di index.html
    // ================================================================
    nav: [
      { section: 'couple', icon: 'favorite', label: 'Mempelai' },
      { section: 'events', icon: 'event', label: 'Acara' },
      { section: 'location', icon: 'location_on', label: 'Lokasi' },
      { section: 'story', icon: 'auto_stories', label: 'Kisah' },
      { section: 'gallery', icon: 'photo_library', label: 'Galeri' },
      { section: 'gift', icon: 'card_giftcard', label: 'Amplop' },
      { section: 'wishes', icon: 'edit_note', label: 'Ucapan' },
    ],
    // ================================================================
    // END DATA BOUNDARY: nav
    // ================================================================

  };
})();