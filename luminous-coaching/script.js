// Luminous University Admission Coaching — concept demo
// No data leaves the browser. The enquiry form only shows a local
// confirmation message; nothing is sent to the coaching centre from this sample page.

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

  // Courses: search + group filter
  var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
  var searchInput = document.getElementById('search');
  var countEl = document.getElementById('catalogue-count');
  var emptyEl = document.getElementById('catalogue-empty');
  var activeFilter = 'all';

  function applyFilter() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var shown = 0;
    cards.forEach(function (card) {
      var matchesCategory = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
      var haystack = ((card.getAttribute('data-name') || '') + ' ' + card.textContent).toLowerCase();
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var show = matchesCategory && matchesQuery;
      card.classList.toggle('hidden', !show);
      if (show) shown += 1;
    });
    if (countEl) {
      countEl.textContent = shown === 1
        ? 'Showing 1 sample course'
        : 'Showing ' + shown + ' sample courses';
    }
    if (emptyEl) emptyEl.classList.toggle('show', shown === 0);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilter);
  document.querySelectorAll('.filter-pills .pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      document.querySelectorAll('.filter-pills .pill').forEach(function (p) {
        p.classList.remove('active');
      });
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });

  // Course cards: "Enquire about this course" pre-selects that course in the form
  var courseSelect = document.getElementById('course');
  document.querySelectorAll('.order-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.getAttribute('data-item') || '';
      if (courseSelect && item) {
        var option = Array.prototype.find.call(courseSelect.options, function (opt) {
          return opt.value === item;
        });
        if (option) {
          courseSelect.value = item;
          courseSelect.setAttribute('aria-invalid', 'false');
          var err = document.getElementById('course-error');
          if (err) err.hidden = true;
        }
      }
      var form = document.getElementById('enquiry-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Enquiry form validation + local confirmation
  var form = document.getElementById('enquiry-form');
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
    var digits = value.replace(/[\s\-()]/g, '');
    return /^(?:\+?880|0)?1[3-9]\d{8}$/.test(digits);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var name = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var course = document.getElementById('course').value;
    var batch = document.getElementById('batch').value;
    var branch = document.getElementById('branch').value;

    var nameBad = name.length < 2;
    var phoneBad = !isValidPhone(phone);
    var courseBad = course === '';
    var batchBad = batch === '';
    var branchBad = branch === '';

    setError('name', 'name-error', nameBad);
    setError('phone', 'phone-error', phoneBad);
    setError('course', 'course-error', courseBad);
    setError('batch', 'batch-error', batchBad);
    setError('branch', 'branch-error', branchBad);

    if (nameBad || phoneBad || courseBad || batchBad || branchBad) {
      if (success) success.hidden = true;
      var firstBad = document.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }

    if (success) {
      success.textContent =
        'Thank you, ' + name + '. Your admission enquiry for ' + course +
        ' (' + batch.toLowerCase() + ', ' + branch +
        ') has been noted in this demo. ' +
        'This is an enquiry only — not a confirmed admission. The coaching centre will contact you on ' +
        phone + ' to confirm the fee, batch timing and admission process. No data was sent anywhere.';
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.reset();
  });

  // Clear an error as soon as the user corrects that field
  var errorMap = {
    name: 'name-error',
    phone: 'phone-error',
    course: 'course-error',
    batch: 'batch-error',
    branch: 'branch-error'
  };
  form.addEventListener('input', function (event) {
    var field = event.target;
    if (!field || !field.id || !errorMap[field.id]) return;
    setError(field.id, errorMap[field.id], false);
  });
  form.addEventListener('change', function (event) {
    var field = event.target;
    if (!field || !field.id || !errorMap[field.id]) return;
    setError(field.id, errorMap[field.id], false);
  });
})();
