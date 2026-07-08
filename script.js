const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");

function closeMenu() {
  navToggle?.classList.remove("is-active");
  navMenu?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu?.classList.toggle("is-open");
  navToggle.classList.toggle("is-active", Boolean(isOpen));
  document.body.classList.toggle("menu-open", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const productGrid = document.querySelector("[data-product-grid]");

if (productGrid) {
  const products = Array.from(document.querySelectorAll(".catalog-card"));
  const categoryButtons = document.querySelectorAll(".category-btn");
  const searchInput = document.querySelector("#shop-search");
  const maxPriceInput = document.querySelector("#max-price");
  const sortSelect = document.querySelector("#sort-products");
  const clearFilters = document.querySelector(".clear-filters");
  const emptyState = document.querySelector("[data-empty-state]");
  const cartButton = document.querySelector(".cart-button");
  const cartDrawer = document.querySelector("[data-cart-drawer]");
  const cartOverlay = document.querySelector("[data-cart-overlay]");
  const cartClose = document.querySelector("[data-cart-close]");
  const cartItems = document.querySelector("[data-cart-items]");
  const cartCount = document.querySelector("[data-cart-count]");
  const cartTotal = document.querySelector("[data-cart-total]");
  const cartCheckout = document.querySelector("[data-cart-checkout]");
  const addButtons = document.querySelectorAll(".add-cart");
  const whatsAppNumber = "5500000000000";
  const cart = [];
  let activeCategory = "todos";

  const formatPrice = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);

  function applyFilters() {
    const term = searchInput.value.trim().toLowerCase();
    const maxPrice = Number(maxPriceInput.value) || Infinity;
    let visibleProducts = 0;

    products.forEach((product) => {
      const matchesCategory = activeCategory === "todos" || product.dataset.category === activeCategory;
      const matchesSearch = product.dataset.name.toLowerCase().includes(term) || product.innerText.toLowerCase().includes(term);
      const matchesPrice = Number(product.dataset.price) <= maxPrice;
      const isVisible = matchesCategory && matchesSearch && matchesPrice;

      product.classList.toggle("is-hidden", !isVisible);
      if (isVisible) {
        visibleProducts += 1;
      }
    });

    emptyState.classList.toggle("is-visible", visibleProducts === 0);
  }

  function sortProducts() {
    const sortedProducts = [...products];

    sortedProducts.sort((a, b) => {
      const mode = sortSelect.value;
      const priceA = Number(a.dataset.price);
      const priceB = Number(b.dataset.price);

      if (mode === "price-asc") return priceA - priceB;
      if (mode === "price-desc") return priceB - priceA;
      if (mode === "name") return a.dataset.name.localeCompare(b.dataset.name, "pt-BR");

      return Number(a.dataset.featured) - Number(b.dataset.featured);
    });

    sortedProducts.forEach((product) => productGrid.appendChild(product));
    applyFilters();
  }

  function openCart() {
    cartDrawer.classList.add("is-open");
    cartOverlay.classList.add("is-visible");
    cartDrawer.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    cartDrawer.classList.remove("is-open");
    cartOverlay.classList.remove("is-visible");
    cartDrawer.setAttribute("aria-hidden", "true");
  }

  function updateCheckout(total) {
    const items = cart
      .map((item) => `- ${item.quantity}x ${item.name} (${formatPrice(item.price)} cada)`)
      .join("%0A");
    const message = `Olá! Tenho interesse nesses produtos da Toca do Índio:%0A${items || "- Quero consultar os modelos disponíveis"}%0A%0ATotal estimado: ${formatPrice(total)}`;
    cartCheckout.href = `https://wa.me/${whatsAppNumber}?text=${message}`;
  }

  function renderCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = formatPrice(total);
    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.</p>';
      updateCheckout(0);
      return;
    }

    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <strong>${item.name}</strong>
        <button class="cart-remove" type="button" data-remove-index="${index}" aria-label="Remover ${item.name}">×</button>
        <span>${item.quantity}x ${formatPrice(item.price)}</span>
      `;
      cartItems.appendChild(row);
    });

    updateCheckout(total);
  }

  function addToCart(name, price) {
    const currentItem = cart.find((item) => item.name === name);

    if (currentItem) {
      currentItem.quantity += 1;
    } else {
      cart.push({ name, price: Number(price), quantity: 1 });
    }

    renderCart();
    openCart();
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      activeCategory = button.dataset.category;
      applyFilters();
    });
  });

  searchInput.addEventListener("input", applyFilters);
  maxPriceInput.addEventListener("input", applyFilters);
  sortSelect.addEventListener("change", sortProducts);

  clearFilters.addEventListener("click", () => {
    activeCategory = "todos";
    searchInput.value = "";
    maxPriceInput.value = "";
    sortSelect.value = "featured";
    categoryButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.category === "todos"));
    sortProducts();
  });

  addButtons.forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.name, button.dataset.price));
  });

  cartItems.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-index]");

    if (!removeButton) {
      return;
    }

    cart.splice(Number(removeButton.dataset.removeIndex), 1);
    renderCart();
  });

  cartButton.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
    }
  });

  renderCart();
  applyFilters();
}
