// La Boutique — concept demo
// No data leaves the browser. The order form only shows a local
// confirmation message; nothing is sent to the store from this sample page.

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

  // Catalogue: search + category filter
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
        ? 'Showing 1 sample style'
        : 'Showing ' + shown + ' sample styles';
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

  // Product cards: "Order this item" pre-selects that item in the order form
  var itemSelect = document.getElementById('item');
  document.querySelectorAll('.order-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.getAttribute('data-item') || '';
      if (itemSelect && item) {
        var option = Array.prototype.find.call(itemSelect.options, function (opt) {
          return opt.value === item;
        });
        if (option) {
          itemSelect.value = item;
          itemSelect.setAttribute('aria-invalid', 'false');
          var err = document.getElementById('item-error');
          if (err) err.hidden = true;
        }
      }
      var form = document.getElementById('order-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Order form validation + local confirmation
  var form = document.getElementById('order-form');
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
    var item = document.getElementById('item').value;
    var size = document.getElementById('size').value;
    var quantity = document.getElementById('quantity').value;
    var area = document.getElementById('area').value;
    var channel = document.getElementById('channel').value;

    var nameBad = name.length < 2;
    var phoneBad = !isValidPhone(phone);
    var itemBad = item === '';
    var sizeBad = size === '';
    var areaBad = area === '';
    var channelBad = channel === '';

    setError('name', 'name-error', nameBad);
    setError('phone', 'phone-error', phoneBad);
    setError('item', 'item-error', itemBad);
    setError('size', 'size-error', sizeBad);
    setError('area', 'area-error', areaBad);
    setError('channel', 'channel-error', channelBad);

    if (nameBad || phoneBad || itemBad || sizeBad || areaBad || channelBad) {
      if (success) success.hidden = true;
      var firstBad = document.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }

    if (success) {
      success.textContent =
        'Thank you, ' + name + '. Your order enquiry for ' + item +
        ' (size ' + size + ', quantity ' + quantity + ', ' + area.toLowerCase() +
        ') has been noted in this demo. ' +
        'This is an enquiry only — not a confirmed order. The store will contact you on ' +
        phone + ' via ' + channel + ' to confirm the price, size and delivery. No payment was taken.';
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
      item: 'item-error',
      size: 'size-error',
      area: 'area-error',
      channel: 'channel-error'
    };
    if (map[field.id]) setError(field.id, map[field.id], false);
  });
  form.addEventListener('change', function (event) {
    var field = event.target;
    if (!field || !field.id) return;
    var map = {
      item: 'item-error',
      size: 'size-error',
      area: 'area-error',
      channel: 'channel-error'
    };
    if (map[field.id]) setError(field.id, map[field.id], false);
  });
})();
