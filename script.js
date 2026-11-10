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

  // --- Back to top button ---
  // Visible once the user has scrolled past the hero. The href is "#main",
  // so the existing a[href^="#"] handler below already owns the smooth/
  // instant (reduced-motion aware) scroll and focus move — no duplicate
  // scroll logic here, just the show/hide toggle, throttled via
  // requestAnimationFrame so it isn't recomputed on every raw scroll event.
  var backToTop = document.getElementById('back-to-top');
  var hero = document.getElementById('hero');
  if (backToTop) {
    var backToTopTicking = false;
    function updateBackToTop() {
      var threshold = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      backToTop.classList.toggle('is-visible', window.scrollY > threshold);
      backToTopTicking = false;
    }
    function onBackToTopScroll() {
      if (!backToTopTicking) {
        backToTopTicking = true;
        window.requestAnimationFrame(updateBackToTop);
      }
    }
    updateBackToTop();
    window.addEventListener('scroll', onBackToTopScroll, { passive: true });
  }

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

  // Shared by the nav-link handler below and the Skills-tag jump-to-projects
  // feature: scrolls to an element (instant under reduced-motion) and moves
  // focus there, giving it a tabindex first if it isn't natively focusable.
  function scrollToEl(target) {
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  }

  // navigator.clipboard requires a secure context and isn't guaranteed
  // (older browsers, non-HTTPS previews) — fall back to a temporary,
  // off-screen input + select() + execCommand('copy'). Lives at IIFE scope
  // (moved out of the project-modal block below) so the command palette's
  // copy-email action can reuse it too.
  function fallbackCopy(text) {
    var tempInput = document.createElement('input');
    tempInput.value = text;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'fixed';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      // Nothing more to try — the live region simply won't confirm.
    }
    document.body.removeChild(tempInput);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      // A bare "#" (e.g. the nav logo) is not a valid selector and
      // throws in document.querySelector — skip it.
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        // preventDefault() skips the browser's own focus transfer, so
        // scrollToEl() moves focus to the target (skip link, keyboard nav)
        // itself.
        scrollToEl(target);
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
  var searchHint = document.querySelector('.project-search-hint');
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

  // Case-insensitive substring match of a (already-trimmed) query against a
  // card's precomputed haystack (name + description + ptags, lowercased —
  // see the _searchHaystack precompute below). Shared by applyFilter and by
  // the Skills-tag safety check, which needs the exact same matching rule
  // the live search box uses.
  function cardMatchesQuery(card, query) {
    return query === '' || (card._searchHaystack || '').indexOf(query) !== -1;
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
      var textMatches = cardMatchesQuery(card, query);
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
    if (searchHint && searchInput) {
      searchHint.innerHTML = searchInput.value.length > 0
        ? 'Press <span class="project-search-key">Esc</span> to clear'
        : 'Press <span class="project-search-key">/</span> to search';
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

  // Shared by the Skills-tag click/keyboard handler and the command
  // palette's Skill results (moved out of initSkillTagLinks() so both can
  // call it): applies a finder query against the "all" category, syncs the
  // URL hash, scrolls to Projects and focuses the search box.
  var projectsSection = document.getElementById('projects');

  function runProjectQuery(query) {
    if (!searchInput) return;
    searchInput.value = query;
    syncClearButton();
    // selectFilter() reads the query straight from the input, applies the
    // "all" category + query filter, updates the chip UI, and — because
    // pushHash is true — writes a real history entry via buildHash() so
    // Back/Forward works. It also re-applies the exact same state via the
    // existing hashchange handler if that handler fires.
    selectFilter('all', true);
    scrollToEl(projectsSection);
    searchInput.focus({ preventScroll: true });
  }

  // --- Skill tags jump to matching projects ---
  // Hand-written alias table: the exact <span class="tag"> label text in
  // the Skills section (trimmed) mapped to the search query the finder
  // should run, plus a short display "name" for the aria-label. Skills with
  // no real project behind them are simply absent here and stay plain text.
  // Verified against the actual project-card markup (name + .project-desc +
  // .ptag text — the same fields _searchHaystack below is built from, NOT
  // the separate .project-services paragraph) before shipping; see NEXT.md.
  // n8n, Vercel, Railway and Uptime Kuma are included even though they only
  // match via .project-desc text, not a .ptag: JoBot and MCP Server both
  // describe "n8n ... triggers"; Scheduling System's desc names Vercel and
  // Railway; Home Lab and Ops Dashboard both mention "Uptime Kuma".
  var SKILL_PROJECT_ALIASES = {
    'Docker / Docker Compose': { query: 'docker', name: 'Docker' },
    'Tailwind CSS': { query: 'tailwind', name: 'Tailwind' },
    'Prometheus / Grafana': { query: 'prometheus', name: 'Prometheus' },
    'Cloudflare Tunnels & DNS': { query: 'cloudflare', name: 'Cloudflare' },
    'Claude Code / Anthropic API': { query: 'claude code', name: 'Claude Code' },
    'MCP (Custom Server)': { query: 'mcp', name: 'MCP' },
    'REST API Design': { query: 'rest api', name: 'REST API' },
    'Firebase Auth / JWT': { query: 'firebase', name: 'Firebase' },
    'Node.js': { query: 'node.js', name: 'Node.js' },
    'React': { query: 'react', name: 'React' },
    'TypeScript': { query: 'typescript', name: 'TypeScript' },
    'Vite': { query: 'vite', name: 'Vite' },
    'shadcn/ui': { query: 'shadcn', name: 'shadcn/ui' },
    'Express': { query: 'express', name: 'Express' },
    'PostgreSQL': { query: 'postgresql', name: 'PostgreSQL' },
    'Proxmox': { query: 'proxmox', name: 'Proxmox' },
    'Nginx': { query: 'nginx', name: 'Nginx' },
    'Uptime Kuma': { query: 'uptime kuma', name: 'Uptime Kuma' },
    'AdGuard Home': { query: 'adguard', name: 'AdGuard' },
    'LiteLLM': { query: 'litellm', name: 'LiteLLM' },
    'Ollama': { query: 'ollama', name: 'Ollama' },
    'n8n': { query: 'n8n', name: 'n8n' },
    'Vercel': { query: 'vercel', name: 'Vercel' },
    'Railway': { query: 'railway', name: 'Railway' },
    'Cloudflare Pages': { query: 'cloudflare pages', name: 'Cloudflare Pages' }
  };

  // Populated by initSkillTagLinks() below with the subset of
  // SKILL_PROJECT_ALIASES entries that actually got upgraded (>=1 matching
  // card) — the command palette's Skill group is built from exactly this
  // list, so it can never offer a skill that would land on zero results.
  var acceptedSkillAliases = [];

  // Upgrades matched <span class="tag"> elements into interactive
  // tag-links. Safety check: a tag only becomes clickable/focusable if its
  // alias query matches at least one project card, counted across all
  // cards regardless of the current category filter (activation always
  // resets the category to "all", so that's the count that matters), via
  // the same cardMatchesQuery() the search box itself uses. That way a
  // stale alias entry can never lead to an empty result.
  function initSkillTagLinks() {
    if (!searchInput) return;
    var skillTagEls = document.querySelectorAll('.skill-tags .tag');

    skillTagEls.forEach(function (tagEl) {
      var label = tagEl.textContent.trim();
      var alias = SKILL_PROJECT_ALIASES[label];
      if (!alias) return;
      var query = alias.query.toLowerCase();
      var matchCount = 0;
      projectCards.forEach(function (card) {
        if (cardMatchesQuery(card, query)) matchCount++;
      });
      if (matchCount < 1) return;

      acceptedSkillAliases.push({ label: label, alias: alias, matchCount: matchCount });

      tagEl.classList.add('tag-link');
      tagEl.setAttribute('role', 'button');
      tagEl.setAttribute('tabindex', '0');
      tagEl.setAttribute('aria-label', 'Show projects using ' + alias.name + ' (' + matchCount + ')');

      tagEl.addEventListener('click', function () {
        runProjectQuery(alias.query);
      });
      tagEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          runProjectQuery(alias.query);
        }
      });
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

    // Wire up clickable Skills-section tags now that the per-card search
    // haystacks are precomputed and the search box is ready to receive a
    // query from them.
    initSkillTagLinks();

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

  // --- Project detail modal ---
  // Progressive enhancement: skipped unless dialog.showModal() exists, so
  // with JS off or on an unsupported browser the page is unchanged — no
  // Details buttons, no card-click behavior. Reuses projectCards,
  // applyFilter()'s card.style.display convention, and buildHash() from
  // the block above. The hashchange listener up there ignores any hash
  // that doesn't start with "#projects", so "#project=<slug>" never
  // reaches it — this block owns that hash via its own listener.
  var projectModal = document.getElementById('project-modal');

  if (projectCards.length && projectModal && typeof projectModal.showModal === 'function') {
    var modalTitleEl = document.getElementById('project-modal-title');
    var modalBadgeEl = document.querySelector('.project-modal-badge');
    var modalBodyEl = document.getElementById('project-modal-body');
    var modalCounterEl = document.getElementById('project-modal-counter');
    var modalPrevBtn = document.getElementById('project-modal-prev');
    var modalNextBtn = document.getElementById('project-modal-next');
    var modalCloseBtn = document.getElementById('project-modal-close');
    var modalCopyBtn = document.getElementById('project-modal-copy');
    var modalCopyStatusEl = document.getElementById('project-modal-copy-status');
    var modalTrigger = null;
    var copyStatusTimer = null;
    var PROJECT_HASH_RE = /^#project=([\w-]+)$/;

    function slugify(name) {
      return (name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Cache each card's slug once — names are static, no need to
    // re-derive it on every open.
    projectCards.forEach(function (card) {
      var nameEl = card.querySelector('.project-name');
      card.dataset.slug = slugify(nameEl ? nameEl.textContent : '');
    });

    function cardBySlug(slug) {
      for (var i = 0; i < projectCards.length; i++) {
        if (projectCards[i].dataset.slug === slug) {
          return projectCards[i];
        }
      }
      return null;
    }

    // The only thing applyFilter() (above) actually toggles per-card is
    // card.style.display — checking that directly, rather than inventing
    // a parallel "visible" flag, keeps this in sync with the current
    // category + search filter for free.
    function visibleCards() {
      return Array.prototype.filter.call(projectCards, function (card) {
        return card.style.display !== 'none';
      });
    }

    function updateModalCounter(card) {
      var list = visibleCards();
      var idx = list.indexOf(card);
      if (modalCounterEl) {
        if (!list.length) {
          modalCounterEl.textContent = '0 of 0';
        } else {
          // A direct deep link can open a card the current filter/search
          // is hiding; it won't be in the visible list, so there's no
          // real position to report — show it as 1-of-N rather than a
          // confusing "0 of N".
          modalCounterEl.textContent = (idx === -1 ? 1 : idx + 1) + ' of ' + list.length;
        }
      }
      return list;
    }

    // Deep-clones the card's content panels into the modal body, stripping
    // the cloned Details button and any ids (so there's never a duplicate
    // id while the clone is in the DOM).
    function fillModal(card) {
      var nameEl = card.querySelector('.project-name');
      if (modalTitleEl) {
        modalTitleEl.textContent = nameEl ? nameEl.textContent : '';
      }

      var badgeEl = card.querySelector('.badge');
      if (modalBadgeEl) {
        if (badgeEl) {
          modalBadgeEl.className = badgeEl.className + ' project-modal-badge';
          modalBadgeEl.textContent = badgeEl.textContent;
          modalBadgeEl.hidden = false;
        } else {
          modalBadgeEl.hidden = true;
        }
      }

      if (modalBodyEl) {
        modalBodyEl.innerHTML = '';
        ['.project-desc', '.project-services', '.project-tags', '.project-links'].forEach(function (selector) {
          var el = card.querySelector(selector);
          if (!el) return;
          var clone = el.cloneNode(true);
          var openBtn = clone.querySelector('.project-open');
          if (openBtn) openBtn.remove();
          clone.removeAttribute('id');
          clone.querySelectorAll('[id]').forEach(function (node) {
            node.removeAttribute('id');
          });
          modalBodyEl.appendChild(clone);
        });
      }
    }

    function openProject(card, pushHash, trigger) {
      if (!card) return;
      modalTrigger = trigger || card.querySelector('.project-open') || null;
      fillModal(card);
      updateModalCounter(card);
      projectModal.dataset.openSlug = card.dataset.slug;
      document.body.classList.add('modal-open');
      if (!projectModal.open) {
        projectModal.showModal();
      }
      if (pushHash) {
        var newHash = '#project=' + card.dataset.slug;
        if (window.location.hash !== newHash) {
          history.pushState(null, '', newHash);
        }
      }
    }

    // Steps Prev(-1)/Next(+1) through the currently visible cards, with
    // wraparound, and swaps the modal content in place via replaceState
    // (no history entry per step — only the initial open/close go through
    // push/pop).
    function stepProject(delta) {
      var list = visibleCards();
      if (!list.length) return;
      var currentSlug = projectModal.dataset.openSlug;
      var idx = -1;
      for (var i = 0; i < list.length; i++) {
        if (list[i].dataset.slug === currentSlug) {
          idx = i;
          break;
        }
      }
      // The open card may not be in the visible list at all (a deep link
      // opened a card the stored filter hides) — land on the first card
      // for Next, the last for Prev, instead of treating "not found" as
      // index 0 and skipping list[0] on the very first Next press.
      var nextCard = idx === -1
        ? list[delta > 0 ? 0 : list.length - 1]
        : list[(idx + delta + list.length) % list.length];
      fillModal(nextCard);
      updateModalCounter(nextCard);
      projectModal.dataset.openSlug = nextCard.dataset.slug;
      var newHash = '#project=' + nextCard.dataset.slug;
      if (window.location.hash !== newHash) {
        history.replaceState(null, '', newHash);
      }
    }

    function showCopyStatus(message) {
      if (!modalCopyStatusEl) return;
      modalCopyStatusEl.textContent = message;
      clearTimeout(copyStatusTimer);
      copyStatusTimer = setTimeout(function () {
        modalCopyStatusEl.textContent = '';
      }, 2000);
    }

    if (modalCopyBtn) {
      modalCopyBtn.addEventListener('click', function () {
        var url = window.location.origin + window.location.pathname + '#project=' + projectModal.dataset.openSlug;
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(url).then(function () {
            showCopyStatus('Link copied');
          }, function () {
            fallbackCopy(url);
            showCopyStatus('Link copied');
          });
        } else {
          fallbackCopy(url);
          showCopyStatus('Link copied');
        }
      });
    }

    if (modalPrevBtn) {
      modalPrevBtn.addEventListener('click', function () {
        stepProject(-1);
      });
    }
    if (modalNextBtn) {
      modalNextBtn.addEventListener('click', function () {
        stepProject(1);
      });
    }
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', function () {
        projectModal.close();
      });
    }

    // A click landing on the dialog element itself (not a child) hit the
    // ::backdrop area.
    projectModal.addEventListener('click', function (e) {
      if (e.target === projectModal) {
        projectModal.close();
      }
    });

    // 'close' fires for Escape, close(), and the backdrop handler above —
    // one place for cleanup regardless of how the dialog was closed.
    projectModal.addEventListener('close', function () {
      document.body.classList.remove('modal-open');
      if (modalTrigger && typeof modalTrigger.focus === 'function') {
        modalTrigger.focus();
      }
      modalTrigger = null;
      var hash = window.location.hash || '';
      if (PROJECT_HASH_RE.test(hash)) {
        // Not readState(): "#project=<slug>" doesn't start with
        // "#projects", so readState() would take its no-hash branch and
        // drop the live search query. showModal() makes the chips/search
        // box inert while open, so the in-memory filter + query are the
        // correct values to rebuild the hash from.
        history.replaceState(null, '', buildHash({ filter: currentFilterValue, q: currentQuery() }));
      }
    });

    // ArrowLeft/ArrowRight browse Prev/Next while the dialog is open,
    // unless focus is inside an editable control (there's no input in the
    // modal itself today, but this guards against e.g. a user focusing an
    // unrelated field without the dialog having visually closed).
    document.addEventListener('keydown', function (e) {
      if (!projectModal.open) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var target = e.target;
      var tag = target && target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (target && target.isContentEditable)) {
        return;
      }
      e.preventDefault();
      stepProject(e.key === 'ArrowRight' ? 1 : -1);
    });

    // Adds the "Details" button to each card's header and makes the rest
    // of the card (anywhere that isn't an <a> or <button>) open it too.
    function enhanceCards() {
      projectCards.forEach(function (card) {
        var header = card.querySelector('.project-header');
        if (!header || header.querySelector('.project-open')) return;

        var nameEl = card.querySelector('.project-name');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'project-open';
        btn.textContent = 'Details';
        btn.setAttribute('aria-label', 'View details for ' + (nameEl ? nameEl.textContent : 'this project'));
        header.appendChild(btn);
        card.classList.add('has-detail');

        btn.addEventListener('click', function () {
          openProject(card, true, btn);
        });

        card.addEventListener('click', function (e) {
          // Never hijack a click on the GitHub/live-demo links or the
          // Details button itself (already handled by its own listener).
          if (e.target.closest('a, button')) return;
          // A drag-to-select ends in a click; don't treat it as "open".
          var sel = window.getSelection && window.getSelection();
          if (sel && !sel.isCollapsed && card.contains(sel.anchorNode)) return;
          openProject(card, true, btn);
        });
      });
    }

    enhanceCards();

    // Opens (or closes) the modal to match "#project=<slug>" in the URL —
    // run once on load for a direct deep link, and again on every
    // hashchange (Back/Forward, or the hash changing away while open).
    function syncModalWithHash() {
      var hash = window.location.hash || '';
      var match = hash.match(PROJECT_HASH_RE);
      if (!match) {
        if (projectModal.open) {
          projectModal.close();
        }
        return;
      }
      var card = cardBySlug(match[1]);
      if (card) {
        openProject(card, false);
      }
    }

    syncModalWithHash();
    window.addEventListener('hashchange', syncModalWithHash);
  }

  // --- Command palette (Ctrl+K / Cmd+K) ---
  // Progressive enhancement like the project modal above: inert unless
  // dialog.showModal() is supported. Reuses projectCards, selectFilter/
  // syncClearButton/searchInput/scrollToEl, setTheme/currentTheme,
  // acceptedSkillAliases, fallbackCopy and runProjectQuery from above.
  var commandPalette = document.getElementById('command-palette');
  var commandPaletteTrigger = document.getElementById('command-palette-trigger');

  if (commandPalette && typeof commandPalette.showModal === 'function') {
    var cpInput = document.getElementById('command-palette-input');
    var cpList = document.getElementById('command-palette-list');
    var cpEmpty = document.getElementById('command-palette-empty');
    var cpStatus = document.getElementById('command-palette-status');
    // projectModal is in reach here (declared at IIFE scope, above the
    // "if (projectCards.length && projectModal && ...)" block it sits in).
    var projectModalSupported = !!(projectModal && typeof projectModal.showModal === 'function');

    var CP_RECENT_KEY = 'jc-palette-recent';
    var CP_RECENT_MAX = 5;
    var CP_MAX_RESULTS = 12;
    var CP_GROUP_ORDER = ['Sections', 'Projects', 'Skills', 'Actions'];

    var cpItems = [];
    var cpItemsById = {};
    var cpResults = []; // flattened [{ group, item }] currently rendered
    var cpSelectedIndex = -1;
    var cpPriorFocus = null;
    var cpOwnsModalOpenClass = false;
    var cpSuppressFocusRestore = false;
    var cpStatusTimer = null;

    function cpAddItem(item) {
      cpItems.push(item);
      cpItemsById[item.id] = item;
    }

    function cpAnnounce(message) {
      if (!cpStatus) return;
      cpStatus.textContent = message;
      clearTimeout(cpStatusTimer);
      cpStatusTimer = setTimeout(function () {
        cpStatus.textContent = '';
      }, 2000);
    }

    // Same algorithm as the project-modal's slugify(), duplicated: that one
    // is scoped inside the modal's own if-block, so it's unreachable here.
    function cpSlugify(name) {
      return (name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // --- Build the searchable item list once, from the live DOM ---

    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      var label = a.textContent.trim();
      cpAddItem({
        id: 'section:' + href.slice(1),
        group: 'Sections',
        label: label,
        hint: 'Section',
        keywords: label.toLowerCase(),
        run: function () { scrollToEl(target); }
      });
    });

    projectCards.forEach(function (card) {
      var nameEl = card.querySelector('.project-name');
      var label = nameEl ? nameEl.textContent.trim() : '';
      var slug = card.dataset.slug || cpSlugify(label);
      var badgeEl = card.querySelector('.badge');
      var hint = badgeEl ? badgeEl.textContent.trim() : '';
      cpAddItem({
        id: 'project:' + slug,
        group: 'Projects',
        label: label,
        hint: hint,
        keywords: card._searchHaystack || label.toLowerCase(),
        run: function () {
          if (projectModalSupported) {
            window.location.hash = '#project=' + slug;
          } else {
            scrollToEl(card);
          }
        }
      });
    });

    acceptedSkillAliases.forEach(function (entry) {
      cpAddItem({
        id: 'skill:' + entry.label,
        group: 'Skills',
        label: entry.alias.name,
        hint: 'Skill',
        keywords: (entry.label + ' ' + entry.alias.name + ' ' + entry.alias.query).toLowerCase(),
        run: function () { runProjectQuery(entry.alias.query); }
      });
    });

    var themeActionItem = {
      id: 'action:theme',
      group: 'Actions',
      label: '',
      hint: '',
      keywords: 'theme dark light switch toggle appearance',
      run: function () {
        setTheme(currentTheme() === 'light' ? 'dark' : 'light');
      }
    };
    function cpRefreshThemeAction() {
      var isLight = currentTheme() === 'light';
      themeActionItem.label = isLight ? 'Switch to dark theme' : 'Switch to light theme';
      themeActionItem.hint = isLight ? 'Currently light' : 'Currently dark';
    }
    cpRefreshThemeAction();
    cpAddItem(themeActionItem);

    var emailLink = document.querySelector('#contact a[href^="mailto:"]');
    if (emailLink) {
      var emailAddress = emailLink.getAttribute('href').replace(/^mailto:/, '');
      cpAddItem({
        id: 'action:copy-email',
        group: 'Actions',
        label: 'Copy email address',
        hint: emailAddress,
        keywords: 'copy email contact address ' + emailAddress.toLowerCase(),
        // Kept open (see cpRunItem) so the confirmation written to
        // #command-palette-status is actually inside a still-open,
        // non-inert dialog when it's announced.
        keepOpen: true,
        run: function () {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(emailAddress).then(function () {
              cpAnnounce('Email copied');
            }, function () {
              fallbackCopy(emailAddress);
              cpAnnounce('Email copied');
            });
          } else {
            fallbackCopy(emailAddress);
            cpAnnounce('Email copied');
          }
        }
      });
    }

    var resumeLink = document.querySelector('#contact a[href$=".pdf"]');
    if (resumeLink) {
      var resumeHref = resumeLink.getAttribute('href');
      cpAddItem({
        id: 'action:resume',
        group: 'Actions',
        label: 'Open résumé (PDF)',
        hint: 'New tab',
        keywords: 'resume cv pdf download',
        run: function () { window.open(resumeHref, '_blank', 'noopener'); }
      });
    }

    var githubLink = document.querySelector('#contact a[href*="github.com"]');
    if (githubLink) {
      var githubHref = githubLink.getAttribute('href');
      cpAddItem({
        id: 'action:github',
        group: 'Actions',
        label: 'Open GitHub profile',
        hint: 'New tab',
        keywords: 'github profile repo code',
        run: function () { window.open(githubHref, '_blank', 'noopener'); }
      });
    }

    var linkedinLink = document.querySelector('#contact a[href*="linkedin.com"]');
    if (linkedinLink) {
      var linkedinHref = linkedinLink.getAttribute('href');
      cpAddItem({
        id: 'action:linkedin',
        group: 'Actions',
        label: 'Open LinkedIn profile',
        hint: 'New tab',
        keywords: 'linkedin profile',
        run: function () { window.open(linkedinHref, '_blank', 'noopener'); }
      });
    }

    if (emptyClearBtn) {
      cpAddItem({
        id: 'action:clear-filters',
        group: 'Actions',
        label: 'Clear project filters',
        hint: 'Action',
        keywords: 'clear reset filters search projects',
        // The existing handler focuses the search box itself.
        movesFocus: true,
        run: function () { emptyClearBtn.click(); }
      });
    }

    // --- Matching / ranking ---
    // Every space-separated query word must appear somewhere in
    // label+keywords, or the item doesn't match at all (-1). Among matches,
    // rank by how the *whole* trimmed query relates to the label: exact >
    // starts-with > contains > keywords-only.
    function cpItemScore(item, queryWords, rawQuery) {
      var labelLower = item.label.toLowerCase();
      var haystack = labelLower + ' ' + (item.keywords || '');
      for (var i = 0; i < queryWords.length; i++) {
        if (haystack.indexOf(queryWords[i]) === -1) return -1;
      }
      if (labelLower === rawQuery) return 3;
      if (labelLower.indexOf(rawQuery) === 0) return 2;
      if (labelLower.indexOf(rawQuery) !== -1) return 1;
      return 0;
    }

    // Reads/writes are wrapped in try/catch like readStoredTheme() — bad
    // JSON or an unavailable store just leaves "Recent" empty.
    function cpReadRecent() {
      try {
        var arr = JSON.parse(window.localStorage.getItem(CP_RECENT_KEY) || '[]');
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        return [];
      }
    }

    function cpRecordRecent(id) {
      var ids = cpReadRecent().filter(function (existingId) { return existingId !== id; });
      ids.unshift(id);
      try {
        window.localStorage.setItem(CP_RECENT_KEY, JSON.stringify(ids.slice(0, CP_RECENT_MAX)));
      } catch (e) {}
    }

    // Empty query -> Recent (ids that still resolve) + every group in fixed
    // order, uncapped. Non-empty -> global top CP_MAX_RESULTS by score,
    // then re-sorted back into fixed group order for display.
    function cpGetMatches(query) {
      cpRefreshThemeAction();
      var trimmed = query.trim().toLowerCase();
      var groups = {};
      var order = [];

      function addToGroup(groupName, item) {
        if (!groups[groupName]) {
          groups[groupName] = [];
          order.push(groupName);
        }
        groups[groupName].push(item);
      }

      if (trimmed === '') {
        // No cap here — Recent plus every group in fixed order, same as a
        // closed/empty search: the whole site should stay reachable.
        cpReadRecent().slice(0, CP_RECENT_MAX).forEach(function (id) {
          var item = cpItemsById[id];
          if (item) addToGroup('Recent', item);
        });
        CP_GROUP_ORDER.forEach(function (groupName) {
          cpItems.forEach(function (item) {
            if (item.group === groupName) addToGroup(groupName, item);
          });
        });
        var flatAll = [];
        order.forEach(function (groupName) {
          groups[groupName].forEach(function (item) {
            flatAll.push({ group: groupName, item: item });
          });
        });
        return flatAll;
      }

      // Rank ALL matches by score first (so a high-scoring Skill/Action
      // can't be crowded out by lower-scoring Project matches), take the
      // global top ~12, THEN re-sort just that subset back into fixed
      // group order for display.
      var words = trimmed.split(/\s+/).filter(Boolean);
      var scored = [];
      cpItems.forEach(function (item) {
        var score = cpItemScore(item, words, trimmed);
        if (score >= 0) {
          scored.push({ item: item, score: score, groupIndex: CP_GROUP_ORDER.indexOf(item.group) });
        }
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      scored = scored.slice(0, CP_MAX_RESULTS);
      scored.sort(function (a, b) { return a.groupIndex - b.groupIndex; });
      return scored.map(function (s) { return { group: s.item.group, item: s.item }; });
    }

    // --- Rendering ---

    function cpUpdateActiveDescendant() {
      if (cpSelectedIndex >= 0) {
        cpInput.setAttribute('aria-activedescendant', 'cp-opt-' + cpSelectedIndex);
      } else {
        cpInput.setAttribute('aria-activedescendant', '');
      }
    }

    // skipScroll: true for mouse hover, so moving the cursor over
    // partly-visible rows doesn't also yank the list around.
    function cpSetSelected(idx, skipScroll) {
      if (!cpResults.length) {
        cpSelectedIndex = -1;
        return;
      }
      var max = cpResults.length;
      idx = ((idx % max) + max) % max;
      cpSelectedIndex = idx;
      var rows = cpList.querySelectorAll('.command-palette-option');
      rows.forEach(function (row) {
        row.setAttribute('aria-selected', Number(row.dataset.index) === idx ? 'true' : 'false');
      });
      cpUpdateActiveDescendant();
      if (skipScroll) return;
      var activeRow = document.getElementById('cp-opt-' + idx);
      if (activeRow && typeof activeRow.scrollIntoView === 'function') {
        activeRow.scrollIntoView({ block: 'nearest', behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
      }
    }

    function cpRender(query) {
      var matches = cpGetMatches(query);
      cpList.innerHTML = '';
      cpResults = matches;
      cpSelectedIndex = matches.length ? 0 : -1;

      if (!matches.length) {
        cpEmpty.hidden = false;
        var trimmedQuery = query.trim();
        cpEmpty.textContent = trimmedQuery === ''
          ? 'Start typing to search…'
          : 'No matches for “' + trimmedQuery + '”';
        cpInput.setAttribute('aria-expanded', 'false');
        cpUpdateActiveDescendant();
        return;
      }

      cpEmpty.hidden = true;
      cpInput.setAttribute('aria-expanded', 'true');

      var lastGroup = null;
      matches.forEach(function (m, idx) {
        if (m.group !== lastGroup) {
          var heading = document.createElement('li');
          heading.className = 'command-palette-group-heading';
          heading.setAttribute('role', 'presentation');
          heading.textContent = m.group;
          cpList.appendChild(heading);
          lastGroup = m.group;
        }

        var row = document.createElement('li');
        row.id = 'cp-opt-' + idx;
        row.className = 'command-palette-option';
        row.setAttribute('role', 'option');
        row.setAttribute('aria-selected', idx === cpSelectedIndex ? 'true' : 'false');
        row.dataset.index = String(idx);

        var labelSpan = document.createElement('span');
        labelSpan.className = 'command-palette-option-label';
        labelSpan.textContent = m.item.label;
        row.appendChild(labelSpan);

        if (m.item.hint) {
          var hintSpan = document.createElement('span');
          hintSpan.className = 'command-palette-option-hint';
          hintSpan.textContent = m.item.hint;
          row.appendChild(hintSpan);
        }

        row.addEventListener('mouseenter', function () {
          cpSetSelected(idx, true);
        });
        row.addEventListener('click', function () {
          cpRunItem(m.item);
        });

        cpList.appendChild(row);
      });

      cpUpdateActiveDescendant();
    }

    // --- Open / close / run ---

    // No-op while the project modal is open — never stack two <dialog>s.
    function cpOpen() {
      if ((projectModalSupported && projectModal.open) || commandPalette.open) return;
      cpPriorFocus = document.activeElement;
      cpSuppressFocusRestore = false;
      cpInput.value = '';
      cpRender('');
      // Only take ownership (and later removal) of modal-open if nothing
      // else — i.e. not the project modal — already set it.
      cpOwnsModalOpenClass = !document.body.classList.contains('modal-open');
      if (cpOwnsModalOpenClass) document.body.classList.add('modal-open');
      commandPalette.showModal();
      cpInput.focus();
    }

    function cpClose() {
      if (commandPalette.open) commandPalette.close();
    }

    // Selection is recorded before run() fires, per spec. Section/Project/
    // Skill items (and actions flagged movesFocus) move focus themselves,
    // so the palette closes first (with focus-restore suppressed) so that
    // focus move isn't fought or stacked on top of another open dialog.
    function cpRunItem(item) {
      cpRecordRecent(item.id);
      if (item.group !== 'Actions' || item.movesFocus) {
        cpSuppressFocusRestore = true;
        cpClose();
        item.run();
        return;
      }
      item.run();
      if (item.keepOpen) {
        cpInput.focus();
      } else {
        cpClose();
      }
    }

    commandPalette.addEventListener('close', function () {
      if (cpOwnsModalOpenClass) {
        document.body.classList.remove('modal-open');
        cpOwnsModalOpenClass = false;
      }
      if (!cpSuppressFocusRestore && cpPriorFocus && typeof cpPriorFocus.focus === 'function') {
        cpPriorFocus.focus();
      }
      cpPriorFocus = null;
      cpSuppressFocusRestore = false;
    });

    // Backdrop click, same e.target === dialog pattern as the project modal.
    commandPalette.addEventListener('click', function (e) {
      if (e.target === commandPalette) {
        cpClose();
      }
    });

    cpInput.addEventListener('input', function () {
      cpRender(cpInput.value);
    });

    cpInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        cpSetSelected(cpSelectedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cpSetSelected(cpSelectedIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (cpSelectedIndex >= 0 && cpResults[cpSelectedIndex]) {
          cpRunItem(cpResults[cpSelectedIndex].item);
        }
      }
      // Home/End: left unhandled, so the input keeps its default behaviour.
    });

    if (commandPaletteTrigger) {
      commandPaletteTrigger.hidden = false;
      commandPaletteTrigger.addEventListener('click', cpOpen);
    }

    // Toggles from anywhere, including from inside the palette's own input.
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !e.altKey) {
        e.preventDefault();
        if (commandPalette.open) {
          cpClose();
        } else {
          cpOpen();
        }
      }
    });
  }

})();
