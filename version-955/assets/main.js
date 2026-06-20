(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var thumbs = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-thumb]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });

        thumbs.forEach(function (thumb, thumbIndex) {
          thumb.classList.toggle("is-active", thumbIndex === index);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function restart() {
        window.clearInterval(timer);
        start();
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      start();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
    var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

    function applyCards() {
      var query = searchInputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(" ");
      var activeButton = document.querySelector("[data-filter-bar] .is-active");
      var filterValue = activeButton ? activeButton.getAttribute("data-filter-value") : "all";
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardType = card.getAttribute("data-card-type") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = filterValue === "all" || cardType.indexOf(filterValue) !== -1 || text.indexOf(filterValue.toLowerCase()) !== -1;
        card.hidden = !(matchQuery && matchFilter);
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", applyCards);
    });

    filterBars.forEach(function (bar) {
      var buttons = Array.prototype.slice.call(bar.querySelectorAll("button"));

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          applyCards();
        });
      });
    });
  });
})();
