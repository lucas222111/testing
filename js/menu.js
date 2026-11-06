/**
 * GeminiTA6 - Menu Controller & User Interactions
 * Manages GTA VI play menu, modal dialogs, keyboard navigation,
 * character cards, and environment toggles.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize subsystems
  const highway = new HighwaySimulator('highway-canvas');
  window.highwaySim = highway;

  const rickroll = new RickrollManager();
  window.rickrollEngine = rickroll;

  // Menu items list
  const menuItems = Array.from(document.querySelectorAll('.gta-menu-item'));
  const descriptionTitle = document.getElementById('menu-desc-title');
  const descriptionText = document.getElementById('menu-desc-body');
  const descriptionBadge = document.getElementById('menu-desc-badge');

  let activeIndex = 0;

  // Descriptions database
  const itemDescriptions = {
    'play': {
      title: 'STORY MODE: THE VICE CITY HEIST',
      badge: 'RECOMMENDED',
      text: 'Embark on an adrenaline-fueled saga through the sun-bleached neon streets of Vice City and the sprawling swamp swamplands of Leonida. Follow Lucia and Jason as high-stakes crime, trust, and music collide.'
    },
    'online': {
      title: 'GEMINI ONLINE (MULTIPLAYER)',
      badge: 'LIVE SERVERS',
      text: 'Create your criminal kingpin. Purchase oceanfront penthouses, race exotic supercars down Ocean Drive, and assemble your crew for elaborate multi-stage heists across Leonida.'
    },
    'radio': {
      title: 'LEONIDA STEREO & RADIO STATIONS',
      badge: 'AUDIO',
      text: 'Tune into Vice City’s premier FM dial featuring Flash FM, Wave 103, Fever 105, and Wildstyle Pirate Radio. Authentic 80s synth, funk, and modern trap.'
    },
    'settings': {
      title: 'GRAPHICS & SYSTEM CONFIGURATION',
      badge: 'OPTIONS',
      text: 'Adjust ray-traced neon reflections, traffic density, time of day, chromatic aberration, retro scanlines, and audio output mix.'
    },
    'credits': {
      title: 'SPECIAL THANKS & CREDITS',
      badge: 'DEVELOPERS',
      text: 'GeminiTA6 is an interactive parody homage created by Gemini x Google DeepMind, inspired by Rockstar Games’ Grand Theft Auto VI and Rick Astley.'
    }
  };

  // Update active menu selection
  function setActiveItem(index, playAudio = true) {
    if (index < 0) index = menuItems.length - 1;
    if (index >= menuItems.length) index = 0;

    menuItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
        item.setAttribute('aria-selected', 'true');
        item.focus();
      } else {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      }
    });

    activeIndex = index;

    const action = menuItems[index].getAttribute('data-action');
    const desc = itemDescriptions[action];
    if (desc) {
      if (descriptionTitle) descriptionTitle.textContent = desc.title;
      if (descriptionText) descriptionText.textContent = desc.text;
      if (descriptionBadge) descriptionBadge.textContent = desc.badge;
    }

    if (playAudio && window.soundEngine) {
      window.soundEngine.playHover();
    }
  }

  // Handle click or enter on item
  function triggerAction(action) {
    if (window.soundEngine) {
      window.soundEngine.playSelect();
    }

    switch (action) {
      case 'play':
        // THE MAIN EVENT: Launches the Rickroll!
        rickroll.launchRickroll();
        break;
      case 'online':
        openDialog('online-dialog');
        break;
      case 'radio':
        openDialog('radio-dialog');
        break;
      case 'settings':
        openDialog('settings-dialog');
        break;
      case 'credits':
        openDialog('credits-dialog');
        break;
    }
  }

  // Bind mouse hover and click events
  menuItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      setActiveItem(index, true);
    });

    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      triggerAction(action);
    });
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (rickroll.isActive) return;

    // Don't intercept if inside an open dialog input
    const anyModalOpen = document.querySelector('dialog[open]');
    if (anyModalOpen && e.key !== 'Escape') return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        setActiveItem(activeIndex - 1, true);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        setActiveItem(activeIndex + 1, true);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const action = menuItems[activeIndex].getAttribute('data-action');
        triggerAction(action);
        break;
      case 'c':
      case 'C':
        // Cycle time of day
        cycleTimeOfDay();
        break;
      case 't':
      case 'T':
        // Boost traffic
        triggerTrafficRush();
        break;
      case 'm':
      case 'M':
        // Toggle sound mute
        toggleSoundMute();
        break;
    }
  });

  // Quick action buttons in header/footer
  const timeBtn = document.getElementById('btn-time-cycle');
  if (timeBtn) {
    timeBtn.addEventListener('click', () => cycleTimeOfDay());
  }

  const trafficBtn = document.getElementById('btn-traffic-boost');
  if (trafficBtn) {
    trafficBtn.addEventListener('click', () => triggerTrafficRush());
  }

  const muteBtn = document.getElementById('btn-toggle-mute');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => toggleSoundMute());
  }

  const playHeroBtn = document.getElementById('hero-play-trigger');
  if (playHeroBtn) {
    playHeroBtn.addEventListener('click', () => {
      rickroll.launchRickroll();
    });
  }

  // Character preview switcher (Lucia <-> Jason)
  const charButtons = document.querySelectorAll('.char-switch-btn');
  const charCards = document.querySelectorAll('.char-card');

  charButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetChar = btn.getAttribute('data-char');
      charButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      charCards.forEach(card => {
        if (card.getAttribute('data-char') === targetChar) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });

      if (window.soundEngine) window.soundEngine.playSelect();
    });
  });

  // Cycle time of day helper
  const times = ['sunset', 'midnight', 'golden'];
  let timeIdx = 0;
  function cycleTimeOfDay() {
    timeIdx = (timeIdx + 1) % times.length;
    const newTime = times[timeIdx];
    highway.setTimeOfDay(newTime);

    const badge = document.getElementById('time-indicator-badge');
    if (badge) {
      const labels = {
        sunset: 'SUNSET DUSK • 78°F',
        midnight: 'MIDNIGHT NEON • 72°F',
        golden: 'GOLDEN DAWN • 82°F'
      };
      badge.textContent = labels[newTime] || newTime.toUpperCase();
    }

    if (window.soundEngine) window.soundEngine.playSelect();
  }

  function triggerTrafficRush() {
    highway.spawnStuntCar(window.innerWidth / 2);
    highway.setTrafficDensity('rush');
    setTimeout(() => {
      highway.setTrafficDensity('normal');
    }, 8000);
  }

  function toggleSoundMute() {
    if (!window.soundEngine) return;
    const muted = window.soundEngine.toggleMute();
    if (muteBtn) {
      muteBtn.innerHTML = muted ? '<span>🔇</span> Unmute Audio' : '<span>🔊</span> Ambient Audio: ON';
    }
  }

  // Start background ambient music on first user interaction
  document.body.addEventListener('click', () => {
    if (window.soundEngine && !window.soundEngine.isAmbientPlaying && !rickroll.isActive) {
      window.soundEngine.startAmbientMusic();
    }
  }, { once: true });

  // Native Dialog Controls with modern-web-guidance
  function openDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    // Bind close buttons inside dialog
    const closeBtns = dialog.querySelectorAll('.dialog-close-btn, [data-close-dialog]');
    closeBtns.forEach(btn => {
      btn.onclick = () => closeDialog(dialog);
    });
  }

  function closeDialog(dialog) {
    if (window.soundEngine) window.soundEngine.playBack();
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  // Light dismiss fallback for dialogs with closedby="any"
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) closeDialog(dialog);
      });
    }
  }

  // Settings Dialog Form Controls
  const timeSelect = document.getElementById('setting-time-of-day');
  if (timeSelect) {
    timeSelect.addEventListener('change', (e) => {
      highway.setTimeOfDay(e.target.value);
    });
  }

  const densitySelect = document.getElementById('setting-traffic-density');
  if (densitySelect) {
    densitySelect.addEventListener('change', (e) => {
      highway.setTrafficDensity(e.target.value);
    });
  }

  const crtToggle = document.getElementById('setting-crt-effect');
  if (crtToggle) {
    crtToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('crt-scanlines');
      } else {
        document.body.classList.remove('crt-scanlines');
      }
    });
  }

  // Live Clock updater in header
  function updateClock() {
    const clockEl = document.getElementById('live-vice-clock');
    if (!clockEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    clockEl.textContent = `${hours}:${minutes} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Set default initial active item
  setActiveItem(0, false);
});
