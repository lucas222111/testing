/**
 * GeminiTA6 - The Ultimate GTA VI Rickroll Engine
 * Orchestrates the cinematic loading screen, GTA "RICKROLLED" banner,
 * full YouTube video takeover, GTA in-game HUD overlay, and interactive controls!
 */

class RickrollManager {
  constructor() {
    this.screen = document.getElementById('rickroll-screen');
    this.loadingScreen = document.getElementById('gta-loading-screen');
    this.playerContainer = document.getElementById('rickroll-player-container');
    this.wastedBanner = document.getElementById('wasted-banner');
    this.lyricsSubtitle = document.getElementById('karaoke-subtitles');
    this.wantedStarsEl = document.getElementById('hud-wanted-stars');
    this.cashCounterEl = document.getElementById('hud-cash-counter');
    this.ytIframe = document.getElementById('yt-rickroll-frame');
    this.synthStage = document.getElementById('synth-rick-stage');

    this.isActive = false;
    this.wantedLevel = 5;
    this.cash = 1987000;
    this.isDiscoMode = false;
    this.useSynthFallback = false;
    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.confettiCtx = this.confettiCanvas ? this.confettiCanvas.getContext('2d') : null;
    this.confettiParticles = [];

    this.init();
  }

  init() {
    this.setupConfetti();
    this.bindControls();
  }

  setupConfetti() {
    if (!this.confettiCanvas) return;
    const resizeConfetti = () => {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    };
    resizeConfetti();
    window.addEventListener('resize', resizeConfetti);
  }

  bindControls() {
    const btnStars = document.getElementById('btn-add-stars');
    if (btnStars) {
      btnStars.addEventListener('click', () => this.addWantedStar());
    }

    const btnDisco = document.getElementById('btn-disco-mode');
    if (btnDisco) {
      btnDisco.addEventListener('click', () => this.toggleDiscoMode());
    }

    const btnTogglePlayer = document.getElementById('btn-toggle-player');
    if (btnTogglePlayer) {
      btnTogglePlayer.addEventListener('click', () => this.togglePlayerMode());
    }

    const btnExit = document.getElementById('btn-exit-rickroll');
    if (btnExit) {
      btnExit.addEventListener('click', () => this.stopRickroll());
    }

    // Keyboard 'Esc' or 'Backspace' exits Rickroll
    window.addEventListener('keydown', (e) => {
      if (this.isActive && (e.key === 'Escape' || e.key === 'Backspace')) {
        this.stopRickroll();
      }
    });
  }

  // Primary entry trigger: called when user clicks PLAY STORY
  launchRickroll() {
    if (this.isActive) return;
    this.isActive = true;

    // 1. Play dramatic GTA launch rumble
    if (window.soundEngine) {
      window.soundEngine.playLaunchStinger();
      window.soundEngine.stopAmbientMusic();
    }

    // 2. Show Rickroll Overlay
    this.screen.classList.add('active');
    this.screen.setAttribute('aria-hidden', 'false');

    // 3. Initiate GTA VI Loading Screen sequence
    this.startLoadingSequence(() => {
      // 4. Reveal the Rickroll drop!
      this.triggerTheDrop();
    });
  }

  startLoadingSequence(onComplete) {
    this.loadingScreen.classList.remove('hidden');
    this.playerContainer.classList.add('hidden');
    this.wastedBanner.classList.add('hidden');

    const progressBar = document.getElementById('loading-progress-bar');
    const loadingTip = document.getElementById('loading-tip-text');

    const tips = [
      "SYNCHRONIZING LEONIDA HIGHWAY PATROL DATABASE...",
      "TUNING VICE CITY STEREO TO 106.7 FLASH FM...",
      "TIP: NEVER TRUST A PARTNER WHO SAYS THEY'LL NEVER GIVE YOU UP.",
      "GENERATING 4K SUNSET REFLECTIONS ACROSS OCEAN DRIVE...",
      "SPAWNING TARGET: RICK ASTLEY (WANTED FOR EXCESSIVE GROOVE)...",
      "FINALIZING HEIST PAYOUT: $1,987,1987..."
    ];

    let tipIndex = 0;
    if (loadingTip) loadingTip.textContent = tips[0];

    const tipInterval = setInterval(() => {
      tipIndex = (tipIndex + 1) % tips.length;
      if (loadingTip) loadingTip.textContent = tips[tipIndex];
    }, 700);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 22 + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        clearInterval(tipInterval);

        if (progressBar) progressBar.style.width = '100%';

        setTimeout(() => {
          this.loadingScreen.classList.add('hidden');
          onComplete();
        }, 500);
      } else {
        if (progressBar) progressBar.style.width = `${progress}%`;
      }
    }, 250);
  }

  triggerTheDrop() {
    this.playerContainer.classList.remove('hidden');

    // Show Wasted / Rickrolled banner with camera shake
    this.wastedBanner.classList.remove('hidden');
    this.wastedBanner.classList.add('slam');

    // Camera rumble
    this.screen.classList.add('screen-shake');
    setTimeout(() => {
      this.screen.classList.remove('screen-shake');
    }, 900);

    // Audio & Video start:
    // 1. YouTube video autoplay (official Rick Astley)
    this.startYouTubeVideo();

    // 2. Guaranteed instant 80s synth engine audio start in background/fallback
    if (window.soundEngine) {
      window.soundEngine.playRickrollSynth((lyricText) => {
        this.updateLyrics(lyricText);
      });
    }

    // 3. Start HUD counters and police sirens
    this.startHudSimulation();

    // After 4 seconds, fade out the giant banner slightly so video is unobscured, but keep header active
    setTimeout(() => {
      this.wastedBanner.classList.add('banner-minimized');
    }, 3800);
  }

  startYouTubeVideo() {
    if (!this.ytIframe) return;

    // Load YouTube video with autoplay, mute:0, controls:1, loop:1
    const ytUrl = `https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&controls=1&loop=1&playlist=dQw4w9WgXcQ&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;

    this.ytIframe.src = ytUrl;
    this.ytIframe.style.display = 'block';
  }

  togglePlayerMode() {
    this.useSynthFallback = !this.useSynthFallback;
    const btn = document.getElementById('btn-toggle-player');

    if (this.useSynthFallback) {
      if (this.ytIframe) this.ytIframe.style.display = 'none';
      if (this.synthStage) this.synthStage.classList.remove('hidden');
      if (btn) btn.innerHTML = '<span>📹</span> 4K YouTube Mode';
    } else {
      if (this.ytIframe) this.ytIframe.style.display = 'block';
      if (this.synthStage) this.synthStage.classList.add('hidden');
      if (btn) btn.innerHTML = '<span>🎹</span> Retro Synth Mode';
    }

    if (window.soundEngine) window.soundEngine.playSelect();
  }

  updateLyrics(text) {
    if (!this.lyricsSubtitle) return;
    this.lyricsSubtitle.textContent = text;
    this.lyricsSubtitle.classList.remove('pulse');
    void this.lyricsSubtitle.offsetWidth; // trigger reflow
    this.lyricsSubtitle.classList.add('pulse');
  }

  startHudSimulation() {
    this.updateWantedStars();

    // Cash ticker
    this.cashInterval = setInterval(() => {
      if (!this.isActive) return;
      this.cash += Math.floor(Math.random() * 450 + 100);
      if (this.cashCounterEl) {
        this.cashCounterEl.textContent = `$${this.cash.toLocaleString()}`;
      }
    }, 180);

    // Initial police siren
    if (window.soundEngine) {
      window.soundEngine.playPoliceSiren(4.0);
    }
  }

  addWantedStar() {
    this.wantedLevel = (this.wantedLevel % 6) + 1;
    this.updateWantedStars();
    if (window.soundEngine) {
      window.soundEngine.playPoliceSiren(3.0);
      window.soundEngine.playSelect();
    }
  }

  updateWantedStars() {
    if (!this.wantedStarsEl) return;
    let starsHtml = '';
    for (let i = 1; i <= 6; i++) {
      if (i <= this.wantedLevel) {
        starsHtml += `<span class="star active flashing">★</span>`;
      } else {
        starsHtml += `<span class="star empty">☆</span>`;
      }
    }
    this.wantedStarsEl.innerHTML = starsHtml;
  }

  toggleDiscoMode() {
    this.isDiscoMode = !this.isDiscoMode;
    const btn = document.getElementById('btn-disco-mode');

    if (this.isDiscoMode) {
      this.screen.classList.add('disco-lasers');
      if (btn) btn.classList.add('active');
      this.startConfetti();
    } else {
      this.screen.classList.remove('disco-lasers');
      if (btn) btn.classList.remove('active');
      this.stopConfetti();
    }

    if (window.soundEngine) window.soundEngine.playSelect();
  }

  startConfetti() {
    if (!this.confettiCanvas) return;
    this.confettiParticles = [];
    for (let i = 0; i < 120; i++) {
      this.confettiParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        rotSpeed: Math.random() * 8 - 4,
        color: ['#ff007f', '#00f0ff', '#ffd166', '#7209b7', '#06d6a0'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 6
      });
    }

    const render = () => {
      if (!this.isDiscoMode || !this.isActive) return;
      const ctx = this.confettiCtx;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of this.confettiParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        if (p.y > window.innerHeight + 20) {
          p.y = -20;
          p.x = Math.random() * window.innerWidth;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      requestAnimationFrame(render);
    };

    render();
  }

  stopConfetti() {
    if (this.confettiCtx) {
      this.confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    this.confettiParticles = [];
  }

  stopRickroll() {
    this.isActive = false;
    this.screen.classList.remove('active');
    this.screen.setAttribute('aria-hidden', 'true');
    this.wastedBanner.classList.remove('slam', 'banner-minimized');
    this.wastedBanner.classList.add('hidden');
    this.stopConfetti();

    // Stop YouTube video
    if (this.ytIframe) {
      this.ytIframe.src = '';
    }

    // Stop Web Audio synth Rickroll
    if (window.soundEngine) {
      window.soundEngine.stopRickrollSynth();
      window.soundEngine.playBack();
      window.soundEngine.startAmbientMusic();
    }

    if (this.cashInterval) {
      clearInterval(this.cashInterval);
      this.cashInterval = null;
    }
  }
}

// Global instance
window.RickrollManager = RickrollManager;
