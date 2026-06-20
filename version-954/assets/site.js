(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function setupNavigation() {
        var button = one('.nav-toggle');
        var nav = one('#mainNav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = one('.hero');
        if (!hero) {
            return;
        }
        var slides = all('.hero-slide', hero);
        var dots = all('.hero-dots button', hero);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        all('.js-filter').forEach(function (form) {
            var rootId = form.getAttribute('data-target');
            var root = rootId ? document.getElementById(rootId) : document;
            var cards = all('.movie-card', root);
            var empty = one('.empty-filter');
            var keyword = one('[data-filter="keyword"]', form);
            var region = one('[data-filter="region"]', form);
            var type = one('[data-filter="type"]', form);
            var year = one('[data-filter="year"]', form);

            function match(card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
                var regionValue = region ? region.value : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                return (!keywordValue || text.indexOf(keywordValue) !== -1)
                    && (!regionValue || cardRegion === regionValue)
                    && (!typeValue || cardType === typeValue)
                    && (!yearValue || cardYear === yearValue);
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = match(card);
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            form.addEventListener('input', apply);
            form.addEventListener('change', apply);
            apply();
        });
    }

    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var url = options.url;
        if (!video || !button || !url) {
            return;
        }

        function hideButton() {
            button.classList.add('is-hidden');
        }

        function play() {
            hideButton();
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', url);
                }
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!video.__playerReady) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    video.__playerReady = true;
                    video.__hlsInstance = hls;
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
                return;
            }
            if (!video.getAttribute('src')) {
                video.setAttribute('src', url);
            }
            video.play().catch(function () {});
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', hideButton);
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
