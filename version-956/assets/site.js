(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-prev");
      var next = carousel.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-search-area]").forEach(function (area) {
      var input = area.querySelector(".movie-search");
      var select = area.querySelector(".movie-filter");
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));
      var empty = area.querySelector(".empty-state");

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var filter = select ? select.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchFilter = !filter || text.indexOf(filter) !== -1;
          var showCard = matchKeyword && matchFilter;
          card.hidden = !showCard;
          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (select) {
        select.addEventListener("change", apply);
      }
    });
  });
})();
