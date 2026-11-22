/**
 * Persistent Full-Screen Background Video Controller (YouTube IFrame API & HTML5 Fallback)
 * Video ID: 85kTHwJ1Ju8 (Rural farming / agriculture in slow-motion)
 */
(function() {
  const YT_VIDEO_ID = '85kTHwJ1Ju8';
  let ytPlayer = null;
  let timeSaveInterval = null;

  // Accessibility & Slow Network Checks
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSaveData = conn && (conn.saveData === true || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g');
  let isBgPaused = localStorage.getItem('fdd_bg_paused') === 'true';

  const posterEl = document.getElementById('bg-poster-fallback');
  const ytWrapper = document.getElementById('yt-bg-wrapper');
  const html5Fallback = document.getElementById('html5-bg-fallback-video');

  // If user prefers reduced motion or is on data saver / slow 2G, stick to static poster image
  if (prefersReducedMotion || isSaveData) {
    if (posterEl) posterEl.style.opacity = '1';
    console.info('[BG-VIDEO] Motion reduced or Save-Data active. Showing static poster fallback.');
    return;
  }

  // Load YouTube IFrame API asynchronously
  if (!window.YT || !window.YT.Player) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tag, firstScript);
    } else {
      document.head.appendChild(tag);
    }
  } else if (window.YT && window.YT.Player) {
    initYouTubeBackgroundPlayer();
  }

  // YouTube IFrame API Ready Callback
  const existingOnReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function() {
    if (typeof existingOnReady === 'function') {
      try { existingOnReady(); } catch (e) {}
    }
    initYouTubeBackgroundPlayer();
  };

  function initYouTubeBackgroundPlayer() {
    if (ytPlayer || !document.getElementById('yt-bg-player')) return;

    const savedResumeTime = parseFloat(sessionStorage.getItem('fdd_bg_video_time') || '0');

    try {
      ytPlayer = new YT.Player('yt-bg-player', {
        videoId: YT_VIDEO_ID,
        playerVars: {
          autoplay: isBgPaused ? 0 : 1,
          mute: 1,
          loop: 1,
          playlist: YT_VIDEO_ID,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
          start: Math.floor(savedResumeTime)
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
      window.ytBgPlayer = ytPlayer;
    } catch (err) {
      console.warn('[BG-VIDEO] YouTube API initialization failed, falling back to HTML5:', err);
      activateHtml5Fallback();
    }
  }

  function onPlayerReady(event) {
    event.target.mute();
    try {
      event.target.setPlaybackRate(0.5);
    } catch (e) {}

    const savedResumeTime = parseFloat(sessionStorage.getItem('fdd_bg_video_time') || '0');
    if (savedResumeTime > 0) {
      event.target.seekTo(savedResumeTime, true);
    }

    if (!isBgPaused) {
      event.target.playVideo();
    }

    setTimeout(() => {
      if (ytWrapper) ytWrapper.style.opacity = '1';
      if (posterEl) posterEl.style.opacity = '0';
    }, 600);

    clearInterval(timeSaveInterval);
    timeSaveInterval = setInterval(() => {
      if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        const curTime = ytPlayer.getCurrentTime();
        if (curTime > 0) {
          sessionStorage.setItem('fdd_bg_video_time', curTime.toFixed(1));
        }
      }
    }, 1000);
  }

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
      if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
        ytPlayer.seekTo(0, true);
        ytPlayer.playVideo();
      }
    } else if (event.data === YT.PlayerState.PLAYING) {
      if (ytWrapper) ytWrapper.style.opacity = '1';
      if (posterEl) posterEl.style.opacity = '0';
      try {
        ytPlayer.setPlaybackRate(0.5);
      } catch (e) {}
    }
  }

  function onPlayerError(event) {
    console.warn(`[BG-VIDEO] YouTube embed error ${event.data} for ${YT_VIDEO_ID}. Switching to local fallback video.`);
    activateHtml5Fallback();
  }

  function activateHtml5Fallback() {
    if (ytWrapper) ytWrapper.classList.add('hidden');
    if (html5Fallback) {
      html5Fallback.classList.remove('hidden');
      html5Fallback.playbackRate = 0.5;
      if (!isBgPaused) {
        html5Fallback.play().then(() => {
          html5Fallback.style.opacity = '1';
          if (posterEl) posterEl.style.opacity = '0';
        }).catch(() => {
          if (posterEl) posterEl.style.opacity = '1';
        });
      }
    }
  }

  // Page Visibility API: Pause when tab is hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
        ytPlayer.pauseVideo();
      }
      if (html5Fallback) html5Fallback.pause();
    } else {
      if (!isBgPaused) {
        if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
          ytPlayer.playVideo();
        }
        if (html5Fallback) html5Fallback.play().catch(() => {});
      }
    }
  } );

  // Programmatic pause/play toggle
  window.toggleBackgroundVideo = function() {
    isBgPaused = !isBgPaused;
    localStorage.setItem('fdd_bg_paused', isBgPaused ? 'true' : 'false');

    if (isBgPaused) {
      if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
      if (html5Fallback) html5Fallback.pause();
    } else {
      if (ytPlayer && typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
      if (html5Fallback) html5Fallback.play().catch(() => {});
    }
  };
})();
