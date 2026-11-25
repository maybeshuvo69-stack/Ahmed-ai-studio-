// Alankar — concept demo
// No data leaves the browser. The cart lives only in this page's memory,
// and the order form only shows a local confirmation message.

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
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
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
        ? 'Showing 1 sample product'
        : 'Showing ' + shown + ' sample products';
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

  // Toast
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    // Force reflow so the transition replays on repeat adds.
    void toast.offsetWidth;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
      toast.hidden = true;
    }, 2600);
  }

  // Cart (in-memory only — nothing is stored or sent anywhere)
  var cart = {}; // id -> { name, price, qty }
  var cartCountEl = document.getElementById('cart-count');
  var cartItemsEl = document.getElementById('cart-items');
  var cartEmptyEl = document.getElementById('cart-empty');
  var cartFootEl = document.getElementById('cart-foot');
  var cartTotalEl = document.getElementById('cart-total');
  var summaryEmptyEl = document.getElementById('cart-summary-empty');
  var summaryListEl = document.getElementById('cart-summary-list');
  var summaryTotalEl = document.getElementById('cart-summary-total');
  var summaryAmountEl = document.getElementById('cart-summary-amount');

  function cartEntries() {
    return Object.keys(cart).map(function (id) { return cart[id]; });
  }
  function cartCount() {
    return cartEntries().reduce(function (sum, item) { return sum + item.qty; }, 0);
  }
  function cartTotal() {
    return cartEntries().reduce(function (sum, item) { return sum + item.qty * item.price; }, 0);
  }
  function formatTaka(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function renderCart() {
    var count = cartCount();
    var total = cartTotal();
    if (cartCountEl) cartCountEl.textContent = String(count);

    // Drawer list
    if (cartItemsEl) {
      cartItemsEl.innerHTML = '';
      cartEntries().forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'cart-item';
        var name = document.createElement('span');
        name.className = 'cart-item-name';
        name.textContent = item.name;
        var price = document.createElement('span');
        price.className = 'cart-item-price';
        price.textContent = '৳' + formatTaka(item.price) + ' each';
        var controls = document.createElement('div');
        controls.className = 'cart-item-controls';
        var minus = document.createElement('button');
        minus.className = 'qty-btn';
        minus.type = 'button';
        minus.setAttribute('aria-label', 'Decrease quantity of ' + item.name);
        minus.textContent = '−';
        minus.addEventListener('click', function () { changeQty(item.id, -1); });
        var qty = document.createElement('span');
        qty.className = 'cart-item-qty';
        qty.textContent = String(item.qty);
        var plus = document.createElement('button');
        plus.className = 'qty-btn';
        plus.type = 'button';
        plus.setAttribute('aria-label', 'Increase quantity of ' + item.name);
        plus.textContent = '+';
        plus.addEventListener('click', function () { changeQty(item.id, 1); });
        var remove = document.createElement('button');
        remove.className = 'cart-item-remove';
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.addEventListener('click', function () { removeItem(item.id); });
        controls.appendChild(minus);
        controls.appendChild(qty);
        controls.appendChild(plus);
        controls.appendChild(remove);
        li.appendChild(name);
        li.appendChild(price);
        li.appendChild(controls);
        cartItemsEl.appendChild(li);
      });
    }
    if (cartEmptyEl) cartEmptyEl.hidden = count > 0;
    if (cartFootEl) cartFootEl.hidden = count === 0;
    if (cartTotalEl) cartTotalEl.textContent = formatTaka(total);

    // Order-form summary
    if (summaryEmptyEl) summaryEmptyEl.hidden = count > 0;
    if (summaryListEl) {
      summaryListEl.innerHTML = '';
      cartEntries().forEach(function (item) {
        var li = document.createElement('li');
        var name = document.createElement('span');
        name.textContent = item.name + ' × ' + item.qty;
        var amount = document.createElement('strong');
        amount.textContent = '৳' + formatTaka(item.price * item.qty);
        li.appendChild(name);
        li.appendChild(amount);
        summaryListEl.appendChild(li);
      });
      summaryListEl.hidden = count === 0;
    }
    if (summaryTotalEl) summaryTotalEl.hidden = count === 0;
    if (summaryAmountEl) summaryAmountEl.textContent = formatTaka(total);
  }

  function addToCart(id, name, price) {
    if (cart[id]) {
      cart[id].qty += 1;
    } else {
      cart[id] = { id: id, name: name, price: price, qty: 1 };
    }
    renderCart();
    showToast(name + ' added to cart ✓');
  }
  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    renderCart();
  }
  function removeItem(id) {
    if (!cart[id]) return;
    var name = cart[id].name;
    delete cart[id];
    renderCart();
    showToast(name + ' removed from cart');
  }
  function clearCart() {
    cart = {};
    renderCart();
  }

  document.querySelectorAll('.add-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      addToCart(
        btn.getAttribute('data-id') || '',
        btn.getAttribute('data-name') || 'Item',
        parseInt(btn.getAttribute('data-price') || '0', 10) || 0
      );
    });
  });
  renderCart();

  // Cart drawer open / close
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  function openCart() {
    if (!drawer || !overlay) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
  }
  function closeCart() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
  }
  var openBtn = document.getElementById('cart-open');
  if (openBtn) openBtn.addEventListener('click', openCart);
  var closeBtn = document.getElementById('cart-close');
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeCart();
  });
  var checkoutBtn = document.getElementById('cart-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      closeCart();
      var form = document.getElementById('order-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var nameField = document.getElementById('name');
      if (nameField) nameField.focus({ preventScroll: true });
    });
  }
  var clearBtn = document.getElementById('cart-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      clearCart();
      showToast('Cart cleared');
    });
  }

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
    var area = document.getElementById('area').value;
    var channel = document.getElementById('channel').value;

    var nameBad = name.length < 2;
    var phoneBad = !isValidPhone(phone);
    var areaBad = area === '';
    var channelBad = channel === '';
    var cartBad = cartCount() === 0;

    setError('name', 'name-error', nameBad);
    setError('phone', 'phone-error', phoneBad);
    setError('area', 'area-error', areaBad);
    setError('channel', 'channel-error', channelBad);

    if (nameBad || phoneBad || areaBad || channelBad) {
      if (success) success.hidden = true;
      var firstBad = document.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }
    if (cartBad) {
      if (success) success.hidden = true;
      showToast('Your cart is empty — add a product first');
      var catalogue = document.getElementById('catalogue');
      if (catalogue) catalogue.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    var itemsText = cartEntries().map(function (item) {
      return item.name + ' × ' + item.qty + ' (৳' + formatTaka(item.price * item.qty) + ')';
    }).join(', ');

    if (success) {
      success.textContent =
        'Thank you, ' + name + '. Your order enquiry for ' + itemsText +
        ' — sample total ৳' + formatTaka(cartTotal()) + ' (' + area.toLowerCase() + ') — has been noted in this demo. ' +
        'This is an enquiry only — not a confirmed order. The shop will contact you on ' +
        phone + ' via ' + channel + ' to confirm the price, compatibility and delivery. No payment was taken.';
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    clearCart();
    form.reset();
  });

  // Clear an error as soon as the user corrects that field
  form.addEventListener('input', function (event) {
    var field = event.target;
    if (!field || !field.id) return;
    var map = { name: 'name-error', phone: 'phone-error' };
    if (map[field.id]) setError(field.id, map[field.id], false);
  });
  form.addEventListener('change', function (event) {
    var field = event.target;
    if (!field || !field.id) return;
    var map = { area: 'area-error', channel: 'channel-error' };
    if (map[field.id]) setError(field.id, map[field.id], false);
  });
})();
