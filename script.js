// ============================================
// Jordan Coomber — Portfolio Scripts
// ============================================

(function () {
  'use strict';

  // --- Mobile Navigation Toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      // Animate hamburger
      navToggle.classList.toggle('active');
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
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
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      // A bare "#" (e.g. the nav logo) is not a valid selector and
      // throws in document.querySelector — skip it.
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
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
  var filterChips = document.querySelectorAll('.filter-chip');
  var projectCards = document.querySelectorAll('.project-card');
  var filterCount = document.querySelector('.filter-count');

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
  }

  if (filterChips.length && projectCards.length) {
    setCount(projectCards.length);
    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        filterChips.forEach(function (c) {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        applyFilter(chip.getAttribute('data-filter'));
      });
    });
  }

})();
