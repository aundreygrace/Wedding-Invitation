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
      displayLabel: 'Kamis, 24 Desember 2026',
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
      mapsUrl: 'https://www.google.com/travel/hotels/s/Rn5Upw9oC81uKAGQ9'
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

  /** Updates the live countdown badges toward the wedding date. */
  function updateCountdown() {
    const targetDate = new Date(weddingData.date.targetISO).getTime();
    const now = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      [dom.timerDays, dom.timerHours, dom.timerMinutes, dom.timerSeconds].forEach((el) => {
        if (el) el.textContent = '00';
      });
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (dom.timerDays) dom.timerDays.textContent = pad2(days);
    if (dom.timerHours) dom.timerHours.textContent = pad2(hours);
    if (dom.timerMinutes) dom.timerMinutes.textContent = pad2(minutes);
    if (dom.timerSeconds) dom.timerSeconds.textContent = pad2(seconds);
  }

  function initCountdown() {
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  // ==========================================================================
  // EVENT & CALENDAR
  // ==========================================================================

  /** Builds a Google Calendar "add event" link from the wedding data and opens it. */
  function initAddToCalendar() {
    if (!dom.btnAddCalendar) return;

    dom.btnAddCalendar.addEventListener('click', () => {
      const start = '20261224T080000';
      const end = '20261224T140000';
      const title = encodeURIComponent('Pawiwahan Ageng - Arya & Sekar');
      const details = encodeURIComponent('Ijab Qabul & Resepsi Pernikahan Arya Wicaksana & Sekar Arum');
      const location = encodeURIComponent(weddingData.location.address);

      const url =
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}` +
        `&dates=${start}/${end}&details=${details}&location=${location}&ctz=Asia/Jakarta`;

      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // MAPS
  // ==========================================================================
  // Location card links directly to Google Maps via the href already set on
  // the "Buka Google Maps" button in index.html (weddingData.location.mapsUrl).
  // No additional wiring is required here beyond the static anchor.

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
