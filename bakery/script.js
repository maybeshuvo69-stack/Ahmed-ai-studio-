
/* Misti Bake House — concept demo by Ahmed AI Studio.
   Nav, scroll reveal, catalogue search/filter, cart + toast, order form. */
(function () {
  "use strict";

  /* Header shadow on scroll */
  var header = document.getElementById("site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Scroll reveal (disabled under prefers-reduced-motion via CSS) */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* Catalogue search + filter */
  var searchInput = document.getElementById("search");
  var pills = document.querySelectorAll(".pill");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".product-card"));
  var countEl = document.getElementById("catalogue-count");
  var emptyEl = document.getElementById("catalogue-empty");
  var activeFilter = "all";

  function applyFilters() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var shown = 0;
    cards.forEach(function (card) {
      var name = (card.getAttribute("data-name") || "").toLowerCase();
      var matchFilter = activeFilter === "all" || card.getAttribute("data-category") === activeFilter;
      var matchSearch = !q || name.indexOf(q) !== -1;
      var show = matchFilter && matchSearch;
      card.classList.toggle("hidden", !show);
      if (show) shown += 1;
    });
    if (countEl) {
      countEl.textContent = shown === 1
        ? "Showing 1 sample item"
        : "Showing " + shown + " sample items";
    }
    if (emptyEl) emptyEl.classList.toggle("show", shown === 0);
  }
  if (searchInput) searchInput.addEventListener("input", applyFilters);
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      activeFilter = pill.getAttribute("data-filter") || "all";
      applyFilters();
    });
  });

  /* Toast */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }

  /* Cart */
  var cart = [];
  var cartBtn = document.getElementById("cart-btn");
  var cartCount = document.getElementById("cart-count");
  var drawer = document.getElementById("cart-drawer");
  var overlay = document.getElementById("cart-overlay");
  var cartItemsEl = document.getElementById("cart-items");
  var cartTotalEl = document.getElementById("cart-total");
  var checkoutBtn = document.getElementById("checkout-btn");

  function formatTaka(n) { return "\u09F3" + n.toLocaleString("en-US"); }

  function cartQty() {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }
  function cartTotal() {
    return cart.reduce(function (sum, item) { return sum + item.qty * item.price; }, 0);
  }

  function renderCart() {
    if (cartCount) cartCount.textContent = String(cartQty());
    if (cartTotalEl) cartTotalEl.textContent = formatTaka(cartTotal());
    if (!cartItemsEl) return;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Add a sample item from the catalogue above.</p>';
      return;
    }
    cartItemsEl.innerHTML = "";
    cart.forEach(function (item, index) {
      var row = document.createElement("article");
      row.className = "cart-item";
      var img = document.createElement("img");
      img.src = item.img;
      img.alt = "";
      img.loading = "lazy";
      var mid = document.createElement("div");
      var title = document.createElement("h3");
      title.textContent = item.name;
      var price = document.createElement("p");
      price.className = "cart-price";
      price.textContent = formatTaka(item.price) + " each \u00B7 \u09A8\u09AE\u09C1\u09A8\u09BE \u09AE\u09C2\u09B2\u09CD\u09AF";
      var qty = document.createElement("div");
      qty.className = "qty-controls";
      var minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "\u2212";
      minus.setAttribute("aria-label", "Decrease quantity of " + item.name);
      minus.addEventListener("click", function () {
        if (item.qty > 1) { item.qty -= 1; } else { cart.splice(index, 1); }
        renderCart();
      });
      var num = document.createElement("span");
      num.textContent = String(item.qty);
      var plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Increase quantity of " + item.name);
      plus.addEventListener("click", function () { item.qty += 1; renderCart(); });
      qty.appendChild(minus);
      qty.appendChild(num);
      qty.appendChild(plus);
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        cart.splice(index, 1);
        renderCart();
        showToast(item.name + " removed from cart.");
      });
      mid.appendChild(title);
      mid.appendChild(price);
      mid.appendChild(qty);
      mid.appendChild(remove);
      var total = document.createElement("span");
      total.className = "cart-line-total";
      total.textContent = formatTaka(item.price * item.qty);
      row.appendChild(img);
      row.appendChild(mid);
      row.appendChild(total);
      cartItemsEl.appendChild(row);
    });
  }

  function openCart() {
    if (drawer) drawer.classList.add("open");
    if (overlay) overlay.classList.add("open");
    if (drawer) drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    if (drawer) drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  if (cartBtn) cartBtn.addEventListener("click", openCart);
  var cartClose = document.getElementById("cart-close");
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (overlay) overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCart();
  });

  document.querySelectorAll(".add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-item") || "Sample item";
      var price = parseInt(btn.getAttribute("data-price") || "0", 10) || 0;
      var img = btn.getAttribute("data-img") || "";
      var existing = null;
      cart.forEach(function (item) { if (item.name === name) existing = item; });
      if (existing) { existing.qty += 1; } else { cart.push({ name: name, price: price, img: img, qty: 1 }); }
      renderCart();
      showToast(name + " added to cart.");
    });
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (cart.length === 0) {
        showToast("Your cart is empty.");
        return;
      }
      showToast("This is a concept demo \u2014 no order is placed and no payment is taken.");
    });
  }
  renderCart();

  /* Order form */
  var form = document.getElementById("order-form");
  if (form) {
    var successEl = document.getElementById("form-success");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      function check(id, valid) {
        var field = document.getElementById(id);
        var err = document.getElementById(id + "-error");
        if (field) field.setAttribute("aria-invalid", valid ? "false" : "true");
        if (err) err.hidden = valid;
        if (!valid) ok = false;
      }
      var name = document.getElementById("name");
      var phone = document.getElementById("phone");
      var item = document.getElementById("item");
      var area = document.getElementById("area");
      var channel = document.getElementById("channel");
      check("name", !!(name && name.value.trim()));
      check("phone", !!(phone && /^01[3-9]\d{8}$/.test(phone.value.trim())));
      check("item", !!(item && item.value));
      check("area", !!(area && area.value));
      check("channel", !!(channel && channel.value));
      if (!ok) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var itemName = item.options[item.selectedIndex].text;
      if (successEl) {
        successEl.hidden = false;
        successEl.textContent = "Thank you, " + name.value.trim() + "! Your enquiry for " + itemName +
          " has been noted in this demo only \u2014 nothing was sent to the shop. This is a concept demo, not a real order.";
      }
      form.reset();
      if (successEl) successEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    ["name", "phone", "item", "area", "channel"].forEach(function (id) {
      var field = document.getElementById(id);
      if (field) {
        field.addEventListener("input", function () {
          field.setAttribute("aria-invalid", "false");
          var err = document.getElementById(id + "-error");
          if (err) err.hidden = true;
        });
      }
    });
  }
})();
