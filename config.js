/* ==========================================================================
   WEDDING CONFIG
   Semua data spesifik pernikahan ada di sini. Ubah data di file ini saja,
   tidak perlu menyentuh HTML/CSS/JS lain.

   - Nilai dari design.md (section 15.4) dipakai apa adanya.
   - Nilai "" (kosong) atau "TODO" = belum tersedia. Fitur terkait harus
     menampilkan fallback yang rapi, bukan error.
   - File ini dimuat sebagai script biasa (BUKAN ES module) sebelum script.js,
     supaya website tetap bisa dibuka langsung lewat file:// tanpa server.
   ========================================================================== */

const weddingConfig = {
    title: "Pawiwahan Ageng Arya & Sekar",

    groom: {
        nickname: "Arya",
        fullName: "Arya Wicaksana",
        parents: "Bpk. Surya Hadiningrat & Ibu Endang Puspitasari",
        instagram: "",
        photo: ""        // contoh: "assets/images/groom.webp"
    },

    bride: {
        nickname: "Sekar",
        fullName: "Sekar Arum",
        parents: "Bpk. Bambang Pranoto & Ibu Sri Wardhani",
        instagram: "",
        photo: ""        // contoh: "assets/images/bride.webp"
    },

    // Acara utama. Dipakai untuk countdown, Add to Calendar, dan section Lokasi.
    ceremony: {
        dateIso: "2024-10-28T08:00:00+07:00",
        displayDate: "Sabtu Kliwon, 28 Oktober 2024",
        venue: "Ballroom Sasana Kencana",
        address: "Jl. Slamet Riyadi No. 240, Laweyan, Surakarta, Jawa Tengah",
        googleMapsUrl: "",
        wazeUrl: ""
    },

    // Kartu acara di section "Wedding Events".
    // TODO: waktu & keterangan belum ada di design.md - isi sesuai data asli.
    events: [
        {
            id: "akad",
            title: "Akad Nikah",
            dateIso: "2024-10-28T08:00:00+07:00",
            displayTime: "TODO",
            venue: "Ballroom Sasana Kencana",
            note: ""
        },
        {
            id: "resepsi",
            title: "Resepsi",
            dateIso: "",
            displayTime: "TODO",
            venue: "Ballroom Sasana Kencana",
            note: ""
        }
    ],

    // Live streaming. Kosongkan url jika belum aktif -> tampil pesan fallback.
    streaming: {
        url: "",
        platform: "",
        note: ""
    },

    // Love story (urutan kronologis). TODO: isi cerita asli.
    loveStory: [
        { year: "TODO", title: "Pertemuan", text: "" },
        { year: "TODO", title: "Perjalanan", text: "" },
        { year: "TODO", title: "Lamaran", text: "" }
    ],

    // Galeri. Isi src dengan file di assets/images/. Kosong -> tampil placeholder.
    gallery: [
        // { src: "assets/images/gallery-01.webp", alt: "Deskripsi foto" }
    ],

    // Video. Kosongkan src -> tampil fallback.
    video: {
        src: "",         // contoh: "assets/video/prewedding.mp4"
        poster: "",      // contoh: "assets/images/video-poster.webp"
        title: "Video Pernikahan"
    },

    // Musik latar. Kosongkan src -> tombol musik disembunyikan / disabled.
    music: {
        src: "",         // contoh: "assets/audio/gamelan.mp3"
        title: "Musik latar"
    },

    bankAccounts: [
        {
            bank: "BCA",
            number: "8830529144",
            holder: "Arya Wicaksana"
        },
        {
            bank: "Mandiri",
            number: "1380094827110",
            holder: "Sekar Arum"
        }
    ],

    // Ucapan tamu. MOCK DATA - bukan data nyata, belum ada backend.
    // Diganti dengan data dari backend ketika sudah tersedia.
    wishes: [
        // { name: "Nama Tamu", message: "Ucapan...", date: "2024-10-01" }
    ],

    // Nama tamu default jika URL tidak membawa parameter ?to=Nama
    guest: {
        defaultName: "Bapak/Ibu/Saudara/i"
    },

    // RSVP. Belum ada backend: endpoint dikosongkan.
    rsvp: {
        endpoint: "",
        maxGuests: 5
    }
};
