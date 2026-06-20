(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupGlobalSearch() {
        var input = document.querySelector("[data-global-search]");
        var container = document.querySelector("[data-global-search-results]");
        var button = document.querySelector("[data-global-search-button]");
        if (!input || !container || !window.siteMovies) {
            return;
        }

        function render() {
            var keyword = input.value.trim().toLowerCase();
            if (!keyword) {
                container.innerHTML = "";
                return;
            }
            var results = window.siteMovies.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.region,
                    movie.year,
                    movie.genre,
                    movie.type,
                    movie.category,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return text.indexOf(keyword) !== -1;
            }).slice(0, 18);

            if (!results.length) {
                container.innerHTML = '<div class="empty-message">未找到匹配影片</div>';
                return;
            }

            container.innerHTML = results.map(function (movie) {
                return '<a class="search-result-card" href="' + escapeHtml(movie.link) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
                    '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<small>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</small></span>' +
                    '</a>';
            }).join("");
        }

        input.addEventListener("input", render);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                render();
            }
        });
        if (button) {
            button.addEventListener("click", render);
        }
    }

    function setupFilters() {
        var root = document.querySelector("[data-filter-root]");
        if (!root) {
            return;
        }
        var input = root.querySelector("[data-filter-input]");
        var year = root.querySelector("[data-filter-year]");
        var region = root.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
        var button = root.querySelector("[data-filter-button]");

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region")
                ].join(" ").toLowerCase();
                var visible = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                    visible = false;
                }
                if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                    visible = false;
                }
                card.style.display = visible ? "" : "none";
            });
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        if (button) {
            button.addEventListener("click", apply);
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-stream]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var stream = player.getAttribute("data-stream");
            var prepared = false;
            var hls = null;

            if (!video || !stream) {
                return;
            }

            function prepare() {
                if (prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function start() {
                prepare();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        });
    }

    onReady(function () {
        setupNavigation();
        setupHero();
        setupGlobalSearch();
        setupFilters();
        setupPlayers();
    });
})();
