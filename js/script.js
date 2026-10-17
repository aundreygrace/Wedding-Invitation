/* ==========================================================================
   WEDDING INVITATION — ARYA & SEKAR
   Vanilla JS (ES6+) — refactored from Google Stitch prototype
   All interaction logic is centralized in this single file.
   ========================================================================== */

   (function () {
    'use strict';
  
    // ==========================================================================
    // WEDDING DATA
    // ==========================================================================
    const weddingData = {
      couple: {
        groom: { name: 'Arya Wicaksana', instagram: '@aryawicaksana' },
        bride: { name: 'Sekar Arum', instagram: '@sekararum' },
      },
      date: {
        // ISO datetime used by the live countdown (Akad Nikah start time, WIB / UTC+7)
        targetISO: '2026-12-24T08:00:00+07:00',
        // ISO datetime when the countdown switches from the wedding prayer to the thank-you message (WIB / UTC+7)
        thankYouISO: '2026-12-24T14:00:00+07:00',
        displayLabel: 'Kamis, 24 Desember 2026',
      },
      messages: {
        doa: 'Bismillahirrahmanirrahim. Semoga Allah SWT melimpahkan keberkahan dalam ikatan suci Arya dan Sekar, menjadikan rumah tangga yang sakinah, mawaddah, warahmah, serta senantiasa dipenuhi cinta, kesabaran, dan kebahagiaan.',
        thanks: 'Terima kasih atas doa, restu, dan kebahagiaan yang telah Anda bagikan kepada Arya dan Sekar. Semoga kebaikan senantiasa menyertai kita semua.',
      },
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
      location: {
        name: 'The Sunan Hotel Solo',
        address: 'Jl. A. Yani No.40, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Sunan%20Hotel%20Solo%2C%20Jl.%20A.%20Yani%20No.40%2C%20Kerten%2C%20Laweyan%2C%20Surakarta%2C%20Jawa%20Tengah',
      },
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
    // DOM REFERENCES
    // ==========================================================================
    const dom = {
      body: document.body,
      curtain: document.getElementById('theatrical-curtain'),
      btnOpen: document.getElementById('btn-open-invitation'),
      wayangLeft: document.getElementById('curtain-wayang-left'),
      wayangRight: document.getElementById('curtain-wayang-right'),
      curtainContent: document.getElementById('curtain-center-content'),
      guestNameEl: document.getElementById('invitation-guest-name'),
  
      audioBtn: document.getElementById('audio-controller-btn'),
      audioEl: document.getElementById('gamelan-audio'),
  
      toast: document.getElementById('toast-notification'),
      toastMessage: document.getElementById('toast-message'),
  
      countdownTimer: document.getElementById('countdown-timer'),
      countdownMessage: document.getElementById('countdown-message'),
      timerDays: document.getElementById('timer-days'),
      timerHours: document.getElementById('timer-hours'),
      timerMinutes: document.getElementById('timer-minutes'),
      timerSeconds: document.getElementById('timer-seconds'),
      btnAddCalendar: document.getElementById('btn-add-calendar'),
  
      lightbox: document.getElementById('gallery-lightbox'),
      lightboxImg: document.getElementById('lightbox-img'),
      lightboxClose: document.getElementById('lightbox-close'),
  
      videoPlayer: document.getElementById('video-player'),
      btnPlayVideo: document.getElementById('btn-play-video'),
      teaserVideo: document.getElementById('teaser-video'),
  
      rsvpForm: document.getElementById('rsvp-form'),
      wishesContainer: document.getElementById('wishes-container'),
    };
  
    // ==========================================================================
    // UTILITIES
    // ==========================================================================
  
    /** Pads a number to 2 digits, e.g. 7 -> "07" */
    function pad2(value) {
      return String(value).padStart(2, '0');
    }
  
    /** Shows a short-lived toast notification with the given message. */
    function showToast(message) {
      if (!dom.toast || !dom.toastMessage) return;
      dom.toastMessage.textContent = message;
      dom.toast.classList.add('is-visible');
      window.clearTimeout(showToast._timeoutId);
      showToast._timeoutId = window.setTimeout(() => {
        dom.toast.classList.remove('is-visible');
      }, 3000);
    }
  
    /** Copies text to the clipboard with a graceful fallback for older browsers. */
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
        /* Clipboard not available — silently ignore */
      }
      document.body.removeChild(el);
      showToast(message);
    }
  
    /** Builds initials (max 2 letters) from a guest name for avatar badges. */
    function getInitials(name) {
      return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
  
    // ==========================================================================
    // OPENING INVITATION (Theatrical Curtain)
    // ==========================================================================
  
    /** Reads ?to= or ?u= from the URL and personalizes the guest name on the curtain. */
    function initGuestName() {
      const params = new URLSearchParams(window.location.search);
      const guestParam = params.get('to') || params.get('u');
      if (guestParam && dom.guestNameEl) {
        dom.guestNameEl.textContent = decodeURIComponent(guestParam.replace(/\+/g, ' '));
      }
    }
  
    /** Wires the "Buka Undangan" button: animates the curtain open and unlocks scrolling. */
    function initOpeningCurtain() {
      if (!dom.btnOpen || !dom.curtain) return;
  
      dom.btnOpen.addEventListener('click', () => {
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
  
        window.setTimeout(() => {
          dom.curtain.style.opacity = '0';
          dom.curtain.style.pointerEvents = 'none';
        }, 500);
  
        window.setTimeout(() => {
          dom.curtain.style.display = 'none';
          dom.body.classList.add('is-unlocked');
          initScrollReveal();
          attemptAutoplayAudio();
        }, 1200);
      });
    }
  
    // ==========================================================================
    // SCROLL REVEAL
    // ==========================================================================
  
    /** Observes all .reveal-item elements and adds .is-revealed as they enter the viewport. */
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
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );
  
      reveals.forEach((el) => observer.observe(el));
    }
  
    // ==========================================================================
    // COUNTDOWN
    // ==========================================================================
  
    let countdownIntervalId = null;
  
    /** Shows the numeric timer grid and hides the status message. */
    function showCountdownTimer() {
      if (dom.countdownTimer) dom.countdownTimer.style.display = '';
      if (dom.countdownMessage) dom.countdownMessage.style.display = 'none';
    }
  
    /** Hides the numeric timer grid and shows the given status message. */
    function showCountdownMessage(text) {
      if (dom.countdownTimer) dom.countdownTimer.style.display = 'none';
      if (dom.countdownMessage) {
        dom.countdownMessage.textContent = text;
        dom.countdownMessage.style.display = '';
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
      const now = typeof nowOverride === 'number' ? nowOverride : Date.now();
      const akadStart = new Date(weddingData.date.targetISO).getTime();
      const thankYouStart = new Date(weddingData.date.thankYouISO).getTime();
  
      // Kondisi 1 — sebelum pukul 08.00 WIB: tampilkan countdown menuju acara.
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
  
      // Kondisi 2 — pukul 08.00 s.d. sebelum 14.00 WIB: tampilkan doa pernikahan.
      if (now < thankYouStart) {
        showCountdownMessage(weddingData.messages.doa);
        return 'doa';
      }
  
      // Kondisi 3 — mulai pukul 14.00 WIB dan seterusnya: tampilkan ucapan terima kasih.
      showCountdownMessage(weddingData.messages.thanks);
      return 'thanks';
    }
  
    /** Starts the live countdown loop, guarding against duplicate intervals. */
    function initCountdown() {
      // Pastikan tidak ada interval ganda jika initCountdown terpanggil lebih dari sekali.
      if (countdownIntervalId !== null) {
        window.clearInterval(countdownIntervalId);
        countdownIntervalId = null;
      }
  
      const phase = updateCountdown();
  
      // Fase 'thanks' bersifat permanen (tidak akan berubah lagi), jadi interval
      // tidak perlu dijalankan terus-menerus.
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
    // EVENT & CALENDAR
    // ==========================================================================
  
    /** Creates a Google Calendar event with the full schedule, dress codes, and map link. */
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
    // MAPS
    // ==========================================================================
    // The location section uses a responsive Google Maps iframe in index.html.
    // The calendar description also includes a Google Maps search/directions link.
  
    // ==========================================================================
    // GALLERY & LIGHTBOX
    // ==========================================================================
  
    /** Opens the lightbox modal showing the full-size image for a gallery item. */
    function openLightbox(src) {
      if (!dom.lightbox || !dom.lightboxImg) return;
      dom.lightboxImg.src = src;
      dom.lightbox.classList.add('is-open');
    }
  
    function closeLightbox() {
      if (!dom.lightbox) return;
      dom.lightbox.classList.remove('is-open');
    }
  
    function initGallery() {
      const items = document.querySelectorAll('[data-lightbox-src]');
      items.forEach((item) => {
        item.addEventListener('click', () => {
          openLightbox(item.getAttribute('data-lightbox-src'));
        });
      });
  
      if (dom.lightboxClose) {
        dom.lightboxClose.addEventListener('click', closeLightbox);
      }
      if (dom.lightbox) {
        dom.lightbox.addEventListener('click', (event) => {
          if (event.target === dom.lightbox) closeLightbox();
        });
      }
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeLightbox();
      });
    }
  
    // ==========================================================================
    // VIDEO & STREAMING
    // ==========================================================================
  
    /** Swaps the poster/play-button for the actual <video> element and starts playback. */
    function initVideoTeaser() {
      if (!dom.btnPlayVideo || !dom.videoPlayer || !dom.teaserVideo) return;
  
      dom.btnPlayVideo.addEventListener('click', () => {
        dom.videoPlayer.classList.add('is-playing');
        dom.teaserVideo.hidden = false;
        dom.teaserVideo.play().catch(() => {
          /* Autoplay with sound may be blocked by the browser — user can press play manually */
        });
      });
    }
    // Live streaming "Tonton Siaran" button uses a plain external link
    // (weddingData.streaming.url) already set as the anchor's href.
  
    // ==========================================================================
    // AUDIO
    // ==========================================================================
  
    let isAudioPlaying = false;
  
    function attemptAutoplayAudio() {
      if (!dom.audioEl) return;
      dom.audioEl
        .play()
        .then(() => {
          isAudioPlaying = true;
          updateAudioButtonState();
        })
        .catch(() => {
          // Autoplay blocked — guest can start the gending manually.
          isAudioPlaying = false;
          updateAudioButtonState();
        });
    }
  
    function updateAudioButtonState() {
      if (!dom.audioBtn) return;
      dom.audioBtn.setAttribute('aria-pressed', String(isAudioPlaying));
    }
  
    function initAudioController() {
      if (!dom.audioBtn || !dom.audioEl) return;
  
      dom.audioBtn.addEventListener('click', () => {
        if (isAudioPlaying) {
          dom.audioEl.pause();
          isAudioPlaying = false;
        } else {
          dom.audioEl.play().catch(() => {
            /* Playback requires a local audio file at assets/audio/KeboGiro.mp3 */
          });
          isAudioPlaying = true;
        }
        updateAudioButtonState();
      });
    }
  
    // ==========================================================================
    // DIGITAL GIFT
    // ==========================================================================
  
    /** Wires every [data-copy-value] button to copy its value with a toast confirmation. */
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
    // RSVP
    // ==========================================================================
  
    /** Handles RSVP form submission: validates, prepends a new wish card, resets the form. */
    function handleRsvpSubmit(event) {
      event.preventDefault();
  
      const nameInput = document.getElementById('rsvp-name');
      const wishesInput = document.getElementById('rsvp-wishes');
      const attendanceChoice = document.querySelector('input[name="attendance"]:checked');
  
      if (!nameInput || !nameInput.value.trim()) {
        nameInput && nameInput.focus();
        return;
      }
  
      const name = nameInput.value.trim();
      const wishes = wishesInput && wishesInput.value.trim()
        ? wishesInput.value.trim()
        : 'Mugi tansah pinaringan berkah lan karahayon.';
      const attendance = attendanceChoice ? attendanceChoice.value : 'Hadir';
  
      addWishCard({ name, wishes, attendance });
      showToast('Matur nuwun! Konfirmasi kehadiran Panjenengan sampun katampi.');
      event.target.reset();
    }
  
    function initRsvpForm() {
      if (!dom.rsvpForm) return;
      dom.rsvpForm.addEventListener('submit', handleRsvpSubmit);
    }
  
    // ==========================================================================
    // WISHES (Guestbook)
    // ==========================================================================
  
    /** Creates and prepends a new guestbook wish card with an entrance animation. */
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
  
    /** Minimal HTML escaping to keep user-submitted guestbook text safe. */
    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  
    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
  
    function init() {
      initGuestName();
      initOpeningCurtain();
      initCountdown();
      initAddToCalendar();
      initGallery();
      initVideoTeaser();
      initAudioController();
      initCopyButtons();
      initRsvpForm();
  
      // If the page loads already unlocked (e.g. direct scroll/testing), reveal immediately.
      if (dom.body.classList.contains('is-unlocked')) {
        initScrollReveal();
      }
    }
  
    document.addEventListener('DOMContentLoaded', init);
  })();
  