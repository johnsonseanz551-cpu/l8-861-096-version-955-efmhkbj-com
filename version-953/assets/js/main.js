document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const hero = document.querySelector("[data-hero-carousel]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let activeIndex = 0;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === activeIndex);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === activeIndex);
      });
    };

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(activeIndex - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        showSlide(itemIndex);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 6200);
  }

  const searchInput = document.querySelector(".search-input");
  const cards = Array.from(document.querySelectorAll("[data-search-card]"));
  const emptyState = document.querySelector(".empty-state");
  const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
  let activeFilter = "all";

  const normalize = function (value) {
    return String(value || "").toLowerCase().trim();
  };

  const applyFilter = function () {
    const query = normalize(searchInput ? searchInput.value : "");
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = normalize(card.getAttribute("data-search"));
      const tags = normalize(card.getAttribute("data-tags"));
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const matchesFilter = activeFilter === "all" || tags.indexOf(normalize(activeFilter)) !== -1 || text.indexOf(normalize(activeFilter)) !== -1;
      const isVisible = matchesQuery && matchesFilter;
      card.style.display = isVisible ? "" : "none";
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }
  };

  if (searchInput && cards.length) {
    searchInput.addEventListener("input", applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("active");
      });
      button.classList.add("active");
      activeFilter = button.getAttribute("data-filter") || "all";
      applyFilter();
    });
  });
});
