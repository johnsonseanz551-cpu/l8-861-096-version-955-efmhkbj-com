function initMoviePlayer(source) {
  document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("movie-player");
    var trigger = document.getElementById("play-trigger");
    var hls = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    var start = function () {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }

      if (ready) {
        video.play().catch(function () {});
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        ready = true;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              hls = null;
            }
          }
        });
        return;
      }

      video.src = source;
      ready = true;
      video.play().catch(function () {});
    };

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  });
}
