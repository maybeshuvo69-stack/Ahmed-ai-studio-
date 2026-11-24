// Dr. Setu's Skin & Aesthetic Center — concept demo (redesigned)
// No data leaves the browser. The booking form only shows a local
// confirmation message; nothing is sent to the clinic from this sample page.

(function () {
  'use strict';

  // Sticky header shadow on scroll
  var header = document.getElementById('site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll-reveal animations (respects reduced motion via CSS)
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  // Active nav link highlighting
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]:not(.btn)');
  var sections = Array.prototype.map.call(navLinks, function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  // Service cards: "Request this service" pre-selects that service in the booking form
  var serviceSelect = document.getElementById('service');
  document.querySelectorAll('.service-link').forEach(function (link) {
    link.addEventListener('click', function () {
      var card = link.closest('.service-card');
      var title = card && card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '';
      if (serviceSelect && title) {
        var option = Array.prototype.find.call(serviceSelect.options, function (opt) {
          return opt.value === title;
        });
        if (option) {
          serviceSelect.value = title;
          serviceSelect.setAttribute('aria-invalid', 'false');
          var err = document.getElementById('service-error');
          if (err) err.hidden = true;
        }
      }
    });
  });

  // Booking form: minimum date is today (local time)
  var dateInput = document.getElementById('date');
  if (dateInput) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = yyyy + '-' + mm + '-' + dd;
  }

  // Booking form validation + local confirmation
  var form = document.getElementById('booking-form');
  var success = document.getElementById('form-success');
  if (!form) return;

  function setError(fieldId, errorId, hasError) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (!field || !error) return;
    error.hidden = !hasError;
    field.setAttribute('aria-invalid', String(hasError));
  }

  function isValidPhone(value) {
    // Accept Bangladeshi mobile numbers with optional spaces, dashes or +880.
    // e.g. 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX
    var digits = value.replace(/[\s\-()]/g, '');
    return /^(?:\+?880|0)?1[3-9]\d{8}$/.test(digits);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var name = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var service = document.getElementById('service').value;
    var date = document.getElementById('date').value;
    var time = document.getElementById('time').value;

    var nameBad = name.length < 2;
    var phoneBad = !isValidPhone(phone);
    var serviceBad = service === '';
    var timeBad = time === '';

    var dateBad = date === '';
    if (!dateBad && dateInput && dateInput.min) {
      dateBad = date < dateInput.min;
    }

    setError('name', 'name-error', nameBad);
    setError('phone', 'phone-error', phoneBad);
    setError('service', 'service-error', serviceBad);
    setError('date', 'date-error', dateBad);
    setError('time', 'time-error', timeBad);

    if (nameBad || phoneBad || serviceBad || dateBad || timeBad) {
      if (success) success.hidden = true;
      var firstBad = document.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }

    var readableDate = date;
    try {
      readableDate = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (e) {
      readableDate = date;
    }

    if (success) {
      success.textContent =
        'Thank you, ' + name + '. Your booking request for ' + service +
        ' on ' + readableDate + ' (' + time.toLowerCase() + ') has been noted in this demo. ' +
        'This is a request only — not a confirmed appointment. The clinic will contact you on ' +
        phone + ' to confirm. No payment was taken.';
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.reset();
  });

  // Clear an error as soon as the user corrects that field
  form.addEventListener('input', function (event) {
    var field = event.target;
    if (!field || !field.id) return;
    var map = {
      name: 'name-error',
      phone: 'phone-error',
      service: 'service-error',
      date: 'date-error',
      time: 'time-error'
    };
    if (map[field.id]) setError(field.id, map[field.id], false);
  });
})();
