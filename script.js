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

})();
