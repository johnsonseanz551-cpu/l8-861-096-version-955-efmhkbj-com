(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function startTimer() {
            if (slides.length < 2) {
                return;
            }
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startTimer();
            });
        });

        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }
        startTimer();

        Array.prototype.slice.call(document.querySelectorAll(".js-filter-input")).forEach(function (input) {
            var scope = document.querySelector(".js-card-scope") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var label = input.parentElement ? input.parentElement.querySelector(".js-result-label") : null;
            var params = new URLSearchParams(window.location.search);
            var preset = params.get("q");
            if (preset) {
                input.value = preset;
            }
            function applyFilter() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || card.textContent.toLowerCase();
                    var matched = !query || text.indexOf(query) !== -1;
                    card.classList.toggle("hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (label) {
                    label.textContent = query ? "匹配 " + visible + " 部" : "";
                }
            }
            input.addEventListener("input", applyFilter);
            applyFilter();
        });

        Array.prototype.slice.call(document.querySelectorAll(".player-card")).forEach(function (card) {
            var video = card.querySelector("video");
            var overlay = card.querySelector(".play-overlay");
            var initialized = false;
            var hlsInstance = null;

            function begin() {
                if (!video) {
                    return;
                }
                var source = video.getAttribute("data-m3u8");
                if (!source) {
                    return;
                }
                if (!initialized) {
                    initialized = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                }
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var playCall = video.play();
                if (playCall && typeof playCall.catch === "function") {
                    playCall.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", begin);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        begin();
                    }
                });
                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
