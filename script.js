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
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  // --- Theme (light/dark) ---
  // The inline <head> script has already resolved and applied data-theme.
  // 'jc-theme' stores only an explicit user choice; with nothing stored the
  // theme follows the system preference.
  var THEME_STORAGE_KEY = 'jc-theme';
  var themeToggle = document.getElementById('theme-toggle');
  var themeQuery = null;
  try {
    themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  } catch (e) {}

  function readStoredTheme() {
    try {
      var stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch (e) {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      // Storage may be unavailable (e.g. private-mode Safari) — the choice
      // still applies for this page view.
    }
  }

  // Mirrors the head script: light only when the system explicitly asks for it.
  function systemTheme() {
    try {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      var label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
  }

  function setTheme(theme) {
    applyTheme(theme);
    writeStoredTheme(theme);
  }

  // Re-resolve once so the button label matches the applied theme even if
  // the head script did not run.
  applyTheme(readStoredTheme() || systemTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
  }

  // Follow live system changes only while there is no explicit override.
  function onSystemThemeChange() {
    if (readStoredTheme() === null) {
      applyTheme(systemTheme());
    }
  }

  if (themeQuery) {
    if (typeof themeQuery.addEventListener === 'function') {
      themeQuery.addEventListener('change', onSystemThemeChange);
    } else if (typeof themeQuery.addListener === 'function') {
      themeQuery.addListener(onSystemThemeChange);
    }
  }

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

  // --- Project category filter + search ---
  // Shareable + persistent: the selected category and search query live in
  // the URL hash (#projects, #projects?filter=x, #projects?q=y, or both),
  // the category falls back to localStorage when there's no hash, and both
  // stay in sync with browser Back/Forward. readState()/buildHash() are the
  // single source of truth for that hash — every entry point (chip clicks,
  // search input, the two Clear buttons, hashchange) goes through them.
  var filterChips = document.querySelectorAll('.filter-chip');
  var projectCards = document.querySelectorAll('.project-card');
  var filterCount = document.querySelector('.filter-count');
  var emptyState = document.querySelector('.projects-empty');
  var emptyClearBtn = document.getElementById('projects-empty-clear');
  var searchWrap = document.getElementById('project-search-wrap');
  var searchInput = document.getElementById('project-search');
  var searchClearBtn = document.getElementById('project-search-clear');
  var techDatalist = document.getElementById('project-tech-list');
  var FILTER_STORAGE_KEY = 'jc-project-filter';
  var SEARCH_DEBOUNCE_MS = 250;

  var VALID_FILTERS = Array.prototype.map.call(filterChips, function (chip) {
    return chip.getAttribute('data-filter');
  });

  // Tracks the active category between hash writes; the query itself is
  // read straight from the input (its own source of truth) rather than
  // mirrored into a second variable.
  var currentFilterValue = 'all';
  var searchDebounceTimer = null;

  function isValidFilter(filter) {
    return VALID_FILTERS.indexOf(filter) !== -1;
  }

  function setCount(n) {
    if (filterCount) {
      filterCount.textContent = 'Showing ' + n + ' of ' + projectCards.length;
    }
  }

  // Generalised filter: combines the category (AND) with a case-insensitive,
  // trimmed text match against each card's name, description and ptags.
  // The only place that sets card.style.display, adds .visible, calls
  // setCount and toggles the empty state.
  function applyFilter(filter, q) {
    var query = (q || '').trim().toLowerCase();
    var visible = 0;
    projectCards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '').split(' ');
      var categoryMatches = filter === 'all' || tags.indexOf(filter) !== -1;
      var textMatches = query === '' || (card._searchHaystack || '').indexOf(query) !== -1;
      var matches = categoryMatches && textMatches;
      card.style.display = matches ? '' : 'none';
      if (matches) {
        visible++;
        // A card re-shown after being filtered out may never have
        // crossed the scroll fade-in threshold while display:none
        // (getBoundingClientRect is zeroed for hidden elements), so
        // force it fully opaque instead of leaving it stuck at opacity 0.
        card.classList.add('visible');
      }
      (card._ptagEls || []).forEach(function (ptagEl) {
        var isTagMatch = query !== '' && ptagEl.textContent.trim().toLowerCase().indexOf(query) !== -1;
        ptagEl.classList.toggle('ptag-match', isTagMatch);
      });
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

  // Single reader for the combined state. Hash format is "#projects",
  // "#projects?filter=x", "#projects?q=y" or "#projects?filter=x&q=y". The
  // query lives in the hash only (never localStorage); the category falls
  // back to localStorage when there's no #projects hash at all.
  function readState() {
    var hash = window.location.hash || '';
    var filter = 'all';
    var q = '';
    if (hash.indexOf('#projects') === 0) {
      var filterMatch = hash.match(/[?&]filter=([^&]+)/);
      if (filterMatch) {
        try {
          filter = decodeURIComponent(filterMatch[1]);
        } catch (e) {
          filter = 'all';
        }
      }
      var qMatch = hash.match(/[?&]q=([^&]+)/);
      if (qMatch) {
        try {
          q = decodeURIComponent(qMatch[1]);
        } catch (e) {
          q = '';
        }
      }
      if (!isValidFilter(filter)) {
        filter = 'all';
      }
    } else {
      var fromStorage = readStoredFilter();
      if (fromStorage !== null && isValidFilter(fromStorage)) {
        filter = fromStorage;
      }
    }
    return { filter: filter, q: q };
  }

  // Single writer for the combined state — every hash the app ever
  // produces (chip click, debounced search, Clear buttons) is built here.
  function buildHash(state) {
    var filter = isValidFilter(state.filter) ? state.filter : 'all';
    var q = state.q || '';
    var params = [];
    if (filter !== 'all') {
      params.push('filter=' + encodeURIComponent(filter));
    }
    if (q !== '') {
      params.push('q=' + encodeURIComponent(q));
    }
    return params.length ? '#projects?' + params.join('&') : '#projects';
  }

  function currentQuery() {
    return searchInput ? searchInput.value : '';
  }

  function syncClearButton() {
    if (searchClearBtn && searchInput) {
      searchClearBtn.hidden = searchInput.value.length === 0;
    }
  }

  // Applies the current filter+query and writes the URL via replaceState —
  // adds no history entry and does not fire hashchange. Used by the
  // debounced search commit and by the two Clear buttons (immediately,
  // no debounce, since they aren't keystrokes).
  function applyAndSyncURL() {
    var q = currentQuery();
    applyFilter(currentFilterValue, q);
    var newHash = buildHash({ filter: currentFilterValue, q: q });
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }

  // Chip clicks (and the empty-state Clear button) keep assigning
  // location.hash, as before — that's the one path allowed to push a
  // real history entry. Refactored to carry the current query along
  // instead of dropping it.
  function selectFilter(filter, pushHash) {
    if (!isValidFilter(filter)) {
      filter = 'all';
    }
    // A pending debounced keystroke must not clobber this discrete action.
    clearTimeout(searchDebounceTimer);
    currentFilterValue = filter;
    var q = currentQuery();
    applyFilter(filter, q);
    setActiveChip(filter);
    writeStoredFilter(filter);
    if (pushHash) {
      var newHash = buildHash({ filter: filter, q: q });
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
    }
  }

  function populateDatalist() {
    if (!techDatalist) return;
    var seen = {};
    var labels = [];
    projectCards.forEach(function (card) {
      (card._ptagEls || []).forEach(function (ptagEl) {
        var label = ptagEl.textContent.trim();
        if (label && !seen[label]) {
          seen[label] = true;
          labels.push(label);
        }
      });
    });
    labels.sort(function (a, b) {
      return a.localeCompare(b);
    });
    labels.forEach(function (label) {
      var opt = document.createElement('option');
      opt.value = label;
      techDatalist.appendChild(opt);
    });
  }

  if (filterChips.length && projectCards.length) {
    // Precompute a lowercase search haystack and cached ptag list per card
    // once — cards are static, so there's no need to re-query on every
    // keystroke.
    projectCards.forEach(function (card) {
      var nameEl = card.querySelector('.project-name');
      var descEl = card.querySelector('.project-desc');
      var ptagEls = Array.prototype.slice.call(card.querySelectorAll('.ptag'));
      var parts = [];
      if (nameEl) parts.push(nameEl.textContent);
      if (descEl) parts.push(descEl.textContent);
      ptagEls.forEach(function (t) {
        parts.push(t.textContent);
      });
      card._searchHaystack = parts.join(' ').toLowerCase();
      card._ptagEls = ptagEls;
    });

    var initialState = readState();
    currentFilterValue = initialState.filter;
    applyFilter(initialState.filter, initialState.q);
    setActiveChip(initialState.filter);
    // Only remember the choice locally on load — don't force a hash
    // push if one wasn't already present in the URL.
    writeStoredFilter(initialState.filter);

    if (searchWrap) {
      // No-JS ships this hidden; JS is what reveals it.
      searchWrap.hidden = false;
    }
    if (searchInput) {
      searchInput.value = initialState.q;
      syncClearButton();
      populateDatalist();

      searchInput.addEventListener('input', function () {
        syncClearButton();
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(applyAndSyncURL, SEARCH_DEBOUNCE_MS);
      });

      // Escape inside the box clears it — but doesn't stop propagation,
      // so the existing nav Escape handler (which only acts when the nav
      // is open) still sees the event.
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && searchInput.value !== '') {
          e.preventDefault();
          clearTimeout(searchDebounceTimer);
          searchInput.value = '';
          syncClearButton();
          applyAndSyncURL();
        }
      });
    }

    if (searchClearBtn && searchInput) {
      searchClearBtn.addEventListener('click', function () {
        clearTimeout(searchDebounceTimer);
        searchInput.value = '';
        syncClearButton();
        applyAndSyncURL();
        searchInput.focus();
      });
    }

    if (emptyClearBtn) {
      emptyClearBtn.addEventListener('click', function () {
        clearTimeout(searchDebounceTimer);
        if (searchInput) {
          searchInput.value = '';
          syncClearButton();
        }
        selectFilter('all', true);
        if (searchInput) {
          searchInput.focus();
        }
      });
    }

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
    // both keys and re-apply, including writing the query back into the
    // input, but never push a hash from here (no push loop).
    window.addEventListener('hashchange', function () {
      var hash = window.location.hash || '';
      if (hash !== '' && hash.indexOf('#projects') !== 0) {
        return;
      }
      clearTimeout(searchDebounceTimer);
      var state = readState();
      currentFilterValue = state.filter;
      if (searchInput && searchInput.value.trim() !== state.q) {
        searchInput.value = state.q;
      }
      syncClearButton();
      applyFilter(state.filter, state.q);
      setActiveChip(state.filter);
    });

    // Pressing "/" focuses the search box, unless a modifier is held or
    // the event target is already an editable element (including the
    // search box itself while typing).
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      var target = e.target;
      var tag = target && target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (target && target.isContentEditable)) {
        return;
      }
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

})();
