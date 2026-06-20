(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilterableLists();
    setupGlobalSearchForms();
    setupPlayers();
  });

  function setupMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var opened = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!opened));
      menu.hidden = opened;
    });
  }

  function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var next = document.querySelector(".hero-next");
    var prev = document.querySelector(".hero-prev");
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6000);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-slide-target"));
        show(target);
        restart();
      });
    });

    restart();
  }

  function setupFilterableLists() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".filterable-list"));
    if (!lists.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".page-search-input"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var activeFilter = "all";

    searchInputs.forEach(function (input) {
      input.value = query;
      input.addEventListener("input", function () {
        query = input.value.trim().toLowerCase();
        applyFilters();
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = (chip.getAttribute("data-filter") || "all").toLowerCase();
        applyFilters();
      });
    });

    function applyFilters() {
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
        var visible = 0;
        cards.forEach(function (card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var matchesQuery = !query || searchText.indexOf(query) !== -1;
          var matchesFilter = activeFilter === "all" || searchText.indexOf(activeFilter) !== -1 || (card.getAttribute("data-category") || "") === activeFilter;
          var shouldShow = matchesQuery && matchesFilter;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });
        var empty = list.parentElement.querySelector(".empty-state");
        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    }

    applyFilters();
  }

  function setupGlobalSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".global-search-form"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var source = player.getAttribute("data-source");
      var hlsInstance = null;
      var initialized = false;

      if (!video || !source) {
        return;
      }

      function initialize() {
        if (initialized) {
          return;
        }
        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        initialize();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      player.addEventListener("click", function (event) {
        if (event.target === player) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
