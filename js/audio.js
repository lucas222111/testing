/**
 * GeminiTA6 - Web Audio API Sound Engine
 * Provides authentic GTA VI UI sound effects and built-in 80s synth Rickroll fallback!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
    this.rickrollPlaying = false;
    this.rickrollSequenceTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // GTA VI UI Navigation Click (subtle, crisp digital blip)
  playHover() {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // GTA VI UI Confirm / Select (Deep sub-bass impact with metallic resonance)
  playSelect() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;

      // Sub drop
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.36);

      // Metallic high hit
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(620, now);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.12);

      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.13);
    } catch (e) {
      console.warn('Audio select error:', e);
    }
  }

  // GTA VI Back / Cancel sound
  playBack() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio back error:', e);
    }
  }

  // Dramatic cinematic rumble when starting the game
  playLaunchStinger() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;

      // Heavy sub rumble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 1.2);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch (e) {
      console.warn(e);
    }
  }

  // Car engine roar when passing or boosting
  playCarRoar(isSport = true) {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      const baseFreq = isSport ? 140 : 85;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 2.2, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(2400, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.8);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch (e) {
      console.warn(e);
    }
  }

  // Police Siren toggle / pulse
  playPoliceSiren(durationSec = 2.5) {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      lfo.frequency.value = 2.5; // wail cycles per sec
      lfoGain.gain.value = 250;  // swing between 650Hz and 1150Hz
      osc.frequency.value = 900;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2200;

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      lfo.start(now);
      osc.start(now);

      lfo.stop(now + durationSec);
      osc.stop(now + durationSec);
    } catch (e) {
      console.warn(e);
    }
  }

  // Synthwave Ambient Background Music (Vice City Night Breeze)
  startAmbientMusic() {
    if (this.isAmbientPlaying || this.isMuted) return;
    this.init();
    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Lush synth pad chords
      const chords = [
        [130.81, 164.81, 196.00], // C major
        [110.00, 130.81, 164.81], // A minor
        [146.83, 174.61, 220.00], // D minor
        [98.00,  123.47, 146.83]  // G major
      ];

      let chordIndex = 0;
      this.ambientInterval = setInterval(() => {
        if (!this.isAmbientPlaying || this.isMuted || this.rickrollPlaying) return;
        const currentChord = chords[chordIndex % chords.length];
        chordIndex++;

        currentChord.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq * 1.5;

          const now = this.ctx.currentTime;
          chordGain.gain.setValueAtTime(0.001, now);
          chordGain.gain.linearRampToValueAtTime(0.04, now + 1.2);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

          osc.connect(chordGain);
          chordGain.connect(this.ambientGain);

          osc.start(now);
          osc.stop(now + 4.0);
        });
      }, 4000);

      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn(e);
    }
  }

  stopAmbientMusic() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    this.isAmbientPlaying = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbientMusic();
      this.stopRickrollSynth();
    } else {
      this.startAmbientMusic();
    }
    return this.isMuted;
  }

  // ----------------------------------------------------
  // FULL 80s SYNTH RICKROLL BACKUP ENGINE!
  // Guaranteed instantaneous "Never Gonna Give You Up"
  // ----------------------------------------------------
  playRickrollSynth(onNoteTrigger = null) {
    this.stopAmbientMusic();
    this.init();
    this.rickrollPlaying = true;

    // Tempo: ~114 BPM
    const bpm = 113.5;
    const beat = 60 / bpm;
    const sixteenth = beat / 4;

    // Note frequency map
    const N = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
      REST: 0
    };

    // The iconic drum intro + melody sequence
    // Note format: [note, durationInSixteenths, lyricWord]
    const sequence = [
      // Iconic drum rolls & intro pick-up
      [N.C4, 2, "DUH"], [N.D4, 2, "DUH"], [N.F4, 2, "DUH"], [N.D4, 2, "DUH"],
      [N.A4, 4, "♪"], [N.A4, 4, "♪"], [N.G4, 8, "♪"],
      [N.C4, 2, ""], [N.D4, 2, ""], [N.F4, 2, ""], [N.D4, 2, ""],
      [N.G4, 4, "♪"], [N.G4, 4, "♪"], [N.F4, 6, "♪"], [N.E4, 2, ""], [N.D4, 4, ""],

      // Verse 1: "We're no strangers to love..."
      [N.F3, 3, "We're"], [N.G3, 3, "no"], [N.Bb3, 3, "stran-"], [N.G3, 3, "gers"],
      [N.D4, 4, "to"], [N.D4, 4, "love..."],
      [N.C4, 6, ""], [N.REST, 2, ""],

      // "You know the rules and so do I..."
      [N.F3, 3, "You"], [N.G3, 3, "know"], [N.Bb3, 3, "the"], [N.G3, 3, "rules"],
      [N.C4, 4, "and"], [N.C4, 4, "so"], [N.Bb3, 3, "do"], [N.A3, 3, "I..."],
      [N.REST, 4, ""],

      // "A full commitment's what I'm thinking of..."
      [N.F3, 3, "A"], [N.G3, 3, "full"], [N.Bb3, 3, "com-"], [N.G3, 3, "mit-"], [N.Bb3, 3, "ment's"],
      [N.C4, 3, "what"], [N.A3, 3, "I'm"], [N.G3, 3, "think-"], [N.F3, 3, "ing"], [N.F3, 4, "of..."],
      [N.REST, 4, ""],

      // "You wouldn't get this from any other guy..."
      [N.F3, 3, "You"], [N.G3, 3, "would-"], [N.Bb3, 3, "n't"], [N.G3, 3, "get"], [N.Bb3, 3, "this"],
      [N.D4, 4, "from"], [N.C4, 3, "an-"], [N.Bb3, 3, "y"], [N.C4, 4, "oth-"], [N.A3, 4, "er"], [N.G3, 6, "guy..."],
      [N.REST, 4, ""],

      // Pre-Chorus build-up: "I just wanna tell you how I'm feeling..."
      [N.D4, 3, "I"], [N.D4, 3, "just"], [N.D4, 3, "wan-"], [N.D4, 3, "na"], [N.E4, 3, "tell"], [N.F4, 4, "you"],
      [N.D4, 3, "how"], [N.C4, 3, "I'm"], [N.C4, 6, "feel-"], [N.Bb3, 4, "ing..."],
      [N.REST, 2, ""],
      // "Gotta make you understand..."
      [N.D4, 3, "Got-"], [N.D4, 3, "ta"], [N.E4, 3, "make"], [N.F4, 4, "you"],
      [N.C4, 4, "un-"], [N.D4, 3, "der-"], [N.C4, 3, "stand..."],
      [N.REST, 4, "🔥"],

      // CHORUS: "NEVER GONNA GIVE YOU UP!"
      [N.F4, 3, "NEV-"], [N.G4, 3, "ER"], [N.Bb4, 3, "GON-"], [N.G4, 3, "NA"],
      [N.D5, 6, "GIVE"], [N.D5, 6, "YOU"], [N.C5, 8, "UP!"],
      [N.REST, 2, ""],

      // "NEVER GONNA LET YOU DOWN!"
      [N.F4, 3, "NEV-"], [N.G4, 3, "ER"], [N.Bb4, 3, "GON-"], [N.G4, 3, "NA"],
      [N.C5, 6, "LET"], [N.C5, 6, "YOU"], [N.Bb4, 6, "DOWN!"], [N.A4, 3, ""], [N.G4, 3, ""],
      [N.REST, 2, ""],

      // "NEVER GONNA RUN AROUND AND DESERT YOU!"
      [N.F4, 3, "NEV-"], [N.G4, 3, "ER"], [N.Bb4, 3, "GON-"], [N.G4, 3, "NA"],
      [N.Bb4, 4, "RUN"], [N.C5, 4, "A-"], [N.A4, 4, "ROUND"],
      [N.F4, 3, "AND"], [N.G4, 4, "DE-"], [N.F4, 6, "SERT"], [N.D4, 4, "YOU!"],
      [N.REST, 4, ""],

      // "NEVER GONNA MAKE YOU CRY!"
      [N.F4, 3, "NEV-"], [N.G4, 3, "ER"], [N.Bb4, 3, "GON-"], [N.G4, 3, "NA"],
      [N.D5, 6, "MAKE"], [N.D5, 6, "YOU"], [N.C5, 8, "CRY!"],
      [N.REST, 2, ""],

      // "NEVER GONNA SAY GOODBYE!"
      [N.F4, 3, "NEV-"], [N.G4, 3, "ER"], [N.Bb4, 3, "GON-"], [N.G4, 3, "NA"],
      [N.F5, 6, "SAY"], [N.A4, 4, "GOOD-"], [N.Bb4, 8, "BYE!"],
      [N.REST, 2, ""],

      // "NEVER GONNA TELL A LIE AND HURT YOU!"
      [N.F4, 3, "NEV-"], [N.G4, 3, "ER"], [N.Bb4, 3, "GON-"], [N.G4, 3, "NA"],
      [N.Bb4, 4, "TELL"], [N.C5, 4, "A"], [N.A4, 4, "LIE,"],
      [N.F4, 3, "AND"], [N.G4, 4, "HURT"], [N.F4, 8, "YOU! ❤️"]
    ];

    let currentStep = 0;
    const playNext = () => {
      if (!this.rickrollPlaying || this.isMuted) return;

      const item = sequence[currentStep % sequence.length];
      const noteFreq = item[0];
      const durationSixteenths = item[1];
      const lyric = item[2];
      const durationSec = durationSixteenths * sixteenth;

      if (onNoteTrigger && lyric) {
        onNoteTrigger(lyric, currentStep);
      }

      if (noteFreq > 0) {
        // Lead Synth (80s saw / square with filter)
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(noteFreq, now);

        subOsc.type = 'square';
        subOsc.frequency.setValueAtTime(noteFreq / 2, now); // 1 octave lower body

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, now);
        filter.Q.value = 3.0;

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.08, durationSec * 0.92));

        osc.connect(filter);
        subOsc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + durationSec);
        subOsc.stop(now + durationSec);

        // Synth Bass accompany
        this.triggerSynthBass(noteFreq, now, durationSec);
        // Synth Drum beat
        if (currentStep % 2 === 0) {
          this.triggerKick(now);
        } else {
          this.triggerSnare(now);
        }
      }

      currentStep++;
      this.rickrollSequenceTimer = setTimeout(playNext, durationSec * 1000);
    };

    playNext();
  }

  triggerSynthBass(rootFreq, now, duration) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(rootFreq > 200 ? rootFreq / 4 : rootFreq / 2, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + Math.min(0.25, duration));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch(e){}
  }

  triggerKick(now) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch(e){}
  }

  triggerSnare(now) {
    try {
      // Noise burst for snare
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch(e){}
  }

  stopRickrollSynth() {
    this.rickrollPlaying = false;
    if (this.rickrollSequenceTimer) {
      clearTimeout(this.rickrollSequenceTimer);
      this.rickrollSequenceTimer = null;
    }
  }
}

// Global instance
window.soundEngine = new SoundEngine();
