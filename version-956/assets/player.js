(function () {
  window.initMoviePlayer = function (sourceUrl) {
    var shell = document.querySelector("[data-player]");

    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var message = shell.querySelector(".player-message");
    var prepared = false;
    var requested = false;
    var hls = null;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function attemptPlay() {
      if (!video) {
        return;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    function prepare() {
      if (prepared || !video || !sourceUrl) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            attemptPlay();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("视频暂时无法播放，请稍后再试。");
          }
        });
        return;
      }

      showMessage("视频暂时无法播放，请稍后再试。");
    }

    function start() {
      requested = true;
      prepare();
      shell.classList.add("is-playing");
      attemptPlay();
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
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
