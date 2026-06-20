(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var trigger = shell.querySelector("[data-play-trigger]");
      var overlay = shell.querySelector(".player-overlay");
      var started = false;
      var hls = null;

      if (!video) {
        return;
      }

      function attach() {
        if (started) {
          return;
        }

        started = true;
        var stream = video.getAttribute("data-stream") || "";

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 40,
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        var action = video.play();

        if (action && typeof action.catch === "function") {
          action.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (trigger) {
        trigger.addEventListener("click", play);
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
