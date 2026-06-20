(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  });

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilter(root, value) {
    var area = root.querySelector('.searchable-area') || document.querySelector('.searchable-area');
    if (!area) {
      return;
    }
    var keyword = String(value || '').trim().toLowerCase();
    var cards = area.querySelectorAll('.movie-card');
    cards.forEach(function (card) {
      card.classList.toggle('is-hidden', keyword && textOf(card).indexOf(keyword) === -1);
    });
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      applyFilter(document, q);
    }
    input.addEventListener('input', function () {
      applyFilter(document, input.value);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter(document, input.value);
    });
  });

  document.querySelectorAll('[data-choice-filter]').forEach(function (bar) {
    bar.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter-value]');
      if (!button) {
        return;
      }
      bar.querySelectorAll('button').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilter(document, button.getAttribute('data-filter-value'));
    });
  });

  document.querySelectorAll('.js-player').forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.player-start');
    var stream = frame.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (!video || !stream || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      load();
      frame.classList.add('playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          frame.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        frame.classList.add('playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
