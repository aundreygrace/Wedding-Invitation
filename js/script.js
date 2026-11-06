// ================================================================
// WEDDING INVITATION - MAIN SCRIPT
// Peta modul berkas ini (urutan sesuai kemunculan di bawah):
//   1. Util & Helper Injeksi      -> getConfigValue, bindAttribute, escapeHtml
//   2. Template Injection Engine  -> hydrateConfig() (MESIN INJEKSI DATA UTAMA)
//   3. Helper Umum (UI)           -> toast, clipboard, dsb (tidak terkait injeksi)
//   4. Guest Name (Runtime)       -> parsing query string ?to=
//   5. Opening Curtain & Reveal   -> animasi, tidak terkait injeksi
//   6. Bottom Navigation          -> scroll-spy, tidak terkait injeksi
//   7. Add to Calendar            -> KONSUMEN data WEDDING_CONFIG (bukan injeksi DOM)
//   8. Gallery Slider             -> mekanika UI, tidak terkait injeksi
//   9. Lightbox                   -> mekanika UI, tidak terkait injeksi
//   10. Audio Controller          -> mekanika UI, tidak terkait injeksi
//   11. Amplop Digital (Gift)     -> mekanika UI, tidak terkait injeksi
//   12. Buku Tamu (Guestbook)     -> DATA EKSTERNAL (Google Sheets API), BUKAN dari config.js
//   13. Init                      -> entry point, memanggil seluruh modul di atas
// ================================================================
(function () {
  'use strict';

  const CONFIG = window.WEDDING_CONFIG || {};
  const GUESTBOOK_API_URL = CONFIG.guestbookApiUrl || '';

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
    btnAddCalendar: document.getElementById('btn-add-calendar'),
    gallerySlider: document.getElementById('gallery-slider'),
    gallerySliderTrack: document.getElementById('gallery-slider-track'),
    galleryPrevBtn: document.getElementById('gallery-prev'),
    galleryNextBtn: document.getElementById('gallery-next'),
    galleryDots: document.getElementById('gallery-dots'),
    galleryStatus: document.getElementById('gallery-slider-status'),
    lightbox: document.getElementById('gallery-lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxCaption: document.getElementById('lightbox-caption'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxPrev: document.getElementById('lightbox-prev'),
    lightboxNext: document.getElementById('lightbox-next'),
    giftPanel: document.getElementById('gift-panel'),
    giftToggle: document.getElementById('gift-toggle'),
    guestbookForm: document.getElementById('guestbook-form'),
    guestbookStatus: document.getElementById('guestbook-status'),
    guestbookSubmitBtn: document.getElementById('guestbook-submit'),
    wishesContainer: document.getElementById('wishes-container'),
  };

  // ================================================================
  // TEMPLATE INJECTION ENGINE BOUNDARY: HELPER PEMBANTU INJEKSI
  // AREA INI MENANGANI PEMBACAAN NILAI BERSARANG DARI WEDDING_CONFIG
  // ================================================================

  // ----------------------------------------------------------------
  // SUB-BOUNDARY: escapeHtml — sanitasi teks sebelum di-injeksi via innerHTML
  // ----------------------------------------------------------------
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  // ----------------------------------------------------------------
  // END SUB-BOUNDARY: escapeHtml
  // ----------------------------------------------------------------

  // ----------------------------------------------------------------
  // SUB-BOUNDARY: getConfigValue — setara getNestedValue(obj, path) pada modul
  // Membaca path string "a.b.c" menjadi CONFIG.a.b.c secara aman (null-safe)
  // ----------------------------------------------------------------
  function getConfigValue(path) {
    return String(path || '').split('.').reduce((value, key) => (value == null ? undefined : value[key]), CONFIG);
  }
  // ----------------------------------------------------------------
  // END SUB-BOUNDARY: getConfigValue
  // ----------------------------------------------------------------

  // ----------------------------------------------------------------
  // SUB-BOUNDARY: bindAttribute — injeksi nilai config ke atribut HTML
  // (dipakai untuk data-config-src, -href, -alt, -title, -content,
  //  -placeholder, -value, -aria-label; lihat pemanggilannya di hydrateConfig)
  // ----------------------------------------------------------------
  function bindAttribute(dataKey, selector, attrName) {
    document.querySelectorAll(selector).forEach((el) => {
      const value = getConfigValue(el.dataset[dataKey]);
      if (value != null) el.setAttribute(attrName, value);
    });
  }
  // ----------------------------------------------------------------
  // END SUB-BOUNDARY: bindAttribute
  // ----------------------------------------------------------------

  // ================================================================
  // END TEMPLATE INJECTION ENGINE BOUNDARY: HELPER PEMBANTU INJEKSI
  // ================================================================

  // ================================================================
  // TEMPLATE INJECTION ENGINE BOUNDARY: hydrateConfig()
  // AREA INI MENANGANI SELURUH INJEKSI DATA DARI WEDDING_CONFIG KE index.html
  // (scan [data-config-*] -> cocokkan path -> suntik ke DOM, lihat juga
  //  anotasi HTML TEMPLATE BOUNDARY MARKER pada index.html)
  // ================================================================
  function hydrateConfig() {
    if (!CONFIG || !Object.keys(CONFIG).length) return;

    // --------------------------------------------------------------
    // SUB-BOUNDARY: data-config-lang -> atribut lang pada <html>
    // --------------------------------------------------------------
    document.querySelectorAll('[data-config-lang]').forEach((el) => {
      el.setAttribute('lang', getConfigValue(el.dataset.configLang) || 'id');
    });
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: data-config-lang
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: data-config-text -> injeksi textContent (mayoritas konten teks)
    // --------------------------------------------------------------
    document.querySelectorAll('[data-config-text]').forEach((el) => {
      const value = getConfigValue(el.dataset.configText);
      if (value != null) el.textContent = value;
    });
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: data-config-text
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: injeksi atribut (src, href, alt, title, content,
    // placeholder, value, aria-label) via bindAttribute()
    // --------------------------------------------------------------
    bindAttribute('configSrc', '[data-config-src]', 'src');
    bindAttribute('configHref', '[data-config-href]', 'href');
    bindAttribute('configAlt', '[data-config-alt]', 'alt');
    bindAttribute('configTitle', '[data-config-title]', 'title');
    bindAttribute('configContent', '[data-config-content]', 'content');
    bindAttribute('configPlaceholder', '[data-config-placeholder]', 'placeholder');
    bindAttribute('configValue', '[data-config-value]', 'value');
    bindAttribute('configAriaLabel', '[data-config-aria-label]', 'aria-label');
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: injeksi atribut
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: data-config-copy-value / data-config-copy-message
    // (dipakai tombol salin nomor rekening & salin alamat di section Gift)
    // --------------------------------------------------------------
    document.querySelectorAll('[data-config-copy-value]').forEach((el) => {
      el.setAttribute('data-copy-value', getConfigValue(el.dataset.configCopyValue) || '');
    });
    document.querySelectorAll('[data-config-copy-message]').forEach((el) => {
      el.setAttribute('data-copy-message', getConfigValue(el.dataset.configCopyMessage) || '');
    });
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: data-config-copy-value / data-config-copy-message
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: Tata tertib -> render <li> dari CONFIG.location.rules[]
    // Target: ul[data-config-list="location.rules"] (section Location)
    // --------------------------------------------------------------
    const rules = document.querySelector('[data-config-list="location.rules"]');
    if (rules) {
      rules.innerHTML = (CONFIG.location.rules || []).map((rule) =>
        '<li><span class="material-symbols-outlined" aria-hidden="true">check_circle</span><span>' +
        escapeHtml(rule) + '</span></li>'
      ).join('');
    }
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: Tata tertib
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: Navigasi bawah -> render <a> dari CONFIG.nav[]
    // Target: [data-config-nav] (komponen Bottom Navigation)
    // --------------------------------------------------------------
    const nav = document.querySelector('[data-config-nav]');
    if (nav) {
      nav.innerHTML = (CONFIG.nav || []).map((item) =>
        '<a class="bottom-nav__item" data-nav-link href="#' + escapeHtml(item.section) + '">' +
        '<span class="material-symbols-outlined bottom-nav__icon" aria-hidden="true">' + escapeHtml(item.icon) + '</span>' +
        '<span class="bottom-nav__label">' + escapeHtml(item.label) + '</span></a>'
      ).join('');
    }
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: Navigasi bawah
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: Kisah cinta -> render timeline <li> dari CONFIG.story.items[]
    // Target: ol[data-config-story] (section Story)
    // --------------------------------------------------------------
    const story = document.querySelector('[data-config-story]');
    if (story) {
      const placeholderIcon = CONFIG.story.photoPlaceholderIcon || 'add_a_photo';
      story.innerHTML = (CONFIG.story.items || []).map((item, index) => {
        const isRight = index % 2 === 0;
        const side = isRight ? 'story__item--right' : 'story__item--left';
        const nodeHtml =
          '<span class="story__node" aria-hidden="true"><span class="material-symbols-outlined">' +
          escapeHtml(item.icon) + '</span></span>';
        const cardHtml =
          '<article class="reveal-item delay-100 story__card" aria-labelledby="story-heading-' + (index + 1) + '">' +
          '<figure class="reveal-item reveal-photo delay-200 story__photo">' +
          '<img class="story__photo-img" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy" onerror="this.remove()" />' +
          '<span class="story__photo-placeholder" aria-hidden="true"><span class="material-symbols-outlined">' + escapeHtml(placeholderIcon) + '</span></span>' +
          '</figure>' +
          '<time class="label-caps" datetime="' + escapeHtml(item.dateTime) + '">' + escapeHtml(item.date) + '</time>' +
          '<h4 id="story-heading-' + (index + 1) + '" class="headline-sm">' + escapeHtml(item.title) + '</h4>' +
          '<p class="body-sm">' + escapeHtml(item.description) + '</p></article>';
        return '<li class="story__item ' + side + '">' +
          (isRight ? cardHtml + nodeHtml : nodeHtml + cardHtml) + '</li>';
      }).join('');
    }
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: Kisah cinta
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: Galeri -> render slide <div> dari CONFIG.gallery.images[]
    // Target: [data-config-gallery] (section Gallery)
    // --------------------------------------------------------------
    const gallery = document.querySelector('[data-config-gallery]');
    if (gallery) {
      const g = CONFIG.gallery;
      gallery.innerHTML = (g.images || []).map((src) =>
        '<div class="gallery-slider__slide">' +
        '<button class="gallery-slider__view-btn" type="button" data-lightbox-src="' + escapeHtml(src) +
        '" data-caption="' + escapeHtml(g.caption) +
        '" aria-label="' + escapeHtml(g.zoomAriaPrefix) + ' ' + escapeHtml(g.caption) + '">' +
        '<img class="gallery-slider__img" src="' + escapeHtml(src) + '" alt="' + escapeHtml(g.alt) + '" loading="lazy" /></button>' +
        '<span class="gallery-slider__caption title-script">' + escapeHtml(g.caption) + '</span></div>'
      ).join('');
    }
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: Galeri
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: Rekening -> render kartu bank dari CONFIG.gift.banks[]
    // Target: [data-config-banks] (section Gift / Amplop Digital)
    // --------------------------------------------------------------
    const banks = document.querySelector('[data-config-banks]');
    if (banks) {
      const gift = CONFIG.gift;
      banks.innerHTML = (gift.banks || []).map((bank) =>
        '<article class="bank-card"><div>' +
        '<div class="bank-card__head"><span class="headline-sm">' + escapeHtml(bank.bank) + '</span></div>' +
        '<p class="label-caps">' + escapeHtml(gift.accountLabel) + '</p>' +
        '<p class="headline-md bank-card__number">' + escapeHtml(bank.formattedNumber) + '</p>' +
        '<p class="body-sm">' + escapeHtml(gift.accountPrefix) + ' ' + escapeHtml(bank.owner) + '</p></div>' +
        '<button class="btn btn--outline-gold" type="button" data-copy-value="' + escapeHtml(bank.value) +
        '" data-copy-message="' + escapeHtml(bank.successMessage) +
        '" aria-label="' + escapeHtml(gift.bankAriaPrefix) + ' ' + escapeHtml(bank.bank) + ' ' + escapeHtml(bank.formattedNumber) + '">' +
        '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span>' +
        '<span class="btn__label">' + escapeHtml(gift.copyLabel) + '</span></button></article>'
      ).join('');
    }
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: Rekening
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // SUB-BOUNDARY: Reload elemen <audio> setelah <source src> disuntik dari config
    // --------------------------------------------------------------
    if (dom.audioEl) dom.audioEl.load();
    // --------------------------------------------------------------
    // END SUB-BOUNDARY: Reload elemen <audio>
    // --------------------------------------------------------------
  }
  // ================================================================
  // END TEMPLATE INJECTION ENGINE BOUNDARY: hydrateConfig()
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: HELPER UMUM (UI) — TIDAK TERKAIT INJEKSI DATA
  // Dipakai lintas modul: toast notifikasi, salin ke clipboard, inisial nama,
  // dan deteksi preferensi reduced-motion pengguna.
  // ================================================================
  function showToast(message) {
    if (!dom.toast || !dom.toastMessage) return;
    dom.toastMessage.textContent = message;
    dom.toast.classList.add('is-visible');
    window.clearTimeout(showToast._timeoutId);
    showToast._timeoutId = window.setTimeout(() => {
      dom.toast.classList.remove('is-visible');
    }, 3000);
  }

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
      /* abaikan */
    }
    document.body.removeChild(el);
    showToast(message);
    if (onSuccess) onSuccess();
  }

  function getInitials(name) {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  // ================================================================
  // END MODULE BOUNDARY: HELPER UMUM (UI)
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: NAMA TAMU DARI URL (?to=Nama / ?u=Nama)
  // DATA RUNTIME DARI QUERY STRING — BUKAN DARI WEDDING_CONFIG
  // ================================================================
  function initGuestName() {
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('to') || params.get('u');
    if (guestParam && dom.guestNameEl) {
      dom.guestNameEl.textContent = decodeURIComponent(guestParam.replace(/\+/g, ' '));
    }
  }
  // ================================================================
  // END MODULE BOUNDARY: NAMA TAMU DARI URL
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: TIRAI PEMBUKA (OPENING CURTAIN) + SCROLL REVEAL
  // ANIMASI UI — TIDAK TERKAIT INJEKSI DATA
  // ================================================================
  function initOpeningCurtain() {
    if (!dom.btnOpen || !dom.curtain) return;

    dom.btnOpen.addEventListener('click', () => {
      attemptAutoplayAudio();

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
      }, 1200);
    });
  }

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
  // ================================================================
  // END MODULE BOUNDARY: TIRAI PEMBUKA + SCROLL REVEAL
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: NAVIGASI BAWAH (SCROLL-SPY)
  // MEKANIKA UI — TIDAK TERKAIT INJEKSI DATA
  // (daftar tautannya sendiri di-render oleh hydrateConfig() di atas,
  //  dari CONFIG.nav; modul ini hanya menangani perilaku scroll/klik-nya)
  // ================================================================
  function initBottomNav() {
    const navLinks = document.querySelectorAll('[data-nav-link]');
    if (!navLinks.length) return;

    const sections = Array.prototype.map
      .call(navLinks, (link) => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);

    const track = document.getElementById('bottom-nav-track');
    const edgeLeft = document.getElementById('bottom-nav-edge-left');
    const edgeRight = document.getElementById('bottom-nav-edge-right');

    function updateEdgeIndicators() {
      if (!track || !edgeLeft || !edgeRight) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 2) {
        edgeLeft.classList.remove('is-visible');
        edgeRight.classList.remove('is-visible');
        return;
      }
      edgeLeft.classList.toggle('is-visible', track.scrollLeft > 2);
      edgeRight.classList.toggle('is-visible', track.scrollLeft < maxScroll - 2);
    }

    if (track) {
      track.addEventListener('scroll', updateEdgeIndicators, { passive: true });
      window.addEventListener('resize', updateEdgeIndicators);
      updateEdgeIndicators();
      window.setTimeout(updateEdgeIndicators, 1300);
    }

    function setActiveNavLink(id) {
      navLinks.forEach((link) => {
        const isMatch = link.getAttribute('href') === '#' + id;
        link.classList.toggle('is-active', isMatch);
        if (isMatch) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        setActiveNavLink(link.getAttribute('href').slice(1));
      });
    });

    if (!('IntersectionObserver' in window) || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveNavLink(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }
  // ================================================================
  // END MODULE BOUNDARY: NAVIGASI BAWAH (SCROLL-SPY)
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: SIMPAN KE KALENDER (GOOGLE CALENDAR)
  // KONSUMEN DATA WEDDING_CONFIG — teks detail acara disusun dari
  // CONFIG.events, CONFIG.date, CONFIG.location lalu dikirim sebagai
  // query string ke Google Calendar (bukan injeksi ke DOM index.html)
  // ================================================================
  function initAddToCalendar() {
    if (!dom.btnAddCalendar) return;

    dom.btnAddCalendar.addEventListener('click', () => {
      const ev = CONFIG.events;
      const cal = ev.calendar;
      const loc = CONFIG.location;

      const detailsText = [
        cal.heading + ' — ' + CONFIG.couple.groom.name.toUpperCase() + ' & ' + CONFIG.couple.bride.name.toUpperCase(),
        '',
        CONFIG.date.displayLabel,
        '',
        cal.scheduleHeading,
        '• ' + ev.akad.title + ': ' + ev.akad.time,
        '  ' + ev.akad.description,
        '• ' + ev.resepsi.title + ': ' + ev.resepsi.time,
        '  ' + ev.resepsi.description,
        '',
        cal.dresscodeHeading,
        '• ' + cal.akadDresscodeLabel + ': ' + ev.akadDresscode,
        '• ' + cal.resepsiDresscodeLabel + ': ' + ev.resepsiDresscode,
        '',
        cal.locationHeading,
        loc.name,
        loc.address,
        '',
        cal.mapHeading,
        loc.mapsUrl,
        '',
        cal.closing,
      ].join('\n');

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: ev.calendarTitle,
        dates: CONFIG.date.calendarStart + '/' + CONFIG.date.calendarEnd,
        details: detailsText,
        location: loc.name + ', ' + loc.address,
        ctz: cal.timezone,
      });
      window.open(
        'https://calendar.google.com/calendar/render?' + params.toString(),
        '_blank',
        'noopener,noreferrer'
      );
    });
  }
  // ================================================================
  // END MODULE BOUNDARY: SIMPAN KE KALENDER
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: GALERI SLIDER
  // MEKANIKA UI (scroll, drag, dots, keyboard nav, breakpoint watch)
  // TIDAK TERKAIT INJEKSI DATA — slide-nya sendiri sudah di-render
  // oleh hydrateConfig() dari CONFIG.gallery.images; modul ini hanya
  // membaca DOM hasil render tersebut (collectGalleryImages)
  // ================================================================
  let galleryImages = [];
  let gallerySlideCount = 0;
  let currentSlideIndex = 0;
  let currentLightboxIndex = 0;
  let scrollEndTimeoutId = null;

  function collectGalleryImages() {
    const slideButtons = document.querySelectorAll('.gallery-slider__slide [data-lightbox-src]');
    galleryImages = Array.prototype.map.call(slideButtons, (btn) => ({
      src: btn.getAttribute('data-lightbox-src'),
      caption: btn.getAttribute('data-caption') || '',
    }));
    gallerySlideCount = galleryImages.length;
  }

  const GALLERY_DESKTOP_QUERY = '(min-width: 1024px)';
  const GALLERY_DESKTOP_VISIBLE = 3;

  function getVisibleSlides() {
    const isDesktop = window.matchMedia && window.matchMedia(GALLERY_DESKTOP_QUERY).matches;
    return isDesktop ? Math.min(GALLERY_DESKTOP_VISIBLE, gallerySlideCount) : 1;
  }

  function getMaxSlideIndex() {
    return Math.max(0, gallerySlideCount - getVisibleSlides());
  }

  function buildGalleryDots() {
    if (!dom.galleryDots) return;
    dom.galleryDots.innerHTML = '';

    const g = CONFIG.gallery;
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
          ? `${g.statusRangePrefix} ${index + 1} ${g.statusRangeMiddle} ${index + visible} ${g.statusOf} ${gallerySlideCount}`
          : `${g.statusRangePrefix} ${index + 1} ${g.statusOf} ${gallerySlideCount}`
      );
      dot.addEventListener('click', () => goToSlide(index));
      dom.galleryDots.appendChild(dot);
    }

    updateGalleryDots();
  }

  function updateGalleryNavState() {
    const limitEnds = getVisibleSlides() > 1;
    if (dom.galleryPrevBtn) dom.galleryPrevBtn.disabled = limitEnds && currentSlideIndex <= 0;
    if (dom.galleryNextBtn) dom.galleryNextBtn.disabled = limitEnds && currentSlideIndex >= getMaxSlideIndex();
  }

  function updateGalleryDots() {
    if (dom.galleryDots) {
      const dots = dom.galleryDots.querySelectorAll('.gallery-slider__dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentSlideIndex);
        dot.setAttribute('aria-selected', String(index === currentSlideIndex));
      });
    }
    if (dom.galleryStatus) {
      const g = CONFIG.gallery;
      const visible = getVisibleSlides();
      dom.galleryStatus.textContent = visible > 1
        ? `${g.statusMultiple} ${currentSlideIndex + 1}–${currentSlideIndex + visible} ${g.statusOf} ${gallerySlideCount}`
        : `${g.statusMultiple} ${currentSlideIndex + 1} ${g.statusOf} ${gallerySlideCount}`;
    }
    updateGalleryNavState();
  }

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
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

  function goToSlide(index, instant) {
    if (!dom.gallerySliderTrack || gallerySlideCount === 0) return;
    const clamped = Math.max(0, Math.min(index, getMaxSlideIndex()));
    const slide = dom.gallerySliderTrack.children[clamped];
    if (!slide) return;

    if (getVisibleSlides() > 1 && !instant && !prefersReducedMotion()) {
      animateTrackTo(slide.offsetLeft);
    } else {
      cancelTrackAnimation();
      dom.gallerySliderTrack.scrollTo({
        left: slide.offsetLeft,
        behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
    currentSlideIndex = clamped;
    updateGalleryDots();
  }

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
    dom.gallerySliderTrack.addEventListener('scroll', handleSliderScroll, { passive: true });
    ['wheel', 'touchstart', 'pointerdown'].forEach((evt) => {
      dom.gallerySliderTrack.addEventListener(evt, cancelTrackAnimation, { passive: true });
    });

    prepareGalleryImages();
    initGalleryKeyboardNav();
    initGalleryBreakpointWatch();
    initLightbox();
  }
  // ================================================================
  // END MODULE BOUNDARY: GALERI SLIDER
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: LIGHTBOX
  // MEKANIKA UI — TIDAK TERKAIT INJEKSI DATA
  // (membaca ulang galleryImages yang sudah dikumpulkan oleh modul Galeri Slider)
  // ================================================================
  function renderLightboxImage(index) {
    if (!dom.lightbox || !dom.lightboxImg || gallerySlideCount === 0) return;

    currentLightboxIndex = (index + gallerySlideCount) % gallerySlideCount;
    const image = galleryImages[currentLightboxIndex];

    dom.lightboxImg.src = image.src;
    dom.lightboxImg.alt = image.caption || CONFIG.gallery.previewAlt;
    if (dom.lightboxCaption) {
      dom.lightboxCaption.textContent = image.caption || '';
    }
  }

  function openLightbox(index) {
    if (!dom.lightbox || !dom.lightboxImg) return;
    renderLightboxImage(index);
    dom.lightbox.classList.add('is-open');
    dom.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    if (!dom.lightbox) return;
    dom.lightbox.classList.remove('is-open');
    dom.body.classList.remove('lightbox-open');
  }

  function showNextLightboxImage() {
    renderLightboxImage(currentLightboxIndex + 1);
  }
  function showPrevLightboxImage() {
    renderLightboxImage(currentLightboxIndex - 1);
  }

  function initLightbox() {
    const slideButtons = document.querySelectorAll('.gallery-slider__slide [data-lightbox-src]');
    slideButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => openLightbox(index));
    });

    if (dom.lightboxClose) dom.lightboxClose.addEventListener('click', closeLightbox);
    if (dom.lightboxPrev) dom.lightboxPrev.addEventListener('click', showPrevLightboxImage);
    if (dom.lightboxNext) dom.lightboxNext.addEventListener('click', showNextLightboxImage);
    if (dom.lightbox) {
      dom.lightbox.addEventListener('click', (event) => {
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
  // ================================================================
  // END MODULE BOUNDARY: LIGHTBOX
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: AUDIO GAMELAN
  // MEKANIKA UI (play/pause, fade volume) — TIDAK TERKAIT INJEKSI DATA
  // (elemen <source src> & label lagunya sendiri sudah disuntik dari
  //  CONFIG.assets.audio oleh hydrateConfig() di atas)
  // ================================================================
  let isAudioPlaying = false;
  let audioFadeId = null;
  let hasAudioEverPlayed = false;
  const AUDIO_TARGET_VOLUME = 0.7;
  const AUDIO_FADE_IN_MS = 100;
  const AUDIO_RESUME_FADE_MS = 700;
  const AUDIO_FADE_OUT_MS = 600;

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

  function playAudio() {
    if (!dom.audioEl) return;
    const isFirstPlay = !hasAudioEverPlayed;
    if (isFirstPlay && dom.audioEl.paused) {
      dom.audioEl.volume = 0;
    }

    const onStarted = () => {
      isAudioPlaying = true;
      hasAudioEverPlayed = true;
      updateAudioButtonState();
      fadeAudioTo(AUDIO_TARGET_VOLUME, isFirstPlay ? AUDIO_FADE_IN_MS : AUDIO_RESUME_FADE_MS);
    };

    let result;
    try {
      result = dom.audioEl.play();
    } catch (err) {
      result = Promise.reject(err);
    }

    if (result && typeof result.then === 'function') {
      result.then(onStarted).catch((err) => {
        console.warn(CONFIG.messages.audioError, err);
        isAudioPlaying = false;
        dom.audioEl.volume = AUDIO_TARGET_VOLUME;
        updateAudioButtonState();
      });
    } else {
      onStarted();
    }
  }

  function pauseAudio() {
    if (!dom.audioEl) return;
    isAudioPlaying = false;
    updateAudioButtonState();
    fadeAudioTo(0, AUDIO_FADE_OUT_MS, () => {
      dom.audioEl.pause();
    });
  }

  function attemptAutoplayAudio() {
    playAudio();
  }

  function updateAudioButtonState() {
    if (!dom.audioBtn) return;
    dom.audioBtn.classList.toggle('playing', isAudioPlaying);
    dom.audioBtn.classList.toggle('paused', !isAudioPlaying);
    dom.audioBtn.setAttribute('aria-pressed', String(isAudioPlaying));
    dom.audioBtn.setAttribute(
      'aria-label',
      isAudioPlaying ? CONFIG.messages.audioPauseAria : CONFIG.messages.audioPlayAria
    );
  }

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
      console.warn(CONFIG.messages.audioError);
    }, true);
  }
  // ================================================================
  // END MODULE BOUNDARY: AUDIO GAMELAN
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: AMPLOP DIGITAL (GIFT PANEL + TOMBOL SALIN)
  // MEKANIKA UI — TIDAK TERKAIT INJEKSI DATA
  // (kartu bank & nilai data-copy-* sudah disuntik oleh hydrateConfig();
  //  modul ini hanya menangani perilaku buka/tutup panel dan efek salin)
  // ================================================================
  const COPY_FEEDBACK_MS = 2000;

  function setGiftOpen(isOpen) {
    if (!dom.giftPanel || !dom.giftToggle) return;
    dom.giftPanel.classList.toggle('is-open', isOpen);
    dom.giftToggle.setAttribute('aria-expanded', String(isOpen));
    const label = dom.giftToggle.querySelector('.gift__toggle-label');
    if (label) label.textContent = isOpen ? CONFIG.gift.closeButton : CONFIG.gift.openButton;
  }

  function initGiftToggle() {
    if (!dom.giftPanel || !dom.giftToggle) return;
    setGiftOpen(false);
    dom.giftToggle.addEventListener('click', () => {
      setGiftOpen(!dom.giftPanel.classList.contains('is-open'));
    });
  }

  function showCopyFeedback(btn) {
    const label = btn.querySelector('.btn__label');
    const icon = btn.querySelector('.material-symbols-outlined');
    if (label && btn._origLabel === undefined) btn._origLabel = label.textContent;
    if (icon && btn._origIcon === undefined) btn._origIcon = icon.textContent;

    window.clearTimeout(btn._copyTimer);
    btn.classList.add('is-copied');
    if (label) label.textContent = CONFIG.gift.copiedLabel;
    if (icon) icon.textContent = 'check';

    btn._copyTimer = window.setTimeout(() => {
      btn.classList.remove('is-copied');
      if (label) label.textContent = btn._origLabel;
      if (icon) icon.textContent = btn._origIcon;
    }, COPY_FEEDBACK_MS);
  }

  function initCopyButtons() {
    const buttons = document.querySelectorAll('[data-copy-value]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-copy-value');
        const message = btn.getAttribute('data-copy-message') || CONFIG.messages.copyFallback;
        copyToClipboard(value, message, () => showCopyFeedback(btn));
      });
    });
  }
  // ================================================================
  // END MODULE BOUNDARY: AMPLOP DIGITAL
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: BUKU TAMU (GUESTBOOK)
  // DATA EKSTERNAL (Google Sheets via Apps Script Web App) — DIRENDER
  // DARI HASIL fetch() SAAT RUNTIME, BUKAN DARI WEDDING_CONFIG. Hanya
  // label teks statusnya (loading/success/error, dsb) yang berasal dari
  // CONFIG.wishes, hasil injeksi hydrateConfig() sebelumnya.
  // ================================================================
  function setGuestbookStatus(message, type) {
    if (!dom.guestbookStatus) return;
    dom.guestbookStatus.textContent = message;
    dom.guestbookStatus.classList.remove('guestbook-status--success', 'guestbook-status--error');
    if (type === 'success' || type === 'error') {
      dom.guestbookStatus.classList.add('guestbook-status--' + type);
    }
    dom.guestbookStatus.classList.toggle('is-visible', Boolean(message));
  }

  function setGuestbookLoading(isLoading) {
    if (!dom.guestbookSubmitBtn) return;
    dom.guestbookSubmitBtn.disabled = isLoading;
    dom.guestbookSubmitBtn.classList.toggle('is-loading', isLoading);
    const label = dom.guestbookSubmitBtn.querySelector('.guestbook-form__submit-label');
    if (label) label.textContent = isLoading ? CONFIG.wishes.loading : CONFIG.wishes.submit;
  }

  let isGuestbookSubmitting = false;

  // ----------------------------------------------------------------
  // SUB-BOUNDARY: handleGuestbookSubmit — kirim form (POST) ke Apps Script
  // ----------------------------------------------------------------
  function handleGuestbookSubmit(event) {
    event.preventDefault();
    if (!dom.guestbookForm) return;
    if (isGuestbookSubmitting) return;

    if (!GUESTBOOK_API_URL) {
      setGuestbookStatus(CONFIG.wishes.serverNotConfigured, 'error');
      return;
    }

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
          setGuestbookStatus(CONFIG.wishes.success, 'success');
          dom.guestbookForm.reset();
          fetchGuestbookEntries();
        } else {
          setGuestbookStatus((result && result.message) || CONFIG.wishes.submitError, 'error');
        }
      })
      .catch(() => {
        setGuestbookStatus(CONFIG.wishes.connectionError, 'error');
      })
      .finally(() => {
        isGuestbookSubmitting = false;
        setGuestbookLoading(false);
      });
  }
  // ----------------------------------------------------------------
  // END SUB-BOUNDARY: handleGuestbookSubmit
  // ----------------------------------------------------------------

  function renderGuestbookSkeleton() {
    if (!dom.wishesContainer) return;
    dom.wishesContainer.innerHTML =
      '<div class="wish-skeleton" aria-hidden="true"></div>' +
      '<div class="wish-skeleton" aria-hidden="true"></div>' +
      '<div class="wish-skeleton" aria-hidden="true"></div>';
  }

  function formatWishTimestamp(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return date.toLocaleString((CONFIG.site && CONFIG.site.locale) || 'id-ID', {
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

  // ----------------------------------------------------------------
  // SUB-BOUNDARY: renderGuestbookEntries — render kartu ucapan dari
  // DATA EKSTERNAL hasil fetch() Google Sheets (entry.nama, entry.kehadiran,
  // entry.pesan, entry.timestamp), BUKAN dari WEDDING_CONFIG.
  // Render ulang daftar ucapan dari Google Sheets. Urutan dari server
  // (terbaru -> terlama) dipakai apa adanya. Semua teks pengguna di-escape
  // lewat escapeHtml() untuk mencegah XSS.
  // ----------------------------------------------------------------
  function renderGuestbookEntries(entries) {
    if (!dom.wishesContainer) return;
    dom.wishesContainer.innerHTML = '';

    if (!entries || entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'wishes__empty';
      empty.id = 'wishes-empty';
      empty.textContent = CONFIG.wishes.empty;
      dom.wishesContainer.appendChild(empty);
      return;
    }

    entries.forEach((entry) => {
      const name = (entry && entry.nama) || CONFIG.wishes.defaultGuest;
      const attendance = (entry && entry.kehadiran) || CONFIG.wishes.defaultAttendance;
      const message = (entry && entry.pesan) || '';
      const timeLabel = formatWishTimestamp(entry && entry.timestamp);
      const initials = getInitials(name);
      const badgeModifier = attendance === CONFIG.wishes.notAttending ? ' attendance-badge--tidak-hadir' : '';

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
  // ----------------------------------------------------------------
  // END SUB-BOUNDARY: renderGuestbookEntries
  // ----------------------------------------------------------------

  let guestbookFetchController = null;

  // ----------------------------------------------------------------
  // SUB-BOUNDARY: fetchGuestbookEntries — GET daftar ucapan dari Apps Script
  // ----------------------------------------------------------------
  function fetchGuestbookEntries() {
    if (!dom.wishesContainer || !GUESTBOOK_API_URL) return;

    if (guestbookFetchController) guestbookFetchController.abort();
    const controller = new AbortController();
    guestbookFetchController = controller;

    renderGuestbookSkeleton();

    fetch(GUESTBOOK_API_URL, { method: 'GET', signal: controller.signal })
      .then((response) => response.json())
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result && result.result === 'success') {
          renderGuestbookEntries(result.data || []);
        } else {
          renderGuestbookEntries([]);
        }
      })
      .catch((err) => {
        if (err && err.name === 'AbortError') return;
        if (!dom.wishesContainer) return;
        dom.wishesContainer.innerHTML =
          '<p class="wishes__empty">' + escapeHtml(CONFIG.wishes.loadError) + '</p>';
      });
  }
  // ----------------------------------------------------------------
  // END SUB-BOUNDARY: fetchGuestbookEntries
  // ----------------------------------------------------------------

  function initGuestbookForm() {
    if (!dom.guestbookForm) return;
    dom.guestbookForm.addEventListener('submit', handleGuestbookSubmit);

    if (!GUESTBOOK_API_URL) {
      renderGuestbookEntries([]);
      return;
    }
    fetchGuestbookEntries();
  }
  // ================================================================
  // END MODULE BOUNDARY: BUKU TAMU (GUESTBOOK)
  // ================================================================

  // ================================================================
  // MODULE BOUNDARY: INIT (ENTRY POINT)
  // Urutan panggilan penting: hydrateConfig() WAJIB jalan pertama kali
  // karena seluruh modul UI di bawahnya (nav, galeri, audio, dsb)
  // membaca DOM yang sudah disuntik data dari WEDDING_CONFIG.
  // ================================================================
  function init() {
    hydrateConfig();        // 1. Mesin injeksi data — WAJIB paling awal
    initGuestName();         // 2. Override nama tamu dari query string
    initOpeningCurtain();    // 3. Animasi tirai pembuka
    initAddToCalendar();     // 4. Tombol simpan ke kalender (konsumen CONFIG)
    initGallerySlider();     // 5. Mekanika galeri (butuh DOM hasil injeksi)
    initAudioController();   // 6. Kontrol audio
    initGiftToggle();        // 7. Buka/tutup panel amplop digital
    initCopyButtons();       // 8. Tombol salin (rekening & alamat)
    initGuestbookForm();     // 9. Form + daftar ucapan (data eksternal)
    initBottomNav();         // 10. Scroll-spy navigasi bawah

    if (dom.body.classList.contains('is-unlocked')) {
      initScrollReveal();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  // ================================================================
  // END MODULE BOUNDARY: INIT (ENTRY POINT)
  // ================================================================
})();