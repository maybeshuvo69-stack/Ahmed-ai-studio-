// Lemongrass Restaurant — Concept Demo
// Sample menu data only. These are generic dishes with placeholder prices in BDT.
// They are NOT Lemongrass Restaurant's real menu or real prices.

const MENU = [
  { id: 1, name: "Chicken Biryani", category: "rice-noodles", tag: "Rice & Noodles", price: 320, desc: "Fragrant rice with spiced chicken, served with salad and raita. Sample dish." },
  { id: 2, name: "Beef Tehari", category: "rice-noodles", tag: "Rice & Noodles", price: 340, desc: "Slow-cooked beef with aromatic rice. Sample dish." },
  { id: 3, name: "Thai Green Curry", category: "main", tag: "Main Dishes", price: 450, desc: "Coconut curry with chicken and vegetables, served with steamed rice. Sample dish." },
  { id: 4, name: "Thai Fried Chicken", category: "starters", tag: "Starters", price: 280, desc: "Crispy fried chicken with a light chilli glaze. Sample dish." },
  { id: 5, name: "Chicken Chowmein", category: "rice-noodles", tag: "Rice & Noodles", price: 260, desc: "Stir-fried noodles with chicken and vegetables. Sample dish." },
  { id: 6, name: "Vegetable Fried Rice", category: "rice-noodles", tag: "Rice & Noodles", price: 220, desc: "Wok-fried rice with mixed vegetables and egg. Sample dish." },
  { id: 7, name: "Grilled Chicken", category: "grill", tag: "BBQ & Grill", price: 380, desc: "Char-grilled chicken with herbs and a side salad. Sample dish." },
  { id: 8, name: "BBQ Chicken Wings", category: "grill", tag: "BBQ & Grill", price: 300, desc: "Smoky barbecue wings, 6 pieces. Sample dish." },
  { id: 9, name: "Fish Fillet with Lemon Butter", category: "main", tag: "Main Dishes", price: 420, desc: "Pan-fried fish fillet with lemon butter sauce. Sample dish." },
  { id: 10, name: "Chicken Tikka Masala", category: "main", tag: "Main Dishes", price: 400, desc: "Char-grilled chicken in a creamy spiced sauce, with naan. Sample dish." },
  { id: 11, name: "Spring Rolls (4 pcs)", category: "starters", tag: "Starters", price: 180, desc: "Crispy vegetable spring rolls with sweet chilli dip. Sample dish." },
  { id: 12, name: "Chicken Corn Soup", category: "starters", tag: "Starters", price: 200, desc: "Warm chicken and sweetcorn soup. Sample dish." },
  { id: 13, name: "Beef Curry with Plain Rice", category: "main", tag: "Main Dishes", price: 360, desc: "Home-style beef curry served with plain rice. Sample dish." },
  { id: 14, name: "Mixed Vegetable Curry", category: "main", tag: "Main Dishes", price: 240, desc: "Seasonal vegetables in a mild spiced curry. Sample dish." },
  { id: 15, name: "Chocolate Brownie with Ice Cream", category: "desserts", tag: "Desserts", price: 220, desc: "Warm brownie with a scoop of vanilla ice cream. Sample dish." },
  { id: 16, name: "Rasmalai", category: "desserts", tag: "Desserts", price: 160, desc: "Soft milk dumplings in sweetened milk. Sample dish." },
  { id: 17, name: "Fresh Lime Soda", category: "drinks", tag: "Drinks", price: 90, desc: "Fresh lime, soda water and a little sugar. Sample drink." },
  { id: 18, name: "Mango Lassi", category: "drinks", tag: "Drinks", price: 120, desc: "Blended mango, yoghurt and a touch of honey. Sample drink." },
  { id: 19, name: "Iced Tea", category: "drinks", tag: "Drinks", price: 100, desc: "Chilled black tea with lemon. Sample drink." },
  { id: 20, name: "Mineral Water (500 ml)", category: "drinks", tag: "Drinks", price: 30, desc: "Bottled mineral water. Sample item." }
];

const fmt = (n) => "৳ " + n.toLocaleString("en-IN");

let activeCategory = "all";
let searchTerm = "";
// cart: Map<menuId, qty>
const cart = new Map();

const menuGrid = document.getElementById("menuGrid");
const resultsCount = document.getElementById("resultsCount");
const menuEmpty = document.getElementById("menuEmpty");
const summaryList = document.getElementById("summaryList");
const summaryEmpty = document.getElementById("summaryEmpty");
const summaryTotal = document.getElementById("summaryTotal");

function filteredMenu() {
  const q = searchTerm.trim().toLowerCase();
  return MENU.filter((item) => {
    const inCategory = activeCategory === "all" || item.category === activeCategory;
    const inSearch = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    return inCategory && inSearch;
  });
}

function renderMenu() {
  const items = filteredMenu();
  menuGrid.innerHTML = "";
  menuEmpty.hidden = items.length > 0;
  resultsCount.textContent = items.length + (items.length === 1 ? " dish" : " dishes") + " shown — sample prices, placeholder only.";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "menu-card";

    const top = document.createElement("div");
    top.className = "menu-card-top";
    const title = document.createElement("h3");
    title.textContent = item.name;
    const price = document.createElement("span");
    price.className = "menu-price";
    price.textContent = fmt(item.price) + "*";
    top.append(title, price);

    const tag = document.createElement("span");
    tag.className = "menu-tag";
    tag.textContent = item.tag;

    const desc = document.createElement("p");
    desc.textContent = item.desc;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-add";
    btn.textContent = "Add to Order";
    btn.setAttribute("aria-label", "Add " + item.name + " to order");
    btn.addEventListener("click", () => addToCart(item.id));

    card.append(top, tag, desc, btn);
    menuGrid.appendChild(card);
  });
}

function cartTotal() {
  let total = 0;
  cart.forEach((qty, id) => {
    const item = MENU.find((m) => m.id === id);
    if (item) total += item.price * qty;
  });
  return total;
}

function renderCart() {
  summaryList.innerHTML = "";
  const hasItems = cart.size > 0;
  summaryEmpty.hidden = hasItems;

  cart.forEach((qty, id) => {
    const item = MENU.find((m) => m.id === id);
    if (!item) return;
    const li = document.createElement("li");

    const name = document.createElement("span");
    name.textContent = item.name + " × " + qty;

    const controls = document.createElement("span");
    controls.className = "qty-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "qty-btn";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Remove one " + item.name);
    minus.addEventListener("click", () => changeQty(id, -1));

    const amount = document.createElement("strong");
    amount.textContent = fmt(item.price * qty);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty-btn";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Add one more " + item.name);
    plus.addEventListener("click", () => changeQty(id, 1));

    controls.append(minus, amount, plus);
    li.append(name, controls);
    summaryList.appendChild(li);
  });

  summaryTotal.textContent = fmt(cartTotal());
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
}

function changeQty(id, delta) {
  const next = (cart.get(id) || 0) + delta;
  if (next <= 0) cart.delete(id);
  else cart.set(id, next);
  renderCart();
}

document.getElementById("clearOrder").addEventListener("click", () => {
  cart.clear();
  renderCart();
  document.getElementById("orderConfirm").hidden = true;
});

// Search + filters
document.getElementById("menuSearch").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderMenu();
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    renderMenu();
  });
});

// Order form — demo only, nothing is sent anywhere.
document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("orderName").value.trim();
  const phone = document.getElementById("orderPhone").value.trim();
  const fulfilment = document.querySelector('input[name="fulfilment"]:checked').value;
  const error = document.getElementById("orderError");
  const confirmBox = document.getElementById("orderConfirm");

  if (!name || !phone || cart.size === 0) {
    error.hidden = false;
    confirmBox.hidden = true;
    return;
  }
  error.hidden = true;

  const lines = [];
  cart.forEach((qty, id) => {
    const item = MENU.find((m) => m.id === id);
    if (item) lines.push(item.name + " × " + qty);
  });

  document.getElementById("orderConfirmText").textContent =
    "Sample order for " + name + " (" + fulfilment + ") — " + lines.join(", ") +
    ". Estimated total (sample prices): " + fmt(cartTotal()) + ".";
  confirmBox.hidden = false;
  confirmBox.focus();
});

// Table enquiry — demo only, nothing is sent anywhere.
document.getElementById("bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("bookName").value.trim();
  const phone = document.getElementById("bookPhone").value.trim();
  const date = document.getElementById("bookDate").value;
  const time = document.getElementById("bookTime").value;
  const guests = document.getElementById("bookGuests").value;
  const error = document.getElementById("bookError");
  const confirmBox = document.getElementById("bookConfirm");

  if (!name || !phone || !date || !time || !guests) {
    error.hidden = false;
    confirmBox.hidden = true;
    return;
  }
  error.hidden = true;

  document.getElementById("bookConfirmText").textContent =
    "Sample enquiry for " + name + " — " + guests + " guest(s) on " + date + " at " + time + ".";
  confirmBox.hidden = false;
  confirmBox.focus();
});

renderMenu();
renderCart();
