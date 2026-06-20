(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var player = document.querySelector("[data-player]");

  if (player && window.currentVideo && window.currentVideo.source) {
    var video = player.querySelector("video");
    var layer = player.querySelector("[data-player-layer]");
    var source = window.currentVideo.source;
    var attached = false;

    var attach = function () {
      if (attached || !video) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var start = function () {
      attach();
      player.classList.add("is-playing");
      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    };

    if (layer) {
      layer.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  var searchResults = document.getElementById("search-results");
  var searchStatus = document.getElementById("search-status");
  var searchInput = document.getElementById("search-input");

  var escapeText = function (value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  var renderCard = function (movie) {
    var tags = (movie.tags || [])
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeText(tag) + "</span>";
      })
      .join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"movie-poster\" href=\"./" + escapeText(movie.url) + "\">" +
      "<img src=\"" + escapeText(movie.image) + "\" alt=\"" + escapeText(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeText(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-info\">" +
      "<div class=\"movie-meta\"><span>" + escapeText(movie.region) + "</span><span>" + escapeText(movie.genre) + "</span></div>" +
      "<h3><a href=\"./" + escapeText(movie.url) + "\">" + escapeText(movie.title) + "</a></h3>" +
      "<p>" + escapeText(movie.oneLine) + "</p>" +
      "<div class=\"tag-list\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  };

  var runSearch = function () {
    if (!searchResults || !window.searchMovies) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (searchInput) {
      searchInput.value = query;
    }

    if (!query) {
      searchResults.innerHTML = "";
      if (searchStatus) {
        searchStatus.textContent = "热门片单";
      }
      return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.searchMovies.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();

      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    }).slice(0, 80);

    if (searchStatus) {
      searchStatus.textContent = matched.length ? "搜索结果" : "没有找到相关内容";
    }

    searchResults.innerHTML = matched.map(renderCard).join("");
  };

  runSearch();
})();
