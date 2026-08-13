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
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Scroll-spy: active nav highlighting ---
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navAnchors.forEach(function (a) {
            a.classList.remove('active');
            if (a.getAttribute('href') === '#' + id) {
              a.classList.add('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0.30
    });

    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  // --- Typewriter animation on hero tagline ---
  var tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    var fullText = 'CS student. Systems builder. Ships real things.';
    tagline.textContent = '';

    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '|';
    tagline.appendChild(cursor);

    var charIndex = 0;
    function typeChar() {
      if (charIndex < fullText.length) {
        tagline.insertBefore(document.createTextNode(fullText.charAt(charIndex)), cursor);
        charIndex++;
        setTimeout(typeChar, 55);
      } else {
        cursor.remove();
      }
    }
    setTimeout(typeChar, 300);
  }

})();
