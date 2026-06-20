(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
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
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
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
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
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
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function setupYearTabs() {
        var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-year-tab]"));
        if (!tabs.length) {
            return;
        }
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-year-panel]"));
        tabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                var year = tab.getAttribute("data-year-tab");
                tabs.forEach(function (item) {
                    item.classList.toggle("is-active", item === tab);
                });
                panels.forEach(function (panel) {
                    panel.classList.toggle("is-active", panel.getAttribute("data-year-panel") === year);
                });
            });
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-input"));
        inputs.forEach(function (input) {
            var targetId = input.getAttribute("data-filter-target");
            var target = targetId ? document.getElementById(targetId) : document;
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
            function apply() {
                var keyword = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    card.classList.toggle("is-filter-hidden", keyword && haystack.indexOf(keyword) === -1);
                });
            }
            input.addEventListener("input", apply);
            apply();
        });
    }

    window.applyInitialSearch = function () {
        var input = document.querySelector(".movie-filter-input");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var value = params.get("q");
        if (value) {
            input.value = value;
            input.dispatchEvent(new Event("input"));
        }
    };

    window.initMoviePlayer = function (videoUrl) {
        var video = document.getElementById("movie-video");
        var layer = document.querySelector(".player-layer");
        if (!video || !videoUrl) {
            return;
        }
        var isReady = false;
        var hlsInstance = null;

        function attach() {
            if (isReady) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
            isReady = true;
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!isReady || video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    ready(function () {
        setupMobileNav();
        setupHero();
        setupYearTabs();
        setupFilters();
    });
})();
