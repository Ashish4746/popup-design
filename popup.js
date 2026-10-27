/**
 * Moksh CAD — Human + AI Portrait Modal Controller
 * Interactive 3D perspective tilt, session storage, and accessible modal behavior
 */

(function () {
  'use strict';

  const isLocalHost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:' ||
    window.location.search.includes('popup=true')
  );

  const CONFIG = {
    STORAGE_KEY: 'moksh_cad_human_ai_popup_seen',
    DELAY_MS: 700, // Short delay after start
    ALWAYS_SHOW_ON_START: isLocalHost,
    FOCUSABLE_SELECTORS: 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  };

  let backdropEl = null;
  let popupEl = null;
  let closeBtnEl = null;
  let primaryCtaEl = null;
  let secondaryLinkEl = null;
  let previouslyFocusedElement = null;
  let timerId = null;
  let isOpen = false;

  function init() {
    backdropEl = document.getElementById('mokshModalBackdrop');
    popupEl = document.getElementById('mokshModalPopup');
    closeBtnEl = document.getElementById('mokshModalClose');
    primaryCtaEl = document.getElementById('mokshModalPrimaryCta');
    secondaryLinkEl = document.getElementById('mokshModalSecondaryLink');

    if (!backdropEl || !popupEl) return;

    bindEvents();
    initPerspectiveTilt();
    schedulePopup();
  }

  function hasSeenPopup() {
    if (CONFIG.ALWAYS_SHOW_ON_START) return false;
    try {
      return sessionStorage.getItem(CONFIG.STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function markAsSeen() {
    try {
      sessionStorage.setItem(CONFIG.STORAGE_KEY, 'true');
    } catch (e) {}
  }

  function schedulePopup() {
    if (hasSeenPopup()) return;

    timerId = setTimeout(function () {
      if (!isOpen) openPopup();
    }, CONFIG.DELAY_MS);
  }

  function openPopup() {
    if (isOpen || !backdropEl) return;

    previouslyFocusedElement = document.activeElement;
    isOpen = true;

    backdropEl.classList.add('is-active');
    backdropEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('moksh-modal-open');

    setTimeout(function () {
      if (primaryCtaEl) {
        primaryCtaEl.focus();
      } else if (closeBtnEl) {
        closeBtnEl.focus();
      }
    }, 100);
  }

  function closePopup(recordSeen = true) {
    if (!isOpen || !backdropEl) return;

    isOpen = false;
    backdropEl.classList.remove('is-active');
    backdropEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('moksh-modal-open');

    if (popupEl) {
      popupEl.style.transform = '';
      popupEl.style.animationPlayState = 'running';
    }

    if (recordSeen) markAsSeen();

    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
  }

  function initPerspectiveTilt() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!reduceMotion && finePointer && popupEl) {
      popupEl.addEventListener('pointermove', function (event) {
        if (!isOpen) return;
        const rect = popupEl.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        popupEl.style.animationPlayState = 'paused';
        popupEl.style.transform = `perspective(1100px) rotateY(${x * 3.5}deg) rotateX(${-y * 3.5}deg)`;
      });

      popupEl.addEventListener('pointerleave', function () {
        popupEl.style.transform = '';
        popupEl.style.animationPlayState = 'running';
      });
    }
  }

  function bindEvents() {
    if (closeBtnEl) {
      closeBtnEl.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closePopup(true);
      });
    }

    backdropEl.addEventListener('click', function (e) {
      if (e.target === backdropEl) {
        closePopup(true);
      }
    });

    if (primaryCtaEl) {
      primaryCtaEl.addEventListener('click', function () {
        markAsSeen();
      });
    }

    if (secondaryLinkEl) {
      secondaryLinkEl.addEventListener('click', function () {
        markAsSeen();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;

      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        closePopup(true);
        return;
      }

      if (e.key === 'Tab' || e.keyCode === 9) {
        trapFocus(e);
      }
    });
  }

  function trapFocus(e) {
    if (!popupEl) return;
    const focusables = popupEl.querySelectorAll(CONFIG.FOCUSABLE_SELECTORS);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !popupEl.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || !popupEl.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  window.MokshPopup = {
    show: function () {
      if (timerId) clearTimeout(timerId);
      openPopup();
    },
    close: function () {
      closePopup(true);
    },
    reset: function () {
      try {
        sessionStorage.removeItem(CONFIG.STORAGE_KEY);
      } catch (e) {}
    },
    isOpen: function () {
      return isOpen;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
