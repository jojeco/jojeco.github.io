// ============================================
// Jordan Coomber — Portfolio Scripts
// ============================================

(function () {
  'use strict';

  // --- Mobile Navigation Toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  // Single owner of the open/active classes and aria-expanded so every
  // open/close path (toggle, link click, Escape) stays in sync.
  function setNavOpen(open) {
    navLinks.classList.toggle('open', open);
    // Animate hamburger
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      setNavOpen(!navLinks.classList.contains('open'));
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });

    // Escape closes an open menu and returns focus to the toggle
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  // --- Scroll-triggered fade-in ---
  var fadeElements = document.querySelectorAll('.section-title, .project-card, .skill-category, .timeline-item, .about-content, .contact-links, .about-stats');

  fadeElements.forEach(function (el) {
    el.classList.add('fade-in');
  });

  function checkFade() {
    var triggerBottom = window.innerHeight * 0.88;
    fadeElements.forEach(function (el) {
      var box = el.getBoundingClientRect();
      if (box.top < triggerBottom) {
        el.classList.add('visible');
      }
    });
  }

  // Run on load and scroll
  checkFade();
  window.addEventListener('scroll', checkFade, { passive: true });

  // --- Navbar background on scroll ---
  var nav = document.getElementById('nav');
  function updateNav() {
    if (window.scrollY > 50) {
      nav.style.background = 'rgba(13, 17, 23, 0.95)';
    } else {
      nav.style.background = 'rgba(13, 17, 23, 0.85)';
    }
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  // --- Smooth scroll for nav links (fallback for browsers without native support) ---
  // Respect the OS "reduce motion" setting: jump instead of animating.
  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      // A bare "#" (e.g. the nav logo) is not a valid selector and
      // throws in document.querySelector — skip it.
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
        // preventDefault() skips the browser's own focus transfer, so
        // move focus to the target (skip link, keyboard nav) ourselves.
        if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
          target.setAttribute('tabindex', '-1');
        }
        target.focus({ preventScroll: true });
      }
    });
  });

  // --- Active nav link highlighting via IntersectionObserver ---
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  var allSections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window && allSections.length && navAnchors.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, {
      threshold: 0,
      rootMargin: '-64px 0px -55% 0px'
    });

    allSections.forEach(function (s) { sectionObserver.observe(s); });
  }

  // --- Project category filter ---
  // Shareable + persistent: the selected category lives in the URL hash
  // (#projects or #projects?filter=x), falls back to localStorage when
  // there's no hash, and stays in sync with browser Back/Forward.
  var filterChips = document.querySelectorAll('.filter-chip');
  var projectCards = document.querySelectorAll('.project-card');
  var filterCount = document.querySelector('.filter-count');
  var emptyState = document.querySelector('.projects-empty');
  var FILTER_STORAGE_KEY = 'jc-project-filter';

  var VALID_FILTERS = Array.prototype.map.call(filterChips, function (chip) {
    return chip.getAttribute('data-filter');
  });

  function isValidFilter(filter) {
    return VALID_FILTERS.indexOf(filter) !== -1;
  }

  function setCount(n) {
    if (filterCount) {
      filterCount.textContent = 'Showing ' + n + ' of ' + projectCards.length;
    }
  }

  function applyFilter(filter) {
    var visible = 0;
    projectCards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '').split(' ');
      var matches = filter === 'all' || tags.indexOf(filter) !== -1;
      card.style.display = matches ? '' : 'none';
      if (matches) {
        visible++;
        // A card re-shown after being filtered out may never have
        // crossed the scroll fade-in threshold while display:none
        // (getBoundingClientRect is zeroed for hidden elements), so
        // force it fully opaque instead of leaving it stuck at opacity 0.
        card.classList.add('visible');
      }
    });
    setCount(visible);
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  function setActiveChip(filter) {
    filterChips.forEach(function (chip) {
      var isActive = chip.getAttribute('data-filter') === filter;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function readStoredFilter() {
    try {
      return window.localStorage.getItem(FILTER_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function writeStoredFilter(filter) {
    try {
      window.localStorage.setItem(FILTER_STORAGE_KEY, filter);
    } catch (e) {
      // Storage may be unavailable (e.g. private-mode Safari) — ignore.
    }
  }

  // Hash format is "#projects" (all) or "#projects?filter=x". Returns
  // null when the hash isn't about the projects filter at all, so the
  // caller knows to fall back to localStorage instead.
  function parseHashFilter() {
    var hash = window.location.hash || '';
    if (hash.indexOf('#projects') !== 0) {
      return null;
    }
    var match = hash.match(/[?&]filter=([^&]+)/);
    if (!match) {
      return 'all';
    }
    try {
      return decodeURIComponent(match[1]);
    } catch (e) {
      return 'all';
    }
  }

  function readFilter() {
    var fromHash = parseHashFilter();
    if (fromHash !== null) {
      return isValidFilter(fromHash) ? fromHash : 'all';
    }
    var fromStorage = readStoredFilter();
    if (fromStorage !== null && isValidFilter(fromStorage)) {
      return fromStorage;
    }
    return 'all';
  }

  function selectFilter(filter, pushHash) {
    if (!isValidFilter(filter)) {
      filter = 'all';
    }
    applyFilter(filter);
    setActiveChip(filter);
    writeStoredFilter(filter);
    if (pushHash) {
      var newHash = filter === 'all' ? '#projects' : '#projects?filter=' + encodeURIComponent(filter);
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
    }
  }

  if (filterChips.length && projectCards.length) {
    var initialFilter = readFilter();
    applyFilter(initialFilter);
    setActiveChip(initialFilter);
    // Only remember the choice locally on load — don't force a hash
    // push if one wasn't already present in the URL.
    writeStoredFilter(initialFilter);

    filterChips.forEach(function (chip, index) {
      chip.addEventListener('click', function () {
        selectFilter(chip.getAttribute('data-filter'), true);
      });

      // Left/Right arrow roving focus across the chip group;
      // Home/End jump to the first/last chip.
      chip.addEventListener('keydown', function (e) {
        var nextIndex = null;
        if (e.key === 'ArrowRight') {
          nextIndex = (index + 1) % filterChips.length;
        } else if (e.key === 'ArrowLeft') {
          nextIndex = (index - 1 + filterChips.length) % filterChips.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = filterChips.length - 1;
        }
        if (nextIndex !== null) {
          e.preventDefault();
          filterChips[nextIndex].focus();
        }
      });
    });

    // Browser Back/Forward changes the hash without a click — re-read
    // it and re-apply, but never push a hash from here (no push loop).
    window.addEventListener('hashchange', function () {
      var hash = window.location.hash || '';
      if (hash !== '' && hash.indexOf('#projects') !== 0) {
        return;
      }
      var filter = readFilter();
      applyFilter(filter);
      setActiveChip(filter);
    });
  }

})();
